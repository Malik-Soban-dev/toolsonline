import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
export default function NotFound() {
  return (
    <div className="not-found">
      <span className="eyebrow">A SMALL DETOUR · 404</span>
      <div className="empty-icon">
        <Search size={30} strokeWidth={1.3} />
      </div>
      <h1>
        This page is still
        <br />
        <em>out exploring.</em>
      </h1>
      <p>There’s nothing at this address. Your next clear move is back at the studio.</p>
      <Link href="/" className="button button-primary">
        <ArrowLeft size={16} />
        Back to the keyword studio
      </Link>
    </div>
  );
}
