import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function Check() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/check/history?limit=20')
      const data = await res.json()
      setHistory(data)
    } catch (error) {
      console.error('Failed to fetch history:', error)
    }
  }

  const handleCheck = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/check', { method: 'POST' })
      const data = await res.json()
      setResult(data)
      fetchHistory()
    } catch (error) {
      alert('检查失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={24} className="text-green-500" />
      case 'failure':
        return <XCircle size={24} className="text-red-500" />
      default:
        return <Clock size={24} className="text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">立即检查</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check Panel */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">手动触发热点抓取</h2>
          <p className="text-gray-600 mb-6">
            点击下方按钮将立即对所有启用的关键词执行热点检测
          </p>

          <button
            onClick={handleCheck}
            disabled={loading}
            className={`w-full btn btn-primary flex items-center justify-center gap-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
            {loading ? '检查中...' : '开始检查'}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">检查完成</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>已检查关键词: {result.keywordsChecked}</p>
                <p>发现新热点: {result.hotspotsFound}</p>
              </div>
            </div>
          )}
        </div>

        {/* History Panel */}
        <div className="card">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">检查历史</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-8 text-center text-gray-500">暂无历史记录</div>
            ) : (
              history.map(record => (
                <HistoryItem key={record.id} record={record} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoryItem({ record }) {
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`

    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(() => {
            switch (record.status) {
              case 'success':
                return <CheckCircle size={20} className="text-green-500" />
              case 'failure':
                return <XCircle size={20} className="text-red-500" />
              default:
                return <Clock size={20} className="text-gray-400" />
            }
          })()}
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {record.status === 'success' ? '检查成功' : '检查失败'}
            </p>
            {record.message && (
              <p className="text-sm text-gray-500">{record.message}</p>
            )}
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>{formatTime(record.createdAt)}</p>
          {record.status === 'success' && (
            <p className="text-xs text-gray-400">
              {record.keywordsChecked} 个关键词, {record.hotspotsFound} 个热点
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
