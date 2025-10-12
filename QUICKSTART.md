# Quick Start Guide

Get your Question Paper Portal up and running in 10 minutes!

## Prerequisites

- A Google account (for Firebase)
- A web browser (Chrome, Firefox, Edge, or Safari)
- Basic text editor (VS Code recommended)
- Local web server (Live Server, Python, or Node.js)

## Step-by-Step Setup

### 1. Firebase Setup (5 minutes)

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add Project"
   - Name: `question-paper-portal`
   - Disable Google Analytics (optional)
   - Click "Create Project"

2. **Enable Firestore Database**
   - Click "Firestore Database" in sidebar
   - Click "Create Database"
   - Choose "Start in production mode"
   - Select location (closest to you)
   - Click "Enable"
   
   **Set Rules:**
   - Go to "Rules" tab
   - Paste this:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /papers/{paperId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```
   - Click "Publish"

3. **Enable Storage**
   - Click "Storage" in sidebar
   - Click "Get Started"
   - Use production mode
   - Click "Done"
   
   **Set Rules:**
   - Go to "Rules" tab
   - Paste this:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /papers/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```
   - Click "Publish"

4. **Enable Authentication**
   - Click "Authentication" in sidebar
   - Click "Get Started"
   - Click "Email/Password"
   - Enable it
   - Click "Save"

5. **Create Admin User**
   - In Authentication, go to "Users" tab
   - Click "Add User"
   - Email: `rootphantom7@gmail.com`
   - Password: `#BUGGATI41`
   - Click "Add User"
   - ⚠️ **IMPORTANT:** These are your admin login credentials!

6. **Get Firebase Config**
   - Click gear icon (⚙️) → Project Settings
   - Scroll to "Your apps"
   - Click Web icon (</>)
   - Register app: `Question Paper Portal`
   - Copy the `firebaseConfig` object

### 2. Configure Application (2 minutes)

1. **Update Firebase Config**
   - Open `js/firebase-config.js`
   - Replace the placeholder values:
   ```javascript
   const firebaseConfig = {
       apiKey: "PASTE_YOUR_API_KEY",
       authDomain: "PASTE_YOUR_AUTH_DOMAIN",
       projectId: "PASTE_YOUR_PROJECT_ID",
       storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
       messagingSenderId: "PASTE_YOUR_SENDER_ID",
       appId: "PASTE_YOUR_APP_ID"
   };
   ```
   - Save the file

### 3. Run the Application (1 minute)

**Choose one method:**

**Option A: VS Code Live Server (Easiest)**
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Click "Open with Live Server"
4. Browser opens automatically

**Option B: Python**
```bash
cd board
python -m http.server 8000
```
Then open: http://localhost:8000

**Option C: Node.js**
```bash
cd board
npx http-server
```

### 4. Test the Application (2 minutes)

1. **Visit Homepage**
   - Should see the landing page
   - All boards should show "0 Papers"

2. **Login as Admin**
   - Click "Admin" in navigation
   - Enter your admin credentials
   - Should redirect to dashboard

3. **Upload a Test Paper**
   - Select a board (e.g., CBSE)
   - Select a year (e.g., 2024)
   - Enter subject (e.g., Mathematics)
   - Enter title (e.g., "CBSE Math 2024")
   - Choose a PDF file
   - Click "Upload Paper"
   - Wait for "Upload successful!"

4. **View the Paper**
   - Go to "Browse Papers"
   - Should see your uploaded paper
   - Try downloading it

## Common Issues & Solutions

### Firebase not loading
- Check internet connection
- Verify Firebase SDK scripts are in HTML files
- Check browser console for errors

### Can't login
- Verify email/password in Firebase Console
- Check if Authentication is enabled
- Clear browser cache

### Upload fails
- Check file size (< 10MB)
- Ensure PDF format
- Verify Storage rules are correct
- Check if logged in as admin

### Papers not showing
- Verify Firestore rules allow public read
- Check if upload was successful in Firebase Console
- Refresh the page

## Next Steps

✅ Your portal is ready!

**For Students:**
- Share the URL with students
- They can browse and download papers
- No login required for students

**For Admins:**
- Keep uploading papers
- Organize by board, year, and subject
- Use clear, descriptive titles

**Customization:**
- Edit colors in `css/main.css`
- Add more boards if needed
- Customize text and images

## Tips

1. **Organize Papers:** Use consistent naming:
   - "CBSE Mathematics 2024 Annual Exam"
   - "ICSE Physics 2023 Board Exam"

2. **PDF Size:** Compress large PDFs before upload
   - Use online tools like Smallpdf
   - Keep files under 5MB for faster loading

3. **Backup:** Firebase handles backups, but keep local copies

4. **Security:** 
   - Never share admin credentials
   - Use strong passwords
   - Change password regularly

5. **Performance:**
   - Compress images if you add any
   - Keep Firebase storage organized
   - Monitor Firebase usage limits

## Getting Help

If you're stuck:
1. Check the full README.md
2. Review Firebase Console logs
3. Check browser developer console (F12)
4. Verify all setup steps completed

## Congratulations! 🎉

Your Question Paper Portal is live and ready to help students!

---

**Quick Links:**
- Firebase Console: https://console.firebase.google.com/
- Firebase Docs: https://firebase.google.com/docs
- Browser Console: Press F12

