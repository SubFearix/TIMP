import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useIncidents } from '../context/IncidentsContext';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { getSeverityColor, getTypeLabel, getTypeCode } from '../utils/incidentHelpers';

const Delete = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { incidents, fetchIncidents, fetchIncidentById, deleteIncident, loading, error, clearError } = useIncidents();
  const [incidentData, setIncidentData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      const loadItem = async () => {
        try {
          const data = await fetchIncidentById(id);
          setIncidentData(data);
        } catch (err) {
          setLoadError('Не удалось загрузить данные инцидента');
        }
      };
      loadItem();
    } else {
      fetchIncidents();
    }
  }, [id, fetchIncidents, fetchIncidentById]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteIncident(parseInt(id));
      setIsDeleting(false);
      alert('Инцидент успешно удален!');
      navigate('/delete');
    } catch (err) {
      setIsDeleting(false);
    }
  };

  if (loading && (id ? !incidentData : incidents.length === 0)) {
    return <Spinner text={id ? 'Загрузка данных...' : 'Загрузка реестра...'} />;
  }

  if (id && loadError) {
    return (
      <ErrorMessage
        message={loadError}
        onRetry={() => window.location.reload()}
        onClose={() => navigate('/delete')}
      />
    );
  }

  if (!id && error && incidents.length === 0) {
    return (
      <ErrorMessage
        message={error}
        onRetry={fetchIncidents}
        onClose={clearError}
      />
    );
  }

  if (isDeleting) {
    return <Spinner text="Удаление..." />;
  }

  if (id) {
    if (!incidentData) {
      return <Spinner text="Загрузка..." />;
    }
    return (
      <div className="delete-container">
        <div className="delete-header">
          <Link to="/delete" className="back-link">← Назад к реестру</Link>
        </div>

        <div
          className="delete-card"
          style={{ '--card-tab-color': getSeverityColor(incidentData.severity) }}
        >
          <div className="delete-warning">
            <h2>Подтверждение удаления</h2>
          </div>
          <p className="delete-message">
            Вы действительно хотите удалить следующий инцидент? Это действие
            нельзя отменить.
          </p>

          {error && (
            <ErrorMessage
              message={error}
              onClose={clearError}
            />
          )}

          <div className="delete-incident-preview">
            <div className="preview-header">
              <h3>{incidentData.name}</h3>
              <span
                className="severity-tag"
                style={{ '--tab-color': getSeverityColor(incidentData.severity) }}
              >
                {incidentData.severity}
              </span>
            </div>
            <div className="preview-info">
              <p><strong>Тип:</strong> {getTypeCode(incidentData.type)} — {getTypeLabel(incidentData.type)}</p>
              <p><strong>Дата:</strong> {incidentData.date}</p>
              <p><strong>Место:</strong> {incidentData.location}</p>
              <p><strong>Описание:</strong> {incidentData.description}</p>
            </div>
          </div>

          <div className="delete-actions">
            <button
              onClick={handleDelete}
              className="btn btn-delete btn-large"
              disabled={loading || isDeleting}
            >
              Да, удалить инцидент
            </button>
            <Link to="/delete" className="btn btn-cancel btn-large">
              Отмена
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="incidents-container">
      <h2>Удаление инцидентов</h2>
      <p className="page-description">Выберите инцидент для удаления</p>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={clearError} className="error-close">Закрыть</button>
        </div>
      )}

      {incidents.length === 0 ? (
        <div className="no-data-container">
          <p className="no-data">Инциденты не зарегистрированы</p>
          <p>Нечего удалять</p>
        </div>
      ) : (
        <div className="incidents-grid">
          {incidents.map(item => (
            <Link
              to={`/delete/${item.id}`}
              key={item.id}
              className="incident-card-link"
              style={{ '--card-tab-color': getSeverityColor(item.severity) }}
            >
              <div className="incident-card incident-card-delete">
                <div className="card-top">
                  <span className="card-id">{String(item.id).padStart(3, '0')}</span>
                  <span className="incident-date">{item.date}</span>
                </div>
                <span
                  className="severity-tag"
                  style={{ '--tab-color': getSeverityColor(item.severity) }}
                >
                  {item.severity}
                </span>
                <h3>{item.name}</h3>
                <p className="incident-type">
                  <span className="type-code">{getTypeCode(item.type)}</span>
                  {getTypeLabel(item.type)}
                </p>
                <p className="incident-location">{item.location}</p>
                <p className="incident-description">{item.description}</p>
                <div className="incident-view-more incident-delete-action">Удалить</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Delete;
