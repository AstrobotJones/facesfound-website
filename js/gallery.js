// ── Faces Found — Gallery (Supabase-powered) ──────────────
// Reads approved photos from Supabase and builds the gallery.
// To add a photo: insert a row into the photos table with
// is_approved = true. No code changes needed.

import { supabase } from './supabase-client.js';

// ── Helpers ────────────────────────────────────────────────

function statusClass(status) {
  if (!status) return 'status--unknown';
  switch (status) {
    case 'identified':          return 'status--identified';
    case 'partially_identified': return 'status--identified';
    default:                    return 'status--unknown';
  }
}

function statusLabel(status) {
  switch (status) {
    case 'identified':           return 'Identified';
    case 'partially_identified': return 'Partially identified';
    default:                     return 'Unidentified';
  }
}

// Get a public URL for a photo stored in Supabase Storage
function photoUrl(path) {
  if (!path) return 'https://via.placeholder.com/400x300/f0e6d3/7a5c45?text=No+image';
  if (path.startsWith('http')) return path; // already a full URL
  const { data } = supabase.storage.from('photos').getPublicUrl(path);
  return data?.publicUrl || '';
}

// Build a single photo card element
function buildCard(photo) {
  const imgUrl = photoUrl(photo.image_front);
  const card   = document.createElement('div');

  card.className = 'photo-card';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View photo: ${photo.title}`);
  card.dataset.category   = (photo.category || '').toLowerCase().trim();
  card.dataset.searchText = [
    photo.title, photo.era, photo.location,
    photo.found_where, photo.status, photo.description
  ].join(' ').toLowerCase();

  // Modal data
  card.dataset.img      = imgUrl;
  card.dataset.era      = photo.era        || '';
  card.dataset.title    = photo.title      || 'Untitled';
  card.dataset.location = photo.location   || 'Unknown';
  card.dataset.found    = photo.found_where || 'Unknown';
  card.dataset.status   = statusLabel(photo.status);
  card.dataset.desc     = photo.description || '';

  card.innerHTML = `
    <img class="photo-card__img"
         src="${imgUrl}"
         alt="${photo.title || 'Orphaned photograph'}"
         loading="lazy"
         onerror="this.src='https://via.placeholder.com/400x300/f0e6d3/7a5c45?text=Photo+unavailable'" />
    <div class="photo-card__meta">
      <span class="photo-card__era">${photo.era || ''}</span>
      <h3 class="photo-card__title">${photo.title || 'Untitled'}</h3>
      <p class="photo-card__location">Found: ${photo.found_where || 'Unknown'}</p>
      <span class="photo-card__status ${statusClass(photo.status)}">${statusLabel(photo.status)}</span>
    </div>`;

  const openThis = () => openModal({
    img:      card.dataset.img,
    era:      card.dataset.era,
    title:    card.dataset.title,
    location: card.dataset.location,
    found:    card.dataset.found,
    status:   card.dataset.status,
    desc:     card.dataset.desc,
  });

  card.addEventListener('click', openThis);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') openThis();
  });

  return card;
}

// ── Main loader ────────────────────────────────────────────

async function loadGallery() {
  const grid     = document.getElementById('gallery-grid');
  const statusEl = document.getElementById('gallery-status');
  const emptyEl  = document.getElementById('gallery-empty');
  if (!grid) return;

  try {
    const { data: photos, error } = await supabase
      .from('gallery_photos')   // our convenience view
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!photos || photos.length === 0) {
      statusEl.textContent = 'No photos in the collection yet. Be the first to submit one!';
      return;
    }

    grid.innerHTML = '';
    photos.forEach(photo => grid.appendChild(buildCard(photo)));

    statusEl.textContent =
      `${photos.length} photograph${photos.length !== 1 ? 's' : ''} in the collection`;

    initFilterAndSearch();

  } catch (err) {
    console.error('Gallery load error:', err);
    statusEl.textContent =
      'Could not load the collection right now. Please try refreshing the page.';
  }
}

// ── Filter + Search ────────────────────────────────────────

function initFilterAndSearch() {
  const grid       = document.getElementById('gallery-grid');
  const emptyEl    = document.getElementById('gallery-empty');
  const searchEl   = document.getElementById('gallery-search');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let activeFilter = 'all';
  let searchTerm   = '';

  function applyFilters() {
    const cards = grid.querySelectorAll('.photo-card');
    let visible = 0;

    cards.forEach(card => {
      const categoryMatch =
        activeFilter === 'all' || card.dataset.category === activeFilter;
      const searchMatch =
        !searchTerm || card.dataset.searchText.includes(searchTerm);
      const show = categoryMatch && searchMatch;
      card.style.display = show ? 'block' : 'none';
      if (show) visible++;
    });

    emptyEl.style.display = visible === 0 ? 'block' : 'none';
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  if (searchEl) {
    searchEl.addEventListener('input', () => {
      searchTerm = searchEl.value.toLowerCase().trim();
      applyFilters();
    });
  }
}

// ── Boot ──────────────────────────────────────────────────
loadGallery();
