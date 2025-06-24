import React from 'react';

interface User {
  login: string;
  avatar_url: string;
  html_url: string;
}

const UserCard = ({ user }: { user: User }) => {
  return (
    <a
      href={user.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="card fade-in-up hover:scale-[1.015] transition-transform duration-200"
    >
      <div className="flex items-center gap-4">
        <img
          src={user.avatar_url}
          alt={user.login}
          className="w-14 h-14 rounded-full object-cover border border-gray-700"
        />
        <div>
          <h3 className="text-lg font-semibold text-white">{user.login}</h3>
          <p className="text-sm text-secondary">View GitHub Profile →</p>
        </div>
      </div>
    </a>
  );
};

export default UserCard;
