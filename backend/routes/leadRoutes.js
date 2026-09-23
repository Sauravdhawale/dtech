const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const leadsController = require('../controllers/leadsController');
const uploadLogMiddleware = require('../middlewares/uploadLogs');

router.post('/upload-csv', upload.single('file'), uploadLogMiddleware, leadsController.uploadCSV);
router.get('/download/:fileName', leadsController.downloadFile);
router.post('/export', leadsController.exportCampaignLeadsByCampaignId);

module.exports = router;
