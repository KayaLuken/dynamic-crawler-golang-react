import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex gap-6 py-4 border-b border-gray-200 mb-6">
      <Link href="/" className="text-lg font-semibold text-blue-600 hover:underline">Home</Link>
      <Link href="/crawl" className="text-lg font-semibold text-blue-600 hover:underline">Crawl</Link>
      <Link href="/dashboard" className="text-lg font-semibold text-blue-600 hover:underline">Dashboard</Link>
    </nav>
  );
}
