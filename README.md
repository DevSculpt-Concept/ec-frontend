# The Curry Fabulous Family

A modern event vendor booking platform built with React 19, TypeScript, Tailwind CSS, Zustand and a Node.js/Express + MongoDB REST API (see the `ec-backend` folder).

## Features

- 🎨 **Beautiful, Responsive UI**: Modern design with Tailwind CSS and shadcn/ui.
- 🔍 **Advanced Vendor Search**: Filter vendors by category, price, and location.
- 📱 **Fully Responsive**: Optimized for mobile, tablet, and desktop.
- 🎯 **Service Categories**: Photography, Catering, Event Planning, Decoration, and more.
- 🛠️ **Admin Dashboard**: Comprehensive management of users, vendors, services, and analytics.
- ⚡ **Fast Performance**: Powered by Vite and React 19.
- 🔄 **State Management**: Using Zustand for global state.
- 📊 **Real-time Data**: JWT-authenticated REST API with Socket.IO notifications.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Node.js + Express + MongoDB** - Backend API (`ec-backend`, deployed at `https://api.curryfabulousfamily.com.ng`)
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Zustand** - State management
- **TanStack Query** - Data fetching
- **React Router** - Routing
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/event-connect.git
   cd event-connect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment file and set the API URL:
   ```bash
   cp .env.example .env
   ```
   `.env.example` points at a local backend (`http://localhost:5001/api/v1`). If you don't create a `.env`, the app talks to the production API (`https://api.curryfabulousfamily.com.ng/api/v1`).

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:5173`

> Run each command on its own line and don't paste trailing `# comments` into zsh (macOS): `#` is passed to the command as an argument, and Vite then treats it as the project folder.

## Project Structure

```
src/
├── api/              # API services and core logic
├── components/
│   ├── layout/       # Layout components (Navbar, Footer, Sidebars)
│   ├── sections/     # Page sections (Hero, Services, etc.)
│   └── ui/           # Reusable UI components
├── data/             # Static and mock data
├── lib/              # Utility functions and library wrappers
├── pages/            # Main page components
│   └── admin/        # Admin dashboard pages
├── store/            # Zustand store definitions
└── App.tsx           # Main app component
```

## Available Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build the project for production.
- `npm run preview`: Preview the production build.
- `npm run lint`: Run ESLint to check for code issues.

## License

This project is licensed under the MIT License.


## Related folders

- `ec-backend` – Node.js + TypeScript + MongoDB API (deployment guide in its `docs/`)
- `ec-postman` – Postman collection and environments

## Hosting this app
`netlify.toml` and `vercel.json` are included (SPA rewrite). Set `VITE_API_URL=https://api.curryfabulousfamily.com.ng/api/v1` in the host's environment settings, and add the site's URL to `CORS_ORIGINS` / `FRONTEND_URL` on the backend.
