BunHub: Real-time GitHub Explorer
BunHub is a blazing-fast full-stack application for real-time GitHub repository and developer search, plus live notifications. Built with 💛 using Bun, TypeScript, and React.

🚀 Features
 Real-time GitHub Search: Instantly find repositories and users.

 Trending Repositories: Cached access to top GitHub projects.

 Live Notifications: Real-time activity feed via WebSockets.

 Dark Mode: Adjustable theme preference.

 Admin Dashboard: View API usage statistics (SQLite-powered).

🛠️ Stack
Layer

Tech Used

Frontend

React 19, TailwindCSS, TypeScript

Backend

Bun (v1.2+), WebSocket Server

Real-time

WSS (WebSocket), Bun's native API

Persistence

SQLite for analytics

Dev Tools

Vite, Bunx, ESLint, TypeScript

📦 Project Structure

├── bunhub/                 # React frontend
├── server.ts               # Bun backend with WSS and static serving
├── analytics.sqlite        # Local DB for tracking API events
├── public/dist/            # Bundled frontend files
├── README.md
└── ...

⚡ Getting Started
Quickly set up BunHub:

1. Clone & Install
git clone https://github.com/your-username/bunhub.git
cd bunhub
bun install

2. Start Frontend
bunx vite

3. Start Backend
cd ..
bun server.ts

Access at: http://localhost:3001

🧩 Roadmap
[ ] GitHub OAuth Login

[ ] Real-time repo issue tracking

[ ] AI-powered repo summaries

[ ] GitHub GraphQL v4 integration

[ ] Deploy on Bun Edge Runtime

🤝 Contributing
PRs and stars are welcome. If you have suggestions, issues, or ideas — open one!

🔒 License
MIT © Ashwin Upadhyay