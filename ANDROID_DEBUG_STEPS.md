# Android App Debug Steps - Door Control Issue

## Problem
Ketika klik "Buka" atau "Kunci" di Android app, status di `sample-data.json` tidak berubah.

## ✅ Confirmed Working
- ✅ Mock API server berjalan di port 3000
- ✅ Door control endpoint `/api/door/control` bekerja
- ✅ File update function bekerja dengan benar
- ✅ Authentication endpoint `/api/auth/login` bekerja

## 🔍 Debug Steps untuk Android App

### Step 1: Check Server Connection
1. **Pastikan Android app connect ke server yang benar**
   - Check base URL di Android app
   - Pastikan menggunakan `http://localhost:3000/api` atau IP yang benar
   - Jika menggunakan emulator, mungkin perlu `http://10.0.2.2:3000/api`

### Step 2: Check Authentication Status
1. **Pastikan user sudah login**
   - Check apakah ada JWT token tersimpan
   - Verify token masih valid
   - Check apakah Google Sign-In berhasil

### Step 3: Monitor Server Logs
1. **Watch server terminal untuk incoming requests**
   - Ketika klik tombol di Android, harus ada log seperti:
   ```
   🚪 Door control request: door_id=1, action=unlock
   ```
   - Jika tidak ada log, berarti Android tidak mengirim request

### Step 4: Check Network Requests
1. **Enable network logging di Android app**
   - Check apakah request benar-benar dikirim
   - Check response dari server
   - Check error messages

## 🚨 Possible Issues & Solutions

### Issue 1: Wrong Base URL
**Symptoms**: No requests reaching server
**Check**: Android app network configuration
**Solution**: Update base URL to correct server address

### Issue 2: Authentication Failed
**Symptoms**: 401 Unauthorized errors
**Check**: JWT token in Android app
**Solution**: Re-login or check Google Auth setup

### Issue 3: Network Connection
**Symptoms**: Connection timeout/refused
**Check**: Server running, firewall, network connectivity
**Solution**: Restart server, check network settings

### Issue 4: Wrong User Access
**Symptoms**: 403 Access Denied
**Check**: User has access to the door in `userDoor` data
**Solution**: Add user access or use different door

## 🔧 Quick Tests

### Test 1: Manual API Call
```bash
# Test if server receives requests
curl -X POST http://localhost:3000/api/door/control \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"door_id": 1, "action": "unlock"}'
```

### Test 2: Check Android Logs
```bash
# If using Android Studio
adb logcat | grep -i "door\|auth\|network"
```

### Test 3: Network Capture
- Use Android Studio Network Inspector
- Or use proxy tools like Charles/Fiddler

## 📱 Android App Checklist

1. **Base URL Configuration**
   - [ ] Check `build.gradle` or config files
   - [ ] Verify server IP/port
   - [ ] Test with different URLs (localhost, 10.0.2.2, actual IP)

2. **Authentication**
   - [ ] User successfully logged in
   - [ ] JWT token stored and valid
   - [ ] Token sent in Authorization header

3. **Door Control Flow**
   - [ ] Button click triggers API call
   - [ ] Confirmation modal works
   - [ ] Request sent with correct parameters
   - [ ] Response handled properly

4. **Network Configuration**
   - [ ] Internet permission in manifest
   - [ ] Network security config allows HTTP
   - [ ] No proxy/firewall blocking

## 🎯 Next Steps

1. **Check server logs** when clicking Android buttons
2. **If no logs appear**: Android app not sending requests
3. **If logs appear but fail**: Check authentication/authorization
4. **If success but no file change**: Check file update function (already tested ✅)

## 💡 Quick Fix Attempts

### Fix 1: Restart Everything
```bash
# Kill all node processes
taskkill /f /im node.exe

# Restart server
cd backend/mock-api
npm start

# Restart Android app
```

### Fix 2: Check Android Network Config
- Verify base URL in Android app
- Try different server addresses
- Check network permissions

### Fix 3: Test with Different Door
- Try door with ID 8 or 6 (user 1 has access)
- Check if specific door has issues

### Fix 4: Enable Detailed Logging
- Add more logs in Android app
- Check server response in Android
- Monitor network traffic
