# EmailJS Setup Instructions

To enable email functionality for the contact form, follow these steps:

## Step 1: Sign Up for EmailJS
1. Go to https://www.emailjs.com/
2. Sign up for a free account (free tier includes 200 emails/month)

## Step 2: Create an Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Select "Gmail" (or your preferred email provider)
4. Connect your Gmail account (moshitechbuilds@gmail.com)
5. Note your **Service ID** (e.g., "service_xxxxx")

## Step 3: Create an Email Template
1. Go to "Email Templates" in EmailJS dashboard
2. Click "Create New Template"
3. Use this template:

**Template Name:** Contact Form Submission

**Subject:** New Contact Form Submission from {{from_name}}

**Content:**
```
You have received a new contact form submission:

Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}
Business Type: {{business_type}}

Message:
{{message}}

---
Reply to: {{reply_to}}
```

4. Save the template and note your **Template ID** (e.g., "template_xxxxx")

## Step 4: Get Your Public Key
1. Go to "Account" → "General" in EmailJS dashboard
2. Copy your **Public Key** (e.g., "xxxxxxxxxxxxx")

## Step 5: Update script.js
Open `script.js` and replace these values:

```javascript
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID"; // Replace with your Service ID
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID"; // Replace with your Template ID
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY"; // Replace with your Public Key
```

## Step 6: Test
1. Fill out the contact form on your website
2. Submit the form
3. Check moshitechbuilds@gmail.com for the email

## Alternative: Using Mailto (No Setup Required)
If you don't want to set up EmailJS, the form will automatically fall back to opening the user's email client with a pre-filled email. This works without any configuration but requires the user to have an email client set up.

## Troubleshooting
- Make sure all IDs are correct
- Check that your Gmail account is properly connected
- Verify the template variables match ({{from_name}}, {{from_email}}, etc.)
- Check browser console for any error messages

