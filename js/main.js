// Set up the map (will be centered when GPS location is found)
const map = L.map('map').setView([0, 0], 2); // Very zoomed out initially
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// State variables
let watchID = null;
let polylineLayers = [];
let currentLocationMarker = null;
let accuracyCircle = null;
const colors = ['blue', 'green', 'red', 'gray', 'purple'];

// Helper function to format the date
function getFormattedDate(daysAgo = 0) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().slice(0, 10);
}

function getRouteData(dateKey) {
    const savedData = localStorage.getItem(dateKey);
    if (!savedData) return [];
    
    const data = JSON.parse(savedData);
    // Filter out any default/invalid coordinates more strictly
    return data.filter(point => {
        const [lat, lon] = point;
        return lat !== 0 && lon !== 0 && 
               lat !== 12.2958 && lon !== 76.6394 && // Mysore default
               Math.abs(lat) > 0.001 && Math.abs(lon) > 0.001 && // Not too close to 0,0
               lat >= -90 && lat <= 90 && 
               lon >= -180 && lon <= 180;
    });
}

function saveRouteData(dateKey, data) {
    localStorage.setItem(dateKey, JSON.stringify(data));
}

function clearRoutes() {
    polylineLayers.forEach(layer => map.removeLayer(layer));
    polylineLayers = [];
}

// Get the last known location from today's route
function getLastKnownLocation() {
    const today = getFormattedDate(0);
    const todayRoute = getRouteData(today);
    if (todayRoute.length > 0) {
        const lastLocation = todayRoute[todayRoute.length - 1];
        const [lat, lon] = lastLocation;
        // Make sure it's not a default coordinate
        if (lat !== 0 && lon !== 0 && lat !== 12.2958 && lon !== 76.6394) {
            return lastLocation;
        }
    }
    return null;
}

// Update current location marker
function updateCurrentLocationMarker(lat, lon, accuracy = 10) {
    // Remove existing marker and circle
    if (currentLocationMarker) {
        map.removeLayer(currentLocationMarker);
    }
    if (accuracyCircle) {
        map.removeLayer(accuracyCircle);
    }
    
    // Create custom location icon
    const currentLocationIcon = L.divIcon({
        className: 'current-location-marker',
        html: '<div class="current-location-dot"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    
    // Add marker
    currentLocationMarker = L.marker([lat, lon], {
        icon: currentLocationIcon
    }).addTo(map);
    
    // Add accuracy circle
    accuracyCircle = L.circle([lat, lon], {
        color: '#4285f4',
        fillColor: '#4285f4',
        fillOpacity: 0.15,
        radius: accuracy,
        weight: 2
    }).addTo(map);
}

function drawAllRoutes() {
    clearRoutes(); // Clear existing lines before redrawing
    let allPoints = [];
    const selectedValue = document.getElementById('routeSelect').value;

    const routesToDraw = [];
    
    if (selectedValue === 'all') {
        routesToDraw.push({ date: getFormattedDate(0), color: colors[0] }); // Today
        routesToDraw.push({ date: getFormattedDate(1), color: colors[1] }); // Yesterday
        routesToDraw.push({ date: getFormattedDate(2), color: colors[2] }); // Day 2
        routesToDraw.push({ date: getFormattedDate(3), color: colors[3] }); // Day 3
    } else if (selectedValue === 'today') {
        routesToDraw.push({ date: getFormattedDate(0), color: colors[0] });
    } else if (selectedValue === 'yesterday') {
        routesToDraw.push({ date: getFormattedDate(1), color: colors[1] });
    } else if (selectedValue === 'day2') {
        routesToDraw.push({ date: getFormattedDate(2), color: colors[2] });
    } else if (selectedValue === 'day3') {
        routesToDraw.push({ date: getFormattedDate(3), color: colors[3] });
    }

    routesToDraw.forEach((route) => {
        const routeData = getRouteData(route.date);
        if (routeData.length > 0) {
            const polyline = L.polyline(routeData, { color: route.color, weight: 4 }).addTo(map);
            polylineLayers.push(polyline);
            allPoints = allPoints.concat(routeData);
        }
    });

    // If we have existing routes, fit the map to show them
    if (allPoints.length > 0) {
        map.fitBounds(L.latLngBounds(allPoints));
        return true; // Return true if routes were drawn
    }
    return false; // Return false if no routes exist
}

function startTracking() {
    if (watchID !== null) return;

    const today = getFormattedDate(0);
    let currentRoute = getRouteData(today);
    let isFirstLocation = true;

    // Optimized settings for mobile devices
    const options = { 
        enableHighAccuracy: true, 
        maximumAge: 30000, 
        timeout: 15000 
    };
    
    watchID = navigator.geolocation.watchPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = position.coords.accuracy || 10;
            
            // Update current location marker
            updateCurrentLocationMarker(lat, lon, accuracy);
            
            // Only add to route if we have a valid GPS location
            // Skip if this looks like a default/invalid location
            if (lat !== 0 && lon !== 0 && 
                lat !== 12.2958 && lon !== 76.6394 && // Mysore default
                Math.abs(lat) > 0.001 && Math.abs(lon) > 0.001) { // Not too close to 0,0
                
                currentRoute.push([lat, lon]);
                
                if (isFirstLocation) {
                    map.setView([lat, lon], 17);
                    isFirstLocation = false;
                }
                
                saveRouteData(today, currentRoute);
                drawAllRoutes();
            }
        },
        (error) => {
            console.error("Geolocation error:", error);
            let errorMsg = "Location access denied or not available.";
            if (error.code === 1) errorMsg = "Please allow location access in your browser settings.";
            if (error.code === 2) errorMsg = "Location information is unavailable.";
            if (error.code === 3) errorMsg = "Location request timed out. Please try again.";
            alert(errorMsg);
            stopTracking();
        },
        options
    );

    document.getElementById('startButton').disabled = true;
    document.getElementById('stopButton').disabled = false;
}

function stopTracking() {
    if (watchID !== null) {
        navigator.geolocation.clearWatch(watchID);
        watchID = null;
    }
    document.getElementById('startButton').disabled = false;
    document.getElementById('stopButton').disabled = true;
}

// Get current location for initial positioning
function getCurrentLocation() {
    // First, check if we have a last known location from today
    const lastLocation = getLastKnownLocation();
    if (lastLocation) {
        const [lat, lon] = lastLocation;
        updateCurrentLocationMarker(lat, lon, 10);
        map.setView([lat, lon], 15);
        return; // Exit early if we have last location
    }
    
    // Only try GPS if we don't have a last location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const accuracy = position.coords.accuracy || 10;
                updateCurrentLocationMarker(lat, lon, accuracy);
                map.setView([lat, lon], 15);
            },
            (error) => {
                console.log("Could not get current location:", error);
                // If GPS fails and no last location, just show world map
                // Don't set any marker or specific location
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }
}

// Clear all existing route data (use this to reset everything)
function clearAllRouteData() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.match(/^\d{4}-\d{2}-\d{2}$/)) { // Date format key
            keys.push(key);
        }
    }
    keys.forEach(key => localStorage.removeItem(key));
    console.log('All route data cleared');
}

// Clean up any existing routes that might contain default coordinates
function cleanupExistingRoutes() {
    // Force clear ALL data if any contains Mysore coordinates
    let foundBadData = false;
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.match(/^\d{4}-\d{2}-\d{2}$/)) { // Date format key
            const originalData = localStorage.getItem(key);
            if (originalData) {
                const data = JSON.parse(originalData);
                // Check if any coordinate contains Mysore location
                const hasBadData = data.some(point => {
                    const [lat, lon] = point;
                    return lat === 12.2958 && lon === 76.6394; // Mysore coordinates
                });
                
                if (hasBadData) {
                    foundBadData = true;
                    break;
                }
            }
        }
    }
    
    // If we found any bad data, clear everything
    if (foundBadData) {
        console.log('Found Mysore coordinates in saved data - clearing everything');
        clearAllRouteData();
    }
}

// Function for the reset button
function resetAllData() {
    if (confirm('Are you sure you want to delete all route data? This cannot be undone.')) {
        clearAllRouteData();
        clearRoutes(); // Clear routes from map
        if (currentLocationMarker) {
            map.removeLayer(currentLocationMarker);
            currentLocationMarker = null;
        }
        if (accuracyCircle) {
            map.removeLayer(accuracyCircle);
            accuracyCircle = null;
        }
        alert('All route data has been cleared.');
    }
}

// Event listeners for buttons and dropdown
document.getElementById('startButton').addEventListener('click', startTracking);
document.getElementById('stopButton').addEventListener('click', stopTracking);
document.getElementById('routeSelect').addEventListener('change', drawAllRoutes);

// Initial load: Clean existing data, get current location and draw routes
cleanupExistingRoutes();

// Draw existing routes first
const hasExistingRoutes = drawAllRoutes();

// Get current location (will show last known location if available)
getCurrentLocation();

// If no existing routes, center on current location
if (!hasExistingRoutes) {
    // Will center on GPS or default location
}