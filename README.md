# Aatman Admin Console

A responsive admin web application for AYUSH practitioner verification, built with React, Vite, and Chakra UI. The app demonstrates modern data-driven dashboards, role-aware access, in-memory API mocks, and rich workflows for managing practitioner onboarding.

## Tech Stack

- **Vite** for fast development and build tooling
- **React 18** with modern hooks and React Router v6
- **Chakra UI** for accessible, themeable components
- **React Query** for server-state caching and optimistic UI updates
- **TanStack Table** for rich table interactions
- **PapaParse** for CSV exports
- **Zod** for schema-friendly validation utilities (ready for future integration)

## Getting Started

```bash
npm install
npm run dev
```

The development server starts at `http://localhost:5173` and opens automatically.

## Available Scripts

- `npm run dev` – Start Vite in development mode
- `npm run build` – Build the production bundle
- `npm run preview` – Preview the production build locally
- `npm run lint` – Run ESLint across the source tree

## Application Structure

```
src/
├── api/                # Mock API with in-memory data store and optimistic operations
├── components/         # Reusable UI pieces (DataTable, dialogs, cards, etc.)
├── context/            # Auth context providing role-aware state
├── data/               # Seed data generation for users and documents
├── layouts/            # App shell with navigation and global UI chrome
├── pages/              # Route-level screens (dashboard, users, documents, settings)
├── theme/              # Chakra provider configuration and design tokens
├── utils/              # Formatting helpers and CSV utilities
└── main.jsx            # Application bootstrap
```

## Feature Highlights

- **Authentication mock** with role selection (`superadmin`, `verifier`, `viewer`) and protected routes after login.
- **Custom Chakra theme** featuring a brand gradient, rounded cards, and light/dark mode toggle with `ColorModeScript`.
- **Dashboard metrics** summarizing practitioner status and document workload in real time.
- **Users workspace** with TanStack Table integration (sorting, pagination, filtering, CSV export, bulk actions).
- **User detail hub** including document verification workflows, qualifications, regulatory info, and audit history.
- **Documents queue** enabling quick filtering, previewing, and optimistic verify/reject interactions.
- **Mock API layer** providing deterministic seed data (36 practitioners) and optimistic updates for both user statuses and documents.

## Development Notes

- The in-memory API mimics network latency using small delays; React Query caches results for snappy navigation.
- Document and user status actions perform optimistic updates while keeping both list and detail views in sync.
- CSV export uses the current table view (columns marked `exportable: false` are omitted).
- ESLint flat config (`eslint.config.js`) is included to align with ESLint 9+ best practices.

## Next Steps (Ideas)

- Integrate real authentication and backend services.
- Add form flows for notes and document annotations with validation via Zod.
- Extend settings to manage role permissions and audit policies.
- Wire automated tests (unit + integration) as the API graduates from mock data.

---

Crafted with care for a polished admin experience using Chakra UI and modern React tooling.
