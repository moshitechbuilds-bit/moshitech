# Admin Panel Password Protection

## 🔒 Password-Protected Admin Panel

The admin panel is now password-protected. **Only you** can access it.

## Current Password

**Default Password:** `moshitech2024`

**⚠️ IMPORTANT:** Change this password in `admin-panel.html`!

---

## How to Change Password

1. Open `admin-panel.html` in a text editor
2. Find this section (around line 575):
   ```javascript
   const ADMIN_PASSWORD = "moshitech2024"; // CHANGE THIS TO YOUR PASSWORD
   ```
3. Replace `"moshitech2024"` with your own password
4. Save the file

**Example:**
```javascript
const ADMIN_PASSWORD = "MySecurePassword123!"; // Your new password
```

---

## How It Works

### 🔐 Login Process:
1. When someone opens `admin-panel.html`, they see a login screen
2. Must enter the correct passcode to access
3. Once logged in, session lasts **24 hours**
4. After 24 hours, must login again

### 🛡️ Security Features:
- ✅ **Password-protected** - Only you can access
- ✅ **Session-based** - Stays logged in for 24 hours
- ✅ **Auto-logout** - Session expires after 24 hours
- ✅ **Works on all devices** - Phone, tablet, computer
- ✅ **Local sessions** - Each device has separate session

### 📱 Access from Any Device:
- Open `admin-panel.html` on your phone
- Enter password
- See all submissions
- Same on desktop - see all submissions
- **Clients CANNOT see submissions** - they don't have the password

---

## Usage

1. **Open admin-panel.html**
2. **Enter your password**
3. **Click "Login"**
4. **See all submissions** from all devices!

---

## Logout

- Click the **"🚪 Logout"** button in the top right
- Or wait 24 hours (session expires automatically)
- Or close browser and clear sessionStorage

---

## Security Notes

⚠️ **Important:**
- Password is stored in the HTML file (client-side)
- This is for basic protection - clients won't see submissions
- For stronger security, consider server-side authentication
- Keep your password safe and don't share it

✅ **Good enough for:**
- Preventing clients from accidentally seeing other submissions
- Basic access control
- Personal use

---

## Troubleshooting

### Can't Login

**Check:**
1. Is the password correct? (case-sensitive)
2. Check browser console (F12) for errors
3. Try clearing browser cache

### Session Expired

**Solution:**
- Just login again with your password
- Sessions last 24 hours

### Forgot Password

**Solution:**
1. Open `admin-panel.html` in a text editor
2. Find `ADMIN_PASSWORD = "..."` line
3. See what the password is set to
4. Or change it to a new one

---

## Change Password

To change password:
1. Edit `admin-panel.html`
2. Find: `const ADMIN_PASSWORD = "moshitech2024";`
3. Change to: `const ADMIN_PASSWORD = "YOUR_NEW_PASSWORD";`
4. Save file

**That's it!** Use your new password to login.

---

Stay secure! 🔒

