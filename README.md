# Question Paper Portal

A student-friendly web application for browsing and downloading previous year question papers from various Indian educational boards (CBSE, ICSE, UP Board, Bihar Board).

## Features

### For Students
- 📚 Browse question papers by board, year, and subject
- 🔍 Powerful search functionality with suggestions
- 📥 Free download of all question papers
- 👁️ Preview papers before downloading
- 📱 Fully responsive design for mobile and desktop
- 🎨 Modern, clean, and intuitive interface

### For Administrators
- 🔐 Secure admin authentication
- 📤 Upload new question papers with metadata
- ✏️ Edit existing paper details
- 🗑️ Delete outdated papers
- 📊 View upload statistics and analytics
- 💾 Automatic file organization and storage

## Technology Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Backend:** Firebase
  - Authentication (Admin login)
  - Firestore (Database for paper metadata)
  - Storage (PDF file storage)

## Project Structure

```
board/
├── index.html              # Landing page
├── browse.html             # Browse papers page
├── search.html             # Search page
├── admin-login.html        # Admin login page
├── admin.html              # Admin dashboard
├── css/
│   ├── main.css           # Global styles
│   ├── animations.css     # Animation effects
│   └── responsive.css     # Responsive design
├── js/
│   ├── firebase-config.js # Firebase configuration
│   ├── main.js           # Landing page logic
│   ├── browse.js         # Browse page logic
│   ├── search.js         # Search functionality
│   ├── auth.js           # Admin authentication
│   └── admin.js          # Admin dashboard logic
└── README.md             # This file
```

## Setup Instructions

### 1. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "question-paper-portal")
4. Follow the setup wizard

#### Enable Firebase Services

**Firestore Database:**
1. In Firebase Console, go to "Firestore Database"
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select a location closest to your users
5. Set up the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to papers
    match /papers/{paperId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Firebase Storage:**
1. Go to "Storage" in Firebase Console
2. Click "Get Started"
3. Start in production mode
4. Set up the following security rules:

```javascript
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

**Firebase Authentication:**
1. Go to "Authentication" in Firebase Console
2. Click "Get Started"
3. Enable "Email/Password" sign-in method
4. Create admin user:
   - Click "Add User"
   - Email: rootphantom7@gmail.com
   - Password: #BUGGATI41
   - Click "Add User"
   - Save credentials securely

#### Get Firebase Config

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Web" icon (</>)
4. Register your app (give it a nickname)
5. Copy the Firebase configuration object

### 2. Configure the Application

1. Open `js/firebase-config.js`
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Add Firebase SDKs

Add the following script tags to **all HTML files** (just before the closing `</body>` tag, but before your custom scripts):

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>

<!-- Firebase Configuration -->
<script src="js/firebase-config.js"></script>
```

### 4. Run the Application

#### Option 1: Using Live Server (Recommended)
1. Install a local web server (e.g., Live Server for VS Code)
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option 2: Using Python
```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

#### Option 3: Using Node.js
```bash
npx http-server
```

## Usage Guide

### For Students

#### Browse Papers
1. Visit the homepage
2. Click on your board (CBSE, ICSE, UP Board, Bihar Board)
3. Use filters to narrow down by year and subject
4. Click "View" to preview or "Download" to save the paper

#### Search Papers
1. Go to the Search page
2. Enter keywords (board, year, subject, or any text)
3. Get instant suggestions as you type
4. View results and download papers

### For Administrators

#### Login
1. Go to Admin Login page
2. Enter your admin email and password
3. Click "Login"

#### Upload Papers
1. Navigate to "Upload Papers" tab
2. Select board, year, and subject
3. Enter paper title
4. Choose PDF file (max 10MB)
5. Click "Upload Paper"
6. Wait for upload to complete

#### Manage Papers
1. Go to "Manage Papers" tab
2. Search or filter papers
3. Click "Edit" to modify paper details
4. Click "Delete" to remove a paper

#### Logout
Click "Logout" in the navigation menu

## Firestore Data Structure

### Papers Collection

```javascript
{
  board: "CBSE",           // Board name
  year: "2024",            // Exam year
  subject: "Mathematics",  // Subject name
  title: "CBSE Mathematics 2024 Annual Exam",  // Paper title
  fileUrl: "https://...",  // Firebase Storage URL
  uploadDate: Timestamp    // Auto-generated timestamp
}
```

## Storage Structure

```
/papers/
  ├── CBSE/
  │   ├── 2024/
  │   │   └── 1234567890_mathematics.pdf
  │   └── 2023/
  ├── ICSE/
  ├── UP Board/
  └── Bihar Board/
```

## Customization

### Colors
Edit CSS variables in `css/main.css`:

```css
:root {
    --primary-color: #4f46e5;
    --secondary-color: #10b981;
    --accent-color: #f59e0b;
    /* Modify as needed */
}
```

### Boards
To add/remove boards, edit:
1. `index.html` - Add/remove board cards
2. `browse.html` - Update board filter options
3. `admin.html` - Update board dropdown

### Year Range
Edit in `js/admin.js`:

```javascript
function populateYearDropdown() {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
        // Change starting year as needed
    }
}
```

## Troubleshooting

### Firebase not connecting
- Check if Firebase scripts are loaded in HTML
- Verify Firebase config values in `firebase-config.js`
- Check browser console for errors
- Ensure internet connection is active

### Upload failing
- Check file size (must be < 10MB)
- Verify Storage rules allow authenticated writes
- Ensure admin is logged in
- Check Firebase Storage quota

### Papers not displaying
- Verify Firestore rules allow public read
- Check if papers collection exists
- Open browser console for error messages
- Ensure papers have all required fields

### Admin login not working
- Verify Authentication is enabled
- Check if admin user exists in Firebase Console
- Ensure correct email/password
- Check for error messages in browser console

## Security Considerations

1. **Admin Access:** Only authorized users should have admin credentials
2. **Firestore Rules:** Set up proper security rules for production
3. **File Validation:** Only PDF files are accepted for upload
4. **Size Limits:** 10MB file size limit prevents abuse
5. **Authentication:** Admin panel requires login

## Performance Tips

1. **Lazy Loading:** Images and content load as needed
2. **Caching:** Browser caches CSS and JS files
3. **Compression:** Consider compressing PDF files before upload
4. **CDN:** Firebase Storage serves files through CDN
5. **Pagination:** Consider adding pagination for large datasets

## Future Enhancements

- [ ] Add user accounts for students
- [ ] Implement favorites/bookmarks
- [ ] Add paper categories (Mid-term, Annual, etc.)
- [ ] Email notifications for new uploads
- [ ] Analytics dashboard for admin
- [ ] Bulk upload functionality
- [ ] PDF preview in modal
- [ ] Share functionality
- [ ] Print-friendly view
- [ ] Multi-language support

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Firebase Console logs
3. Check browser console for errors
4. Verify all setup steps are completed

## License

This project is free to use and modify for educational purposes.

## Credits

Built with:
- Firebase (Backend services)
- Vanilla JavaScript (No frameworks!)
- Modern CSS (Flexbox, Grid, Custom Properties)
- Love for education ❤️

---

**Note:** This application requires an active internet connection for Firebase services to work properly.

