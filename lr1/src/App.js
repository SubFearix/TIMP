import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { IncidentsProvider } from './context/IncidentsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Edit from './pages/Edit';
import Delete from './pages/Delete';
import Form from './pages/Form';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function AppShell() {
  const { isAuthenticated, currentUser, logout } = useAuth();

  return (
    <div className="App">
      <header className="App-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"></span>
          <div className="brand-text">
            <h1>Реестр происшествий</h1>
            <p>Безопасность образовательного учреждения</p>
          </div>
        </div>

        {isAuthenticated ? (
          <nav className="App-nav">
            <Link to="/">Главная</Link>
            <Link to="/detail">Реестр</Link>
            <Link to="/add">Зарегистрировать</Link>
            <Link to="/edit">Редактировать</Link>
            <Link to="/delete">Удалить</Link>
            <span className="App-nav-spacer" />
            <span className="App-nav-user">{currentUser?.username}</span>
            <button type="button" onClick={logout} className="App-nav-logout">
              Выйти
            </button>
          </nav>
        ) : (
          <nav className="App-nav">
            <Link to="/login">Войти</Link>
            <Link to="/register">Регистрация</Link>
          </nav>
        )}
      </header>

      <main className="App-main">
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
          />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/detail" element={<ProtectedRoute><Detail /></ProtectedRoute>} />
          <Route path="/detail/:id" element={<ProtectedRoute><Detail /></ProtectedRoute>} />
          <Route path="/edit" element={<ProtectedRoute><Edit /></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><Edit /></ProtectedRoute>} />
          <Route path="/delete" element={<ProtectedRoute><Delete /></ProtectedRoute>} />
          <Route path="/delete/:id" element={<ProtectedRoute><Delete /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><Form /></ProtectedRoute>} />
        </Routes>
      </main>

      <footer className="App-footer">
        Реестр происшествий — образовательное учреждение, 2026
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <IncidentsProvider>
        <Router>
          <AppShell />
        </Router>
      </IncidentsProvider>
    </AuthProvider>
  );
}

export default App;
