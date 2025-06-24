import type { GitHubRepo, GitHubUser, GitHubSearchResponse } from '../types/github';

type GitHubSearchItem = GitHubRepo | GitHubUser;
export async function* streamGitHubSearch(
  query: string,
  type: 'repositories' | 'users',
  token?: string,
  initialPage: number = 1,
  perPage: number = 30 
): AsyncGenerator<GitHubSearchItem, void, unknown> {
  if (!query.trim()) {
    console.warn("streamGitHubSearch called with empty query. No results will be fetched.");
    return; 
  }

  const actualPerPage = Math.min(Math.max(1, perPage), 100);

  let currentPage = initialPage;
  let hasMore = true;
  let totalCount: number | null = null; // Stores total_count from the first successful response

  while (hasMore) {
    // Construct the API endpoint with pagination parameters
    const endpoint = `https://api.github.com/search/${type}?q=${encodeURIComponent(query)}&page=${currentPage}&per_page=${actualPerPage}`;

    try {
      console.log(`Fetching GitHub ${type} page ${currentPage} for query: "${query}"`);

      // Make the fetch request
      const res = await fetch(endpoint, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-GitHub-Api-Version': '2022-11-28', // Recommended API version
        },
      });

      // --- Robust Error Handling ---
      if (!res.ok) {
        // Capture rate limit information from headers
        const rateLimitRemaining = res.headers.get('x-ratelimit-remaining');
        const rateLimitReset = res.headers.get('x-ratelimit-reset'); // Unix timestamp
        const resetDate = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toLocaleString() : 'N/A';

        let errorDetails = '';
        try {
          const errorJson = await res.json();
          errorDetails = errorJson.message || JSON.stringify(errorJson); // Extract message or stringify full error
        } catch (e) {
          errorDetails = res.statusText; // Fallback if JSON parsing of error fails
        }

        console.error(
          `GitHub API Error for ${type} (Status: ${res.status}): ${errorDetails}\n` +
          `Rate Limit Remaining: ${rateLimitRemaining || 'N/A'}. Resets at: ${resetDate}`
        );

        // Throw specific errors for known issues like rate limits
        if (res.status === 403 && rateLimitRemaining === '0') {
          throw new Error(`GitHub API rate limit exceeded. Please wait until ${resetDate}.`);
        } else {
          // General API failure
          throw new Error(`GitHub API failed (${res.status}): ${errorDetails}`);
        }
      }

      // --- Proper JSON Parsing ---
      // Cast the response data to the expected GitHubSearchResponse type
      const data: GitHubSearchResponse<GitHubSearchItem> = await res.json();

      // Set totalCount from the first response. It should remain consistent across pages.
      if (totalCount === null) {
        totalCount = data.total_count;
        console.log(`Total ${type} found: ${totalCount}`);
      }

      // Yield each item from the current page's results
      for (const item of data.items) {
        yield item;
      }

      // --- Determine if more pages are available ---
      // The 'Link' header is the most reliable way to check for next pages in GitHub API
      const linkHeader = res.headers.get('link');
      const hasNextPageLink = linkHeader ? /rel="next"/.test(linkHeader) : false;

      // Update hasMore flag: if there's a 'next' link OR if we haven't fetched all items yet
      // The second part of the condition handles cases where the Link header might be absent
      // but total_count indicates more results exist, or if the last page returns exactly perPage items.
      const itemsFetchedSoFar = (currentPage - initialPage) * actualPerPage + data.items.length;
      hasMore = hasNextPageLink || (totalCount !== null && itemsFetchedSoFar < totalCount);

      if (hasMore) {
        currentPage++;
        // Optional: Add a small delay between requests to be gentle on API limits
        // This is good practice for public APIs to avoid aggressive hammering.
        // await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        // If no more data, ensure the total_count is correctly updated after the last fetch
        // (This might be useful if the total_count changes dynamically for some reason,
        // though for search, it's usually stable after the first request)
      }

    } catch (error: any) {
      console.error(`Error in streamGitHubSearch for ${type} on page ${currentPage}:`, error);
      // Re-throw the error to be caught by the calling component (SearchPage)
      throw error;
    }
  }
}