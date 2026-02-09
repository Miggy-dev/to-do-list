import Header from "../components/header";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function ListItem() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newItemDesc, setNewItemDesc] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const task = location.state?.task;

  useEffect(() => {
    if (!task) {
      navigate("/home");
      return;
    }
    fetchItems();
  }, [task, navigate]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/get-items/${task.list_id}`);
      if (response.data.success) {
        setItems(response.data.items);
        setError(null);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setItems([]);
      } else {
        setError("Failed to fetch items");
        console.error("Error fetching items:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemDesc.trim()) {
      setError("Item description cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/add-item`, {
        listId: task.list_id,
        description: newItemDesc,
        status: "pending",
      });

      if (response.data.success) {
        setNewItemDesc("");
        setShowModal(false);
        setError(null);
        setTimeout(() => fetchItems(), 500);
      } else {
        setError(response.data.message || "Failed to add item");
      }
    } catch (err) {
      console.error("Error adding item:", err);
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid input");
      } else if (err.response?.status === 500) {
        setError("Server error. Please ensure the server is running.");
      } else if (err.code === "ERR_NETWORK") {
        setError("Network error. Please check if the server is running.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to add item");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    if (!editingItem?.description?.trim()) {
      setError("Item description cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/edit-item`, {
        id: editingItem.id,
        description: editingItem.description,
        status: editingItem.status,
      });

      if (response.data.success) {
        setEditingItem(null);
        setShowEditModal(false);
        setError(null);
        fetchItems();
      } else {
        setError(response.data.message || "Failed to update item");
      }
    } catch (err) {
      console.error("Error editing item:", err);
      setError(err.response?.data?.message || "Failed to update item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/delete-item`, {
        id: deletingItem.id,
      });

      if (response.data.success) {
        setDeletingItem(null);
        setShowDeleteModal(false);
        setError(null);
        fetchItems();
      } else {
        setError(response.data.message || "Failed to delete item");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      setError(err.response?.data?.message || "Failed to delete item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (item) => { setEditingItem({ ...item }); setShowEditModal(true); };
  const openDeleteModal = (item) => { setDeletingItem(item); setShowDeleteModal(true); };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "in-progress": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "completed": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      default: return "bg-slate-50 text-slate-600 border border-slate-200";
    }
  };

  if (!task) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="TaskFlow" showNav={true} />
      
      {/* Main Content with padding for fixed header */}
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium mb-6 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Tasks
        </button>

        {/* Task Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 mb-2">{task.title}</h1>
              <p className="text-slate-500 text-sm font-mono">ID: {task.list_id}</p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
              {task.status}
            </span>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Items</h2>
            <p className="text-slate-500 text-sm mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} in this task</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5 px-5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Item
          </button>
        </div>

        {/* Error Message */}
        {error && !showModal && !showEditModal && !showDeleteModal && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Items Container */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-600"></div>
              <p className="text-slate-500 text-sm mt-4">Loading items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium">No items yet</p>
              <p className="text-slate-400 text-sm mt-1">Add your first item to this task</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                        {item.id?.substring(0, 8) || "N/A"}...
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900 line-clamp-2">{item.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                          {item.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditModal(item)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => openDeleteModal(item)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Add New Item</h3>
            </div>
            <form onSubmit={handleAddItem} className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
              )}
              <div className="mb-6">
                <label htmlFor="itemDesc" className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  id="itemDesc"
                  value={newItemDesc}
                  onChange={(e) => { setNewItemDesc(e.target.value); setError(null); }}
                  placeholder="Enter item description..."
                  rows="4"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm resize-none"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowModal(false); setNewItemDesc(""); setError(null); }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Edit Item</h3>
            </div>
            <form onSubmit={handleEditItem} className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
              )}
              <div className="mb-4">
                <label htmlFor="editItemDesc" className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  id="editItemDesc"
                  value={editingItem.description}
                  onChange={(e) => { setEditingItem({ ...editingItem, description: e.target.value }); setError(null); }}
                  placeholder="Enter item description..."
                  rows="4"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm resize-none"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div className="mb-6">
                <label htmlFor="editItemStatus" className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  id="editItemStatus"
                  value={editingItem.status || "pending"}
                  onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm bg-white"
                  disabled={isSubmitting}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingItem(null); setError(null); }}
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
      {showDeleteModal && deletingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Delete Item</h3>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
              )}
              <p className="text-slate-600 text-sm mb-4">Are you sure you want to delete this item? This action cannot be undone.</p>
              <div className="bg-slate-50 rounded-lg p-3 mb-6 border border-slate-100">
                <p className="text-sm text-slate-700 line-clamp-3">{deletingItem.description}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowDeleteModal(false); setDeletingItem(null); setError(null); }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="button" onClick={handleDeleteItem}
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

export default ListItem;