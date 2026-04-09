# JobAI — Frontend

An Angular 20 application for an AI-powered job platform serving both **Job Seekers** and **Employers**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 20 (standalone components) |
| Styling | Tailwind CSS v4 |
| UI Components | Angular Material, custom shared components |
| Animations | GSAP, Lottie Web (`ngx-lottie`) |
| Auth | JWT + Google OAuth (`@abacritt/angularx-social-login`) |
| Markdown | `marked` |
| Storage | `localstorage-slim` (encrypted) |
| Notifications | `ngx-toastr` |
| HTTP | Angular `HttpClient` with interceptors |

---

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm start
# → http://localhost:4200

# Production build
npm run build
```

> Requires Node 18+ and Angular CLI 20+.

---

## Environment

Configure `environment/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7129/api',
  url: 'https://localhost:7129',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
};
```

---

## Project Structure

```
src/
├── app/
│   ├── auth/                    # Login, Signup, Guards, Interceptors
│   ├── core/
│   │   ├── components/
│   │   │   ├── dashboard-layout/   # Authenticated shell (sidebar + navbar)
│   │   │   └── landing-layout/     # Public shell
│   │   ├── config/              # Sidebar menu config
│   │   ├── guard/               # Role-based access guard
│   │   ├── interceptors/        # Error interceptor
│   │   └── services/            # UserStore, UserService
│   ├── features/
│   │   ├── chat-interview/      # AI chat interview
│   │   ├── mock-interview/      # Lottie-animated mock interview page
│   │   ├── post-job/            # Employer: post a new job
│   │   ├── posted-job/          # Employer: manage posted jobs
│   │   ├── profiles/
│   │   │   ├── company-profile/ # Employer profile (logo, cover, address, social)
│   │   │   └── user-profile/    # Job seeker profile (avatar, resume, experience, education, skills)
│   │   └── resume-enhancer/     # AI resume enhancement
│   ├── pages/
│   │   ├── landingpage/         # Public landing page
│   │   └── not-found/           # 404 page
│   └── shared/
│       ├── components/
│       │   ├── app-input/       # Reusable input with view/edit mode
│       │   ├── app-select/      # Custom themed dropdown
│       │   ├── date-picker/     # Month/year + day picker
│       │   ├── empty-state/     # Empty state with icon slot
│       │   ├── location-search/ # Nominatim-powered address autocomplete
│       │   ├── lottie/          # Lottie animation wrapper
│       │   ├── navbar/          # Top navigation bar
│       │   ├── sidebar/         # Collapsible sidebar
│       │   └── status-badge/    # Active/Closed status pill
│       ├── enums/               # UserRole enum
│       ├── icons/               # SVG icon component (switch-case)
│       ├── pipes/               # AppDatePipe
│       └── services/            # Lookup service, FileActionsService
└── environment/
    └── environment.ts
```

---

## Routing

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Login |
| `/signup` | Public | Sign up |
| `/dashboard/profile` | Job Seeker | User profile |
| `/dashboard/resume` | Job Seeker | Resume enhancer |
| `/dashboard/mock-interview` | Job Seeker | Mock interview |
| `/dashboard/chat-interview` | Job Seeker | Chat interview |
| `/dashboard/post-job` | Employer | Post a new job |
| `/dashboard/posted-jobs` | Employer | Manage posted jobs |
| `/dashboard/company-profile` | Employer | Company profile |

Route access is enforced by `authGuard` (JWT) and `userAccessGuard` (role-based).

---

## Key Features

### Job Seeker
- Profile management — avatar upload, resume upload/download/print, social links
- Experience & Education CRUD with date picker and validation
- Skills selection from backend lookup
- Location autocomplete (Nominatim / OpenStreetMap)
- AI Mock Interview with Lottie animation
- AI Chat Interview

### Employer
- Company profile — logo/cover upload, address with location search, social links
- AI-generated company description
- Post jobs with AI-generated descriptions
- Manage posted jobs — filter, search, close/reopen/delete
- Role-based sidebar navigation

### Shared
- Collapsible sidebar with role-aware menu
- Encrypted local storage for auth tokens and user state
- HTTP interceptors for auth headers and error handling
- Reusable component library (`app-input`, `app-select`, `date-picker`, `status-badge`, etc.)

---

## Scripts

```bash
npm start          # Dev server (port 4200)
npm run build      # Production build
npm run watch      # Watch mode build
npm test           # Karma unit tests
```
