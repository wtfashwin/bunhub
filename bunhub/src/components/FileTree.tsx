import { useEffect, useState } from "react";

interface FileNode {
  path: string;
  type: "tree" | "blob";
  url: string;
}

interface Props {
  owner: string;
  repo: string;
}

export default function FileTree({ owner, repo }: Props) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    const fetchTree = async () => {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`
      );
      const data = await res.json();
      setTree(data.tree);
    };
    fetchTree();
  }, [owner, repo]);

  const toggle = (folder: string) => {
    setExpanded((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  const fetchBlobContent = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    const content = atob(data.content || "");
    setPreview(content);
  };

  const renderTree = (nodes: FileNode[]) => {
    const grouped: Record<string, FileNode[]> = {};

    for (const node of nodes) {
      const top = node.path.split("/")[0];
      if (!grouped[top]) grouped[top] = [];
      grouped[top].push(node);
    }

    return Object.entries(grouped).map(([folderOrFile, group]) => {
      const isFolder = group.length > 1 || group[0].path.includes("/");

      if (isFolder) {
        const nested = group
          .filter((f) => f.path.includes("/"))
          .map((f) => ({
            ...f,
            path: f.path.split("/").slice(1).join("/"),
          }))
          .filter((f) => f.path); // avoid blank paths

        return (
          <div key={folderOrFile} className="ml-4">
            <div
              className="cursor-pointer font-medium text-blue-700"
              onClick={() => toggle(folderOrFile)}
            >
              📁 {folderOrFile}
            </div>
            {expanded[folderOrFile] && (
              <div className="ml-4 border-l border-gray-300 pl-4 mt-1">
                {renderTree(nested)}
              </div>
            )}
          </div>
        );
      } else {
        const file = group[0];
        return (
          <div
            key={file.path}
            onClick={() => fetchBlobContent(file.url)}
            className="cursor-pointer hover:text-blue-600 ml-6"
          >
            📄 {folderOrFile}
          </div>
        );
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold mb-2">📁 File Explorer</h3>
        <div className="text-sm">{renderTree(tree)}</div>
      </div>
      <div className="bg-gray-800 text-white p-4 rounded shadow overflow-auto max-h-[600px]">
        <h3 className="text-lg font-semibold mb-2">🧠 Preview</h3>
        <pre className="whitespace-pre-wrap text-sm">{preview}</pre>
      </div>
    </div>
  );
}
