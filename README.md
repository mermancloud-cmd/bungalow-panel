# Bungalow Owner Panel

AI-powered reservation management panel for bungalow/vacation rental businesses. Built with Next.js 16, Supabase, and a mobile-first UI for owners to manage bookings, guest conversations, and AI-assisted responses on the go.

## Tech Stack

| Layer        | Technology                                    |
|-------------|-----------------------------------------------|
| Framework   | Next.js 16 (App Router, standalone output)    |
| Language    | TypeScript 5                                  |
| UI          | React 19, Tailwind CSS 4, shadcn/ui          |
| State       | Zustand, TanStack Query                       |
| Auth        | NextAuth v4 + Supabase Auth                   |
| Database    | Supabase (PostgreSQL)                         |
| Charts      | Recharts                                      |
| Deployment  | Docker, Coolify                               |

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project (or use mock data for UI development)

### Setup

```bash
# Clone the repository
git clone <repo-url> bungalow-panel
cd bungalow-panel

# Install dependencies
npm install

# Create your local environment file
cp .env.local.example .env.local
# Edit .env.local and fill in your Supabase keys + NextAuth secret

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Generating a NextAuth Secret

```bash
openssl rand -base64 32
```

## Production Deployment

### Option A: Docker Compose (recommended)

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f bungalow-panel

# Stop
docker compose down
```

### Option B: Coolify (automated)

```bash
# Make the deploy script executable
chmod +x coolify-deploy.sh

# Deploy
./coolify-deploy.sh \
  --api-key "your-coolify-api-key" \
  --url "https://coolify.yourdomain.com" \
  --domain "panel.merman.sbs" \
  --env-file .env.production
```

### Option C: Standalone Docker

```bash
# Build image
docker build -t bungalow-panel .

# Run
docker run -d \
  --name bungalow-panel \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  bungalow-panel
```

### Health Check

After deployment, verify the app is running:

```bash
curl https://panel.merman.sbs/api/health
# → {"status":"ok","timestamp":"...","version":"0.1.0"}
```

## Environment Variables

| Variable                      | Required | Description                                        | Default                    |
|------------------------------|----------|----------------------------------------------------|----------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`   | ✅       | Supabase project URL                               | —                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅    | Supabase anonymous (public) key                    | —                          |
| `SUPABASE_SERVICE_ROLE_KEY`  | ✅       | Supabase service role key (server-side only)       | —                          |
| `NEXTAUTH_SECRET`            | ✅       | Secret for signing NextAuth sessions               | —                          |
| `NEXTAUTH_URL`               | ✅       | Canonical app URL for NextAuth callbacks           | `https://panel.merman.sbs` |
| `APP_VERSION`                | ❌       | Version string shown in health endpoint            | `0.1.0`                    |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── auth/           # NextAuth catch-all route
│   │   └── health/         # Health check endpoint
│   ├── dashboard/          # Main dashboard page
│   ├── reservations/       # Booking management
│   ├── messages/           # Guest conversations
│   ├── ai/                 # AI control panel
│   ├── settings/           # App settings
│   └── login/              # Authentication page
├── components/             # React components
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # Header, nav, mobile shell
│   ├── dashboard/          # Dashboard widgets
│   ├── reservations/       # Reservation views
│   ├── messages/           # Message UI
│   └── ai-control/         # AI management
├── hooks/                  # Custom React hooks (data fetching)
├── lib/                    # Utilities, Supabase clients, types
└── stores/                 # Zustand state stores
```

## License

Private — All rights reserved.
