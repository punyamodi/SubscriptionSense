# 🚀 How to Deploy to Google Play Store

This guide walks you through building your production Android app (`.aab`) and managing your Firebase secrets securely.

## 1. Prerequisites

You will need the **EAS CLI** (Expo Application Services) installed and logged in.

```bash
npm install -g eas-cli
eas login
```

## 2. Configure Project ID

Link your project to EAS (if not already done):

```bash
eas build:configure
```

_Select "Android" when prompted._

## 3. Handle Firebase Secrets (Environment Variables)

**Never** commit your `.env` file or hardcode API keys in `app.json`. Instead, upload them to EAS servers so they are injected during the build process.

Run the following commands to set your secrets for the production build:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "YOUR_API_KEY"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "YOUR_AUTH_DOMAIN"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "YOUR_PROJECT_ID"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "YOUR_STORAGE_BUCKET"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "YOUR_SENDER_ID"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --value "YOUR_APP_ID"
```

_Replace the values in quotes with the actual values from your local `.env` file._

## 4. Build for Production

I have already created an `eas.json` file for you with a `production` profile that forces `DATA_MODE=live`.

To generate the **AAB (Android App Bundle)** file required for the Play Store:

```bash
eas build --platform android --profile production
```

1. Wait for the build to finish (it runs in the cloud).
2. Download the `.aab` file from the link provided in the terminal.

## 5. Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console).
2. Create a **New App**.
3. Go to **Production** -> **Create new release**.
4. Upload the `.aab` file you downloaded.
5. Complete the store listing details (Title, Description, Screenshots).
6. Submit for Review!

---

### ✅ Checklist for Production

- [ ] **Data Mode**: Ensure `EXPO_PUBLIC_DATA_MODE` is set to `live` (The `eas.json` I created handles this).
- [ ] **Icons**: Ensure your `assets/icon.png` and `assets/adaptive-icon.png` are high quality.
- [ ] **Permissions**: Expo automatically adds permissions based on libraries. Check `app.json` -> `android.permissions` if you need to strictly limit them (e.g. Camera, Location).
