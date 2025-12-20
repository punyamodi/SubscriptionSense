# SubSync Legal Pages

This folder contains the legal pages required for app store submission.

## Files

- `index.html` - Landing page for subsync.app
- `privacy.html` - Privacy Policy (https://subsync.app/privacy)
- `terms.html` - Terms of Service (https://subsync.app/terms)

## Deployment Options

### Option 1: Firebase Hosting (Recommended)

Since your app already uses Firebase, this is the easiest option:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting (from project root)
firebase init hosting

# When prompted:
# - Select your existing Firebase project
# - Set public directory to "legal"
# - Configure as single-page app: No
# - Set up GitHub Actions: No (optional)

# Deploy
firebase deploy --only hosting
```

### Option 2: GitHub Pages

1. Create a new repository called `subsync.app` (or your domain name)
2. Copy the contents of this `legal` folder to the repository
3. Go to Settings → Pages
4. Select "Deploy from a branch" and choose `main`
5. Configure your custom domain in the settings

### Option 3: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop this `legal` folder
3. Configure your custom domain

### Option 4: Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import or drag this folder
3. Configure your custom domain

## URL Structure

After deployment, your pages should be accessible at:

- https://subsync.app/ → Landing page
- https://subsync.app/privacy → Privacy Policy (or /privacy.html)
- https://subsync.app/terms → Terms of Service (or /terms.html)

## Updating the Pages

When you update these pages, remember to:

1. Update the "Last updated" date in both legal documents
2. Re-deploy to your hosting provider
3. Consider notifying users of material changes

## Customization

Before deploying, you may want to customize:

1. **Email addresses**: Replace `privacy@subsync.app`, `legal@subsync.app`, and `support@subsync.app` with your actual email addresses
2. **Download links**: Update the App Store and Google Play links in `index.html` once your app is published
3. **Company details**: If you have a registered company, update the legal entity references
4. **Jurisdiction**: The Terms specify Delaware, USA. Update if your company is registered elsewhere.

## Design

The pages use the same "Obsidian Finance" design system as your app:

- Dark theme with warm gold accents
- Spectral (serif) for headings
- Inter (sans-serif) for body text
- Matching color palette: #07080A, #D4A574, etc.
