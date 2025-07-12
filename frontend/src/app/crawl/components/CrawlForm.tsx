'use client'

import { useState, useRef } from 'react'
import { useCrawlApi } from '@/crawl/hooks/useCrawlApi'
import { useCrawlStore } from '@/crawl/stores/crawlStore'
import { Play, Square, RefreshCw } from 'lucide-react'

export default function CrawlForm() {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingUrl, setProcessingUrl] = useState('')
  const [processingStatus, setProcessingStatus] = useState('')
  const { mutate, isPending, error, data } = useCrawlApi()
  const setUrl = useCrawlStore((state) => state.setUrl)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsProcessing(true)
    setProcessingUrl(input)
    setProcessingStatus('Starting crawl...')
    
    // Create abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      // Start the crawl process
      const response = await fetch('http://localhost:8080/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: input }),
        signal: abortControllerRef.current.signal,
      })

      if (response.ok) {
        const result = await response.json()
        setProcessingStatus('Crawl completed successfully!')
        setUrl(input)
        // You can handle the result here if needed
        console.log('Crawl result:', result)
      } else {
        setProcessingStatus('Crawl failed')
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setProcessingStatus('Crawl stopped by user')
      } else {
        setProcessingStatus('Crawl failed with error')
        console.error('Crawl error:', error)
      }
    } finally {
      setIsProcessing(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setProcessingStatus('Stopping crawl...')
    }
  }

  const handleReset = () => {
    setInput('')
    setIsProcessing(false)
    setProcessingUrl('')
    setProcessingStatus('')
    setUrl('')
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 space-y-6">
      <form onSubmit={handleStart} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <input
            id="url"
            type="url"
            required
            placeholder="https://example.com"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={18} />
            {isProcessing ? 'Processing...' : 'Start Crawl'}
          </button>

          <button
            type="button"
            onClick={handleStop}
            disabled={!isProcessing}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square size={18} />
            Stop
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            <RefreshCw size={18} />
            Reset
          </button>
        </div>
      </form>

      {/* Processing Status */}
      {(isProcessing || processingStatus) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Processing Status</h3>
          <div className="space-y-2">
            {processingUrl && (
              <div className="text-sm">
                <span className="font-medium">URL:</span> {processingUrl}
              </div>
            )}
            <div className="flex items-center gap-2">
              {isProcessing && (
                <RefreshCw size={16} className="animate-spin text-blue-600" />
              )}
              <span className={`text-sm ${isProcessing ? 'text-blue-600' : 'text-gray-600'}`}>
                {processingStatus}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-2">Error</h3>
          <p className="text-red-700">{(error as Error).message}</p>
        </div>
      )}

      {/* Results Display */}
      {data && !isProcessing && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Crawl Results</h3>
          <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
