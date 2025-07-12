'use client'

import { useState } from 'react'
import { useCrawlApi } from '@/crawl/hooks/useCrawlApi'
import { useCrawlStore } from '@/crawl/stores/crawlStore'
export default function CrawlForm() {
  const [input, setInput] = useState('')
  const { mutate, isPending, error, data } = useCrawlApi()
  const setUrl = useCrawlStore((state) => state.setUrl)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate({ url: input })
    setUrl(input)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md mx-auto mt-10">
      <input
        type="url"
        required
        placeholder="https://example.com"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {isPending ? 'Crawling...' : 'Crawl URL'}
      </button>

      {error && <p className="text-red-500">Error: {(error as Error).message}</p>}
      {data && <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>}
    </form>
  )
}
