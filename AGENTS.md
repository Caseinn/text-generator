# AGENTS.md

## Stack

- **Runtime/build:** Vite 8 (`vite`, `@vitejs/plugin-react`)
- **UI:** React 19 with `react-dom` 19, JSX runtime `react-jsx`; icons from `@phosphor-icons/react`
- **Language:** TypeScript 6 (`tsconfig.json` → `tsconfig.app.json` for `src`, `tsconfig.node.json` for tooling)
- **Lint:** ESLint 10 flat config (`eslint.config.js`) — `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-perfectionist` (`recommended-natural`)
- **Package manager:** bun (`bun.lock` is the lockfile of record)
- **Styling:** Tailwind CSS 4 through `@tailwindcss/vite`, with shadcn/ui primitives (radix base) in `src/components/ui`; theme colors and radii are CSS variables in `src/index.css`

## Project Structure

```
.
├── .githooks/pre-commit      # runs lint before every commit
├── .gitattributes            # LF for text, binary flags for assets
├── components.json           # shadcn config: radix base, nova preset, @/ aliases
├── public/                   # static files served as-is
│   ├── examples/             # exported cards used in the README
│   ├── favicon.svg           # card mark
│   ├── apple-touch-icon.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── og.png                # 1200×630 social card
│   ├── robots.txt
│   └── site.webmanifest
├── src/
│   ├── main.tsx              # entry point, mounts <App /> into #root
│   ├── App.tsx               # page: composes preview + controls, no business logic
│   ├── index.css             # Tailwind entry, shadcn tokens, cursors
│   ├── components/
│   │   ├── ui/               # shadcn primitives, generated — do not hand-edit
│   │   └── generator/        # feature components for the text card tool
│   ├── hooks/                # font loading, preview canvas sizing
│   ├── lib/                  # text layout, canvas renderer, export helpers
│   └── types/                # shared types, imported through the @/types barrel
├── bun.lock                # lockfile of record
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

The tree above is what exists today. As features land, grow it into:

- `src/components/` — truly shared components
- `src/components/<feature>/` — feature-specific components
- `src/hooks/` — reusable logic that would otherwise live inside a component
- `src/lib/` — framework-agnostic helpers and barrels
- `src/types/` — shared interfaces/types, imported through a `@/types` barrel

## Conventions

### Commit

- Use a conventional-commit prefix: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`, `build`, `perf`.
- Keep each commit focused on **one chunk/change**. Separate unrelated changes into different commits.
- Subject: short message, **3–6 words** (e.g. `fix: report preview failure`).
- Subject line only — no commit body.
- Do not combine multiple chunks into a single commit unless they are tightly related.

The `pre-commit` hook (`.githooks/pre-commit`, enabled via `core.hooksPath=.githooks`) runs `bun run lint` and blocks the commit when it fails. Never bypass it with `--no-verify`.

### File Naming

- Prefer **kebab-case** for file names (e.g. `metric-card.tsx`, `dashboard-layout.tsx`, not `MetricCard.tsx`).
- Exceptions are the Vite entry files referenced by `index.html` (`main.tsx`, `App.tsx`) and stylesheet names already wired into imports.

### Code

- Pages are thin: compose feature components + hooks, no business logic inline.
- Feature-specific components live in `components/<feature>/`; truly shared ones in `components/`.
- Interfaces/types live in `types/` (barrel `@/types`), not inline in pages or components. The `@/` alias is declared in `vite.config.ts` (`resolve.alias`), `tsconfig.app.json` (`compilerOptions.paths`) and root `tsconfig.json` (for the shadcn CLI); keep all three in sync.
- Import order is enforced by `perfectionist/sort-imports` — run `bun run lint --fix` instead of hand-sorting imports.
- UI primitives come from shadcn/ui in `components/ui`. Add them with `bunx --bun shadcn@latest add <component>` instead of hand-rolling, and style them with semantic utilities (`bg-background`, `text-muted-foreground`, `border-border`), never raw hex or arbitrary color values.
- Theme tokens live as CSS custom properties in `src/index.css` (`:root`, mapped in `@theme inline`). Add a new color there first, then use the generated utility.
- The rendered image is deliberately not themed: `src/lib/render-text-image.ts` keeps fixed ink/paper colors and never reads Tailwind, `next-themes` or the surrounding UI, so exports stay identical in any theme. The reference face is Arial Narrow at regular weight; Archivo Narrow is bundled as its fallback, and the other families come from `@fontsource`.
- Text is laid out in a 1000-unit-wide design frame (`DESIGN_WIDTH`; the height follows the export shape); preview and export share one `TextLayout`, so their output cannot drift apart.
- Reusable logic that lives inside a component (renderer factories, stateful helpers) belongs in `hooks/`.
- **Measured zero vs nothing to measure.** A metric may only print a number when the rows it counts over exist: 400 tasks with none overdue is a real `0`, a year with no tasks has no overdue count to report. Distinguish the two explicitly rather than letting `0` mean both. The distinction is per collection, never per year-category.
- Add **minimal JSDoc/TSDoc** (`/** ... */`) to exported components, hooks, helpers and types: one or two sentences saying _what_ it is and _why it has that shape_ (e.g. a discriminated union exists because a field is required under one condition). Keep it short and plain — no emoji, no decision-log/history chatter, no `@property`-per-field unless a field is non-obvious. If a rule is already enforced by the type (e.g. a `"Closed"` variant must carry `closedDate`), don't restate it in prose.
- **No inline comments** — no `//` lines or trailing `//` notes, and no `{/* ... */}` notes in JSX. If a declaration needs explaining, give it a JSDoc block (with `@param`/`@returns` only when a parameter or return is not evident from the prose or its type); otherwise leave the code unannotated.

### Cursors

The base layer in `src/index.css` sets cursors, so an interactive element never falls back to the user-agent arrow. Extend those rules when adding a new affordance.

| State                                    | Cursor           | Where                                                                 |
| ---------------------------------------- | ---------------- | --------------------------------------------------------------------- |
| Clickable                                | `pointer`        | base rule for `button`, `[role="button"]`, `a[href]`, `label[for]`     |
| Disabled / read-only                     | `not-allowed`    | `:disabled` selector — never pair it with `pointer-events: none`, which suppresses the cursor entirely |
| In flight (submitting, parsing, loading) | `progress`       | elements carrying `aria-busy="true"` or a `data-busy` attribute       |
| More info on hover                       | `help`           | titles and truncated cells                                            |
| Drag over a drop target                  | `copy`           | `[data-dragging="true"]`                                              |
| Menu/listbox options                     | `pointer`        | clickable options read as clickable; disabled ones keep their own state |

Never make something look clickable when it only has a hover effect.

## Commands

- `bun run dev` — Vite dev server with HMR
- `bun run build` — `tsc -b` type-check followed by the production build
- `bun run lint` — ESLint over the whole repo (add `--fix` to autofix)
- `bunx --bun shadcn@latest add <component>` — add a shadcn primitive to `src/components/ui`
- `bun run preview` — serve the built output

## Testing

There is no test runner yet. Until one is added, the gates are `bun run lint` and `bun run build` (`tsc -b` covers types). When a runner is introduced:

- Keep test files next to the source as `*.test.ts(x)`.
- Prefer testing pure helpers and data/metrics logic; UI correctness is guarded by types plus the production build.
- Add a `test` script to `package.json` and extend the pre-commit hook only if the suite stays fast (a few seconds).
