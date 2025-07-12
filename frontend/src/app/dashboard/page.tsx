import { CrawlResultsTable } from "./components/CrawlResultsTable";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Crawl Results Dashboard</h1>
          <p className="text-gray-600 mt-2">
            View and analyze all your website crawl results with advanced filtering and sorting.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          <CrawlResultsTable />
        </div>
      </div>
    </div>
  );
}
