import { useState } from "react";

const platforms = ["twitter", "facebook", "instagram"];

export default function Compose() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState(platforms[0]);
  const [scheduledFor, setScheduledFor] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/api/posts/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: 1,
            content,
            platform,
            scheduledFor,
          }),
        }
      );
      const data = await res.json();
      setStatus(JSON.stringify(data));
    } catch (err) {
      console.error("Schedule failed", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Compose Post</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            cols={50}
            placeholder="What's happening?"
          />
        </div>
        <div>
          <label>Platform </label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {platforms.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Schedule For </label>
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
          />
        </div>
        <button type="submit">Schedule</button>
      </form>
      {status && <pre style={{ marginTop: 20 }}>{status}</pre>}
    </div>
  );
}

