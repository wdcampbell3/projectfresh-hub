# ProjectFresh Hub Context

> [!IMPORTANT]
> **PROJECT RULES**:
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
- **`drawing-canvas`**: Creative drawing tool.
- **`loan-calculator`**: Utility tool.

## Development Scripts
- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run check`: Run SvelteKit sync and TypeScript check.
- `npm run lint`: Run ESLint.
- `npm run format`: Format code with Prettier.
- `npm test`: Run Vitest tests.

## Deployment
The project is configured for deployment on Netlify using `@sveltejs/adapter-netlify`.
