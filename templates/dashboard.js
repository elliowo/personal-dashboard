function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLightMode = document.body.classList.contains('light-mode');
    localStorage.setItem('lightMode', isLightMode);            

    // Update button text
    const button = document.querySelector('.theme-toggle');
    if (isLightMode) {
        button.textContent = 'Switch to Dark Mode';
    } else {
        button.textContent = 'Switch to Light Mode';
    }
}

function toggleFlyout() {
    const flyout = document.getElementById('flyout');
    flyout.classList.toggle('hidden');
}

// Handle container selection
document.querySelectorAll('#flyout input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
        const containerId = cb.value;
        const container = document.getElementById(containerId);
        if (container) {
            if (cb.checked) {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        }
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('darkMode');

    if (savedTheme !== null) {
        if (savedTheme === 'true') {
            document.body.classList.add('dark-mode');
            document.querySelector('.theme-toggle').textContent = 'Switch to Light Mode';
        }
    }
    else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            document.querySelector('.theme-toggle').textContent = 'Switch to Light Mode';
        }
    }
});

// Auto-refresh system data every 5 seconds
setInterval(() => {
    fetch('/').then(response => response.text()).then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newSystemData = doc.getElementById('systemMonitor');
        
        if (newSystemData) {
            document.getElementById('systemMonitor').innerHTML = newSystemData.innerHTML;
        }
    });
}, 5000);
