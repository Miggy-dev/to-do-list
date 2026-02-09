import Header from "../components/header";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Home() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("pending");
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/get-lists`);
      if (response.data.success) {
        setTasks(response.data.lists);
        setError(null);
      }
    } catch (err) {
      setError("Failed to fetch tasks");
      console.error("Error fetching tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setError("Task title cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/add-list`, {
        listtitle: newTaskTitle,
        status: newTaskStatus,
      });

      if (response.data.success) {
        setNewTaskTitle("");
        setNewTaskStatus("pending");
        setShowModal(false);
        setError(null);
        setTimeout(() => fetchTasks(), 500);
      } else {
        setError(response.data.message || "Failed to add task");
      }
    } catch (err) {
      console.error("Error adding task:", err);
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid input");
      } else if (err.response?.status === 500) {
        setError("Server error. Please ensure the server is running.");
      } else if (err.code === "ERR_NETWORK") {
        setError("Network error. Please check if the server is running.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to add task");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!editingTask?.title?.trim()) {
      setError("Task title cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/edit-list`, {
        id: editingTask.list_id,
        listtitle: editingTask.title,
      });

      if (response.data.success) {
        setEditingTask(null);
        setShowEditModal(false);
        setError(null);
        fetchTasks();
      } else {
        setError(response.data.message || "Failed to update task");
      }
    } catch (err) {
      console.error("Error editing task:", err);
      setError(err.response?.data?.message || "Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/delete-list`, {
        id: deletingTask.list_id,
      });

      if (response.data.success) {
        setDeletingTask(null);
        setShowDeleteModal(false);
        setError(null);
        fetchTasks();
      } else {
        setError(response.data.message || "Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      setError(err.response?.data?.message || "Failed to delete task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskClick = (task) => navigate("/list-item", { state: { task } });
  const openEditModal = (task) => { setEditingTask({ ...task }); setShowEditModal(true); };
  const openDeleteModal = (task) => { setDeletingTask(task); setShowDeleteModal(true); };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "in-progress": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "completed": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      default: return "bg-slate-50 text-slate-600 border border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="TaskFlow" showNav={true} />
      
      {/* Main Content with padding for fixed header */}
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">My Tasks</h1>
              <p className="text-slate-500 text-sm mt-1">Manage and organize your task lists</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5 px-5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && !showModal && !showEditModal && !showDeleteModal && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Tasks Container */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-600"></div>
              <p className="text-slate-500 text-sm mt-4">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium">No tasks yet</p>
              <p className="text-slate-400 text-sm mt-1">Create your first task to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task, index) => (
                    <tr key={task.id || index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                        {task.list_id?.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900">{task.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleTaskClick(task)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="View Items">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button onClick={() => openEditModal(task)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => openDeleteModal(task)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Create New Task</h3>
            </div>
            <form onSubmit={handleAddTask} className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
              )}
              <div className="mb-4">
                <label htmlFor="taskTitle" className="block text-sm font-medium text-slate-700 mb-2">Task Title</label>
                <input
                  id="taskTitle"
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => { setNewTaskTitle(e.target.value); setError(null); }}
                  placeholder="Enter task title..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div className="mb-6">
                <label htmlFor="taskStatus" className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  id="taskStatus"
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm bg-white"
                  disabled={isSubmitting}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowModal(false); setNewTaskTitle(""); setNewTaskStatus("pending"); setError(null); }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Edit Task</h3>
            </div>
            <form onSubmit={handleEditTask} className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
              )}
              <div className="mb-6">
                <label htmlFor="editTaskTitle" className="block text-sm font-medium text-slate-700 mb-2">Task Title</label>
                <input
                  id="editTaskTitle"
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => { setEditingTask({ ...editingTask, title: e.target.value }); setError(null); }}
                  placeholder="Enter task title..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingTask(null); setError(null); }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Delete Task</h3>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
              )}
              <p className="text-slate-600 text-sm mb-6">
                Are you sure you want to delete <span className="font-semibold text-slate-900">"{deletingTask.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowDeleteModal(false); setDeletingTask(null); setError(null); }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="button" onClick={handleDeleteTask}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50" disabled={isSubmitting}>
                  {isSubmitting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;