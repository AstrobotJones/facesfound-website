// ── Mobile nav toggle ──────────────────────────
const navToggle = document.querySelector('.nav__toggle');
const navLinks  = document.querySelector('.nav__links');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const expanded = navLinks.classList.contains('open');
    navToggle.setAttribute('aria-expanded', expanded);
  });
}

// ── Active nav link ────────────────────────────
document.querySelectorAll('.nav__links a').forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add('active');
  }
});

// ── Gallery filter ─────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const photoCards = document.querySelectorAll('.photo-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    photoCards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.display = show ? 'block' : 'none';
    });
  });
});

// ── Photo modal ────────────────────────────────
const modalOverlay = document.getElementById('photo-modal');
const modalClose   = document.querySelector('.modal__close');

function openModal(data) {
  if (!modalOverlay) return;

  modalOverlay.querySelector('.modal__img').src         = data.img;
  modalOverlay.querySelector('.modal__img').alt         = data.title;
  modalOverlay.querySelector('.modal__era').textContent  = data.era;
  modalOverlay.querySelector('.modal__title').textContent = data.title;
  modalOverlay.querySelector('#modal-location').textContent = data.location || 'Unknown';
  modalOverlay.querySelector('#modal-found').textContent    = data.found    || 'Unknown';
  modalOverlay.querySelector('#modal-status').textContent   = data.status   || 'Unidentified';
  modalOverlay.querySelector('.modal__desc').textContent    = data.desc;

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (modalClose)   modalClose.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Attach click handlers to photo cards
photoCards.forEach(card => {
  card.addEventListener('click', () => {
    openModal({
      img:      card.dataset.img,
      era:      card.dataset.era,
      title:    card.dataset.title,
      location: card.dataset.location,
      found:    card.dataset.found,
      status:   card.dataset.status,
      desc:     card.dataset.desc,
    });
  });
});

// ── Contact form (submit feedback) ─────────
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', () => {
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;
  });
}
