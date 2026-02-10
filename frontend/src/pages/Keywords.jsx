import { useState, useEffect } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react'

export default function Keywords() {
  const [keywords, setKeywords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [source, setSource] = useState('Both')

  useEffect(() => {
    fetchKeywords()
  }, [])

  const fetchKeywords = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/keywords')
      const data = await res.json()
      setKeywords(data)
    } catch (error) {
      console.error('Failed to fetch keywords:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeyword, source })
      })

      if (res.ok) {
        setNewKeyword('')
        setSource('Both')
        setShowAddModal(false)
        fetchKeywords()
      } else {
        const error = await res.json()
        alert(error.error || '添加失败')
      }
    } catch (error) {
      alert('添加失败: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个关键词吗？')) return

    try {
      await fetch(`/api/keywords/${id}`, { method: 'DELETE' })
      fetchKeywords()
    } catch (error) {
      alert('删除失败: ' + error.message)
    }
  }

  const handleToggle = async (keyword) => {
    try {
      await fetch(`/api/keywords/${keyword.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !keyword.isActive })
      })
      fetchKeywords()
    } catch (error) {
      alert('更新失败: ' + error.message)
    }
  }

  const getSourceLabel = (s) => {
    switch (s) {
      case 'OpenRouter': return 'OpenRouter'
      case 'GitHub': return 'GitHub'
      case 'Twitter': return 'Twitter'
      case 'Both': return '全部'
      default: return s
    }
  }

  const getSourceGradient = (s) => {
    switch (s) {
      case 'OpenRouter': return 'from-blue-400 to-blue-600'
      case 'GitHub': return 'from-green-400 to-green-600'
      case 'Twitter': return 'from-purple-400 to-purple-600'
      case 'Both': return 'from-gray-400 to-gray-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="section-title flex items-center gap-3 text-gray-900 dark:text-gray-100">
            <div className="bg-gradient-to-br from-primary to-secondary
                            p-2 rounded-xl shadow-glow">
              <Sparkles size={24} className="text-white" />
            </div>
            关键词管理
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2 shadow-glow"
        >
          <Plus size={20} />
          添加关键词
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : keywords.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10
                          p-8 rounded-full w-24 h-24 mx-auto mb-6">
            <Sparkles size={48} className="text-primary/50" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            暂无关键词，点击上方按钮添加
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100
                                dark:from-gray-800 dark:to-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    关键词
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    数据源
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    状态
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    添加时间
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {keywords.map(keyword => (
                  <tr key={keyword.id}
                          className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100
                                         dark:hover:from-gray-800/50 dark:hover:to-gray-700/50
                                         transition-all duration-300">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-base">
                        {keyword.keyword}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                                      bg-gradient-to-r ${getSourceGradient(keyword.source)}
                                      text-white shadow-md`}>
                        {getSourceLabel(keyword.source)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(keyword)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg
                                       transition-all duration-300 hover:scale-105
                                       ${keyword.isActive
                                         ? 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-600 dark:text-green-400'
                                         : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-400 dark:text-gray-500'
                                       }`}
                      >
                        {keyword.isActive ? (
                          <ToggleRight size={24} />
                        ) : (
                          <ToggleLeft size={24} />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {keyword.isActive ? '启用' : '禁用'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(keyword.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(keyword.id)}
                        className="p-2 hover:bg-gradient-to-br hover:from-red-100 hover:to-red-200
                                       dark:hover:from-red-900/30 dark:hover:to-red-800/30
                                       rounded-xl transition-all duration-300
                                       group"
                        title="删除"
                      >
                        <Trash2 size={18}
                                 className="text-gray-500 dark:text-gray-400
                                            group-hover:text-red-500 group-hover:scale-110 transition-all" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card w-full max-w-md shadow-2xl transform transition-all duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary
                                            bg-clip-text text-transparent flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Plus size={24} className="text-primary" />
                添加关键词
              </h2>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  关键词
                </label>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="input"
                  placeholder="输入要监控的关键词"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  数据源
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="input"
                >
                  <option value="Both">全部 (所有源)</option>
                  <option value="OpenRouter">OpenRouter</option>
                  <option value="GitHub">GitHub</option>
                  <option value="Twitter">Twitter</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewKeyword('')
                    setSource('Both')
                  }}
                  className="btn btn-outline"
                >
                  取消
                </button>
                <button type="submit" className="btn btn-primary shadow-glow">
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
