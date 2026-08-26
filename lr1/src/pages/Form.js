import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIncidents } from '../context/IncidentsContext';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { severityOptions, typeOptions } from '../utils/incidentHelpers';

const initialFormState = {
  name: '',
  type: 'иное',
  description: '',
  location: '',
  severity: 'средний',
  date: '',
  reporter: '',
  measures: ''
};

const Form = () => {
  const navigate = useNavigate();
  const { addIncident, loading, error, clearError } = useIncidents();
  const [formData, setFormData] = useState(initialFormState);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Название инцидента обязательно';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Название должно содержать минимум 3 символа';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Название не должно превышать 100 символов';
    }

    if (!formData.description.trim()) {
      errors.description = 'Описание инцидента обязательно';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Описание должно содержать минимум 10 символов';
    }

    if (!formData.location.trim()) {
      errors.location = 'Место происшествия обязательно';
    } else if (formData.location.trim().length < 3) {
      errors.location = 'Укажите более точное местоположение';
    }

    if (!formData.date) {
      errors.date = 'Дата инцидента обязательна';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        errors.date = 'Дата не может быть в будущем';
      }
    }

    const validSeverities = severityOptions.map(s => s.value);
    if (!validSeverities.includes(formData.severity)) {
      errors.severity = 'Выберите корректный уровень опасности';
    }

    const validTypes = typeOptions.map(t => t.value);
    if (!validTypes.includes(formData.type)) {
      errors.type = 'Выберите корректный тип инцидента';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addIncident({
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        location: formData.location.trim(),
        severity: formData.severity,
        date: formData.date,
        reporter: formData.reporter.trim(),
        measures: formData.measures.trim()
      });
      alert('Инцидент успешно зарегистрирован!');
      setFormData(initialFormState);
      navigate('/detail');
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <Spinner text="Сохранение инцидента..." />;
  }

  return (
    <div className="form-container">
      <h2>Регистрация инцидента</h2>

      {error && (
        <ErrorMessage
          message={error}
          onClose={clearError}
        />
      )}

      <form onSubmit={handleSubmit} className="incident-form" noValidate>
        <div className={`form-group ${validationErrors.name ? 'has-error' : ''}`}>
          <label>Название инцидента: <span className="required">*</span></label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Например: Срабатывание пожарной сигнализации"
            className={validationErrors.name ? 'input-error' : ''}
          />
          {validationErrors.name && (
            <span className="validation-error">{validationErrors.name}</span>
          )}
        </div>

        <div className={`form-group ${validationErrors.type ? 'has-error' : ''}`}>
          <label>Тип инцидента: <span className="required">*</span></label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={validationErrors.type ? 'input-error' : ''}
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {validationErrors.type && (
            <span className="validation-error">{validationErrors.type}</span>
          )}
        </div>

        <div className={`form-group ${validationErrors.description ? 'has-error' : ''}`}>
          <label>Описание: <span className="required">*</span></label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Подробное описание инцидента..."
            rows="4"
            className={validationErrors.description ? 'input-error' : ''}
          />
          {validationErrors.description && (
            <span className="validation-error">{validationErrors.description}</span>
          )}
        </div>

        <div className={`form-group ${validationErrors.location ? 'has-error' : ''}`}>
          <label>Место происшествия: <span className="required">*</span></label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Например: Корпус А, каб. 204"
            className={validationErrors.location ? 'input-error' : ''}
          />
          {validationErrors.location && (
            <span className="validation-error">{validationErrors.location}</span>
          )}
        </div>

        <div className={`form-group ${validationErrors.severity ? 'has-error' : ''}`}>
          <label>Уровень опасности: <span className="required">*</span></label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className={validationErrors.severity ? 'input-error' : ''}
          >
            {severityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {validationErrors.severity && (
            <span className="validation-error">{validationErrors.severity}</span>
          )}
        </div>

        <div className={`form-group ${validationErrors.date ? 'has-error' : ''}`}>
          <label>Дата инцидента: <span className="required">*</span></label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={validationErrors.date ? 'input-error' : ''}
          />
          {validationErrors.date && (
            <span className="validation-error">{validationErrors.date}</span>
          )}
        </div>

        <div className="form-group">
          <label>Кто сообщил:</label>
          <input
            type="text"
            name="reporter"
            value={formData.reporter}
            onChange={handleChange}
            placeholder="Например: дежурный администратор, учитель, охрана"
          />
        </div>

        <div className="form-group">
          <label>Принятые меры:</label>
          <textarea
            name="measures"
            value={formData.measures}
            onChange={handleChange}
            placeholder="Опишите принятые меры реагирования..."
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-save"
            disabled={isSubmitting || loading}
          >
            {loading ? 'Сохранение...' : 'Зарегистрировать инцидент'}
          </button>
          <Link to="/" className="btn btn-cancel">Отмена</Link>
        </div>
      </form>
    </div>
  );
};

export default Form;
