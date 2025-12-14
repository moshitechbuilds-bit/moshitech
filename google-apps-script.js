/**
 * Google Apps Script for Uploading Images to Google Drive
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Go to https://script.google.com/
 * 2. Click "New Project"
 * 3. Delete the default code and paste this entire file
 * 4. Replace FOLDER_ID below with your Google Drive folder ID: 1ElU-xfvFtMspvjKBR5BUkyrsCM6OL2ZR
 * 5. Click the disk icon to save (or Ctrl+S)
 * 6. Click "Deploy" → "New deployment"
 * 7. Click the gear icon (⚙️) next to "Select type" and choose "Web app"
 * 8. Set:
 *    - Description: "Image Upload to Drive"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (or "Anyone with Google account")
 * 9. Click "Deploy"
 * 10. Copy the Web App URL that appears
 * 11. Paste that URL into info-taker.html in the CONFIG section as GOOGLE_APPS_SCRIPT_URL
 * 12. Click "Authorize access" when prompted and allow access to Google Drive
 * 
 * That's it! Now images will upload directly to your Google Drive folder.
 */

// Replace this with your Google Drive folder ID (from the URL)
// Example: https://drive.google.com/drive/folders/1ElU-xfvFtMspvjKBR5BUkyrsCM6OL2ZR
// The folder ID is: 1ElU-xfvFtMspvjKBR5BUkyrsCM6OL2ZR
const DRIVE_FOLDER_ID = '1ElU-xfvFtMspvjKBR5BUkyrsCM6OL2ZR';

// Google Sheets ID for storing submissions (will be created automatically)
let SUBMISSIONS_SHEET_ID = null;

/**
 * This function is called when a POST request is made to the Web App URL
 */
function doPost(e) {
  try {
    // Handle both FormData and JSON requests
    let data;
    if (e.postData && e.postData.contents) {
      try {
        // Try to parse as JSON first
        data = JSON.parse(e.postData.contents);
      } catch (e) {
        // If not JSON, it's FormData - parse parameters
        data = {
          fileName: e.parameter.fileName || '',
          mimeType: e.parameter.mimeType || '',
          fileData: e.parameter.fileData || '',
          folderId: e.parameter.folderId || DRIVE_FOLDER_ID,
          clientName: e.parameter.clientName || 'Client',
          submissionData: e.parameter.submissionData || ''
        };
      }
    } else if (e.parameter) {
      // Handle FormData directly
      data = {
        fileName: e.parameter.fileName || '',
        mimeType: e.parameter.mimeType || '',
        fileData: e.parameter.fileData || '',
        folderId: e.parameter.folderId || DRIVE_FOLDER_ID,
        clientName: e.parameter.clientName || 'Client',
        submissionData: e.parameter.submissionData || ''
      };
    } else {
      throw new Error('No data received');
    }
    
    // Check if this is a form submission (has submissionData) or image upload
    if (data.submissionData) {
      // This is a form submission - create Google Doc
      let submissionData;
      try {
        submissionData = typeof data.submissionData === 'string' ? JSON.parse(data.submissionData) : data.submissionData;
      } catch (e) {
        throw new Error('Invalid submission data format');
      }
      
      // Create Google Doc
      const docResult = createClientDocument(submissionData);
      
      // Save to Google Sheets
      const sheetResult = saveToGoogleSheets(submissionData);
      
      return ContentService
        .createTextOutput(JSON.stringify({
          success: docResult.success && sheetResult.success,
          docId: docResult.docId,
          docUrl: docResult.docUrl,
          docName: docResult.docName,
          docxId: docResult.docxId,
          docxUrl: docResult.docxUrl,
          docxName: docResult.docxName,
          sheetId: sheetResult.sheetId,
          sheetUrl: sheetResult.sheetUrl,
          message: 'Document (Google Doc and DOCX) and spreadsheet updated successfully'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Otherwise, it's an image upload
    if (!data.fileName || !data.fileData) {
      throw new Error('Missing file data');
    }
    
    // Extract file information
    const fileName = data.fileName || 'uploaded-image.jpg';
    const mimeType = data.mimeType || 'image/jpeg';
    const fileData = data.fileData; // Base64 encoded file
    const clientName = data.clientName || 'Client';
    const folderId = data.folderId || DRIVE_FOLDER_ID;
    
    // Decode base64 to binary
    const binaryData = Utilities.base64Decode(fileData);
    const blob = Utilities.newBlob(binaryData, mimeType, fileName);
    
    // Get the folder by ID
    let folder;
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (error) {
      // If folder not found, create it or use root
      folder = DriveApp.getRootFolder();
    }
    
    // Create a subfolder with client name and date for organization
    const dateFolderName = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    let clientFolder;
    let existingFolders = folder.getFoldersByName(clientName);
    
    if (existingFolders.hasNext()) {
      clientFolder = existingFolders.next();
    } else {
      clientFolder = folder.createFolder(clientName);
    }
    
    // Create date subfolder inside client folder
    let dateFolder;
    let existingDateFolders = clientFolder.getFoldersByName(dateFolderName);
    
    if (existingDateFolders.hasNext()) {
      dateFolder = existingDateFolders.next();
    } else {
      dateFolder = clientFolder.createFolder(dateFolderName);
    }
    
    // Upload the file to the date folder
    const uploadedFile = dateFolder.createFile(blob);
    
    // Make the file accessible (optional - remove if you want files private)
    uploadedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        fileId: uploadedFile.getId(),
        fileName: uploadedFile.getName(),
        fileUrl: uploadedFile.getUrl(),
        folderUrl: dateFolder.getUrl(),
        message: 'File uploaded successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        message: 'Failed to upload file'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * This function handles GET requests (when someone visits the URL directly)
 * Can also return submissions if ?action=getSubmissions
 */
function doGet(e) {
  // Check if requesting submissions
  if (e.parameter && e.parameter.action === 'getSubmissions') {
    try {
      const submissions = getAllSubmissions();
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          submissions: submissions,
          count: submissions.length
        }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: error.toString(),
          submissions: []
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Default response
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Google Drive Upload Service is active',
      folderId: DRIVE_FOLDER_ID,
      usage: 'Send POST requests with file data to upload images or form submissions. Add ?action=getSubmissions to GET all submissions.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create a Google Doc with client submission information
 */
function createClientDocument(submissionData) {
  try {
    // Get the folder
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    
    // Create client folder if it doesn't exist
    const clientName = submissionData.businessName || 'Client';
    let clientFolder;
    let existingFolders = folder.getFoldersByName(clientName);
    
    if (existingFolders.hasNext()) {
      clientFolder = existingFolders.next();
    } else {
      clientFolder = folder.createFolder(clientName);
    }
    
    // Create date subfolder
    const dateFolderName = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    let dateFolder;
    let existingDateFolders = clientFolder.getFoldersByName(dateFolderName);
    
    if (existingDateFolders.hasNext()) {
      dateFolder = existingDateFolders.next();
    } else {
      dateFolder = clientFolder.createFolder(dateFolderName);
    }
    
    // Create Google Doc
    const docName = `${clientName} - Website Intake Form - ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm')}`;
    const doc = DocumentApp.create(docName);
    const docFile = DriveApp.getFileById(doc.getId());
    
    // Move doc to date folder
    docFile.moveTo(dateFolder);
    
    // Get document body
    const body = doc.getBody();
    
    // Set document title
    body.clear();
    const title = body.appendParagraph('Website Intake Form Submission');
    title.setHeading(DocumentApp.ParagraphHeading.TITLE);
    title.setForegroundColor('#33d0ff');
    
    body.appendParagraph(''); // Empty line
    
    // Submission date
    const submittedDate = new Date(submissionData.submittedAt || new Date());
    const dateParagraph = body.appendParagraph(`Submitted: ${Utilities.formatDate(submittedDate, Session.getScriptTimeZone(), 'MMMM dd, yyyy - hh:mm a')}`);
    dateParagraph.setForegroundColor('#8f5bff');
    body.appendParagraph(''); // Empty line
    
    // BUSINESS INFORMATION
    body.appendParagraph('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const section1 = body.appendParagraph('BUSINESS INFORMATION');
    section1.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    section1.setForegroundColor('#33d0ff');
    
    body.appendParagraph(`Business Name: ${submissionData.businessName || 'N/A'}`);
    body.appendParagraph(`Existing Website: ${submissionData.existingWebsite === 'yes' ? 'Yes' : 'No'}`);
    if (submissionData.websiteUrl) {
      body.appendParagraph(`Website URL: ${submissionData.websiteUrl}`);
    }
    body.appendParagraph(''); // Empty line
    
    // WEBSITE DETAILS
    body.appendParagraph('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const section2 = body.appendParagraph('WEBSITE DETAILS');
    section2.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    section2.setForegroundColor('#33d0ff');
    
    body.appendParagraph(`Category: ${submissionData.category || 'N/A'}`);
    body.appendParagraph(`Main Goal: ${submissionData.mainGoal || 'N/A'}`);
    body.appendParagraph(''); // Empty line
    
    body.appendParagraph('Business Description:');
    body.appendParagraph(submissionData.businessDescription || 'N/A');
    body.appendParagraph(''); // Empty line
    
    body.appendParagraph('Target Audience:');
    body.appendParagraph(submissionData.targetAudience || 'N/A');
    body.appendParagraph(''); // Empty line
    
    // DESIGN PREFERENCES
    body.appendParagraph('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const section3 = body.appendParagraph('DESIGN PREFERENCES');
    section3.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    section3.setForegroundColor('#33d0ff');
    
    body.appendParagraph(`Design Style: ${submissionData.designStyle || 'N/A'}`);
    
    if (submissionData.colorPreferences) {
      body.appendParagraph('Color Preferences:');
      body.appendParagraph(submissionData.colorPreferences);
      body.appendParagraph(''); // Empty line
    }
    
    if (submissionData.exampleWebsites) {
      body.appendParagraph('Example Websites:');
      body.appendParagraph(submissionData.exampleWebsites);
      body.appendParagraph(''); // Empty line
    }
    
    // CONTENT & IMAGES
    body.appendParagraph('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const section4 = body.appendParagraph('CONTENT & IMAGES');
    section4.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    section4.setForegroundColor('#33d0ff');
    
    const imagePreference = submissionData.imagePreference === 'upload' ? 'Upload My Own Images' : 
                           submissionData.imagePreference === 'stock' ? 'Use Stock Images' : 'Mix of Both';
    body.appendParagraph(`Image Preference: ${imagePreference}`);
    
    if (submissionData.uploadedFiles && submissionData.uploadedFiles.length > 0) {
      body.appendParagraph(`Uploaded Files: ${submissionData.uploadedFiles.length} file(s)`);
      submissionData.uploadedFiles.forEach((file, index) => {
        if (file.status === 'success') {
          body.appendParagraph(`  ${index + 1}. ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
          if (file.driveUrl) {
            body.appendParagraph(`     URL: ${file.driveUrl}`);
          }
        }
      });
      body.appendParagraph(''); // Empty line
    }
    
    // PAGES & FEATURES
    body.appendParagraph('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const section5 = body.appendParagraph('PAGES & FEATURES');
    section5.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    section5.setForegroundColor('#33d0ff');
    
    if (submissionData.pages && submissionData.pages.length > 0) {
      body.appendParagraph('Required Pages:');
      submissionData.pages.forEach(page => {
        body.appendParagraph(`  • ${page}`);
      });
      body.appendParagraph(''); // Empty line
    }
    
    if (submissionData.features && submissionData.features.length > 0) {
      body.appendParagraph('Special Features:');
      submissionData.features.forEach(feature => {
        body.appendParagraph(`  • ${feature}`);
      });
      body.appendParagraph(''); // Empty line
    }
    
    // ADDITIONAL PREFERENCES
    if (submissionData.additionalPreferences) {
      body.appendParagraph('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      const section6 = body.appendParagraph('ADDITIONAL PREFERENCES');
      section6.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      section6.setForegroundColor('#33d0ff');
      
      body.appendParagraph(submissionData.additionalPreferences);
      body.appendParagraph(''); // Empty line
    }
    
    // Footer
    body.appendParagraph('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    body.appendParagraph(`Submission ID: ${submissionData.id || 'N/A'}`);
    body.appendParagraph(`Generated: ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM dd, yyyy - hh:mm a')}`);
    
    // Save and close Google Doc
    doc.saveAndClose();
    
    // Export as DOCX file
    const docxBlob = docFile.getAs('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const docxFileName = docName + '.docx';
    const docxFile = dateFolder.createFile(docxBlob);
    docxFile.setName(docxFileName);
    
    return {
      success: true,
      docId: doc.getId(),
      docUrl: doc.getUrl(),
      docName: docName,
      docxId: docxFile.getId(),
      docxUrl: docxFile.getUrl(),
      docxName: docxFileName
    };
  } catch (error) {
    Logger.log('Error creating document: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get or create Google Sheets for storing submissions
 */
function getSubmissionsSheet() {
  try {
    // Try to get existing sheet ID from script properties
    const scriptProperties = PropertiesService.getScriptProperties();
    SUBMISSIONS_SHEET_ID = scriptProperties.getProperty('SUBMISSIONS_SHEET_ID');
    
    if (SUBMISSIONS_SHEET_ID) {
      try {
        const sheet = SpreadsheetApp.openById(SUBMISSIONS_SHEET_ID);
        return sheet.getActiveSheet();
      } catch (e) {
        // Sheet doesn't exist, create new one
        SUBMISSIONS_SHEET_ID = null;
      }
    }
    
    // Create new spreadsheet
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const spreadsheet = SpreadsheetApp.create('Moshi Tech - Client Submissions');
    const spreadsheetFile = DriveApp.getFileById(spreadsheet.getId());
    spreadsheetFile.moveTo(folder);
    
    // Set up headers
    const sheet = spreadsheet.getActiveSheet();
    sheet.getRange(1, 1, 1, 15).setValues([[
      'Submission ID', 'Date', 'Business Name', 'Category', 'Main Goal',
      'Design Style', 'Image Preference', 'Pages', 'Features',
      'Uploaded Images', 'Existing Website', 'Website URL',
      'Target Audience', 'Color Preferences', 'Additional Preferences'
    ]]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, 15);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#33d0ff');
    headerRange.setFontColor('#ffffff');
    
    // Save sheet ID
    SUBMISSIONS_SHEET_ID = spreadsheet.getId();
    scriptProperties.setProperty('SUBMISSIONS_SHEET_ID', SUBMISSIONS_SHEET_ID);
    
    return sheet;
  } catch (error) {
    Logger.log('Error getting/creating sheet: ' + error.toString());
    throw error;
  }
}

/**
 * Save submission to Google Sheets
 */
function saveToGoogleSheets(submissionData) {
  try {
    const sheet = getSubmissionsSheet();
    
    // Prepare row data
    const row = [
      submissionData.id || Date.now().toString(),
      submissionData.submittedAt || new Date().toISOString(),
      submissionData.businessName || '',
      submissionData.category || '',
      submissionData.mainGoal || '',
      submissionData.designStyle || '',
      submissionData.imagePreference === 'upload' ? 'Upload My Own' : 
      submissionData.imagePreference === 'stock' ? 'Stock Images' : 'Mix',
      (submissionData.pages || []).join(', '),
      (submissionData.features || []).join(', '),
      (submissionData.uploadedFiles || []).filter(f => f.status === 'success').length,
      submissionData.existingWebsite === 'yes' ? 'Yes' : 'No',
      submissionData.websiteUrl || '',
      submissionData.targetAudience || '',
      submissionData.colorPreferences || '',
      submissionData.additionalPreferences || ''
    ];
    
    // Append row
    sheet.appendRow(row);
    
    return {
      success: true,
      sheetId: SUBMISSIONS_SHEET_ID,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${SUBMISSIONS_SHEET_ID}`
    };
  } catch (error) {
    Logger.log('Error saving to sheet: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get all submissions from Google Sheets
 */
function getAllSubmissions() {
  try {
    const sheet = getSubmissionsSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return [];
    }
    
    // Skip header row and convert to objects
    const submissions = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      submissions.push({
        id: row[0],
        submittedAt: row[1],
        businessName: row[2],
        category: row[3],
        mainGoal: row[4],
        designStyle: row[5],
        imagePreference: row[6],
        pages: row[7] ? row[7].split(', ').filter(p => p) : [],
        features: row[8] ? row[8].split(', ').filter(f => f) : [],
        uploadedImages: row[9] || 0,
        existingWebsite: row[10],
        websiteUrl: row[11],
        targetAudience: row[12],
        colorPreferences: row[13],
        additionalPreferences: row[14]
      });
    }
    
    return submissions;
  } catch (error) {
    Logger.log('Error getting submissions: ' + error.toString());
    return [];
  }
}

/**
 * Test function - you can run this manually to test the script
 */
function testUpload() {
  // This is just for testing - you can delete this function
  Logger.log('Script is working! Folder ID: ' + DRIVE_FOLDER_ID);
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    Logger.log('Folder found: ' + folder.getName());
  } catch (error) {
    Logger.log('Error: ' + error.toString());
  }
}
