const { PrismaClient } = require('@prisma/client');
const openRouterService = require('./openRouterService');
const twitterService = require('./twitterService');
const githubService = require('./githubService');
const axios = require('axios');

const prisma = new PrismaClient();

// Validate URL by checking if it returns a valid response
async function validateUrl(url) {
  if (!url) return false;

  try {
    // Basic URL format validation
    const urlObj = new URL(url);

    // Skip certain domains that are known to be unreliable for AI-generated links
    const skipDomains = [
      'example.com',
      'test.com',
      'fake.com',
      'placeholder.com'
    ];

    if (skipDomains.includes(urlObj.hostname)) {
      return false;
    }

    // Only validate URLs from well-known platforms
    const validHosts = [
      'github.com',
      'twitter.com',
      'x.com',
      'reddit.com',
      'news.ycombinator.com',
      'techcrunch.com',
      'theverge.com',
      'wired.com',
      'medium.com',
      'dev.to',
      'youtube.com'
    ];

    return validHosts.includes(urlObj.hostname);
  } catch (e) {
    return false;
  }
}

class HotspotService {
  async checkHotspots() {
    const keywords = await prisma.keyword.findMany({
      where: { isActive: true }
    });

    let totalHotspotsFound = 0;

    for (const keyword of keywords) {
      try {
        const hotspots = [];

        // Check OpenRouter if configured
        if (keyword.source === 'OpenRouter' || keyword.source === 'Both') {
          try {
            const openRouterResult = await openRouterService.searchHotspots(keyword.keyword);
            if (openRouterResult) {
              hotspots.push({
                title: openRouterResult.title || `Hotspot about ${keyword.keyword}`,
                content: openRouterResult.content,
                source: 'OpenRouter',
                sourceUrl: openRouterResult.source_url || null,
                relevanceScore: openRouterResult.relevance_score || 0.8,
                matchedKeywords: JSON.stringify([keyword.keyword]),
                publishedAt: openRouterResult.published_date ? new Date(openRouterResult.published_date) : new Date(),
                views: openRouterResult.views || 0,
                likes: openRouterResult.likes || 0
              });
            }
          } catch (error) {
            console.error(`OpenRouter search failed for "${keyword.keyword}":`, error.message);
          }
        }

        // Check GitHub if configured
        if (keyword.source === 'GitHub' || keyword.source === 'Both') {
          try {
            const githubResults = await githubService.searchByKeyword(keyword.keyword);
            githubResults.forEach(result => {
              hotspots.push({
                title: result.title,
                content: result.content,
                source: result.source,
                sourceUrl: result.sourceUrl,
                relevanceScore: result.relevanceScore,
                publishedAt: result.publishedAt,
                views: result.views,
                likes: result.likes,
                matchedKeywords: JSON.stringify([keyword.keyword])
              });
            });
          } catch (error) {
            console.error(`GitHub search failed for "${keyword.keyword}":`, error.message);
          }
        }

        // Check Twitter if configured
        if (keyword.source === 'Twitter' || keyword.source === 'Both') {
          try {
            const twitterResults = await twitterService.searchTweets(keyword.keyword);
            for (const result of twitterResults) {
              hotspots.push({
                ...result,
                source: 'Twitter'
              });
            }
          } catch (error) {
            console.error(`Twitter search failed for "${keyword.keyword}":`, error.message);
          }
        }

        // Save hotspots to database
        for (const hotspotData of hotspots) {
          // Check if similar hotspot already exists (within 24 hours)
          const existingHotspot = await prisma.hotspot.findFirst({
            where: {
              title: hotspotData.title,
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
              }
            }
          });

          if (!existingHotspot) {
            // Validate source URL if present
            let validatedSourceUrl = hotspotData.sourceUrl;
            if (hotspotData.sourceUrl) {
              const isValidUrl = await validateUrl(hotspotData.sourceUrl);
              validatedSourceUrl = isValidUrl ? hotspotData.sourceUrl : null;
            }

            const hotspot = await prisma.hotspot.create({
              data: {
                ...hotspotData,
                sourceUrl: validatedSourceUrl,
                keywords: {
                  connect: { id: keyword.id }
                }
              }
            });

            // Create notification for new hotspot
            await prisma.notification.create({
              data: {
                hotspotId: hotspot.id
              }
            });

            totalHotspotsFound++;
          }
        }
      } catch (error) {
        console.error(`Error processing keyword "${keyword.keyword}":`, error.message);
      }
    }

    // Record check history
    await prisma.checkHistory.create({
      data: {
        status: 'success',
        keywordsChecked: keywords.length,
        hotspotsFound: totalHotspotsFound
      }
    });

    return {
      keywordsChecked: keywords.length,
      hotspotsFound: totalHotspotsFound
    };
  }

  async searchHotspots(query) {
    return await prisma.hotspot.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { content: { contains: query } }
        ]
      },
      include: {
        keywords: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  async getStatistics() {
    const totalHotspots = await prisma.hotspot.count();
    const activeKeywords = await prisma.keyword.count({ where: { isActive: true } });
    const unreadNotifications = await prisma.notification.count({ where: { isRead: false } });
    const recentHotspots = await prisma.hotspot.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    // Get hotspot distribution by source
    const bySource = await prisma.hotspot.groupBy({
      by: ['source'],
      _count: true
    });

    return {
      totalHotspots,
      activeKeywords,
      unreadNotifications,
      recentHotspots,
      bySource: bySource.reduce((acc, item) => {
        acc[item.source] = item._count;
        return acc;
      }, {})
    };
  }
}

module.exports = new HotspotService();
