import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { usersAPI, tasksAPI, authAPI } from '../api'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('tasks')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigned_to: '', priority: 'Medium', status: 'Pending' })
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'user' })
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState({ message: '', type: '' })

  const showMessage = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast({ message: '', type: '' }), 3000)
  }

  // Queries
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksAPI.getAll().then(res => res.data.tasks),
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll().then(res => res.data.users),
  })

  const tasks = tasksData || []
  const users = usersData || []
  const loading = tasksLoading || usersLoading

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (data) => tasksAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      showMessage('Task created successfully')
      setShowTaskModal(false)
      setTaskForm({ title: '', description: '', assigned_to: '', priority: 'Medium', status: 'Pending' })
    },
    onError: (err) => showMessage(err.response?.data?.error || 'Failed to create task', 'error'),
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => tasksAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      showMessage('Task updated successfully')
      setShowTaskModal(false)
      setEditingTask(null)
      setTaskForm({ title: '', description: '', assigned_to: '', priority: 'Medium', status: 'Pending' })
    },
    onError: (err) => showMessage(err.response?.data?.error || 'Failed to update task', 'error'),
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => tasksAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      showMessage('Task deleted successfully')
    },
    onError: (err) => showMessage(err.response?.data?.error || 'Failed to delete task', 'error'),
  })

  const createUserMutation = useMutation({
    mutationFn: (data) => authAPI.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showMessage('User created successfully')
      setShowUserModal(false)
      setUserForm({ username: '', email: '', password: '', role: 'user' })
    },
    onError: (err) => showMessage(err.response?.data?.error || 'Failed to create user', 'error'),
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id) => usersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      showMessage('User deleted successfully')
    },
    onError: (err) => showMessage(err.response?.data?.error || 'Failed to delete user', 'error'),
  })

  const handleCreateTask = (e) => {
    e.preventDefault()
    const payload = {
      ...taskForm,
      assigned_to: taskForm.assigned_to ? parseInt(taskForm.assigned_to) : null,
    }
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data: payload })
    } else {
      createTaskMutation.mutate(payload)
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      assigned_to: task.assigned_to || '',
      priority: task.priority,
      status: task.status,
    })
    setShowTaskModal(true)
  }

  const filteredTasks = tasks.filter(t => filter === 'all' || t.status === filter)

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
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
            <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/20">Admin</span>
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
          <button
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'tasks' ? 'bg-primary-500/15 text-blue-400' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}
            onClick={() => setActiveTab('tasks')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            Tasks
          </button>
          <button
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-primary-500/15 text-blue-400' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}
            onClick={() => setActiveTab('users')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            Users
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-9 h-9 border-[3px] border-primary-500/20 border-t-primary-500 rounded-full" style={{ animation: 'spin 0.6s linear infinite' }} />
            <p className="text-slate-500 text-sm">Loading...</p>
          </div>
        ) : activeTab === 'tasks' ? (
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

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-1.5 bg-dark-900/40 p-1 rounded-xl">
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
              <button
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-primary-500 to-accent-500 border-none rounded-xl text-white text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(59,130,246,0.25)]"
                onClick={() => {
                  setEditingTask(null)
                  setTaskForm({ title: '', description: '', assigned_to: '', priority: 'Medium', status: 'Pending' })
                  setShowTaskModal(true)
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                New Task
              </button>
            </div>

            {/* Tasks list */}
            <div className="flex flex-col gap-3">
              {filteredTasks.length === 0 ? (
                <div className="flex items-center justify-center py-16"><p className="text-slate-500 text-[15px]">No tasks found</p></div>
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
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                          {task.assigned_to_name || 'Unassigned'}
                        </span>
                        <span className="flex items-center gap-1.5 text-[13px] text-slate-500">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button className="w-9 h-9 rounded-lg border-none flex items-center justify-center cursor-pointer transition-all bg-primary-500/10 text-blue-400 hover:bg-primary-500/20" onClick={() => handleEditTask(task)} title="Edit task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="w-9 h-9 rounded-lg border-none flex items-center justify-center cursor-pointer transition-all bg-red-500/10 text-red-300 hover:bg-red-500/20" onClick={() => { if (window.confirm('Are you sure you want to delete this task?')) deleteTaskMutation.mutate(task.id) }} title="Delete task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="tab-content">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-200">All Users ({users.length})</h2>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-primary-500 to-accent-500 border-none rounded-xl text-white text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(59,130,246,0.25)]" onClick={() => setShowUserModal(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                New User
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u) => (
                <div key={u.id} className="p-5 bg-dark-800/60 border border-white/[0.08] rounded-2xl transition-all hover:border-white/[0.15]">
                  <div className="flex items-center gap-3.5 mb-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">{u.username}</h3>
                      <p className="text-[13px] text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.08]">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${u.role === 'admin' ? 'bg-amber-500/15 text-amber-400' : 'bg-primary-500/15 text-blue-400'}`}>{u.role}</span>
                    <span className="text-[13px] text-slate-500">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                  {u.role !== 'admin' && (
                    <div className="flex justify-end mt-3 pt-3 border-t border-white/[0.08]">
                      <button className="w-9 h-9 rounded-lg border-none flex items-center justify-center cursor-pointer transition-all bg-red-500/10 text-red-300 hover:bg-red-500/20" onClick={() => { if (window.confirm('Are you sure you want to delete this user?')) deleteUserMutation.mutate(u.id) }} title="Delete user">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-5" onClick={() => setShowTaskModal(false)}>
          <div className="bg-dark-800 border border-white/10 rounded-[20px] w-full max-w-[520px] shadow-[0_25px_50px_rgba(0,0,0,0.4)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-7 pt-6 pb-0">
              <h2 className="text-xl font-bold text-slate-100">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button className="w-9 h-9 rounded-[10px] border-none bg-white/10 text-slate-400 text-xl cursor-pointer flex items-center justify-center transition-all hover:bg-white/20 hover:text-slate-200" onClick={() => setShowTaskModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateTask} className="px-7 pb-7 pt-6 flex flex-col gap-4.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Title *</label>
                <input type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required placeholder="Enter task title" className="px-3.5 py-2.5 border border-white/20 rounded-xl bg-dark-900/60 text-slate-100 text-sm transition-all outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-slate-500 font-[inherit]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} placeholder="Enter task description" rows="3" className="px-3.5 py-2.5 border border-white/20 rounded-xl bg-dark-900/60 text-slate-100 text-sm transition-all outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-slate-500 font-[inherit] resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">Assign To</label>
                  <select value={taskForm.assigned_to} onChange={e => setTaskForm({...taskForm, assigned_to: e.target.value})} className="px-3.5 py-2.5 border border-white/20 rounded-xl bg-dark-900/60 text-slate-100 text-sm transition-all outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] appearance-none cursor-pointer">
                    <option value="">Unassigned</option>
                    {users.filter(u => u.role === 'user').map(u => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} className="px-3.5 py-2.5 border border-white/20 rounded-xl bg-dark-900/60 text-slate-100 text-sm transition-all outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] appearance-none cursor-pointer">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Status</label>
                <select value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})} className="px-3.5 py-2.5 border border-white/20 rounded-xl bg-dark-900/60 text-slate-100 text-sm transition-all outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] appearance-none cursor-pointer">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end gap-2.5 mt-1">
                <button type="button" className="px-5 py-2.5 bg-white/10 border border-white/15 rounded-xl text-slate-400 text-sm font-medium cursor-pointer transition-all hover:bg-white/15 hover:text-slate-200" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-gradient-to-br from-primary-500 to-accent-500 border-none rounded-xl text-white text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(59,130,246,0.25)]">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-5" onClick={() => setShowUserModal(false)}>
          <div className="bg-dark-800 border border-white/10 rounded-[20px] w-full max-w-[520px] shadow-[0_25px_50px_rgba(0,0,0,0.4)]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-7 pt-6 pb-0">
              <h2 className="text-xl font-bold text-slate-100">Create New User</h2>
              <button className="w-9 h-9 rounded-[10px] border-none bg-white/10 text-slate-400 text-xl cursor-pointer flex items-center justify-center transition-all hover:bg-white/20 hover:text-slate-200" onClick={() => setShowUserModal(false)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createUserMutation.mutate(userForm) }} className="px-7 pb-7 pt-6 flex flex-col gap-4.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Username *</label>
                <input type="text" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required placeholder="Enter username" className="px-3.5 py-2.5 border border-white/20 rounded-xl bg-dark-900/60 text-slate-100 text-sm transition-all outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-slate-500 font-[inherit]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Email *</label>
                <input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required placeholder="Enter email" className="px-3.5 py-2.5 border border-white/20 rounded-xl bg-dark-900/60 text-slate-100 text-sm transition-all outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-slate-500 font-[inherit]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Password *</label>
                <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required placeholder="Enter password" minLength="6" className="px-3.5 py-2.5 border border-white/20 rounded-xl bg-dark-900/60 text-slate-100 text-sm transition-all outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-slate-500 font-[inherit]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Role</label>
                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="px-3.5 py-2.5 border border-white/20 rounded-xl bg-dark-900/60 text-slate-100 text-sm transition-all outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] appearance-none cursor-pointer">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2.5 mt-1">
                <button type="button" className="px-5 py-2.5 bg-white/10 border border-white/15 rounded-xl text-slate-400 text-sm font-medium cursor-pointer transition-all hover:bg-white/15 hover:text-slate-200" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-gradient-to-br from-primary-500 to-accent-500 border-none rounded-xl text-white text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(59,130,246,0.25)]">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
