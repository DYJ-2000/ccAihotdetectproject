import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
  LayoutDashboard,
  Search,
  Key,
  RefreshCw,
  Bell,
  Home,
  Sun,
  Moon
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Keywords from './pages/Keywords'
import SearchPage from './pages/Search'
import Check from './pages/Check'

const { Header, Sider, Content } = Layout

function App() {
  const location = useLocation()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  // 主题状态管理
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 从localStorage读取主题设置，默认为false（日间模式）
    return localStorage.getItem('theme') === 'dark'
  })

  // 主题切换函数
  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications/count/unread')
      const data = await res.json()
      setNotifications(data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const menuItems = [
    { path: '/', icon: <Home size={20} />, label: '首页' },
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: '仪表盘' },
    { path: '/keywords', icon: <Key size={20} />, label: '关键词管理' },
    { path: '/search', icon: <Search size={20} />, label: '搜索' },
    { path: '/check', icon: <RefreshCw size={20} />, label: '立即检查' }
  ]

  return (
    <Layout className={isDarkMode ? 'dark' : ''} style={{ minHeight: '100vh' }}>
      <Header className="flex items-center justify-between px-6 bg-white dark:bg-gray-800">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-blue-600 mr-8">
            AI 热点检测工具
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* 主题切换按钮 */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 rounded-full"
            title={isDarkMode ? '切换到日间模式' : '切换到夜间模式'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-full relative"
            >
              <Bell size={24} />
              {notifications.count > 0 && (
                <span className="notification-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.count > 9 ? '9+' : notifications.count}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-semibold">通知</h3>
                  {notifications.count > 0 && (
                    <button
                      onClick={async () => {
                        await fetch('/api/notifications/read-all', { method: 'PUT' })
                        fetchNotifications()
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      全部已读
                    </button>
                  )}
                </div>
                <NotificationPanel />
              </div>
            )}
          </div>
        </div>
      </Header>

      <Layout>
        <Sider width={200} className="bg-white dark:bg-gray-800 dark:border-gray-700">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            className="dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800"
            theme={isDarkMode ? 'dark' : 'light'}
            defaultSelectedKeys={[location.pathname]}
          >
            {menuItems.map(item => (
              <Menu.Item key={item.path}>
                <Link to={item.path} className="flex items-center">
                  {item.icon}
                  <span className="ml-2 dark:text-gray-300">{item.label}</span>
                </Link>
              </Menu.Item>
            ))}
          </Menu>
        </Sider>

        <Content className="p-6 bg-gray-50 dark:bg-gray-900">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/keywords" element={<Keywords />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/check" element={<Check />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

function NotificationPanel() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' })
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  if (notifications.length === 0) {
    return <div className="p-4 text-center text-gray-500">暂无通知</div>
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notif.isRead ? 'bg-blue-50' : ''}`}
          onClick={() => markAsRead(notif.id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium text-sm">{notif.hotspot?.title}</p>
              <p className="text-xs text-gray-500 mt-1">
                来源: {notif.hotspot?.source} · {new Date(notif.createdAt).toLocaleString()}
              </p>
            </div>
            {!notif.isRead && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default App
