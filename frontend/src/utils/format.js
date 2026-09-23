import moment from 'moment';

export const formatDate = (value) => (value ? moment(value).format('MMMM D, YYYY') : 'N/A');
export const formatDateTime = (value) => (value ? moment(value).format('ddd, MMM D YYYY') : 'N/A');

export function downloadCsv(rows, fileName = 'leads.csv') {
  if (!rows?.length) return false;
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(','),
    ...rows.map((row) => keys.map((key) => `"${String(row[key] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}
