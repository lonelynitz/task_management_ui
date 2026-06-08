import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-5">
      <div className="bg-dark-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-12 w-full max-w-md shadow-2xl">
        <div className="text-center mb-9">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-5 text-white">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 14l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Task Manager</h1>
          <p className="text-slate-400 text-[15px]">Sign in to manage your tasks</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-danger-500/10 border border-danger-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-medium text-slate-300">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
              className="px-4 py-3 border border-white/20 rounded-xl bg-dark-900/60 text-slate-100 text-[15px] transition-all duration-200 outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="px-4 py-3 border border-white/20 rounded-xl bg-dark-900/60 text-slate-100 text-[15px] transition-all duration-200 outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-3.5 bg-gradient-to-br from-primary-500 to-accent-500 border-none rounded-xl text-white text-base font-semibold cursor-pointer transition-all duration-200 mt-1 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_25px_rgba(59,130,246,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.6s linear infinite' }} />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-7 text-center pt-5 border-t border-white/10">
          <p className="text-slate-500 text-[13px]">
            Demo credentials: <strong className="text-slate-300 bg-primary-500/10 px-2 py-0.5 rounded-md text-[13px]">admin</strong> / <strong className="text-slate-300 bg-primary-500/10 px-2 py-0.5 rounded-md text-[13px]">admin123</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
