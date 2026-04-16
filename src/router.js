import { navTo } from './ui';

const routes = {
    '/': 'home',
    '/explore': 'explore',
    '/community': 'community',
    '/bookings': 'bookings',
    '/apply': 'apply',
    '/provider': 'provider-dashboard',
    '/admin': 'admin-console'
};

export function initRouter() {
    window.addEventListener('popstate', handleLocation);
    
    // Capture link clicks
    document.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (link && link.getAttribute('href')?.startsWith('/')) {
            e.preventDefault();
            const href = link.getAttribute('href');
            window.history.pushState({}, '', href);
            handleLocation();
        }
    });

    // Handle initial load
    handleLocation();
}

export function navigate(path) {
    window.history.pushState({}, '', path);
    handleLocation();
}

function handleLocation() {
    const path = window.location.pathname;
    const view = routes[path] || 'home';
    navTo(view, false); // Pass false to avoid pushState recursion
}
