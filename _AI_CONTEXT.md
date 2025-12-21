# ProjectFresh Hub - AI Context

> [!IMPORTANT]
> **PROJECT RULES**:
>
> 1. **NO GIT PUSHES** without explicit user request. Do not automatically push changes to GitHub for ANY file.
> 2. **gemini.md** is for local context only and should not be committed/pushed.

## Project Overview

ProjectFresh Hub is a **games-only** collection of "vibe coding" experiments. It features custom 2D and 3D games built from scratch, including a 3D world builder, space combat, and modern takes on classic arcade games.

**No backend, no database, no authentication.** Everything runs client-side in the browser.

## Tech Stack

- **Framework**: SvelteKit (v2), Svelte (v5)
- **Language**: TypeScript
- **Styling**: TailwindCSS (v4), DaisyUI (v5)
- **3D Graphics**: Three.js
- **Deployment**: Netlify (`@sveltejs/adapter-netlify`)
- **Testing**: Vitest

## Project Structure

```
src/
├── routes/
│   ├── (experiments)/    # 🎮 All the games live here
│   │   ├── alien-attack/
│   │   ├── drawing-canvas/
│   │   ├── fps-game/
│   │   ├── light-cycles/
│   │   ├── loan-calculator/
│   │   ├── minesweeper/
│   │   ├── pong/
│   │   ├── space-invaders/
│   │   ├── starship-flyer/
│   │   ├── tower-defense/
│   │   ├── world-builder/
│   │   └── worm-game/
│   ├── (marketing)/      # Landing page, blog, pricing
│   └── api/              # Any API routes
├── lib/
│   ├── components/       # Shared components (StarshipGame.svelte, etc.)
│   └── stores/           # Svelte stores for state management
└── app.css               # Global styles with theme support
```

## Key Games & Components

### 3D Games (Three.js)

| Game               | Route             | Component                                 |
| ------------------ | ----------------- | ----------------------------------------- |
| **Starship Flyer** | `/starship-flyer` | `StarshipGame.svelte` (gameMode="space")  |
| **Alien Attack**   | `/alien-attack`   | `StarshipGame.svelte` (gameMode="ground") |
| **World Builder**  | `/world-builder`  | Full 3D scene editor                      |
| **FPS Game**       | `/fps-game`       | First-person shooter                      |

### 2D Games (Canvas/SVG)

| Game               | Route             | Description                     |
| ------------------ | ----------------- | ------------------------------- |
| **Space Invaders** | `/space-invaders` | Modern take with power-ups      |
| **Light Cycles**   | `/light-cycles`   | TRON-style light trail combat   |
| **Pong**           | `/pong`           | Enhanced with dynamic mechanics |
| **Tower Defense**  | `/tower-defense`  | Tower defense challenge         |
| **Minesweeper**    | `/minesweeper`    | Upgraded with power-ups/traps   |
| **Worm Game**      | `/worm-game`      | Psychedelic Snake variant       |

## Starship Flyer & Alien Attack - Shared Codebase

Both games use `src/lib/components/StarshipGame.svelte` with a `gameMode` prop:

| Feature     | Starship Flyer (`space`)    | Alien Attack (`ground`) |
| ----------- | --------------------------- | ----------------------- |
| Perspective | Third-person (ship visible) | First-person (FPS view) |
| Movement    | Free 3D flight              | Ground-based walking    |
| Special     | BOOST (speed burst)         | JETPACK (flight mode)   |

### Modifying the Shared Codebase

When editing `StarshipGame.svelte`:

1. **Test both modes** - Changes affect both games
2. **Use conditional logic** - Check `gameMode === 'ground'` or `gameMode === 'space'`

## Development Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # Run ESLint
npm run format    # Format with Prettier
npm run check     # TypeScript checking
npm test          # Run Vitest tests
```

## Styling Notes

- **Theme Support**: Light (`saasstarterpro`) and Dark (`saasstarterdark`) themes
- **Global Styles**: `src/app.css` contains all theme tokens
- **Component Classes**: Use DaisyUI components (`btn`, `card`, `modal`, etc.)
- **Game-Specific Styles**: Each game has inline styles or scoped CSS

## Data Storage

- **No database** - Everything is client-side
- **localStorage** - Used for saving custom maps in World Builder
- **No user accounts** - Games are self-contained

## Deployment

Deployed to Netlify with zero configuration needed. Just push to `main` and it auto-deploys.
