/**
 * LUNELLE LUXURY SHOPIFY OS 2.0 - Theme Controller
 * Implements Cart Drawer, Variant Selection, Gallery, and Ritual Accordions
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initCartDrawer();
  initAccordions();
  initProductGalleries();
  initSwatches();
  initMobileNav();
});

// Sticky Header blur/shadow on scroll
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

// Slide-out Cart Drawer logic
function initCartDrawer() {
  const overlay = document.querySelector('.cart-drawer-overlay');
  const drawer = document.querySelector('.cart-drawer');
  const openButtons = document.querySelectorAll('[data-cart-drawer-trigger]');
  const closeButtons = document.querySelectorAll('.cart-drawer-close, .cart-drawer-overlay');

  if (!drawer) return;

  const openDrawer = () => {
    drawer.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  openButtons.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer();
  }));

  closeButtons.forEach(btn => btn.addEventListener('click', closeDrawer));

  // Quick Add / Add to Cart interceptor for AJAX drawer
  document.querySelectorAll('form[action*="/cart/add"], [data-quick-add]').forEach(formOrBtn => {
    formOrBtn.addEventListener('click', (e) => {
      if (formOrBtn.hasAttribute('data-quick-add')) {
        e.preventDefault();
        openDrawer();
      }
    });
  });

  // Gift note local persistence
  const giftNoteInput = document.querySelector('#cart-gift-note-text');
  if (giftNoteInput) {
    giftNoteInput.value = localStorage.getItem('lunelle_whisper_note') || '';
    giftNoteInput.addEventListener('input', () => {
      localStorage.setItem('lunelle_whisper_note', giftNoteInput.value);
    });
  }
}

// Product Detail & Ritual Accordions
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      if (!item) return;
      const isOpen = item.classList.contains('open');

      // Close siblings if inside an accordion group
      const parent = item.parentElement;
      if (parent) {
        parent.querySelectorAll('.accordion-item').forEach(sibling => {
          sibling.classList.remove('open');
          sibling.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
        });
      }

      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      } else {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// Product Detail Gallery
function initProductGalleries() {
  document.querySelectorAll('.product-detail-section').forEach(section => {
    const mainImg = section.querySelector('.product-main-image img');
    const thumbs = section.querySelectorAll('.product-thumb');

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const newSrc = thumb.getAttribute('data-full-src') || thumb.querySelector('img')?.src;
        if (newSrc && mainImg) {
          mainImg.src = newSrc;
          thumbs.forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        }
      });
    });
  });
}

// Swatch Pill selection
function initSwatches() {
  document.querySelectorAll('.swatch-group').forEach(group => {
    const pills = group.querySelectorAll('.swatch-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const selectedValue = pill.getAttribute('data-value') || pill.textContent.trim();
        const labelTarget = group.parentElement?.querySelector('[data-selected-label]');
        if (labelTarget) {
          labelTarget.textContent = selectedValue;
        }
      });
    });
  });
}

// Mobile Nav Toggle
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu-drawer');
  const mobileClose = document.querySelector('.mobile-menu-close');

  if (!toggleBtn || !mobileMenu) return;

  const openNav = () => {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openNav();
  });

  if (mobileClose) {
    mobileClose.addEventListener('click', (e) => {
      e.preventDefault();
      closeNav();
    });
  }

  // Backdrop tap outside drawer inner content
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) {
      closeNav();
    }
  });

  // Close when clicking any nav link inside drawer
  mobileMenu.querySelectorAll('.mobile-menu-nav a').forEach(link => {
    link.addEventListener('click', () => {
      closeNav();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeNav();
    }
  });
}
