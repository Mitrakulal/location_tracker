# 📍 Route Tracker

A simple GPS route tracking web app that works on mobile devices. Track your daily routes and view them on an interactive map.

## 🚀 How to Use

### Desktop/Laptop:
1. Open `index.html` in any modern web browser
2. Allow location permission when prompted
3. Click "Start Tracking" to begin recording your route
4. Move around to see your route being drawn
5. Click "Stop Tracking" to stop recording
6. Use the dropdown to view different days' routes

### Mobile:
1. Open the app in your mobile browser (Chrome, Safari, etc.)
2. Allow location access
3. Keep the browser tab active while tracking
4. Your route will be saved automatically

## 📱 Sharing with Others

### Method 1: File Sharing
1. Zip the entire `suppi_tracker` folder
2. Share the zip file
3. Recipients extract and open `index.html`

### Method 2: Host Online (Recommended)
Upload all files to any web hosting service:
- GitHub Pages (free)
- Netlify (free)
- Vercel (free)
- Any web hosting service

### Method 3: Local Network Sharing
1. Use VS Code Live Server extension
2. Share your computer's IP address (e.g., `http://192.168.1.100:5500`)
3. Others on same WiFi can access it

## 📋 Features

- ✅ Real-time GPS tracking
- ✅ Route visualization with different colors
- ✅ Daily route storage (today, yesterday, etc.)
- ✅ Mobile-friendly design
- ✅ Offline storage (localStorage)
- ✅ Current location pinpoint marker
- ✅ GPS accuracy indicator

## 🔧 Technical Requirements

- Modern web browser with GPS support
- HTTPS connection (for production use)
- Location permission enabled

## 📝 Notes

- Routes are stored locally in your browser
- Clear browser data will delete saved routes
- Works best on mobile devices for actual tracking
- Requires internet connection for map tiles

## 🛠️ Troubleshooting

**Location not working?**
- Check browser location permissions
- Ensure you're using HTTPS (for hosted versions)
- Try refreshing the page

**Route not appearing?**
- Make sure you're moving enough distance
- Check if tracking is actually started
- Try selecting different days in dropdown

**Mobile issues?**
- Keep browser tab active
- Don't switch to other apps while tracking
- Check if location services are enabled on device