// ── Faces Found — Gallery loader ──────────────────────────────────────────
// Reads photo data from a public Google Sheet and builds the gallery.
// To add a photo: add a row to the sheet. No code changes needed.
//
// Column order in sheet:
// A=id  B=title  C=era  D=location  E=found  F=status  G=category
// H=description  I=image_url

const SHEET_ID  = '1uvy6dwvbvhBQhMo19grAXfM4XjZqIpghVo6vN5NIIJI';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1`;

// ── Helpers ────────────────────────────────────────────────────────────────

// Convert a standard Google Drive share URL to a direct image URL
function driveUrl(raw) {
  if (!raw) return '';
  // Already a direct/thumbnail URL — leave it alone
  if (raw.includes('drive.google.com/uc') || raw.includes('lh3.googleusercontent')) return raw;
  // Extract file ID from share URL formats
  const match = raw.match(/[-\w]{25,}/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[0]}`;
  return raw;
}

function statusClass(status) {
  if (!status) return 'status--unknown';
  const s = status.toLowerCase();
  if (s.includes('identified') && s.includes('partially')) return 'status--identified';
  if (s.includes('identified')) return 'status--identified';
  if (s.includes('available')) return 'status--available';
  return 'status--unknown';
}

// Build a single photo card element
function buildCard(photo) {
  const imgUrl = driveUrl(photo.image_url);
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View photo: ${photo.title}`);
  card.dataset.category = (photo.category || '').toLowerCase().trim();
  card.dataset.searchText = [
    photo.title, photo.era, photo.location,
    photo.found, photo.status, photo.description
  ].join(' ').toLowerCase();

  // Store modal data
  card.dataset.img    = imgUrl;
  card.dataset.era    = photo.era        || '';
  card.dataset.title  = photo.title      || 'Untitled';
  card.dataset.location = photo.location || 'Unknown';
  card.dataset.found  = photo.found      || 'Unknown';
  card.dataset.status = photo.status     || 'Unidentified';
  card.dataset.desc   = photo.description || '';

  card.innerHTML = `
    <img class="photo-card__img"
         src="${imgUrl}"
         alt="${photo.title || 'Orphaned photograph'}"
         loading="lazy"
         onerror="this.src='https://via.placeholder.com/400x300/f0e6d3/7a5c45?text=Photo+unavailable'" />
    <div class="photo-card__meta">
      <span class="photo-card__era">${photo.era || ''}</span>
      <h3 class="photo-card__title">${photo.title || 'Untitled'}</h3>
      <p class="photo-card__location">Found: ${photo.found || 'Unknown'}</p>
      <span class="photo-card__status ${statusClass(photo.status)}">${photo.status || 'Unidentified'}</span>
    </div>`;

  // Click and keyboard handlers → open modal
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
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openThis(); });

  return card;
}

// ── Main loader ────────────────────────────────────────────────────────────

async function loadGallery() {
  const grid      = document.getElementById('gallery-grid');
  const statusEl  = document.getElementById('gallery-status');
  const emptyEl   = document.getElementById('gallery-empty');
  if (!grid) return;

  try {
    const res  = await fetch(SHEET_URL);
    const text = await res.text();

    // Google wraps the JSON in a callback — strip it
    const json = JSON.parse(text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)[1]);
    const rows = json.table.rows;

    if (!rows || rows.length === 0) {
      statusEl.textContent = 'No photos in the collection yet. Be the first to submit one!';
      return;
    }

    const photos = rows.map(row => ({
      id:          row.c[0]?.v ?? '',
      title:       row.c[1]?.v ?? '',
      era:         row.c[2]?.v ?? '',
      location:    row.c[3]?.v ?? '',
      found:       row.c[4]?.v ?? '',
      status:      row.c[5]?.v ?? '',
      category:    row.c[6]?.v ?? '',
      description: row.c[7]?.v ?? '',
      image_url:   row.c[8]?.v ?? '',
    }));

    // Render cards
    photos.forEach(photo => grid.appendChild(buildCard(photo)));

    statusEl.textContent = `${photos.length} photograph${photos.length !== 1 ? 's' : ''} in the collection`;

    // Attach filter + search behaviour now that cards exist
    initFilterAndSearch();

  } catch (err) {
    console.error('Gallery load error:', err);
    statusEl.textContent = 'Could not load the collection right now. Please try refreshing the page.';
  }
}

// ── Filter + Search ────────────────────────────────────────────────────────

function initFilterAndSearch() {
  const grid     = document.getElementById('gallery-grid');
  const emptyEl  = document.getElementById('gallery-empty');
  const searchEl = document.getElementById('gallery-search');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let activeFilter = 'all';
  let searchTerm   = '';

  function applyFilters() {
    const cards = grid.querySelectorAll('.photo-card');
    let visible = 0;

    cards.forEach(card => {
      const categoryMatch = activeFilter === 'all' || card.dataset.category === activeFilter;
      const searchMatch   = !searchTerm || card.dataset.searchText.includes(searchTerm);
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

// ── Boot ───────────────────────────────────────────────────────────────────
loadGallery();
