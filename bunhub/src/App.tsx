import { Routes, Route } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import GitHubNotifications from "./pages/SearchPage";
import RepoPage from "./pages/RepoPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Routes>

        <Route path="/" element={<SearchPage />} />
        <Route path="/repo/:owner/:repo" element={<RepoPage />} />
        <Route path="/admin" element={<AdminPage />} />

      </Routes>
      <SearchPage />
          <div className="mt-12">
      <GitHubNotifications />
          </div>

      
    </div>
  );
}
