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
  const [newItemDesc, setNewItemDesc] = useState("");
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
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/get-items/${task.list_id}`
      );
      if (response.data.success) {
        setItems(response.data.items);
        setError(null);
      }
    } catch (err) {
      // If endpoint returns 404, just show empty state
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
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/add-item`,
        {
          listId: task.list_id,
          description: newItemDesc,
          status: "pending",
        }
      );

      if (response.data.success) {
        setNewItemDesc("");
        setShowModal(false);
        setError(null);
        
        setTimeout(() => {
          fetchItems();
        }, 500);
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
        setError("Network error. Please check if the server is running on port 3000.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to add item");
      }
    } finally {
      setIsSubmitting(false);
    }
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

  if (!task) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="TO DO LIST" showNav={true} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button and Task Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/home")}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Tasks
          </button>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{task.title}</h1>
            <p className="text-slate-600 text-sm flex items-center gap-2">
              <span className="font-medium">List ID:</span>
              <span className="font-mono">{task.list_id}</span>
            </p>
            <div className="mt-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                  task.status
                )}`}
              >
                {task.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-2"
          >
            <span>+</span>
            <span>Add Item</span>
          </button>
        </div>

        {/* Error Message - Only shown outside modal */}
        {error && !showModal && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Items</h2>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-slate-600 mt-4">Loading items...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg">
                  No items yet. Add one to get started!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Item ID
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 text-sm text-slate-700 font-mono">
                          {item.id?.substring(0, 8) || "N/A"}...
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          <p className="line-clamp-2">{item.description}</p>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              item.status
                            )}`}
                          >
                            {item.status || "pending"}
                          </span>
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

      {/* Add Item Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full animate-in">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Add New Item</h3>
            </div>
            <form onSubmit={handleAddItem} className="p-6">
              {/* Error message in modal */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="mb-6">
                <label
                  htmlFor="itemDesc"
                  className="block text-sm font-medium text-slate-900 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="itemDesc"
                  value={newItemDesc}
                  onChange={(e) => {
                    setNewItemDesc(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter item description..."
                  rows="4"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewItemDesc("");
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
                      Add Item
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

export default ListItem;