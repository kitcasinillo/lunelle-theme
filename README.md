# LUNELLE · Luxury Lingerie Shopify OS 2.0 Theme

> *"Softness, Reclaimed. Every piece reminds you that you, too, deserve beauty."*

A luxury e-commerce theme built for **LUNELLE** on Shopify Online Store 2.0 architecture, featuring strict brand alignment, bespoke Cochin typography, an interactive self-care cart drawer, and responsive mobile-first design.

---

## Brand Identity & Design System

### Color Palette
- **Champagne Cream (`#EFE7DF`)**: Primary background & warm canvas
- **Soft Nude Beige (`#D8C7B8`)**: Secondary background, card surfaces, textures
- **Dusty Rose Taupe (`#B9968A`)**: Accents, eyebrow labels, subtle highlights
- **Warm Mocha Brown (`#8A6B5A`)**: Body copy, secondary text, delicate borders
- **Cocoa Taupe (`#6B5448`)**: Headlines, wordmarks, primary buttons, key UI touchpoints

### Typography
- **Sole Brand Typeface**: Authentic **Cochin** (`cochin.woff2` / `cochin-bold.woff2`) bundled locally in `assets/` with strict zero-external-CDN dependency for performance, privacy, and exact brand fidelity.

---

## Features & Highlights

### Mobile-First Responsive Experience
- **Adaptive Mobile Header (66px)**: Touch-friendly hamburger toggle (44px target), centered Lunelle emblem, and bag trigger with notification badge.
- **Slide-out Navigation Drawer**: Slide-in mobile menu with frosted backdrop, delicate dividers, brand philosophy quote, and social channels. Auto-dismisses on backdrop tap, link tap, or Escape.
- **2-Column Luxury Mobile Boutique Grid**: Two-column layout on phones (`repeat(2, 1fr)`) with permanently docked, touch-accessible quick-add buttons ("Keep for Yourself").
- **Zero-Overflow Hero**: Frosted glass brand promise badge anchored safely within the viewport on all screen sizes.

### E-Commerce & Brand Rituals
- **Slide-Out Bag Drawer (AJAX)**:
  - Free shipping progress bar unlocked at ₱3,500 threshold
  - Interactive quantity steppers
  - "Include a Whisper Note to Yourself" personalized self-care gift note with local persistence
- **Signature Product Detail Demo**:
  - Interactive multi-angle image gallery
  - Tone & size swatch selectors with dynamic label feedback
  - Expandable ritual accordions (*Details & Materials*, *Ritual & Care Guide*, *The Unboxing Ritual*)
- **Editorial Brand Storytelling**:
  - "For the Woman Behind Every Role" foundation story
  - "Motherhood Changes Everything" editorial section
  - "The Unboxing Whisper" packaging touchpoint with quote card
  - "Notes on Softness" intimate dispatch newsletter subscription

---

## Theme Architecture

```
lunelle/
├── assets/
│   ├── base.css                      # Complete OS 2.0 design system & mobile media queries
│   ├── theme.js                      # Bag drawer, mobile nav, swatches, accordions
│   ├── cochin.woff2                  # Local Cochin Regular font
│   ├── cochin-bold.woff2             # Local Cochin Bold font
│   ├── lunelle-logo-taupe.svg        # Primary wordmark (Cocoa Taupe)
│   ├── lunelle-logo-white.svg        # Inverted wordmark (White / Champagne)
│   └── lunelle-brand-mark-taupe.svg  # Sacred lotus emblem
├── config/
│   ├── settings_schema.json          # Shopify theme editor settings & typography tokens
│   └── settings_data.json            # Active theme preset colors & typography
├── layout/
│   └── theme.liquid                  # Master HTML shell & SEO metadata
├── locales/
│   └── en.default.json               # Full English brand translation dictionary
├── sections/
│   ├── announcement-bar.liquid       # Top promotion / brand whisper bar
│   ├── header.liquid                 # Responsive header & mobile drawer
│   ├── hero-banner.liquid            # Hero section with brand promise badge
│   ├── brand-story.liquid            # Brand philosophy narrative
│   ├── featured-collection.liquid    # Signature edit product grid
│   ├── product-template.liquid       # Interactive product page template
│   ├── image-with-text.liquid        # Motherhood & editorial feature
│   ├── packaging-experience.liquid   # Physical unboxing ritual
│   ├── newsletter.liquid             # Dispatch subscription
│   ├── footer.liquid                 # Footer & house links
│   └── main-page.liquid              # Standard content page
├── snippets/
│   ├── cart-drawer.liquid            # Slide-out bag drawer
│   ├── product-card.liquid           # Reusable product grid card
│   ├── icon-lotus.liquid             # Vector brand mark
│   ├── icon-cart.liquid              # Bag icon
│   ├── icon-menu.liquid              # Mobile toggle icon
│   ├── icon-close.liquid             # Modal close icon
│   └── icon-search.liquid            # Search icon
├── templates/
│   ├── index.json                    # OS 2.0 Homepage section configuration
│   └── product.json                  # Product details configuration
├── preview.html                      # Standalone interactive browser preview
└── lunelle-shopify-theme.zip         # Pre-packaged theme archive ready for upload
```

---

## Installation & Deployment

### Uploading to Shopify Admin
1. Download or locate `lunelle-shopify-theme.zip`.
2. Go to your **Shopify Admin** &rarr; **Online Store** &rarr; **Themes**.
3. Under *Theme library*, click **Add theme** &rarr; **Upload zip file**.
4. Select `lunelle-shopify-theme.zip` and click **Upload**.
5. Click **Actions** &rarr; **Publish** when ready to go live.

### Local Development / Preview
- Open `preview.html` in any modern web browser or serve via local web server (`http://localhost/lunelle/preview.html`) to test desktop and mobile responsiveness interactively.

---

## License & Credits
Designed and engineered for **LUNELLE**. All brand assets, copy, and visual marks reserved.
