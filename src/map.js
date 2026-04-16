import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

let map;
let markersGroup;
let markers = [];

// Custom Creative Icons
const icons = {
    Cab: L.divIcon({
        html: '<div class="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center border-2 border-white shadow-xl hover:scale-125 transition-transform"><i class="fa-solid fa-car text-sm"></i></div>',
        className: 'custom-pin', iconSize: [40, 40], iconAnchor: [20, 20]
    }),
    Hotel: L.divIcon({
        html: '<div class="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xl hover:scale-125 transition-transform"><i class="fa-solid fa-bed text-sm"></i></div>',
        className: 'custom-pin', iconSize: [40, 40], iconAnchor: [20, 20]
    }),
    Restaurant: L.divIcon({
        html: '<div class="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xl hover:scale-125 transition-transform"><i class="fa-solid fa-utensils text-sm"></i></div>',
        className: 'custom-pin', iconSize: [40, 40], iconAnchor: [20, 20]
    }),
    Tourist: L.divIcon({
        html: '<div class="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xl hover:scale-125 transition-transform"><i class="fa-solid fa-camera text-sm"></i></div>',
        className: 'custom-pin', iconSize: [40, 40], iconAnchor: [20, 20]
    }),
    Rental: L.divIcon({
        html: '<div class="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xl hover:scale-125 transition-transform"><i class="fa-solid fa-key text-sm"></i></div>',
        className: 'custom-pin', iconSize: [40, 40], iconAnchor: [20, 20]
    }),
    Default: L.divIcon({
        html: '<div class="w-10 h-10 bg-slate-400 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xl hover:scale-125 transition-transform"><i class="fa-solid fa-location-dot text-sm"></i></div>',
        className: 'custom-pin', iconSize: [40, 40], iconAnchor: [20, 20]
    })
};

export function initMap() {
    if (map) return map;
    map = L.map('map', { zoomControl: false }).setView([7.8731, 80.7718], 7);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    markersGroup = L.markerClusterGroup({
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });
    map.addLayer(markersGroup);

    // Add Locate Button
    const locateBtn = L.control({ position: 'topright' });
    locateBtn.onAdd = function() {
        const div = L.DomUtil.create('div', 'bg-white p-3 rounded-xl shadow-lg cursor-pointer hover:bg-slate-50 border mt-4 mr-4');
        div.innerHTML = '<i class="fa-solid fa-location-crosshairs text-emerald-600 text-lg"></i>';
        div.onclick = locateUser;
        return div;
    };
    locateBtn.addTo(map);

    return map;
}

export function locateUser() {
    if (!map) return;
    map.locate({ setView: true, maxZoom: 13 });
    map.on('locationfound', (e) => {
        L.circle(e.latlng, e.accuracy).addTo(map);
        import('./ui').then(m => m.showToast("Location found!", 'success'));
    });
    map.on('locationerror', () => {
        import('./ui').then(m => m.showToast("Could not access location.", 'error'));
    });
}

export function clearMarkers() {
    if (markersGroup) markersGroup.clearLayers();
    markers = [];
}

export function addMarker(lat, lng, category, data) {
    if (!map || !markersGroup) return;
    const icon = icons[category] || icons.Default;
    
    const popupContent = `
        <div class="w-64 -m-1 overflow-hidden rounded-2xl bg-white shadow-2xl">
            <img src="${data.image}" class="w-full h-32 object-cover">
            <div class="p-4">
                <h4 class="font-bold text-slate-900">${data.name}</h4>
                <p class="text-[10px] text-slate-400 font-bold uppercase mb-2">${category}</p>
                <div class="flex justify-between items-center pt-2 border-t">
                    <span class="font-black text-emerald-600">$${data.price}</span>
                    <button onclick="window.openDetailsModal('${data.id}')" class="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg">View Details</button>
                </div>
            </div>
        </div>
    `;

    const marker = L.marker([lat, lng], { icon });
    marker.bindPopup(popupContent, { closeButton: false, offset: [0, -10] });
    
    // Show popup on hover
    marker.on('mouseover', function (e) { this.openPopup(); });
    
    markersGroup.addLayer(marker);
}

export function invalidateMapSize() {
    if (map) map.invalidateSize();
}
