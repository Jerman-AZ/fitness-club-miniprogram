// 简易日期处理工具，替代 dayjs 的基本功能
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = date instanceof Date ? date : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
};

module.exports = {
  format: formatDate,
  subtract: (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return { format: (f) => formatDate(d, f) };
  }
};