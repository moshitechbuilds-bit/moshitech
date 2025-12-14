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
          fileName: e.parameter.fileName || 'uploaded-image.jpg',
          mimeType: e.parameter.mimeType || 'image/jpeg',
          fileData: e.parameter.fileData || '',
          folderId: e.parameter.folderId || DRIVE_FOLDER_ID,
          clientName: e.parameter.clientName || 'Client'
        };
      }
    } else if (e.parameter) {
      // Handle FormData directly
      data = {
        fileName: e.parameter.fileName || 'uploaded-image.jpg',
        mimeType: e.parameter.mimeType || 'image/jpeg',
        fileData: e.parameter.fileData || '',
        folderId: e.parameter.folderId || DRIVE_FOLDER_ID,
        clientName: e.parameter.clientName || 'Client'
      };
    } else {
      throw new Error('No data received');
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
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Google Drive Upload Service is active',
      folderId: DRIVE_FOLDER_ID,
      usage: 'Send POST requests with file data to upload images'
    }))
    .setMimeType(ContentService.MimeType.JSON);
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
