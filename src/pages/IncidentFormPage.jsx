import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useIncidentStore } from '../store/incidentStore';
import { Loader } from '../components/Loader';

export const IncidentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const { currentIncident, loading, error, fetchIncidentById, createIncident, updateIncident, clearError } = useIncidentStore();

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    severity: '',
    status: 'open',
    description: ''
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    clearError();
    if (isEditMode) {
      fetchIncidentById(id);
    }
  }, [id, isEditMode, fetchIncidentById, clearError]);

  useEffect(() => {
    if (isEditMode && currentIncident) {
      setFormData(currentIncident);
    }
  }, [currentIncident, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.severity) {
      setValidationError('Пожалуйста, заполните все обязательные поля (Заголовок, Локация, Уровень).');
      return;
    }

    const success = isEditMode 
      ? await updateIncident(id, formData)
      : await createIncident(formData);
      
    if (success) {
      navigate(isEditMode ? `/incident/${id}` : '/');
    }
  };

  if (loading && isEditMode && !currentIncident) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto relative px-4 sm:px-0">
      {/* Explicit Top Navigation & Actions context */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isEditMode ? 'Редактировать инцидент' : 'Регистрация нового инцидента'}
          </h1>
          <p className="text-slate-500 font-medium mt-1">Обязательно заполните поля со звездочкой (*)</p>
        </div>
      </div>

      <div className="bg-white shadow-xl shadow-indigo-100 border border-slate-200 rounded-3xl overflow-hidden relative">
        {(error || validationError) && (
          <div className="bg-rose-50 border-b border-rose-200 text-rose-700 p-4 px-8 font-medium flex items-center">
            <svg className="h-5 w-5 mr-3 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {error || validationError}
          </div>
        )}

        {loading && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10"><Loader /></div>}

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          {/* Group 1: Basic Info */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-black uppercase text-indigo-500 tracking-wider mb-4 border-b border-slate-200 pb-2">Основная информация</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Краткий заголовок *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="Например: Сработала пожарная сигнализация"
                  className="w-full border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Местоположение происшествия *</label>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  placeholder="Например: Главный корпус, 3 этаж, правое крыло"
                  className="w-full border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800" 
                />
              </div>
            </div>
          </div>

          {/* Group 2: Status & Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Уровень угрозы *</label>
              <div className="relative">
                <select 
                  name="severity" 
                  value={formData.severity} 
                  onChange={handleChange} 
                  className="w-full appearance-none border-2 border-slate-200 rounded-xl p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-800 bg-white"
                >
                  <option value="" disabled>--- Выберите уровень ---</option>
                  <option value="low">🟡 Низкий (Штатная ситуация)</option>
                  <option value="medium">🟠 Средний (Требует внимания)</option>
                  <option value="high">🔴 Высокий (Экстренная ситуация)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {isEditMode && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Текущий статус</label>
                <div className="relative">
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    className="w-full appearance-none border-2 border-slate-200 rounded-xl p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-800 bg-white"
                  >
                    <option value="open">🔵 Открыт (Ожидает обработки)</option>
                    <option value="processing">🟣 В обработке (Решается)</option>
                    <option value="closed">🟢 Закрыт (Решен)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Group 3: Description */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2">Подробное описание деталей</label>
            <textarea 
              name="description" 
              rows="5" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Опишите все известные подробности инцидента, участников, принятые меры..."
              className="w-full border-2 border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 resize-y"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => navigate(isEditMode ? `/incident/${id}` : '/')} 
              className="bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold transition-colors w-full sm:w-auto"
            >
              Отмена
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              {isEditMode ? 'Сохранить изменения' : 'Зарегистрировать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};