// Main landing page JavaScript

// Load paper counts for each board
async function loadPaperCounts() {
    try {
        const db = window.firebaseDB;
        const papersRef = db.collection('papers');
        
        // Get all papers
        const snapshot = await papersRef.get();
        const papers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Count papers by board
        const cbseCount = papers.filter(p => p.board === 'CBSE').length;
        const icseCount = papers.filter(p => p.board === 'ICSE').length;
        const upCount = papers.filter(p => p.board === 'UP Board').length;
        const biharCount = papers.filter(p => p.board === 'Bihar Board').length;
        
        // Update UI
        document.getElementById('cbse-count').textContent = `${cbseCount} Papers`;
        document.getElementById('icse-count').textContent = `${icseCount} Papers`;
        document.getElementById('up-count').textContent = `${upCount} Papers`;
        document.getElementById('bihar-count').textContent = `${biharCount} Papers`;
        document.getElementById('totalPapers').textContent = papers.length;
        
        // Add fade-in animation
        document.querySelectorAll('.board-card').forEach((card, index) => {
            card.classList.add('fade-in');
            card.style.animationDelay = `${index * 0.1}s`;
        });
    } catch (error) {
        console.error('Error loading paper counts:', error);
        // If Firebase is not configured, show demo data
        document.getElementById('cbse-count').textContent = '0 Papers';
        document.getElementById('icse-count').textContent = '0 Papers';
        document.getElementById('up-count').textContent = '0 Papers';
        document.getElementById('bihar-count').textContent = '0 Papers';
        document.getElementById('totalPapers').textContent = '0';
    }
}

// Navigate to browse page with board filter
function goToBrowse(board) {
    window.location.href = `browse.html?board=${encodeURIComponent(board)}`;
}

// Track visitor
async function trackVisitor() {
    try {
        const db = window.firebaseDB;
        if (!db) {
            console.log('Firebase DB not available');
            return;
        }
        
        const analyticsRef = db.collection('analytics').doc('visitors');
        
        // Check if document exists, if not create it
        const doc = await analyticsRef.get();
        if (!doc.exists) {
            console.log('Initializing visitor tracking...');
            await analyticsRef.set({
                totalVisits: 1,
                lastUpdated: window.firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Increment total visits
            await analyticsRef.update({
                totalVisits: window.firebase.firestore.FieldValue.increment(1),
                lastUpdated: window.firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        console.log('✅ Visitor tracked successfully');
    } catch (error) {
        console.error('❌ Error tracking visitor:', error);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Track visitor on page load
    trackVisitor();
    
    // Add animation to hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.classList.add('fade-in');
    }
    
    // Load paper counts
    if (window.firebaseDB) {
        loadPaperCounts();
    } else {
        // Wait for Firebase to load
        setTimeout(loadPaperCounts, 1000);
    }
    
    // Add hover effects to board cards
    document.querySelectorAll('.board-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('hover-lift');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hover-lift');
        });
    });
});

