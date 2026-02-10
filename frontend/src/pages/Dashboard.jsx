import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { TrendingUp, Hash, Bell, Activity, ExternalLink, Eye, Heart, Info } from 'lucide-react'

// 添加暗色模式文本颜色
const textColor = 'text-gray-900 dark:text-gray-100'
const secondaryTextColor = 'text-gray-600 dark:text-gray-400'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [latestHotspots, setLatestHotspots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, hotspotsRes] = await Promise.all([
        fetch('/api/hotspots/statistics'),
        fetch('/api/hotspots/dashboard/latest?limit=10')
      ])

      const statsData = await statsRes.json()
      const hotspotsData = await hotspotsRes.json()

      setStats(statsData)
      setLatestHotspots(hotspotsData)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <div className="flex items-start">
          <Info size={20} className="text-blue-600 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">关于热点数据来源</p>
            <p>• <strong>OpenRouter</strong> 数据由 AI 模型生成，链接和指标为估算值</p>
            <p>• <strong>GitHub</strong> 数据为真实仓库（包含真实 stars 和 forks）</p>
            <p>• <strong>Twitter</strong> 数据为真实推文（需配置 API）</p>
            <p className="text-xs text-blue-600 mt-2">点击外部链接前请自行验证有效性</p>
          </div>
        </div>
      </div>

      <h1 className={`text-2xl font-bold mb-4 ${textColor}`}>仪表盘</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总热点数"
          value={stats?.totalHotspots || 0}
          icon={<TrendingUp className="text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title="活跃关键词"
          value={stats?.activeKeywords || 0}
          icon={<Hash className="text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          title="未读通知"
          value={stats?.unreadNotifications || 0}
          icon={<Bell className="text-purple-600" />}
          color="bg-purple-50"
        />
        <StatCard
          title="24小时热点"
          value={stats?.recentHotspots || 0}
          icon={<Activity className="text-orange-500" />}
          color="bg-orange-50"
        />
      </div>

      {/* Source Distribution */}
      {stats?.bySource && Object.keys(stats.bySource).length > 0 && (
        <div className="card p-6">
          <h2 className={`text-lg font-semibold mb-4 ${textColor}`}>来源分布</h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(stats.bySource).map(([source, count]) => (
              <div key={source} className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {source}
                </span>
                <span className={secondaryTextColor}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest Hotspots */}
      <div className="card">
        <div className="p-6 border-b">
          <h2 className={`text-lg font-semibold ${textColor}`}>最新热点</h2>
        </div>
        <div className="divide-y">
          {latestHotspots.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              暂无热点数据，请先添加关键词并执行检查
            </div>
          ) : (
            latestHotspots.map(hotspot => (
              <HotspotItem key={hotspot.id} hotspot={hotspot} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`${color} p-6 rounded-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  )
}

function HotspotItem({ hotspot }) {
  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={`font-medium text-lg mb-2 ${textColor}`}>{hotspot.title}</h3>
          {hotspot.content && (
            <p className={`text-sm mb-3 line-clamp-2 ${secondaryTextColor}`}>{hotspot.content}</p>
          )}
          <div className={`flex items-center space-x-4 text-sm ${secondaryTextColor}`}>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              {hotspot.source}
            </span>
            <span>
              {format(new Date(hotspot.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
            </span>
            {hotspot.relevanceScore > 0 && (
              <span>相关度: {(hotspot.relevanceScore * 100).toFixed(0)}%</span>
            )}
          </div>
          {/* Metrics: Views and Likes */}
          <div className={`flex items-center space-x-4 text-sm ${secondaryTextColor} mt-2`}>
            {hotspot.views > 0 && (
              <span className="flex items-center">
                <Eye size={16} className="mr-1" />
                {hotspot.views.toLocaleString()}
              </span>
            )}
            {hotspot.likes > 0 && (
              <span className="flex items-center">
                <Heart size={16} className="mr-1" />
                {hotspot.likes.toLocaleString()}
              </span>
            )}
            {(hotspot.views === 0 && hotspot.likes === 0) && (
              <span className="text-gray-400">数据待更新</span>
            )}
          </div>
          {hotspot.keywords && hotspot.keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {hotspot.keywords.map(kw => (
                <span key={kw.id} className="px-2 py-1 bg-gray-100 rounded text-xs">
                  #{kw.keyword}
                </span>
              ))}
            </div>
          )}
        </div>
        {hotspot.sourceUrl && (
          <a
            href={hotspot.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="访问原始链接"
          >
            <ExternalLink size={20} className="text-gray-500" />
          </a>
        )}
      </div>
    </div>
  )
}
