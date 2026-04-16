import './style.css';
import { 
    initApp, toggleMenu, toggleAuthModal, toggleAuthMode, navTo, 
    toggleStaffModal, verifyStaff, handleAuthSubmit, handleGoogleAuth,
    filterCategory, toggleChat, sendChatMessage,
    submitApplication, generateApprovalCode, upgradeAccount, saveListing,
    openProviderModal, closeListingModal, setAdminTab, exportAllData,
    publishAd, handleLogout, showToast
} from './ui';
import { initRouter, navigate } from './router';

function setupEventListeners() {
    // Config Error
    const dismissConfigBtn = document.getElementById('dismissConfigBtn');
    if (dismissConfigBtn) {
        dismissConfigBtn.addEventListener('click', () => {
            document.body.classList.remove('no-config');
        });
    }

    // Auth Modal
    document.querySelectorAll('.fa-xmark').forEach(el => {
        const btn = el.closest('button');
        if (btn && (btn.parentElement.parentElement.id === 'authModal' || btn.closest('#authModal'))) {
            btn.addEventListener('click', toggleAuthModal);
        }
        if (btn && btn.closest('#staffModal')) {
             btn.addEventListener('click', toggleStaffModal);
        }
        if (btn && btn.closest('#chatWindow')) {
             btn.addEventListener('click', toggleChat);
        }
    });
    
    // Close buttons in modals
    const authCloseBtn = document.querySelector('#authModal button .fa-xmark')?.parentElement;
    if (authCloseBtn) authCloseBtn.addEventListener('click', toggleAuthModal);

    const authSubmitBtn = document.getElementById('authSubmitBtn');
    if (authSubmitBtn) authSubmitBtn.addEventListener('click', handleAuthSubmit);

    const googleAuthBtn = document.querySelector('#authFields button img[src*="google.svg"]')?.parentElement;
    if (googleAuthBtn) googleAuthBtn.addEventListener('click', handleGoogleAuth);

    const authToggleBtn = document.getElementById('authToggleBtn');
    if (authToggleBtn) authToggleBtn.addEventListener('click', toggleAuthMode);

    // Menu
    const menuToggleBtn = document.querySelector('header button i.fa-bars-staggered')?.parentElement;
    if (menuToggleBtn) menuToggleBtn.addEventListener('click', toggleMenu);

    const menuOverlay = document.getElementById('menuOverlay');
    if (menuOverlay) menuOverlay.addEventListener('click', toggleMenu);

    const menuCloseBtn = document.querySelector('#sideMenu button i.fa-xmark')?.parentElement;
    if (menuCloseBtn) menuCloseBtn.addEventListener('click', toggleMenu);

    // Navigation
    const logo = document.querySelector('header .cursor-pointer');
    if (logo) logo.addEventListener('click', () => navTo('home'));

    const navLinks = document.querySelectorAll('#sideMenu nav a');
    const navRoutes = ['home', 'explore', 'community', 'bookings', 'apply', 'provider-dashboard', 'admin-console'];
    navLinks.forEach((link, index) => {
        if (navRoutes[index]) {
            link.addEventListener('click', () => {
                navTo(navRoutes[index]);
                toggleMenu();
            });
        }
    });

    const heroButtons = document.querySelectorAll('#home button');
    if (heroButtons.length >= 2) {
        heroButtons[0].addEventListener('click', () => navTo('explore'));
        heroButtons[1].addEventListener('click', () => navTo('apply'));
    }

    // Map Search
    const mapSearch = document.getElementById('mapSearch');
    if (mapSearch) {
        mapSearch.addEventListener('input', () => {
            import('./ui').then(m => m.searchMap());
        });
    }

    // Header Auth Button (Login/Logout)
    const authBtn = document.getElementById('authBtn');
    if (authBtn) {
        authBtn.addEventListener('click', () => {
            if (authBtn.innerText === 'Logout') {
                handleLogout();
            } else {
                toggleAuthModal();
            }
        });
    }

    // Admin Config
    const configBtn = document.querySelector('button i.fa-gear')?.parentElement;
    if (configBtn) {
        configBtn.addEventListener('click', () => {
            import('./ui').then(m => m.toggleConfigModal());
        });
    }

    // Community
    const publishPostBtn = document.getElementById('publishPostBtn');
    if (publishPostBtn) {
        publishPostBtn.addEventListener('click', () => {
            import('./ui').then(m => m.createPost());
        });
    }

    // Filters
    const categoryChips = document.querySelectorAll('.category-chip');
    categoryChips.forEach(chip => {
        const cat = chip.innerText === 'Cabs' ? 'Cab' : 
                    chip.innerText === 'Vehicle Rental' ? 'Rental' :
                    chip.innerText === 'Restaurants' ? 'Restaurant' :
                    chip.innerText === 'Rooms/Hotels' ? 'Hotel' :
                    chip.innerText === 'Tourist Places' ? 'Tourist' : 'All';
        chip.addEventListener('click', () => filterCategory(cat));
    });

    // Admin
    const adminHeaderButtons = document.querySelectorAll('#admin-console button');
    if (adminHeaderButtons.length > 0) {
        const exportBtn = Array.from(adminHeaderButtons).find(b => b.innerText.includes('Export'));
        if (exportBtn) exportBtn.addEventListener('click', exportAllData);
    }

    const adminTabs = document.querySelectorAll('.admin-tab');
    const tabIds = ['apps', 'users', 'services', 'all-bookings', 'financials', 'ads', 'payouts', 'support'];
    adminTabs.forEach((tab, index) => {
        if (tabIds[index]) {
            tab.addEventListener('click', () => setAdminTab(tabIds[index]));
        }
    });

    // Payment Modal
    const confirmPayBtn = document.getElementById('confirmPayBtn');
    if (confirmPayBtn) {
        confirmPayBtn.addEventListener('click', () => {
            import('./ui').then(m => m.confirmPayment());
        });
    }

    // Listing Upload Handlers
    const listDropZone = document.getElementById('list-drop-zone');
    const listFile = document.getElementById('listFile');
    if (listDropZone && listFile) {
        listDropZone.onclick = () => listFile.click();
        listFile.onchange = (e) => {
            if (e.target.files[0]) {
                listDropZone.innerHTML = `<i class="fa-solid fa-check-circle text-2xl text-emerald-500"></i><span class="text-[10px] font-bold text-emerald-600 uppercase">${e.target.files[0].name}</span>`;
            }
        };
    }

    // Community Post Upload Handlers
    const postFile = document.getElementById('postFile');
    const postFileIndicator = document.getElementById('post-file-indicator');
    if (postFile && postFileIndicator) {
        postFile.onchange = (e) => {
            if (e.target.files[0]) {
                postFileIndicator.classList.remove('hidden');
                postFileIndicator.innerText = e.target.files[0].name;
            }
        };
    }

    // Drag & Drop for Ads
    const dropZone = document.getElementById('ad-drop-zone');
    const fileInput = document.getElementById('ad-file-input');
    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-emerald-500', 'bg-emerald-50');
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('border-emerald-500', 'bg-emerald-50');
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-emerald-500', 'bg-emerald-50');
            const file = e.dataTransfer.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                document.getElementById('adMedia').value = url;
                document.getElementById('adType').value = file.type.includes('video') ? 'video' : 'image';
                showToast("File received! Ready to publish.", 'success');
            }
        });
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                document.getElementById('adMedia').value = url;
                document.getElementById('adType').value = file.type.includes('video') ? 'video' : 'image';
            }
        });
    }

    const genCodeBtn = document.querySelector('#admin-view-apps button.bg-emerald-600');
    if (genCodeBtn) genCodeBtn.addEventListener('click', generateApprovalCode);

    const publishAdBtn = document.getElementById('publishAdBtn');
    if (publishAdBtn) publishAdBtn.addEventListener('click', publishAd);

    // Forms
    const submitAppBtn = document.querySelector('#applicationForm button');
    if (submitAppBtn) submitAppBtn.addEventListener('click', submitApplication);

    const upgradeBtn = document.querySelector('#apply button.bg-slate-900');
    if (upgradeBtn) upgradeBtn.addEventListener('click', upgradeAccount);

    // Provider
    const addListingBtn = document.querySelector('#provider-dashboard button');
    if (addListingBtn) addListingBtn.addEventListener('click', openProviderModal);

    const listingModalButtons = document.querySelectorAll('#listingModal button');
    if (listingModalButtons.length >= 2) {
        listingModalButtons[0].addEventListener('click', saveListing);
        listingModalButtons[1].addEventListener('click', closeListingModal);
    }

    // Chat
    const chatToggleBtn = document.querySelector('#chatbot > button');
    if (chatToggleBtn) chatToggleBtn.addEventListener('click', toggleChat);

    const chatCloseBtn = document.querySelector('#chatWindow button .fa-xmark')?.parentElement;
    if (chatCloseBtn) chatCloseBtn.addEventListener('click', toggleChat);

    const sendChatBtn = document.querySelector('#chatWindow button .fa-paper-plane')?.parentElement;
    if (sendChatBtn) sendChatBtn.addEventListener('click', sendChatMessage);

    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded - Initializing...");
    setupEventListeners();
    initApp();
    initRouter();
    console.log("Initialization complete.");
});
