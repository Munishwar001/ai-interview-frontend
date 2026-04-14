# JobAI — Frontend

An Angular 20 application for an AI-powered job platform serving both **Job Seekers** and **Employers**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 20 (standalone components) |
| Styling | Tailwind CSS v4 |
| UI Components | Angular Material, custom shared components |
| Real-time | SignalR (`@microsoft/signalr`) |
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

## Production Deployment

1. **Verify Environment Configurations**:
   Ensure `environment/environment.prod.ts` has the correct production configurations and points to your live backend APIs (e.g. `https://ai-interview-backend-b5p3.onrender.com/api`).
2. **Build the Application**:
   Run the following command to generate the production-ready compiled artifacts:
   ```bash
   npm run build
   ```
3. **Deploy Artifacts**:
   The built output will be generated inside the `dist/` directory. You can serve the static files using NGINX, Apache, Firebase Hosting, Vercel, or Render.

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
│   │   ├── dashboard/           # Role-based dashboard (Job Seeker/Employer)
│   │   ├── jobs/
│   │   │   ├── chats/           # Real-time chat with SignalR
│   │   │   ├── interviews/      # Video interviews list
│   │   │   └── interview-room/  # WebRTC video interview room
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
│       │   ├── navbar/          # Top navigation bar with real-time notifications
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
| `/dashboard` | Authenticated | Role-based dashboard (Job Seeker/Employer) |
| `/dashboard/profile` | Job Seeker | User profile |
| `/dashboard/resume` | Job Seeker | Resume enhancer |
| `/dashboard/mock-interview` | Job Seeker | Mock interview |
| `/dashboard/chat-interview` | Job Seeker | Chat interview |
| `/dashboard/chats` | Authenticated | Real-time chat with applicants/employers |
| `/dashboard/interviews` | Authenticated | Video interviews list |
| `/dashboard/interview-room/:id` | Authenticated | WebRTC video interview room |
| `/dashboard/post-job` | Employer | Post a new job |
| `/dashboard/posted-jobs` | Employer | Manage posted jobs |
| `/dashboard/company-profile` | Employer | Company profile |

Route access is enforced by `authGuard` (JWT) and `userAccessGuard` (role-based).

---

## Key Features

### Real-time Communication
- **SignalR Integration** — Real-time chat messaging with WebSocket fallback
- **Live Notifications** — Blinking red dot indicator for new messages
- **Notification Modal** — Slide-out panel showing recent messages with navigation
- **Smart Persistence** — localStorage tracking of seen messages across sessions
- **Dual Update System** — SignalR real-time + 30-second polling fallback

### Video Interviews
- **WebRTC Integration** — Peer-to-peer video/audio communication
- **Interview Room Controls** — Toggle mic/camera with visual feedback
- **Real-time Connection** — SignalR signaling for WebRTC negotiation
- **Responsive Layout** — Split-screen view for interviewer and candidate

### Dashboard
- **Role-based Content** — Dynamic dashboard for Job Seekers and Employers
- **Job Seeker Stats** — Profile completion, applications, interviews, profile views
- **Employer Stats** — Active jobs, applicants, shortlisted candidates, weekly views
- **AI Insights** — Hiring trends and recommendations for employers
- **Smooth Navigation** — 300ms fade-out animations between pages

### Chat System
- **Message Alignment** — Sender messages on right (purple), receiver on left (white)
- **Smart Sender Detection** — Multi-layered identification using JWT and UserStore
- **Emoji Picker** — Built-in emoji selector for messages
- **Real-time Updates** — Instant message delivery via SignalR
- **Chat Rooms** — Organized by application with participant info

### Job Seeker
- Profile management — avatar upload, resume upload/download/print, social links
- Experience & Education CRUD with date picker and validation
- Skills selection from backend lookup
- Location autocomplete (Nominatim / OpenStreetMap)
- AI Mock Interview with Lottie animation
- AI Chat Interview
- Job recommendations with AI match percentages
- Application tracking with status badges

### Employer
- Company profile — logo/cover upload, address with location search, social links
- AI-generated company description
- Post jobs with AI-generated descriptions
- Manage posted jobs — filter, search, close/reopen/delete
- Applicant management with shortlisting
- Schedule video interviews
- Real-time chat with candidates
- AI hiring insights and analytics
- Role-based sidebar navigation

### Shared
- Collapsible sidebar with role-aware menu
- Real-time notification system with persistence
- Encrypted local storage for auth tokens and user state
- HTTP interceptors for auth headers and error handling
- Reusable component library (`app-input`, `app-select`, `date-picker`, `status-badge`, etc.)
- Responsive design for mobile, tablet, and desktop
- Smooth animations and transitions throughout

---

## Scripts

```bash
npm start          # Dev server (port 4200)
npm run build      # Production build
npm run watch      # Watch mode build
npm test           # Karma unit tests
```

---

## Real-time Features

### Notification System
- **Bell Icon Badge** — Animated pulsing red dot for unread messages
- **Notification Modal** — Shows recent chat messages with sender info
- **Click to Navigate** — Tap notification to open chat conversation
- **Smart Filtering** — Only shows new messages since last seen
- **Persistent State** — Remembers dismissed notifications across page reloads
- **Auto-refresh** — Updates every 30 seconds + instant SignalR updates

### Chat Features
- **Real-time Messaging** — Instant message delivery via SignalR
- **Message History** — Persistent chat history per application
- **Typing Indicators** — Visual feedback during message composition
- **Emoji Support** — Built-in emoji picker with search
- **File Sharing** — Support for attachments (future enhancement)
- **Read Receipts** — Track message delivery and read status (future enhancement)

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## License

MIT
