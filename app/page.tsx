/// <reference types="react" />
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="page-header">
      <h1>Personal Finance Dashboard</h1>
      <p>Track daily payments, view records, and explore stats.</p>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/payments" className="btn btn-primary">
          Record a payment
        </Link>
      </p>
    </div>
  );
}
