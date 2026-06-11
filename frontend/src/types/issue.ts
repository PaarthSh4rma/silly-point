export type Article = {
  id: number;
  title: string;
  url: string;
  source: string;
  published_at: string | null;
  summary: string | null;
  category: string | null;
};

export type IssueSection = {
  name: string;
  description: string;
  articles: Article[];
};

export type Issue = {
  id: number;
  issue_date: string;
  title: string;
  tagline: string;
  status: string;
  sections: IssueSection[];
};