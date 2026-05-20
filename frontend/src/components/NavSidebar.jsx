import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/alerts',    label: 'Alerts',    icon: '🔔' },
  { to: '/overlays',  label: 'Overlays',  icon: '🎨' },
  { to: '/chatbot',   label: 'Chatbot',   icon: '🤖' },
  { to: '/loyalty',   label: 'Loyalty',   icon: '⭐' },
  { to: '/settings',  label: 'Settings',  icon: '⚙️' },
]

export default function NavSidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="flex w-56 flex-col border-r border-gray-800 bg-gray-900 py-6">
      <div className="px-5 mb-8">
        <span className="text-lg font-bold text-purple-400">🎮 SEbutkinda</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-800 px-4 pt-4">
        {user?.profileImage && (
          <img src={user.profileImage} alt="" className="mb-2 h-8 w-8 rounded-full" />
        )}
        <p className="mb-2 text-sm font-medium text-white truncate">{user?.displayName}</p>
        <button
          onClick={logout}
          className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-400 hover:bg-red-900 hover:text-white transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  )
}