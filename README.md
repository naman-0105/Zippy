# Zippy

Zippy is a modular food-ordering microservices platform with a React + Vite frontend and multiple TypeScript backend services (auth, admin, restaurant, rider, realtime, utils). It's designed for local development and production-ready deployment patterns.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Services](#services)
- [Prerequisites](#prerequisites)
- [Quick Start (Local)](#quick-start-local)
- [Running Services Individually](#running-services-individually)

---

## Project Overview

Zippy is a multi-service application that demonstrates a real-world food ordering platform. It separates concerns across multiple services so each service can scale, be developed, and be deployed independently. The frontend is a React TypeScript application. Backends are Node/TypeScript services with RabbitMQ used for asynchronous messaging.

## Architecture

- Frontend: Vite + React (TypeScript)
- Services: multiple Node/TypeScript services under `services/`
- DB: MongoDB
- Messaging: RabbitMQ for cross-service events (order flow, rider notifications)
- Realtime: WebSocket-based realtime notifications

High-level flow: users place orders from the frontend → restaurant service processes orders and publishes events → rider service consumes order-ready events and responds → realtime service propagates live updates to connected clients.

## Services

The repository contains the following service folders (see `services/`):

- `auth/` — Authentication and user management
- `admin/` — Admin operations and management
- `realtime/` — Socket/realtime server
- `restaurant/` — Restaurant management, menu, order publisher
- `rider/` — Rider operations and order consumers
- `utils/` — Payment integrations and utility routes

Also: frontend client in `frontend/`.

## Prerequisites

- Node.js 18+ (or LTS recommended)
- pnpm or npm (repo examples use `npm`, but `pnpm` is recommended for monorepos)
- MongoDB (Atlas or local)
- RabbitMQ (for messaging)
- (Optional) Docker and Docker Compose for containerized runs

## Quick Start (Local)

1. Install dependencies.

```bash
# install frontend deps
cd frontend && npm install

# install for each service individually, e.g.:
cd ../services/auth && npm install
# repeat for admin, restaurant, rider, realtime, utils
```

2. Start required infrastructure (MongoDB, RabbitMQ). You can run Docker Compose (recommended) or start local services you already have.

3. Start services in development (separate terminals recommended):

```bash
# Example service starts (adjust per service package.json scripts)
cd services/auth && npm run dev
cd services/restaurant && npm run dev
cd services/realtime && npm run dev
cd services/rider && npm run dev
cd services/utils && npm run dev
# In another terminal: frontend
cd frontend && npm run dev
```

4. Open `http://localhost:5173` (default Vite port) to view the frontend (or the URL printed by Vite).

## Running Services Individually

- Each service is a separate Node project. Standard scripts are available in each `package.json` (usually `dev`, `build`, `start`). Use them from the service directory.
- Example to run the rider service in development:

```bash
cd services/rider
npm install
npm run dev
```
