const axios = require('axios');

const GITHUB_API_URL = 'https://api.github.com';

class GithubService {
  constructor() {
    this.isEnabled = true; // No API key needed for trending
  }

  async searchTrending(language = null, topic = null) {
    console.log('Searching GitHub trending repositories...');

    try {
      // Construct trending query
      let path = '/search/repositories';
      let params = {
        q: 'stars:>100',
        sort: 'stars',
        order: 'desc',
        per_page: 10
      };

      // Add filters if provided
      if (topic) {
        params.q += ` topic:${topic}`;
      }
      if (language) {
        params.q += ` language:${language}`;
      }

      const response = await axios.get(`${GITHUB_API_URL}${path}`, {
        params,
        timeout: 5000
      });

      const repos = response.data.items || [];

      return repos.map(repo => ({
        id: repo.id,
        title: repo.full_name,
        content: repo.description || 'No description available',
        source: 'GitHub',
        sourceUrl: repo.html_url,
        relevanceScore: 0.9,
        publishedDate: new Date(repo.created_at),
        views: 0, // GitHub doesn't provide view count
        likes: repo.stargazers_count,
        metrics: {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          updated_at: repo.updated_at
        }
      }));

    } catch (error) {
      console.error('GitHub API error:', error.message);
      return [];
    }
  }

  async searchByKeyword(keyword) {
    console.log(`Searching GitHub for: ${keyword}`);

    try {
      const response = await axios.get(`${GITHUB_API_URL}/search/repositories`, {
        params: {
          q: `${keyword} stars:>50`,
          sort: 'stars',
          order: 'desc',
          per_page: 10
        },
        timeout: 5000
      });

      const repos = response.data.items || [];
      console.log(`Found ${repos.length} repositories for keyword: ${keyword}`);

      return repos.map(repo => ({
        title: repo.full_name,
        content: repo.description || `GitHub repository for ${keyword}`,
        source: 'GitHub',
        sourceUrl: repo.html_url,
        relevanceScore: 0.85,
        publishedAt: new Date(repo.created_at),
        views: 0,
        likes: repo.stargazers_count,
        // 保存GitHub特定信息到content中
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updatedAt: repo.updated_at
      }));

    } catch (error) {
      console.error(`GitHub search failed for "${keyword}":`, error.message);
      return [];
    }
  }
}

module.exports = new GithubService();
