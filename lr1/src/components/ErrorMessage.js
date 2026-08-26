import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onClose, onRetry }) => {
  return (
    <div className="error-container">
      <h3 className="error-title">Ошибка</h3>
      <p className="error-message">{message}</p>
      <div className="error-actions">
        {onRetry && (
          <button onClick={onRetry} className="btn btn-retry">
            Повторить
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="btn btn-close-error">
            Закрыть
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
