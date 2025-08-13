import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();
      if (data.token) {
        // Store token for later use
        localStorage.setItem("token", data.token);
        setToken(data.token);

        // Fetch the current user's profile to obtain the user ID
        const meRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${data.token}` },
          }
        );
        const meData = await meRes.json();
        if (meData && meData.id) {
          localStorage.setItem("userId", meData.id);
        }
        setStatus("Logged in");
      } else {
        setStatus("Login failed");
      }
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email </label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {token && <pre style={{ marginTop: 20 }}>Token: {token}</pre>}
      {status && <pre style={{ marginTop: 20 }}>{status}</pre>}
    </div>
  );
}

