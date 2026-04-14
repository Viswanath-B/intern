# Intern Project

This repository contains the internship portal system, split into a React frontend and an Express backend.

## Project Structure

- **client/**: React + Vite frontend application.
- **server/**: Node.js + Express backend API.

## Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB

### Setup

1. **Backend**:
   ```bash
   cd server
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Deployment

The backend is configured for deployment on platforms like Render or Vercel. 
Ensure you set the **Root Directory** to `server` in your deployment settings.
