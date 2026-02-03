import Header from "../components/header";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Home() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fetch tasks on component mount
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
      
      const apiUrl = `${import.meta.env.VITE_API_URL}/add-list`;
      console.log("Making request to:", apiUrl);
      console.log("Payload:", { listtitle: newTaskTitle });
      
      const response = await axios.post(apiUrl, {
        listtitle: newTaskTitle,
      });

      console.log("Response:", response.data);
      
      if (response.data.success) {
        setNewTaskTitle("");
        setShowModal(false);
        setError(null);
        
        // Refresh the task list
        setTimeout(() => {
          fetchTasks();
        }, 500);
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
        setError("Network error. Please check if the server is running on port 3000.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to add task");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskClick = (task) => {
    navigate("/list-item", { state: { task } });
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="TO DO LIST" showNav={true} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-2"
          >
            <span>+</span>
            <span>Add New Task</span>
          </button>
        </div>

        {/* Error Message - Only shown outside modal */}
        {error && !showModal && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tasks Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Tasks</h2>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-slate-600 mt-4">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg">No tasks yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">List ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, index) => (
                      <tr
                        key={task.id || index}
                        className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 text-sm text-slate-700 font-mono">
                          {task.list_id?.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                          {task.title}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleTaskClick(task)}
                            className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-150 font-medium"
                          >
                            View Items
                            <span className="ml-2">→</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Task Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full animate-in">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Add New Task</h3>
            </div>
            <form onSubmit={handleAddTask} className="p-6">
              {/* Error message in modal */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="mb-6">
                <label
                  htmlFor="taskTitle"
                  className="block text-sm font-medium text-slate-900 mb-2"
                >
                  Task Title
                </label>
                <input
                  id="taskTitle"
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => {
                    setNewTaskTitle(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter task title..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewTaskTitle("");
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-150 font-medium disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <span>+</span>
                      Add Task
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;