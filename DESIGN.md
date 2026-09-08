# IDS Fintech Portal Design System

## Direction

IDS Fintech is a light, high-density enterprise operations portal. It should feel calm, precise, and dependable: strong black and white hierarchy, restrained blue selection states, thin borders, and functional semantic color. It is not a marketing site and does not use decorative gradients, glass surfaces, or oversized rounded cards.

## Foundations

- Canvas: `#f7f8fa`
- Primary surface: `#ffffff`
- Text: `#171717`
- Secondary text: `#5f6368`
- Border: `#d9dde3`
- Quiet surface: `#f3f5f7`
- Selection: `#e7f0ff`
- Accent: `#2563a6`
- Success: `#16794b`
- Warning: `#a66200`
- Danger: `#ba2a2a`

Use system UI fonts (`Segoe UI`, `system-ui`, `-apple-system`) with compact, high-legibility type. Headings use 600 weight with tight negative tracking. Body and tables use 14px; captions and column labels use 12px.

## Layout

- Desktop sidebar: 232px, near-white with a right hairline border.
- Top bar: 64px, white, compact global search and account controls.
- Main canvas: 1440px maximum width; 32-40px desktop padding and 16px mobile padding.
- Grid spacing: 12px for controls, 16px for sections, 20px for related panels, 32px between page groups.

## Components

- Controls: 42-44px tall, 6px radius, thin neutral border, blue focus ring.
- Buttons: 6px radius, black primary action, white secondary action, semantic red only for destructive actions.
- Surfaces: white with a 1px border, 8px radius, no default shadow.
- Tables: uppercase 11-12px headers, subtle row separators, pointer-only row hover, compact 14px data cells.
- Status badges: compact 5px radius, semantic fill only when a real status is conveyed. Avoid generic pills.
- Metrics: compact bordered blocks with an optional small semantic indicator, not floating dashboard cards.

## Behavior

Use fast, property-specific transitions (120-180ms) for color, border, opacity, and transform. Pressable controls scale to `0.98`. Respect reduced motion, reduced transparency, and increased contrast preferences. Mobile layouts collapse deliberately, preserve touch targets, and allow data tables to scroll horizontally.

## Information Architecture

The sidebar groups operational areas and administration. The dashboard summarizes only existing data. List pages are management workspaces with a controlled toolbar and table. Detail pages place primary content first and use contextual metadata panels only where they improve scanning and actions.
