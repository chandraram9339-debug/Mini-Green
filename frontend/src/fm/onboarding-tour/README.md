# Onboarding tour (foundation)

Minimal, safe scaffold for a future guided tour across **Home**, **Wallet**, and **Trading** screens.  
**Not wired into the app shell** — import and render where/when you explicitly enable it.

## Files

| File | Purpose |
|------|---------|
| `types.ts` | TypeScript types for steps and placements |
| `onboardingSteps.ts` | Default ordered steps (`priority`), routes from `fm/figma/routes` |
| `onboardingStorage.ts` | `localStorage` completion flag (SSR-safe) |
| `OnboardingTour.tsx` | Overlay + spotlight + tooltip UI |
| `OnboardingTour.module.css` | Styles (dark scrim via spotlight, green accent, safe-area, reduced motion) |

## Adding `data-tour-id` on screens

Anchor nodes must expose:

```html
<div data-tour-id="home-balance">...</div>
```

Use the **`targetId`** values from `onboardingSteps.ts` (e.g. `home-balance`, `wallet-top-up`, `trading-chart`).  
Prefer stable wrappers that do not break layout (wrapper `div`/`span` with no visual change).

### Where to attach IDs (later integration)

| Screen | Route | Suggested anchors |
|--------|--------|-------------------|
| Home | `/home` | `home-balance`, `home-chart`, `home-bot-status`, `home-tab-bar` |
| Wallet | `/balance/deposit` | `wallet-total-balance`, `wallet-top-up`, `wallet-withdraw`, `wallet-details-history` |
| Trading | `/bot` | `trading-chart`, `trading-open-trade`, `trading-history-cards`, `trading-tab-bar` |

These IDs match `onboardingSteps.ts`. Adjust markup only — **no routing/API changes**.

## Integrated host (`App.tsx`)

- **`OnboardingTourRoot`** is mounted in `fm/App.tsx` inside `BrowserRouter` / `app-shell`, after `SessionBanner`, with `splashDone={!showSplash}` so the tour starts after the splash screen (z-order).
- Controlled step index + **`routeKey={location.pathname}`** trigger remeasure after route changes.
- **Force testing:** `localStorage.setItem('forceOnboarding','1')` then reload — tour opens even if completed; cleared on **Skip** / **Готово**.

## Enabling the tour later (manual mount)

1. Import the component and steps:

```tsx
import { OnboardingTour } from "../onboarding-tour/OnboardingTour";
import { getSortedOnboardingSteps, onboardingSteps } from "../onboarding-tour/onboardingSteps";
import { isOnboardingCompleted, markOnboardingCompleted } from "../onboarding-tour/onboardingStorage";
```

2. Hold local state, e.g. `const [open, setOpen] = useState(false)`.

3. Render **once** near the root (e.g. inside `App` or a layout), **not** duplicated per screen:

```tsx
<OnboardingTour
  steps={getSortedOnboardingSteps(onboardingSteps)}
  isOpen={open}
  onClose={() => setOpen(false)}
  onFinish={() => {
    markOnboardingCompleted();
    setOpen(false);
  }}
/>
```

4. Open when appropriate:

```tsx
if (!isOnboardingCompleted()) setOpen(true);
```

5. **Cross-route tours:** before advancing to a step on another screen, navigate (`useNavigate`) to `step.route`, wait for paint (e.g. `requestAnimationFrame` / short timeout), then bump the step index — wire this in the host when you integrate (not done in this scaffold).

## Storage

- Key: `fm.onboarding.tour.v1.completed`
- Value: `"1"` when completed.
- Helpers: `isOnboardingCompleted()`, `markOnboardingCompleted()`, `resetOnboarding()`.
- All access is wrapped in `try/catch`; if `localStorage` is missing or throws, reads return safe defaults and writes are no-ops.

## Adding / editing steps

1. Edit **`types.ts`** only if you need new fields on `OnboardingTourStep`.
2. Append or reorder rows in **`onboardingSteps.ts`**:
   - **`priority`**: ascending order for a linear tour.
   - **`route`**: pathname for documentation / future navigation between screens.
   - **`placement`**: `top` | `bottom` | `left` | `right` | `center` — tooltip preference relative to the target rect.
3. Add matching **`data-tour-id`** on the UI.

## Behaviour notes

- **Missing target:** tour still shows the tooltip (centered); a short hint explains the missing anchor.
- **Spotlight:** uses a padded rectangle + outer shadow to dim the rest of the viewport (no separate full backdrop that would block the “hole”).
- **Skip:** calls `onClose` only — completion should be handled by the host if desired.
- **Done:** last step primary button calls `onFinish` — typically `markOnboardingCompleted()` there.
- **Escape:** closes via `onClose`.

## Accessibility

- Dialog uses `role="dialog"`, `aria-modal`, `aria-labelledby` tied to the step title (`useId`).
- Respect **`prefers-reduced-motion`** for transitions (see CSS).
