// Browse page JavaScript

let allPapers = [];
let filteredPapers = [];

// Load all papers from Firestore
async function loadPapers() {
    showLoading(true);
    
    try {
        const db = window.firebaseDB;
        const papersRef = db.collection('papers');
        const snapshot = await papersRef.orderBy('uploadDate', 'desc').get();
        
        allPapers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        filteredPapers = [...allPapers];
        
        // Populate filter options
        populateFilterOptions();
        
        // Apply URL parameters if any
        applyURLFilters();
        
        // Display papers
        displayPapers();
        
        showLoading(false);
    } catch (error) {
        console.error('Error loading papers:', error);
        showLoading(false);
        showNoResults(true);
    }
}

// Populate year and subject filter options
function populateFilterOptions() {
    // Get unique years and subjects
    const years = [...new Set(allPapers.map(p => p.year))].sort((a, b) => b - a);
    const subjects = [...new Set(allPapers.map(p => p.subject))].sort();
    
    // Populate year filter
    const yearFilter = document.getElementById('yearFilter');
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
    
    // Populate subject filter
    const subjectFilter = document.getElementById('subjectFilter');
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
    
    filteredPapers = allPapers.filter(paper => {
        return (!board || paper.board === board) &&
               (!classValue || paper.class === classValue) &&
               (!year || paper.year === year) &&
               (!subject || paper.subject === subject);
    });
    
    applySorting();
    displayPapers();
}

// Apply sorting
function applySorting() {
    const sortBy = document.getElementById('sortBy').value;
    
    switch (sortBy) {
        case 'recent':
            filteredPapers.sort((a, b) => b.uploadDate - a.uploadDate);
            break;
        case 'oldest':
            filteredPapers.sort((a, b) => a.uploadDate - b.uploadDate);
            break;
        case 'board':
            filteredPapers.sort((a, b) => a.board.localeCompare(b.board));
            break;
        case 'year':
            filteredPapers.sort((a, b) => b.year - a.year);
            break;
    }
}

// Display papers in grid
function displayPapers() {
    const papersGrid = document.getElementById('papersGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    resultsCount.textContent = filteredPapers.length;
    
    if (filteredPapers.length === 0) {
        papersGrid.innerHTML = '';
        showNoResults(true);
        return;
    }
    
    showNoResults(false);
    
    papersGrid.innerHTML = filteredPapers.map(paper => `
        <div class="paper-card fade-in">
            <div class="paper-header">
                <span class="paper-badge">${paper.board}</span>
                <span class="paper-year">${paper.year}</span>
            </div>
            <h3 class="paper-title">${paper.title}</h3>
            <p class="paper-subject">🎓 Class ${paper.class || 'N/A'} | 📚 ${paper.subject}</p>
            <div class="paper-actions">
                <button class="btn-view" onclick="viewPaper('${paper.fileUrl}', '${paper.title.replace(/'/g, "\\'")}')">
                    👁️ View
                </button>
                <button class="btn-download" onclick="downloadPaper('${paper.fileUrl}', '${paper.title.replace(/'/g, "\\'")}')">
                    📥 Download
                </button>
            </div>
        </div>
    `).join('');
}

// View paper in modal
function viewPaper(url, title = 'Question Paper') {
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
    downloadBtn.onclick = () => downloadPaper(url, title);
    
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
        downloadPaper(url, title);
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

// Download paper with ad wall
function downloadPaper(url, title) {
    // Show ad wall before download
    if (window.adWall) {
        window.adWall.showAdWall(() => {
            // This callback will be executed after ad is viewed
            executeDownload(url, title);
        });
    } else {
        // Fallback if ad wall is not loaded
        executeDownload(url, title);
    }
}

// Execute actual download
function executeDownload(url, title) {
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
    
    filteredPapers = [...allPapers];
    applySorting();
    displayPapers();
}

// Show/hide loading spinner
function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}

// Show/hide no results message
function showNoResults(show) {
    document.getElementById('noResults').style.display = show ? 'block' : 'none';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for filters
    document.getElementById('boardFilter').addEventListener('change', applyFilters);
    document.getElementById('classFilter').addEventListener('change', applyFilters);
    document.getElementById('yearFilter').addEventListener('change', applyFilters);
    document.getElementById('subjectFilter').addEventListener('change', applyFilters);
    document.getElementById('sortBy').addEventListener('change', () => {
        applySorting();
        displayPapers();
    });
    
    // Load papers
    if (window.firebaseDB) {
        loadPapers();
    } else {
        setTimeout(loadPapers, 1000);
    }
});

