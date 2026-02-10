import { useState } from 'react'
import { Search as SearchIcon, ExternalLink, Hash, Eye, Heart } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
      alert('搜索失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">搜索热点</h1>

      <div className="card p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入关键词搜索热点..."
              className="pl-10 input"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '搜索中...' : '搜索'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="text-center py-8">搜索中...</div>
      )}

      {!loading && searched && (
        <div>
          <div className="text-sm text-gray-600 mb-4">
            找到 {results.length} 条结果
          </div>

          {results.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              未找到相关热点
            </div>
          ) : (
            <div className="space-y-4">
              {results.map(hotspot => (
                <SearchResult key={hotspot.id} hotspot={hotspot} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SearchResult({ hotspot }) {
  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">{hotspot.title}</h3>
          {hotspot.content && (
            <p className="text-gray-600 mb-3">{hotspot.content}</p>
          )}
          <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              {hotspot.source}
            </span>
            <span>
              {new Date(hotspot.createdAt).toLocaleString('zh-CN')}
            </span>
            {hotspot.relevanceScore > 0 && (
              <span className="text-primary">
                相关度: {(hotspot.relevanceScore * 100).toFixed(0)}%
              </span>
            )}
          </div>
          {/* Metrics */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
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
                <span key={kw.id} className="inline-flex items-center text-xs">
                  <Hash size={12} className="mr-1 text-gray-400" />
                  <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                    {kw.keyword}
                  </span>
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
            className="ml-4 p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-primary transition-colors"
            title="AI 生成链接，点击前请验证"
          >
            <ExternalLink size={20} />
          </a>
        )}
      </div>
    </div>
  )
}
