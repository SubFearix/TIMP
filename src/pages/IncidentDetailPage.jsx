import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useIncidentStore } from '../store/incidentStore';
import { Loader } from '../components/Loader';

const statusMap = {
  open: { label: 'Открыт', color: 'bg-blue-100 text-blue-800 border border-blue-200' },
  processing: { label: 'В обработке', color: 'bg-orange-100 text-orange-800 border border-orange-200' },
  closed: { label: 'Закрыт', color: 'bg-slate-100 text-slate-800 border border-slate-200' }
};

const severityMap = {
  low: { label: 'Низкий', color: 'bg-emerald-100 text-emerald-800' },
  medium: { label: 'Средний', color: 'bg-amber-100 text-amber-800' },
  high: { label: 'Высокий', color: 'bg-rose-100 text-rose-800' }
};

export const IncidentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentIncident, loading, error, fetchIncidentById, deleteIncident } = useIncidentStore();

  useEffect(() => {
    fetchIncidentById(id);
  }, [id, fetchIncidentById]);

  const handleDelete = async () => {
    if (window.confirm('ОПАСНО: Вы уверены, что хотите удалить этот инцидент безвозвратно?')) {
      await deleteIncident(id);
      navigate('/');
    }
  };

  if (loading) return <Loader />;
  
  if (error) return (
    <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-r-lg shadow-sm font-medium max-w-4xl mx-auto mt-4">
      {error}
    </div>
  );
  
  if (!currentIncident) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Main Beautiful Details Card */}
      <div className="bg-white shadow-xl shadow-indigo-100/20 border border-slate-200 rounded-3xl overflow-hidden mt-4">
         <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-6 md:p-10 relative">
            <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: currentIncident.severity === 'high' ? '#e11d48' : currentIncident.severity === 'medium' ? '#d97706' : '#059669' }}></div>
            <div className="flex flex-wrap gap-3 mb-5 pl-2">
              <span className={`px-4 py-1.5 text-xs font-black rounded-lg uppercase tracking-widest ${severityMap[currentIncident.severity]?.color}`}>
                Угроза: {severityMap[currentIncident.severity]?.label}
              </span>
              <span className={`px-4 py-1.5 text-xs font-black rounded-lg uppercase tracking-widest ${statusMap[currentIncident.status]?.color}`}>
                Статус: {statusMap[currentIncident.status]?.label}
              </span>
              <span className="px-4 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm">
                ID: #{currentIncident.id}
              </span>
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight pl-2 leading-tight">
              {currentIncident.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-6 text-slate-600 pl-2">
               <div className="flex items-center bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                 <div className="bg-slate-100 p-2 rounded-lg mr-3">
                   <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                 </div>
                 <div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Локация</div>
                   <div className="font-semibold text-slate-800">{currentIncident.location}</div>
                 </div>
               </div>
               
               <div className="flex items-center bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                 <div className="bg-slate-100 p-2 rounded-lg mr-3">
                   <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Время И Сообщения</div>
                   <div className="font-semibold text-slate-800">{new Date(currentIncident.timestamp).toLocaleString()}</div>
                 </div>
               </div>
            </div>
         </div>

         <div className="p-6 md:p-10">
            <h3 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              Подробное описание
            </h3>
            <div className="bg-slate-50/50 border border-slate-200 p-6 rounded-2xl text-slate-700 leading-relaxed whitespace-pre-wrap font-medium shadow-inner min-h-[150px]">
              {currentIncident.description || <span className="text-slate-400 italic font-normal">Описание не предоставлено...</span>}
            </div>
         </div>
      </div>
    </div>
  );
};