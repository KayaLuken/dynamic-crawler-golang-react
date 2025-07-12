'use client'

import { useState, useRef } from 'react'
import { Play, Square, RefreshCw, Plus, Trash2 } from 'lucide-react'

interface CrawlJob {
  id: string
  url: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  result?: unknown
  error?: string
  startTime?: Date
  endTime?: Date
}

export default function BatchCrawlForm() {
  const [urlInput, setUrlInput] = useState('')
  const [jobs, setJobs] = useState<CrawlJob[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const addUrl = () => {
    if (!urlInput.trim()) return
    
    const newJob: CrawlJob = {
      id: Date.now().toString(),
      url: urlInput.trim(),
      status: 'pending'
    }
    
    setJobs(prev => [...prev, newJob])
    setUrlInput('')
  }

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id))
  }

  const startProcessing = async () => {
    if (jobs.length === 0) return

    setIsProcessing(true)
    abortControllerRef.current = new AbortController()

    for (const job of jobs) {
      if (job.status !== 'pending') continue

      setCurrentJobId(job.id)
      
      // Update job status to processing
      setJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, status: 'processing', startTime: new Date() }
          : j
      ))

      try {
        const response = await fetch('http://localhost:8080/crawl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: job.url }),
          signal: abortControllerRef.current.signal,
        })

        if (response.ok) {
          const result = await response.json()
          setJobs(prev => prev.map(j => 
            j.id === job.id 
              ? { ...j, status: 'completed', result, endTime: new Date() }
              : j
          ))
        } else {
          setJobs(prev => prev.map(j => 
            j.id === job.id 
              ? { ...j, status: 'failed', error: 'Request failed', endTime: new Date() }
              : j
          ))
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          setJobs(prev => prev.map(j => 
            j.id === job.id 
              ? { ...j, status: 'cancelled', endTime: new Date() }
              : j
          ))
          break // Stop processing remaining jobs
        } else {
          setJobs(prev => prev.map(j => 
            j.id === job.id 
              ? { ...j, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error', endTime: new Date() }
              : j
          ))
        }
      }

      // Add a small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    setIsProcessing(false)
    setCurrentJobId(null)
    abortControllerRef.current = null
  }

  const stopProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const clearAll = () => {
    setJobs([])
    setUrlInput('')
  }

  const getStatusColor = (status: CrawlJob['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 space-y-6">
      {/* Add URL Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Batch URL Crawler</h2>
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="https://example.com"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addUrl()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addUrl}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Add URL
          </button>
        </div>
      </div>

      {/* Control Panel */}
      {jobs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Crawl Queue ({jobs.length} URLs)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={startProcessing}
                disabled={isProcessing || jobs.every(j => j.status !== 'pending')}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <Play size={18} />
                {isProcessing ? 'Processing...' : 'Start All'}
              </button>
              <button
                onClick={stopProcessing}
                disabled={!isProcessing}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                <Square size={18} />
                Stop
              </button>
              <button
                onClick={clearAll}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
              >
                <Trash2 size={18} />
                Clear All
              </button>
            </div>
          </div>

          {/* Job List */}
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  currentJobId === job.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 truncate">
                        {job.url}
                      </div>
                      {job.startTime && (
                        <div className="text-sm text-gray-500">
                          Started: {job.startTime.toLocaleTimeString()}
                          {job.endTime && ` • Duration: ${Math.round((job.endTime.getTime() - job.startTime.getTime()) / 1000)}s`}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                      {job.status === 'processing' && (
                        <RefreshCw size={16} className="animate-spin text-blue-600" />
                      )}
                    </div>
                  </div>
                  {job.error && (
                    <div className="mt-2 text-sm text-red-600">{job.error}</div>
                  )}
                </div>
                <button
                  onClick={() => removeJob(job.id)}
                  disabled={job.status === 'processing'}
                  className="ml-4 text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {jobs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Processing Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {jobs.filter(j => j.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {jobs.filter(j => j.status === 'processing').length}
              </div>
              <div className="text-sm text-gray-500">Processing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {jobs.filter(j => j.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {jobs.filter(j => j.status === 'failed').length}
              </div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {jobs.filter(j => j.status === 'cancelled').length}
              </div>
              <div className="text-sm text-gray-500">Cancelled</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
