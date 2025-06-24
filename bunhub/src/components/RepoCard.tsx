import React from 'react';

interface Repo {
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

const RepoCard = ({ repo }: { repo: Repo }) => {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="card fade-in-up hover:scale-[1.015] transition-transform duration-200"
    >
      <div className="flex items-start gap-4">
        <img
          src={repo.owner.avatar_url}
          alt={repo.owner.login}
          className="w-12 h-12 rounded-full object-cover border border-gray-700"
        />
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">{repo.name}</h3>
          <p className="text-sm text-secondary mb-2">{repo.description || 'No description provided.'}</p>

          <div className="flex items-center gap-4 text-sm text-secondary mt-1">
            {repo.language && <span>🧠 {repo.language}</span>}
            <span>⭐ {repo.stargazers_count}</span>
            <span>🍴 {repo.forks_count}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default RepoCard;
