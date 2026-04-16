import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useIncidentStore } from '../store/incidentStore';

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { deleteIncident, selectedIncidentId, setSelectedIncidentId } = useIncidentStore();

  // URL ID takes precedence if present, else fallback to global selected active incident
  const pathParts = location.pathname.split('/');
  const urlIncidentId = (pathParts[1] === 'incident' || pathParts[1] === 'edit') ? pathParts[2] : null;
  const activeIncidentId = urlIncidentId || selectedIncidentId;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDelete = async () => {
    if (activeIncidentId && window.confirm('ОПАСНО: Вы уверены, что хотите удалить этот инцидент безвозвратно?')) {
      await deleteIncident(activeIncidentId);
      setSelectedIncidentId(null);
      if (location.pathname !== '/') navigate('/');
    }
  };

  const requireSelection = (e) => {
    if (!activeIncidentId) {
      e.preventDefault();
      alert('Пожалуйста, сначала выберите инцидент на главной странице кликнув на него.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-indigo-950 text-white shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6 md:gap-10">
              <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <span className="text-xl font-extrabold tracking-tight hidden lg:block">PechenkinVA</span>
              </Link>
              
              <nav className="hidden md:flex space-x-1 overflow-x-auto">
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap
                    ${location.pathname === '/' ? 'bg-indigo-800/80 text-white shadow-inner' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                  Все инциденты
                </Link>
                <Link 
                  to="/create" 
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap
                    ${location.pathname.startsWith('/create') ? 'bg-indigo-800/80 text-white shadow-inner' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Добавить
                </Link>

                {/* Show Details, Edit, Delete only if an incident is selected */}
                <>
                  <div className="w-px h-6 bg-indigo-800 my-auto mx-2"></div>
                  <Link 
                    to={activeIncidentId ? `/incident/${activeIncidentId}` : '#'} 
                    onClick={!activeIncidentId ? requireSelection : undefined}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap
                      ${location.pathname.startsWith('/incident') ? 'bg-indigo-800/80 text-white shadow-inner' : (activeIncidentId ? 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white' : 'text-indigo-400/50 cursor-not-allowed')}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Детализация
                  </Link>
                  <Link 
                    to={activeIncidentId ? `/edit/${activeIncidentId}` : '#'} 
                    onClick={!activeIncidentId ? requireSelection : undefined}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap
                      ${location.pathname.startsWith('/edit') ? 'bg-indigo-800/80 text-white shadow-inner' : (activeIncidentId ? 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white' : 'text-indigo-400/50 cursor-not-allowed')}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    Редактировать
                  </Link>
                  <button 
                    onClick={activeIncidentId ? handleDelete : requireSelection}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap
                      ${activeIncidentId ? 'text-rose-300 hover:bg-rose-900/50 hover:text-rose-100' : 'text-rose-900/40 cursor-not-allowed'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Удалить
                  </button>
                </>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold leading-none">{user?.name || 'Пользователь'}</span>
                <span className="text-xs text-indigo-300">{user?.role || 'Гость'}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md border-2 border-indigo-800 flex items-center justify-center font-bold text-lg">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <button onClick={handleLogout} className="text-indigo-300 hover:text-white p-2 rounded-lg hover:bg-indigo-800/50 transition-colors" title="Выйти">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};