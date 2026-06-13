import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  CalendarDays,
  UserPlus
} from 'lucide-react';
import api from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import NotificationToast from '../components/NotificationToast';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    gender: 'male',
    mobileNumber: '',
    email: '',
    address: '',
    notes: '', // initial note for adding
  });

  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Load clients list
  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/clients', {
        params: {
          search,
          gender,
          page,
          limit: 10,
        },
      });
      
      if (response.data.success) {
        setClients(response.data.data);
        setTotalPages(response.data.pages);
        setTotalRecords(response.data.total);
      }
    } catch (error) {
      console.error('Error loading client list:', error);
      setToast({ type: 'error', message: 'Failed to load client directory.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [search, gender, page]);

  // Handle Search Input Change (Debounced / Instant)
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // reset to first page
  };

  // Handle Filter Change
  const handleFilterChange = (e) => {
    setGender(e.target.value);
    setPage(1); // reset to first page
  };

  // Open Modal for Add
  const openAddModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      dateOfBirth: '',
      timeOfBirth: '',
      placeOfBirth: '',
      gender: 'male',
      mobileNumber: '',
      email: '',
      address: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const openEditModal = (client) => {
    setEditingClient(client);
    // Format DOB to YYYY-MM-DD
    const dobFormatted = client.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split('T')[0] : '';
    setFormData({
      name: client.name,
      dateOfBirth: dobFormatted,
      timeOfBirth: client.timeOfBirth,
      placeOfBirth: client.placeOfBirth,
      gender: client.gender,
      mobileNumber: client.mobileNumber,
      email: client.email || '',
      address: client.address || '',
      notes: '', // Notes appending managed inside Profile view
    });
    setIsModalOpen(true);
  };

  // Form Validations
  const validateForm = () => {
    const { name, dateOfBirth, timeOfBirth, placeOfBirth, mobileNumber, email } = formData;
    if (!name || !dateOfBirth || !timeOfBirth || !placeOfBirth || !mobileNumber) {
      setToast({ type: 'error', message: 'Please complete all required fields (*).' });
      return false;
    }
    // Check mobile format (allow basic digits length)
    if (!/^\d{8,15}$/.test(mobileNumber)) {
      setToast({ type: 'error', message: 'Please enter a valid mobile number (8-15 digits).' });
      return false;
    }
    // Check email if provided
    if (email) {
      const re = /\S+@\S+\.\S+/;
      if (!re.test(email)) {
        setToast({ type: 'error', message: 'Please enter a valid email format.' });
        return false;
      }
    }
    return true;
  };

  // Save Client (Create or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingClient) {
        // Update client
        const response = await api.put(`/clients/${editingClient._id}`, formData);
        if (response.data.success) {
          setToast({ type: 'success', message: 'Client profile updated successfully!' });
          setIsModalOpen(false);
          loadClients();
        }
      } else {
        // Create client
        const response = await api.post('/clients', formData);
        if (response.data.success) {
          setToast({ type: 'success', message: 'New Client created successfully!' });
          setIsModalOpen(false);
          loadClients();
        }
      }
    } catch (error) {
      console.error('Error saving client profile:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Error occurred while saving details.'
      });
    }
  };

  // Delete Client
  const handleDeleteClient = async (id) => {
    if (window.confirm('Are you sure you want to delete this client and all their historical consultations?')) {
      try {
        await api.delete(`/clients/${id}`);
        setToast({ type: 'success', message: 'Client records purged.' });
        loadClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        setToast({ type: 'error', message: 'Failed to delete client records.' });
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-200">Directory Directory</h3>
          <p className="text-xs text-gray-400 mt-1">Manage personal profiles and view chart timelines ({totalRecords} total)</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Register Client</span>
        </button>
      </div>

      {/* Filters & Searches */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name, email, phone, or birth place..."
            className="w-full form-input-cosmic pl-12"
          />
        </div>

        {/* Gender Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={gender}
            onChange={handleFilterChange}
            className="w-full form-input-cosmic pl-12 appearance-none cursor-pointer"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Main Directory Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : clients.length === 0 ? (
        <div className="glass-panel border border-white/5 rounded-3xl p-16 text-center text-gray-500 flex flex-col items-center gap-4">
          <UserPlus className="w-12 h-12 text-slate-700 animate-float" />
          <div>
            <h4 className="text-gray-400 font-bold text-sm">No Clients Found</h4>
            <p className="text-xs text-gray-600 mt-1">Try modifying search tags or register a new client profile.</p>
          </div>
        </div>
      ) : (
        <div className="glass-panel border border-white/5 rounded-3xl overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-white/5 bg-slate-900/20">
                  <th className="font-semibold px-6 py-4">Client Detail</th>
                  <th className="font-semibold px-6 py-4">Zodiac Sign</th>
                  <th className="font-semibold px-6 py-4">Birth Parameters</th>
                  <th className="font-semibold px-6 py-4">Gender</th>
                  <th className="font-semibold px-6 py-4">Mobile Number</th>
                  <th className="font-semibold px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clients.map((client) => (
                  <tr key={client._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-gray-200">
                      <div className="text-sm font-semibold">{client.name}</div>
                      <div className="text-[10px] text-gray-500 font-medium mt-0.5">{client.email || 'No Email Logged'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 tracking-wider">
                        {client.zodiac}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      <div className="flex items-center gap-1.5 font-medium">
                        <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{new Date(client.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">{client.timeOfBirth} • {client.placeOfBirth}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 capitalize font-medium">
                      {client.gender}
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-semibold">
                      {client.mobileNumber}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/clients/${client._id}`)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg cursor-pointer transition-colors border border-white/5"
                          title="View Profile Chart"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg cursor-pointer transition-colors border border-white/5"
                          title="Edit Profile"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client._id)}
                          className="p-2 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg cursor-pointer transition-colors border border-white/5"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-slate-900/10">
              <span className="text-[11px] text-gray-500">
                Showing Page {page} of {totalPages} ({totalRecords} records)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  className="p-2 bg-slate-800 border border-white/5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 text-gray-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-2 bg-slate-800 border border-white/5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 text-gray-300 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal - Add / Edit Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <h3 className="text-lg font-bold text-gray-200 mb-6">
              {editingClient ? `Edit ${editingClient.name}` : 'Register New Client'}
            </h3>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Client Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* DOB */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Time of Birth */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Time of Birth (24h) *</label>
                <input
                  type="text"
                  required
                  value={formData.timeOfBirth}
                  onChange={(e) => setFormData({ ...formData, timeOfBirth: e.target.value })}
                  placeholder="e.g. 14:35"
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Place of Birth */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Place of Birth *</label>
                <input
                  type="text"
                  required
                  value={formData.placeOfBirth}
                  onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
                  placeholder="e.g. New Delhi, India"
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="form-input-cosmic text-xs appearance-none cursor-pointer"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Mobile Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. client@email.com"
                  className="form-input-cosmic text-xs"
                />
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Postal Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street details..."
                  className="form-input-cosmic text-xs h-16 resize-none"
                />
              </div>

              {/* Initial Note (only for new clients) */}
              {!editingClient && (
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Initial Consult Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Provide any starting comments (optional)..."
                    className="form-input-cosmic text-xs h-16 resize-none"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 md:col-span-2 mt-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <NotificationToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Clients;
