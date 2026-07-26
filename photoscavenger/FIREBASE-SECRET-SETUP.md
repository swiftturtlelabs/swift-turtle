# Firebase API Key Setup

This project keeps the Firebase Web API key out of the committed `firebase-config.js` and injects it at deploy/generation time from a **GitHub Actions repository variable** (not a secret — Firebase Web API keys are designed to be public in client-side code, so a plain-text variable is fine and easier to inspect than a masked secret).

## Setup

1. **GitHub repository variable** (Settings → Secrets and variables → Actions → **Variables** tab):
   - Variable name: `PHOTOSCAVENGER_FIREBASE_API_KEY`
   - Value: Your Firebase Web API key (from Firebase Console → Project Settings → General → Your apps → SDK config)

⚠️ **Important:** This must be a repository **variable**, not a secret, and the name must match exactly (`PHOTOSCAVENGER_FIREBASE_API_KEY`) or the workflows below will silently inject an empty string instead of failing loudly on old versions — the current workflows explicitly check for this and fail the build if it's missing.

## Usage Options

### Automatic (current production deploy)

The site is deployed to Firebase Hosting via `.github/workflows/firebase-hosting-merge.yml` on every push to `main` (and previewed via `firebase-hosting-pull-request.yml` on PRs). Both workflows inject the `PHOTOSCAVENGER_FIREBASE_API_KEY` repository variable into `firebase-config.js` right before deploying, so **no manual steps are needed** for the live site — just make sure that repository variable exists and is correct.

### Option 1: GitHub Actions Workflow (for legacy/manual hosting, e.g. FTP)

The GitHub Actions workflow (`.github/workflows/generate-firebase-config.yml`) will generate `firebase-config.js` from the template using the same repository variable, as a downloadable artifact (useful only if deploying somewhere other than Firebase Hosting, e.g. the old InfinityFree FTP setup):

1. Go to **Actions** tab in GitHub
2. Run the **"Generate Firebase Config"** workflow manually, or it will run automatically on pushes that touch the template
3. Download the artifact containing `firebase-config.js`
4. Deploy it using `deploy-config.ps1`

### Option 2: Local PowerShell Script

Generate the config file locally using the PowerShell script:

```powershell
# Set the API key from environment variable
$env:FIREBASE_API_KEY = "your-api-key-here"

# Generate the config file
cd photoscavenger
.\generate-firebase-config.ps1

# Or in one line:
$env:FIREBASE_API_KEY = "your-api-key-here"; .\generate-firebase-config.ps1
```

### Option 3: Deploy Script with Auto-Generation

The deploy script can automatically generate the config if it doesn't exist:

```powershell
# Set API key and deploy
$env:FIREBASE_API_KEY = "your-api-key-here"
cd photoscavenger
.\deploy-config.ps1
```

## File Structure

- **`firebase-config.template.js`** - Template file (committed to git) with `{{FIREBASE_API_KEY}}` placeholder
- **`firebase-config.js`** - Also committed to git with the same unreplaced `{{FIREBASE_API_KEY}}` placeholder. The real key is only ever substituted in at deploy time, inside the GitHub Actions runner — it's never written back to the repo.

## Security Notes

- ✅ The actual API key is never committed to git — only the placeholder is
- ✅ The real key only exists inside GitHub Actions runs (from the repository variable) and in the final deployed HTML/JS on the live site
- ⚠️ Remember: Firebase API keys in client-side code are still visible in the browser regardless. Security relies on Firebase Security Rules and (optionally) API key HTTP-referrer restrictions, not on hiding the key.

## Troubleshooting

**Live site shows the literal `{{FIREBASE_API_KEY}}` placeholder in `firebase-config.js`:**
- The deploy workflow's key-injection step didn't run or the variable was empty/missing — check the `PHOTOSCAVENGER_FIREBASE_API_KEY` repository variable exists under the **Variables** tab (not Secrets), spelled exactly as above.
- Check the latest run of `Deploy to Firebase Hosting on merge` in the **Actions** tab for a failed "Inject Firebase API key" step.

**Config file not generating locally:**
- Verify the template file exists and has the correct `{{FIREBASE_API_KEY}}` placeholder format
- Check GitHub Actions logs for errors
