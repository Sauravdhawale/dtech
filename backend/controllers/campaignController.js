const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const Campaign = require('../models/Campaigns');
const Lead = require('../models/Lead'); 
const { processAssets } = require('./campaignAssetController');


// Create Campaign
exports.createCampaign = async (req, res) => {
  const { campaignId, campaignName, campaignType, campaignStatus, startDate,endDate, cpl, allocation,campaignPacing,campaignAssets, createdBy,userEmail, assignedBy, campaignLeadTemplate  } = req.body;
  const userId = req.userId;

  try {
    console.log(req.userId);
    const newCampaign = await Campaign.create({ campaignId, campaignName, campaignType, campaignStatus, startDate,endDate, cpl, allocation,campaignPacing,campaignAssets, createdBy:userId ,userEmail, assignedBy, campaignLeadTemplate });
    
    if(!newCampaign) {
      res.json({ statusCode:400, statusMessage: 'cannot_create' ,message: 'Cannot create the Campaign' });
    }
    else{
      res.json({ statusCode:201, statusMessage: 'campaign_created', data:newCampaign ,message: 'Campaign Created successfully' });
      // Start processing the assets in the background
      processAssets(newCampaign._id, campaignAssets,createdBy,userEmail);
    }

  } catch (error) {
    res.json({ statusCode:500, statusMessage: 'something_went_wrong' ,message: 'Error creating campaign'+error });
  }
};


// Get all Campaigns
exports.getAllCampaignsSuperAdmin = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ creationTime: -1 }); // Populate createdBy field with user details
    if(!campaigns) 
      return res.json({ statusCode:404, statusMessage: 'campaign_not_found' ,message: 'Campaign Not Found' });
    
    res.json({ statusCode:200, statusMessage: 'campaigns_found', data:campaigns ,message: 'Campaign Data Found' });
  } catch (error) {
    res.json({ statusCode:500, statusMessage: 'something_went_wrong' ,message: 'Error deleting campaign'+error });
  }
};

// Mark Campaign as Deleted
exports.markCampaignAsDeleted = async (req, res) => {
  const campaignId = req.params.campaignId;

  try {
    const campaign = await Campaign.updateOne(
      campaignId,
      { campaignStatus:"Deleted", deleted: true },
      { new: true } // Returns the updated document
    );

    if (!campaign) {
      return res.status(404).json({
        statusCode: 404,
        statusMessage: 'campaign_not_found',
        message: 'Campaign Not Found'
      });
    }

    res.json({
      statusCode: 200,
      statusMessage: 'campaign_marked_as_deleted',
      data: campaign,
      message: 'Campaign marked as deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMessage: 'something_went_wrong',
      message: 'Error marking campaign as deleted',
      error
    });
  }
};


// Get all Campaigns
exports.getAllCampaigns = async (req, res) => {
  try {
    const {start, length, search, order, draw} = req.query;
    const regex = new RegExp(search?.value, 'i'); // 'i' for case-insensitive
    const searchQuery = search?.value ? {
      $or: [
        { campaignName: { $regex: regex } },
        { campaignId: { $regex: regex } },
        { userEmail: { $regex: regex } },
      ]
    } : {};
    const query = {
      $or: [
        { deleted: { $exists: false } },
        { deleted: false }
      ],
    }
    const campaigns = await Campaign.find({...query, ...searchQuery})
    .populate('createdBy', 'email')
    .sort({ creationTime: -1 })
    .skip(start)
    .limit(length);
    if(!campaigns) 
      return res.json({ statusCode:404, statusMessage: 'campaign_not_found' ,message: 'Campaign Not Found' });
    const totalCampaigns = await Campaign.countDocuments(query);
    const filteredCampaigns = await Campaign.countDocuments({...query, ...searchQuery});
    return res.json({
      draw: draw,
      recordsTotal: totalCampaigns,
      recordsFiltered: filteredCampaigns,
      data:campaigns,
      statusCode:200,
      statusMessage: 'campaigns_found',
      message: 'Campaign Data Found', 
    });
  } catch (error) {
    console.log(error);
    return res.json({ statusCode:500, statusMessage: 'something_went_wrong' ,message: 'Error deleting campaign'+error });
  }
};

// Get Campaign by Role
exports.updateCampaignStatus = async (req, res) => {
  const { campaignId, campaignStatus } = req.body;
  try {
    
    const updateResult = await Campaign.updateOne(
      { _id: campaignId }, // Update based on the campaignId
      {
        $set: { campaignStatus :campaignStatus }
      }
    );
    if (!updateResult) return res.json({ statusCode:404, statusMessage: 'campaign_not_found' ,message: 'Campaign Not Found' });
    res.json({ statusCode:200, statusMessage: 'campaign_status_updated' ,message: 'Campaign Status Updated' });
  } catch (error) {
    res.json({ statusCode:500, statusMessage: 'something_went_wrong' ,message: 'Error changing status of campaign'+error });
  }
};


// Get Campaign by Role
exports.getCampaignByRole = async (req, res) => {
  try {
    const campaigns = await Campaign.find(req.params.role);
    if (!campaigns) 
      return res.json({ statusCode:404, statusMessage: 'campaign_not_found' ,message: 'Campaign Not Found' });
    res.json({ statusCode:200, statusMessage: 'campaigns_found' ,data:campaigns ,message: 'Role based Campaigns Found' });
  } catch (error) {
    res.json({ statusCode:500, statusMessage: 'something_went_wrong' ,message: 'Error deleting campaign'+error });
  }
};


// Update Campaign
exports.updateCampaign = async (req, res) => {
  console.log(req.body);
  const { campaignId, startDate, endDate, campaignType, campaignStatus, allocation, cpl, campaignAssets } = req.body;

  try {
    // Prepare an object to hold the fields that need to be updated
    const updateFields = {};

    // Only add fields to the updateFields object if they are provided
    if (startDate) updateFields.startDate = startDate;
    if (endDate) updateFields.endDate = endDate;
    if (campaignType) updateFields.campaignType = campaignType;
    if (campaignStatus) updateFields.campaignStatus = campaignStatus;
    if (allocation) updateFields.allocation = allocation;
    if (cpl) updateFields.cpl = cpl;
    if (campaignAssets) updateFields.campaignAssets = campaignAssets;

    // Update the campaign with the new data
    const campaign = await Campaign.updateOne(
      { campaignId },
      { $set: updateFields }, // Use $set to only update specified fields
      { new: true, runValidators: true } // Return the modified document and validate changes
    );

    if (!campaign) {
      return res.json({ statusCode: 404, statusMessage: 'campaign_not_found', message: 'Campaign Not Found' });
    }

    res.json({ statusCode: 200, statusMessage: 'campaign_updated', data: campaign, message: 'Campaign Updated Successfully' });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(400).json({ message: 'Error updating campaign', error });
  }
};


// Delete Campaign
exports.deleteCampaign = async (req, res) => {
  try {
    console.log(req.params.id)
    const campaign = await Campaign.findByIdAndUpdate(req.params.id,{campaignStatus:'Deleted'});
    if (!campaign) res.json({ statusCode:404, statusMessage: 'campaign_not_found' ,message: 'Campaign Not Found' });
    res.json({ statusCode:200, statusMessage: 'campaign_deleted' ,message: 'Campaign deleted successfully' });
  } catch (error) {
    res.json({ statusCode:500, statusMessage: 'something_went_wrong' ,message: 'Error deleting campaign'+error });
  }
};

// Route to fetch all the required counts
exports.campaignStats =  async (req, res) => {
  try {
    // Get total campaigns count
    const totalCampaigns = await Campaign.countDocuments();

    // await Lead.updateMany({
    //   lead_status: { $exists: true }
    // }, {
    //   $set: {
    //     lead_status: 'Pending'
    //   }
    // });

    // Get count of leads with lead_status as 'Accepted'
    const acceptedLeadsCount = await Lead.countDocuments({ lead_status: 'Accepted' });

    // Get count of leads with lead_status either missing or 'Pending'
    const pendingReviewLeadsCount = await Lead.countDocuments({
      $or: [
        { lead_status: { $exists: false } }, // No lead_status field
        { lead_status: 'Pending' }, // lead_status is 'Pending'
        { lead_status: '' }, // lead_status is 'Pending'
      ],
    });



    // Calculate totalAllocation from the Campaign collection
    const totalAllocationResult = await Campaign.aggregate([
      {
        $group: {
          _id: null,
          totalAllocation: { $sum: "$allocation" }
        }
      }
    ]);

    // If aggregation returns no result, set totalAllocation to 0
    const totalAllocation = totalAllocationResult.length > 0 ? totalAllocationResult[0].totalAllocation : 0;


    // Send the response back
    res.json({ 
      statusCode:200, 
      statusMessage: 'grid_data_fetced', 
      data:{
        totalCampaigns,
        totalAllocation,
        acceptedLeadsCount,
        pendingReviewLeadsCount
      } ,
      message: 'Campaign Grid Count fetched Successfully' 
    });
    
  } catch (err) {
    console.error('Error fetching campaign stats:', err);
     // Send the response back
     res.json({ 
      statusCode:500, 
      statusMessage: 'cannot_fetch_grid_data', 
      message: 'Something went wrong while fetching the details' 
    });
  }
};


// Controller to send emails
exports.sendMail = async (req, res) => {
    const { to, subject, text } = req.body;
  
    // Set up mail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  
    // Set mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    };
  
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: 'Error sending email', error });
      }
      res.status(200).json({ message: 'Email sent successfully', info });
    });
  };

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // limit 1MB
}).single('file');

// Controller to handle file upload
exports.uploadFile = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file' });
    }
    res.status(200).json({ message: 'File uploaded successfully', file: req.file });
  });
};
