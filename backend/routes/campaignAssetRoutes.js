const express = require('express');
const upload = require('../middlewares/upload');
const campaignAssetsController = require('../controllers/campaignAssetController');
const uploadLogMiddleware = require('../middlewares/uploadLogs');

const router = express.Router();

router.post('/process-assets', campaignAssetsController.processAssets);
router.post('/upload-assets', upload.single('file'), uploadLogMiddleware, campaignAssetsController.uploadAssets);

module.exports = router;
