// Theme Management
(function () {
    function getTheme() {
        return localStorage.getItem('theme') || 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    // Apply theme immediately
    const savedTheme = getTheme();
    setTheme(savedTheme);

    // Toggle function exposed globally
    window.toggleTheme = function () {
        const currentTheme = getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    // Attach listener when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            // Remove any existing listeners by cloning (optional, but safe)
            const newBtn = toggleBtn.cloneNode(true);
            toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);

            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.toggleTheme();
            });
        }
    });
})();
