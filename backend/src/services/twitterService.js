const axios = require('axios');
const https = require('https');

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TWITTER_API_URL = 'https://api.twitter.com/2';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

class TwitterService {
  constructor() {
    this.isEnabled = !!TWITTER_BEARER_TOKEN;
  }

  async searchTweets(keyword) {
    if (!this.isEnabled) {
      console.log('Twitter API not configured, skipping...');
      return [];
    }

    console.log(`Searching Twitter for: ${keyword}`);

    try {
      // Use recent search with proper query syntax
      const response = await axios.get(
        `${TWITTER_API_URL}/tweets/search/recent`,
        {
          params: {
            query: `${keyword} -is:retweet -is:reply`,
            max_results: 10,
            'tweet.fields': 'created_at,public_metrics,author_id',
            'expansions': 'author_id',
            'user.fields': 'username,verified'
          },
          headers: {
            'Authorization': `Bearer ${TWITTER_BEARER_TOKEN.replace(/%2B/g, '+').replace(/%3D/g, '=')}`,
            'Content-Type': 'application/json'
          },
          httpsAgent,
          timeout: 15000
        }
      );

      const tweets = response.data.data || [];
      const users = response.data.includes?.users || [];

      console.log(`Found ${tweets.length} tweets`);

      return tweets.map(tweet => {
        const user = users.find(u => u.id === tweet.author_id);
        return {
          id: tweet.id,
          title: user?.username ? `@${user.username}: ${tweet.text.substring(0, 80)}...` : `Tweet about ${keyword}`,
          content: tweet.text,
          source: 'Twitter',
          sourceUrl: `https://twitter.com/${user?.username || 'i'}/status/${tweet.id}`,
          relevanceScore: 0.8,
          publishedAt: new Date(tweet.created_at),
          views: 0, // Twitter doesn't provide view count
          likes: tweet.public_metrics?.like_count || 0
        };
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.error('Twitter API authentication failed. Please check your bearer token.');
        throw new Error('Twitter API authentication failed. Please check your bearer token.');
      }
      if (error.response?.status === 429) {
        console.error('Twitter API rate limit exceeded. Please try again later.');
        throw new Error('Twitter API rate limit exceeded. Please try again later.');
      }
      if (error.code === 'ECONNABORTED') {
        console.error('Twitter API request timeout');
        throw new Error('Twitter API request timeout. Please try again.');
      }
      console.error('Twitter API error:', error.response?.data || error.message);
      throw new Error(`Twitter API error: ${error.message}`);
    }
  }

  async getTrendingTopics(woeId = 1) {
    if (!this.isEnabled) {
      throw new Error('Twitter API not configured');
    }

    try {
      const response = await axios.get(
        `${TWITTER_API_URL}/trends/list.json`,
        {
          params: { id: woeId },
          headers: {
            'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data[0]?.trends || [];
    } catch (error) {
      console.error('Error fetching Twitter trends:', error.message);
      throw new Error(`Twitter trends error: ${error.message}`);
    }
  }
}

module.exports = new TwitterService();
