// shared-components.js
function loadMobileMenu() {
    document.addEventListener('DOMContentLoaded', () => {
        const mobileMenuHTML = `
        <nav class="mobile-menu">
            <div class="menu-container">
                <button class="menu-button ${window.location.pathname.includes('index') ? 'active' : ''}" onclick="window.location.href='index.html'">
                    <i data-lucide="timer"></i>
                    <span class="menu-label">Splits</span>
                </button>
                <button onclick="window.location.href='duration.html'" class="menu-button ${window.location.pathname.includes('duration') ? 'active' : ''}">
                    <i data-lucide="clock"></i>
                    <span class="menu-label">Round Duration</span>
                </button>
                <button onclick="window.location.href='conversions.html'" class="menu-button ${window.location.pathname.includes('conversions') ? 'active' : ''}">
                    <i data-lucide="scale"></i>
                    <span class="menu-label">Conversions</span>
                </button>
            </div>
        </nav>`;
        
    
        const scripts = document.getElementsByTagName('script');
        scripts[scripts.length - 1].insertAdjacentHTML('beforebegin', mobileMenuHTML);
        
        
        if (window.lucide) {
            lucide.createIcons();
        }
    });
}

// Call the function to load mobile menu

loadMobileMenu();