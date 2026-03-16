# SmartDine Environment Setup

This document explains how to set up and manage environment variables for the SmartDine project, ensuring a clear separation between local development and production deployment.

## Environment File Structure

The project uses distinct `.env` files for different environments. These files are listed in `.gitignore` to prevent sensitive information from being committed to the repository.

| Environment | Frontend File | Backend File |
| :--- | :--- | :--- |
| **Production** | `frontend/.env` | `backend/.env` |
| **Development** | `frontend/.env.development` | `backend/.env.development` |

## Required Environment Variables

### Frontend

| Variable | Description |
| :--- | :--- |
| `VITE_API_URL` | The URL of the backend API (e.g., `http://localhost:5000/api` for dev). |
| `VITE_RAZORPAY_KEY_ID` | Your Razorpay API Key ID. |

### Backend

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Connection string for the database. |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens. |
| `RAZORPAY_KEY_ID` | Your Razorpay API Key ID. |
| `RAZORPAY_KEY_SECRET` | Your Razorpay API Key Secret. |
| `FRONTEND_URL` | (Production) The URL of the deployed frontend. |
| `NODE_ENV` | Set to `production` or `development`. |

## Local Development Commands

To run the project locally without affecting the production environment:

### 1. Backend
Navigate to the root directory and run:
```bash
npm run dev --prefix backend
```
This command sets `NODE_ENV=development`, which causes the backend to load variables from `backend/.env.development` via the `src/loadEnv.ts` module. **To ensure correct variable loading, `src/loadEnv.ts` should be imported at the very top of `src/index.ts`.**

### 2. Frontend
Navigate to the root directory and run:
```bash
npm run dev --prefix frontend
```
Vite automatically loads `frontend/.env.development` when running in development mode.

## Deployment Configuration

When deploying to production, ensure that the environment variables are configured in your deployment platform's dashboard:

- **Netlify (Frontend)**: Add variables in Site Settings > Build & deploy > Environment.
- **Render (Backend)**: Add variables in Service Settings > Environment.

The production build processes will use these platform-defined variables, and the backend will default to loading from `backend/.env` if `NODE_ENV` is set to `production`.
