export async function fetchRepoTree(owner: string, repo: string) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`
  );
  const data = await res.json();
  return data.tree; // array of { path, type, url }
}
