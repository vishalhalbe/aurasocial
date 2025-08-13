import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>AuraSocial</h1>
      <ul>
        <li>
          <Link href="/login">Login</Link>
        </li>
        <li>
          <Link href="/link-accounts">Link Social Accounts</Link>
        </li>
        <li>
          <Link href="/compose">Compose Post</Link>
        </li>
        <li>
          <Link href="/schedule">View Schedule</Link>
        </li>
      </ul>
    </div>
  );
}

