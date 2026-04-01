import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';
import { toast } from 'react-hot-toast';

function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (err) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key, value) => {
    setSaving(true);
    try {
      await api.put('/settings', { key, value });
      toast.success(`Setting [${key}] updated`);
      fetchSettings();
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading settings node...</div>;

  const settingGroups = [
    {
      title: 'Referral Rewards',
      items: [
        { key: 'referral_reward_percentage', label: 'Base Reward (%)', type: 'number', help: 'Instant commission on any investment' },
        { key: 'referral_high_capital_threshold', label: 'High Capital Threshold', type: 'number', help: 'Amount at which high-yield triggers' },
        { key: 'referral_high_capital_bonus', label: 'High Capital Bonus (+%)', type: 'number', help: 'Extra % added for high-capital referrals' },
        { key: 'referral_bonus', label: 'Registration Reward', type: 'number', help: 'Bonus given to referrer upon invitee signup' },
      ]
    },
    {
      title: 'Bonuses & Fees',
      items: [
        { key: 'signup_bonus_Burundi', label: 'Burundi Signup Bonus', type: 'number' },
        { key: 'signup_bonus_Kenya', label: 'Kenya Signup Bonus', type: 'number' },
        { key: 'signup_bonus_Global', label: 'Global Signup Bonus', type: 'number' },
        { key: 'withdrawal_fee_percent', label: 'Withdrawal Fee (%)', type: 'number' },
      ]
    },
    {
      title: 'Global Communications',
      items: [
        { key: 'system_email', label: 'System Admin Email', type: 'text', help: 'Emails sent from this address (SMTP must match)' },
      ]
    }
  ];

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 animate-fadeIn max-w-4xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Protocol Configuration</h2>
          <p className="text-gray-500 font-medium font-serif italic text-sm">System-wide parameters governing rewards, fees, and node communications.</p>
        </div>

        <div className="space-y-8">
          {settingGroups.map((group, gIdx) => (
            <div key={gIdx} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
              <div className="bg-gray-950 px-8 py-5 flex items-center justify-between">
                <h3 className="font-black text-white text-xs uppercase tracking-[4px]">{group.title}</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              </div>
              <div className="p-8 space-y-6">
                {group.items.map((item, iIdx) => (
                  <div key={iIdx} className="group/item">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-black text-gray-800 mb-0.5 tracking-tight">{item.label}</label>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.key}</p>
                        {item.help && <p className="text-xs text-gray-400 mt-1">{item.help}</p>}
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <input
                          type={item.type}
                          defaultValue={settings[item.key] || ''}
                          className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-sm font-black text-gray-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full md:w-48"
                          onBlur={(e) => {
                            if (e.target.value !== settings[item.key]) {
                               handleUpdate(item.key, e.target.value);
                            }
                          }}
                        />
                        <button className="hidden md:flex opacity-0 group-hover/item:opacity-100 transition-opacity text-[10px] font-black text-gray-300 uppercase tracking-widest">
                          Auto-Save
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100">
           <div className="flex gap-4">
             <div className="text-2xl">⚡</div>
             <div>
               <h4 className="font-black text-amber-900 mb-1">Administrative Note</h4>
               <p className="text-sm text-amber-800 font-medium leading-relaxed">
                 Changes to commission rates will take effect immediately for all new transactions. Existing investments or pending payouts will not be retroactively modified. Ensure all parameters align with the protocol's liquidity sustainability models.
               </p>
             </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminSettings;
