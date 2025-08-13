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