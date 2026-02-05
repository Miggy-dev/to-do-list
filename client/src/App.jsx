import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
        username,
        password
      })
      console.log('Login response:', response.data)
      navigate('/home')
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message
      setError(errorMessage)
      console.log('Login failed:', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
      
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome</h1>
          <p className="text-slate-600 text-sm">Sign in to your account</p>
        </div>


        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-1000 p-8">
          {/* Email Input */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
              Email Address
            </label>
            <input
              type="text  "
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-2">
              Password
            </label>
            <input
              
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Forgot Password Link */}
          <div className="mb-8">
            <a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Forgot your password?
            </a>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg hover:bg-slate-800 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-slate-900 font-medium hover:underline transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
