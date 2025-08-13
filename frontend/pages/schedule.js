import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Schedule() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Initial load
    const load = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/api/posts/schedule`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) setPosts(data);
      } catch (err) {
        console.error("Failed to load schedules", err);
      }
    };
    load();

    // Socket updates
    const socket = io(process.env.NEXT_PUBLIC_API_URL || "", {
      transports: ["websocket"],
      auth: token ? { token } : undefined,
    });
    socket.on("schedule:update", (post) => {
      setPosts((p) => [...p, post]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Scheduled Posts</h1>
      <ul>
        {posts.map((p) => (
          <li key={p.id || Math.random()}>
            {p.content} - {p.platform} - {p.scheduledFor}
          </li>
        ))}
      </ul>
    </div>
  );
}

