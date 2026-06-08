import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { tasksAPI } from '../api'

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState({ message: '', type: '' })

  const showMessage = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: '' }), 3000)
  }

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksAPI.getAll().then(res => res.data.tasks),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => tasksAPI.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      showMessage('Task status updated')
    },
    onError: (err) => showMessage(err.response?.data?.error || 'Failed to update task', 'error'),
  })

  const allTasks = tasks || []
  const filteredTasks = allTasks.filter(t => filter === 'all' || t.status === filter)

  const taskStats = {
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === 'Pending').length,
    inProgress: allTasks.filter(t => t.status === 'In Progress').length,
    completed: allTasks.filter(t => t.status === 'Completed').length,
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-dark-800/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl text-white">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 14l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Task Manager</h1>
            <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider bg-primary-500/15 text-blue-400 border border-primary-500/20">User</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-indigo-500 to-accent-500 flex items-center justify-center text-white font-semibold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </span>
            <span className="text-slate-200 font-medium text-sm">{user?.username}</span>
          </div>
          <button onClick={logout} className="px-5 py-2 bg-red-500/10 border border-red-500/20 rounded-[10px] text-red-300 text-sm font-medium cursor-pointer transition-all hover:bg-red-500/20 hover:border-red-500/40">Logout</button>
        </div>
      </header>

      {/* Toast */}
      {toast.message && (
        <div className={`fixed top-6 right-6 px-5 py-3.5 rounded-xl text-sm font-medium z-[2000] animate-[slideIn_0.3s_ease] ${
          toast.type === 'error'
            ? 'bg-red-500/15 border border-red-500/30 text-red-300'
            : 'bg-green-500/15 border border-green-500/30 text-green-300'
        }`}>
          {toast.message}
        </div>
      )}

      <main className="flex-1 p-6 lg:px-8 max-w-[1200px] mx-auto w-full">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-dark-900/50 p-1 rounded-2xl w-fit">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary-500/15 text-blue-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            My Tasks
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-9 h-9 border-[3px] border-primary-500/20 border-t-primary-500 rounded-full" style={{ animation: 'spin 0.6s linear infinite' }} />
            <p className="text-slate-500 text-sm">Loading tasks...</p>
          </div>
        ) : (
          <div className="tab-content">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Tasks', value: taskStats.total, color: 'bg-primary-500/10 text-blue-400', icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></> },
                { label: 'Pending', value: taskStats.pending, color: 'bg-amber-500/10 text-amber-400', icon: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></> },
                { label: 'In Progress', value: taskStats.inProgress, color: 'bg-accent-500/10 text-purple-400', icon: <><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></> },
                { label: 'Completed', value: taskStats.completed, color: 'bg-green-500/10 text-green-400', icon: <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></> },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-4 p-5 bg-dark-800/60 border border-white/[0.08] rounded-2xl transition-all hover:border-white/[0.15]">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{stat.icon}</svg>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold text-slate-100 leading-none">{stat.value}</span>
                    <span className="block text-[13px] text-slate-500 mt-1">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="flex gap-1.5 bg-dark-900/40 p-1 rounded-xl w-fit mb-5">
              {['all', 'Pending', 'In Progress', 'Completed'].map(f => (
                <button
                  key={f}
                  className={`px-3.5 py-1.5 bg-transparent border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all ${filter === f ? 'bg-primary-500/15 text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>

            {/* Tasks list */}
            <div className="flex flex-col gap-3">
              {filteredTasks.length === 0 ? (
                <div className="flex items-center justify-center py-16"><p className="text-slate-500 text-[15px]">No tasks assigned to you</p></div>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} className="flex items-start justify-between gap-4 p-5 bg-dark-800/60 border border-white/[0.08] rounded-2xl transition-all hover:border-white/[0.15]">
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                        <h3 className="text-base font-semibold text-slate-100">{task.title}</h3>
                        <div className="flex gap-2 shrink-0">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                            task.priority === 'High' ? 'bg-red-500/15 text-red-300' :
                            task.priority === 'Medium' ? 'bg-amber-500/15 text-amber-400' :
                            'bg-green-500/15 text-green-400'
                          }`}>{task.priority}</span>
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                            task.status === 'Pending' ? 'bg-amber-500/15 text-amber-400' :
                            task.status === 'In Progress' ? 'bg-accent-500/15 text-purple-400' :
                            'bg-green-500/15 text-green-400'
                          }`}>{task.status}</span>
                        </div>
                      </div>
                      {task.description && <p className="text-slate-400 text-sm leading-relaxed mb-2.5">{task.description}</p>}
                      <div className="flex gap-4 flex-wrap">
                        <span className="flex items-center gap-1.5 text-[13px] text-slate-500">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          Created {new Date(task.created_at).toLocaleDateString()}
                        </span>
                        {task.created_by_name && (
                          <span className="flex items-center gap-1.5 text-[13px] text-slate-500">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            Assigned by {task.created_by_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status change actions */}
                    <div className="flex shrink-0">
                      {task.status === 'Pending' && (
                        <button className="flex items-center gap-1.5 px-4 py-2 border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-all bg-accent-500/15 text-purple-400 hover:bg-accent-500/25" onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'In Progress' })}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          Start Task
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <button className="flex items-center gap-1.5 px-4 py-2 border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-all bg-green-500/15 text-green-400 hover:bg-green-500/25" onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'Completed' })}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          Complete
                        </button>
                      )}
                      {task.status === 'Completed' && (
                        <button className="flex items-center gap-1.5 px-4 py-2 border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-all bg-amber-500/15 text-amber-400 hover:bg-amber-500/25" onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'Pending' })}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
