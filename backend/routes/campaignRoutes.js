const express = require('express');
const campaignController = require('../controllers/campaignController');
const router = express.Router();

router.get('/stats/retrieve', campaignController.campaignStats);
router.post('/status/update', campaignController.updateCampaignStatus);
router.post('/create', campaignController.createCampaign);
router.get('/all', campaignController.getAllCampaigns);
router.get('/:role', campaignController.getCampaignByRole);
router.post('/update', campaignController.updateCampaign);
router.delete('/delete/:id', campaignController.deleteCampaign);
router.delete('/super/delete/:id', campaignController.markCampaignAsDeleted);
router.get('/super/all', campaignController.getAllCampaignsSuperAdmin);

module.exports = router;
