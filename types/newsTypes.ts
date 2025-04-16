export interface News {
    news: NewsArticle[];
    next_page_token: string | null;
}

export interface NewsArticleImage {
    size: "thumb" | "small" | "large";
    url: string;
}

export interface NewsArticle {
    id: number;
    headline: string;
    author: string;
    created_at: string;
    updated_at: string;
    summary: string;
    content: string;
    url: string | null;
    images: NewsArticleImage[];
    symbols: string[];
    source: string;
}

export type GetNewsOptions = {
    start?: string;
    end?: string;
    sort?: string;
    symbols?: string;
    limit?: number;
    include_content?: boolean;
    exclude_contentless?: boolean;
    page_token?: string;
};