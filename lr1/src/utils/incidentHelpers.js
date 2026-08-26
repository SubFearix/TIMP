export const severityOptions = [
  { value: 'низкий', label: 'Низкий', code: 'Н' },
  { value: 'средний', label: 'Средний', code: 'С' },
  { value: 'высокий', label: 'Высокий', code: 'В' },
  { value: 'критический', label: 'Критический', code: 'К' }
];

export const typeOptions = [
  { value: 'пожар', label: 'Пожар / возгорание', code: 'ПЖ' },
  { value: 'эвакуация', label: 'Эвакуация / учебная тревога', code: 'ЭВ' },
  { value: 'нарушение_доступа', label: 'Нарушение пропускного режима', code: 'НД' },
  { value: 'травма', label: 'Травма / несчастный случай', code: 'МЕД' },
  { value: 'конфликт', label: 'Конфликт / буллинг', code: 'КН' },
  { value: 'техническая_неисправность', label: 'Техническая неисправность', code: 'ТХ' },
  { value: 'иное', label: 'Иное', code: 'ПР' }
];

// Приглушённая, "реестровая" палитра — не сигнальные цвета, а метки
// категорий, как цветные вкладки в картотеке.
export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'критический': return '#8C2F2F';
    case 'высокий': return '#B5522A';
    case 'средний': return '#96792E';
    case 'низкий': return '#4B6358';
    default: return '#7A7A72';
  }
};

export const getTypeLabel = (type) => {
  const found = typeOptions.find(t => t.value === type);
  return found ? found.label : (type || 'Иное');
};

export const getTypeCode = (type) => {
  const found = typeOptions.find(t => t.value === type);
  return found ? found.code : 'ПР';
};

export const getSeverityLabel = (severity) => {
  const found = severityOptions.find(s => s.value === severity);
  return found ? found.label : severity;
};
