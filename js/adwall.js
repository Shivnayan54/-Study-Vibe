// Ad Wall System for PDF Downloads
// Integrates with Google AdSense, AdsTerra, or other ad networks

class AdWall {
    constructor() {
        this.adDuration = 8; // Duration in seconds before download is allowed
        this.currentDownloadCallback = null;
        this.countdown = null;
        this.isAdShown = false;
    }

    // Show ad wall before download
    showAdWall(downloadCallback) {
        this.currentDownloadCallback = downloadCallback;
        const modal = document.getElementById('adWallModal');
        const overlay = document.getElementById('adWallOverlay');
        
        // Show modal
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Start countdown
        this.startCountdown();
        
        // Mark that ad is shown
        this.isAdShown = true;
        
        // Load ad (call ad network script)
        this.loadAd();
    }

    // Load advertisement from ad network
    loadAd() {
        const adContainer = document.getElementById('adContainer');
        
        // Clear previous ad content
        adContainer.innerHTML = '';
        
        // ==========================================
        // AUTO-DETECT: LOCALHOST vs LIVE WEBSITE
        // ==========================================
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '';
        
        if (isLocalhost) {
            // ==========================================
            // LOCALHOST - DEMO AD FOR TESTING
            // ==========================================
            console.log('🧪 Localhost detected - Showing demo ad for testing');
            const demoAd = document.createElement('div');
            demoAd.className = 'demo-ad';
            demoAd.innerHTML = `
                <div class="demo-ad-content">
                    <h3>📢 Advertisement (Demo)</h3>
                    <p style="color: #ff6b6b; font-weight: bold;">⚠️ Localhost Testing Mode</p>
                    <p class="demo-ad-small">Real Google AdSense ads will appear on live website</p>
                    <div class="demo-ad-placeholder">
                        <div class="demo-ad-box">
                            <span>728x90</span>
                            <span>Google AdSense Banner</span>
                            <span style="font-size: 12px;">Ad ID: 6778746169</span>
                        </div>
                    </div>
                    <p class="demo-ad-info">✅ Ad wall system working! Deploy to see real ads.</p>
                </div>
            `;
            adContainer.appendChild(demoAd);
        } else {
            // ==========================================
            // LIVE WEBSITE - GOOGLE ADSENSE INTEGRATION
            // ==========================================
            console.log('🌐 Live website - Loading Google AdSense ads');
            const adScript = document.createElement('ins');
            adScript.className = 'adsbygoogle';
            adScript.style.display = 'block';
            adScript.setAttribute('data-ad-client', 'ca-pub-8501289423125667');
            adScript.setAttribute('data-ad-slot', '6778746169');
            adScript.setAttribute('data-ad-format', 'auto');
            adScript.setAttribute('data-full-width-responsive', 'true');
            adContainer.appendChild(adScript);
            
            // Push ad
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    }

    // Start countdown timer
    startCountdown() {
        let timeLeft = this.adDuration;
        const countdownElement = document.getElementById('adCountdown');
        const downloadButton = document.getElementById('adDownloadButton');
        
        // Disable download button
        downloadButton.disabled = true;
        downloadButton.classList.add('disabled');
        
        // Update countdown display
        const updateDisplay = () => {
            countdownElement.textContent = timeLeft;
            downloadButton.textContent = `⏳ Wait ${timeLeft}s`;
        };
        
        updateDisplay();
        
        // Countdown interval
        this.countdown = setInterval(() => {
            timeLeft--;
            
            if (timeLeft > 0) {
                updateDisplay();
            } else {
                // Countdown finished
                clearInterval(this.countdown);
                countdownElement.textContent = '0';
                downloadButton.disabled = false;
                downloadButton.classList.remove('disabled');
                downloadButton.classList.add('ready');
                downloadButton.textContent = '📥 Download Now';
                
                // Show success message
                document.getElementById('adWaitMessage').style.display = 'none';
                document.getElementById('adReadyMessage').style.display = 'block';
            }
        }, 1000);
    }

    // Proceed with download
    proceedDownload() {
        if (this.currentDownloadCallback) {
            // Close ad wall
            this.closeAdWall();
            
            // Execute download
            setTimeout(() => {
                this.currentDownloadCallback();
                this.currentDownloadCallback = null;
            }, 300);
        }
    }

    // Close ad wall
    closeAdWall() {
        const modal = document.getElementById('adWallModal');
        const overlay = document.getElementById('adWallOverlay');
        
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear countdown
        if (this.countdown) {
            clearInterval(this.countdown);
            this.countdown = null;
        }
        
        // Reset UI
        setTimeout(() => {
            const countdownElement = document.getElementById('adCountdown');
            const downloadButton = document.getElementById('adDownloadButton');
            const adContainer = document.getElementById('adContainer');
            
            if (countdownElement) countdownElement.textContent = this.adDuration;
            if (downloadButton) {
                downloadButton.disabled = true;
                downloadButton.classList.add('disabled');
                downloadButton.classList.remove('ready');
                downloadButton.textContent = `⏳ Wait ${this.adDuration}s`;
            }
            if (adContainer) adContainer.innerHTML = '';
            
            document.getElementById('adWaitMessage').style.display = 'block';
            document.getElementById('adReadyMessage').style.display = 'none';
        }, 300);
        
        this.isAdShown = false;
    }

    // Cancel download
    cancelDownload() {
        this.currentDownloadCallback = null;
        this.closeAdWall();
    }
}

// Initialize Ad Wall
const adWall = new AdWall();

// Make functions globally accessible
window.adWall = adWall;
window.proceedWithDownload = () => adWall.proceedDownload();
window.cancelAdWall = () => adWall.cancelDownload();

