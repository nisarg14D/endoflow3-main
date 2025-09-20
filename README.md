# ENDOFLOW

An AI-powered SaaS application for dental clinics that automates clinical workflows, improves documentation, and enhances patient engagement.

## Overview

ENDOFLOW provides three specialized, role-based dashboards within a unified Next.js application:

### 🦷 Patient Dashboard (Mobile-First)
- Bottom tab navigation optimized for mobile devices
- Next appointment homepage with quick booking
- Digital file viewer for treatment records and intake forms
- AI-powered chatbot with urgent assistance feature
- Personalized dental education library

### 👩‍⚕️ Assistant Dashboard (Task-Oriented)
- Sidebar navigation with daily task hub
- Patient registration with UHID generation
- Account verification and vitals entry
- File upload management system
- Real-time Kanban board for dentist-delegated tasks

### 🩺 Dentist Dashboard (Command Center)
- Top tab navigation for comprehensive clinic management
- Two-column patient queue with clinical cockpit
- Full-screen digital history-taking with voice-to-text
- Interactive FDI dental chart with 3D visual aids
- Endo-AI Co-Pilot for treatment recommendations
- Master calendar and templates management
- Research studio for patient cohort analysis

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) with App Router
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) with [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: Supabase Auth with role-based access control
- **Automation**: [n8n](https://n8n.io/) for complex workflows

## Getting Started

```bash
git clone <repository-url>
cd endoflow3-main
pnpm install
```

## Development Setup

### Database Configuration

1. Set up your Supabase project and get your connection details
2. Create your `.env` file:

```bash
pnpm db:setup
```

3. Run database migrations:

```bash
pnpm db:migrate
pnpm db:seed
```

### Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm db:setup` - Initialize database configuration
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with test data
- `pnpm db:generate` - Generate new migration files
- `pnpm db:studio` - Open Drizzle Studio for database management

## Project Structure

```
app/
├── (login)/           # Authentication routes
│   └── sign-in/       # Login page
├── (dashboard)/       # Protected dashboard routes
│   └── dashboard/     # Role-specific dashboards
components/
├── ui/               # shadcn/ui components
lib/
├── db/              # Database schema and migrations
└── utils.ts         # Utility functions
temp/                # v0.dev prototypes and reference screenshots
├── login-page/      # Login/signup components and UI references
├── patient-dashboard/   # Patient dashboard components and screenshots
├── assistant-dashboard/ # Assistant dashboard components and screenshots
└── dentist-dashboard/   # Dentist dashboard components and screenshots
```

## Authentication Flow

1. **Login Page**: Serves as the landing page
2. **Sign-up Process**: Comprehensive Digital Intake Form
3. **Account Verification**: Assistant verification required before login access
4. **Role-based Routing**: Users redirected to appropriate dashboard based on role (patient, assistant, dentist)

## Development Phases

### Phase 1: Authentication Integration
- [ ] Implement Supabase authentication
- [ ] Create role-based routing system
- [ ] Integrate login and signup forms from `/temp/login-page/`

### Phase 2: Dashboard Assembly
- [ ] Patient dashboard with mobile-first design
- [ ] Assistant dashboard with task management
- [ ] Dentist dashboard with clinical tools

### Phase 3: Backend Integration
- [ ] Connect Supabase for real-time data
- [ ] Implement n8n automation workflows
- [ ] Replace mock data with live database connections

## Contributing

This project is in active development. The UI prototypes and screenshots in the `/temp/` directory serve as the design reference for implementation.
