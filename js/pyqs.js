// PYQS page JavaScript

let allPYQS = [];
let filteredPYQS = [];

// Track visitor
async function trackVisitor() {
    try {
        const db = window.firebaseDB;
        if (!db) return;
        
        const analyticsRef = db.collection('analytics').doc('visitors');
        
        // Check if document exists, if not create it
        const doc = await analyticsRef.get();
        if (!doc.exists) {
            await analyticsRef.set({
                totalVisits: 1,
                lastUpdated: window.firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await analyticsRef.update({
                totalVisits: window.firebase.firestore.FieldValue.increment(1),
                lastUpdated: window.firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        console.log('✅ Visitor tracked - PYQS page');
    } catch (error) {
        console.error('❌ Error tracking visitor:', error);
    }
}

// Load all PYQS from Firestore
async function loadPYQS() {
    showLoading(true);
    
    try {
        console.log('🔄 Loading PYQS from Firestore...');
        const db = window.firebaseDB;
        
        if (!db) {
            console.error('❌ Firebase DB not initialized');
            showLoading(false);
            showNoResults(true);
            return;
        }
        
        const pyqsRef = db.collection('pyqs');
        const snapshot = await pyqsRef.orderBy('uploadDate', 'desc').get();
        
        console.log('📊 PYQS snapshot size:', snapshot.size);
        
        allPYQS = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('📄 PYQ loaded:', data.title, data.subject);
            return {
                id: doc.id,
                ...data
            };
        });
        
        console.log('✅ Total PYQS loaded:', allPYQS.length);
        
        filteredPYQS = [...allPYQS];
        
        // Populate filter options
        populateFilterOptions();
        
        // Apply URL parameters if any
        applyURLFilters();
        
        // Display PYQS
        displayPYQS();
        
        showLoading(false);
    } catch (error) {
        console.error('❌ Error loading PYQS:', error);
        showLoading(false);
        showNoResults(true);
    }
}

// Populate all filter options dynamically based on uploaded files
function populateFilterOptions() {
    // Get unique values for all filters
    const boards = [...new Set(allPYQS.map(p => p.board))].filter(Boolean).sort();
    const classes = [...new Set(allPYQS.map(p => p.class))].filter(Boolean).sort((a, b) => {
        // Sort numerically if both are numbers
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return a.toString().localeCompare(b.toString());
    });
    const years = [...new Set(allPYQS.map(p => p.year))].filter(Boolean).sort((a, b) => b - a);
    const subjects = [...new Set(allPYQS.map(p => p.subject))].filter(Boolean).sort();
    
    // Populate board filter
    const boardFilter = document.getElementById('boardFilter');
    boardFilter.innerHTML = '<option value="">All Boards</option>';
    boards.forEach(board => {
        const option = document.createElement('option');
        option.value = board;
        option.textContent = board;
        boardFilter.appendChild(option);
    });
    
    // Populate class filter
    const classFilter = document.getElementById('classFilter');
    classFilter.innerHTML = '<option value="">All Classes</option>';
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = `Class ${cls}`;
        classFilter.appendChild(option);
    });
    
    // Populate year filter
    const yearFilter = document.getElementById('yearFilter');
    yearFilter.innerHTML = '<option value="">All Years</option>';
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
    
    // Populate subject filter
    const subjectFilter = document.getElementById('subjectFilter');
    subjectFilter.innerHTML = '<option value="">All Subjects</option>';
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectFilter.appendChild(option);
    });
}

// Apply filters from URL parameters
function applyURLFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const board = urlParams.get('board');
    
    if (board) {
        document.getElementById('boardFilter').value = board;
        applyFilters();
    }
}

// Apply filters
function applyFilters() {
    const board = document.getElementById('boardFilter').value;
    const classValue = document.getElementById('classFilter').value;
    const year = document.getElementById('yearFilter').value;
    const subject = document.getElementById('subjectFilter').value;
    
    console.log('🔍 Applying filters:', { board, classValue, year, subject });
    
    filteredPYQS = allPYQS.filter(pyq => {
        const matchesBoard = !board || pyq.board === board;
        const matchesClass = !classValue || pyq.class === classValue;
        const matchesYear = !year || pyq.year === year;
        const matchesSubject = !subject || pyq.subject === subject;
        
        const matches = matchesBoard && matchesClass && matchesYear && matchesSubject;
        
        if (subject && pyq.subject === subject) {
            console.log(`✅ PYQ matches ${subject}:`, pyq.title);
        }
        
        return matches;
    });
    
    console.log(`📊 Filtered results: ${filteredPYQS.length} PYQS`);
    
    applySorting();
    displayPYQS();
}

// Apply sorting
function applySorting() {
    const sortBy = document.getElementById('sortBy').value;
    
    switch (sortBy) {
        case 'recent':
            filteredPYQS.sort((a, b) => b.uploadDate - a.uploadDate);
            break;
        case 'oldest':
            filteredPYQS.sort((a, b) => a.uploadDate - b.uploadDate);
            break;
        case 'board':
            filteredPYQS.sort((a, b) => a.board.localeCompare(b.board));
            break;
        case 'year':
            filteredPYQS.sort((a, b) => b.year - a.year);
            break;
    }
}

// Display PYQS grouped by subject
function displayPYQS() {
    const pyqsGrid = document.getElementById('pyqsGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    resultsCount.textContent = filteredPYQS.length;
    
    if (filteredPYQS.length === 0) {
        pyqsGrid.innerHTML = '';
        showNoResults(true);
        return;
    }
    
    showNoResults(false);
    
    // Group PYQS by subject
    const groupedPYQS = {};
    filteredPYQS.forEach(pyq => {
        const subject = pyq.subject || 'Other';
        if (!groupedPYQS[subject]) {
            groupedPYQS[subject] = [];
        }
        groupedPYQS[subject].push(pyq);
    });
    
    // Sort subjects alphabetically
    const sortedSubjects = Object.keys(groupedPYQS).sort();
    
    // Generate HTML with subject groupings
    let html = '';
    sortedSubjects.forEach((subject, subjectIndex) => {
        const pyqs = groupedPYQS[subject];
        
        // Subject header with count
        html += `
            <div class="subject-group" data-subject="${subject}">
                <div class="subject-header">
                    <div class="subject-title">
                        <span class="subject-icon">📚</span>
                        <h3 class="subject-name">${subject}</h3>
                        <span class="subject-count">${pyqs.length} ${pyqs.length === 1 ? 'Paper' : 'Papers'}</span>
                    </div>
                </div>
                <div class="subject-papers">
                    ${pyqs.map(pyq => `
                        <div class="paper-card fade-in">
                            <div class="paper-header">
                                <span class="paper-badge">${pyq.board}</span>
                                <span class="paper-year">${pyq.year}</span>
                            </div>
                            <h3 class="paper-title">${pyq.title}</h3>
                            <p class="paper-subject">🎓 Class ${pyq.class || 'N/A'} | 📚 ${pyq.subject}</p>
                            <div class="paper-actions">
                                <button class="btn-view" onclick="viewPYQ('${pyq.fileUrl}', '${pyq.title.replace(/'/g, "\\'")}')">
                                    👁️ View
                                </button>
                                <button class="btn-download" onclick="downloadPYQ('${pyq.fileUrl}', '${pyq.title.replace(/'/g, "\\'")}')">
                                    📥 Download
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${subjectIndex < sortedSubjects.length - 1 ? '<div class="subject-divider"></div>' : ''}
            </div>
        `;
    });
    
    pyqsGrid.innerHTML = html;
}

// View PYQS in modal
function viewPYQ(url, title = 'Previous Year Question Paper') {
    const modal = document.getElementById('pdfViewerModal');
    const iframe = document.getElementById('pdfIframe');
    const loader = document.getElementById('pdfLoader');
    const pdfTitle = document.getElementById('pdfTitle');
    const downloadBtn = document.getElementById('modalDownloadBtn');
    
    // Set title
    pdfTitle.textContent = title;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Show loader
    loader.style.display = 'flex';
    iframe.style.display = 'none';
    
    // Prepare URL for viewing
    let viewUrl = url;
    
    if (url.includes('firebasestorage.googleapis.com')) {
        // Firebase Storage - use direct URL
        viewUrl = url;
    } else if (url.includes('drive.google.com/uc?export=download')) {
        // Convert Google Drive download link to embed link
        const fileIdMatch = url.match(/id=([^&]+)/);
        if (fileIdMatch) {
            const fileId = fileIdMatch[1];
            viewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        }
    }
    
    // Set iframe source
    iframe.src = viewUrl;
    
    // Set up download button
    downloadBtn.onclick = () => downloadPYQ(url, title);
    
    // Handle iframe load
    iframe.onload = () => {
        loader.style.display = 'none';
        iframe.style.display = 'block';
    };
    
    // Handle iframe error
    iframe.onerror = () => {
        loader.style.display = 'none';
        iframe.style.display = 'none';
        alert('Unable to load PDF. Trying to download instead...');
        downloadPYQ(url, title);
        closePDFModal();
    };
}

// Close PDF modal
function closePDFModal() {
    const modal = document.getElementById('pdfViewerModal');
    const iframe = document.getElementById('pdfIframe');
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Clear iframe
    setTimeout(() => {
        iframe.src = '';
    }, 300);
}

// Make function global
window.closePDFModal = closePDFModal;

// Download PYQS directly
function downloadPYQ(url, title) {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.pdf`;
    link.setAttribute('download', `${title}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    showDownloadSuccess(title);
}

// Show download success message
function showDownloadSuccess(title) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'download-toast';
    toast.innerHTML = `
        <span class="toast-icon">✅</span>
        <span class="toast-message">Download started: ${title}</span>
    `;
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Clear all filters
function clearFilters() {
    document.getElementById('boardFilter').value = '';
    document.getElementById('classFilter').value = '';
    document.getElementById('yearFilter').value = '';
    document.getElementById('subjectFilter').value = '';
    
    filteredPYQS = [...allPYQS];
    applySorting();
    displayPYQS();
}

// Show/hide loading spinner
function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}

// Show/hide no results message
function showNoResults(show) {
    const noResults = document.getElementById('noResults');
    if (show) {
        noResults.style.display = 'block';
        // Update message based on whether there are any PYQS at all
        if (allPYQS.length === 0) {
            noResults.innerHTML = `
                <div class="no-results-icon">📭</div>
                <h3>No PYQS Found</h3>
                <p>No previous year question papers have been uploaded yet. Check back later or contact admin to add papers.</p>
            `;
        } else {
            noResults.innerHTML = `
                <div class="no-results-icon">🔍</div>
                <h3>No PYQS Match Your Filters</h3>
                <p>Try adjusting your filters or clearing them to see all available papers.</p>
                <button class="btn-clear" onclick="clearFilters()" style="margin-top: 1rem;">
                    <span>🔄</span> Clear All Filters
                </button>
            `;
        }
    } else {
        noResults.style.display = 'none';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Track visitor on page load
    trackVisitor();
    
    // Add event listeners for filters
    document.getElementById('boardFilter').addEventListener('change', applyFilters);
    document.getElementById('classFilter').addEventListener('change', applyFilters);
    document.getElementById('yearFilter').addEventListener('change', applyFilters);
    document.getElementById('subjectFilter').addEventListener('change', applyFilters);
    document.getElementById('sortBy').addEventListener('change', () => {
        applySorting();
        displayPYQS();
    });
    
    // Load PYQS
    if (window.firebaseDB) {
        loadPYQS();
    } else {
        setTimeout(loadPYQS, 1000);
    }
});

