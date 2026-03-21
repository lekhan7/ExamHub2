# Quick Setup Guide for Exam Hub

## 🚀 Step-by-Step Instructions

### 1. Start the Server
Open a terminal and run:
```bash
cd server
npm run dev
```
You should see: `Exam Hub server running on port 3001`

### 2. Start the Client
Open a NEW terminal and run:
```bash
cd client
npm run dev
```
You should see: `Local: http://localhost:5173`

### 3. Open Your Browser
Navigate to: `http://localhost:5173`

## 🔧 Troubleshooting

### Issue: "Server connection failed"
**Solution**: Make sure the server is running first on port 3001

### Issue: "Cannot read properties of undefined (reading 'room')"
**Solution**: This is fixed - the room creation now works properly

### Issue: Port already in use
**Solution**: Change the port in vite.config.js or kill existing processes

### Quick Start Script
For Windows, run:
```bash
start.bat
```

For Mac/Linux, run:
```bash
chmod +x start.sh
./start.sh
```

## 🎯 Test the App
1. Click "Create a Study Room"
2. Fill in the form and create a room
3. Try uploading a PDF
4. Test the collaborative features
5. Open the same room in another browser to test real-time sync

## 📱 Features to Test
- ✅ Room creation and joining
- ✅ PDF upload and sharing
- ✅ Real-time notes editing
- ✅ Whiteboard drawing
- ✅ Chat functionality
- ✅ Member presence indicators

The app is now ready to use! 🎉
