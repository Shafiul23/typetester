# Type Tester

#### Video Demo: https://youtu.be/rBoJuZAD7Mw

## Upcoming features

- [ ] **Configurable test duration** — allow users to choose test timings, such as 30 seconds.
- [ ] **Disable mobile autocapitalisation** — prevent automatic capital letters in the typing input.
- [x] **Cancel and retry controls** — press Tab then Enter in the typing field to cancel an active test. Retains duration and dictionary; typing starts the next test.
- [ ] **Move to a new domain** — update hosting/domain configuration and relevant links.
- [ ] **Open directly on the typing test** — make the typetest page the default landing page instead of Home.
- [ ] **Improve mobile performance** — profile with CPU throttling and on mobile devices to investigate the current lag. Review responsive styles and input responsiveness, and use the findings to guide architectural changes, memoisation, or a Web Worker where beneficial.

- [ ] **Dashboard visual theme and dropdowns** — apply the extracted dark/light palettes and accessible animated dropdown specified below.

## Dashboard themes and dropdown: implementation handoff

**Status: specification only; the theme/dropdown migration is not implemented by this documentation change.** Apply this section when implementing the visual refresh.

### Source of truth and extraction boundary

Extracted from [market-dashboard at `ca3d144f3e5a2e0c3328b65ddda33cd9f79f3ef4`](https://github.com/Shafiul23/market-dashboard/tree/ca3d144f3e5a2e0c3328b65ddda33cd9f79f3ef4), inspected on 29 October 2026:

- [`src/index.css`](https://github.com/Shafiul23/market-dashboard/blob/ca3d144f3e5a2e0c3328b65ddda33cd9f79f3ef4/src/index.css): both palettes, semantic tokens, dropdown visibility and animation.
- [`src/components/atoms/dropdown.tsx`](https://github.com/Shafiul23/market-dashboard/blob/ca3d144f3e5a2e0c3328b65ddda33cd9f79f3ef4/src/components/atoms/dropdown.tsx): controlled single-select combobox, keyboard handling, pointer dismissal, chevron and selected tick.
- [`src/components/atoms/GroupingControl.tsx`](https://github.com/Shafiul23/market-dashboard/blob/ca3d144f3e5a2e0c3328b65ddda33cd9f79f3ef4/src/components/atoms/GroupingControl.tsx): visible label and string-value adapter.
- [`src/components/organisms/NavBar.tsx`](https://github.com/Shafiul23/market-dashboard/blob/ca3d144f3e5a2e0c3328b65ddda33cd9f79f3ef4/src/components/organisms/NavBar.tsx): persisted dark/light switch.

Typetester was inspected at `23146cf59810af475b783e192923fdabb4ba9898` on this PR's `features` branch. Re-read current files before implementation so subsequent changes are retained. The dashboard uses Tailwind v4; Typetester uses React, TypeScript, CRA and CSS Modules. Port the tokens and component behavior into the existing stack. Do not add Tailwind, copy the dashboard build configuration, or couple either application to the other's runtime. The extraction below is sufficient to implement locally; pinned links allow comparison with the original.

### 1. Install the exact dark and light theme tokens

Add the following ordinary CSS to `client/src/index.css`, preserving existing font and reset rules. The dashboard's `@theme` declarations are converted to `:root` custom properties; its `@layer base` light overrides become an ordinary selector. Do not paste Tailwind directives into CRA.

```css
:root {
  color-scheme: dark;
  /* Page, panels, menus, and hover states */
  --color-background: #111111;
  --color-surface: #1a1a18;
  --color-surface-table: #1a1a1a;
  --color-surface-raised: #242420;
  --color-surface-hover: #2d2d27;

  /* Dividers versus visible control boundaries */
  --color-divider: #36362f;
  --color-control: #77776b;

  /* Text hierarchy: text-primary, text-secondary, text-muted */
  --color-primary: #f5f5ef;
  --color-secondary: #c2c2b5;
  --color-muted: #969689;

  /* Brand */
  --color-accent: #f7ce46;
  --color-accent-text: #f7ce46;
  --color-accent-hover: #ffdd67;
  --color-accent-pressed: #e5b932;
  --color-accent-subtle: #302a18;
  --color-on-accent: #111111;
  --color-focus-ring: #f7ce46;

  /* Market data and status */
  --color-heartbeat: #34d399;
  --color-positive: #34d399;
  --color-positive-subtle: #1b3d2e;
  --color-negative: #fb7185;
  --color-negative-subtle: #48262c;
  --color-warning: #f7ce46;
}

:root[data-theme="light"] {
    color-scheme: light;
    --color-background: #f7f5ed;
    --color-surface: #fffef9;
    --color-surface-table: #fffef9;
    --color-surface-raised: #eeeadc;
    --color-surface-hover: #e4decb;
    --color-divider: #d6d0bd;
    --color-control: #857c65;
    --color-primary: #22221d;
    --color-secondary: #514e41;
    --color-muted: #6c6757;
    --color-accent-text: #806000;
    --color-accent-subtle: #fff0bd;
    --color-focus-ring: #806000;
    --color-heartbeat: #16c76a;
    --color-positive: #08734f;
    --color-positive-subtle: #aed7ba;
    --color-negative: #b42342;
    --color-negative-subtle: #eba6b3;
    --color-warning: #806000;
}

html, body, #root {
  min-height: 100%;
}
body {
  background-color: var(--color-background);
  color: var(--color-primary);
}
```

The shared gold control colours (`accent`, `accent-hover`, `accent-pressed`, `on-accent`) deliberately remain unchanged in light mode. Use `accent-text` for gold-like text and `focus-ring` for focus outlines: they become darker in light mode. Do not use bright `accent` as body text on the cream background.

Use these semantic mappings throughout the app, rather than replacing every old blue with yellow:

| Typetester UI | Token |
| --- | --- |
| Page backgrounds, including TypeTest container | `background` |
| Navbar, footer, cards, dropdown menu | `surface` |
| Leaderboard/Profile table backgrounds | `surface-table` |
| Secondary panels or controls | `surface-raised` |
| Hovered or keyboard-active option | `surface-hover` |
| Card/table separators | `divider` |
| Input and dropdown boundaries | `control` |
| Headings, ordinary text, typed input | `primary` |
| Supporting copy | `secondary` |
| Hints, captions, chevron | `muted` |
| Primary button background / hover / active | `accent` / `accent-hover` / `accent-pressed` |
| Text on gold buttons | `on-accent` |
| Links, selected dropdown option, WPM emphasis | `accent-text` |
| Current word highlight | `accent-subtle` with `primary` text |
| Correct words / success | `positive` and optionally `positive-subtle` |
| Wrong words / validation errors | `negative` and optionally `negative-subtle` |
| Warning copy / focus outline | `warning` / `focus-ring` |

Each name above means `var(--color-NAME)`. Preserve labels, error messages and correct/wrong totals so state is not conveyed solely through colour. Do not substitute `heartbeat` for success text; it is a separate market-status token included for extraction completeness.

Audit `client/src/**/*.module.css`, `App.module.css`, inline styles and SVG attributes. Cover Home, TypeTest, Profile, Leaderboard, Login, Register, About, Contact, Navbar, Footer and Loading; otherwise fixed white/grey page backgrounds will obscure the root theme. In particular, replace TypeTest's hard-coded `#f4f4f4`, `#fff`, `#333`, blue buttons, green/red words and grey selected-word background according to the table. Change Navbar's fixed white hamburger colour to follow the theme. Preserve layout and responsive breakpoints.

**CSS isolation:** `TypeTest.module.css` contains bare `button`, `button:hover`, `button:active`, `button:disabled` and `button:focus` selectors (including a media-query rule). CSS Modules do not scope bare element selectors. Replace these with local action-button classes and apply them to the test buttons, so their padding, translate-on-hover and outline removal cannot affect the new dropdown or theme switch. Review other modules for similar leakage. Keep visible `:focus-visible` outlines on all interactive controls; do not retain `outline: none` without an equivalent visible focus treatment.

### 2. Persist and expose the theme

Create an app-level `ThemeProvider` (for example `client/src/context/ThemeContext.tsx`) and place it around the application in `client/src/index.tsx`. Have one owner of theme state, independent of the typing reducer and authentication state.

- State type: `"dark" | "light"`. Read `localStorage.getItem("typetester-theme")` once using a lazy initializer. Match the dashboard: only the exact saved value `"light"` selects light; missing/invalid values and storage exceptions default to dark.
- On change set `document.documentElement.dataset.theme` and persist the value. Wrap both storage reads and writes in `try/catch`; switching must still work when storage is blocked. Do not reuse `market-dashboard-theme`.
- Initialise the document theme before visible content paints. If adding a small pre-React initializer in `client/public/index.html`, use the same validation/default and storage guard as the provider; avoid a first-render dark flash for a saved light preference.
- Add the switch in `client/src/components/Navbar/Navbar.tsx` without changing login/logout, routes or mobile navigation. Use `<button type="button" role="switch" aria-label="Dark mode" aria-checked={theme === "dark"}>`. A stable accessible label plus checked state describes the setting; the optional title may say which theme the next press activates.
- Match the dashboard switch: pill wrapper, 1px `control` border, `surface-raised` background, `surface-hover` hover, 4px padding and 4px gap. Use two 36px circular icon cells; an absolutely positioned 36px gold thumb starts 4px from top/left and translates 40px right for dark. Active icon is `on-accent`; inactive icon is `muted`; SVGs are `aria-hidden`. Thumb transform transition: 160ms, disabled under reduced motion.
- Provide a 2px `focus-ring` outline with 2px offset. Native button Enter/Space activation must work. Keep the switch reachable on small screens and after navigation.

### 3. Extract the controlled Dropdown component

Create `client/src/components/Dropdown/Dropdown.tsx` and `Dropdown.module.css`. The source component has no third-party runtime dependency. Start with the following exact dashboard behavior/markup, then replace every Tailwind `className` with the CSS Module mapping in the next section and apply the hardening requirements below. This is source reference, not a directly usable CRA-styled component.

```tsx
import { useEffect, useId, useRef, useState } from "react"
import type { KeyboardEvent } from "react"

type DropdownProps = {
  id: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

export function Dropdown({ id, value, options, onChange }: DropdownProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const selectedIndex = options.findIndex((option) => option.value === value)

  useEffect(() => {
    if (!open) return

    function dismiss(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", dismiss)
    return () => document.removeEventListener("pointerdown", dismiss)
  }, [open])

  function expand(index = selectedIndex >= 0 ? selectedIndex : 0) {
    setActiveIndex(index)
    setOpen(true)
  }

  function select(index: number) {
    const option = options[index]
    if (option) onChange(option.value)
    setOpen(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault()
        const direction = event.key === "ArrowDown" ? 1 : -1
        if (!open) expand()
        else
          setActiveIndex(
            (index) => (index + direction + options.length) % options.length,
          )
        break
      }
      case "Home":
        event.preventDefault()
        expand(0)
        break
      case "End":
        event.preventDefault()
        expand(options.length - 1)
        break
      case "Enter":
      case " ":
        event.preventDefault()
        if (open) select(activeIndex)
        else expand()
        break
      case "Escape":
        if (open) event.preventDefault()
        setOpen(false)
        break
      case "Tab":
        setOpen(false)
        break
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative text-sm"
      onBlur={() => setOpen(false)}
    >
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : expand())}
        onKeyDown={handleKeyDown}
        className="flex min-w-36 items-center justify-between gap-3 rounded border border-control bg-background px-3 py-1.5 text-primary hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        <span>{options[selectedIndex]?.label}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          className={`size-3.5 text-muted ${open ? "rotate-180" : ""}`}
        >
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <ul
        id={listId}
        role="listbox"
        aria-labelledby={id}
        data-open={open}
        inert={!open}
        onMouseDown={(event) => event.preventDefault()}
        className="dropdown-list absolute right-0 top-full z-20 mt-2 min-w-full rounded border border-divider bg-surface p-1 shadow-lg"
      >
        {options.map((option, index) => (
          <li
            key={option.value}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={option.value === value}
            onMouseMove={() => setActiveIndex(index)}
            onClick={() => select(index)}
            className={`flex cursor-pointer items-center justify-between gap-3 whitespace-nowrap rounded px-2 py-1.5 transition-[background-color] duration-[160ms] ease-linear motion-reduce:transition-none ${index === activeIndex ? "bg-surface-hover" : ""} ${option.value === value ? "text-accent-text" : "text-primary"}`}
          >
            {option.label}
            {option.value === value && (
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                className="size-3.5 shrink-0"
              >
                <path
                  d="m3 8 3 3 7-7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

**Required Typetester additions:** the dashboard component does not currently provide a disabled prop, empty-option guards, typeahead, or scrolling for long menus. Add these explicitly during the port; they are requirements for the receiving component, not claims about the existing dashboard.

- Extend props with `disabled?: boolean` (default false). Set native `disabled` on the trigger, close when disabled becomes true, and guard opening/selection. Style disabled with a non-interactive cursor and distinct appearance; it must not animate on hover.
- Handle an empty options array without modulo-by-zero or invalid active IDs. Disable the trigger when empty and render no selectable options. If a controlled value is absent from a nonempty list, show a defined placeholder (e.g. "Choose an option"), start navigation at the first option, and never silently emit a replacement value.
- Keep active index valid if options/value change while open. Reset active option to the selected value when reopening. Use stable unique option values; multiple dropdowns must have unique trigger, listbox and option IDs.
- Keep focus on the combobox trigger and expose the active option through `aria-activedescendant`. Do not move DOM focus into each `li` or turn the component into a `menu/menuitem`; this is a single-select listbox.
- Supply an explicit accessible name using a visible label with `htmlFor={id}` (or labelled-by). The listbox must also have an accessible name. Preserve `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls`, and `aria-selected`; only reference an existing active option while open.
- Preserve click/touch opening, option selection, outside `pointerdown` dismissal with effect cleanup, and blur dismissal. Prevent mouse-down on the options from stealing trigger focus. Selecting an option emits its string value once and closes the list.
- ArrowDown/ArrowUp: prevent page scroll; when closed open at the selected option (or first), and when open advance/wrap the active option. Home/End activate first/last. Enter/Space open or select the active option. Escape closes without committing. Tab closes and follows normal browser focus navigation; never trap or prevent Tab in the dropdown.
- Add printable-character typeahead with a short reset window (e.g. 500ms); search labels case-insensitively, support repeated-character cycling, and ignore modified/composition events. Typeahead moves the active option without committing selection. Clear its timer on unmount.
- For scrollable menus, scroll the active option into view with nearest alignment when keyboard navigation changes it. Keep hover-active and selected-value styles separate: moving through options must not change the controlled value until committed.
- Hide the closed list from both interaction and assistive technology immediately, including during the visual exit. Preserve `inert={!open}`; verify its behavior with the installed React/DOM typings and supported browsers. If adding `aria-hidden={!open}`, remove it on opening. Unsupported discrete CSS transitions must degrade to immediate show/hide without breaking selection.

### 4. Port the dropdown's exact appearance and motion

Map the source classes onto local names: root -> `styles.root`, trigger -> `styles.trigger`, chevron -> `styles.chevron`, list -> `styles.list`, each option -> `styles.option`, active option -> `styles.active`, selected option -> `styles.selected`, check SVG -> `styles.check`. Preserve `data-open={open}` on the list and add it to the trigger for the chevron selector below. Both SVGs keep `aria-hidden="true"` and their original paths.

Use this CSS Module starting point. It reproduces the dashboard geometry assuming the normal 16px root font. The viewport cap/scrolling and disabled rules are receiving-app additions.

```css
.root { position: relative; font-size: 0.875rem; line-height: 1.25rem; }
.trigger {
  display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
  min-width: 9rem; max-width: 100%; padding: 0.375rem 0.75rem;
  border: 1px solid var(--color-control); border-radius: 0.25rem;
  background: var(--color-background); color: var(--color-primary);
  font: inherit; cursor: pointer; box-sizing: border-box;
}
.trigger:hover:not(:disabled) { background: var(--color-surface-hover); }
.trigger:focus-visible {
  outline: 2px solid var(--color-focus-ring); outline-offset: 2px;
}
.trigger:disabled { cursor: not-allowed; opacity: 0.6; }
.chevron { width: 0.875rem; height: 0.875rem; color: var(--color-muted); flex-shrink: 0; }
.trigger[data-open="true"] .chevron { transform: rotate(180deg); }
.list {
  position: absolute; right: 0; top: 100%; z-index: 20; margin: 0.5rem 0 0;
  min-width: 100%; max-width: calc(100vw - 2rem); max-height: 16rem; overflow-y: auto;
  padding: 0.25rem; list-style: none; box-sizing: border-box;
  border: 1px solid var(--color-divider); border-radius: 0.25rem;
  background: var(--color-surface);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  display: none; opacity: 0; transform: translateY(-4px);
  transition: opacity 160ms ease-out, transform 160ms ease-out,
    display 160ms allow-discrete;
}
.list[data-open="true"] { display: block; opacity: 1; transform: translateY(0); }
@starting-style {
  .list[data-open="true"] { opacity: 0; transform: translateY(-4px); }
}
.option {
  display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
  padding: 0.375rem 0.5rem; border-radius: 0.25rem; white-space: nowrap;
  color: var(--color-primary); cursor: pointer;
  transition: background-color 160ms linear;
}
.active { background: var(--color-surface-hover); }
.selected { color: var(--color-accent-text); }
.check { width: 0.875rem; height: 0.875rem; flex-shrink: 0; }
@media (prefers-reduced-motion: reduce) {
  .list, .option, .chevron { transition: none; }
}
```

The original chevron rotates instantly; the popup fades/slides over 160ms and option backgrounds transition over 160ms linear. A chevron transform transition is optional polish, not existing source behavior; if added, use 160ms and respect reduced motion. Keep the list mounted during CSS exit transitions rather than conditionally unmounting it. Do not add an animation library for this.

Verify at narrow widths and 200% zoom: no horizontal page scrolling, clipped focus rings, truncated labels or menu hidden behind cards. Right alignment is the dashboard default; flip alignment/placement if the viewport requires it. If ancestor overflow clips a popup, fix the layout or implement a properly positioned portal; a larger z-index alone cannot escape clipping. If portalling, update outside-pointer detection so option clicks are still treated as inside.

### 5. Integrate with Typetester without changing test behavior

At the inspected PR head the only native `<select>` is the test-duration control in `client/src/pages/TypeTest/TypeTest.tsx`. Dictionary selection is a toggle button; Profile sorting uses buttons, and Navbar's hamburger is navigation. Replace all actual select dropdowns found at implementation time with the shared component. Do not assign listbox semantics to navigation links or action buttons.

Replace the duration select and its enclosing label with a wrapper, an explicit label and the following adapter (add imports for `Dropdown` and `useId`; declare `durationId` inside TypeTest):

```tsx
const durationId = useId();

// Inside the timer controls:
<div className={styles.durationControl}>
  <label htmlFor={durationId}>Test duration</label>
  <Dropdown
    id={durationId}
    value={String(state.duration)}
    options={testDurations.map((duration) => ({
      value: String(duration),
      label: `${duration} seconds`,
    }))}
    disabled={state.hasStarted}
    onChange={(value) =>
      dispatch({ type: "SET_DURATION", payload: Number(value) })
    }
  />
</div>
```

Preserve the current 30/60 second options, 30 second default, numeric reducer payload, validation in `SET_DURATION`, and `disabled={hasStarted}` behavior (including the completed state until reset). The component's internal values remain strings; conversion belongs at this boundary. Remove the obsolete `.durationControl select` CSS.

Changing theme or opening/navigating a dropdown must not start, reset or cancel the typing test, submit a score, or steal focus back to the typing input. The existing Tab-then-Enter cancel shortcut belongs only to the typing input; do not hoist it onto the document or dropdown. Preserve reset's duration/dictionary retention and intentional focus return to the typing input. Keep mobile `autoCapitalize="none"`, autocomplete/spellcheck settings, auth, score submission and existing routes.

If converting dictionary or Profile sort buttons to dropdowns as a separate UI choice, reuse this component with an explicit label and preserve their existing state/API behavior. That conversion is not required merely to replace the existing duration select.

### 6. Implementation order and acceptance checks

1. Add global tokens and theme ownership/switch; migrate hard-coded colours and scope leaking button rules.
2. Port Dropdown into CSS Modules, then add disabled handling, valid-index guards, typeahead and overflow behavior.
3. Replace duration select with the adapter above, update its tests, and review any additional selects introduced after the inspected commit.
4. Verify both palettes, keyboard/touch behavior and existing test flows. Mark this feature complete only after implementation and verification, not when this specification is committed.

Use the existing Jest/React Testing Library setup. Add focused Dropdown tests and update TypeTest tests that previously used native-select change events: query the labelled combobox, open it, then choose a role=option. Cover:

- Selected label/checkmark; exactly one change callback per selection; unique IDs for two controls.
- Arrow wrapping, Home/End, Enter/Space commit, Escape cancellation, Tab close without trapping, pointer hover, outside dismissal, blur and typeahead.
- Disabled/empty controls, invalid controlled values and options changing while open; no invalid `aria-activedescendant`.
- Duration changes before a test, inability to change while started, retained settings after cancel/retry, and no typing shortcut interference.
- Dark default, saved light preference, invalid saved preference and storage read/write failures; theme changes update the root and switch state without resetting the test.

Run from the repository root:

```sh
cd client
npm ci
CI=true npm test -- --watchAll=false
npm run build
```

These commands are implementation-time checks; this documentation-only extraction does not establish that the future UI passes them. Use a real browser for computed theme colours, focus visibility, menu clipping, entry/exit animations and reduced motion because jsdom does not validate visual layout or CSS animation. Check keyboard-only operation, touch on iOS Safari, desktop Chrome/Firefox/Safari, and a screen reader (e.g. VoiceOver). In light mode specifically confirm selected text uses `#806000` and text on gold controls uses `#111111`; in dark mode confirm the page is `#111111` and selected text is `#f7ce46`. Check readable contrast for actual text/background pairings in both modes rather than assuming every token pairing is accessible.

## Setup

Check readme in /server and /client for instructions on how to install the run the app

# Description:

## Summary

Typetester is a full-stack web application to test typing speed. Users have the option between a randomised list of the 300 most common words in English, or a short story if they prefer to follow a narrative to help them type even faster. The app returns a score in words per minute (wpm), which is 40 wpm on average. Try it out and see how fast you can type!

Users have the option to save their scores to a database, which can be viewed in the profile page - or maybe even the leaderboard page if they manage to make it to the top 20!

### Technologies used

- React (TypeScript), CSS Modules for styling and Jest for unit tests
- Backend: Flask (Python)
- Database: PostgreSQL (e.g. via Neon) for storing user data and scores

## Database

The database layer uses PostgreSQL accessed through SQLAlchemy. The connection URL is supplied via the `DATABASE_URL` environment variable.

It contains a user table that stores an auto incrementing id, a unique username, and a hashed password. The scores table also has an auto incrementing id, associated user id, score, and a created timestamp.

## Backend

The backend of Typetester handles user authentication, score tracking, and leaderboard management. Using Flask, it offers a set of routes for interacting with the application.

- /login: takes a username and password from the front end, checks it against the database and returns a JWT on success
- /register: takes a username and password from the front end and checks to see if they meet the minimum requirement. Adds the user to the user table with a hashed password.
- /status: takes in a JWT token to return a logged in status, user id and username to help with some protected routes.
- /score: handles a post request from the front end containing a wpm score and a JWT token. If no other score has been submitted in the last minute, it is added to the score table.
- /leaderboard: Makes an SQL query for the top 20 scores in the score table and merges it with the corresponding usernames from the user table. This is returned as a list for the front end.
- /personal: This route also returns a list of scores but is dependent on what is sent from the front end. If 'score' then the user making the request will receive a list of their personal top 20 scores. If 'created' then they will receive a list of their last 20 scores

Originally, reloading the app would reset the login state, requiring users to log in again. JWTs resolve this issue by enabling stateless authentication, where the auth data is stored within the token itself, not the server. The token also includes an expiry time (1 hour), allowing users to interact with the app freely within that period without needing to log in again.

## Frontend

- Navbar: Renders register, login and leaderboard options if no user is logged in. It displays the leaderboard, type test, profile and logout links if a user is logged in. It navigates through the application using react-router-dom and logs out by clearing the JWT from session storage. Also contains a responsive hamburger menu for improved usability on smaller screens.

- PrivateRoute: Any route wrapped in this element on the App.tsx file will require a valid user ID. First, the component checks the /status route to see if a users credentials are valid. While this is happened, a "Loading..." message will be displayed. On success, a useState boolean 'loading' is set to false. On failure, the user is directed to the login page and if logged in the user can access the protected route.

- AuthContext: This file was created because multiple pages were making fetch requests and required the login status. I wanted to clean the code and centralise the authentication logic which led to useContext from React. This is where the calls to /register, /login and /status are made and also where the JWT token is set to token storage. On success, the register and login functions return an object with a success boolean and a message. It also sets userId and username accordingly, which the status function updates accordingly. The logout function clears the token from storage.

- Home: Welcome page displays a link to register or login if no user is authenticated and a link to start a type test if there is a logged in user.

- Register / Login: These pages are forms that take a user input for username and password, validates them, then sends it to the backend via the relevant route. If a user makes an error then a message will be displayed above the submit button detailing the error. The page will render the error message from either the form validation on the front end or the error message from the backend depending on the users input.

- Leaderboard: This page will make a get request to the backend to receive a leaderboard list. It will then map through this object and display the information in a table. A relevant message will appear if there is no data after a successful request or if the data is loading. This page works regardless of logged in state so anyone can view it.

- Profile: The profile page is slightly different to the leaderboard page in that it loads data that is personal to a logged in user. It sits in a protected route, and will send one of two variables to the backend along with the JWT token in a get request to receive either the last 20 scores they submitted or their top 20 scores. The 'Sort By' button will change based on what is being displayed in the table and will send a get request to the backend onClick.

- TypeTest: Last and far from least is the main course of the application. In this file, an array of the 300 most common words is loaded from the dictionary file by default. The user can change this with the "use short story" button which toggles the dictionary state to use the short story.

  - Once the dictionary is loaded, the user can begin to type what they see on screen. This will trigger the handleInputChange to start the test and begin the timer.
  - The timer is defined in a custom hook useTimer which starts with 60 (defined in the timer state) and decrements by 1 every second. When the timer is less than or equal to 0, the time taken is recorded and the test is ended.
  - Every time a key is pressed, the user input is updated to reflect what the user typed. handleKeyPress checks to see if the key is a space or enter. It will check to see if the word that the user typed matches the one in the dictionary. It does this using currentWordIndex, which tracks the number of words the user has typed so far and compares it against the corresponding position in the dictionary array. Next, it updates a separate array that keeps track of which words the user typed correctly and which were wrong. This array is used to dynamically style the words that the user has already typed, between green and red. Finally, all of these are updated to the state and the correctWordsIndex is incremented, as well as the user input being set back to being blank.
  - While the user progresses through the dictionary, current index gets updated. This index is used to point towards the list of words that are being displayed on the screen, which are all wrapped with a span tag. the scrollIntoView function then makes sure that the word in focus, decided by currentWordIndex, is scrolled into view for the user. This way, as the user progresses through the dictionary, the box scrolls for them. I implemented this feature because displaying the entire list in one go meant that a user's eyes would have to jump quite a bit. However, shrinking the box meant that once the user got past the first few lines, the words weren't visible.
  - When the user finishes the test, safeElapsedTime is calculated to ensure no divide by 0 errors occur, and the wpm score is calculated by dividing the number of correct words by the elapsed time, then multiplying by 60. It it done like this so the timer could potentially be changed from 60 s to any time but will still return a words per minute score.
  - A report card will render when the test is finished. This will congratulate the user and display the words per minute, number of correct words and number of wrong words. It'll also provide two buttons for the user to press. The Try Again button triggers the resetTest function, which resets the state object back to the initial state, and clears all the arrays. The save button calls the handleSubmitScore function.
  - This uses the custom hook useSubmitScore to make a post request to the backend with the user's JWT token and their score in wpm. If all goes well then it returns true and if not, returns the error message. If the handleSubmitScore function receives true then then the submit button is disabled to prevent users from spamming post requests to the backend. This is also protected on the backend in case users decided to remove the disabled javascript on the button.
  - The final thing I'd like to mention regarding this file is how it progressed over time. It started off relatively simple with a few functions and states. As the app grew to be more complex, I found that I was using over 10 useStates and multiple functions outside of the return. I began to move some of the logic out into custom hooks and looked into utilising the useReducer to manage and update all my states in one large object. This helped clean the code significantly.

- Responsiveness: To make the application look nice on mobile devices, I designed each page mobile-first. This meant lower padding, appropriate font and for the containers to fill up more of the screen. I then implemented media queries that would adjust the styling when the width of the screen is greater than a certain length. For the most part, I used the rough sizing of an iPad to differentiate between smaller screens and larger screens. Some of the changes include a reshuffling of components using flex (from row to column, like the buttons on the home screen). Another example is how the main card on TypeTest.tsx takes 100% width on smaller screens, but only 80% of larger screens - with a hard limit of 100 rem.

- Testing: Each page and component has its own unit test to ensure the application functions as expected. I implemented these using Jest and React Testing Library. The simple tests include simulating user actions and checking if the desired outcome was achieved. The more challenging tests included mocking the auth hooks to ensure a page loaded in the desired fashion. I also mocked hooks like useNavigate to check if the application was routing when it was meant to. I even mocked async calls to the backend and returned an object resembling what would actually be returned to test out the Profile page.
