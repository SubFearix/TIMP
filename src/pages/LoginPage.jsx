import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Неверное имя пользователя или пароль. (Попробуйте admin / admin)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Вход в систему PechenkinVA</h1>
        <p className="text-slate-500 mt-2 font-medium">Безопасность учебного заведения</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-indigo-100/40 border border-slate-200 p-8 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-sm font-semibold border border-rose-100 flex items-start">
              <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Логин</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите 'admin'"
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Пароль</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите 'admin'"
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-lg mt-4"
          >
            Войти
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </form>
      </div>
    </div>
  );
};