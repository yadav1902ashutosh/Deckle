---
name: Serene Fiction
colors:
  surface: '#fdf9f0'
  surface-dim: '#dddad1'
  surface-bright: '#fdf9f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ea'
  surface-container: '#f1eee5'
  surface-container-high: '#ece8df'
  surface-container-highest: '#e6e2d9'
  on-surface: '#1c1c16'
  on-surface-variant: '#52443b'
  inverse-surface: '#31302b'
  inverse-on-surface: '#f4f0e7'
  outline: '#84746a'
  outline-variant: '#d6c3b7'
  surface-tint: '#865228'
  primary: '#7d4a21'
  on-primary: '#ffffff'
  primary-container: '#9a6237'
  on-primary-container: '#fff1e9'
  inverse-primary: '#fdb785'
  secondary: '#675d52'
  on-secondary: '#ffffff'
  secondary-container: '#ecddcf'
  on-secondary-container: '#6b6156'
  tertiary: '#605547'
  on-tertiary: '#ffffff'
  tertiary-container: '#796d5e'
  on-tertiary-container: '#fff1e2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc5'
  primary-fixed-dim: '#fdb785'
  on-primary-fixed: '#301400'
  on-primary-fixed-variant: '#6a3b13'
  secondary-fixed: '#efe0d2'
  secondary-fixed-dim: '#d2c4b7'
  on-secondary-fixed: '#221a12'
  on-secondary-fixed-variant: '#4f453b'
  tertiary-fixed: '#f0e0cd'
  tertiary-fixed-dim: '#d3c4b2'
  on-tertiary-fixed: '#221a0f'
  on-tertiary-fixed-variant: '#4f4538'
  background: '#fdf9f0'
  on-background: '#1c1c16'
  surface-variant: '#e6e2d9'
typography:
  headline-xl:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-reading-lg:
    fontFamily: Newsreader
    fontSize: 21px
    fontWeight: '400'
    lineHeight: 38px
  body-reading-md:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 33px
  body-reading-sm:
    fontFamily: Newsreader
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 29px
  body-ui:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-ui-dense:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is tailored for an immersive, distraction-free reading experience that modernizes the hyper-efficient catalog structures of Asian web novel platforms while eliminating their visual clutter. The aesthetic merges the calm warmth of classical print publishing with precise, low-friction digital ergonomics.

The platform targets deep readers, casual web fiction enthusiasts, and serialized literature connoisseurs who consume hundreds of thousands of words weekly on mobile devices. The visual emotional tone evokes quiet focus, physical paper tactility, and effortless flow.

The movement is **Refined Editorial Minimalism**: generous negative space around high-density informational hubs, featherweight hairline borders, absence of dramatic dropshadows, and a disciplined focus on reading typography. The interface chrome recedes entirely during long reading sessions and reappears with tactile clarity through gestures and thumb-zone interactions.

## Colors

The system relies on a unified semantic color mapping applied across 5 discrete, high-legibility theme modes. Each mode satisfies strict WCAG AAA contrast ratios for body copy while preserving eye comfort during hours of continuous reading.

### Theme Modes

1. **Parchment (Default / Literary Warmth)**
   - Canvas: `#F9F5EC`
   - Surface Container: `#F1EAD9`
   - Text Primary: `#2E261D`
   - Text Muted: `#766A5B`
   - Border Subtle: `#E5DEC9`
   - Accent Primary: `#9A6237`

2. **Crisp Paper (Daylight Clean)**
   - Canvas: `#FFFFFF`
   - Surface Container: `#F8FAFC`
   - Text Primary: `#1E293B`
   - Text Muted: `#64748B`
   - Border Subtle: `#E2E8F0`
   - Accent Primary: `#2563EB`

3. **Soft Sage (Eye Care / Chromatic Rest)**
   - Canvas: `#EBF1EA`
   - Surface Container: `#E0E9DF`
   - Text Primary: `#233527`
   - Text Muted: `#526A57`
   - Border Subtle: `#D3DDD2`
   - Accent Primary: `#2E7D32`

4. **Nocturne (Slate Twilight)**
   - Canvas: `#191E24`
   - Surface Container: `#222932`
   - Text Primary: `#CBD5E1`
   - Text Muted: `#8191A4`
   - Border Subtle: `#2B3542`
   - Accent Primary: `#60A5FA`

5. **Midnight (OLED Battery Saver)**
   - Canvas: `#0B0C0E`
   - Surface Container: `#14161A`
   - Text Primary: `#94A3B8`
   - Text Muted: `#626D7C`
   - Border Subtle: `#1F2228`
   - Accent Primary: `#F59E0B`

Status badges use muted semantic fills:
- Ongoing: Accent tint at 12% opacity with solid accent text.
- Completed: Neutral tint at 10% opacity with muted body text.

## Typography

Typography establishes an intentional dichotomy: immersive classical serifs for literature and modern geometric sans-serifs for the operational interface.

- **Reading Engine**: Powered by `Newsreader` with optical sizing enabled. Body prose defaults to a golden line-height ratio of 1.8x (`body-reading-md` at 18px size with 33px leading) to facilitate natural eye-tracking across extended passages without line jumping or visual fatigue. Paragraphs are styled with an intentional bottom paragraph gap (`space-md`) or traditional first-line indent based on user preference.
- **UI Chrome & Metadata**: Standardized on `Plus Jakarta Sans`. Its open apertures and crisp geometry provide high legibility for rapid scanning of chapter numbers, character counts, status indicators, and dense index listings.
- **Novel Titles**: Rendered in `Newsreader` medium and semibold weights to preserve the editorial, physical-book authority across catalog cards and detail headers.

## Layout & Spacing

The layout model is mobile-first, single-column optimized, pivoting to a structured 12-column grid on desktop viewport widths.

### Form Factors & Breakpoints
- **Mobile (< 640px)**: Edge-to-edge layout with a strict `1rem` (16px) margin. Reader views feature comfortable lateral padding (`1.25rem`) to prevent text from colliding with device bezels or curved screen edges.
- **Tablet (640px - 1024px)**: 8-column layout. Directory views display 2 cards per row. Reader containers constrain to a maximum width of `680px` centered on the canvas to protect optimal line length (60–75 characters per line).
- **Desktop (> 1024px)**: 12-column layout. Novel catalogs scale to a 3-column or 4-column card grid. The reader view remains locked to an ergonomically centered `720px` reading well, with collapsible ancillary panels (Table of Contents, Reading Preferences) occupying the lateral canvas margins.

### Thumb-Zone Ergonomics
All primary operational triggers—next/previous chapter buttons, font adjustments, table of contents access, and theme pickers—are pinned inside the lower 35% of the mobile viewport within standard thumb reach.

## Elevation & Depth

Visual hierarchy rejects heavy, modern drop shadows in favor of **low-contrast outlines** paired with **subtle tonal layering**. This keeps the interface featherweight and responsive on mobile browsers.

- **Level 0 (Base Canvas)**: The primary ambient canvas background for the active color theme.
- **Level 1 (Card & Content Containers)**: Background shifted subtly towards the surface container tone, separated by a crisp 1px solid border (`border-subtle`). No shadow.
- **Level 2 (Sticky Headers & Persistent Footers)**: Frosted backdrop blur (`backdrop-filter: blur(12px)`) with 85% surface opacity, anchored by a 1px border along the dividing edge.
- **Level 3 (Slide-Over Sheets & Modals)**: Surface container background with a diffuse ambient shadow tinted to the current theme's text color: `0 8px 30px rgba(0, 0, 0, 0.12)` in light/sepia modes, and `0 8px 30px rgba(0, 0, 0, 0.45)` in dark/OLED modes. Modals are bordered with a 1px hairline stroke for edge separation.

## Shapes

The shape vocabulary uses the `Soft` standard (0.25rem base radius) to evoke the crisp edges of cut paper sheets, book spines, and clean editorial layouts.

- **Standard Elements (0.25rem / 4px)**: Book thumbnail covers, input fields, dropdown trigger buttons, and novel cards.
- **Grouped & Floating Containers (0.5rem / 8px)**: Bottom sheets, flyout menus, search popovers, and sticky reading toolbars.
- **Interactive Badges & Theme Selectors (Fully Rounded / Pill)**: Status pills (Ongoing/Completed), taxonomy tags, and circular theme-swatch nodes.

## Components

### Novel Catalog Card (High-Density)
- **Structure**: Horizontal flex item on mobile; vertical card on desktop.
- **Cover Thumbnail**: Fixed 3:4 aspect ratio (64px x 85px on mobile, 120px x 160px on desktop), `rounded-sm` with a 1px inset border to prevent pure white covers from bleeding into light canvases.
- **Content Area**: Novel Title in `title-sm`, single-line clamp. Direct author attribution underneath (`label-md` with muted text). Clamped 2-line synopsis in `body-ui-dense`.
- **Meta Row**: Bottom-aligned flex row containing the Status Pill, total word count, and latest updated chapter index.

### Sticky Reading Action Bar
- **Positioning**: Fixed to the bottom edge, safe-area-inset padded.
- **Dimensions**: 56px height, thumb-reachable target zones with minimum 44x44px touch footprints.
- **Controls**: Chapter Prev/Next pagination arrows, Table of Contents icon trigger, Typography settings toggle, and Progress slider with dynamic chapter percentage readout.
- **Behavior**: Auto-hides on downward scroll; reveals instantly on upward scroll tap or screen-center tap.

### Filter & Category Pills
- **Geometry**: Pill-shaped, padding `0.375rem 0.875rem`, typography in `label-md`.
- **Default State**: Transparent fill, 1px solid border using `border-subtle`, text in `text-muted`.
- **Active State**: Inset tint background (accent color at 10% opacity), border matching `accent-primary`, text in `accent-primary`.

### Theme Picker
- **Component**: Horizontal row of 5 circular swatch nodes (32px diameter each).
- **Structure**: Each circle displays its canvas fill color with an internal 1px split preview of its accent color.
- **Active Selection**: Surrounded by a 2px offset ring matching the selected theme's `accent-primary`.

### Slide-Over Drawer Sheet (Table of Contents)
- **Mobile**: Slides upward from the bottom occupying 85vh, with a grab-handle indicator at the top center.
- **Desktop**: Slides in from the left margin as a 380px wide panel.
- **List Styling**: Numbered chapter index rendered in `body-ui`, right-aligned release date or word count in `label-sm`. Active reading chapter highlighted with accent font color and a 3px vertical accent bar on the leading edge.

### Buttons & Inputs
- **Primary Buttons**: Background `accent-primary`, high-contrast text, 44px minimum height, `rounded-sm`, semibold weight.
- **Search & Filter Inputs**: Background `surface-container`, 1px solid `border-subtle`, 44px height, typography in `body-ui`, placeholder in `text-muted`. Focus state outlines cleanly with a 1px `accent-primary` stroke without outer glow rings.