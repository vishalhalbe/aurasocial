const platforms = ["twitter", "facebook", "instagram"];

export default function LinkAccounts() {
  const handleLink = async (platform) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/api/social/${platform}/oauth`
      );
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Linking failed", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Link Social Accounts</h1>
      {platforms.map((p) => (
        <button key={p} onClick={() => handleLink(p)} style={{ marginRight: 10 }}>
          Link {p}
        </button>
      ))}
    </div>
  );
}

