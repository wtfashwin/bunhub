// src/services/github.ts
const BASE = 'https://api.github.com';
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const headers: Record<string, string> = TOKEN ? { Authorization: `token ${TOKEN}` } : {};

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  owner: { login: string; avatar_url: string };
  html_url: string;
}

export const fetchSearch = async (q: string, type: 'users' | 'repositories'): Promise<any[]> => {
  const res = await fetch(`${BASE}/search/${type}?q=${encodeURIComponent(q)}&per_page=8`, { headers });
  if (!res.ok) throw new Error(`Search request failed: ${res.status}`);
  const json = await res.json();
  return json.items;
};

export const fetchTrendingRepos = async (): Promise<GitHubRepo[]> => {
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const q = `created:>${lastWeek}`;
  const res = await fetch(`${BASE}/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=6`, { headers });
  if (!res.ok) throw new Error(`Trending request failed: ${res.status}`);
  const json = await res.json();
  return json.items;
};
