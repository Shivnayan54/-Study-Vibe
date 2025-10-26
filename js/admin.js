// Admin dashboard JavaScript

let currentUser = null;
let allPapers = [];
let allPYQS = [];

// Google Drive utility functions
function convertGDriveLink(url) {
    // Handle different Google Drive URL formats
    let fileId = null;
    
    // Format 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    if (url.includes('/file/d/')) {
        const match = url.match(/\/file\/d\/([^\/]+)/);
        if (match) fileId = match[1];
    }
    
    // Format 2: https://drive.google.com/open?id=FILE_ID
    if (url.includes('open?id=')) {
        const match = url.match(/open\?id=([^&]+)/);
        if (match) fileId = match[1];
    }
    
    // Format 3: Already a direct link
    if (url.includes('drive.google.com/uc?')) {
        return url;
    }
    
    if (fileId) {
        // Convert to direct download link
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    
    return null;
}

// Toggle upload method for regular papers
function toggleUploadMethod(method) {
    const fileSection = document.getElementById('fileUploadSection');
    const gdriveSection = document.getElementById('gdriveLinkSection');
    const pdfFileInput = document.getElementById('pdfFile');
    const gdriveLinkInput = document.getElementById('gdriveLink');
    
    if (method === 'file') {
        fileSection.style.display = 'block';
        gdriveSection.style.display = 'none';
        pdfFileInput.required = true;
        gdriveLinkInput.required = false;
        gdriveLinkInput.value = '';
    } else {
        fileSection.style.display = 'none';
        gdriveSection.style.display = 'block';
        pdfFileInput.required = false;
        gdriveLinkInput.required = true;
        pdfFileInput.value = '';
    }
}

// Toggle upload method for PYQS
function togglePyqsUploadMethod(method) {
    const fileSection = document.getElementById('pyqsFileUploadSection');
    const gdriveSection = document.getElementById('pyqsGdriveLinkSection');
    const pdfFileInput = document.getElementById('pyqsPdfFile');
    const gdriveLinkInput = document.getElementById('pyqsGdriveLink');
    
    if (method === 'file') {
        fileSection.style.display = 'block';
        gdriveSection.style.display = 'none';
        pdfFileInput.required = true;
        gdriveLinkInput.required = false;
        gdriveLinkInput.value = '';
    } else {
        fileSection.style.display = 'none';
        gdriveSection.style.display = 'block';
        pdfFileInput.required = false;
        gdriveLinkInput.required = true;
        pdfFileInput.value = '';
    }
}

// Make functions globally accessible
window.toggleUploadMethod = toggleUploadMethod;
window.togglePyqsUploadMethod = togglePyqsUploadMethod;

// Check authentication
function checkAuth() {
    const auth = window.firebaseAuth;
    
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            // Display user email
            const userEmailElement = document.getElementById('userEmail');
            if (userEmailElement) {
                userEmailElement.textContent = user.email;
            }
            loadAdminData();
        } else {
            // Not logged in, redirect to login page
            window.location.href = 'admin-login.html';
        }
    });
}

// Load admin data
async function loadAdminData() {
    await loadStatistics();
    await loadManagePapers();
}

// Load statistics
async function loadStatistics() {
    try {
        const db = window.firebaseDB;
        const papersRef = db.collection('papers');
        const snapshot = await papersRef.get();
        
        const papers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Total papers
        document.getElementById('totalPapersAdmin').textContent = papers.length;
        
        // Recent uploads (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentPapers = papers.filter(paper => {
            const uploadDate = paper.uploadDate.toDate();
            return uploadDate >= thirtyDaysAgo;
        });
        
        document.getElementById('recentUploads').textContent = recentPapers.length;
        
        // Load visitor count
        await loadVisitorCount();
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load visitor count
async function loadVisitorCount() {
    try {
        const db = window.firebaseDB;
        const analyticsRef = db.collection('analytics').doc('visitors');
        const doc = await analyticsRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            const totalVisitors = data.totalVisits || 0;
            console.log('Visitor count loaded:', totalVisitors);
            document.getElementById('totalVisitors').textContent = totalVisitors.toLocaleString();
        } else {
            // Document doesn't exist yet, create it with 0 visits
            console.log('Creating new visitor analytics document');
            await analyticsRef.set({
                totalVisits: 0,
                lastUpdated: window.firebase.firestore.FieldValue.serverTimestamp()
            });
            document.getElementById('totalVisitors').textContent = '0';
        }
    } catch (error) {
        console.error('Error loading visitor count:', error);
        document.getElementById('totalVisitors').textContent = 'Error';
    }
}

// Populate year dropdown
function populateYearDropdown() {
    const yearSelect = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear; year >= 2015; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Populate PYQS year dropdown
function populatePYQSYearDropdown() {
    const yearSelect = document.getElementById('pyqsYear');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear; year >= 2015; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Handle file upload form
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('Upload form submitted');
    
    const board = document.getElementById('board').value;
    const classValue = document.getElementById('class').value;
    const year = document.getElementById('year').value;
    const subject = document.getElementById('subject').value;
    const title = document.getElementById('title').value;
    const uploadMethod = document.querySelector('input[name="uploadMethod"]:checked').value;
    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];
    const gdriveLink = document.getElementById('gdriveLink').value;
    
    console.log('Form values:', { board, class: classValue, year, subject, title, uploadMethod, file, gdriveLink });
    
    if (!board) {
        showMessage('Please select a board', 'error');
        return;
    }
    
    if (!classValue) {
        showMessage('Please select a class', 'error');
        return;
    }
    
    if (!year) {
        showMessage('Please select a year', 'error');
        return;
    }
    
    if (!subject) {
        showMessage('Please enter a subject', 'error');
        return;
    }
    
    if (!title) {
        showMessage('Please enter a paper title', 'error');
        return;
    }
    
    // Check upload method
    if (uploadMethod === 'file') {
        if (!file) {
            showMessage('Please select a PDF file', 'error');
            return;
        }
        
        if (file.type !== 'application/pdf') {
            showMessage('Please select a PDF file only', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            showMessage('File size must be less than 10MB', 'error');
            return;
        }
    } else {
        if (!gdriveLink) {
            showMessage('Please enter a Google Drive link', 'error');
            return;
        }
        
        if (!gdriveLink.includes('drive.google.com')) {
            showMessage('Please enter a valid Google Drive link', 'error');
            return;
        }
    }
    
    console.log('All validations passed, starting upload...');
    
    // Disable upload button
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = uploadMethod === 'file' ? 'Uploading...' : 'Saving...';
    
    try {
        const db = window.firebaseDB;
        
        console.log('Firebase DB:', db);
        
        if (!db) {
            showMessage('Firebase Database not initialized. Please refresh the page.', 'error');
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload Paper';
            return;
        }
        
        let downloadURL = null;
        
        // Handle Google Drive Link
        if (uploadMethod === 'gdrive') {
            console.log('Processing Google Drive link...');
            downloadURL = convertGDriveLink(gdriveLink);
            
            if (!downloadURL) {
                showMessage('Invalid Google Drive link format', 'error');
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Upload Paper';
                return;
            }
            
            console.log('Converted Google Drive URL:', downloadURL);
            
            // Save metadata to Firestore
            const docRef = await db.collection('papers').add({
                board: board,
                class: classValue,
                year: year,
                subject: subject,
                title: title,
                fileUrl: downloadURL,
                uploadDate: new Date(),
                source: 'gdrive'
            });
            
            console.log('Paper saved to Firestore with ID:', docRef.id);
            showMessage('Paper linked successfully!', 'success');
            
            // Reset form
            document.getElementById('uploadForm').reset();
            
            // Reload statistics
            await loadStatistics();
            
            // Re-enable button
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload Paper';
        } 
        // Handle File Upload
        else {
            const storage = window.firebaseStorage;
            
            if (!storage) {
                showMessage('Firebase Storage not initialized. Please refresh the page.', 'error');
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Upload Paper';
                return;
            }
            
            // Create file path
            const filePath = `papers/${board}/class${classValue}/${year}/${Date.now()}_${file.name}`;
            console.log('Upload path:', filePath);
            
            const storageRef = storage.ref(filePath);
            console.log('Storage reference created');
            
            // Upload file
            const uploadTask = storageRef.put(file);
            console.log('Upload task started');
            
            // Show progress
            document.getElementById('uploadProgress').style.display = 'block';
            
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload progress:', Math.round(progress) + '%');
                    document.getElementById('progressFill').style.width = progress + '%';
                    document.getElementById('progressText').textContent = Math.round(progress) + '%';
                },
                (error) => {
                    console.error('Upload error:', error);
                    console.error('Error code:', error.code);
                    console.error('Error message:', error.message);
                    showMessage('Upload failed: ' + error.message, 'error');
                    document.getElementById('uploadProgress').style.display = 'none';
                    uploadBtn.disabled = false;
                    uploadBtn.textContent = 'Upload Paper';
                },
                async () => {
                    try {
                        console.log('Upload completed, getting download URL...');
                        // Upload completed
                        downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        console.log('Download URL:', downloadURL);
                        
                        console.log('Saving to Firestore...');
                        // Save metadata to Firestore
                        const docRef = await db.collection('papers').add({
                            board: board,
                            class: classValue,
                            year: year,
                            subject: subject,
                            title: title,
                            fileUrl: downloadURL,
                            uploadDate: new Date(),
                            source: 'firebase'
                        });
                        
                        console.log('Paper saved to Firestore with ID:', docRef.id);
                        showMessage('Paper uploaded successfully!', 'success');
                        
                        // Reset form
                        document.getElementById('uploadForm').reset();
                        document.getElementById('uploadProgress').style.display = 'none';
                        
                        // Reload statistics
                        await loadStatistics();
                        
                        // Re-enable button
                        uploadBtn.disabled = false;
                        uploadBtn.textContent = 'Upload Paper';
                    } catch (completionError) {
                        console.error('Error in completion handler:', completionError);
                        showMessage('Upload completed but failed to save metadata: ' + completionError.message, 'error');
                        document.getElementById('uploadProgress').style.display = 'none';
                        uploadBtn.disabled = false;
                        uploadBtn.textContent = 'Upload Paper';
                    }
                }
            );
        }
    } catch (error) {
        console.error('Error uploading paper:', error);
        console.error('Error details:', error.message, error.code);
        showMessage('Upload failed: ' + error.message, 'error');
        document.getElementById('uploadProgress').style.display = 'none';
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload Paper';
    }
});

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('uploadMessage');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Switch tabs
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'manage') {
        loadManagePapers();
    } else if (tabName === 'pyqsManage') {
        loadManagePYQS();
    }
}

// Load papers for management
async function loadManagePapers() {
    try {
        const db = window.firebaseDB;
        const papersRef = db.collection('papers');
        const snapshot = await papersRef.orderBy('uploadDate', 'desc').get();
        
        allPapers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        displayManagePapers(allPapers);
    } catch (error) {
        console.error('Error loading papers:', error);
    }
}

// Display papers in management grid
function displayManagePapers(papers) {
    const managePapersGrid = document.getElementById('managePapersGrid');
    const noManagePapers = document.getElementById('noManagePapers');
    
    if (papers.length === 0) {
        managePapersGrid.innerHTML = '';
        noManagePapers.style.display = 'block';
        return;
    }
    
    noManagePapers.style.display = 'none';
    
    managePapersGrid.innerHTML = papers.map(paper => `
        <div class="manage-paper-item">
            <div class="manage-paper-info">
                <div class="manage-paper-title">${paper.title}</div>
                <div class="manage-paper-meta">
                    ${paper.board} • Class ${paper.class || 'N/A'} • ${paper.year} • ${paper.subject}
                </div>
            </div>
            <div class="manage-paper-actions">
                <button class="btn-edit" onclick="editPaper('${paper.id}')">
                    ✏️ Edit
                </button>
                <button class="btn-delete" onclick="deletePaper('${paper.id}', '${paper.title}')">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Filter manage papers
document.getElementById('manageSearch')?.addEventListener('input', filterManagePapers);
document.getElementById('manageBoardFilter')?.addEventListener('change', filterManagePapers);

function filterManagePapers() {
    const searchTerm = document.getElementById('manageSearch').value.toLowerCase();
    const boardFilter = document.getElementById('manageBoardFilter').value;
    
    const filtered = allPapers.filter(paper => {
        const matchesSearch = !searchTerm || 
            paper.title.toLowerCase().includes(searchTerm) ||
            paper.subject.toLowerCase().includes(searchTerm) ||
            paper.year.toString().includes(searchTerm);
        
        const matchesBoard = !boardFilter || paper.board === boardFilter;
        
        return matchesSearch && matchesBoard;
    });
    
    displayManagePapers(filtered);
}

// Edit paper
function editPaper(paperId) {
    const paper = allPapers.find(p => p.id === paperId);
    if (!paper) return;
    
    // Fill edit form
    document.getElementById('editPaperId').value = paper.id;
    document.getElementById('editBoard').value = paper.board;
    document.getElementById('editClass').value = paper.class || '10';
    document.getElementById('editYear').value = paper.year;
    document.getElementById('editSubject').value = paper.subject;
    document.getElementById('editTitle').value = paper.title;
    
    // Show modal
    document.getElementById('editModal').classList.add('show');
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
}

// Handle edit form submission
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const paperId = document.getElementById('editPaperId').value;
    const board = document.getElementById('editBoard').value;
    const classValue = document.getElementById('editClass').value;
    const year = document.getElementById('editYear').value;
    const subject = document.getElementById('editSubject').value;
    const title = document.getElementById('editTitle').value;
    
    try {
        const db = window.firebaseDB;
        await db.collection('papers').doc(paperId).update({
            board: board,
            class: classValue,
            year: year,
            subject: subject,
            title: title
        });
        
        closeEditModal();
        loadManagePapers();
        showMessage('Paper updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating paper:', error);
        alert('Failed to update paper. Please try again.');
    }
});

// Delete paper
async function deletePaper(paperId, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
        return;
    }
    
    try {
        const db = window.firebaseDB;
        const storage = window.firebaseStorage;
        
        // Get paper data
        const paper = allPapers.find(p => p.id === paperId);
        
        if (!paper) {
            showMessage('Paper not found!', 'error');
            return;
        }
        
        // Delete from Storage only if it's a Firebase Storage file
        if (paper.fileUrl && paper.source === 'firebase') {
            try {
                const fileRef = storage.refFromURL(paper.fileUrl);
                await fileRef.delete();
                console.log('File deleted from storage');
            } catch (storageError) {
                console.error('Error deleting from storage:', storageError);
                // Continue with Firestore deletion even if storage deletion fails
            }
        }
        
        // Delete from Firestore
        await db.collection('papers').doc(paperId).delete();
        console.log('Paper deleted from Firestore');
        
        loadManagePapers();
        loadStatistics();
        showMessage('Paper deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting paper:', error);
        showMessage('Failed to delete paper: ' + error.message, 'error');
    }
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    if (confirm('Are you sure you want to logout?')) {
        try {
            await window.firebaseAuth.signOut();
            window.location.href = 'admin-login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
});

// ===================== PYQS FUNCTIONALITY =====================

// Handle PYQS file upload form
document.getElementById('pyqsUploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('PYQS Upload form submitted');
    
    const board = document.getElementById('pyqsBoard').value;
    const classValue = document.getElementById('pyqsClass').value;
    const year = document.getElementById('pyqsYear').value;
    const subject = document.getElementById('pyqsSubject').value;
    const title = document.getElementById('pyqsTitle').value;
    const uploadMethod = document.querySelector('input[name="pyqsUploadMethod"]:checked').value;
    const fileInput = document.getElementById('pyqsPdfFile');
    const file = fileInput.files[0];
    const gdriveLink = document.getElementById('pyqsGdriveLink').value;
    
    console.log('Form values:', { board, class: classValue, year, subject, title, uploadMethod, file, gdriveLink });
    
    if (!board || !classValue || !year || !subject || !title) {
        showPYQSMessage('Please fill all required fields', 'error');
        return;
    }
    
    // Check upload method
    if (uploadMethod === 'file') {
        if (!file) {
            showPYQSMessage('Please select a PDF file', 'error');
            return;
        }
        
        if (file.type !== 'application/pdf') {
            showPYQSMessage('Please select a PDF file only', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            showPYQSMessage('File size must be less than 10MB', 'error');
            return;
        }
    } else {
        if (!gdriveLink) {
            showPYQSMessage('Please enter a Google Drive link', 'error');
            return;
        }
        
        if (!gdriveLink.includes('drive.google.com')) {
            showPYQSMessage('Please enter a valid Google Drive link', 'error');
            return;
        }
    }
    
    console.log('All validations passed, starting upload...');
    
    // Disable upload button
    const uploadBtn = document.getElementById('pyqsUploadBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = uploadMethod === 'file' ? 'Uploading...' : 'Saving...';
    
    try {
        const db = window.firebaseDB;
        
        if (!db) {
            showPYQSMessage('Firebase not initialized. Please refresh the page.', 'error');
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload PYQS';
            return;
        }
        
        let downloadURL = null;
        
        // Handle Google Drive Link
        if (uploadMethod === 'gdrive') {
            console.log('Processing Google Drive link...');
            downloadURL = convertGDriveLink(gdriveLink);
            
            if (!downloadURL) {
                showPYQSMessage('Invalid Google Drive link format', 'error');
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Upload PYQS';
                return;
            }
            
            console.log('Converted Google Drive URL:', downloadURL);
            
            // Save metadata to Firestore
            const docRef = await db.collection('pyqs').add({
                board: board,
                class: classValue,
                year: year,
                subject: subject,
                title: title,
                fileUrl: downloadURL,
                uploadDate: new Date(),
                source: 'gdrive'
            });
            
            console.log('PYQS saved to Firestore with ID:', docRef.id);
            showPYQSMessage('PYQS linked successfully!', 'success');
            
            // Reset form
            document.getElementById('pyqsUploadForm').reset();
            
            // Reload statistics
            await loadStatistics();
            
            // Re-enable button
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload PYQS';
        }
        // Handle File Upload
        else {
            const storage = window.firebaseStorage;
            
            if (!storage) {
                showPYQSMessage('Firebase Storage not initialized. Please refresh the page.', 'error');
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Upload PYQS';
                return;
            }
            
            // Create file path in separate pyqs folder
            const filePath = `pyqs/${board}/class${classValue}/${year}/${Date.now()}_${file.name}`;
            console.log('Upload path:', filePath);
            
            const storageRef = storage.ref(filePath);
            console.log('Storage reference created');
            
            // Upload file
            const uploadTask = storageRef.put(file);
            console.log('Upload task started');
            
            // Show progress
            document.getElementById('pyqsUploadProgress').style.display = 'block';
            
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload progress:', Math.round(progress) + '%');
                    document.getElementById('pyqsProgressFill').style.width = progress + '%';
                    document.getElementById('pyqsProgressText').textContent = Math.round(progress) + '%';
                },
                (error) => {
                    console.error('Upload error:', error);
                    showPYQSMessage('Upload failed: ' + error.message, 'error');
                    document.getElementById('pyqsUploadProgress').style.display = 'none';
                    uploadBtn.disabled = false;
                    uploadBtn.textContent = 'Upload PYQS';
                },
                async () => {
                    try {
                        console.log('Upload completed, getting download URL...');
                        downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        console.log('Download URL:', downloadURL);
                        
                        console.log('Saving to Firestore...');
                        // Save metadata to Firestore in pyqs collection
                        const docRef = await db.collection('pyqs').add({
                            board: board,
                            class: classValue,
                            year: year,
                            subject: subject,
                            title: title,
                            fileUrl: downloadURL,
                            uploadDate: new Date(),
                            source: 'firebase'
                        });
                        
                        console.log('PYQS saved to Firestore with ID:', docRef.id);
                        showPYQSMessage('PYQS uploaded successfully!', 'success');
                        
                        // Reset form
                        document.getElementById('pyqsUploadForm').reset();
                        document.getElementById('pyqsUploadProgress').style.display = 'none';
                        
                        // Reload statistics
                        await loadStatistics();
                        
                        // Re-enable button
                        uploadBtn.disabled = false;
                        uploadBtn.textContent = 'Upload PYQS';
                    } catch (completionError) {
                        console.error('Error in completion handler:', completionError);
                        showPYQSMessage('Upload completed but failed to save metadata: ' + completionError.message, 'error');
                        document.getElementById('pyqsUploadProgress').style.display = 'none';
                        uploadBtn.disabled = false;
                        uploadBtn.textContent = 'Upload PYQS';
                    }
                }
            );
        }
    } catch (error) {
        console.error('Error uploading PYQS:', error);
        showPYQSMessage('Upload failed: ' + error.message, 'error');
        document.getElementById('pyqsUploadProgress').style.display = 'none';
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload PYQS';
    }
});

// Show PYQS message
function showPYQSMessage(message, type) {
    const messageDiv = document.getElementById('pyqsUploadMessage');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Load PYQS for management
async function loadManagePYQS() {
    try {
        const db = window.firebaseDB;
        const pyqsRef = db.collection('pyqs');
        const snapshot = await pyqsRef.orderBy('uploadDate', 'desc').get();
        
        allPYQS = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        displayManagePYQS(allPYQS);
    } catch (error) {
        console.error('Error loading PYQS:', error);
    }
}

// Display PYQS in management grid
function displayManagePYQS(pyqs) {
    const pyqsManageGrid = document.getElementById('pyqsManageGrid');
    const noPyqsManage = document.getElementById('noPyqsManage');
    
    if (pyqs.length === 0) {
        pyqsManageGrid.innerHTML = '';
        noPyqsManage.style.display = 'block';
        return;
    }
    
    noPyqsManage.style.display = 'none';
    
    pyqsManageGrid.innerHTML = pyqs.map(pyq => `
        <div class="manage-paper-item">
            <div class="manage-paper-info">
                <div class="manage-paper-title">${pyq.title}</div>
                <div class="manage-paper-meta">
                    ${pyq.board} • Class ${pyq.class || 'N/A'} • ${pyq.year} • ${pyq.subject}
                </div>
            </div>
            <div class="manage-paper-actions">
                <button class="btn-delete" onclick="deletePYQS('${pyq.id}', '${pyq.title}')">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Filter manage PYQS
document.getElementById('pyqsManageSearch')?.addEventListener('input', filterManagePYQS);
document.getElementById('pyqsManageBoardFilter')?.addEventListener('change', filterManagePYQS);

function filterManagePYQS() {
    const searchTerm = document.getElementById('pyqsManageSearch').value.toLowerCase();
    const boardFilter = document.getElementById('pyqsManageBoardFilter').value;
    
    const filtered = allPYQS.filter(pyq => {
        const matchesSearch = !searchTerm || 
            pyq.title.toLowerCase().includes(searchTerm) ||
            pyq.subject.toLowerCase().includes(searchTerm) ||
            pyq.year.toString().includes(searchTerm);
        
        const matchesBoard = !boardFilter || pyq.board === boardFilter;
        
        return matchesSearch && matchesBoard;
    });
    
    displayManagePYQS(filtered);
}

// Delete PYQS
async function deletePYQS(pyqId, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
        return;
    }
    
    try {
        const db = window.firebaseDB;
        const storage = window.firebaseStorage;
        
        // Get PYQS data
        const pyq = allPYQS.find(p => p.id === pyqId);
        
        if (!pyq) {
            showPYQSMessage('PYQS not found!', 'error');
            return;
        }
        
        // Delete from Storage only if it's a Firebase Storage file
        if (pyq.fileUrl && pyq.source === 'firebase') {
            try {
                const fileRef = storage.refFromURL(pyq.fileUrl);
                await fileRef.delete();
                console.log('File deleted from storage');
            } catch (storageError) {
                console.error('Error deleting from storage:', storageError);
                // Continue with Firestore deletion even if storage deletion fails
            }
        }
        
        // Delete from Firestore
        await db.collection('pyqs').doc(pyqId).delete();
        console.log('PYQS deleted from Firestore');
        
        loadManagePYQS();
        showPYQSMessage('PYQS deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting PYQS:', error);
        showPYQSMessage('Failed to delete PYQS: ' + error.message, 'error');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    populateYearDropdown();
    populatePYQSYearDropdown();
    
    if (window.firebaseAuth) {
        checkAuth();
    } else {
        setTimeout(checkAuth, 1000);
    }
});

