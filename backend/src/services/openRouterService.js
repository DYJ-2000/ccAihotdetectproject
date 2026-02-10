const axios = require('axios');
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

class OpenRouterService {
  async searchHotspots(keyword) {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: 'openrouter/free',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant that helps identify hot trends and topics. Provide trending information in JSON format with realistic URLs and metrics from popular platforms like GitHub, Twitter, Reddit, TechCrunch, etc.'
            },
            {
              role: 'user',
              content: `Find the latest hotspots and trending information about: ${keyword}.

Return in valid JSON format with these fields:
- title: The headline
- content: Brief summary (2-3 sentences)
- source_url: Direct URL to the source article/post/page
- source: Platform name (e.g., Twitter, GitHub, Reddit, TechCrunch)
- relevance_score: Float between 0-1
- published_date: ISO date string
- views: Estimated view count (optional)
- likes: Estimated like/upvote count (optional)

Provide realistic, verifiable URLs from actual platforms.`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'AI Hotspot Detection Tool'
          }
        }
      );

      const content = response.data.choices[0].message.content;

      // Try to parse JSON from response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Failed to parse JSON from OpenRouter response');
      }

      // Fallback: return structured data from text
      return {
        title: `Hotspot about ${keyword}`,
        content: content,
        source: 'OpenRouter',
        sourceUrl: null,
        relevanceScore: 0.8,
        publishedDate: new Date().toISOString(),
        views: 0,
        likes: 0
      };
    } catch (error) {
      console.error('OpenRouter API error:', error.response?.data || error.message);
      throw new Error(`OpenRouter API error: ${error.message}`);
    }
  }

  async analyzeRelevance(hotspot, keyword) {
    if (!OPENROUTER_API_KEY) {
      return 0.5; // Default score when API is not configured
    }

    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: 'openrouter/free',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant that scores relevance between content and keywords on a scale of 0 to 1.'
            },
            {
              role: 'user',
              content: `On a scale of 0 to 1, how relevant is this content to the keyword "${keyword}"?\n\nContent: ${hotspot.title}\n${hotspot.content || ''}\n\nRespond with just a number between 0 and 1.`
            }
          ],
          temperature: 0.3,
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const score = parseFloat(response.data.choices[0].message.content);
      return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score));
    } catch (error) {
      console.error('Error analyzing relevance:', error.message);
      return 0.5;
    }
  }
}

module.exports = new OpenRouterService();
