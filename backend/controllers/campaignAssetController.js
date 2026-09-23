const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Company = require('../models/Company');
const DomainSuppression = require('../models/DomainSuppression');
const EmailSuppression = require('../models/EmailSuppression');
const sendEmail = require('../middlewares/sendEmail'); // Ensure you have a Campaign model defined


// Helper function to process assets in the background
exports.processAssets = async (campaignId, assets,createdBy,userEmail) => {
  console.log(userEmail);
  const results =[]
  for (let asset of assets) {
    const { fileName, typeOfFile, fileUploadedName } = asset;
    const filePath = path.join(__dirname, '../uploads', fileUploadedName); // Assuming files are uploaded beforehand

    try {
      let result;
      console.log('inside process Assets switch')
      switch (typeOfFile) {
        case 'ABM':
          result = await processABMFile(filePath, campaignId,createdBy);
          break;
        case 'Domain Suppression':
          result = await processDomainSuppressionFile(filePath, campaignId,createdBy);
          break;
        case 'Email Suppression':
          result = await processEmailSuppressionFile(filePath, campaignId,createdBy);
          break;
        case 'Asset':
          result = await processAssetFile(filePath, campaignId,createdBy,'Asset');
          break;
        case 'Specs':
          result = await processAssetFile(filePath, campaignId,createdBy,'Specs');
          break;
        case 'TAL':
          result = await processAssetFile(filePath, campaignId,createdBy,'TAL');
          break;
        default:
          console.error(`Unsupported file type: ${typeOfFile}`);
          result = { typeOfFile, error: `Unsupported file type: ${typeOfFile}` };

      }
      if (result) {
        results.push(result); // Collect results of file processing
      }
    } catch (error) {
      console.error(`Error processing ${fileName}:`, error);
    }
  }


  // Send email with processing results
  await sendEmail({
    to: userEmail,  // Assuming `createdBy` contains the user's email
    subject: `Asset Processing Results for Campaign ${campaignId}`,
    html: generateEmailTemplate(results)  // Generate email template with results
  });
  
};

const generateEmailTemplate = (results) => {
  let html = '<h3>Asset Processing Results</h3>';
  html += `
    <table border="1" cellpadding="5" cellspacing="0">
      <tr>
        <th>File Type</th>
        <th>Total Records</th>
        <th>New Records Inserted</th>
        <th>Skipped Records</th>
        <th>Errors</th>
      </tr>`;

  results.forEach(result => {
    html += `
      <tr>
        <td>${result.typeOfFile}</td>
        <td>${result.totalRecords}</td>
        <td>${result.newRecords}</td>
        <td>${result.skippedRecords}</td>
        <td>${result.error || 'None'}</td>
      </tr>`;
  });

  html += '</table>';
  return html;
};

const processABMFile = (filePath, campaignId,createdBy) => {
  console.log('inside processABMFile');
  const companies = [];
  let newRecords = 0;
  let skippedRecords = 0;
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        companies.push({ ...row, campaignId,createdBy, timestamp: new Date() });
      })
      .on('end', async () => {
        try {
          for (const companyData of companies) {
            const { domain } = companyData;

            // Check if a company with the same domain and campaignId already exists
            const existingCompany = await Company.findOne({ domain, campaignId });

            if (!existingCompany) {
              // If no such combination exists, insert the new company
              await Company.create(companyData);
              console.log(`ABM entry for domain: ${domain}, campaignId: ${campaignId} inserted.`);
              newRecords++;
            } else {
              console.log(`Company with domain: ${domain} already exists for campaignId: ${campaignId}. Skipping.`);
              skippedRecords++;
            }
          }

           // Resolve with result data
          resolve({
            typeOfFile: 'ABM',
            totalRecords: companies.length,
            newRecords,
            skippedRecords
          });
        } catch (err) {
          console.error(`Error processing ABM data: ${err}`);
          reject({
            typeOfFile: 'ABM',
            error: err.message
          });
        }
      })
      .on('error', (err) => {
        reject({
          typeOfFile: 'ABM',
          error: err.message
        });
      });
  });
};


const processDomainSuppressionFile = (filePath, campaignId,createdBy) => {
  console.log('inside processDomainSuppressionFile');
  const domains = [];
  let newRecords = 0;
  let skippedRecords = 0;
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        domains.push({ ...row, campaignId, createdBy,timestamp: new Date() });
      })
      .on('end', async () => {
        try {
          for (const domainData of domains) {
            const { domain } = domainData;

            // Check if the domain already exists in the suppression list for the same campaign
            const existingEntry = await DomainSuppression.findOne({ domain, campaignId });

            if (!existingEntry) {
              // If the domain and campaignId combination does not exist, insert it
              await DomainSuppression.create(domainData);
              console.log(`Domain suppression entry for domain: ${domain}, campaignId: ${campaignId} inserted.`);
              newRecords++;
            } else {
              console.log(`Domain: ${domain} already exists for campaignId: ${campaignId}. Skipping.`);
              skippedRecords++;
            }
          }

          // Resolve with result data
        resolve({
          typeOfFile: 'Domain Suppression',
          totalRecords: domains.length,
          newRecords,
          skippedRecords
        });
        } catch (err) {
          console.error(`Error processing domain suppression data: ${err}`);
          reject({
            typeOfFile: 'Domain Suppression',
            error: err.message
          });

        }
      })
      .on('error', (err) => {
        console.error('Error processing CSV file:', err);
        reject({
            typeOfFile: 'Domain Suppression',
            error: err.message
          });

      });
  });
};


const processEmailSuppressionFile = (filePath, campaignId,createdBy) => {
  console.log('inside processEmailSuppressionFile');
  const emails = [];
  let newRecords =0;
  let skippedRecords =0;
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        emails.push({ ...row, campaignId, 'createdByUser': createdBy,timestamp: new Date() });
      })
      .on('end', async () => {
        try {
          for (const emailData of emails) {
            const { email } = emailData;

            // Check if the email already exists in the suppression list for the same campaign
            const existingEntry = await EmailSuppression.findOne({ email, campaignId });

            if (!existingEntry) {
              // If the email and campaignId combination does not exist, insert it
              await EmailSuppression.create(emailData);
              console.log(`Email suppression entry for email: ${email}, campaignId: ${campaignId} inserted.`);
              newRecords++;
            } else {
              console.log(`Email: ${email} already exists for campaignId: ${campaignId}. Skipping.`);
              skippedRecords++;
            }
          }
          
          // Resolve with result data
          resolve({
            typeOfFile: 'Email Suppression',
            totalRecords: emails.length,
            newRecords,
            skippedRecords
          });
        } catch (err) {
          console.error(`Error processing email suppression data: ${err}`);
          reject({
            typeOfFile: 'Email Suppression',
            error: err.message
          });
        }
      })
      .on('error', (err) => {
        console.error('Error processing CSV file:', err);
        reject({
          typeOfFile: 'Email Suppression',
          error: err.message
        });
      });
  });
};

const processAssetFile = async (filePath,campaignId,createdBy,fileType) => {
  console.log('inside processAssetFilede');
  // Handle other types of assets, e.g., files, TAL, etc.

  return new Promise((resolve, reject) => {

        try {
              // Resolve with result data
          resolve({
            typeOfFile: fileType,
            totalRecords: 1,
            newRecords : 1,
            skippedRecords : 0
          });
          

        } catch (err) {
          console.error(`Error processing Asset Documet data: ${err}`);
          reject({
            typeOfFile: 'Asset Documet',
            error: err.message
          });

        }
      
  });
};

// Endpoint to upload CSV+
exports.uploadAssets = async (req, res) => {
  console.log('inside uploadAssets')
  if (!req.uploadDetails) {
    return res.status(500).json({
      statusCode: 500,
      statusMessage: 'upload_details_missing',
      message: 'Failed to log upload details.',
    });
  }

  const { fileName, filePath, fileUploadName,fileSize, typeOfFile,numberOfRows, uploadStartTimestamp, uploadCompleteTimestamp } = req.uploadDetails;

  console.log('Upload Details:', req); // Log upload details


  console.log('Inside uploadCSV', filePath);
  const { campaignId, campaignName,role,email,fileTitle } = req.body; // Get campaignId and campaignName from request body

  // Start processing the CSV file in the background
  try {
    res.status(200).json({
      statusCode: 200,
      statusMessage : 'asset_uploaded_successfully',
      message: 'File uploaded successfully.',
      data : {
        fileName ,
        typeOfFile,
        fileUploadedName:fileUploadName,
        upload_start_timestamp: uploadStartTimestamp,
        upload_complete_timestamp: uploadCompleteTimestamp,
      }
    });    
  } catch (err) {
    console.error('Error during file processing:', err);
    res.status(500).json({ message: 'Error processing file.' });
  }
};