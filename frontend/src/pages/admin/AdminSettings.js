import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

function AdminSettings() {
  const [options, setOptions] = useState([]);
  const [socialLinks, setSocialLinks] = useState({ whatsapp: '', telegram: '' });
  const [supportEmail, setSupportEmail] = useState('support@supercash.com');
  const [loading, setLoading] = useState(true);
  const [socialLoading, setSocialLoading] = useState(true);

  const [newOpt, setNewOpt] = useState({ name: '', type: '', account: '', active: true, logo: '' });
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const navigate = useNavigate();


  useEffect(() => { document.title = "Global Settings | Admin"; }, []);

  useEffect(() => {
    async function load() {
      try {
        const [optRes, socRes, setRes] = await Promise.all([
          api.get('/settings/payment-options'),
          api.get('/settings/social-links'),
          api.get('/settings')
        ]);
        setOptions(optRes.data || []);
        setSocialLinks(socRes.data || { whatsapp: '', telegram: '' });
        if (setRes.data && setRes.data.supportEmail) {
          setSupportEmail(setRes.data.supportEmail);
        }
      } catch (err) {
        console.error(err);
        navigate('/auth/admin-secure-v2');
      } finally {
        setLoading(false);
        setSocialLoading(false);
      }
    }
    load();
  }, [navigate]);

  const updateSupportEmail = async () => {
    try {
      setSavingSocial(true);
      await api.post('/settings', { key: 'supportEmail', value: supportEmail });
      alert('✓ System Email Updated');
    } catch (err) {
      alert('Failed to update email');
    } finally {
      setSavingSocial(false);
    }
  };

  const saveSocialLinks = async () => {

    try {
      setSavingSocial(true);
      await api.post('/settings/social-links', socialLinks);
      alert('✓ Community Hub Updated');
    } catch (err) {
      alert('Failed to save social links');
    } finally {
      setSavingSocial(false);
    }
  };

  const saveOptions = async (list) => {
    try {
      setSaving(true);
      const res = await api.post('/settings/payment-options', { options: list });
      setOptions(res.data.options || list);
      setSaving(false);
      return res.data;
    } catch (err) {
      setSaving(false);
      alert('Failed to save payment options: ' + (err.response?.data?.error || err.message));
      throw err;
    }
  };


  const addOption = async () => {
    if (!newOpt.name) return alert('Please enter a name for the payment option');
    const list = [newOpt, ...options];
    try {
      await saveOptions(list);
      setNewOpt({ name: '', type: '', account: '', active: true, logo: '' });
      alert('✓ Protocol Registered');
    } catch (e) { }
  };

  const toggleActive = async (idx) => {
    const list = [...options];
    list[idx].active = !list[idx].active;
    if (!list[idx].active && !window.confirm(`Deactivate ${list[idx].name}?`)) return;
    try {
      await saveOptions(list);
    } catch (e) {}
  };

  const uploadLogo = async (file, idx = null) => {
    const fd = new FormData();
    fd.append('logo', file);
    try {
       const res = await api.post('/settings/payment-options/upload', fd, {
         headers: { 'Content-Type': 'multipart/form-data' },
       });
       const url = res.data.url;
       if (idx === null) {
         setNewOpt({ ...newOpt, logo: url });
       } else {
         const list = [...options];
         list[idx].logo = url;
         setOptions(list);
         await saveOptions(list);
       }
       alert('✓ Asset Visual Linked');
    } catch(e) {
       alert('Upload failed');
    }
  };

  const startEdit = (idx) => {
    setEditingIndex(idx);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const saveEdit = async (idx) => {
    const list = [...options];
    if (!list[idx].name) return alert('Name is required');
    try {
      await saveOptions(list);
      setEditingIndex(null);
      alert('✓ Protocol Refined');
    } catch (e) {}
  };

  const deleteOption = async (idx) => {
    const list = [...options];
    if (!window.confirm(`Void payment protocol '${list[idx].name}'? This cannot be undone.`)) return;
    list.splice(idx, 1);
    try {
      await saveOptions(list);
      alert('✓ Protocol Purged');
    } catch (e) {}
  };

  if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary"></div>
       </div>
     );
  }

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 animate-fadeIn">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
           <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Protocol Config</h2>
              <p className="text-gray-500 font-medium">Synchronize global payment gateways and manage institutional registry parameters.</p>
           </div>
           <div className="flex bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-2xl shadow-secondary/5 items-center gap-4 group">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_rgba(66,133,244,0.6)]"></span>
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-[4px] leading-none group-hover:tracking-[6px] transition-all">Registry Vers. 2.4.0 / Nexus Stable</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           
            {/* Form Section - Blue Themed */}
           <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-100">
                 <h3 className="text-xl font-black text-gray-900 mb-8 border-b-4 border-secondary/10 pb-6 flex items-center gap-4">
                    <span className="text-2xl text-secondary">🛡️</span>
                    Authorize Channel
                 </h3>
                 <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[4px] ml-2">Channel Alias</label>
                        <input placeholder="e.g. Google Pay" value={newOpt.name} onChange={e => setNewOpt({ ...newOpt, name: e.target.value })} className="w-full px-7 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-2 focus:ring-secondary outline-none transition-all font-black text-gray-900 tracking-tight" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[4px] ml-2">Protocol Type</label>
                        <input placeholder="e.g. Digital Wallet" value={newOpt.type} onChange={e => setNewOpt({ ...newOpt, type: e.target.value })} className="w-full px-7 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-2 focus:ring-secondary outline-none transition-all font-black text-gray-900 tracking-tight" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[4px] ml-2">Global URI / Identifier</label>
                        <input placeholder="e.g. merchant@cluster" value={newOpt.account} onChange={e => setNewOpt({ ...newOpt, account: e.target.value })} className="w-full px-7 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] focus:ring-2 focus:ring-secondary outline-none font-black text-gray-900 font-mono text-sm" />
                    </div>
                    
                    <div className="pt-6 flex flex-col gap-6">
                       <div className="flex items-center justify-between p-6 bg-secondary/5 rounded-[2.5rem] border border-secondary/10 group/up hover:bg-secondary/10 transition-colors">
                          <span className="text-[10px] font-black text-secondary uppercase tracking-[4px]">Visual Identity</span>
                          <input type="file" accept="image/*" onChange={e => uploadLogo(e.target.files[0])} className="hidden" id="logo-upload" />
                          <label htmlFor="logo-upload" className="text-[10px] font-black text-white bg-secondary px-6 py-3 rounded-2xl shadow-xl hover:bg-gray-900 transition-all cursor-pointer transform hover:scale-110">UPLOAD</label>
                       </div>
                       
                       <button onClick={addOption} disabled={saving} className="w-full py-6 bg-gray-950 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[5px] shadow-3xl hover:bg-black transition-all disabled:opacity-50 active:scale-95">
                          {saving ? 'SYNCHRONIZING...' : 'SYNC_PROTOCOL'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* Community Hub Section - Professional Green Theme */}
              <div className="bg-primary px-8 py-10 rounded-[3.5rem] border border-white/20 shadow-3xl relative overflow-hidden group/hub">
                 {/* Decorative background element */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-green-400 rounded-full opacity-10 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                 <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300 rounded-full opacity-5 blur-[60px] translate-y-1/2 -translate-x-1/2"></div>
                 
                 <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/20 shadow-inner">🌍</div>
                    <div>
                       <h3 className="text-[11px] font-black text-white uppercase tracking-[5px] leading-tight">Universal Registry</h3>
                       <p className="text-[9px] font-bold text-green-100/60 uppercase tracking-widest mt-1">Community Signal Synchronization</p>
                    </div>
                 </div>
                 
                 <div className="space-y-6 relative z-10">
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-center ml-1">
                           <label className="text-[9px] font-black text-white/90 uppercase tracking-[3px]">WhatsApp Gateway</label>
                           <span className="text-[8px] font-bold text-green-200/50 uppercase tracking-widest">Protocol W-S2</span>
                        </div>
                        <div className="flex gap-2">
                           <input 
                             placeholder="Official Group URI" 
                             value={socialLinks.whatsapp} 
                             onChange={e => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })} 
                             className="flex-1 px-5 py-3.5 bg-white/10 border border-white/10 rounded-2xl focus:ring-2 focus:ring-white/30 outline-none transition-all font-bold text-white text-xs placeholder:text-white/25" 
                           />
                           <button 
                             onClick={saveSocialLinks} 
                             disabled={savingSocial}
                             className="px-6 bg-white text-primary hover:bg-green-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                           >
                             COMMIT
                           </button>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <div className="flex justify-between items-center ml-1">
                           <label className="text-[9px] font-black text-white/90 uppercase tracking-[3px]">Telegram Stream</label>
                           <span className="text-[8px] font-bold text-green-200/50 uppercase tracking-widest">Channel Feed V.1</span>
                        </div>
                        <div className="flex gap-2">
                           <input 
                             placeholder="Official Channel URI" 
                             value={socialLinks.telegram} 
                             onChange={e => setSocialLinks({ ...socialLinks, telegram: e.target.value })} 
                             className="flex-1 px-5 py-3.5 bg-white/10 border border-white/10 rounded-2xl focus:ring-2 focus:ring-white/30 outline-none transition-all font-bold text-white text-xs placeholder:text-white/25" 
                           />
                           <button 
                             onClick={saveSocialLinks} 
                             disabled={savingSocial}
                             className="px-6 bg-white text-primary hover:bg-green-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                           >
                             COMMIT
                           </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 group">
                        <label className="block text-[8px] font-black text-white/80 uppercase tracking-[3px] mb-2 ml-1">System Support Email</label>
                        <div className="flex gap-2">
                           <input 
                             placeholder="support@supercash.com" 
                             value={supportEmail}
                             onChange={e => setSupportEmail(e.target.value)} 
                             className="flex-1 px-5 py-3.5 bg-white/10 border border-white/10 rounded-2xl focus:ring-2 focus:ring-white/30 outline-none transition-all font-bold text-white text-xs placeholder:text-white/25" 
                           />
                           <button 
                             onClick={updateSupportEmail} 
                             disabled={savingSocial}
                             className="px-6 bg-yellow-400 text-yellow-900 hover:bg-yellow-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                           >
                             UPDATE
                           </button>
                        </div>
                    </div>
                 </div>
                 
                 <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-center gap-2 relative z-10">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-[4px]">System Links Active & Verified</p>
                 </div>
              </div>
           </div>





           {/* List Section - Balanced Theme */}
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between px-8">
                 <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[6px]">Institutional Gateways</h2>
                 <span className="text-[10px] font-black text-secondary px-5 py-2 bg-secondary/10 rounded-full border border-secondary/20 shadow-sm">{options.length} Systems Active</span>
              </div>
              
              {options.length === 0 && (
                <div className="bg-white p-40 rounded-[5rem] text-center border-4 border-dashed border-gray-100 shadow-sm opacity-50">
                   <p className="text-gray-300 font-black uppercase tracking-[12px] text-sm">Registry Synchronized (Void)</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {options.map((opt, idx) => (
                  <div key={idx} className={`bg-white p-10 rounded-[3.5rem] shadow-sm border transition-all hover:shadow-3xl hover:-translate-y-2 group ${opt.active ? 'border-gray-100' : 'border-red-100 bg-red-50/10 opacity-60'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                      <div className="flex items-center gap-10 flex-1">
                         <div className="relative group shrink-0">
                            {opt.logo ? (
                              <div className="relative p-1 bg-white rounded-3xl border-2 border-gray-100 shadow-2xl transition-all group-hover:border-secondary/30">
                                 <img src={opt.logo} alt="logo" className="w-24 h-20 object-contain rounded-2xl p-2" />
                              </div>
                            ) : (
                              <div className="w-24 h-20 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-300 tracking-widest">∅ VOID</div>
                            )}
                            <input type="file" accept="image/*" onChange={e => uploadLogo(e.target.files[0], idx)} className="absolute inset-0 opacity-0 cursor-pointer" />
                         </div>

                         <div className="flex-1">
                           {editingIndex === idx ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <input className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-black focus:ring-2 focus:ring-secondary outline-none" value={opt.name} onChange={e => { const l = [...options]; l[idx].name = e.target.value; setOptions(l); }} />
                                <input className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-black focus:ring-2 focus:ring-secondary outline-none" value={opt.type} onChange={e => { const l = [...options]; l[idx].type = e.target.value; setOptions(l); }} />
                                <input className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono font-bold md:col-span-2 focus:ring-2 focus:ring-secondary outline-none" value={opt.account} onChange={e => { const l = [...options]; l[idx].account = e.target.value; setOptions(l); }} />
                             </div>
                           ) : (
                             <div className="transition-all duration-500">
                               <div className="flex items-center gap-6 mb-4">
                                  <h4 className="font-black text-gray-900 text-3xl tracking-tight uppercase group-hover:tracking-widest transition-all duration-700">{opt.name}</h4>
                                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[3px] border shadow-sm transition-all ${opt.active ? 'bg-primary/5 text-primary border-primary/20 shadow-primary/5' : 'bg-red-50 text-red-500 border-red-100 shadow-red-500/5'}`}>
                                    {opt.active ? 'STANDARD_PROTOCOL' : 'VOIDED_NULL'}
                                  </span>
                               </div>
                               <div className="flex gap-8 text-[11px] font-black uppercase tracking-[4px]">
                                  <span className="text-secondary opacity-60 group-hover:opacity-100 border-b-2 border-secondary/20 pb-1">{opt.type}</span>
                                  <span className="text-gray-400 font-mono tracking-tighter normal-case text-base font-bold">{opt.account}</span>
                                </div>
                             </div>
                           )}
                         </div>
                      </div>

                      <div className="flex items-center gap-4">
                         {editingIndex === idx ? (
                           <div className="flex gap-3">
                             <button onClick={() => saveEdit(idx)} className="px-8 py-3.5 bg-gray-950 text-white text-[11px] font-black rounded-2xl shadow-2xl uppercase tracking-[4px] hover:bg-black">Commit</button>
                             <button onClick={cancelEdit} className="px-8 py-3.5 bg-gray-100 text-gray-400 text-[11px] font-black rounded-2xl uppercase tracking-[4px] hover:bg-gray-200">Decline</button>
                           </div>
                         ) : (
                           <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-5 group-hover:translate-x-0">
                             <button onClick={() => toggleActive(idx)} className={`p-5 rounded-2xl border transition-all ${opt.active ? 'bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white border-gray-100' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white border-primary/10'}`} title={opt.active ? 'Void' : 'Restore'}>
                                {opt.active ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                )}
                             </button>
                             <button onClick={() => startEdit(idx)} className="p-5 rounded-2xl bg-gray-50 text-gray-400 hover:bg-secondary hover:text-white border border-gray-100 transition-all shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                             </button>
                             <button onClick={() => deleteOption(idx)} className="p-5 rounded-2xl bg-red-50 text-red-300 hover:bg-red-500 hover:text-white transition-all border border-red-50/50 shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                             </button>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default AdminSettings;