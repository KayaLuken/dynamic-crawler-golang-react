import { useMutation } from '@tanstack/react-query';

interface CrawlRequest {
    url: string;
    }

const postCrawl = async (data: CrawlRequest) => {
    const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Error in crawling the URL');
    }
    return response.json();
}

export const useCrawlApi = () => {
    return useMutation({
        mutationFn: postCrawl,
        onError: (error) => {
            console.error('Error in crawling:', error);
        },
    });
};