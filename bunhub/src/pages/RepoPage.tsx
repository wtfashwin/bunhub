import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FileTree from "../components/FileTree";

interface RepoData {
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export default function RepoCard() {
  const { owner, repo } = useParams();
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [readme, setReadme] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!owner || !repo) return;

    const fetchRepoData = async () => {
      try {
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!repoRes.ok) throw new Error("Failed to fetch repo");
        const repoJson = await repoRes.json();

        const readmeRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/readme`,
          {
            headers: { Accept: "application/vnd.github.v3.raw" },
          }
        );
        const readmeText = readmeRes.ok ? await readmeRes.text() : "No README found";

        setRepoData(repoJson);
        setReadme(readmeText);
      } catch (err: any) {
        setError("Error loading repo. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepoData();
  }, [owner, repo]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading repository...</div>;
  }

  if (error || !repoData) {
    return <div className="p-8 text-center text-red-600">{error || "Repository not found."}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={repoData.owner.avatar_url}
          alt={repoData.owner.login}
          className="w-14 h-14 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{repoData.full_name}</h1>
          <p className="text-gray-600">{repoData.description || "No description provided."}</p>
          <div className="text-sm text-gray-500 mt-1">
            ⭐ {repoData.stargazers_count} | 🍴 {repoData.forks_count}
          </div>
          <a
            href={repoData.html_url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 text-sm underline mt-1 inline-block"
          >
            View on GitHub
          </a>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="text-lg font-semibold mb-3">📘 README</h2>
        <pre className="whitespace-pre-wrap text-sm text-gray-800 overflow-auto">
          {readme || "No README found."}
        </pre>
      </div>

      {/* Step 9: File Tree */}
      <FileTree owner={owner!} repo={repo!} />
    </div>
  );
}
