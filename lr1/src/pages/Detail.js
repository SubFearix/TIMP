import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useIncidents } from '../context/IncidentsContext';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { getSeverityColor, getTypeLabel, getTypeCode } from '../utils/incidentHelpers';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { incidents, fetchIncidents, fetchIncidentById, loading, error, clearError } = useIncidents();
  const [incidentData, setIncidentData] = useState(null);
  const [loadError, setLoadError] = useState(null);

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

  if (loading && (id ? !incidentData : incidents.length === 0)) {
    return <Spinner text={id ? 'Загрузка данных...' : 'Загрузка реестра...'} />;
  }

  if (id && (loadError || (error && !incidentData))) {
    return (
      <ErrorMessage
        message={loadError || error}
        onRetry={() => window.location.reload()}
        onClose={() => navigate('/detail')}
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

  if (id) {
    if (!incidentData) {
      return <Spinner text="Загрузка..." />;
    }
    return (
      <div className="detail-container">
        <div className="detail-header">
          <Link to="/detail" className="back-link">← Назад к реестру</Link>
        </div>

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={clearError} className="error-close">Закрыть</button>
          </div>
        )}

        <div
          className="detail-card"
          style={{ '--card-tab-color': getSeverityColor(incidentData.severity) }}
        >
          <div className="detail-title-row">
            <h2>{incidentData.name}</h2>
            <span
              className="severity-tag"
              style={{ '--tab-color': getSeverityColor(incidentData.severity) }}
            >
              {incidentData.severity}
            </span>
          </div>

          <p className="detail-type">
            <span className="type-code">{getTypeCode(incidentData.type)}</span>
            {getTypeLabel(incidentData.type)}
          </p>

          <div className="detail-info">
            <p><strong>Дата</strong>{incidentData.date}</p>
            <p><strong>Место</strong>{incidentData.location}</p>
            {incidentData.reporter && (
              <p><strong>Сообщил(а)</strong>{incidentData.reporter}</p>
            )}
            <p><strong>Описание</strong>{incidentData.description}</p>
            {incidentData.measures && (
              <p><strong>Принятые меры</strong>{incidentData.measures}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="incidents-container">
      <h2>Реестр инцидентов</h2>
      <p className="page-description">Выберите инцидент для просмотра подробной информации</p>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={clearError} className="error-close">Закрыть</button>
        </div>
      )}

      {incidents.length === 0 ? (
        <div className="no-data-container">
          <p className="no-data">Инциденты не зарегистрированы</p>
          <Link to="/add" className="btn btn-primary">Зарегистрировать первый инцидент</Link>
        </div>
      ) : (
        <div className="incidents-grid">
          {incidents.map(item => (
            <Link
              to={`/detail/${item.id}`}
              key={item.id}
              className="incident-card-link"
              style={{ '--card-tab-color': getSeverityColor(item.severity) }}
            >
              <div className="incident-card">
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
                <div className="incident-view-more">Подробнее</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Detail;
