import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useIncidentStore } from '../store/incidentStore';
import { Loader } from '../components/Loader';

const statusMap = {
  open: { label: 'Открыт', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  processing: { label: 'В обработке', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  closed: { label: 'Закрыт', color: 'bg-slate-100 text-slate-800 border-slate-200' }
};

const severityMap = {
  low: { label: 'Низкий', color: 'bg-emerald-100 text-emerald-800' },
  medium: { label: 'Средний', color: 'bg-amber-100 text-amber-800' },
  high: { label: 'Высокий', color: 'bg-rose-100 text-rose-800' }
};

export const HomePage = () => {
  const { incidents, loading, error, fetchIncidents, deleteIncident, selectedIncidentId, setSelectedIncidentId } = useIncidentStore();

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Вы уверены, что хотите удалить этот инцидент?')) {
      deleteIncident(id);
      if (selectedIncidentId === id) setSelectedIncidentId(null);
    }
  };

  if (loading && incidents.length === 0) return <Loader />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Мониторинг инцидентов</h1>
          <p className="text-slate-500 mt-1 font-medium">Выберите инцидент из списка для управления или создайте новый.</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-r-lg shadow-sm font-medium">
          <div className="flex">
            <svg className="h-5 w-5 text-rose-400 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {error}
          </div>
        </div>
      )}
      
      {/* Cards Grid replacing the generic table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidents.length === 0 && !loading && !error ? (
          <div className="col-span-full bg-slate-50 border border-dashed border-slate-300 p-12 text-center rounded-2xl">
            <p className="text-slate-500 font-medium">Инциденты не найдены. Все спокойно.</p>
          </div>
        ) : (
          incidents.map((inc) => (
            <div 
              key={inc.id} 
              onClick={() => setSelectedIncidentId(inc.id)}
              className={`rounded-2xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer
                ${selectedIncidentId === inc.id 
                  ? 'ring-4 ring-indigo-500 shadow-xl bg-indigo-50/30 -translate-y-1' 
                  : 'bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300'}
              `}
            >
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider ${severityMap[inc.severity]?.color}`}>
                    {severityMap[inc.severity]?.label}
                  </span>
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${statusMap[inc.status]?.color}`}>
                    {statusMap[inc.status]?.label}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mb-3 line-clamp-2 leading-snug" title={inc.title}>
                  {inc.title}
                </h3>
                
                <div className="space-y-2 mt-auto">
                  <div className="flex items-start text-slate-600 text-sm font-medium">
                    <svg className="w-4 h-4 mr-2.5 mt-0.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span className="line-clamp-1">{inc.location}</span>
                  </div>
                  <div className="flex items-center text-slate-500 text-xs font-medium">
                    <svg className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {new Date(inc.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};