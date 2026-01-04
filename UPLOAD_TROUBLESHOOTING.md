# Data Upload Troubleshooting Guide

## Current Status
✅ Backend server running on port 5000
✅ Frontend server running on port 5175
✅ DataUpload component properly implemented
❌ Node.js version issue (22.11.0 - needs 22.12+)

## How to Test Upload Functionality

### Step 1: Open the Application
1. Open your browser and go to: http://localhost:5175
2. Open Developer Tools (F12) and go to the Console tab

### Step 2: Test with Sample Data
I've created a test file at `d:\BlueFusion\test-data.csv` with sample fisheries data:
```csv
species,family,count,location
Atlantic Cod,Gadidae,150,North Atlantic
Pacific Salmon,Salmonidae,200,Pacific Ocean
Blue Tuna,Scombridae,75,Mediterranean
```

### Step 3: Upload and Check Console
1. Try uploading the test-data.csv file
2. Watch the browser console for detailed logging messages (they now have emojis for easy identification)
3. Look for any error messages

### Step 4: Common Issues and Solutions

**If you see "Node.js version" warnings:**
- This might affect file processing capabilities
- Consider updating Node.js to version 22.12+ or later

**If upload seems to hang:**
- Check if there are any network errors in the console
- Verify both frontend and backend servers are running

**If you get "Error processing file":**
- The console will show exact error details
- Common causes: malformed CSV, invalid JSON, empty files

### Step 5: Report Back
After testing, let me know:
1. What messages appear in the browser console when you try to upload
2. Any specific error messages you see
3. At what point the upload process fails (file reading, parsing, or callback)

## Quick Fixes You Can Try

1. **Restart the servers** (if they've been running a long time):
   ```powershell
   # Stop both servers (Ctrl+C in their terminals)
   # Then restart:
   cd backend; npm run dev
   cd frontend; npm run dev
   ```

2. **Try different file formats**:
   - Test with both .csv and .json files
   - Try smaller files first

3. **Clear browser cache**:
   - Hard refresh (Ctrl+Shift+R) or clear browser cache

The upload component now has detailed console logging, so we'll be able to pinpoint exactly where the issue occurs!