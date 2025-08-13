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

