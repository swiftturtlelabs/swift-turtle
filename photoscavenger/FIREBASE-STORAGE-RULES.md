# Firebase Storage Rules Setup

Your `huntEndTime.json` file exists in Firebase Storage, but the app can't read it. This is likely due to Storage rules or CORS configuration.

## Step 1: Check Storage Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`photoscavenger-b16e2`)
3. Go to **Storage** → **Rules** tab
4. Make sure your rules allow public read access:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 5 * 1024 * 1024; // Max 5MB
    }
  }
}
```

5. Click **Publish** to save the rules

## Step 2: Configure CORS

Even with read rules, you need to configure CORS to allow requests from `swiftturtlelabs.com` (formerly `swift-turtle.com`).

### Option A: Using gsutil (Recommended)

1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Authenticate: `gcloud auth login`
3. Use the `cors.json` file already in this folder (update it first if the hosting domain has changed)

4. Apply CORS:
```bash
gsutil cors set cors.json gs://photoscavenger-b16e2.firebasestorage.app
```

### Option B: Using Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Cloud Storage** → **Buckets**
3. Find your bucket: `photoscavenger-b16e2.firebasestorage.app`
4. Click on the bucket name
5. Go to **Configuration** tab
6. Scroll to **CORS configuration**
7. Click **Edit CORS configuration**
8. Add the CORS rules (same JSON as above)
9. Save

## Verify

After configuring CORS, refresh your app. The console should no longer show CORS errors, and `huntEndTime.json` should load successfully.
