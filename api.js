// js/api.js
// Handles communication with the GitHub REST API, error handling, rate limits, and client caching.

window.DevScopeAPI = {
  rateLimit: {
    limit: 60,
    remaining: 60,
    resetTime: null
  },

  async fetchUserData(username) {
    const cleanUsername = username.trim().toLowerCase();

    // 1. Check for Demo mode trigger
    if (cleanUsername === "demo" || cleanUsername === "alexdev-99") {
      return {
        data: window.DevScopeMockData,
        fromCache: false,
        isDemo: true
      };
    }

    // 2. Check local browser cache
    const cacheKey = `devscope_cache_${cleanUsername}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const ageInMs = Date.now() - parsed.timestamp;
        const fifteenMinutes = 15 * 60 * 1000;
        if (ageInMs < fifteenMinutes) {
          console.log(`Loading cached data for: ${cleanUsername}`);
          return {
            data: parsed.data,
            fromCache: true,
            isDemo: false
          };
        }
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }

    // 3. Prepare headers
    const headers = {
      "Accept": "application/vnd.github.v3+json"
    };

    // Optional: Personal Access Token (PAT) for higher rate limits
    const pat = localStorage.getItem("devscope_github_pat");
    if (pat) {
      headers["Authorization"] = `token ${pat}`;
    }

    try {
      // 4. Fetch Profile
      const profileResponse = await fetch(`https://api.github.com/users/${cleanUsername}`, { headers });
      this.updateRateLimit(profileResponse.headers);

      if (profileResponse.status === 404) {
        throw new Error("USER_NOT_FOUND");
      }
      if (profileResponse.status === 403 || profileResponse.status === 429) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }
      if (!profileResponse.ok) {
        throw new Error("API_ERROR");
      }

      const profile = await profileResponse.json();

      // 5. Fetch Repositories (up to 100)
      const reposResponse = await fetch(`https://api.github.com/users/${cleanUsername}/repos?per_page=100&sort=updated`, { headers });
      this.updateRateLimit(reposResponse.headers);

      if (reposResponse.status === 403 || reposResponse.status === 429) {
        throw new Error("RATE_LIMIT_EXCEEDED");
      }
      if (!reposResponse.ok) {
        throw new Error("API_ERROR");
      }

      let repositories = await reposResponse.json();

      // Ensure we clean up repositories data and check README/License heuristically
      // (Since fetching files requires additional API requests, we check repo metadata)
      repositories = repositories.map(repo => ({
        name: repo.name,
        description: repo.description || "",
        stargazers_count: repo.stargazers_count || 0,
        forks_count: repo.forks_count || 0,
        size: repo.size || 0, // KB
        language: repo.language || null,
        updated_at: repo.updated_at,
        created_at: repo.created_at,
        has_readme: repo.has_readme !== undefined ? repo.has_readme : (repo.size > 0), // heuristics fallback
        license: repo.license ? repo.license.spdx_id || repo.license.name : "",
        homepage: repo.homepage || ""
      }));

      // 6. Aggregate Languages by repo sizes to save API calls
      const languages = {};
      repositories.forEach(repo => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + (repo.size || 10);
        }
      });

      const payload = { profile, repositories, languages };

      // 7. Save to cache
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: payload
      }));

      return {
        data: payload,
        fromCache: false,
        isDemo: false
      };
    } catch (error) {
      console.error("Fetch User Data Error:", error);
      throw error;
    }
  },

  updateRateLimit(headers) {
    if (!headers) return;
    const limit = headers.get("x-ratelimit-limit");
    const remaining = headers.get("x-ratelimit-remaining");
    const reset = headers.get("x-ratelimit-reset");

    if (limit) this.rateLimit.limit = parseInt(limit, 10);
    if (remaining) this.rateLimit.remaining = parseInt(remaining, 10);
    if (reset) {
      this.rateLimit.resetTime = new Date(parseInt(reset, 10) * 1000);
    }
  }
};
