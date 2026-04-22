```markdown
# Design System Specification: The Hydro-Precision Curator

## 1. Overview & Creative North Star

### Creative North Star: "The Hydro-Precision Curator"
The design system is built on the intersection of biological fluidity and technical precision. We are moving away from the "generic e-commerce" template. Instead, this system treats fish husbandry as a high-tech science. It balances the organic, flowing nature of water with the rigid, reliable architecture of a Spring Boot/PostgreSQL backend.

To break the "template" look, we utilize **Intentional Asymmetry**. Hero sections should feature overlapping elements—product imagery bleeding out of containers and typography that bridges two different surface tones. We reject the "boxed-in" layout in favor of an editorial, high-end digital experience that feels as deep and clear as a well-maintained hatchery tank.

---

## 2. Colors & Surface Architecture

The palette is anchored in deep aquatic tones (`primary`) and biological teals (`secondary`), balanced by sterile, high-tech whites (`surface`).

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be established through:
1.  **Background Color Shifts:** Placing a `surface-container-low` section against a `background` or `surface` canvas.
2.  **Tonal Transitions:** Using subtle shifts in the surface hierarchy to denote the end of one content block and the start of another.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface-container` tokens to create "nested" depth:
*   **Surface (Base):** The foundation of the page.
*   **Surface-Container-Low:** For secondary content areas or large sidebar backgrounds.
*   **Surface-Container-Highest:** For interactive elements like cards or modals that need to "float" toward the user.

### The "Glass & Gradient" Rule
To evoke a premium, high-tech feel, use **Glassmorphism** for floating UI (e.g., sticky navigation, filter overlays). Use semi-transparent surface colors with a `backdrop-filter: blur(20px)`.
*   **Signature Textures:** Main CTAs and Hero backgrounds should utilize a subtle linear gradient from `primary` (#004253) to `primary_container` (#005b71) at a 135-degree angle. This provides a "soul" and depth that flat hex codes cannot achieve.

---

## 3. Typography

The typography strategy pairs **Manrope** (for technical authority and modern display) with **Inter** (for high-density data and functional trust).

*   **Display & Headline (Manrope):** These are your "Editorial" voices. Use `display-lg` for hero statements with tight letter-spacing (-0.02em). The geometric nature of Manrope conveys the "High-Tech/Reliable" vibe of the backend.
*   **Title & Body (Inter):** These are your "Functional" voices. Inter’s high x-height ensures that specialized data—like pH levels and temperature ranges—remains legible even at `body-sm` sizes.
*   **Scale as Hierarchy:** Use extreme contrast in scale. A `headline-lg` title paired immediately with a `label-md` metadata tag creates a sophisticated, modern tension.

---

## 4. Elevation & Depth

We eschew traditional structural lines for **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` card atop a `surface-container-low` section. This creates a natural "lift" without the visual clutter of shadows.
*   **Ambient Shadows:** If an element must float (e.g., a "Compare" drawer), use an ambient shadow: `0px 20px 40px rgba(25, 28, 30, 0.06)`. The shadow color must be a tinted version of `on-surface`, never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use the "Ghost Border"—the `outline-variant` token at **15% opacity**. High-contrast, 100% opaque borders are forbidden.

---

## 5. Components

### Specialized Fish Attribute Filters
*   **Visual Style:** Use `surface-container-high` for the filter tray.
*   **Precision Sliders:** pH and Temperature sliders should use the `secondary` color for the track and `primary` for the handle.
*   **Data Chips:** Use `secondary_container` with `on_secondary_container` text. These should have a `md` (0.375rem) roundedness to feel technical yet approachable.

### Elegant Product Cards
*   **Structure:** No borders. Use `surface-container-low` as the card background.
*   **Visuals:** Product images should have a very subtle `0.5rem` (lg) corner radius.
*   **Interaction:** On hover, the card should transition to `surface-container-highest` with a soft ambient shadow.

### Interactive Tracking Maps
*   **Styling:** The map should be customized to match the `surface_dim` and `primary` tones. 
*   **Markers:** Use `tertiary` (#5c3200) for delivery markers to provide a warm, organic contrast against the cool blue map, ensuring the user's eye is immediately drawn to the tracking status.

### Buttons & Inputs
*   **Primary Button:** Gradient fill (Primary to Primary-Container), `full` roundedness for a pill shape, and `title-sm` typography.
*   **Input Fields:** Use `surface-container-highest` for the input fill. The "Ghost Border" (15% opacity `outline-variant`) should only appear on focus, using the `primary` color.
*   **Checkboxes/Radios:** High-precision icons. When selected, use `primary` with a `secondary_fixed` glow effect (4px blur).

---

## 6. Do's and Don'ts

### Do:
*   **Use Whitespace as a Component:** Treat vertical space as a way to separate "Species" from "Attribute Data."
*   **Embrace the Asymmetry:** Offset product descriptions from their images to create a bespoke, high-end feel.
*   **Nesting over Bordering:** Always try to solve a grouping problem with a slightly different surface tone before reaching for a line.

### Don't:
*   **Don't use Divider Lines:** Never use `<hr>` or 1px borders between list items. Use 16px–24px of vertical padding instead.
*   **Don't use Standard Shadows:** Avoid the "fuzzy grey box" look. If a shadow is needed, make it large, diffused, and very faint.
*   **Don't Over-Saturate:** The `tertiary` color (Earth/Organic) should be used sparingly—only for critical callouts or biological warnings, keeping the overall vibe "High-Tech Blue."

---

## 7. Technical Signature
The UI should feel "fast." Use micro-interactions that mimic the efficiency of the PostgreSQL/Spring Boot architecture: snappier easing curves (e.g., `cubic-bezier(0.2, 0, 0, 1)`) for transitions, and skeletal loading states that use the `surface-container-highest` shimmer. Every interaction should feel intentional, engineered, and premium.```