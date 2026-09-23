import api from './api';

export async function getCampaignStats() {
  const { data } = await api.get('/campaign/stats/retrieve');
  return data;
}

export async function getCampaigns() {
  const { data } = await api.get('/campaign/all', { params: { start: 0, length: 5000, draw: 1 } });
  return data;
}

export async function createCampaign(payload) {
  const { data } = await api.post('/campaign/create', payload);
  return data;
}

export async function updateCampaign(payload) {
  const { data } = await api.post('/campaign/update', payload);
  return data;
}

export async function updateCampaignStatus(id, campaignStatus) {
  const { data } = await api.post('/campaign/status/update', { campaignId: id, campaignStatus });
  return data;
}

export async function deleteCampaign(id) {
  const { data } = await api.delete(`/campaign/delete/${id}`);
  return data;
}

export async function uploadCampaignAsset({ campaignId, file, fileName, typeOfFile }) {
  const form = new FormData();
  form.append('file', file);
  form.append('fileName', fileName);
  form.append('typeOfFile', typeOfFile);
  form.append('campaignId', campaignId);
  const { data } = await api.post('/campaigns/upload-assets', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
}
