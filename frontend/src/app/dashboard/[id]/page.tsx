"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

import { CrawlResult } from "../types";

interface BrokenLink {
  url: string;
  status_code: number;
  error_message?: string;
}

interface CrawlDetailResult extends CrawlResult {
  broken_links?: BrokenLink[];
}

export default function CrawlDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [crawlResult, setCrawlResult] = useState<CrawlDetailResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCrawlDetail = async () => {
      try {
        const response = await fetch(`http://localhost:8080/crawl/history`);
        if (!response.ok) {
          throw new Error("Failed to fetch crawl history");
        }
        const data = await response.json();
        const result = data.history.find((item: CrawlResult) => item.id === parseInt(params.id as string));
        if (!result) {
          throw new Error("Crawl result not found");
        }
        setCrawlResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCrawlDetail();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle size={20} />
              <span className="font-semibold">Error</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!crawlResult) {
    return null;
  }

  // Prepare data for charts
  const linkData = [
    { name: "Internal Links", value: crawlResult.internal_links, color: "#3b82f6" },
    { name: "External Links", value: crawlResult.external_links, color: "#10b981" },
  ];

  const headingsData = Object.entries(crawlResult.headings).map(([key, value]) => ({
    name: key.toUpperCase(),
    count: value,
  }));

  const COLORS = ["#3b82f6", "#10b981"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crawl Details</h1>
          <div className="flex items-center gap-2">
            <a
              href={crawlResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {crawlResult.url}
              <ExternalLink size={16} />
            </a>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Crawled on {new Date(crawlResult.crawled_at).toLocaleDateString()} at{" "}
            {new Date(crawlResult.crawled_at).toLocaleTimeString()}
          </p>
        </div>

        {/* Basic Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">HTML Version</h3>
            <p className="text-2xl font-bold text-gray-900">{crawlResult.html_version}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Title</h3>
            <p className="text-lg font-semibold text-gray-900 truncate" title={crawlResult.title}>
              {crawlResult.title || "No title"}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Links</h3>
            <p className="text-2xl font-bold text-gray-900">
              {crawlResult.internal_links + crawlResult.external_links}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Login Form</h3>
            <p className="text-2xl font-bold text-gray-900">
              {crawlResult.has_login_form ? "Yes" : "No"}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Link Distribution Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Link Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={linkData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {linkData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Headings Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Heading Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={headingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Broken Links Section */}
        {crawlResult.inaccessible_links > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              Inaccessible Links ({crawlResult.inaccessible_links})
            </h3>
            {crawlResult.broken_links && crawlResult.broken_links.length > 0 ? (
              <div className="space-y-3">
                {crawlResult.broken_links.map((link, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium break-all"
                        >
                          {link.url}
                        </a>
                        {link.error_message && (
                          <p className="text-red-700 text-sm mt-1">{link.error_message}</p>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            link.status_code === 0
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {link.status_code === 0 ? "Error" : `${link.status_code}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  <strong>Note:</strong> Broken links were detected but detailed information is not available. 
                  This may be from an older crawl before detailed link tracking was implemented.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
