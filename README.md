# Skyway Travel Agency

A full-stack travel booking platform built with React, Express, and MongoDB.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:frontend  # Frontend on http://localhost:5173
npm run dev:backend   # Backend on http://localhost:8080
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your environment variables (MongoDB, JWT secret, email credentials)

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, React Router
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **Email**: Nodemailer

## 📁 Project Structure

```
├── api/                # Backend API
│   ├── controllers/    # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   └── utils/          # Utility functions
├── src/                # Frontend source
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── lib/            # Library utilities
│   └── styles/         # CSS styles
└── public/             # Static assets
```

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
