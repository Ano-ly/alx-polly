# ALX Polly: Polling Application

ALX Polly is a modern web application built with Next.js, TypeScript, and Supabase, allowing users to create, manage, and share polls. This application was developed as part of the ALX Software Engineering program, focusing on full-stack development practices, secure authentication, and efficient data management.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Development Server](#running-the-development-server)
- [Project Structure](#project-structure)
- [Authentication Flows](#authentication-flows)
- [Poll Management](#poll-management)
- [Voting System](#voting-system)
- [User Dashboard](#user-dashboard)
- [Code Style and Conventions](#code-style-and-conventions)
- [Security Audit Challenge](#security-audit-challenge)

## Features

- **User Authentication**: Secure registration, login, and logout powered by Supabase Auth.
- **Poll Creation**: Users can create polls with a question and multiple options.
- **Poll Management**: Authenticated users can view, edit, and delete their own polls.
- **Voting System**: Public voting on polls via unique shareable links.
- **QR Code Sharing**: Generate QR codes for easy poll sharing.
- **Responsive Design**: Built with Tailwind CSS and shadcn/ui for a modern, adaptive user interface.
- **Server-Side Rendering (SSR)**: Leverages Next.js Server Components for efficient data fetching and improved performance.
- **Server Actions**: Utilizes Next.js Server Actions for secure and efficient data mutations.

## Technology Stack

- **Language**: TypeScript
- **Framework**: Next.js (App Router)
- **Database & Authentication**: Supabase
- **Styling**: Tailwind CSS with shadcn/ui components
- **QR Code Generation**: `qrcode.react`

## Architecture

ALX Polly follows a modern Next.js App Router architecture, emphasizing Server Components for data fetching and Server Actions for mutations. This approach minimizes client-side JavaScript, improves performance, and enhances security.

- **Server Components**: Used for fetching and displaying data (e.g., `app/(dashboard)/polls/page.tsx`).
- **Client Components**: Used for interactive UI elements (e.g., `app/(dashboard)/create/PollCreateForm.tsx`, `app/(dashboard)/polls/[id]/edit/EditPollForm.tsx`).
- **Server Actions**: Handle all data mutations (e.g., `app/lib/actions/auth-actions.ts`, `app/lib/actions/poll-actions.ts`).
- **Supabase**: Integrated for database operations and user authentication.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- Node.js (v18.x or later)
- npm or Yarn
- Git
- A Supabase project (with a database and authentication enabled)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/alx-polly.git
   cd alx-polly
   ```

2. Install dependencies:
   ```bash
   npm install
   # or yarn install
   ```

### Environment Variables

Create a `.env.local` file in the root of the project and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Ensure your Supabase database is set up with the necessary tables (e.g., `polls`, `options`, `votes`) and Row Level Security (RLS) policies configured.

### Running the Development Server

To start the development server:

```bash
npm run dev
# or yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
alx-polly/
├── app/                  # Next.js App Router routes and pages
│   ├── (auth)/           # Authentication routes (login, register)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/      # Authenticated user dashboard routes
│   │   ├── admin/page.tsx
│   │   ├── create/PollCreateForm.tsx
│   │   ├── create/page.tsx
│   │   ├── polls/page.tsx
│   │   └── polls/[id]/edit/EditPollForm.tsx
│   ├── api/              # API routes (if any, though Server Actions are preferred)
│   ├── layout.tsx        # Root layout for the application
│   └── page.tsx          # Home page
├── components/           # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── PollCard.tsx      # Component for displaying a single poll
│   └── ...
├── lib/                  # Utility functions, Supabase client, Server Actions
│   ├── actions/          # Next.js Server Actions
│   │   ├── auth-actions.ts # Authentication related server actions
│   │   └── poll-actions.ts # Poll management and voting server actions
│   ├── supabase/         # Supabase client setup
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   └── utils.ts          # General utility functions
├── public/               # Static assets
├── .env.local            # Environment variables (local)
├── next.config.ts        # Next.js configuration
├── package.json          # Project dependencies and scripts
├── README.md             # Project README
├── tsconfig.json         # TypeScript configuration
└── ...
```

## Authentication Flows

Authentication is handled via Supabase Auth and Next.js Server Actions. The `app/lib/actions/auth-actions.ts` file contains the core logic for user registration, login, and logout. These actions are directly called from client-side forms, ensuring secure and efficient communication with the backend without exposing sensitive logic.

- **Login**: Users can log in with their email and password.
- **Registration**: New users can create an account.
- **Logout**: Users can securely log out of their session.
- **Session Management**: Supabase handles session management, accessible via `getCurrentUser` and `getSession` server actions.

## Poll Management

Poll creation, retrieval, updating, and deletion are managed through Next.js Server Actions defined in `app/lib/actions/poll-actions.ts`. The user dashboard (`app/(dashboard)/polls/page.tsx`) displays polls created by the authenticated user.

- **Create Poll**: Users can create new polls with a question and multiple options using `PollCreateForm.tsx`.
- **View User Polls**: The `PollsPage` component fetches and displays a list of polls belonging to the current user.
- **Edit Poll**: Existing polls can be modified via `EditPollForm.tsx`.
- **Delete Poll**: Users can delete their own polls.

## Voting System

The voting system allows any user to cast a vote on a poll. Voting logic is encapsulated within the `submitVote` Server Action in `app/lib/actions/poll-actions.ts`. Each poll has a unique URL that can be shared for voting.

- **Submit Vote**: Records a user's vote for a specific option on a poll.
- **Real-time Updates**: While not explicitly implemented with real-time subscriptions, the system is designed to reflect vote counts upon page revalidation.

## User Dashboard

The user dashboard provides a centralized place for authenticated users to manage their polls. Key components include:

- **`app/(dashboard)/polls/page.tsx`**: The main page for displaying a user's polls, fetching data using Server Components.
- **`app/(dashboard)/create/PollCreateForm.tsx`**: A client component for creating new polls, interacting with the `createPoll` Server Action.
- **`app/(dashboard)/polls/[id]/edit/EditPollForm.tsx`**: A client component for editing existing polls, interacting with the `updatePoll` Server Action.

## Code Style and Conventions

- **TypeScript**: Strict typing is enforced throughout the project for better code quality and maintainability.
- **Next.js App Router**: Adherence to the App Router conventions for routing, layouts, and data fetching.
- **Server Components First**: Prioritize Server Components for data fetching to optimize performance.
- **Server Actions for Mutations**: All data modifications are handled via Server Actions.
- **Naming Conventions**: PascalCase for components (e.g., `PollCard.tsx`), camelCase for functions and variables (e.g., `createPoll`).
- **Error Handling**: Robust error handling implemented using `try/catch` blocks in Server Actions and `error.tsx` for UI error boundaries.
- **Environment Variables**: All sensitive keys and configurations are managed through environment variables.

## Security Enhancements

This project was developed with a focus on security, particularly in the context of a security audit challenge. The primary objectives were to:

1.  **Implement Secure Authentication**: Utilize Supabase Auth to handle user registration, login, and session management securely.
2.  **Protect Against Unauthorized Access**: Implement Row Level Security (RLS) policies in Supabase to ensure users can only access and modify their own data (e.g., a user can only edit/delete polls they created).
3.  **Prevent Common Web Vulnerabilities**: Ensure Server Actions are used correctly to prevent issues like SQL injection (Supabase client handles this), XSS, and CSRF (Next.js and Server Actions provide built-in protections).
4.  **Secure Data Mutations**: All data modification operations (creating, updating, deleting polls, submitting votes) are performed via Next.js Server Actions, which run on the server, preventing client-side tampering with sensitive logic.

### Fixed Security Issues

#### 1. Improper Input Validation / Cross-Site Scripting (XSS)

**Issue**: User-generated content, specifically poll questions and options, was not being sanitized before being stored in the database and displayed, making the application vulnerable to XSS attacks. An attacker could inject malicious scripts that would execute in other users' browsers.

**Solution**:
To mitigate the XSS vulnerability, the following steps were taken:
-   **`dompurify` and `jsdom` Integration**: The `dompurify` library was integrated along with `jsdom` to provide robust server-side HTML sanitization.
-   **`sanitizeInput` Helper Function**: A helper function `sanitizeInput` was created in `app/lib/actions/poll-actions.ts` to encapsulate the sanitization logic. This function uses `DOMPurify.sanitize()` to clean potentially malicious input.
-   **Application in Server Actions**: The `sanitizeInput` function is now applied to the `question` and `options` fields within the `createPoll` and `updatePoll` Server Actions in `app/lib/actions/poll-actions.ts`. This ensures that all user-provided text content is sanitized before being stored in the database, effectively preventing XSS attacks.

This README provides a comprehensive overview of the ALX Polly application, its technical foundation, and how to get started. For more detailed code-level understanding, refer to the inline comments and docstrings within the source files.
