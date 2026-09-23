const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Lead = require('../models/Lead'); // Ensure you have a Lead model defined
const Campaign = require('../models/Campaigns'); // Ensure you have a Campaign model defined
const sendEmail = require('../middlewares/sendEmail'); // Ensure you have a Campaign model defined
const { body, validationResult } = require('express-validator');
const User = require('../models/Users');

// Endpoint to download the file
exports.downloadFile = (req, res) => {
  const { fileName } = req.params; // Get the file name from the URL parameter
  const filePath = path.join(__dirname, '../uploads', fileName); // Construct the full path
  console.log(fileName,filePath)
  res.download(filePath, (err) => {
    if (err) {
      console.error('Error during file download:', err);
      res.status(500).json({ message: 'Error downloading the file' });
    }
  });
};


// Get Campaign by Role
// exports.exportCampaignLeadsByCampaignId = async (req, res) => {
//   const { campaignId} = req.body;
//   console.log(campaignId);
//   try {
//     const leads = await Lead.find({campaignId});
//     if (!leads) return res.json({ statusCode:404, statusMessage: 'leads_not_found' ,message: 'Leads Not Found' });
//     res.json({ statusCode:200, statusMessage: 'leads_found' ,data:leads ,count:leads.length ,message: 'Leads Found' });
//   } catch (error) {
//     res.json({ statusCode:500, statusMessage: 'something_went_wrong' ,message: 'Error searching for leads'+error });
//   }
// };
exports.exportCampaignLeadsByCampaignId = async (req, res) => {
  const { campaignId, dateRange } = req.body;
  const { dateOption, customDate, dateRangeStart, dateRangeEnd } = dateRange;

  try {
    // Base query to filter by campaign ID
    let query = { campaignId };

    // Add date filters based on the selected option
    if (dateOption === 'customDate' && customDate) {
      // Convert customDate to a date range for the whole day
      const startOfDay = new Date(customDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(customDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      query.creationTime = { $gte: startOfDay, $lte: endOfDay };
      
    } else if (dateOption === 'customRange' && dateRangeStart && dateRangeEnd) {
      // Ensure both start and end dates are converted to the beginning of their days
      const startDate = new Date(dateRangeStart);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(dateRangeEnd);
      endDate.setUTCHours(23, 59, 59, 999);
      
      query.creationTime = { $gte: startDate, $lte: endDate };
    }
    // If 'All' is selected, we export all leads for the campaignId without date filter

    const leads = await Lead.find(query, {_id : 0, __v : 0});
    if (!leads || leads.length === 0) {
      return res.json({
        statusCode: 404,
        statusMessage: 'leads_not_found',
        message: 'Leads Not Found'
      });
    }

    res.json({
      statusCode: 200,
      statusMessage: 'leads_found',
      data: leads,
      count: leads.length,
      message: 'Leads Found'
    });

  } catch (error) {
    res.json({
      statusCode: 500,
      statusMessage: 'something_went_wrong',
      message: 'Error searching for leads: ' + error.message
    });
  }
};



// Endpoint to upload CSV
exports.uploadCSV = async (req, res) => {
  if (!req.uploadDetails) {
    return res.status(500).json({
      statusCode: 500,
      statusMessage: 'upload_details_missing',
      message: 'Failed to log upload details.',
    });
  }


  const { fileName, filePath, fileUploadName,fileSize, numberOfRows, uploadStartTimestamp, uploadCompleteTimestamp } = req.uploadDetails;
  const campaign = await Campaign.findById(req.body._id);
  if(!campaign){
    return res.status(500).json({ message: 'Campaign not found.' });
  }
  let templateHeaders = leadHeaders = [];
  const templateId = campaign?.campaignLeadTemplate;
  const templatePath = `uploads/Template ${templateId}.csv`;
  await new Promise((resolve, reject) => {
    fs.createReadStream(templatePath)
      .pipe(csv())
      .on('headers', (headers) => {
        leadHeaders = headers;
        resolve();
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  })
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headers) => {
        templateHeaders = headers;
        resolve();
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });
  templateHeaders = templateHeaders.map(header => header.toLowerCase());
  leadHeaders = leadHeaders.map(header => header.toLowerCase());
  // Remove any empty entries from both arrays
  templateHeaders = templateHeaders.map(header => header.trim());
  leadHeaders = leadHeaders.map(header => header.trim());
  templateHeaders = templateHeaders.filter(header => header.trim() !== '');
  leadHeaders = leadHeaders.filter(header => header.trim() !== '');
  const headersMatch1 = templateHeaders.every(header => leadHeaders.includes(header));
  
  // Check if headers match exactly
  const headersMatch = templateHeaders.length === leadHeaders.length && 
    templateHeaders.every(header => leadHeaders.includes(header));
  
  if (!headersMatch) {
    return res.status(500).json({
      statusCode: 500,
      statusMessage: 'headers_mismatch',
      message: 'Template and uploaded file do not match exactly. Please ensure the files are identical.',
    });
  }
  const userId = req.userId;
  const user = await User.findOne({_id:userId});

  // console.log('Upload Details:', req); // Log upload details


  console.log('Inside uploadCSV', filePath);
  const { campaignId, campaignName,role = user.role, email = user.email } = req.body; // Get campaignId and campaignName from request body

  // Start processing the CSV file in the background
  try {

    res.status(200).json({
      statusCode: 200,
      statusMessage : 'leads_uploaded_successfully',
      message: 'File uploaded successfully.',
      file_name : fileName,
      uploaded_name:fileUploadName,
      number_of_rows: numberOfRows?numberOfRows:0,
      upload_start_timestamp: uploadStartTimestamp,
      upload_complete_timestamp: uploadCompleteTimestamp,
    });
    processCSV(filePath, campaignId, campaignName, role, email, uploadCompleteTimestamp)
    .then(async (results) => {
      console.log('CSV processing completed:', results);
      if (results.leadsCount > 0) {
        const updateResult = await Campaign.updateOne(
          { campaignId: campaignId },
          {
            $inc: { pending: (role == 'admin')?(results.leadsCount):0 },
            $push: {
              leadsUploadLogs: {
                fileName,
                fileUploadName,
                filePath,
                uploadCompleteTimestamp,
                leadsAffected:results.leadsCount,
                leadsInFile:results.totalLeads,
                leadsAction:(role == 'admin'?'create':'update'),
                operationEndTime: new Date(),
              }
            }
          }
        );

        console.log('Update Result:', results);
          
        if (updateResult.modifiedCount === 0) {
          console.error(`No campaign found with campaignId: ${campaignId}`);
          return;
        }
        return;
      }

      const emailData = {
        to: email,
        subject: 'CSV Processing Results',
        html: `
          <h2>CSV Processing Summary</h2>
          <table border="1" cellpadding="5" cellspacing="0">
            <tr><th>Campaign ID</th><th>File Name</th><th>Start Time</th><th>End Time</th><th>Leads in File</th><th>Leads Exist</th><th>Leads Affected</th></tr>
            <tr>
              <td>${campaignId}</td>
              <td>${fileName}</td>
              <td>${uploadCompleteTimestamp}</td>
              <td>${new Date()}</td>
              <td>${results.totalLeads}</td>
              <td>${results.leadsCount}</td>
              <td>${results.newLeadsCount ? results.newLeadsCount : (results.pendingCount+' (P) - '+ results.acceptedCount+ '(A) - ' + results.rejectedCount +' (R)')}</td>
            </tr>
          </table>
        `,
      };
      sendEmail(emailData);
    });

  } catch (err) {
    console.error('Error during file processing:', err);
    res.status(500).json({ message: 'Error processing file.' });
  }
};

const processCSV = async (filePath, campaignId, campaignName, role, email, timestamp) => {
  const leads = [];
  let leadsCount = 0;
  let newLeadsCount = 0;
  let pendingCount = 0;
  let acceptedCount = 0;
  let rejectedCount = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const lead = {
          ...row,
          campaignId,
          timestamp: new Date(),
        };
        leads.push(lead);
      })
      .on('end', async () => {
        try {
          console.log('Finished reading CSV', leads.length);
          const totalLeads = leads.length;

          console.log(role, "role ----------------------------- ")
          if (role === 'Admin') {
            for (const lead of leads) {
              const existingLead = await Lead.findOne({
                email: lead.email,
                domain: lead.domain,
                campaignId: lead.campaignId,
              });

              if (!existingLead) {
                await Lead.create(lead);
                newLeadsCount++;
              }
              else{
                leadsCount++;
              }

              console.log(`Admin: ${leadsCount} already existed ${newLeadsCount} new leads inserted.`);
            }

            await User.findOneAndUpdate(
              { email },
              { $inc: { totalLeads: newLeadsCount } }
            );

            await Campaign.findOneAndUpdate(
              {campaignId},
              { $inc: { uploaded : newLeadsCount} }
            );
  

          } else if (role === 'Client') {
            for (const lead of leads) {
              const existingLead = await Lead.findOne({
                email: lead.email,
                domain: lead.domain,
                campaignId: lead.campaignId,
              });
              if(existingLead){
                if(existingLead.lead_status != lead.lead_status){
                  existingLead.lead_status = lead.lead_status || 'Pending';
                  await existingLead.save();
                  leadsCount++;
                }
              }
            }

            const [acceptedCount, pendingCount, rejectedCount] = await Promise.all([
              Lead.countDocuments({ campaignId: campaignId, lead_status: 'Accepted' }),
              Lead.countDocuments({ campaignId: campaignId, lead_status: {$nin: ['Accepted','Rejected']} }),
              Lead.countDocuments({ campaignId: campaignId, lead_status: 'Rejected' })
            ]);
            
            if(leadsCount > 0){
              await Campaign.findOneAndUpdate(
                {campaignId},
                {
                  $inc: {
                    accepted: acceptedCount,
                    pending: pendingCount,
                    rejected: rejectedCount,
                  },
                }
              );
              await User.findOneAndUpdate(
                { email },
                {
                  $inc: {
                    totalAccepted: acceptedCount,
                    totalUnderReview: pendingCount,
                    totalRejected: rejectedCount,
                  },
                }
              );
            }
          }

          resolve({ totalLeads, leadsCount, newLeadsCount, pendingCount, acceptedCount, rejectedCount });
          
        } catch (err) {
          console.error('Error processing leads:', err);
          reject(err);
        } finally {
          console.log('processCSV execution completed');
        }
      })
      .on('error', (err) => {
        console.error('Error processing CSV file:', err);
        reject(err);
      });
  });
};