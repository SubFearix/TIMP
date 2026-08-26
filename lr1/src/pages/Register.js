import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PASSWORD_RULES, validatePassword, validateUsername } from '../utils/authHelpers';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));

  const validate = () => {
    const errors = {};

    const usernameError = validateUsername(username);
    if (usernameError) errors.username = usernameError;

    const { valid } = validatePassword(password);
    if (!valid) errors.password = 'Пароль не соответствует требованиям ниже';

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await register(username.trim(), password);
      navigate('/');
    } catch (err) {
    }
  };

  return (
    <div className="form-container">
      <h2>Регистрация</h2>
      <p className="page-description">
        Создайте учётную запись, чтобы вести реестр происшествий.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="incident-form" noValidate>
        <div className={`form-group ${validationErrors.username ? 'has-error' : ''}`}>
          <label>Логин <span className="required">*</span></label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Только латинские буквы, цифры, «_»"
            autoComplete="username"
            className={validationErrors.username ? 'input-error' : ''}
          />
          {validationErrors.username && (
            <span className="validation-error">{validationErrors.username}</span>
          )}
        </div>

        <div className={`form-group ${validationErrors.password ? 'has-error' : ''}`}>
          <label>Пароль <span className="required">*</span></label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className={validationErrors.password ? 'input-error' : ''}
          />
          <ul className="password-rules">
            {passwordChecks.map((rule) => (
              <li key={rule.id} className={rule.passed ? 'rule-ok' : 'rule-pending'}>
                {rule.label}
              </li>
            ))}
          </ul>
          {validationErrors.password && (
            <span className="validation-error">{validationErrors.password}</span>
          )}
        </div>

        <div className={`form-group ${validationErrors.confirmPassword ? 'has-error' : ''}`}>
          <label>Повторите пароль <span className="required">*</span></label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className={validationErrors.confirmPassword ? 'input-error' : ''}
          />
          {validationErrors.confirmPassword && (
            <span className="validation-error">{validationErrors.confirmPassword}</span>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-save" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </div>
      </form>

      <p className="auth-switch">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
};

export default Register;
