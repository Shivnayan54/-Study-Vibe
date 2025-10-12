# Firebase Setup Guide

Complete guide for setting up Firebase for Question Paper Portal.

## Table of Contents
1. [Create Firebase Project](#create-firebase-project)
2. [Firestore Database Setup](#firestore-database-setup)
3. [Storage Setup](#storage-setup)
4. [Authentication Setup](#authentication-setup)
5. [Get Configuration](#get-configuration)
6. [Security Rules](#security-rules)

---

## Create Firebase Project

1. **Go to Firebase Console**
   ```
   https://console.firebase.google.com/
   ```

2. **Create New Project**
   - Click "Add Project"
   - Project Name: `question-paper-portal` (or your choice)
   - Click "Continue"

3. **Google Analytics (Optional)**
   - You can enable or disable
   - If enabling, select or create Analytics account
   - Click "Create Project"

4. **Wait for Setup**
   - Takes 30-60 seconds
   - Click "Continue" when ready

---

## Firestore Database Setup

### Enable Firestore

1. **Navigate to Firestore**
   - In left sidebar, click "Firestore Database"
   - Click "Create Database"

2. **Choose Mode**
   - Select "Start in production mode"
   - Click "Next"

3. **Select Location**
   - Choose closest to your users:
     - `asia-south1` (Mumbai) - For India
     - `us-central1` - For US
     - `europe-west1` - For Europe
   - Click "Enable"

### Configure Security Rules

1. **Go to Rules Tab**
   - In Firestore, click "Rules" tab

2. **Paste Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Papers collection - read public, write authenticated
       match /papers/{paperId} {
         allow read: if true;
         allow write, update, delete: if request.auth != null;
       }
       
       // Future: Add more collections here if needed
     }
   }
   ```

3. **Publish Rules**
   - Click "Publish"
   - Rules active immediately

### Create Indexes (Optional)

If you plan to query by multiple fields:

1. **Go to Indexes Tab**
2. **Create Composite Index:**
   - Collection: `papers`
   - Fields: `board` (Ascending), `year` (Descending), `uploadDate` (Descending)
   - Click "Create"

---

## Storage Setup

### Enable Storage

1. **Navigate to Storage**
   - In left sidebar, click "Storage"
   - Click "Get Started"

2. **Security Rules**
   - Choose "Start in production mode"
   - Click "Next"

3. **Select Location**
   - Use same location as Firestore
   - Click "Done"

### Configure Security Rules

1. **Go to Rules Tab**

2. **Paste Security Rules**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Papers folder - read public, write authenticated
       match /papers/{allPaths=**} {
         allow read: if true;
         allow write, delete: if request.auth != null 
                              && request.resource.size < 10 * 1024 * 1024  // 10MB limit
                              && request.resource.contentType == 'application/pdf';
       }
     }
   }
   ```

3. **Publish Rules**
   - Click "Publish"

---

## Authentication Setup

### Enable Email/Password Auth

1. **Navigate to Authentication**
   - In left sidebar, click "Authentication"
   - Click "Get Started"

2. **Enable Sign-in Method**
   - Go to "Sign-in method" tab
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"

### Create Admin User

1. **Go to Users Tab**
   - Click "Users" tab
   - Click "Add User"

2. **Enter Credentials**
   ```
   Email: rootphantom7@gmail.com
   Password: #BUGGATI41
   ```
   - Click "Add User"

3. **Save Credentials Securely**
   - Email: rootphantom7@gmail.com
   - Password: #BUGGATI41
   - These are your admin login credentials!

### Optional: Add More Admins

Repeat the "Create Admin User" steps for additional administrators.

---

## Get Configuration

### Get Firebase Config Object

1. **Project Settings**
   - Click gear icon (⚙️) next to "Project Overview"
   - Select "Project Settings"

2. **Register Web App**
   - Scroll to "Your apps" section
   - Click Web icon `</>`
   - App nickname: `Question Paper Portal`
   - Don't check "Firebase Hosting"
   - Click "Register App"

3. **Copy Config**
   - You'll see a `firebaseConfig` object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-app.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

4. **Save Configuration**
   - Copy this entire object
   - You'll paste it in `js/firebase-config.js`

### Update Application Config

1. **Open File**
   - Open `js/firebase-config.js` in text editor

2. **Replace Placeholders**
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

3. **Save File**

---

## Security Rules

### Firestore Rules Explained

```javascript
// Allow anyone to read papers
allow read: if true;

// Only authenticated users (admins) can write
allow write: if request.auth != null;
```

### Storage Rules Explained

```javascript
// Anyone can read/download papers
allow read: if true;

// Only authenticated admins can upload
// Must be PDF and under 10MB
allow write: if request.auth != null 
          && request.resource.size < 10 * 1024 * 1024
          && request.resource.contentType == 'application/pdf';
```

### Security Best Practices

1. **Keep Admin Credentials Secret**
   - Never commit to public repos
   - Use strong passwords
   - Change regularly

2. **Monitor Usage**
   - Check Firebase Console regularly
   - Set up billing alerts
   - Review authentication logs

3. **Backup Data**
   - Export Firestore data regularly
   - Keep local copies of PDFs
   - Use Firebase backup features

4. **Production Rules**
   - Test rules before deploying
   - Use Firebase Emulator for testing
   - Monitor security alerts

---

## Testing Your Setup

### 1. Test Firestore
```javascript
// Should work (read)
db.collection('papers').get()

// Should fail if not authenticated (write)
db.collection('papers').add({test: true})
```

### 2. Test Storage
- Try uploading as guest → Should fail
- Login as admin → Should work

### 3. Test Authentication
- Try logging in with admin credentials
- Should redirect to dashboard

---

## Troubleshooting

### Firestore Permission Denied
**Issue:** Can't read papers
**Solution:** 
- Check Firestore rules allow public read
- Verify `allow read: if true;` is present
- Publish rules again

### Storage Upload Fails
**Issue:** Can't upload files
**Solution:**
- Ensure you're logged in as admin
- Check file size < 10MB
- Verify file is PDF format
- Check Storage rules

### Authentication Error
**Issue:** Can't login
**Solution:**
- Verify Email/Password is enabled
- Check credentials are correct
- Clear browser cache
- Check browser console for errors

### API Key Errors
**Issue:** Firebase not connecting
**Solution:**
- Verify config values are correct
- Check for typos in firebase-config.js
- Ensure Firebase SDK scripts are loaded
- Check browser console

---

## Firebase Limits (Free Tier)

**Firestore:**
- 1 GB storage
- 50,000 reads/day
- 20,000 writes/day

**Storage:**
- 5 GB stored
- 1 GB/day downloaded
- 50,000 operations/day

**Authentication:**
- Unlimited users

**Tips to Stay Within Limits:**
- Compress PDFs before upload
- Monitor usage in Firebase Console
- Set up budget alerts
- Consider upgrading for high traffic

---

## Next Steps

✅ Firebase setup complete!

Now you can:
1. Run the application locally
2. Login as admin
3. Upload test papers
4. Share with students

For deploying to production, see README.md section on Firebase Hosting.

---

## Useful Links

- Firebase Console: https://console.firebase.google.com/
- Firebase Documentation: https://firebase.google.com/docs
- Firestore Rules Reference: https://firebase.google.com/docs/firestore/security/rules-conditions
- Storage Rules Reference: https://firebase.google.com/docs/storage/security
- Pricing Calculator: https://firebase.google.com/pricing

---

**Questions?** Check README.md or Firebase documentation.

