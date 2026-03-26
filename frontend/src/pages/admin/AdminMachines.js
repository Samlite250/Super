import React, { useEffect, useState, useCallback } from 'react';
import api, { IMAGE_BASE_URL } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const COUNTRIES = [
  { key: 'Global',  label: 'Global',   flag: '🌍', currency: 'FBu',  color: 'bg-gray-800 text-white' },
  { key: 'Uganda',  label: 'Uganda',   flag: '🇺🇬', currency: 'UGX',  color: 'bg-yellow-600 text-white' },
  { key: 'Rwanda',  label: 'Rwanda',   flag: '🇷🇼', currency: 'RWF',  color: 'bg-blue-700 text-white' },
  { key: 'Kenya',   label: 'Kenya',    flag: '🇰🇪', currency: 'KES',  color: 'bg-red-700 text-white' },
  { key: 'Burundi', label: 'Burundi',  flag: '🇧🇮', currency: 'FBu',  color: 'bg-green-700 text-white' },
];

const EMPTY_FORM = {
  name: '', description: '', priceFBu: '', durationDays: '', dailyPercent: '', premium: false, country: 'Global'
};

const getMachineImage = (img) => {
  if (!img) return '/tractor_agro.png';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${IMAGE_BASE_URL}${path}`;
};

function AdminMachines() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Global');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { document.title = 'Asset Lab | Admin'; }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMachines = useCallback(async () => {
    try {
      const res = await api.get('/machines');
      setMachines(Array.isArray(res.data) ? res.data : []);
    } catch {
      navigate('/auth/admin-secure-v2');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchMachines(); }, [fetchMachines]);

  const tabMachines = machines.filter(m => (m.country || 'Global') === activeTab);
  const activeCountry = COUNTRIES.find(c => c.key === activeTab) || COUNTRIES[0];

  const openAdd = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, country: activeTab });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = (m) => {
    setEditingId(m.id);
    setFormData({
      name: m.name,
      description: m.description || '',
      priceFBu: m.priceFBu,
      durationDays: m.durationDays,
      dailyPercent: m.dailyPercent,
      premium: m.premium || false,
      country: m.country || 'Global',
    });
    setImageFile(null);
    setImagePreview(m.imageUrl ? getMachineImage(m.imageUrl) : null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFile = (e) => {
    const f = e.target.files[0] || null;
    setImageFile(f);
    setImagePreview(f ? URL.createObjectURL(f) : imagePreview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(k => fd.append(k, formData[k]));
      if (imageFile) fd.append('image', imageFile);

      let res;
      if (editingId) {
        res = await api.put(`/machines/${editingId}`, fd);
        setMachines(prev =>
          prev.map(m => m.id === editingId ? res.data : m).sort((a,b) => parseFloat(a.priceFBu) - parseFloat(b.priceFBu))
        );
        showToast('✓ Plan updated successfully!');
      } else {
        res = await api.post('/machines', fd);
        setMachines(prev => [...prev, res.data].sort((a,b) => parseFloat(a.priceFBu) - parseFloat(b.priceFBu)));
        showToast('✓ New plan deployed!');
      }
      closeForm();
    } catch (err) {
      showToast('✗ ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan? Existing investments are not affected.')) return;
    try {
      await api.delete(`/machines/${id}`);
      setMachines(prev => prev.filter(m => m.id !== id));
      showToast('Plan removed.');
    } catch (err) {
      showToast('✗ ' + (err.response?.data?.message || 'Delete failed'), 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 lg:p-8 animate-fadeIn">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm text-white transition-all animate-scaleUp ${toast.type === 'error' ? 'bg-red-500' : 'bg-gray-900'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Asset Lab</h2>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-widest">Investment Plans Management</p>
          </div>
          <button
            onClick={showForm ? closeForm : openAdd}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${showForm ? 'bg-red-500 text-white' : 'bg-gray-900 text-white shadow-lg hover:bg-black active:scale-95'}`}
          >
            {showForm ? '✕ Cancel' : `+ Deploy ${activeCountry.flag} ${activeCountry.label} Plan`}
          </button>
        </div>

        {/* Country Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {COUNTRIES.map(c => {
            const count = machines.filter(m => (m.country || 'Global') === c.key).length;
            const isActive = activeTab === c.key;
            return (
              <button
                key={c.key}
                onClick={() => { setActiveTab(c.key); if (!showForm) { /* no-op */ } }}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest border-2 transition-all ${
                  isActive
                    ? `${c.color} border-transparent shadow-lg scale-105`
                    : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                }`}
              >
                <span className="text-base">{c.flag}</span>
                {c.label}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[9px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Country Info Banner */}
        {activeTab !== 'Global' && (
          <div className={`${activeCountry.color} rounded-2xl p-4 mb-6 flex items-center gap-4 shadow-md`}>
            <span className="text-4xl">{activeCountry.flag}</span>
            <div>
              <p className="font-black text-white text-base">{activeCountry.label} — Country-Specific Plans</p>
              <p className="text-white/70 text-xs font-medium mt-0.5">
                Plans here are shown <strong className="text-white">exclusively</strong> to {activeCountry.label}n users, with prices in <strong className="text-white">{activeCountry.currency}</strong>. They appear alongside Global plans.
              </p>
            </div>
          </div>
        )}

        {/* Add / Edit Form */}
        {showForm && (
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 mb-10 shadow-xl animate-scaleUp">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-50">
              <h3 className="text-xl font-black text-gray-900">
                {editingId ? '✏️ Edit Plan' : '🚀 New Plan'} — {activeCountry.flag} {activeCountry.label}
              </h3>
              {formData.premium && (
                <span className="px-3 py-1 rounded-full bg-secondary text-white text-[10px] font-black uppercase tracking-widest">Elite</span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Image Upload */}
              <div className="lg:col-span-1">
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Plan Image</label>
                <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 aspect-square bg-gray-50 flex items-center justify-center hover:border-secondary cursor-pointer transition-all">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-3xl block opacity-30 mb-1">📸</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Upload Image</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              {/* Fields */}
              <div className="lg:col-span-3 space-y-5">

                {/* Country selector */}
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Target Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInput}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:ring-1 focus:ring-secondary outline-none"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.key} value={c.key}>{c.flag} {c.label} ({c.currency})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Plan Name</label>
                    <input name="name" value={formData.name} onChange={handleInput} placeholder="e.g. Tractor X200" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:ring-1 focus:ring-secondary outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                      Price ({formData.country !== 'Global' ? COUNTRIES.find(c=>c.key===formData.country)?.currency : 'FBu'})
                    </label>
                    <input type="number" name="priceFBu" value={formData.priceFBu} onChange={handleInput} placeholder="e.g. 50000" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:ring-1 focus:ring-secondary outline-none" required />
                    {formData.country !== 'Global' && (
                      <p className="text-[10px] text-secondary mt-1 ml-1 font-semibold">Exact local price in {COUNTRIES.find(c=>c.key===formData.country)?.currency} — no conversion applied</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Daily ROI (%)</label>
                    <input type="number" step="0.1" name="dailyPercent" value={formData.dailyPercent} onChange={handleInput} placeholder="e.g. 5.5" className="w-full px-4 py-3 bg-secondary/5 border border-secondary/20 rounded-xl font-black text-secondary focus:ring-1 focus:ring-secondary outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Duration (Days)</label>
                    <input type="number" name="durationDays" value={formData.durationDays} onChange={handleInput} placeholder="e.g. 30" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm focus:ring-1 focus:ring-secondary outline-none" required />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInput} placeholder="Brief plan description..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-sm h-24 resize-none focus:ring-1 focus:ring-secondary outline-none" required />
                </div>

                {/* Premium Toggle */}
                <div className="flex items-center justify-between p-5 bg-gray-900 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${formData.premium ? 'bg-secondary text-white' : 'bg-white/10 text-gray-500'}`}>⭐</div>
                    <div>
                      <p className="text-xs font-black text-white">Elite Cluster Protocol</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">Mark as premium tier plan</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="premium" checked={formData.premium} onChange={handleInput} className="sr-only peer" />
                    <div className="w-12 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-gray-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-black transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                  ) : (
                    editingId ? '✓ Save Changes' : '🚀 Deploy Plan'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats row for active country */}
        {!showForm && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Plans', value: tabMachines.length, icon: '📋' },
              { label: 'Standard', value: tabMachines.filter(m => !m.premium).length, icon: '🔵' },
              { label: 'Elite', value: tabMachines.filter(m => m.premium).length, icon: '⭐' },
              { label: 'Currency', value: activeCountry.currency, icon: '💱' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-gray-900">{s.value}</p>
                </div>
                <span className="text-2xl">{s.icon}</span>
              </div>
            ))}
          </div>
        )}

        {/* Plans Grid */}
        {!showForm && (
          <div>
            {tabMachines.length === 0 ? (
              <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-20 text-center">
                <p className="text-4xl mb-4">{activeCountry.flag}</p>
                <p className="text-gray-300 font-black uppercase tracking-[6px] text-xs mb-4">No Plans Yet</p>
                <p className="text-gray-400 text-sm font-medium mb-6">No plans configured for {activeCountry.label} users.</p>
                <button
                  onClick={openAdd}
                  className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                >
                  + Add First Plan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {tabMachines.map((m, idx) => {
                  const fallbackImages = ['/tractor_agro.png','/drone_agro.png','/harvester_agro.png','/heavy_tractor_agro.png'];
                  const imgSrc = m.imageUrl ? getMachineImage(m.imageUrl) : fallbackImages[idx % fallbackImages.length];
                  const countryInfo = COUNTRIES.find(c => c.key === (m.country || 'Global')) || COUNTRIES[0];

                  return (
                    <div key={m.id} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl group">
                      {/* Image */}
                      <div className="h-44 relative overflow-hidden bg-gray-950">
                        <img src={imgSrc} alt={m.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        <div className="absolute top-3 left-3 flex gap-2">
                          <div className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
                            <span className="text-white text-[8px] font-black uppercase tracking-widest">#{idx + 1}</span>
                          </div>
                          <div className={`${countryInfo.color} px-2.5 py-1 rounded-xl`}>
                            <span className="text-white text-[8px] font-black uppercase tracking-widest">{countryInfo.flag} {countryInfo.key === 'Global' ? 'ALL' : countryInfo.key.slice(0,3).toUpperCase()}</span>
                          </div>
                        </div>

                        {m.premium && (
                          <div className="absolute top-3 right-3 bg-secondary px-2.5 py-1 rounded-xl">
                            <span className="text-white text-[8px] font-black uppercase tracking-widest">⭐ ELT</span>
                          </div>
                        )}

                        <div className="absolute bottom-3 left-4 right-4">
                          <h3 className="text-base font-black text-white leading-tight uppercase truncate">{m.name}</h3>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-5 flex-1 flex flex-col">
                        <p className="text-[11px] text-gray-400 mb-4 line-clamp-2 italic leading-relaxed">
                          {m.description || 'Institutional investment asset protocol.'}
                        </p>

                        <div className="grid grid-cols-2 gap-2 mb-5">
                          <div className="bg-gray-50/80 p-3 rounded-2xl text-center border border-gray-50">
                            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Term</p>
                            <p className="font-black text-gray-900 text-sm">{m.durationDays}D</p>
                          </div>
                          <div className="bg-gray-50/80 p-3 rounded-2xl text-center border border-gray-50">
                            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Price</p>
                            <p className="font-black text-primary text-sm">{parseFloat(m.priceFBu).toLocaleString()}</p>
                          </div>
                          <div className="col-span-2 bg-gray-900 p-3 rounded-2xl text-center">
                            <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Daily ROI</p>
                            <p className="font-black text-secondary text-base">{m.dailyPercent}%</p>
                          </div>
                        </div>

                        <div className="mt-auto flex gap-2">
                          <button
                            onClick={() => openEdit(m)}
                            className="flex-1 py-2.5 bg-gray-50 text-gray-400 hover:bg-gray-950 hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-2.5 bg-red-50 text-red-300 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminMachines;