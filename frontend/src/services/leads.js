import api from './api';

export async function uploadLeads({ _id, campaignId, campaignName, file, typeOfFile = 'Leads' }) {
  const form = new FormData();
  form.append('file', file);
  form.append('_id', _id);
  form.append('campaignId', campaignId);
  form.append('campaignName', campaignName);
  form.append('typeOfFile', typeOfFile);
  const { data } = await api.post('/leads/upload-csv', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
}

export async function exportLeads({ campaignId, dateOption, customDate, dateRangeStart, dateRangeEnd }) {
  const { data } = await api.post('/leads/export', {
    campaignId,
    dateRange: { dateOption, customDate, dateRangeStart, dateRangeEnd },
  });
  return data;
}
