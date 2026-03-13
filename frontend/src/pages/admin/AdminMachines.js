import React, { useEffect, useState } from 'react';
import api, { IMAGE_BASE_URL } from '../../services/api';

import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

function AdminMachines() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceFBu: '',
    durationDays: '',
    dailyPercent: '',
    premium: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { document.title = "Asset Lab | Admin"; }, []);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await api.get('/machines');
        setMachines(res.data);
      } catch (err) {
        setError('Failed to load machines');
        navigate('/auth/admin-secure-v2');
      } finally {
        setLoading(false);
      }
    };
    fetchMachines();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0] || null;
    setImageFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(k => fd.append(k, formData[k]));
      if (imageFile) fd.append('image', imageFile);
      const res = await api.post('/machines', fd);

      
      // Add and re-sort
      const updated = [...machines, res.data].sort((a, b) => parseFloat(a.priceFBu) - parseFloat(b.priceFBu));
      setMachines(updated);
      
      setFormData({ name: '', description: '', priceFBu: '', durationDays: '', dailyPercent: '', premium: false });
      setImageFile(null);
      setImagePreview(null);
      setShowAddForm(false);
      alert('✓ Investment plan added successfully!');
    } catch (err) {
      alert('Failed to add plan: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditPlan = (machine) => {
    setEditingMachine(machine.id);
    setFormData({
      name: machine.name,
      description: machine.description,
      priceFBu: machine.priceFBu,
      durationDays: machine.durationDays,
      dailyPercent: machine.dailyPercent,
      premium: machine.premium || false
    });
    const getMachineImage = (img) => {
      if (!img) return '/tractor_agro.png';
      if (img.startsWith('http')) return img;
      const path = img.startsWith('/') ? img : `/${img}`;
      return `${IMAGE_BASE_URL}${path}`;
    };
    if (machine.imageUrl) {
      setImagePreview(getMachineImage(machine.imageUrl));
    } else {
      setImagePreview(null);
    }

    setShowAddForm(true);
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(k => fd.append(k, formData[k]));
      if (imageFile) fd.append('image', imageFile);
      const res = await api.put(`/machines/${editingMachine}`, fd);

      
      // Update and re-sort
      const updated = machines.map(m => m.id === editingMachine ? res.data : m)
                               .sort((a, b) => parseFloat(a.priceFBu) - parseFloat(b.priceFBu));
      setMachines(updated);
      
      setFormData({ name: '', description: '', priceFBu: '', durationDays: '', dailyPercent: '', premium: false });
      setImageFile(null);
      setImagePreview(null);
      setShowAddForm(false);
      setEditingMachine(null);
      alert('✓ Investment plan updated successfully!');
    } catch (err) {
      alert('Failed to update plan: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeletePlan = async (machineId) => {
    if (window.confirm('Delete this asset class? Existing investments will remain but new signups will be blocked.')) {
      try {
        await api.delete(`/machines/${machineId}`);
        setMachines(machines.filter(m => m.id !== machineId));
      } catch (err) {
         alert('Failed to delete');
      }
    }
  };

  if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary"></div>
       </div>
     );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 animate-fadeIn">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
           <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Asset Lab</h2>
              <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-widest">Global Portfolio Engineering</p>
           </div>
           
           <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (!showAddForm) {
                   setEditingMachine(null);
                   setFormData({ name: '', description: '', priceFBu: '', durationDays: '', dailyPercent: '', premium: false });
                   setImagePreview(null);
                }
              }}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                showAddForm ? 'bg-red-500 text-white' : 'bg-secondary text-white shadow-lg shadow-blue-500/10 active:scale-95'
              }`}
           >
              {showAddForm ? 'Close Designer' : 'Deploy New Asset'}
           </button>
        </div>

        {/* Compressed Statistics Row */}
        {!showAddForm && (
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm">
                 <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Registry</p>
                    <p className="text-3xl font-black text-gray-900">{machines.length}</p>
                 </div>
                 <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-xl">🛰️</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm">
                 <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Standard Node</p>
                    <p className="text-3xl font-black text-primary">{machines.filter(m => !m.premium).length}</p>
                 </div>
                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-sm font-black text-primary">STD</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm">
                 <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Elite Cluster</p>
                    <p className="text-3xl font-black text-secondary">{machines.filter(m => m.premium).length}</p>
                 </div>
                 <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-sm font-black text-secondary">ELT</div>
              </div>
           </div>
        )}

        {/* Compressed Designer Form */}
        {showAddForm && (
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 mb-10 animate-scaleUp shadow-xl">
            <div className="flex items-center justify-between mb-8 border-b-2 border-gray-50 pb-4">
               <h3 className="text-xl font-black text-gray-900">
                  {editingMachine ? 'Recalibrate Asset' : 'Engineer Blueprint'}
               </h3>
               {editingMachine && (
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${formData.premium ? 'bg-secondary text-white' : 'bg-primary text-white'}`}>
                    {formData.premium ? 'Elite Tier' : 'Standard Tier'}
                 </span>
               )}
            </div>

            <form onSubmit={editingMachine ? handleUpdatePlan : handleAddPlan} className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              
              <div className="lg:col-span-1">
                 <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Asset Identity Skin</label>
                 <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 aspect-square bg-gray-50 flex items-center justify-center transition-all hover:border-secondary cursor-pointer">
                    {imagePreview ? (
                       <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                       <div className="text-center p-4">
                          <span className="text-3xl mb-2 block opacity-30">📸</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Upload View</span>
                       </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                 </div>
              </div>

              <div className="lg:col-span-3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Designation</label>
                      <input name="name" value={formData.name} onChange={handleInputChange} placeholder="COMMANDER_X1" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary outline-none transition-all font-bold text-sm" required />
                   </div>
                   <div className="space-y-1">
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Acquisition (FBu)</label>
                      <input type="number" name="priceFBu" value={formData.priceFBu} onChange={handleInputChange} placeholder="1000000" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary outline-none transition-all font-bold text-sm" required />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Daily ROI (%)</label>
                      <input type="number" step="0.1" name="dailyPercent" value={formData.dailyPercent} onChange={handleInputChange} placeholder="5.5" className="w-full px-5 py-4 bg-secondary/5 border border-secondary/10 rounded-xl focus:ring-1 focus:ring-secondary outline-none transition-all font-black text-secondary" required />
                   </div>
                   <div className="space-y-1">
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Lifecycle (Days)</label>
                      <input type="number" name="durationDays" value={formData.durationDays} onChange={handleInputChange} placeholder="90" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-secondary outline-none transition-all font-bold text-sm" required />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Technical Specs</label>
                   <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Brief operational summary..." className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-1 focus:ring-secondary outline-none transition-all font-medium text-sm h-24 resize-none" required />
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-900 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${formData.premium ? 'bg-secondary text-white' : 'bg-white/10 text-gray-500'}`}>⭐</div>
                      <p className="text-xs font-black text-white tracking-tight">Elite Cluster Protocol</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="premium" checked={formData.premium} onChange={handleInputChange} className="sr-only peer" />
                      <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-secondary"></div>
                   </label>
                </div>

                <button type="submit" className="w-full py-4 bg-gray-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-black transition-all">
                   {editingMachine ? 'Commit Recalibration' : 'Verify & Deploy Asset'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Compressed Catalog Grid */}
        <div className="animate-fadeIn">
          {machines.length === 0 ? (
            <div className="bg-white p-24 rounded-[3rem] text-center border-2 border-dashed border-gray-100 opacity-50">
               <p className="text-gray-300 font-black uppercase tracking-[8px] text-xs">Registry Void</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {machines.map((m, idx) => {
                const fallbackImages = ['/tractor_agro.png','/drone_agro.png','/harvester_agro.png','/heavy_tractor_agro.png'];
                const defaultImg = fallbackImages[idx % fallbackImages.length];
                const getMachineImage = (img) => {
                  if (!img) return defaultImg;
                  if (img.startsWith('http')) return img;
                  const imgPath = img.startsWith('/') ? img : `/${img}`;
                  return `${IMAGE_BASE_URL}${imgPath}`;
                };


                return (
                  <div key={m.id} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl group">
                    <div className="h-44 relative overflow-hidden bg-gray-950">
                       <img src={getMachineImage(m.imageUrl)} alt={m.name} className="w-full h-full object-cover transition-opacity duration-700 opacity-90 group-hover:opacity-100" />

                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                       
                       <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                          <span className="text-white text-[8px] font-black uppercase tracking-[3px]">I-{idx + 1}</span>
                       </div>

                       {m.premium && (
                         <div className="absolute top-4 right-4 bg-secondary px-3 py-1.5 rounded-xl">
                            <span className="text-white text-[8px] font-black uppercase tracking-widest">ELT</span>
                         </div>
                       )}

                       <div className="absolute bottom-4 left-6 right-6">
                          <h3 className="text-lg font-black text-white leading-tight tracking-tight uppercase truncate">{m.name}</h3>
                       </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                       <p className="text-[11px] font-medium text-gray-400 mb-6 line-clamp-2 leading-relaxed opacity-80 italic">
                          {m.description || 'Institutional investment asset protocol.'}
                       </p>
                       
                       <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-50 flex flex-col items-center justify-center">
                             <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Term</p>
                             <p className="font-black text-gray-900 text-sm tracking-tighter">{m.durationDays}D</p>
                          </div>
                          <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-50 flex flex-col items-center justify-center">
                             <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Value</p>
                             <p className="font-black text-primary text-sm tracking-tighter">{parseFloat(m.priceFBu).toLocaleString()}</p>
                          </div>
                          <div className="col-span-2 bg-gray-900 p-3 rounded-2xl flex flex-col items-center justify-center">
                             <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Momentum</p>
                             <p className="font-black text-secondary text-base tracking-tighter">{m.dailyPercent}%</p>
                          </div>
                       </div>

                       <div className="mt-auto flex gap-3">
                          <button onClick={() => handleEditPlan(m)} className="flex-1 py-3 bg-gray-50 text-gray-400 hover:bg-gray-950 hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">
                             Recalibrate
                          </button>
                          <button onClick={() => handleDeletePlan(m.id)} className="p-3 bg-red-50 text-red-200 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                       </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminMachines;