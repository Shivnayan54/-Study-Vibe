// Search page JavaScript

let allPapers = [];

// Load all papers
async function loadAllPapers() {
    try {
        const db = window.firebaseDB;
        const papersRef = db.collection('papers');
        const snapshot = await papersRef.get();
        
        allPapers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error loading papers:', error);
    }
}

// Perform search
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (!searchTerm) {
        return;
    }
    
    showLoading(true);
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('noResults').style.display = 'none';
    
    // Filter papers based on search term
    const results = allPapers.filter(paper => {
        return paper.board.toLowerCase().includes(searchTerm) ||
               (paper.class && paper.class.toString().includes(searchTerm)) ||
               paper.year.toString().includes(searchTerm) ||
               paper.subject.toLowerCase().includes(searchTerm) ||
               paper.title.toLowerCase().includes(searchTerm);
    });
    
    setTimeout(() => {
        displaySearchResults(results);
        showLoading(false);
    }, 500);
}

// Display search results
function displaySearchResults(results) {
    const resultsGrid = document.getElementById('searchResultsGrid');
    const resultsCount = document.getElementById('resultsCount');
    const resultsSection = document.getElementById('resultsSection');
    const noResults = document.getElementById('noResults');
    
    resultsCount.textContent = results.length;
    
    if (results.length === 0) {
        resultsSection.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    resultsSection.style.display = 'block';
    noResults.style.display = 'none';
    
    resultsGrid.innerHTML = results.map(paper => `
        <div class="paper-card fade-in">
            <div class="paper-header">
                <span class="paper-badge">${paper.board}</span>
                <span class="paper-year">${paper.year}</span>
            </div>
            <h3 class="paper-title">${paper.title}</h3>
            <p class="paper-subject">🎓 Class ${paper.class || 'N/A'} | 📚 ${paper.subject}</p>
            <div class="paper-actions">
                <button class="btn-view" onclick="viewPaper('${paper.fileUrl}')">
                    👁️ View
                </button>
                <button class="btn-download" onclick="downloadPaper('${paper.fileUrl}', '${paper.title}')">
                    📥 Download
                </button>
            </div>
        </div>
    `).join('');
}

// Show search suggestions
function showSuggestions() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const suggestionsDiv = document.getElementById('searchSuggestions');
    
    if (!searchTerm || searchTerm.length < 2) {
        suggestionsDiv.classList.remove('show');
        return;
    }
    
    // Get unique suggestions from boards, subjects, and years
    const suggestions = new Set();
    
    allPapers.forEach(paper => {
        if (paper.board.toLowerCase().includes(searchTerm)) {
            suggestions.add(paper.board);
        }
        if (paper.class && ('class ' + paper.class).toLowerCase().includes(searchTerm)) {
            suggestions.add('Class ' + paper.class);
        }
        if (paper.subject.toLowerCase().includes(searchTerm)) {
            suggestions.add(paper.subject);
        }
        if (paper.year.toString().includes(searchTerm)) {
            suggestions.add(paper.year.toString());
        }
    });
    
    const suggestionArray = Array.from(suggestions).slice(0, 5);
    
    if (suggestionArray.length > 0) {
        suggestionsDiv.innerHTML = suggestionArray.map(suggestion => `
            <div class="suggestion-item" onclick="selectSuggestion('${suggestion}')">
                ${suggestion}
            </div>
        `).join('');
        suggestionsDiv.classList.add('show');
    } else {
        suggestionsDiv.classList.remove('show');
    }
}

// Select suggestion
function selectSuggestion(suggestion) {
    document.getElementById('searchInput').value = suggestion;
    document.getElementById('searchSuggestions').classList.remove('show');
    performSearch();
}

// View paper
function viewPaper(url) {
    window.open(url, '_blank');
}

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
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.pdf`;
    link.target = '_blank';
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

// Show/hide loading
function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    
    // Load papers
    if (window.firebaseDB) {
        loadAllPapers();
    } else {
        setTimeout(loadAllPapers, 1000);
    }
    
    // Search on Enter key
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        } else {
            showSuggestions();
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            document.getElementById('searchSuggestions').classList.remove('show');
        }
    });
});

