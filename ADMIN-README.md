# 🌹 Rose Flower Shop - Admin System

## Overview

A **smartphone-optimized, PIN-protected admin system** that allows the shop owner (Anna) to manage the website's image gallery directly from her phone, without complex logins or technical knowledge.

### ✨ Key Features

- 📱 **Mobile-First Design** - Works perfectly on smartphones
- 🔒 **Simple PIN Protection** - No username/password needed
- 🖼️ **Easy Image Upload** - Drag & drop or select from phone
- 🗂️ **Category Management** - Organize by weddings, baptisms, events, bouquets
- 🌐 **Bilingual Support** - Greek & English captions
- ⚡ **Instant Updates** - Changes appear immediately on the website
- 🔍 **Hidden from Public** - Admin URL not visible to visitors
- 💾 **Automatic Backups** - Supabase handles data persistence

---

## 🚀 Quick Start

### For Developers

1. **Read:** [`/admin/DEVELOPER-SETUP.md`](admin/DEVELOPER-SETUP.md) - Complete setup guide
2. **Configure:** Open [`/admin/setup.html`](admin/setup.html) - Interactive credential configurator
3. **Test:** Open `/admin/index.html` locally
4. **Deploy:** Push to GitHub Pages

### For Shop Owner (Anna)

1. **Read:** [`/admin/ΟΔΗΓΙΕΣ-ΧΡΗΣΗΣ.md`](admin/ΟΔΗΓΙΕΣ-ΧΡΗΣΗΣ.md) - Full instructions in Greek
2. **Access:** Open `https://yoursite.com/admin/` on your phone
3. **Setup PIN:** First time only (4-6 digits)
4. **Start Uploading:** Tap the big pink button!

---

## 📁 File Structure

```
/admin/
├── index.html              # Main admin interface
├── admin.js                # Admin logic & Supabase integration
├── setup.html              # Interactive setup helper (for developers)
├── DEVELOPER-SETUP.md      # Complete developer guide (English)
└── ΟΔΗΓΙΕΣ-ΧΡΗΣΗΣ.md      # User instructions (Greek)

/js/
└── gallery-loader.js       # Loads gallery from Supabase database

/gallery.html               # Updated to load dynamic gallery
/robots.txt                 # Excludes /admin/ from search engines
```

---

## 🔧 Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | HTML/CSS/JavaScript | Static admin interface |
| Styling | Tailwind CSS (CDN) | Responsive mobile design |
| Database | Supabase (PostgreSQL) | Store image metadata |
| Storage | Supabase Storage | Host image files |
| Auth | localStorage PIN | Simple access control |
| Hosting | GitHub Pages | Free static hosting |

---

## 🔐 Security Model

### Protection Layers

1. **Hidden URL** - `/admin/` not linked anywhere on public site
2. **robots.txt** - Blocks search engine indexing
3. **PIN Authentication** - 4-6 digit code stored in localStorage
4. **Session Management** - Optional "Remember me for 30 days"
5. **RLS Policies** - Supabase Row Level Security protects database

### Security Level

✅ **Suitable for:**
- Small business websites
- Low-risk content (product photos)
- Single user (shop owner)
- Convenience over complexity

⚠️ **Not suitable for:**
- Multiple users with different permissions
- Sensitive/confidential content
- Financial or personal data
- High-security requirements

### Limitations

- PIN stored in browser's localStorage (device-specific)
- No password recovery mechanism (contact developer to reset)
- No audit logs or activity tracking
- Client-side validation only

**For higher security needs:** Implement Supabase Auth with email/password authentication.

---

## 🖼️ Gallery System

### How It Works

1. **Upload:**
   - Owner selects images on phone
   - Images compressed automatically (max 1920px)
   - Uploaded to Supabase Storage
   - Metadata saved to database

2. **Storage:**
   - **Supabase Storage:** Stores actual image files
   - **Database:** Stores metadata (filename, captions, category, etc.)
   - **Public URLs:** Generated automatically for each image

3. **Display:**
   - Gallery page loads images from database
   - Filters by category
   - Shows only `is_active = true` images
   - Supports bilingual captions

### Database Schema

```sql
gallery_images (
  id              uuid PRIMARY KEY,
  filename        text NOT NULL,
  storage_path    text UNIQUE NOT NULL,
  public_url      text,
  caption_en      text,
  caption_el      text,
  category        text NOT NULL,  -- weddings|baptisms|events|bouquets
  display_order   integer,
  is_active       boolean DEFAULT true,
  uploaded_at     timestamp,
  updated_at      timestamp
)
```

---

## 📱 Mobile Optimization

### Design Principles

- **Touch-Friendly:** Buttons minimum 56px height
- **Large Text:** Easy to read on small screens
- **Simple Navigation:** Maximum 2 taps to any action
- **Visual Feedback:** Loading states, progress bars
- **Offline Resilient:** Clear error messages
- **Fast Loading:** Optimized images, minimal dependencies

### Tested On

- ✅ iPhone Safari
- ✅ Android Chrome
- ✅ iPad Safari
- ✅ Desktop Chrome/Firefox/Edge

---

## 🔄 Workflow

### Typical Usage

1. **Owner accesses admin on phone**
   - Opens bookmarked URL
   - Enters PIN (or auto-logged in if "remembered")

2. **Uploads new photos**
   - Takes photos with phone camera
   - Opens admin
   - Selects images
   - Chooses category
   - Adds captions (optional)
   - Uploads

3. **Images appear on website**
   - Instantly visible in gallery
   - Visitors can see them immediately
   - No developer intervention needed

4. **Manages existing photos**
   - View all images
   - Filter by category
   - Hide/show images
   - Delete unwanted photos

---

## 🆘 Troubleshooting

### Common Issues

**"Supabase not configured"**
- Check credentials in `/admin/admin.js` and `/js/gallery-loader.js`
- Verify Supabase project is active

**Upload fails**
- Ensure storage bucket `gallery-images` exists
- Check file size (max 5MB)
- Verify RLS policies allow inserts

**Images don't appear on gallery**
- Check `is_active = true` in database
- Verify Supabase credentials in `gallery.html`
- Open browser console for errors

**Forgot PIN**
- On owner's phone: Clear browser data for the site
- Or run in console: `localStorage.removeItem('rosePIN')`
- Set new PIN on next login

---

## 📊 Monitoring & Maintenance

### Supabase Free Tier Limits

- **Database:** 500MB
- **Storage:** 1GB
- **Bandwidth:** 2GB/month

### Regular Checks

- **Weekly:** Verify uploads working
- **Monthly:** Check storage usage
- **As Needed:** Help owner with any issues

### Backup Strategy

1. **Automatic:** Supabase backs up data
2. **Manual:** Export database from Supabase dashboard
3. **Images:** Download from storage bucket

---

## 🎓 Training Materials

### For Shop Owner

- **Document:** `/admin/ΟΔΗΓΙΕΣ-ΧΡΗΣΗΣ.md` (Greek)
- **Video:** (Create a screen recording demo)
- **Quick Reference Card:** Print out common tasks
- **Support:** Your contact info

### Training Checklist

- [ ] Show how to access admin URL
- [ ] Demonstrate PIN entry
- [ ] Practice uploading images
- [ ] Show filtering/viewing
- [ ] Practice hiding/deleting
- [ ] Explain "Remember me" option
- [ ] Share written instructions
- [ ] Provide support contact info

---

## 🔮 Future Enhancements

### Possible Additions

- **Image Editing:** Crop, rotate, filters before upload
- **Bulk Actions:** Select multiple images to hide/delete
- **Drag & Drop Ordering:** Manual sort order
- **Image Captions Editor:** Edit captions after upload
- **Statistics:** View count, popular categories
- **Scheduled Posts:** Upload now, publish later
- **Multi-User:** Add developer account with elevated permissions
- **Email Notifications:** Alert on new uploads
- **Mobile App:** Native iOS/Android app wrapper

---

## 📞 Support & Contact

### For Developers

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Tailwind CSS:** [tailwindcss.com](https://tailwindcss.com)

### For Shop Owner

Contact your developer:
- **Email:** [Your email]
- **Phone:** [Your phone]
- **Hours:** [Your availability]

---

## 📄 License & Credits

**Project:** Rose Flower Shop Admin System
**Built for:** Anna Ntakakh - Rose Flower Shop, Rethymno, Crete
**Technology:** Supabase + Vanilla JavaScript
**Design:** Mobile-first, touch-optimized

---

## ✅ Deployment Checklist

Before going live:

- [ ] Supabase project created
- [ ] Database migration applied
- [ ] Storage bucket configured
- [ ] Credentials updated in all files
- [ ] Tested locally
- [ ] Test upload successful
- [ ] Gallery loads images correctly
- [ ] robots.txt deployed
- [ ] GitHub Pages configured
- [ ] Admin accessible at live URL
- [ ] PIN set on owner's phone
- [ ] "Remember me" enabled
- [ ] Owner trained
- [ ] Instructions shared
- [ ] Support contact provided
- [ ] Backup of initial config saved

---

**Ready to launch!** 🚀

For detailed setup instructions, see:
- **Developers:** [`/admin/DEVELOPER-SETUP.md`](admin/DEVELOPER-SETUP.md)
- **Users:** [`/admin/ΟΔΗΓΙΕΣ-ΧΡΗΣΗΣ.md`](admin/ΟΔΗΓΙΕΣ-ΧΡΗΣΗΣ.md)
