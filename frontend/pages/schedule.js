import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Schedule() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Initial load
    const load = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/api/posts/schedule`
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

