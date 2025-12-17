# ProjectFresh Hub Context

> [!IMPORTANT]
> **PROJECT RULES**:
>
> 1. **NO GIT PUSHES** without explicit user request. Do not automatically push changes to GitHub for ANY file.
> 2. **gemini.md** is for local context only and should not be committed/pushed.

## Project Overview

ProjectFresh Hub is a collection of "vibe coding" experiments, featuring custom 2D and 3D games built from scratch. It includes a 3D world builder, first-person experiences, and modern takes on classic arcade mechanics. The project demonstrates creative coding across various gameplay styles.

## Tech Stack

- **Framework**: SvelteKit (v2), Svelte (v5)
- **Language**: TypeScript
- **Styling**: TailwindCSS (v4), DaisyUI (v5)
- **Backend/Database**: Supabase (Auth, Database, SSR)
- **Deployment**: Netlify (`@sveltejs/adapter-netlify`)
- **Testing**: Vitest
- **3D Graphics**: Three.js
- **Payments**: Stripe
- **Email**: Resend, Handlebars
- **Search**: Fuse.js

## Project Structure

The project follows a standard SvelteKit structure:

- **`src/routes`**: Application routes, organized into groups:
  - **`(admin)`**: Admin dashboard and management tools.
  - **`(experiments)`**: The core games and experiments.
  - **`(marketing)`**: Public-facing pages (landing, blog, contact, pricing).
- **`src/lib`**: Shared code and utilities:
  - **`components`**: Shared UI components (e.g., `ExperimentsSidebar`, `MobileSplash`).
  - **`emails`**: Email templates.
  - **`stores`**: Svelte stores for state management.
  - **`mailer.ts`**: Email sending logic using Resend.
- **`src/DatabaseDefinitions.ts`**: TypeScript definitions for the Supabase database schema.
- **`src/hooks.server.ts`**: Server-side hooks for authentication and other global logic.

## Database Schema (Supabase)

The project uses the following tables:

- **`contact_requests`**: Stores contact form submissions (name, email, message, etc.).
- **`profiles`**: User profiles linked to Supabase Auth users (avatar, full name, company, website).
- **`stripe_customers`**: Maps Supabase user IDs to Stripe customer IDs.

## Key Experiments & Games

Located in `src/routes/(experiments)`:

- **`world-builder`**: 3D world building tool.
- **`fps-game`**: First-person shooter.
- **`space-invaders`**: Modern take on Space Invaders.
- **`light-cycles`**: TRON-style light trail combat.
- **`pong`**: Power-packed Pong remake.
- **`tower-defense`**: Tower defense game.
- **`minesweeper`**: Upgraded Minesweeper.
- **`worm-game`**: Psychedelic Snake game.
- **`starship-flyer`**: Space dogfighting with physics.
- **`alien-attack`**: Ground-based FPS shooter against aliens.
- **`drawing-canvas`**: Creative drawing tool.
- **`loan-calculator`**: Utility tool.

---

## Alien Attack & Starship Flyer - Shared Codebase

Both **Alien Attack** (`/alien-attack`) and **Starship Flyer** (`/starship-flyer`) games use the **same core component**: `src/lib/components/StarshipGame.svelte`. This is a 4000+ line Svelte component that powers both experiences through a `gameMode` prop.

### Architecture

```
src/routes/(experiments)/
├── alien-attack/
│   └── +page.svelte        → <StarshipGame gameMode="ground" />
└── starship-flyer/
    └── +page.svelte        → <StarshipGame gameMode="space" />

src/lib/components/
└── StarshipGame.svelte     → Shared 4000+ line game engine
```

### Game Mode Differences

| Feature             | Starship Flyer (`space`)            | Alien Attack (`ground`)             |
| ------------------- | ----------------------------------- | ----------------------------------- |
| **Perspective**     | Third-person (ship visible)         | First-person (FPS view)             |
| **Movement**        | Free 3D flight                      | Ground-based walking/running        |
| **Special Ability** | BOOST (2s speed burst)              | JETPACK (15s flight mode)           |
| **Default Map**     | `Default_Space.json`                | `default_map.json`                  |
| **Auto-Move**       | Default: medium                     | Default: off                        |
| **Map Filter**      | Maps with `games: 'starship flyer'` | Maps with `games: 'blocky shooter'` |
| **Player Height**   | Ship follows at height 5            | Camera at height 1.7 (eye level)    |
| **Boundary Limit**  | 4000 units                          | 500 units                           |

### Shared Features (Both Modes)

- **Weapon System**: Both share the same weapons (Laser, Plasma, Chain, Drone)
- **Power-Ups**: Shield, Rapid Fire, Spread Shot, Triple Damage, Boost/Jetpack
- **Enemy Types**: Basic, Fast, Tank, Boss enemies with identical AI
- **Sound Manager**: Custom Web Audio API sounds for all actions
- **Map Integration**: Both support World Builder maps from `localStorage`
- **Difficulty Presets**: Easy, Normal, Hard with configurable settings
- **Weather/Environment**: Time of day, rain, snow, fog effects

### Key Implementation Details

The `gameMode` prop (`'space' | 'ground'`) conditionally controls:

1. **Player visibility**: Ship hidden in ground mode (FPS)
2. **Movement physics**: Ground mode has gravity, space mode has free flight
3. **Camera positioning**: Different base heights and offset calculations
4. **Ground plane**: Only shown in ground mode (uses `planeVisible` from map data)
5. **UI labels**: "BOOST" vs "JETPACK", different icons and instructions
6. **Auto-move defaults**: Off for ground (manual control), medium for space

### Game Controls (Both Modes)

| Control                  | Action                                       |
| ------------------------ | -------------------------------------------- |
| **WASD**                 | Move forward/back/strafe left/right          |
| **Mouse**                | Look around (requires pointer lock)          |
| **Shift**                | Fire current weapon                          |
| **Left Click**           | Continuous fire (hold)                       |
| **Scroll Wheel Up/Down** | Cycle weapons (same as Arrow keys)           |
| **Right Click**          | Next weapon (for users without scroll wheel) |
| **Arrow Up/Down**        | Cycle through weapons                        |
| **1-5 Keys**             | Direct weapon selection                      |
| **Spacebar**             | Activate Boost/Jetpack                       |
| **Escape**               | Return to menu                               |

### Modifying the Shared Codebase

When making changes to `StarshipGame.svelte`:

1. **Test both modes** - Changes affect both games
2. **Use conditional logic** - Check `gameMode === 'ground'` or `gameMode === 'space'`
3. **Watch for mode-specific features** - Some features only make sense in one mode
4. **Map compatibility** - Ground mode maps should have `games: 'blocky shooter'`, space maps `games: 'starship flyer'`

## Development Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run check`: Run SvelteKit sync and TypeScript check.
- `npm run lint`: Run ESLint.
- `npm run format`: Format code with Prettier.
- `npm test`: Run Vitest tests.

## Deployment

The project is configured for deployment on Netlify using `@sveltejs/adapter-netlify`.
