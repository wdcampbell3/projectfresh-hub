# ProjectFresh Hub 🎮

**Dougie's Public Vibe Coding Experiments!**

A full suite of custom 2D and 3D games built from scratch using SvelteKit, Three.js, and modern web technologies. This collection showcases creative coding across different gameplay styles—from 3D world building and space combat to reimagined arcade classics.

## 🎯 Featured Games

### 3D Experiences
- **World Builder** - Create and explore custom 3D environments with a rich model library
- **Starship Flyer** - Space dogfighting with physics, barrel rolls, power-ups, and boss battles
- **Alien Attack** - First-person ground combat with jetpack mechanics and multiple weapons

### 2D Classics (Reimagined)
- **Space Invaders** - Modern take with power-ups and visual effects
- **Light Particles** - TRON-style light-trail combat
- **Cosmic Pong** - Enhanced Pong with dynamic mechanics
- **Tower Assault** - Tower defense challenge
- **Mine Buster** - Upgraded minesweeper
- **Snake-adelic** - Psychedelic Snake variant

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/wdcampbell3/projectfresh-hub.git
cd projectfresh-hub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run check` | Run Svelte type checking |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run tests with Vitest |

---

## 🌐 Deploy to Netlify

This project is pre-configured for Netlify deployment. Follow these steps:

### Option A: Deploy via Netlify Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add -A
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click **"Add new site"** → **"Import an existing project"**
   - Choose **GitHub** and authorize Netlify
   - Select your repository (e.g., `projectfresh-hub`)

3. **Configure Build Settings**
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
   - Click **Deploy site**

4. **Done!** Your site will be live at `https://your-site-name.netlify.app`

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**
   ```bash
   netlify init
   # Follow prompts to connect to your GitHub repo
   
   # Deploy to production
   netlify deploy --prod
   ```

---

## ⚙️ Environment Variables

### Required: Supabase Database Setup

This project uses **Supabase** for authentication, user accounts, and data persistence. You'll need to set up your own Supabase project to use these features.

#### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click **"New Project"**
3. Choose your organization and enter:
   - **Project name:** (e.g., `projectfresh-hub`)
   - **Database password:** (save this securely)
   - **Region:** (choose closest to you)
4. Click **"Create new project"** and wait for setup (~2 minutes)

#### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **anon/public key** → `PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `PRIVATE_SUPABASE_SERVICE_ROLE` (keep secret!)

#### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
# Supabase (REQUIRED for user features)
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
PRIVATE_SUPABASE_SERVICE_ROLE=your-service-role-key-here

# Stripe (optional - for payments)
PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
PRIVATE_STRIPE_API_KEY=your_stripe_secret_key
```

#### Step 4: Enable Authentication (Optional)

For email/password login:
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Configure email templates in **Authentication** → **Email Templates**

### For Netlify Deployment

Add these environment variables in Netlify:
1. Go to **Site settings** → **Environment variables**
2. Add each variable from your `.env` file

> **Note:** The games themselves work without Supabase. Database setup is only needed for login, user accounts, and saving custom maps to the cloud.

---

## 📁 Project Structure

```
projectfresh-hub/
├── src/
│   ├── lib/
│   │   └── components/     # Game components (StarshipGame.svelte, etc.)
│   └── routes/             # SvelteKit pages/routes
│       └── (experiments)/  # Game route pages
├── static/
│   ├── 3d-maps/           # Custom map JSON files
│   └── 3d-models/         # GLB/GLTF 3D models
├── package.json
├── svelte.config.js
└── vite.config.ts
```

---

## 🛠️ Tech Stack

- **Framework:** [SvelteKit](https://kit.svelte.dev/) with TypeScript
- **3D Graphics:** [Three.js](https://threejs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Deployment:** [Netlify](https://netlify.com/)

---

## 🎮 Controls

### Starship Flyer / Alien Attack
| Key | Action |
|-----|--------|
| `W/S` | Forward / Backward |
| `A/D` | Strafe Left / Right |
| `Q/E` | Barrel Roll (Starship) / Strafe (Alien Attack) |
| `Space` | Jetpack Boost |
| `Mouse` | Look Around |
| `Click` | Fire Weapon |
| `Scroll` | Switch Weapons |
| `1-5` | Quick Weapon Select |
| `Esc` | Pause / Menu |

---

## 📄 License

This project is open source and available for learning and experimentation.

---

## 🤝 Contributing

Feel free to fork, experiment, and submit PRs! This project was built through "vibe coding" - creative exploration with AI assistance.

---

**Built with ❤️ by Dougie**
