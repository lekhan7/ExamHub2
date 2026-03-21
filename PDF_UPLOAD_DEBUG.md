# PDF Upload Debug Guide

## 🔍 Debugging Steps

### 1. Check Browser Console
Open your browser's developer console (F12) and look for:
- Any error messages when clicking "Upload PDF"
- Network tab requests (look for failed requests)
- Console logs from the debugging code I added

### 2. Check Server Console
Look at the server terminal for:
- "PDF upload request received" message
- Any error messages
- File upload logs

### 3. Test Network Request
1. Open browser DevTools → Network tab
2. Click "Upload PDF" and select a file
3. Look for the upload request to `/api/upload-pdf`
4. Check:
   - Request URL (should be `http://localhost:3001/api/upload-pdf`)
   - Request method (should be POST)
   - Response status (should be 200)
   - Response body

### 4. Common Issues & Solutions

#### Issue: CORS Error
**Symptom**: "CORS policy" error in console
**Solution**: The server CORS is correctly configured for ports 5173 and 5174

#### Issue: File Not Selected
**Symptom**: "No file selected" in console
**Solution**: Make sure you're selecting an actual PDF file

#### Issue: Wrong URL
**Symptom**: Request going to wrong port
**Solution**: Check that `process.env.NODE_ENV === 'development'` is true

#### Issue: Server Not Running
**Symptom**: Connection refused error
**Solution**: Make sure server is running on port 3001

### 5. Manual Test
You can test the upload endpoint directly:

```bash
curl -X POST \
  -F "pdf=@/path/to/your/test.pdf" \
  http://localhost:3001/api/upload-pdf
```

### 6. Check Both Servers
Make sure BOTH servers are running:
```bash
# Terminal 1 - Server
cd server && npm start

# Terminal 2 - Client  
cd client && npm run dev
```

## 🧪 What to Look For

After adding the debug code, you should see these console messages:

**Client Side:**
- "File selected: [File object]"
- "Upload URL: http://localhost:3001/api/upload-pdf"
- "Response status: 200"
- "Upload result: {filename: '...', originalName: '...'}"

**Server Side:**
- "PDF upload request received"
- "File: {fieldname: 'pdf', originalname: '...', ...}"
- "File uploaded successfully: ..."

If you don't see these messages, the upload isn't reaching the server properly.

## 🔧 Quick Fix

If the upload is still failing, try this simplified version:

1. **Check client port**: Make sure client is running on 5173 or 5174
2. **Check server port**: Make sure server is running on 3001
3. **Test with small PDF**: Try uploading a very small PDF file (<1MB)
4. **Check file type**: Ensure the file is actually a PDF (not .docx renamed)

## 📞 Report Back

Please share:
1. What you see in the browser console
2. What you see in the server console  
3. Any error messages from the Network tab
4. The exact PDF file you're trying to upload

This will help me identify the exact issue!
