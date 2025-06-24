// src/pages/SearchPage.tsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import SearchBar from "../components/SearchBar";
import RepoCard from "../components/RepoCard";
import UserCard from "../components/UserCard";
import { fetchTrendingRepos } from "../services/github";
import { streamGitHubSearch } from "../lib/streamGitHub";
import type { GitHubRepo, GitHubUser } from "../types/github";
import { useGitHubNotifications } from "../hooks/useGitHubNotifications";

// --- Constants for configuration ---
const DEBOUNCE_DELAY_MS = 400;
const INITIAL_PAGE = 1;
const ITEMS_PER_PAGE = 30;

export default function SearchPage() {
  // --- State Management ---
  const [query, setQuery] = useState("");
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [users, setUsers] = useState<GitHubUser[]>([]);
  const [trending, setTrending] = useState<GitHubRepo[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [repoPage, setRepoPage] = useState(INITIAL_PAGE);
  const [userPage, setUserPage] = useState(INITIAL_PAGE);
  const [hasMoreRepos, setHasMoreRepos] = useState(true);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);

  const [showNotifications, setShowNotifications] = useState(false);

  // --- Refs ---
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const repoLoaderRef = useRef<HTMLDivElement>(null);
  const userLoaderRef = useRef<HTMLDivElement>(null);

  const repoObserverRef = useRef<IntersectionObserver | null>(null);
  const userObserverRef = useRef<IntersectionObserver | null>(null);

  // --- Effects ---

  useEffect(() => {
    const loadTrending = async () => {
      setError(null);
      try {
        const data = await fetchTrendingRepos();
        // Transform each repo's owner to match the expected GitHubRepo type
        setTrending(
          data.map((repo: any) => ({
            ...repo,
            owner: {
              login: repo.owner.login,
              id: repo.owner.id ?? 0,
              avatar_url: repo.owner.avatar_url,
              html_url: repo.owner.html_url ?? "",
              type: repo.owner.type ?? "",
            },
          }))
        );
      } catch (err: any) {
        console.error("Failed to fetch trending repos:", err);
        setError("Failed to load trending repositories. Please check your network.");
      }
    };
    loadTrending();
  }, []);

  const executeStreamSearch = useCallback(
    async (
      searchQuery: string,
      type: "repositories" | "users",
      page: number,
      append: boolean
    ) => {
      if (!searchQuery.trim()) return;
      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        const newItems: (GitHubRepo | GitHubUser)[] = [];
        let fetchedCount = 0;

        for await (const item of streamGitHubSearch(
          searchQuery,
          type,
          undefined, // Replace with your token if available
          page,
          ITEMS_PER_PAGE
        )) {
          newItems.push(item);
          fetchedCount++;
        }

        if (type === "repositories") {
          setRepos((prev) => (append ? [...prev, ...(newItems as GitHubRepo[])] : (newItems as GitHubRepo[])));
          setHasMoreRepos(fetchedCount === ITEMS_PER_PAGE);
        } else {
          setUsers((prev) => (append ? [...prev, ...(newItems as GitHubUser[])] : (newItems as GitHubUser[])));
          setHasMoreUsers(fetchedCount === ITEMS_PER_PAGE);
        }

        if (page === INITIAL_PAGE && fetchedCount === 0) {
            if (type === "repositories") setHasMoreRepos(false);
            else setHasMoreUsers(false);
        }

      } catch (e: any) {
        console.error(`Error during streaming search for ${type}:`, e);
        setError(e.message || "An unknown error occurred during search.");
        if (type === "repositories") setHasMoreRepos(false);
        else setHasMoreUsers(false);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const handleInput = useCallback(
    (q: string) => {
      setQuery(q);
      if (typingTimer.current) clearTimeout(typingTimer.current);

      if (!q.trim()) {
        setRepos([]);
        setUsers([]);
        setRepoPage(INITIAL_PAGE);
        setUserPage(INITIAL_PAGE);
        setHasMoreRepos(true);
        setHasMoreUsers(true);
        setError(null);
        setIsLoading(false);
        return;
      }

      typingTimer.current = setTimeout(() => {
        setRepoPage(INITIAL_PAGE);
        setUserPage(INITIAL_PAGE);
        setHasMoreRepos(true);
        setHasMoreUsers(true);

        executeStreamSearch(q, "repositories", INITIAL_PAGE, false);
        executeStreamSearch(q, "users", INITIAL_PAGE, false);
      }, DEBOUNCE_DELAY_MS);
    },
    [executeStreamSearch]
  );

  useEffect(() => {
    if (!repoLoaderRef.current || !query || !hasMoreRepos) {
      repoObserverRef.current?.disconnect();
      return;
    }

    if (!repoObserverRef.current) {
      repoObserverRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isLoading && hasMoreRepos) {
            const nextPage = repoPage + 1;
            setRepoPage(nextPage);
            executeStreamSearch(query, "repositories", nextPage, true);
          }
        },
        { threshold: 0.1 }
      );
    }

    repoObserverRef.current.observe(repoLoaderRef.current);
    return () => repoObserverRef.current?.disconnect();
  }, [query, repoPage, isLoading, hasMoreRepos, executeStreamSearch]);

  useEffect(() => {
    if (!userLoaderRef.current || !query || !hasMoreUsers) {
      userObserverRef.current?.disconnect();
      return;
    }

    if (!userObserverRef.current) {
      userObserverRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isLoading && hasMoreUsers) {
            const nextPage = userPage + 1;
            setUserPage(nextPage);
            executeStreamSearch(query, "users", nextPage, true);
          }
        },
        { threshold: 0.1 }
      );
    }

    userObserverRef.current.observe(userLoaderRef.current);
    return () => userObserverRef.current?.disconnect();
  }, [query, userPage, isLoading, hasMoreUsers, executeStreamSearch]);

  const notifications = useGitHubNotifications();

  // --- Memoized Render Lists ---
  const repoList = useMemo(
    () =>
      repos.map((r) => (
        <RepoCard
          key={r.id}
          repo={{
            ...r,
            description: r.description ?? "", // Nullish coalescing for description
            language: r.language ?? "",     // Nullish coalescing for language
          }}
        />
      )),
    [repos]
  );

  const userList = useMemo(
    () => users.map((u) => <UserCard key={u.id || u.login} user={u} />),
    [users]
  );
  const trendingList = useMemo(
    () => trending.map((r) => <RepoCard key={r.id} repo={{ ...r, description: r.description ?? "", language: r.language ?? "" }} />),
    [trending]
  );

  // --- Memoized Main Content Render Logic ---
  const renderMainContent = useMemo(() => {
    if (error) {
      return (
        <p className="text-red-400 text-center text-lg p-4 bg-red-900 bg-opacity-30 rounded-lg">
          Error: {error}
        </p>
      );
    }

    if (!query) {
      if (trendingList.length === 0 && isLoading) {
         return <p className="animate-pulse text-gray-400 text-center text-lg mt-8">Loading trending repositories...</p>;
      }
      return trendingList.length > 0 ? (
        <section>
          <h2 className="text-3xl font-bold mb-4">🔥 Trending</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingList}
          </div>
        </section>
      ) : (
        <p className="text-gray-400 text-center text-lg mt-8">
          No trending repositories found.
        </p>
      );
    }

    return (
      <>
        {userList.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-4">👤 Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userList}
            </div>
            {hasMoreUsers && (
              <div ref={userLoaderRef} className="h-10 flex items-center justify-center py-4">
                {isLoading && <p className="animate-pulse text-gray-400">Loading more users...</p>}
              </div>
            )}
            {!hasMoreUsers && userList.length > 0 && (
                <p className="text-gray-400 text-center italic mt-4 text-sm">End of user results.</p>
            )}
          </section>
        )}

        {repoList.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-4">📦 Repositories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {repoList}
            </div>
            {hasMoreRepos && (
              <div ref={repoLoaderRef} className="h-10 flex items-center justify-center py-4">
                {isLoading && <p className="animate-pulse text-gray-400">Loading more repositories...</p>}
              </div>
            )}
            {!hasMoreRepos && repoList.length > 0 && (
                <p className="text-gray-400 text-center italic mt-4 text-sm">End of repository results.</p>
            )}
          </section>
        )}

        {!isLoading && query && repoList.length === 0 && userList.length === 0 && !error && (
            <p className="text-gray-400 text-center text-lg mt-8">No results found for "{query}".</p>
        )}

        {isLoading && query && repoList.length === 0 && userList.length === 0 && (
            <p className="animate-pulse text-gray-400 text-center text-lg mt-8">Streaming search results...</p>
        )}
      </>
    );
  }, [
    error,
    isLoading,
    query,
    trendingList,
    userList,
    repoList,
    hasMoreUsers,
    hasMoreRepos,
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Navbar - Fixed to the top */}
      <nav className="fixed top-0 left-0 w-full z-10 flex items-center justify-between px-6 py-4 bg-gray-900 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold tracking-wide">BunHub</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="relative p-2 hover:bg-gray-800 rounded-full transition duration-200"
            aria-label="Toggle notifications"
          >
            🔔
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {notifications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              document.body.dataset.light =
                document.body.dataset.light === "0" ? "1" : "0";
            }}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full transition duration-200 text-lg"
            aria-label="Toggle dark/light mode"
          >
            🌗
          </button>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Add padding-top to account for fixed navbar height */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <SearchBar onSearch={handleInput} initialQuery={query} />
          {renderMainContent}
        </main>

        {/* Notifications Sidebar */}
        {showNotifications && (
          <aside className="w-80 flex-shrink-0 bg-gray-800 border-l border-gray-700 overflow-y-auto p-4 custom-scrollbar">
            <h3 className="text-xl font-semibold mb-4">Live Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-gray-400 italic text-sm">No notifications yet.</p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n, i) => (
                  <li
                    key={i}
                    className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200 shadow-md text-sm"
                  >
                    <span className="font-medium capitalize text-blue-300">{n.type}</span>:{" "}
                    {n.message}
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-400 text-center py-4 text-sm shadow-inner">
        Made by wtfashwin
      </footer>
    </div>
  );
}
