# Google Drive Upload Setup Instructions

This guide will help you set up direct image uploads to your Google Drive folder.

## Your Google Drive Folder
**Folder URL**: https://drive.google.com/drive/folders/1ElU-xfvFtMspvjKBR5BUkyrsCM6OL2ZR  
**Folder ID**: `1ElU-xfvFtMspvjKBR5BUkyrsCM6OL2ZR`

---

## Step-by-Step Setup

### Step 1: Create Google Apps Script
1. Go to https://script.google.com/
2. Click **"New Project"** (top left)
3. You'll see a new project with some default code

### Step 2: Paste the Script Code
1. Delete all the default code in the editor
2. Open the file `google-apps-script.js` from this project
3. Copy **ALL** the code from that file
4. Paste it into the Google Apps Script editor

### Step 3: Verify Folder ID (Optional)
- The script already has your folder ID: `1ElU-xfvFtMspvjKBR5BUkyrsCM6OL2ZR`
- It's in the line: `const DRIVE_FOLDER_ID = '1ElU-xfvFtMspvjKBR5BUkyrsCM6OL2ZR';`
- You can change this if needed, but it should already be correct

### Step 4: Save the Script
1. Click the **💾 Save** button (top left) or press `Ctrl+S`
2. Give your project a name (e.g., "Image Upload to Drive")
3. Click **"OK"**

### Step 5: Deploy as Web App
1. Click **"Deploy"** button (top right)
2. Click **"New deployment"**
3. Click the **⚙️ gear icon** next to "Select type"
4. Choose **"Web app"** from the dropdown

### Step 6: Configure Deployment
In the deployment dialog, set:
- **Description**: "Image Upload to Drive" (or any name)
- **Execute as**: Select **"Me"** (your email)
- **Who has access**: Select **"Anyone"** (this allows the form to upload without requiring users to sign in)

### Step 7: Deploy
1. Click **"Deploy"** button
2. **IMPORTANT**: Click **"Authorize access"** when prompted
3. You'll see a warning - click **"Advanced"** → **"Go to [Project Name] (unsafe)"**
4. Select your Google account
5. Click **"Allow"** to grant permissions
6. Copy the **Web App URL** that appears (it looks like: `https://script.google.com/macros/s/.../exec`)

### Step 8: Update Your HTML File
1. Open `info-taker.html` in a text editor
2. Find this section (around line 840):
   ```javascript
   const CONFIG = {
       GOOGLE_APPS_SCRIPT_URL: "YOUR_GOOGLE_APPS_SCRIPT_URL",
       GOOGLE_DRIVE_FOLDER_ID: "1ElU-xfvFtMspvjKBR5BUkyrsCM6OL2ZR"
   };
   ```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL` with the Web App URL you copied
4. Example:
   ```javascript
   const CONFIG = {
       GOOGLE_APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycby.../exec",
       GOOGLE_DRIVE_FOLDER_ID: "1ElU-xfvFtMspvjKBR5BUkyrsCM6OL2ZR"
   };
   ```
5. Save the file

---

## Testing

1. Open `info-taker.html` in your browser
2. Fill out the form up to Step 5 (Content & Images)
3. Select **"Upload My Own Images"** or **"Mix of Both"**
4. Click the upload area and select an image
5. Wait for the upload to complete (you'll see "✓ Uploaded to Drive")
6. Go to your Google Drive folder: https://drive.google.com/drive/folders/1ElU-xfvFtMspvjKBR5BUkyrsCM6OL2ZR
7. You should see:
   - A folder with the client's business name
   - Inside that, a folder with today's date (YYYY-MM-DD)
   - Inside that, your uploaded image

---

## How It Works

- Images are organized by:
  - **Client Name** (business name from the form)
  - **Date** (YYYY-MM-DD format)
  - Individual image files

Example structure in Google Drive:
```
📁 Your Drive Folder (1ElU-xfvFtMspvjKBR5BUkyrsCM6OL2ZR)
  📁 Client Business Name
    📁 2024-01-15
      🖼️ image1.jpg
      🖼️ image2.png
```

---

## Troubleshooting

### Images Not Uploading

**Problem**: Status shows "✗ Failed" or "✗ Not Configured"

**Solutions**:
1. Check that `GOOGLE_APPS_SCRIPT_URL` is correctly set in `info-taker.html`
2. Verify the URL doesn't have any extra spaces or quotes
3. Make sure the Google Apps Script deployment is set to "Anyone" access
4. Check browser console (F12) for error messages

### Permission Denied Error

**Problem**: "Authorization required" or permission errors

**Solutions**:
1. Go back to script.google.com
2. Click "Deploy" → "Manage deployments"
3. Make sure "Who has access" is set to "Anyone"
4. Re-authorize if needed

### Files Not Appearing in Drive

**Problem**: Upload shows success but files aren't visible

**Solutions**:
1. Refresh your Google Drive page
2. Check the correct folder: https://drive.google.com/drive/folders/1ElU-xfvFtMspvjKBR5BUkyrsCM6OL2ZR
3. Look for folders with client names (business names from the form)
4. Check browser console for any errors

### Script Not Working

**Problem**: "Script not found" or 404 errors

**Solutions**:
1. Make sure you copied the complete Web App URL
2. The URL should end with `/exec` (not `/dev`)
3. If you edited the script, you may need to create a new deployment version

---

## File Size Limits

- Google Apps Script has a **6MB** limit per execution
- If images are too large, they won't upload
- Recommended: Keep images under **5MB** each
- The form already limits to 10MB, but Google Apps Script will fail on files over 6MB

---

## Security Notes

- The Web App URL is publicly accessible (that's required for it to work)
- However, it only allows uploading files - it doesn't expose your Drive contents
- Files are uploaded to your specific folder
- You can revoke access anytime by deleting the deployment

---

## Need Help?

If you encounter issues:
1. Check browser console (F12) for error messages
2. Verify all URLs and IDs are correct (no extra spaces)
3. Make sure the script deployment has proper permissions
4. Test with a small image first (< 1MB)

---

## Alternative: Using the Script Directly

You can also test the script directly:
1. In Google Apps Script editor, click the function dropdown
2. Select `testUpload`
3. Click the ▶️ Run button
4. Check the execution log for any errors

---

That's it! Your images will now upload directly to Google Drive! 🎉
