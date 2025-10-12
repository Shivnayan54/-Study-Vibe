// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDKmhfSaock8P7y9HwcGo4dzouXu7WPBCc",
    authDomain: "exam-aa7f9.firebaseapp.com",
    projectId: "exam-aa7f9",
    storageBucket: "exam-aa7f9.firebasestorage.app",
    messagingSenderId: "972006341363",
    appId: "1:972006341363:web:0aee9c0a9b80500b6c9586",
    measurementId: "G-1LEPW76JSJ"
};

// Initialize Firebase
let app, auth, db, storage;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
}

// Export for use in other modules
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;

