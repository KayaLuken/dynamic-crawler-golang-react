
import Nav from "./components/Nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Welcome to Dynamic Crawler</h1>
        <p className="text-lg text-gray-700">
          This is a web application for crawling and extracting data from websites. Use the navigation above to get started.
        </p>
      </main>
    </div>
  );
}
