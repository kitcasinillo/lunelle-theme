/**
 * LUNELLE LUXURY SHOPIFY OS 2.0 - Theme Controller
 * Implements AJAX Cart Drawer, Real-time Variant Selection, Gallery, Quick Add, and Rituals
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initCartDrawer();
  initSearchDrawer();
  initAccordions();
  initProductGalleries();
  initProductVariants();
  initMobileNav();
});

// Format money using global currency setting
function formatMoney(cents) {
  if (cents === null || cents === undefined) return '';
  const format = (window.Lunelle && window.Lunelle.settings && window.Lunelle.settings.moneyFormat) || '₱{{amount}}';
  const amountWithDecimals = (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const amountNoDecimals = Math.round(cents / 100).toLocaleString('en-US');

  return format
    .replace('{{amount}}', amountWithDecimals)
    .replace('{{amount_no_decimals}}', amountNoDecimals)
    .replace('{{amount_with_comma_separator}}', amountWithDecimals);
}

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

// Slide-out Cart Drawer logic & AJAX Management
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

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });

  // Re-render Cart Drawer UI from Shopify /cart.js payload
  const renderCartUI = (cart) => {
    // 1. Update Cart Count Badges
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = cart.item_count;
    });

    // 2. Containers
    const itemsList = drawer.querySelector('.cart-items-list');
    const emptyState = drawer.querySelector('.cart-drawer-empty');
    const footer = drawer.querySelector('.cart-drawer-footer');
    const shippingBar = drawer.querySelector('.free-shipping-bar');
    const subtotalEl = drawer.querySelector('.cart-subtotal-price');

    if (!itemsList) return;

    if (cart.item_count === 0) {
      itemsList.style.display = 'none';
      itemsList.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (footer) footer.style.display = 'none';
    } else {
      itemsList.style.display = 'block';
      if (emptyState) emptyState.style.display = 'none';
      if (footer) footer.style.display = 'block';

      // Rebuild items markup
      itemsList.innerHTML = cart.items.map(item => {
        const itemImg = item.image || item.featured_image?.url || '';
        const variantTitle = item.variant_title && item.variant_title !== 'Default Title'
          ? `<div class="cart-item-variant">${item.variant_title}</div>`
          : '';

        return `
          <div class="cart-item" data-line-key="${item.key}">
            <img src="${itemImg}" alt="${item.title || ''}" class="cart-item-img" width="80" height="106" loading="lazy">
            <div style="flex: 1; min-width: 0;">
              <div class="cart-item-title">${item.product_title || item.title}</div>
              ${variantTitle}
              <div class="quantity-stepper">
                <button type="button" data-qty-change="-1" data-key="${item.key}" aria-label="Decrease">−</button>
                <span data-qty-value>${item.quantity}</span>
                <button type="button" data-qty-change="1" data-key="${item.key}" aria-label="Increase">+</button>
              </div>
            </div>
            <div style="text-align: right;">
              <div class="cart-item-price">${formatMoney(item.final_line_price)}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Subtotal
    if (subtotalEl) {
      subtotalEl.textContent = formatMoney(cart.total_price);
    }

    // 4. Free shipping progress calculation
    if (shippingBar) {
      const threshold = (window.Lunelle && window.Lunelle.settings && window.Lunelle.settings.freeShippingThreshold) || 3500;
      const thresholdCents = threshold * 100;
      const strings = (window.Lunelle && window.Lunelle.strings) || {};

      if (cart.total_price >= thresholdCents) {
        shippingBar.innerHTML = `
          <p style="margin: 0; font-weight: 500;">✓ ${strings.freeShippingAchieved || 'Complimentary domestic care delivery unlocked'}</p>
          <div class="shipping-progress-track">
            <div class="shipping-progress-fill" style="width: 100%;"></div>
          </div>
        `;
      } else {
        const diff = thresholdCents - cart.total_price;
        const diffFormatted = formatMoney(diff);
        const progress = Math.min(100, Math.round((cart.total_price / thresholdCents) * 100));
        shippingBar.innerHTML = `
          <p style="margin: 0;">Add ${diffFormatted} more for complimentary care delivery</p>
          <div class="shipping-progress-track">
            <div class="shipping-progress-fill" style="width: ${progress}%;"></div>
          </div>
        `;
      }
    }
  };

  // Fetch updated Cart state from Shopify
  const refreshCart = () => {
    const cartUrl = (window.Lunelle && window.Lunelle.routes && window.Lunelle.routes.cart_url) || '/cart';
    return fetch(`${cartUrl}.js`, {
      headers: { 'Accept': 'application/json' }
    })
      .then(res => res.json())
      .then(cart => {
        renderCartUI(cart);
        return cart;
      })
      .catch(err => console.error('Error fetching cart:', err));
  };

  // Intercept Add to Cart (Product page Form submission)
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[action*="/cart/add"]');
    if (!form) return;

    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
    }

    const formData = new FormData(form);
    const addUrl = (window.Lunelle && window.Lunelle.routes && window.Lunelle.routes.cart_add_url) || '/cart/add.js';

    fetch(addUrl, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Cart add failed');
        return res.json();
      })
      .then(() => {
        return refreshCart();
      })
      .then(() => {
        openDrawer();
      })
      .catch(err => {
        console.error('Add to cart error:', err);
        // Fallback to normal form submit if error
        form.submit();
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
          submitBtn.innerHTML = originalText;
        }
      });
  });

  // Intercept Quick Add clicks on product cards
  document.addEventListener('click', (e) => {
    const quickBtn = e.target.closest('[data-quick-add]');
    if (!quickBtn) return;

    e.preventDefault();
    const variantId = quickBtn.getAttribute('data-variant-id');
    if (!variantId) {
      // If no variant id, navigate to product page
      const card = quickBtn.closest('.product-card');
      const link = card ? card.querySelector('a') : null;
      if (link) window.location.href = link.href;
      return;
    }

    quickBtn.disabled = true;
    const addUrl = (window.Lunelle && window.Lunelle.routes && window.Lunelle.routes.cart_add_url) || '/cart/add.js';

    fetch(addUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        id: variantId,
        quantity: 1
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Quick add failed');
        return res.json();
      })
      .then(() => refreshCart())
      .then(() => openDrawer())
      .catch(err => console.error('Quick add error:', err))
      .finally(() => {
        quickBtn.disabled = false;
      });
  });

  // Handle Quantity stepper (+ / -) inside Cart Drawer via Event Delegation
  drawer.addEventListener('click', (e) => {
    const stepperBtn = e.target.closest('[data-qty-change]');
    if (!stepperBtn) return;

    const change = parseInt(stepperBtn.getAttribute('data-qty-change'), 10);
    const key = stepperBtn.getAttribute('data-key');
    const itemContainer = stepperBtn.closest('.cart-item');
    const valueEl = itemContainer ? itemContainer.querySelector('[data-qty-value]') : null;
    if (!key || !valueEl) return;

    const currentQty = parseInt(valueEl.textContent.trim(), 10) || 1;
    const newQty = Math.max(0, currentQty + change);

    // Disable button momentarily
    stepperBtn.disabled = true;
    const changeUrl = (window.Lunelle && window.Lunelle.routes && window.Lunelle.routes.cart_change_url) || '/cart/change.js';

    fetch(changeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        id: key,
        quantity: newQty
      })
    })
      .then(res => res.json())
      .then(cart => {
        renderCartUI(cart);
      })
      .catch(err => console.error('Update quantity error:', err));
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

// Dynamic Product Variants Controller
function initProductVariants() {
  document.querySelectorAll('.product-detail-section').forEach(section => {
    const sectionId = section.getAttribute('id')?.replace('ProductSection-', '');
    const variantsScript = document.querySelector(`#ProductVariants-${sectionId}`);
    let variants = [];

    if (variantsScript) {
      try {
        variants = JSON.parse(variantsScript.textContent);
      } catch (e) {
        console.error('Failed to parse product variants JSON', e);
      }
    }

    const form = section.querySelector('form[action*="/cart/add"]');
    const idInput = form ? form.querySelector('input[name="id"]') : null;
    const priceDisplay = section.querySelector('.product-price-large');
    const submitBtn = section.querySelector('.product-add-submit');
    const submitText = section.querySelector('.product-add-text');
    const mainImg = section.querySelector('.product-main-image img');

    const swatchGroups = section.querySelectorAll('.swatch-group');

    // Return currently selected option values array [opt1, opt2, opt3]
    const getSelectedOptions = () => {
      const selected = [];
      swatchGroups.forEach(group => {
        const activePill = group.querySelector('.swatch-pill.active');
        if (activePill) {
          selected.push(activePill.getAttribute('data-value'));
        }
      });
      return selected;
    };

    // Find variant whose options match the selected pills
    const findMatchingVariant = (selectedValues) => {
      if (!variants || variants.length === 0) return null;
      return variants.find(variant => {
        return variant.options.every((optValue, index) => {
          return selectedValues[index] === undefined || selectedValues[index] === optValue;
        });
      });
    };

    // Update form, price, button, and image on variant switch
    const onVariantChange = () => {
      const selected = getSelectedOptions();
      const matchedVariant = findMatchingVariant(selected);
      const strings = (window.Lunelle && window.Lunelle.strings) || {};

      if (matchedVariant) {
        // 1. Update hidden variant input id
        if (idInput) {
          idInput.value = matchedVariant.id;
        }

        // 2. Update price display
        if (priceDisplay) {
          priceDisplay.textContent = formatMoney(matchedVariant.price);
        }

        // 3. Update Add to Cart Button state
        if (submitBtn) {
          if (matchedVariant.available) {
            submitBtn.disabled = false;
            if (submitText) submitText.textContent = strings.addToCart || 'Keep for Yourself';
          } else {
            submitBtn.disabled = true;
            if (submitText) submitText.textContent = strings.soldOut || 'Currently Resting';
          }
        }

        // 4. Update Main Product Image if variant has featured image
        if (matchedVariant.featured_image && matchedVariant.featured_image.src && mainImg) {
          mainImg.src = matchedVariant.featured_image.src;
          // Synchronize thumbnail state
          section.querySelectorAll('.product-thumb').forEach(thumb => {
            const thumbImg = thumb.querySelector('img');
            if (thumbImg && thumbImg.src.includes(matchedVariant.featured_image.id)) {
              thumb.classList.add('active');
            } else {
              thumb.classList.remove('active');
            }
          });
        }

        // 5. Update browser URL variant parameter without reloading
        const url = new URL(window.location);
        url.searchParams.set('variant', matchedVariant.id);
        window.history.replaceState({}, '', url);

      } else {
        // Combination does not exist
        if (submitBtn) {
          submitBtn.disabled = true;
          if (submitText) submitText.textContent = strings.unavailable || 'Unavailable';
        }
      }
    };

    // Bind swatch pill clicks
    swatchGroups.forEach(group => {
      const pills = group.querySelectorAll('.swatch-pill');
      pills.forEach(pill => {
        pill.addEventListener('click', (e) => {
          e.preventDefault();
          pills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');

          // Update option label text (e.g. Tone: Champagne Cream)
          const selectedValue = pill.getAttribute('data-value') || pill.textContent.trim();
          const labelTarget = group.parentElement?.querySelector('[data-selected-label]');
          if (labelTarget) {
            labelTarget.textContent = selectedValue;
          }

          onVariantChange();
        });
      });
    });
  });
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

// Header Quick Search Drawer
function initSearchDrawer() {
  const trigger = document.querySelector('[data-search-trigger]');
  const drawer = document.querySelector('#HeaderSearchDrawer');
  const closeBtn = document.querySelector('.header-quick-search-close');
  const searchInput = document.querySelector('.header-quick-search-input');

  if (!trigger || !drawer) return;

  const openSearch = () => {
    drawer.classList.add('active');
    trigger.setAttribute('aria-expanded', 'true');
    setTimeout(() => {
      searchInput?.focus();
    }, 100);
  };

  const closeSearch = () => {
    drawer.classList.remove('active');
    trigger.setAttribute('aria-expanded', 'false');
  };

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    if (drawer.classList.contains('active')) {
      closeSearch();
    } else {
      openSearch();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeSearch();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeSearch();
    }
  });

  // Close when clicking outside header
  document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && !trigger.contains(e.target) && drawer.classList.contains('active')) {
      closeSearch();
    }
  });
}
