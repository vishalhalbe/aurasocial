# AuraSocial

## Frontend

The `frontend/` directory contains a basic Next.js application that provides pages for:

- User authentication
- Linking social media accounts
- Composing and scheduling posts
- Viewing scheduled posts with real-time updates via Socket.IO

To start the development server:

```
cd frontend
npm install
npm run dev
```

Ensure the backend is running and set `NEXT_PUBLIC_API_URL` to the backend URL.

## Docker

Dockerfiles are provided for both the backend and frontend along with a `docker-compose.yml` file.

### Local Development

1. Copy `.env.example` to `.env` and adjust values as needed.
2. Build and start the stack:

```
docker-compose up --build
```

The backend will be available at `http://localhost:5000` and the frontend at `http://localhost:3000`.

### Production

Set production-ready values in `.env` (for example `NODE_ENV=production`) and run:

```
docker-compose up --build -d
```

You can deploy the resulting images to any cloud provider that supports containers. Tools like [kompose](https://kompose.io/) can convert the compose file into Kubernetes manifests if needed.

## Environment Configuration

The application relies on environment variables for database connections, Redis, and social API credentials. See `.env.example` for the full list.

- Development: use the defaults provided in `.env.example` and run the stack with Docker Compose.
- Production: supply real credentials and secrets, set `NODE_ENV=production`, and configure your cloud provider to use the provided Docker images.

## Deployment on Render

1. Push this repository to your Git provider.
2. Visit the [Render Dashboard](https://dashboard.render.com) and create a new Blueprint using this repo.
3. Render will provision services defined in `render.yaml`:
   - `backend` Node service
   - `frontend` Node service
   - `aurasocial-db` PostgreSQL database
   - `aurasocial-redis` Redis instance
4. Populate environment variables in the Render dashboard for social API credentials and `NEXT_PUBLIC_API_URL`.
5. Trigger a deploy to launch the full stack.
