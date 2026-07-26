# Remove Firebase Storage from Test Mode

To take your Firebase Storage out of test mode and make it permanently accessible, follow these steps:

## Step 1: Update Firebase Storage Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **photoscavenger-b16e2**
3. Navigate to **Storage** in the left sidebar
4. Click on the **Rules** tab
5. Replace the current rules with the following (this removes test mode time restrictions):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Allow public read access
      allow read: if true;
      // Allow write access (create, update) with file size limit (5MB max)
      allow write: if request.resource.size < 5 * 1024 * 1024;
      // CRITICAL: Explicitly allow delete operations (required for clearing hunt)
      allow delete: if true;
    }
  }
}
```

**Note:** The `allow write` rule does NOT automatically include delete operations in Firebase Storage. You MUST explicitly add `allow delete: if true;` or the app will get 403 Forbidden errors when trying to delete files.

6. Click **Publish** to save the rules

**Verify:** After publishing, try clearing a hunt again. The delete operations should now work without 403 errors.

**Important:** These rules allow public read/write access. If you want more security, you can restrict write access to authenticated users only:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      // Only allow authenticated users to write
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024;
    }
  }
}
```

## Step 2: Configure CORS (if not already done)

The `cors.json` file is already in your project. Apply it using one of these methods:

### Option A: Using gsutil (Command Line)

1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) if you haven't already
2. Authenticate: `gcloud auth login`
3. Set your project: `gcloud config set project photoscavenger-b16e2`
4. Apply CORS configuration:
   ```bash
   gsutil cors set cors.json gs://photoscavenger-b16e2.firebasestorage.app
   ```

### Option B: Using Google Cloud Console (Web Interface)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **photoscavenger-b16e2**
3. Navigate to **Cloud Storage** → **Buckets**
4. Find your bucket: `photoscavenger-b16e2.firebasestorage.app`
5. Click on the bucket name
6. Go to the **Configuration** tab
7. Scroll to **CORS configuration**
8. Click **Edit CORS configuration**
9. Copy and paste the contents of `cors.json` (see this folder for the current version, which should list the live hosting domain)
10. Click **Save**

## Step 3: Verify

1. Test your app - it should work without any test mode warnings
2. Check the Firebase Console - Storage rules should show as "Published" (not "Test mode")
3. Try uploading a photo to verify write access works
4. Try loading photos from another device to verify read access works

## Security Considerations

The current rules allow **public read and write access**. This is fine for a photo scavenger hunt app, but consider:

- **For production**: You might want to add rate limiting or require authentication for writes
- **For sensitive data**: Consider using Firebase Authentication and restricting access to authenticated users only

## Need Help?

If you encounter issues:
- Check the Firebase Console for error messages
- Verify your domain is in the CORS configuration
- Make sure the Storage rules are published (not in draft mode)
- Check browser console for any CORS or permission errors
