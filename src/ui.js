import { 
    app, auth, db, storage, functions, configAvailable, appId,
    signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, 
    onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInAnonymously,
    collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp,
    ref, uploadBytes, getDownloadURL,
    httpsCallable
} from './firebase';
import { initMap, clearMarkers, addMarker, invalidateMapSize } from './map';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
import Swal from 'sweetalert2';

// Professional Toast Helper
export function showToast(text, type = 'success') {
    Toastify({
        text: text,
        duration: 3000,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: type === 'success' ? "#10b981" : "#ef4444",
            borderRadius: "12px",
            fontWeight: "bold",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
        }
    }).showToast();
}

// Professional Storage Helper
async function uploadFile(file, folder) {
    if (!configAvailable || !file) return null;
    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}

function renderSkeletons(containerId, count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = Array(count).fill(0).map(() => `
        <div class="skeleton-card skeleton"></div>
    `).join('');
}

let state = { 
    user: null, 
    profile: null, 
    services: [
        { id: '1', name: 'Sigiriya Rock Fortress', category: 'Tourist', price: 30, image: 'https://images.unsplash.com/photo-1588596388566-44bb5f0a8c90?q=80&w=2070', lat: 7.957, lng: 80.760, desc: 'Ancient rock fortress with stunning views.' },
        { id: '2', name: 'Colombo Luxury Cab', category: 'Cab', price: 45, image: 'https://images.unsplash.com/photo-1549862214-e5658e805509?q=80&w=2070', lat: 6.927, lng: 79.861, desc: 'Premium city transfers in Colombo.' },
        { id: '3', name: 'Kandy Lake Pavilion', category: 'Restaurant', price: 55, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070', lat: 7.290, lng: 80.633, desc: 'Dine by the scenic Kandy Lake.' },
        { id: '4', name: 'Ella Nine Arch Bridge', category: 'Tourist', price: 0, image: 'https://images.unsplash.com/photo-1546182208-859426f848c7?q=80&w=2070', lat: 6.876, lng: 81.049, desc: 'Iconic railway bridge in the highlands.' },
        { id: '5', name: 'Galle Fort Hotel', category: 'Hotel', price: 180, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070', lat: 6.027, lng: 80.217, desc: 'Luxury stay inside the historic Galle Fort.' },
        { id: '6', name: 'Mirissa Whale Watch', category: 'Tourist', price: 40, image: 'https://images.unsplash.com/photo-1506929197484-904944907947?q=80&w=2070', lat: 5.948, lng: 80.451, desc: 'Experience the majesty of blue whales.' },
        { id: '7', name: 'Nuwara Eliya Tea Estate', category: 'Tourist', price: 15, image: 'https://images.unsplash.com/photo-1582234053625-99882991039f?q=80&w=2070', lat: 6.949, lng: 80.789, desc: 'Rolling hills of premium Ceylon tea.' },
        { id: '8', name: 'Yala Safari Jeeps', category: 'Rental', price: 90, image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070', lat: 6.363, lng: 81.471, desc: 'Thrilling wildlife safaris in Yala.' },
        { id: '9', name: 'Bentota Beach Resort', category: 'Hotel', price: 250, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070', lat: 6.423, lng: 79.995, desc: 'Golden sands and water sports.' },
        { id: '10', name: 'Arugam Bay Surf Cab', category: 'Cab', price: 35, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2070', lat: 6.841, lng: 81.831, desc: 'Easy rides for surfers in Arugam Bay.' },
        { id: '11', name: 'Traditional Rice & Curry', category: 'Restaurant', price: 12, image: 'https://plus.unsplash.com/premium_photo-1661339194241-1f9e99a842f1?q=80&w=2070', lat: 6.927, lng: 79.861, desc: 'Authentic Sri Lankan flavors.' },
        { id: '12', name: 'Kottu Roti Center', category: 'Restaurant', price: 8, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=2070', lat: 6.927, lng: 79.861, desc: 'The ultimate street food experience.' },
        { id: '13', name: 'Polonnaruwa Ancient City', category: 'Tourist', price: 25, image: 'https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=2070', lat: 7.940, lng: 81.000, desc: 'Explore the ruins of the medieval capital.' },
        { id: '14', name: 'Sinharaja Rain Forest', category: 'Tourist', price: 20, image: 'https://images.unsplash.com/photo-1580746769312-68c37d6e873b?q=80&w=2070', lat: 6.386, lng: 80.493, desc: 'UNESCO world heritage biodiversity hotspot.' },
        { id: '15', name: 'Horton Plains & Worlds End', category: 'Tourist', price: 30, image: 'https://images.unsplash.com/photo-1582234053625-99882991039f?q=80&w=2070', lat: 6.802, lng: 80.809, desc: 'Breathtaking cliffs and highland plains.' }
    ], 
    applications: [
        { id: 'app1', bizName: 'Ella Adventure', bizType: 'Tourist', status: 'pending' }
    ], 
    approvalCodes: [
        { id: 'c1', code: 'TEST-1234', used: false }
    ],
    ads: [
        { id: 'ad1', title: 'Summer in Unawatuna', type: 'image', media: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=2070' }
    ],
    bookings: [],
    transactions: [
        { id: 'TRX-9901', user: 'John Doe', amount: 120, status: 'completed', method: 'Visa' },
        { id: 'TRX-9902', user: 'Jane Smith', amount: 45, status: 'pending', method: 'PayPal' }
    ],
    chatLogs: [
        { id: 'SESS-01', user: 'John Doe', message: 'How do I book a cab?', time: '10:15 AM' },
        { id: 'SESS-01', user: 'Assistant', message: 'You can use the Explore Map to find active cabs.', time: '10:16 AM' }
    ],
    posts: [
        { id: 'p1', user: 'Shan Bhanuka', avatar: 'https://i.pravatar.cc/150?u=shan', text: 'Just visited Sigiriya! The view from the top is absolutely breathtaking. Highly recommend it to everyone visiting Sri Lanka! 🇱🇰', media: 'https://images.unsplash.com/photo-1588596388566-44bb5f0a8c90?q=80&w=2070', likes: 24, comments: 5, time: '2 hours ago' },
        { id: 'p2', user: 'Elena Smith', avatar: 'https://i.pravatar.cc/150?u=elena', text: 'The Kottu Roti here is to die for! Found a small stall in Colombo that serves the best street food.', media: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=2070', likes: 12, comments: 2, time: '5 hours ago' }
    ],
    friends: [
        { id: 'u1', name: 'John Explorer', avatar: 'https://i.pravatar.cc/150?u=john', status: 'Online' },
        { id: 'u2', name: 'Sarah Travel', avatar: 'https://i.pravatar.cc/150?u=sarah', status: 'Offline' }
    ],
    friendRequests: [
        { id: 'r1', name: 'Michael Scott', avatar: 'https://i.pravatar.cc/150?u=michael' }
    ],
    users: [
        { uid: 'u1', fullName: 'John Explorer', email: 'john@travel.com', role: 'tourist' },
        { uid: 'u2', fullName: 'Sarah Travel', email: 'sarah@blog.com', role: 'tourist' }
    ],
    currentFilter: 'All',
    authMode: 'login',
    selectedServiceForPayment: null
};

let activeListeners = [];

export function toggleMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    if (sideMenu && menuOverlay) {
        const isOpen = sideMenu.classList.toggle('drawer-open');
        if (isOpen) {
            menuOverlay.classList.remove('opacity-0', 'pointer-events-none');
            menuOverlay.classList.add('opacity-100', 'pointer-events-auto');
        } else {
            menuOverlay.classList.add('opacity-0', 'pointer-events-none');
            menuOverlay.classList.remove('opacity-100', 'pointer-events-auto');
        }
    }
}

export function toggleAuthModal() {
    document.getElementById('authModal').classList.toggle('hidden');
}

export function toggleAuthMode() {
    state.authMode = state.authMode === 'login' ? 'signup' : 'login';
    document.getElementById('authTitle').innerText = state.authMode === 'login' ? 'Explorer Access' : 'Create Explorer Account';
    document.getElementById('authSubmitBtn').innerText = state.authMode === 'login' ? 'Login' : 'Join Community';
    document.getElementById('authToggleBtn').innerText = state.authMode === 'login' ? 'Sign Up' : 'Login';
    document.getElementById('signupFields').classList.toggle('hidden', state.authMode === 'login');
    document.getElementById('verificationMsg').classList.add('hidden');
    document.getElementById('authFields').classList.remove('hidden');
}

export function navTo(id, push = true) {
    const viewRoutes = {
        'home': '/',
        'explore': '/explore',
        'apply': '/apply',
        'provider-dashboard': '/provider',
        'admin-console': '/admin',
        'bookings': '/bookings',
        'community': '/community'
    };

    if (push && viewRoutes[id]) {
        window.history.pushState({}, '', viewRoutes[id]);
    }

    ['home', 'explore', 'apply', 'provider-dashboard', 'admin-console', 'bookings', 'community'].forEach(v => {
        const el = document.getElementById(v);
        if(el) el.classList.add('hidden');
    });
    const target = document.getElementById(id);
    if(target) target.classList.remove('hidden');
    
    if(id === 'explore') {
        renderSkeletons('service-list', 6);
        setTimeout(() => { 
            initMap(); 
            invalidateMapSize(); 
            renderExplore();
        }, 200);
    }
    if(id === 'community') {
        renderSkeletons('community-feed', 3);
        setTimeout(() => {
            renderCommunity();
        }, 500);
    }
    if (id === 'admin-console') {
        renderAdminUsers();
        renderAdminServices();
        renderAdminApplications();
        renderAdminCodes();
        renderAds();
        renderFinancials();
        renderSupport();
        setAdminTab('apps');
    }
    window.scrollTo(0,0);
}

// --- Social Hub Logic ---

export function renderCommunity() {
    const feed = document.getElementById('community-feed');
    const friends = document.getElementById('community-friends');
    const requests = document.getElementById('community-requests');
    if (!feed || !friends || !requests) return;

    // Render Posts
    feed.innerHTML = state.posts.map(post => `
        <div class="bg-white rounded-3xl p-6 border shadow-sm space-y-4">
            <div class="flex items-center gap-3">
                <img src="${post.avatar}" class="w-12 h-12 rounded-full border-2 border-emerald-500">
                <div>
                    <h4 class="font-bold text-slate-800">${post.user}</h4>
                    <p class="text-[10px] text-slate-400 font-bold uppercase">${post.time}</p>
                </div>
            </div>
            <p class="text-slate-600 leading-relaxed">${post.text}</p>
            ${post.media ? `<img src="${post.media}" class="w-full rounded-2xl h-64 object-cover">` : ''}
            <div class="flex items-center gap-6 pt-4 border-t">
                <button onclick="window.toggleLike('${post.id}')" class="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm">
                    <i class="fa-solid fa-heart"></i> ${post.likes}
                </button>
                <button class="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm">
                    <i class="fa-solid fa-comment"></i> ${post.comments}
                </button>
                <button class="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm">
                    <i class="fa-solid fa-share"></i> Share
                </button>
            </div>
        </div>
    `).join('');

    // Render Friends
    friends.innerHTML = state.friends.map(f => `
        <div class="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition cursor-pointer">
            <div class="flex items-center gap-3">
                <div class="relative">
                    <img src="${f.avatar}" class="w-10 h-10 rounded-full">
                    <span class="absolute bottom-0 right-0 w-3 h-3 ${f.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-300'} border-2 border-white rounded-full"></span>
                </div>
                <span class="font-bold text-sm text-slate-700">${f.name}</span>
            </div>
            <i class="fa-solid fa-comment text-slate-300"></i>
        </div>
    `).join('');

    // Render Requests
    requests.innerHTML = state.friendRequests.map(r => `
        <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
            <div class="flex items-center gap-3">
                <img src="${r.avatar}" class="w-10 h-10 rounded-full">
                <span class="font-bold text-xs text-slate-700">${r.name}</span>
            </div>
            <div class="flex gap-2">
                <button onclick="window.acceptFriend('${r.id}')" class="flex-1 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-lg">Accept</button>
                <button class="flex-1 py-2 bg-white text-slate-400 text-[10px] font-bold rounded-lg border">Decline</button>
            </div>
        </div>
    `).join('');
}

export async function createPost() {
    const text = document.getElementById('postText').value;
    const file = document.getElementById('postFile').files[0];
    
    if (!text) return showToast("Please say something!", 'error');

    let mediaUrl = "";
    if (file) {
        showToast("Uploading media...", 'info');
        mediaUrl = await uploadFile(file, 'posts');
    }

    const newPost = {
        id: 'p' + Date.now(),
        user: state.profile?.fullName || 'Explorer',
        avatar: state.profile?.avatar || 'https://i.pravatar.cc/150?u=' + (state.user?.uid || 'guest'),
        text,
        media: mediaUrl,
        likes: 0,
        comments: 0,
        time: 'Just now'
    };

    if (configAvailable) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), { ...newPost, createdAt: serverTimestamp() });
    } else {
        state.posts.unshift(newPost);
        renderCommunity();
    }
    
    document.getElementById('postText').value = '';
    document.getElementById('postFile').value = '';
    document.getElementById('post-file-indicator').classList.add('hidden');
    showToast("Post Shared!", 'success');
}

window.toggleLike = (id) => {
    const post = state.posts.find(p => p.id === id);
    if (post) {
        post.likes++;
        renderCommunity();
    }
};

window.acceptFriend = (id) => {
    const req = state.friendRequests.find(r => r.id === id);
    if (req) {
        state.friends.push({ ...req, status: 'Online' });
        state.friendRequests = state.friendRequests.filter(r => r.id !== id);
        renderCommunity();
    }
};

// --- Missing Features Logic ---

export function searchMap() {
    const query = document.getElementById('mapSearch').value.toLowerCase();
    const serviceList = document.getElementById('service-list');
    if(!serviceList) return;
    
    clearMarkers();
    const filtered = state.services.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.category.toLowerCase().includes(query) ||
        (s.desc && s.desc.toLowerCase().includes(query))
    );
    
    serviceList.innerHTML = filtered.map(s => `
        <div class="bg-white rounded-3xl overflow-hidden border shadow-sm group hover:shadow-xl transition-all">
            <img src="${s.image}" class="h-48 w-full object-cover">
            <div class="p-6">
                <div class="flex justify-between items-start mb-2"><h4 class="font-bold text-lg">${s.name}</h4><span class="text-amber-500 text-xs font-bold"><i class="fa-solid fa-star"></i> 4.5</span></div>
                <p class="text-[10px] text-slate-400 mb-2 uppercase font-bold">${s.category}</p>
                <div class="flex justify-between items-center pt-4 border-t"><span class="font-black text-xl text-emerald-600">$${s.price}</span><button data-id="${s.id}" class="book-service-btn px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs">Book Now</button></div>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.book-service-btn').forEach(btn => {
        btn.addEventListener('click', () => bookService(btn.getAttribute('data-id')));
    });

    filtered.forEach(s => {
        addMarker(s.lat, s.lng, s.category, s);
    });
}

export function openDetailsModal(id) {
    const s = state.services.find(sv => sv.id === id);
    if (!s) return;
    
    const modal = document.createElement('div');
    modal.id = 'detailsModal';
    modal.className = 'fixed inset-0 z-[20000] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-[3rem] max-w-4xl w-full overflow-hidden shadow-2xl animate-fade-up max-h-[90vh] flex flex-col">
            <div class="relative h-64 flex-shrink-0">
                <img src="${s.image}" class="w-full h-full object-cover">
                <button onclick="this.closest('#detailsModal').remove()" class="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="p-10 space-y-6 overflow-y-auto flex-1">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">${s.category}</span>
                        <h2 class="text-4xl font-black text-slate-900 mt-2">${s.name}</h2>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Price Starts At</p>
                        <p class="text-3xl font-black text-emerald-600">$${s.price}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div class="space-y-4">
                        <h4 class="font-bold text-lg text-slate-800 border-b pb-2">About this Experience</h4>
                        <p class="text-slate-500 leading-relaxed">${s.desc || 'Experience the beauty and culture of Sri Lanka with our premium services.'}</p>
                        <div class="flex gap-4 pt-4">
                            <button onclick="this.closest('#detailsModal').remove(); window.bookService('${s.id}')" class="flex-1 py-5 bg-emerald-600 text-white font-bold rounded-2xl text-lg shadow-xl hover:bg-emerald-700 transition">Book Now</button>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <h4 class="font-bold text-lg text-slate-800 border-b pb-2">Reviews & Ratings</h4>
                        <div id="reviews-container" class="space-y-4 max-h-48 overflow-y-auto pr-2">
                            <p class="text-slate-400 text-sm italic">Loading reviews...</p>
                        </div>
                        
                        <div class="bg-slate-50 p-4 rounded-2xl border space-y-3">
                            <p class="text-[10px] font-black text-slate-400 uppercase">Leave a Review</p>
                            <div class="flex gap-1 text-amber-400" id="star-rating" data-selected="5">
                                <i class="fa-solid fa-star cursor-pointer" data-val="1"></i>
                                <i class="fa-solid fa-star cursor-pointer" data-val="2"></i>
                                <i class="fa-solid fa-star cursor-pointer" data-val="3"></i>
                                <i class="fa-solid fa-star cursor-pointer" data-val="4"></i>
                                <i class="fa-solid fa-star cursor-pointer" data-val="5"></i>
                            </div>
                            <textarea id="reviewText" placeholder="How was your experience?" class="w-full p-3 bg-white border rounded-xl text-sm outline-none h-20"></textarea>
                            <button onclick="window.submitReview('${s.id}')" class="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-black transition">Submit Review</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Fetch and Render Reviews
    if (configAvailable) {
        onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'services', id, 'reviews'), (snap) => {
            const reviewsContainer = document.getElementById('reviews-container');
            if (!reviewsContainer) return;
            if (snap.empty) {
                reviewsContainer.innerHTML = '<p class="text-slate-400 text-sm italic">No reviews yet.</p>';
                return;
            }
            reviewsContainer.innerHTML = snap.docs.map(doc => {
                const r = doc.data();
                return `
                    <div class="bg-white p-4 rounded-2xl border shadow-sm space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-xs text-slate-700">${r.userName}</span>
                            <div class="flex text-[10px] text-amber-400">
                                ${Array(5).fill(0).map((_, i) => `<i class="fa-${i < r.rating ? 'solid' : 'regular'} fa-star"></i>`).join('')}
                            </div>
                        </div>
                        <p class="text-slate-500 text-xs leading-relaxed">${r.comment}</p>
                    </div>
                `;
            }).join('');
        });
    } else {
        document.getElementById('reviews-container').innerHTML = '<p class="text-slate-400 text-sm italic">Connect Firebase to see real reviews.</p>';
    }

    // Star selection logic
    const stars = modal.querySelectorAll('#star-rating i');
    stars.forEach(s => {
        s.addEventListener('click', () => {
            const val = s.getAttribute('data-val');
            stars.forEach((st, idx) => {
                st.classList.toggle('fa-solid', idx < val);
                st.classList.toggle('fa-regular', idx >= val);
            });
            modal.querySelector('#star-rating').setAttribute('data-selected', val);
        });
    });
}

window.submitReview = async (serviceId) => {
    if(!state.user) return toggleAuthModal();
    const text = document.getElementById('reviewText').value;
    const rating = document.getElementById('star-rating').getAttribute('data-selected') || 5;
    
    if(!text) return showToast("Please write a comment.", 'error');

    const reviewData = {
        userId: state.user.uid,
        userName: state.profile?.fullName || 'Explorer',
        rating: Number(rating),
        comment: text,
        createdAt: serverTimestamp()
    };

    if (configAvailable) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'services', serviceId, 'reviews'), reviewData);
    }
    
    showToast("Review submitted!", 'success');
    document.getElementById('reviewText').value = '';
    // Reload UI or update locally
};

window.openDetailsModal = (id) => openDetailsModal(id);
window.bookService = (id) => bookService(id);

export function toggleConfigModal() {
    alert("System Configuration v1.0.4\n--------------------------\nNodes: Active (12/12)\nDatabase: Sri Lanka-South Central\nEdge Caching: Enabled\nDemo Mode: Active\n\nUpdate: No updates available.");
}


export function toggleStaffModal() {
    document.getElementById('staffModal').classList.toggle('hidden');
}

export async function verifyStaff() {
    const u = document.getElementById('staffUser').value;
    const p = document.getElementById('staffPass').value;
    
    if(u === "TBK" && p === "000011110000") {
        try {
            let currentUser = auth.currentUser;
            if (!currentUser) {
                const cred = await signInAnonymously(auth);
                currentUser = cred.user;
            }
            
            if (currentUser) {
                await setDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'data'), { 
                    role: 'admin',
                    fullName: 'TBK Administrator',
                    email: currentUser.email || 'staff@tbk.com'
                }, { merge: true });
                
                showToast("Staff Dashboard Unlocked.", 'success');
                toggleStaffModal();
                location.reload();
            }
        } catch (err) {
            console.error("Admin verification error:", err);
            showToast("Error accessing backend.", 'error');
        }
    } else { 
        showToast("Access Denied.", 'error'); 
    }
}

export async function handleAuthSubmit() {
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPass').value;
    if(!email || !pass) return showToast("Required fields missing.", 'error');
    
    if (!configAvailable) {
        if (email === 'theshanbhanuka4@gmail.com' && pass === '0000') {
            const mockUser = { uid: 'mock-admin', email };
            const mockProfile = { role: 'admin', email, fullName: 'System Admin (Demo)', avatar: 'https://i.pravatar.cc/150?u=admin' };
            localStorage.setItem('demo_user', JSON.stringify(mockUser));
            localStorage.setItem('demo_profile', JSON.stringify(mockProfile));
            state.user = mockUser;
            state.profile = mockProfile;
            updateUIForRole();
            toggleAuthModal();
            renderAdminUsers();
            renderAdminServices();
            renderAdminApplications();
            renderAdminCodes();
            renderAds();
            renderFinancials();
            renderSupport();
            showToast("Demo Mode: Logged in as Admin.", 'success');
            return;
        } else if (state.authMode === 'signup') {
            const name = document.getElementById('regName').value;
            const avatar = document.getElementById('regAvatar').value || 'https://i.pravatar.cc/150?u=' + email;
            const mockUser = { uid: 'u-' + Date.now(), email };
            const mockProfile = { role: 'tourist', email, fullName: name || 'Explorer', avatar };
            localStorage.setItem('demo_user', JSON.stringify(mockUser));
            localStorage.setItem('demo_profile', JSON.stringify(mockProfile));
            state.user = mockUser;
            state.profile = mockProfile;
            updateUIForRole();
            toggleAuthModal();
            showToast("Demo Mode: Account Created Locally.", 'success');
            return;
        }
        return showToast("Demo Mode: Use admin credentials or configure Firebase.", 'info');
    }

    try {
        if(state.authMode === 'signup') {
            const name = document.getElementById('regName').value;
            const avatar = document.getElementById('regAvatar').value || '';
            const cred = await createUserWithEmailAndPassword(auth, email, pass);
            await sendEmailVerification(cred.user);
            await setDoc(doc(db, 'artifacts', appId, 'users', cred.user.uid, 'profile', 'data'), {
                role: 'tourist', email, fullName: name || 'Explorer', avatar, registeredAt: serverTimestamp()
            }, { merge: true });
            document.getElementById('verificationMsg').classList.remove('hidden');
        } else { 
            if (email === 'theshanbhanuka4@gmail.com' && pass !== '0000') {
                return showToast("Invalid Admin Password.", 'error');
            }
            await signInWithEmailAndPassword(auth, email, pass); 
            toggleAuthModal(); 
        }
    } catch (err) { showToast(err.message, 'error'); }
}

export async function handleGoogleAuth() {
    if(!configAvailable) return showToast("Demo Mode: Google Login not available.", 'info');
    const provider = new GoogleAuthProvider();
    try {
        const cred = await signInWithPopup(auth, provider);
        await setDoc(doc(db, 'artifacts', appId, 'users', cred.user.uid, 'profile', 'data'), {
            role: 'tourist',
            email: cred.user.email,
            fullName: cred.user.displayName,
            lastLogin: serverTimestamp()
        }, { merge: true });
        toggleAuthModal();
    } catch (err) { showToast("Auth Error. Try Email/Password.", 'error'); }
}

export function handleLogout() {
    if (configAvailable) {
        signOut(auth);
    } else {
        localStorage.removeItem('demo_user');
        localStorage.removeItem('demo_profile');
        state.user = null;
        state.profile = null;
        resetUI();
    }
}

export function filterCategory(cat) {
    state.currentFilter = cat;
    document.querySelectorAll('.category-chip').forEach(c => c.classList.toggle('active', c.innerText === cat));
    renderExplore();
}

export function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow) {
        chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
    }
}

export function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if(!input.value) return;
    const msgs = document.getElementById('chatMessages');
    const userMsg = input.value;
    msgs.innerHTML += `<div class="bg-emerald-50 p-3 rounded-2xl rounded-tr-none ml-8 text-right">${userMsg}</div>`;
    
    // Add to admin monitor
    state.chatLogs.push({ id: 'SESS-LIVE', user: 'Guest', message: userMsg, time: new Date().toLocaleTimeString() });
    renderSupport();

    setTimeout(() => {
        const reply = `I'll pass your inquiry about "${userMsg}" to our travel experts.`;
        msgs.innerHTML += `<div class="bg-slate-100 p-3 rounded-2xl rounded-tl-none mr-8">${reply}</div>`;
        msgs.scrollTo(0, msgs.scrollHeight);
        state.chatLogs.push({ id: 'SESS-LIVE', user: 'Assistant', message: reply, time: new Date().toLocaleTimeString() });
        renderSupport();
    }, 1000);
    input.value = "";
}

function renderExplore() {
    const exploreEl = document.getElementById('explore');
    const serviceList = document.getElementById('service-list');
    if(!exploreEl || !serviceList) return;
    
    clearMarkers();
    const filtered = state.currentFilter === 'All' ? state.services : state.services.filter(s => s.category === state.currentFilter);
    serviceList.innerHTML = filtered.map(s => `
        <div class="bg-white rounded-3xl overflow-hidden border shadow-sm group hover:shadow-xl transition-all">
            <img src="${s.image}" class="h-48 w-full object-cover">
            <div class="p-6">
                <div class="flex justify-between items-start mb-2"><h4 class="font-bold text-lg">${s.name}</h4><span class="text-amber-500 text-xs font-bold"><i class="fa-solid fa-star"></i> 4.5</span></div>
                <p class="text-[10px] text-slate-400 mb-2 uppercase font-bold">${s.category}</p>
                <div class="flex justify-between items-center pt-4 border-t"><span class="font-black text-xl text-emerald-600">$${s.price}</span><button data-id="${s.id}" class="book-service-btn px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs">Book Now</button></div>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.book-service-btn').forEach(btn => {
        btn.addEventListener('click', () => bookService(btn.getAttribute('data-id')));
    });

    filtered.forEach(s => {
        addMarker(s.lat, s.lng, s.category, s);
    });
}

export async function bookService(id) {
    if(!state.user) return toggleAuthModal();
    const s = state.services.find(sv => sv.id === id);
    if (!s) return;
    
    // Open Payment Modal
    state.selectedServiceForPayment = s;
    const payModal = document.getElementById('paymentModal');
    const payName = document.getElementById('payServiceName');
    const payAmt = document.getElementById('payAmount');
    
    if (payModal && payName && payAmt) {
        payName.innerText = s.name;
        payAmt.innerText = `$${s.price.toFixed(2)}`;
        payModal.classList.remove('hidden');
    }
}

export async function confirmPayment() {
    const s = state.selectedServiceForPayment;
    if (!s) return;
    
    const confirmBtn = document.getElementById('confirmPayBtn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Initializing Secure Gateway...';
    }

    if (!configAvailable) {
        // ... (Keep existing demo logic)
        return showToast("Demo Mode: Payment Simulated.", 'info');
    }

    try {
        // 1. Call Firebase Cloud Function to create Stripe Payment Intent
        const createCheckout = httpsCallable(functions, 'createStripeCheckout');
        const { data } = await createCheckout({ amount: s.price, serviceName: s.name });
        
        const { clientSecret, paymentId } = data;

        // 2. Initialize Stripe
        // Note: You must replace 'pk_test_...' with your real Stripe Publishable Key
        const stripe = Stripe('pk_test_51P2k3l...'); 
        
        // 3. Confirm Payment (This will handle 3D Secure if needed)
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: { /* In a real app, you'd use Stripe Elements here */ },
                billing_details: { name: state.profile?.fullName || 'Traveler' }
            }
        });

        if (result.error) {
            showToast(result.error.message, 'error');
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                // 4. Log booking in Firestore
                await addDoc(collection(db, 'artifacts', appId, 'users', state.user.uid, 'bookings'), { 
                    serviceName: s.name, 
                    bookedAt: serverTimestamp(), 
                    status: 'confirmed',
                    amount: s.price,
                    paymentId: paymentId
                });
                
                showToast("Payment Successful! Reservation Confirmed.", 'success');
                document.getElementById('paymentModal').classList.add('hidden');
            }
        }
    } catch (err) {
        console.error("Payment Flow Error:", err);
        showToast("Payment failed. Please try again.", 'error');
    } finally {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerText = 'Pay Now & Confirm Booking';
        }
        state.selectedServiceForPayment = null;
    }
}

export async function submitApplication() {
    if(!state.user) return toggleAuthModal();
    const appData = { 
        userId: state.user.uid, 
        bizName: document.getElementById('appBizName').value, 
        bizType: document.getElementById('appBizType').value, 
        bizDesc: document.getElementById('appBizDesc').value, 
        status: 'pending', 
        appliedAt: new Date() 
    };
    if (configAvailable) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'applications'), appData);
    } else {
        state.applications.push({ id: Date.now().toString(), ...appData });
        renderAdminApplications();
    }
    alert("Application Logged.");
}

export async function generateApprovalCode() {
    const code = 'VFY-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    if (configAvailable) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'approvalCodes'), { 
            code, used: false, createdAt: serverTimestamp() 
        });
    } else {
        state.approvalCodes.push({ id: Date.now().toString(), code, used: false });
        renderAdminCodes();
    }
}

export async function upgradeAccount() {
    const codeInput = document.getElementById('upgradeCode').value.trim().toUpperCase();
    const match = state.approvalCodes.find(c => c.code === codeInput && !c.used);
    if(!match) return showToast("Invalid Code.", 'error');
    if (configAvailable) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'approvalCodes', match.id), { used: true });
        await setDoc(doc(db, 'artifacts', appId, 'users', state.user.uid, 'profile', 'data'), { role: 'provider' }, { merge: true });
    } else {
        match.used = true;
        state.profile.role = 'provider';
        updateUIForRole();
    }
    showToast("Account Upgraded to Provider!", 'success');
    location.reload();
}

export async function saveListing() {
    const name = document.getElementById('listName').value;
    const cat = document.getElementById('listCategory').value;
    const price = document.getElementById('listPrice').value;
    const img = document.getElementById('listImg').value;
    const lat = Number(document.getElementById('listLat').value);
    const lng = Number(document.getElementById('listLng').value);
    if (!name || isNaN(lat)) return showToast("Incomplete fields.", 'error');
    const svcData = { ownerId: state.user.uid, name, category: cat, price, image: img, lat, lng, addedAt: new Date() };
    if (configAvailable) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'services'), svcData);
    } else {
        state.services.push({ id: Date.now().toString(), ...svcData });
        renderExplore();
        renderProviderDashboard();
        renderAdminServices();
    }
    showToast("Business Listing Published!", 'success');
    closeListingModal();
}

export function openProviderModal() { document.getElementById('listingModal').classList.remove('hidden'); }
export function closeListingModal() { document.getElementById('listingModal').classList.add('hidden'); }

export function setAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-content').forEach(c => c.classList.add('hidden'));
    const tabEl = document.getElementById(`adm-tab-${tab}`);
    const viewEl = document.getElementById(`admin-view-${tab}`);
    if (tabEl) tabEl.classList.add('active');
    if (viewEl) viewEl.classList.remove('hidden');
    
    if (tab === 'all-bookings') renderMasterBookings();
    if (tab === 'financials') renderFinancials();
    if (tab === 'support') renderSupport();
    renderAnalytics();
}

function renderAnalytics() {
    const revEl = document.getElementById('stat-revenue');
    const userEl = document.getElementById('stat-users');
    const svcEl = document.getElementById('stat-services');
    const bookEl = document.getElementById('stat-bookings');
    
    if (revEl) {
        const totalRev = state.transactions.filter(t => t.status === 'completed').reduce((acc, t) => acc + Number(t.amount), 0);
        revEl.innerText = `$${totalRev}`;
    }
    if (userEl) userEl.innerText = state.users.length;
    if (svcEl) svcEl.innerText = state.services.length;
    if (bookEl) bookEl.innerText = state.bookings.length;
}

function renderFinancials() {
    const container = document.getElementById('transaction-list');
    if(!container) return;
    container.innerHTML = state.transactions.map(t => `
        <tr>
            <td class="px-8 py-4 font-mono font-bold text-slate-400 text-xs">${t.id}</td>
            <td class="px-8 py-4 font-bold text-slate-700">${t.user}</td>
            <td class="px-8 py-4 font-black text-emerald-600">$${t.amount}</td>
            <td class="px-8 py-4 uppercase text-[10px] font-black ${t.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}">${t.status}</td>
            <td class="px-8 py-4 text-slate-400 font-bold">${t.method}</td>
        </tr>
    `).join('');
}

function renderSupport() {
    const sessionList = document.getElementById('chat-session-list');
    const monitorBody = document.getElementById('chat-monitor-body');
    if (sessionList) {
        sessionList.innerHTML = `<div class="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center"><span class="font-bold text-sm">Guest Explorer</span><span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span></div>`;
    }
    if (monitorBody) {
        monitorBody.innerHTML = state.chatLogs.map(l => `<div class="flex gap-4"><span class="text-slate-500">[${l.time}]</span><span class="${l.user === 'Assistant' ? 'text-emerald-400' : 'text-white'} font-bold">${l.user}:</span><span>${l.message}</span></div>`).join('');
        monitorBody.scrollTo(0, monitorBody.scrollHeight);
    }
}

function renderMasterBookings() {
    const container = document.getElementById('master-bookings-list');
    if(!container) return;
    container.innerHTML = state.bookings.map(b => `
        <tr>
            <td class="px-6 py-4 font-bold text-slate-700">${b.serviceName}</td>
            <td class="px-6 py-4"><span class="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full">${b.status.toUpperCase()}</span></td>
            <td class="px-6 py-4 text-right"><button data-id="${b.id}" class="cancel-booking-btn text-red-400 hover:text-red-600"><i class="fa-solid fa-ban"></i></button></td>
        </tr>
    `).join('');
    
    document.querySelectorAll('.cancel-booking-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            state.bookings = state.bookings.filter(bk => bk.id !== id);
            renderMasterBookings();
            renderAnalytics();
        });
    });
}

export function exportAllData() {
    if(state.profile?.role !== 'admin') return;
    let csv = "CATEGORY,NAME,EMAIL/ID,DETAILS\n";
    state.users.forEach(u => csv += `USER,${u.fullName || 'User'},${u.email},${u.role}\n`);
    state.applications.forEach(a => csv += `APPLICATION,${a.bizName},${a.bizType},${a.status}\n`);
    state.services.forEach(s => csv += `SERVICE,${s.name},${s.category},$${s.price}\n`);

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CeylonVoyage_Export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function renderAdminUsers() {
    const container = document.getElementById('admin-users-list');
    if(!container) return;
    container.innerHTML = state.users.map(u => `
        <tr>
            <td class="px-6 py-4 font-bold text-slate-700">${u.fullName || 'Anonymous'}</td>
            <td class="px-6 py-4 text-slate-400">${u.email}</td>
            <td class="px-6 py-4 uppercase text-[10px] font-black">${u.role}</td>
            <td class="px-6 py-4 text-right"><button data-uid="${u.uid}" class="delete-user-btn text-red-400 hover:text-red-600"><i class="fa-solid fa-user-xmark"></i></button></td>
        </tr>
    `).join('');
    
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteUser(btn.getAttribute('data-uid')));
    });
}

export async function deleteUser(uid) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this user deletion!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Yes, delete user'
    });

    if(result.isConfirmed) {
        if (configAvailable) {
            await deleteDoc(doc(db, 'artifacts', appId, 'users', uid));
        }
        state.users = state.users.filter(u => u.uid !== uid);
        renderAdminUsers();
        showToast("User deleted.", 'success');
    }
}

export async function publishAd() {
    const title = document.getElementById('adTitle').value;
    const type = document.getElementById('adType').value;
    const media = document.getElementById('adMedia').value;
    const text = document.getElementById('adText').value;
    if(!title) return alert("Missing content.");
    
    const adData = { title, type, media, text, createdAt: new Date() };
    
    if (type === 'logo-aura') {
        const aura = document.getElementById('logo-aura');
        if (aura) {
            aura.style.background = media || 'rgba(16, 185, 129, 0.4)';
            aura.classList.remove('bg-emerald-500/0');
            aura.classList.add('bg-emerald-500/40');
            alert("Modern Logo Aura Ad pushed live.");
        }
        return;
    }

    if (configAvailable) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'ads'), adData);
    } else {
        state.ads.push({ id: Date.now().toString(), ...adData });
        renderAds();
    }
    alert("Ad published.");
}

function renderAds() {
    const bannerList = document.getElementById('ad-banner-list');
    const adminAds = document.getElementById('admin-ads-list');
    const sponsoredSection = document.getElementById('sponsored-section');
    if (state.ads.length > 0 && sponsoredSection) sponsoredSection.classList.remove('hidden');
    const adHTML = state.ads.map(ad => `
        <div class="relative bg-slate-900 rounded-2xl overflow-hidden group shadow-xl">
            ${ad.type === 'video' ? 
                `<iframe class="w-full aspect-video pointer-events-none" src="${ad.media.includes('youtube') ? ad.media : 'https://www.youtube.com/embed/' + ad.media}" frameborder="0" allow="autoplay; muted; loop"></iframe>` :
                `<img src="${ad.media}" class="w-full h-48 object-cover opacity-60">`
            }
            <div class="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                <span class="text-[10px] font-bold text-emerald-400 uppercase mb-2">SPONSORED</span>
                <h4 class="text-white font-bold">${ad.title}</h4>
            </div>
        </div>
    `).join('');
    if(bannerList) bannerList.innerHTML = adHTML;
    if(adminAds) {
        adminAds.innerHTML = state.ads.map(ad => `<div class="p-4 bg-slate-50 border rounded-xl flex justify-between"><span>${ad.title}</span><button data-id="${ad.id}" class="delete-ad-btn text-red-400"><i class="fa-solid fa-trash"></i></button></div>`).join('');
        document.querySelectorAll('.delete-ad-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteAd(btn.getAttribute('data-id')));
        });
    }
}

export async function deleteAd(id) { 
    if (configAvailable) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ads', id)); 
    state.ads = state.ads.filter(a => a.id !== id);
    renderAds();
}
export async function deleteService(id) { 
    if (configAvailable) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services', id)); 
    state.services = state.services.filter(s => s.id !== id);
    renderExplore();
    renderProviderDashboard();
    renderAdminServices();
}

function renderAdminServices() {
    const container = document.getElementById('admin-service-moderation');
    if(!container) return;
    container.innerHTML = state.services.map(s => `
        <div class="bg-white p-5 rounded-2xl border shadow-sm">
            <img src="${s.image}" class="w-full h-32 object-cover rounded-xl mb-4">
            <h5 class="font-bold text-sm">${s.name}</h5>
            <button data-id="${s.id}" class="delete-service-btn w-full mt-4 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold">Suspend</button>
        </div>
    `).join('');
    document.querySelectorAll('.delete-service-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteService(btn.getAttribute('data-id')));
    });
}

function renderAdminApplications() {
    const container = document.getElementById('admin-applications');
    if(!container) return;
    container.innerHTML = state.applications.map(app => `
        <div class="bg-white p-6 rounded-2xl border flex justify-between items-center">
            <div><h4 class="font-bold">${app.bizName}</h4><p class="text-[10px] text-emerald-600 font-bold uppercase">${app.bizType}</p></div>
            <button data-id="${app.id}" class="delete-app-btn text-red-400"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
    document.querySelectorAll('.delete-app-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            if (configAvailable) deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'applications', id));
            state.applications = state.applications.filter(a => a.id !== id);
            renderAdminApplications();
        });
    });
}

function renderAdminCodes() {
    const container = document.getElementById('active-codes');
    if(!container) return;
    container.innerHTML = state.approvalCodes.map(c => `<span class="px-3 py-1 bg-slate-100 rounded-lg font-mono text-[10px] font-bold ${c.used ? 'text-slate-300 line-through' : 'text-emerald-700'}">${c.code}</span>`).join('');
}

function renderProviderDashboard() {
    const container = document.getElementById('provider-services');
    if(!container || !state.user) return;
    container.innerHTML = state.services.filter(s => s.ownerId === state.user.uid).map(s => `
        <div class="bg-white rounded-3xl border p-4">
            <img src="${s.image}" class="w-full h-32 object-cover rounded-xl">
            <h4 class="font-bold mt-4">${s.name}</h4>
            <button data-id="${s.id}" class="delete-service-btn text-red-500 text-[10px] font-bold mt-4">Remove Business</button>
        </div>
    `).join('');
    document.querySelectorAll('.delete-service-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteService(btn.getAttribute('data-id')));
    });
}

function renderBookings() {
    const container = document.getElementById('my-bookings-list');
    if(!container) return;
    container.innerHTML = state.bookings.map(b => `
        <div class="flex justify-between items-center p-6 bg-white rounded-2xl border shadow-sm">
            <h4 class="font-bold">${b.serviceName}</h4>
            <div class="flex items-center gap-4">
                <span class="px-4 py-1.5 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full">CONFIRMED</span>
                <button onclick="window.cancelUserBooking('${b.id}')" class="text-red-400 hover:text-red-600 p-2"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        </div>
    `).join('');
}

window.cancelUserBooking = async (id) => {
    const result = await Swal.fire({
        title: 'Cancel Reservation?',
        text: "Are you sure you want to cancel this booking?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Yes, cancel it'
    });

    if(result.isConfirmed) {
        state.bookings = state.bookings.filter(bk => bk.id !== id);
        renderBookings();
        showToast("Reservation cancelled.", 'info');
    }
};

function updateUIForRole() {
    const b = document.getElementById('roleBadge');
    const ab = document.getElementById('authBtn');
    const admL = document.getElementById('adminLink');
    const provL = document.getElementById('providerLink');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');

    if(b) { b.innerText = state.profile?.role || 'tourist'; b.classList.remove('hidden'); }
    if(ab) { ab.innerText = 'Logout'; }
    if(state.profile?.role === 'admin') admL && admL.classList.remove('hidden');
    if(state.profile?.role === 'provider') provL && provL.classList.remove('hidden');
    
    if(userAvatar && state.profile?.avatar) userAvatar.src = state.profile.avatar;
    if(userName && state.profile?.fullName) userName.innerText = state.profile.fullName;
}

function resetUI() {
    ['roleBadge', 'adminLink', 'providerLink'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    const ab = document.getElementById('authBtn');
    if(ab) { ab.innerText = 'Login'; }
    navTo('home');
}

function setupDataListeners() {
    if(!state.user || !configAvailable) return;
    
    const errorHandler = (err) => console.error("Permission error:", err);

    activeListeners.push(onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'services'), (snap) => {
        state.services = snap.docs.map(d => ({id: d.id, ...d.data()}));
        renderExplore();
        renderProviderDashboard();
        renderAdminServices();
    }, errorHandler));

    activeListeners.push(onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'ads'), (snap) => {
        state.ads = snap.docs.map(d => ({id: d.id, ...d.data()}));
        renderAds();
    }, errorHandler));

    if(state.profile?.role === 'admin') {
        activeListeners.push(onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'applications'), (snap) => {
            state.applications = snap.docs.map(d => ({id: d.id, ...d.data()}));
            renderAdminApplications();
        }, errorHandler));

        activeListeners.push(onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'approvalCodes'), (snap) => {
            state.approvalCodes = snap.docs.map(d => ({id: d.id, ...d.data()}));
            renderAdminCodes();
        }, errorHandler));

        getDocs(collection(db, 'artifacts', appId, 'users')).then(async (snap) => {
            const users = [];
            for(const uDoc of snap.docs) {
                const p = await getDoc(doc(db, 'artifacts', appId, 'users', uDoc.id, 'profile', 'data'));
                if(p.exists()) users.push({uid: uDoc.id, ...p.data()});
            }
            state.users = users;
            renderAdminUsers();
        }).catch(errorHandler);
    }
    activeListeners.push(onSnapshot(collection(db, 'artifacts', appId, 'users', state.user.uid, 'bookings'), (snap) => {
        state.bookings = snap.docs.map(d => ({id: d.id, ...d.data()}));
        renderBookings();
    }, errorHandler));
}

export function initApp() {
    if (!configAvailable) { 
        const mockUser = JSON.parse(localStorage.getItem('demo_user'));
        const mockProfile = JSON.parse(localStorage.getItem('demo_profile'));
        if (mockUser && mockProfile) {
            state.user = mockUser;
            state.profile = mockProfile;
            updateUIForRole();
            renderAdminUsers();
            renderAdminServices();
            renderAdminApplications();
            renderAdminCodes();
            renderAds();
            renderExplore();
            renderFinancials();
            renderSupport();
        } else {
            resetUI(); 
            renderExplore();
        }
        return; 
    }
    onAuthStateChanged(auth, async (user) => {
        state.user = user;
        activeListeners.forEach(unsub => unsub());
        activeListeners = [];
        
        if(user) {
            try {
                const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
                const snap = await getDoc(profileRef);
                
                if (user.email === 'theshanbhanuka4@gmail.com') {
                    state.profile = { role: 'admin', email: user.email, fullName: 'System Admin' };
                    await setDoc(profileRef, state.profile, { merge: true });
                } else if (!snap.exists()) {
                    state.profile = { role: 'tourist', email: user.email };
                    await setDoc(profileRef, state.profile, { merge: true });
                } else {
                    state.profile = snap.data();
                }
                
                updateUIForRole();
                setupDataListeners();
            } catch (err) { 
                console.error("Auth Observer Error:", err);
                updateUIForRole(); 
            }
        } else { 
            resetUI(); 
        }
    });
}
