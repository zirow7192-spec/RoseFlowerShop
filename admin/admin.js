// Rose Flower Shop - Admin Panel JavaScript
// Smartphone-optimized admin system with PIN protection

// ===== CONFIGURATION =====
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Will be replaced with actual values
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Storage bucket name
const STORAGE_BUCKET = 'gallery-images';

// ===== STATE =====
let selectedFiles = [];
let selectedCategory = '';
let currentFilter = 'all';
let currentImageId = null;

// ===== PIN AUTHENTICATION =====

// Hash PIN for security (simple but better than plain text)
function hashPIN(pin) {
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
        const char = pin.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// Check if PIN is set
function isPINSet() {
    return localStorage.getItem('rosePIN') !== null;
}

// Setup new PIN
function setupPIN() {
    const newPIN = document.getElementById('new-pin').value;
    const confirmPIN = document.getElementById('confirm-pin').value;

    if (!newPIN || newPIN.length < 4) {
        showPINError('Ο κωδικός PIN πρέπει να είναι τουλάχιστον 4 ψηφία');
        return;
    }

    if (newPIN !== confirmPIN) {
        showPINError('Οι κωδικοί δεν ταιριάζουν');
        return;
    }

    localStorage.setItem('rosePIN', hashPIN(newPIN));
    showDashboard();
}

// Verify PIN
function verifyPIN() {
    const enteredPIN = document.getElementById('pin-input').value;
    const storedHash = localStorage.getItem('rosePIN');

    if (hashPIN(enteredPIN) === storedHash) {
        // Check remember me
        if (document.getElementById('remember-me').checked) {
            const expiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
            localStorage.setItem('roseSession', expiry.toString());
        }
        showDashboard();
    } else {
        showPINError('Λάθος κωδικός PIN');
        document.getElementById('pin-input').value = '';
    }
}

// Show PIN error
function showPINError(message) {
    const errorDiv = document.getElementById('pin-error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 3000);
}

// Show dashboard
function showDashboard() {
    document.getElementById('pin-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    loadGallery();
}

// Logout
function logout() {
    localStorage.removeItem('roseSession');
    location.reload();
}

// ===== INITIALIZATION =====
window.addEventListener('DOMContentLoaded', () => {
    // Check if logged in
    const session = localStorage.getItem('roseSession');
    if (session && parseInt(session) > Date.now()) {
        showDashboard();
        return;
    }

    // Check if PIN is set
    if (!isPINSet()) {
        document.getElementById('pin-instruction').textContent = 'Ορίστε τον κωδικό PIN σας';
        document.getElementById('pin-setup').classList.remove('hidden');
        document.getElementById('pin-entry').classList.add('hidden');
    }

    // Allow Enter key for PIN entry
    document.getElementById('pin-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyPIN();
    });

    // Setup drag and drop
    setupDragAndDrop();
});

// ===== FILE HANDLING =====

// Setup drag and drop
function setupDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }, false);
}

// Handle file selection
function handleFileSelect(event) {
    const files = event.target.files;
    handleFiles(files);
}

// Handle files
function handleFiles(files) {
    selectedFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (selectedFiles.length === 0) {
        alert('Παρακαλώ επιλέξτε έγκυρες εικόνες');
        return;
    }

    // Show preview
    const previewArea = document.getElementById('preview-area');
    const previewGrid = document.getElementById('preview-grid');
    previewGrid.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'relative';
            div.innerHTML = `
                <img src="${e.target.result}" class="image-preview rounded-lg">
                <button onclick="removeFile(${index})" class="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            `;
            previewGrid.appendChild(div);
        };
        reader.readAsDataURL(file);
    });

    previewArea.classList.remove('hidden');
    updateUploadButton();
}

// Remove file from selection
function removeFile(index) {
    selectedFiles.splice(index, 1);
    if (selectedFiles.length === 0) {
        document.getElementById('preview-area').classList.add('hidden');
        document.getElementById('file-input').value = '';
    } else {
        handleFiles(selectedFiles);
    }
    updateUploadButton();
}

// Select category
function selectCategory(category) {
    selectedCategory = category;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('border-rose-600', 'bg-rose-50', 'font-semibold');
        btn.classList.add('border-gray-300');
    });
    event.target.classList.add('border-rose-600', 'bg-rose-50', 'font-semibold');
    event.target.classList.remove('border-gray-300');
    updateUploadButton();
}

// Update upload button state
function updateUploadButton() {
    const btn = document.getElementById('upload-btn');
    if (selectedFiles.length > 0 && selectedCategory) {
        btn.disabled = false;
        btn.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
        btn.classList.add('bg-rose-600', 'text-white', 'hover:bg-rose-700', 'cursor-pointer');
        btn.textContent = `Ανέβασμα ${selectedFiles.length} Φωτογραφί${selectedFiles.length === 1 ? 'ας' : 'ών'}`;
    } else {
        btn.disabled = true;
        btn.classList.add('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
        btn.classList.remove('bg-rose-600', 'text-white', 'hover:bg-rose-700');
        btn.textContent = 'Επιλέξτε Φωτογραφίες';
    }
}

// ===== IMAGE UPLOAD =====

// Compress image before upload
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max dimensions
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1920;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    }));
                }, 'image/jpeg', 0.85);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Upload images
async function uploadImages() {
    if (selectedFiles.length === 0 || !selectedCategory) {
        alert('Παρακαλώ επιλέξτε φωτογραφίες και κατηγορία');
        return;
    }

    const captionEl = document.getElementById('caption-el').value.trim();
    const captionEn = document.getElementById('caption-en').value.trim();

    // Show progress
    const progressDiv = document.getElementById('upload-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    progressDiv.classList.remove('hidden');

    document.getElementById('upload-btn').disabled = true;

    try {
        // Create storage bucket if it doesn't exist
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets.some(b => b.name === STORAGE_BUCKET);

        if (!bucketExists) {
            await supabase.storage.createBucket(STORAGE_BUCKET, {
                public: true,
                fileSizeLimit: 5242880 // 5MB
            });
        }

        // Upload each file
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            progressText.textContent = `Μεταφόρτωση ${i + 1}/${selectedFiles.length}...`;
            progressBar.style.width = `${((i + 1) / selectedFiles.length) * 100}%`;

            // Compress image
            const compressedFile = await compressImage(file);

            // Generate unique filename
            const timestamp = Date.now();
            const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const storagePath = `${filename}`;

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(storagePath, compressedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw uploadError;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(storagePath);

            // Save metadata to database
            const { error: dbError } = await supabase
                .from('gallery_images')
                .insert({
                    filename: file.name,
                    storage_path: storagePath,
                    public_url: urlData.publicUrl,
                    caption_en: captionEn,
                    caption_el: captionEl,
                    category: selectedCategory,
                    display_order: timestamp,
                    is_active: true
                });

            if (dbError) {
                console.error('Database error:', dbError);
                throw dbError;
            }
        }

        // Success!
        progressText.textContent = 'Ολοκληρώθηκε!';
        setTimeout(() => {
            closeUploadModal();
            loadGallery();
        }, 1000);

    } catch (error) {
        console.error('Upload failed:', error);
        alert('Σφάλμα κατά την μεταφόρτωση: ' + error.message);
        progressDiv.classList.add('hidden');
        document.getElementById('upload-btn').disabled = false;
    }
}

// ===== GALLERY MANAGEMENT =====

// Load gallery
async function loadGallery() {
    const grid = document.getElementById('gallery-grid');
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('empty-state');

    grid.innerHTML = '';
    grid.classList.add('hidden');
    emptyState.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        let query = supabase
            .from('gallery_images')
            .select('*')
            .order('display_order', { ascending: false });

        if (currentFilter !== 'all') {
            query = query.eq('category', currentFilter);
        }

        const { data, error } = await query;

        if (error) throw error;

        loading.classList.add('hidden');

        if (!data || data.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        grid.classList.remove('hidden');

        data.forEach(image => {
            const card = document.createElement('div');
            card.className = 'relative group cursor-pointer';
            card.onclick = () => showImageDetail(image);

            card.innerHTML = `
                <img src="${image.public_url}" alt="${image.caption_el || image.filename}" class="w-full aspect-square object-cover rounded-lg shadow">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition rounded-lg flex items-center justify-center">
                    <div class="opacity-0 group-hover:opacity-100 transition text-white text-center p-2">
                        <p class="font-semibold text-sm">${image.caption_el || image.caption_en || 'Χωρίς τίτλο'}</p>
                        ${!image.is_active ? '<span class="text-xs bg-yellow-600 px-2 py-1 rounded mt-1 inline-block">Κρυφή</span>' : ''}
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Failed to load gallery:', error);
        loading.classList.add('hidden');
        alert('Σφάλμα φόρτωσης: ' + error.message);
    }
}

// Filter gallery
function filterGallery(category) {
    currentFilter = category;

    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === category) {
            btn.classList.add('bg-rose-600', 'text-white');
            btn.classList.remove('bg-gray-100', 'text-gray-700');
        } else {
            btn.classList.remove('bg-rose-600', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-700');
        }
    });

    loadGallery();
}

// Refresh gallery
function refreshGallery() {
    loadGallery();
}

// ===== IMAGE DETAIL =====

// Show image detail
function showImageDetail(image) {
    currentImageId = image.id;
    const modal = document.getElementById('detail-modal');
    const img = document.getElementById('detail-image');
    const info = document.getElementById('detail-info');
    const toggleBtn = document.getElementById('toggle-btn');

    img.src = image.public_url;

    info.innerHTML = `
        <h3 class="text-xl font-bold mb-2">${image.caption_el || image.caption_en || 'Χωρίς τίτλο'}</h3>
        <p class="text-gray-600 mb-2"><strong>Κατηγορία:</strong> ${getCategoryLabel(image.category)}</p>
        <p class="text-gray-600 mb-2"><strong>Ημερομηνία:</strong> ${new Date(image.uploaded_at).toLocaleDateString('el-GR')}</p>
        <p class="text-gray-600"><strong>Κατάσταση:</strong> ${image.is_active ? 'Ενεργή' : 'Κρυφή'}</p>
    `;

    toggleBtn.textContent = image.is_active ? 'Απόκρυψη' : 'Εμφάνιση';
    toggleBtn.className = `touch-btn flex-1 ${image.is_active ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg py-3 font-semibold transition`;

    modal.classList.remove('hidden');
}

// Close detail modal
function closeDetailModal() {
    document.getElementById('detail-modal').classList.add('hidden');
    currentImageId = null;
}

// Toggle image status
async function toggleImageStatus() {
    if (!currentImageId) return;

    try {
        // Get current status
        const { data: image } = await supabase
            .from('gallery_images')
            .select('is_active')
            .eq('id', currentImageId)
            .single();

        // Toggle
        const { error } = await supabase
            .from('gallery_images')
            .update({ is_active: !image.is_active })
            .eq('id', currentImageId);

        if (error) throw error;

        closeDetailModal();
        loadGallery();
    } catch (error) {
        console.error('Failed to toggle status:', error);
        alert('Σφάλμα: ' + error.message);
    }
}

// Delete image
async function deleteImage() {
    if (!currentImageId) return;

    if (!confirm('Είστε σίγουρος ότι θέλετε να διαγράψετε αυτή τη φωτογραφία;')) {
        return;
    }

    try {
        // Get storage path
        const { data: image } = await supabase
            .from('gallery_images')
            .select('storage_path')
            .eq('id', currentImageId)
            .single();

        // Delete from storage
        await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([image.storage_path]);

        // Delete from database
        const { error } = await supabase
            .from('gallery_images')
            .delete()
            .eq('id', currentImageId);

        if (error) throw error;

        closeDetailModal();
        loadGallery();
    } catch (error) {
        console.error('Failed to delete:', error);
        alert('Σφάλμα διαγραφής: ' + error.message);
    }
}

// ===== MODAL CONTROLS =====

// Show upload modal
function showUploadModal() {
    document.getElementById('upload-modal').classList.remove('hidden');
    selectedFiles = [];
    selectedCategory = '';
    document.getElementById('file-input').value = '';
    document.getElementById('caption-el').value = '';
    document.getElementById('caption-en').value = '';
    document.getElementById('preview-area').classList.add('hidden');
    document.getElementById('upload-progress').classList.add('hidden');
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('border-rose-600', 'bg-rose-50', 'font-semibold');
        btn.classList.add('border-gray-300');
    });
    updateUploadButton();
}

// Close upload modal
function closeUploadModal() {
    document.getElementById('upload-modal').classList.add('hidden');
}

// ===== HELPERS =====

function getCategoryLabel(category) {
    const labels = {
        'weddings': 'Γάμοι',
        'baptisms': 'Βαπτίσεις',
        'events': 'Εκδηλώσεις',
        'bouquets': 'Ανθοδέσμες',
        'all': 'Όλα'
    };
    return labels[category] || category;
}
