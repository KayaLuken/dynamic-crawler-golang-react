'use client'

import { useState } from 'react'
import CrawlForm from "./components/CrawlForm";
import BatchCrawlForm from "./components/BatchCrawlForm";

export default function CrawlPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single')

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Website Crawler</h1>
        <p className="text-lg text-gray-600">
          Analyze websites for SEO metrics, link structure, and technical details
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex justify-center">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'single'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Single URL
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'batch'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Batch Processing
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === 'single' ? (
          <CrawlForm />
        ) : (
          <BatchCrawlForm />
        )}
      </div>
    </div>
  );
}
