import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Register() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setIsLoading(true)
    const apiUrl = `${import.meta.env.VITE_API_URL}/register`;
    console.log('Attempting registration at:', apiUrl);
    
    try {
      const response = await axios.post(apiUrl, {
        name,
        username,
        password 
      })
      console.log('Registration response:', response.data)
      navigate('/')
    } catch (error) {
      console.log('Registration failed:', error.response?.data?.message || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-600 text-sm">Join us to get started</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-1000 p-8">
          {/* Name Input */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-slate-900 mb-2">
              Name
            </label>
            <input
             
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="migilito barbosa"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Username Input */}
          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-medium text-slate-900 mb-2">
              Email
            </label>
            <input
              
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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

          {/* Confirm Password Input */}
          {/* <div className="mb-8">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-900 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-colors text-slate-900 placeholder-slate-400"
            />
          </div> */}

          {/* Register Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg hover:bg-slate-800 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <a href="/" className="text-slate-900 font-medium hover:underline transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register