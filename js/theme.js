// Theme Switcher
class ThemeSwitcher {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Apply saved theme
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Create theme toggle button if it doesn't exist
        this.createToggleButton();
        
        // Update button icon
        this.updateButtonIcon();
    }

    createToggleButton() {
        // Check if toggle already exists
        if (document.querySelector('.theme-toggle')) {
            return;
        }

        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        const toggleBtn = document.createElement('li');
        toggleBtn.innerHTML = `
            <button class="theme-toggle" onclick="themeSwitcher.toggleTheme()" aria-label="Toggle theme">
                <span class="theme-icon"></span>
            </button>
        `;
        
        navLinks.appendChild(toggleBtn);
    }

    updateButtonIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (!themeIcon) return;

        if (this.theme === 'dark') {
            themeIcon.textContent = '☀️';
        } else {
            themeIcon.textContent = '🌙';
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        this.updateButtonIcon();
        this.animateTransition();
    }

    animateTransition() {
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }
}

// Initialize theme switcher
let themeSwitcher;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        themeSwitcher = new ThemeSwitcher();
    });
} else {
    themeSwitcher = new ThemeSwitcher();
}

// Make it globally accessible
window.themeSwitcher = themeSwitcher;

