// Rose Flower Shop - Dynamic Gallery Loader
// Loads gallery images from Supabase database

// Initialize Supabase (read from environment or inline)
const SUPABASE_URL = document.currentScript.getAttribute('data-supabase-url') || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = document.currentScript.getAttribute('data-supabase-key') || 'YOUR_SUPABASE_ANON_KEY';

let supabaseClient = null;

// Initialize Supabase client
if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY &&
    SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Current filter
let currentGalleryFilter = 'all';

// Load gallery from Supabase
async function loadGalleryFromDatabase() {
    if (!supabaseClient) {
        console.log('Supabase not configured, using static gallery');
        return;
    }

    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    try {
        // Show loading state
        grid.innerHTML = '<div class="col-span-full text-center py-20"><div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-rose-600 border-t-transparent"></div><p class="mt-4 text-gray-600">Φόρτωση...</p></div>';

        // Build query
        let query = supabaseClient
            .from('gallery_images')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: false });

        // Apply filter
        if (currentGalleryFilter !== 'all') {
            query = query.eq('category', currentGalleryFilter);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Failed to load gallery:', error);
            grid.innerHTML = '<div class="col-span-full text-center py-20 text-red-600">Σφάλμα φόρτωσης gallery</div>';
            return;
        }

        // Clear grid
        grid.innerHTML = '';

        if (!data || data.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-600">Δεν υπάρχουν φωτογραφίες</div>';
            return;
        }

        // Get current language
        const currentLang = localStorage.getItem('language') || 'el';

        // Create gallery items
        data.forEach(image => {
            const item = document.createElement('div');
            item.className = 'gallery-item group cursor-pointer';
            item.dataset.category = image.category;

            // Choose caption based on language
            const caption = currentLang === 'en' ?
                (image.caption_en || image.caption_el || image.filename) :
                (image.caption_el || image.caption_en || image.filename);

            item.innerHTML = `
                <div class="relative h-80 rounded-xl overflow-hidden shadow-md">
                    <img src="${image.public_url}"
                         alt="${caption}"
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                         loading="lazy">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <h3 class="text-white font-medium">${caption}</h3>
                    </div>
                </div>
            `;

            // Add click handler for lightbox
            item.addEventListener('click', () => {
                showLightbox(image, caption);
            });

            grid.appendChild(item);
        });

    } catch (error) {
        console.error('Gallery loading error:', error);
        grid.innerHTML = '<div class="col-span-full text-center py-20 text-red-600">Σφάλμα: ' + error.message + '</div>';
    }
}

// Filter gallery
function filterGalleryImages(category) {
    currentGalleryFilter = category;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === category) {
            btn.classList.add('bg-rose-600', 'text-white');
            btn.classList.remove('bg-gray-100', 'text-gray-700');
        } else {
            btn.classList.remove('bg-rose-600', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-700');
        }
    });

    // Reload gallery
    loadGalleryFromDatabase();
}

// Show lightbox with image
function showLightbox(image, caption) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');

    if (!lightbox || !lightboxImg) return;

    lightboxImg.src = image.public_url;
    if (lightboxTitle) lightboxTitle.textContent = caption;
    if (lightboxDesc) lightboxDesc.textContent = '';

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only load if we're on the gallery page
    if (document.getElementById('gallery-grid')) {
        loadGalleryFromDatabase();

        // Update filter buttons to use new function
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filterGalleryImages(btn.dataset.filter);
            });
        });

        // Listen for language changes
        window.addEventListener('languageChanged', () => {
            loadGalleryFromDatabase();
        });
    }
});
