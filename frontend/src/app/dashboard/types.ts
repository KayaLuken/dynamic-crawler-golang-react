export interface CrawlResult {
  id: number;
  url: string;
  html_version: string;
  title: string;
  headings: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };
  internal_links: number;
  external_links: number;
  inaccessible_links: number;
  has_login_form: boolean;
  crawled_at: string;
  created_at: string;
  updated_at: string;
}

export interface CrawlHistoryResponse {
  count: number;
  history: CrawlResult[];
}
