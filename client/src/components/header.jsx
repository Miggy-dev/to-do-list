import { Link } from 'react-router-dom'

function Header({ title = 'TO DO LIST', showNav = true }) {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Logo/Title */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-2xl font-bold text-slate-900 hover:text-slate-700 transition-colors">
            {title}
          </Link>

        </div>

       
        
      </div>
    </header>
  )
}

export default Header