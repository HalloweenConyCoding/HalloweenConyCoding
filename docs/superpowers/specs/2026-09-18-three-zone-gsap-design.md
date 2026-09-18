# Three-Zone Profile Scroll Design

## Goal

Restructure the homepage into three scroll zones while keeping one continuous galaxy wallpaper, making zone color changes blend slowly, and giving the three showcase cards directional GSAP reveals.

## Zone model

- Zone A (`intro`): `#library`, the short personal introduction.
- Zone B (`collection`): `#celestial`, `#about`, `#ai-team`, and `#uncharted`, with larger breathing room between internal topics.
- Zone C (`contact`): `#connect`, the contact section.

The existing section IDs and navigation links remain stable. Wrapper elements carry the zone identity so the grouping is semantic without changing deep links.

## Motion model

The homepage loads the repository's local GSAP and ScrollTrigger builds. Each collection card has one ScrollTrigger with a one-shot timeline:

- Radio Planning Tools starts transparent below its destination and rises into place.
- Task Planner starts transparent to the right and crosses through the featured card's visual space.
- CodeSnippet starts transparent to the left and crosses in the opposite direction.

Each timeline uses a fast-to-slow `power3.out` arrival, a small four-pixel overshoot, and a short `power2.out` dampening step back to zero. Cards finish at `opacity: 1` and remain locked in place until the trigger is crossed backward; crossing forward again replays the entrance. Existing IntersectionObserver reveals exclude these cards so two animation systems cannot compete for their transforms.

## Theme and spacing

The fixed galaxy wallpaper remains the only global image; the intro has no section-local picture layered over it. Its cream tint is a fixed screen filter that fades to transparent as the collection begins. Three fixed low-opacity zone tint layers (cream, deep blue, warm cream) crossfade through long, scrubbed ScrollTriggers. The galaxy layer is vertically overscanned to remain visible at its deepest parallax offset, including behind the footer. The existing section fade ramps remain as a CSS fallback and boundary guard. Zone wrappers add viewport-relative breathing room; no pinning is introduced, so native scrolling and anchors remain predictable.

## Accessibility and failure handling

When GSAP or ScrollTrigger is unavailable, content remains visible and native CSS fades/parallax continue. When `prefers-reduced-motion` matches, the GSAP timelines are skipped and all cards use their final position and opacity. Mobile uses smaller distances and the same directional ordering without horizontal overflow.

## Validation

Static tests will verify the three wrappers, local GSAP script order, reveal directions, opacity/transform declarations, and tint layers. Browser checks will verify the loaded GSAP globals, card transforms/opacity before and after entering the trigger range, smooth tint interpolation, reduced-motion visibility, mobile overflow, and existing navigation behavior.
