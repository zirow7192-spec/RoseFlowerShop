# 🔧 Rose Flower Shop Admin - Developer Setup Guide

## Overview

This admin system provides a **smartphone-optimized, PIN-protected** interface for managing the gallery without traditional authentication. It uses:

- **Supabase** for database and file storage
- **Client-side PIN** authentication (stored in localStorage)
- **Static HTML/CSS/JS** (works on GitHub Pages)
- **Responsive design** optimized for mobile devices

---

## 📋 Setup Checklist

- [ ] Create Supabase project
- [ ] Setup storage bucket
- [ ] Configure credentials
- [ ] Test admin portal
- [ ] Setup first PIN
- [ ] Deploy to GitHub Pages
- [ ] Share admin URL with owner

---

## 1️⃣ Supabase Setup

### Step 1: Create Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key (starts with `eyJ...`)

### Step 2: Database Configuration

The database migration has already been applied. It created:

- **Table:** `gallery_images` with columns:
  - `id` (uuid, primary key)
  - `filename` (text)
  - `storage_path` (text)
  - `public_url` (text)
  - `caption_en` (text)
  - `caption_el` (text)
  - `category` (text) - weddings, baptisms, events, bouquets
  - `display_order` (integer)
  - `is_active` (boolean)
  - `uploaded_at` (timestamp)
  - `updated_at` (timestamp)

**RLS Policies:**
- ✅ Anyone can SELECT active images (public gallery)
- ✅ Unrestricted INSERT/UPDATE/DELETE (PIN protection is client-side)

### Step 3: Storage Bucket

The storage bucket is created automatically on first upload, but you can create it manually:

1. Go to **Storage** in Supabase dashboard
2. Create new bucket: `gallery-images`
3. Settings:
   - **Public bucket:** Yes
   - **File size limit:** 5MB
   - **Allowed MIME types:** image/*

---

## 2️⃣ Configure Credentials

### Option A: Update JavaScript Files Directly

Replace placeholders in these files:

**File: `/admin/admin.js`**
```javascript
// Line 6-7
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**File: `/js/gallery-loader.js`**
```javascript
// Line 5-6
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**File: `/gallery.html`**
```html
<!-- Near end of file -->
<script src="js/gallery-loader.js"
        data-supabase-url="https://YOUR_PROJECT.supabase.co"
        data-supabase-key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."></script>
```

### Option B: Environment-Based Configuration (Recommended)

Create a `config.js` file (not committed to Git):

**File: `/config.js`**
```javascript
window.ROSE_CONFIG = {
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

Then update the scripts to read from `window.ROSE_CONFIG`.

Add to `.gitignore`:
```
config.js
```

---

## 3️⃣ Test Admin Portal Locally

1. **Open** `/admin/index.html` in your browser
2. **First time:** Set up a PIN (e.g., `1234`)
3. **Test upload:**
   - Click "Προσθήκη Φωτογραφίας"
   - Select an image
   - Choose category
   - Add captions
   - Upload
4. **Verify:**
   - Check Supabase Storage: bucket `gallery-images`
   - Check Database: table `gallery_images`
5. **Test gallery page:**
   - Open `/gallery.html`
   - Should load images from Supabase

---

## 4️⃣ GitHub Pages Deployment

### Update Repository

1. **Commit all changes:**
```bash
git add .
git commit -m "Add admin system with Supabase integration"
git push origin main
```

2. **Verify robots.txt:**
   - Make sure `/robots.txt` exists
   - Should contain: `Disallow: /admin/`

### Configure GitHub Pages

1. Go to **Settings** → **Pages**
2. Source: **Deploy from branch**
3. Branch: **main** / **root**
4. Save

### Post-Deployment

Your admin will be available at:
```
https://username.github.io/repository-name/admin/
```

**⚠️ SECURITY NOTE:**
- The admin URL is not linked anywhere on the public site
- Only people who know the URL can access it
- PIN protection prevents unauthorized access
- Search engines won't index it (robots.txt)

---

## 5️⃣ Setup PIN for Owner

### Option 1: Set PIN Yourself

1. Open admin URL on owner's phone
2. Set a 4-6 digit PIN
3. Check "Remember for 30 days"
4. Write down the PIN and give it to owner

### Option 2: Owner Sets PIN

1. Send admin URL to owner
2. Guide them to set their own PIN
3. Verify it works

### PIN Reset (If Forgotten)

To reset PIN:
1. On owner's phone, open browser console (if possible)
2. Run: `localStorage.removeItem('rosePIN')`
3. Or: Clear browser data for the site
4. Set new PIN

**Alternative:** Implement a "Forgot PIN" feature that emails a reset code.

---

## 6️⃣ Optional Enhancements

### QR Code for Easy Access

Generate QR code for the admin URL:

**Using Online Tool:**
1. Go to [qr-code-generator.com](https://www.qr-code-generator.com/)
2. Enter admin URL
3. Download QR code
4. Print and give to owner

**Owner Usage:**
- Scan QR code with phone camera
- Opens admin directly
- No typing needed!

### Bulk Upload Feature

Already supported! Owner can:
- Select multiple images at once
- Upload up to 10+ images simultaneously
- All get same category and captions

### Image Ordering

Currently ordered by upload time (newest first). To add drag-and-drop reordering:

1. Add drag handlers to gallery items
2. Update `display_order` on drop
3. Save to Supabase

### Analytics (Optional)

Track gallery views:
```javascript
// Add to gallery-loader.js
supabase
  .from('gallery_stats')
  .insert({ view_date: new Date(), category: currentFilter });
```

---

## 7️⃣ Troubleshooting

### Issue: "Supabase not configured"

**Solution:** Check credentials in JavaScript files

### Issue: Upload fails

**Possible causes:**
- Storage bucket doesn't exist (create manually)
- File too large (max 5MB)
- Wrong bucket name in code
- RLS policies blocking insert

**Debug:**
```javascript
// Open browser console
console.log(SUPABASE_URL);
console.log(SUPABASE_ANON_KEY);
```

### Issue: Images don't appear on gallery page

**Check:**
1. Are images marked `is_active = true`?
2. Is Supabase script loaded in `gallery.html`?
3. Are credentials correct in `gallery-loader.js`?
4. Open console for JavaScript errors

### Issue: PIN not working

**Solution:**
```javascript
// Clear and reset
localStorage.clear();
location.reload();
```

---

## 8️⃣ Backup & Export

### Export Gallery Data

```javascript
// Run in browser console on admin page
const { data } = await supabase
  .from('gallery_images')
  .select('*');

console.log(JSON.stringify(data, null, 2));
// Copy and save to file
```

### Backup Images

Supabase automatically backs up storage. For manual backup:

1. Go to Supabase Storage
2. Download all files from `gallery-images` bucket
3. Save locally

### Restore from Backup

```javascript
// Import data
const backupData = [...]; // Paste backup data
for (const item of backupData) {
  await supabase.from('gallery_images').insert(item);
}
```

---

## 9️⃣ Security Considerations

### Current Security Model

✅ **Protections:**
- Admin URL not public
- robots.txt exclusion
- PIN requirement
- Session timeout (30 days max)
- No server-side code to hack

⚠️ **Limitations:**
- PIN stored in localStorage (can be cleared)
- Anyone with URL + PIN can access
- No multi-factor authentication
- No audit logs

### For Higher Security

If needed, implement:

1. **Supabase Auth:** Replace PIN with email/password
2. **Row Level Security:** Require authentication for writes
3. **Admin Table:** Store authorized users in database
4. **Session Tokens:** Use JWT instead of localStorage
5. **IP Whitelisting:** Restrict by IP (requires server)

**Current system is suitable for:**
- Small business (one owner)
- Low-risk content (flower shop photos)
- Convenience over fort-knox security

---

## 🔟 Maintenance

### Regular Tasks

**Weekly:**
- Check for broken images
- Review new uploads

**Monthly:**
- Verify Supabase storage usage (free tier: 1GB)
- Check database size
- Clean up unused images

**As Needed:**
- Help owner reset PIN
- Add new categories
- Update captions

### Monitoring Supabase Usage

Free tier limits:
- **Storage:** 1GB
- **Database:** 500MB
- **Bandwidth:** 2GB/month

Check at: [Supabase Dashboard → Settings → Usage](https://supabase.com/dashboard)

### Upgrading Images

To add new features to existing images:

```sql
-- Add new column
ALTER TABLE gallery_images ADD COLUMN new_field text;

-- Update existing images
UPDATE gallery_images SET new_field = 'default_value';
```

---

## 📞 Support

### Owner Support

Direct owner to: `/admin/ΟΔΗΓΙΕΣ-ΧΡΗΣΗΣ.md` (Greek instructions)

### Technical Support

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Supabase Support:** [supabase.com/support](https://supabase.com/support)

---

## ✅ Final Checklist

Before handing off to owner:

- [ ] Supabase project created and configured
- [ ] Admin portal tested with actual uploads
- [ ] Gallery page loads images correctly
- [ ] PIN set on owner's phone
- [ ] "Remember me" enabled
- [ ] Owner can upload/delete images successfully
- [ ] Admin URL bookmarked on owner's phone
- [ ] Instructions (Greek) shared with owner
- [ ] QR code created and shared (optional)
- [ ] robots.txt deployed
- [ ] Backup of initial setup saved

---

## 🎓 Training the Owner

### Quick Training Session (15 minutes)

**Demo:**
1. Show admin URL on their phone
2. Demonstrate PIN entry
3. Upload a sample image together
4. Show how to filter/view images
5. Practice hiding/showing an image
6. Practice deleting (emphasize it's permanent)

**Give them:**
- Admin URL (written down or QR code)
- PIN (written down)
- Instructions file in Greek
- Your contact info for support

**Follow up:**
- Call after 1 week to check if any issues
- Offer to help with first "real" batch of uploads

---

**🌹 Rose Flower Shop Admin System**
Built for simplicity and smartphone-first experience
