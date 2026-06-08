export interface RSSItem {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    author?: string;
    category?: string[];
    guid?: string;
}

export interface ParsedRSSItem {
    id: string;
    title: string;
    url: string;
    description: string;
    publishedDate: string;
    author?: string;
    category?: string;
    image?: string;
    source: string;
    estimatedReadTime: number;
}