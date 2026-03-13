import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useParams, Link } from 'react-router-dom';

function AdminManifest() {
    const { country } = useParams();
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/withdrawals');
                const filtered = res.data.filter(w => 
                    (!country || w.User?.country?.toLowerCase() === country.toLowerCase())
                );

                setWithdrawals(filtered);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [country]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse">GENERATING MANIFEST...</div>;

    return (
        <div className="min-h-screen bg-white p-8 md:p-16 text-gray-900 font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { padding: 0 !important; margin: 0 !important; }
                    @page { margin: 2cm; }
                }
            ` }} />

            <div className="max-w-5xl mx-auto border-4 border-gray-900 p-8 md:p-12 relative overflow-hidden">
                <Link to="/admin" className="no-print inline-flex items-center gap-2 mb-8 text-[10px] font-black text-gray-400 hover:text-gray-900 transition-all uppercase tracking-[4px]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Return to Operational Dashboard
                </Link>

                {/* Official Branding Header */}
                <div className="flex justify-between items-start border-b-4 border-gray-900 pb-8 mb-10">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Payout Manifest</h1>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-[4px]">Official Disbursement Document</p>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-xl uppercase italic">BATCH: {new Date().getTime().toString().slice(-6)}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date().toLocaleString()}</p>
                    </div>
                </div>

                <div className="mb-10 flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned Region</p>
                        <p className="text-2xl font-black uppercase tracking-tighter">{country || 'Global Master Queue'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Records</p>
                        <p className="text-2xl font-black uppercase tracking-tighter">{withdrawals.length}</p>
                    </div>
                </div>

                {/* Data Table */}
                <table className="w-full mb-12">
                    <thead>
                        <tr className="bg-gray-900 text-white">
                            <th className="p-4 text-[9px] font-black uppercase tracking-widest text-left">ID</th>
                            <th className="p-4 text-[9px] font-black uppercase tracking-widest text-left">Beneficiary Name</th>
                            <th className="p-4 text-[9px] font-black uppercase tracking-widest text-left">Method</th>
                            <th className="p-4 text-[9px] font-black uppercase tracking-widest text-left">Recipient Phone</th>
                            <th className="p-4 text-[9px] font-black uppercase tracking-widest text-right">Net Payout</th>
                            <th className="p-4 text-[9px] font-black uppercase tracking-widest text-center">Status</th>
                            <th className="p-4 text-[9px] font-black uppercase tracking-widest text-center">Verified</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-100">
                        {withdrawals.map((w) => (
                            <tr key={w.id} className="hover:bg-gray-50">
                                <td className="p-4 font-mono text-[10px] font-black text-gray-400">#WF-{w.id.toString().padStart(4, '0')}</td>
                                <td className="p-4 font-black uppercase text-xs tracking-tight">{w.User?.fullName}</td>
                                <td className="p-4 text-[10px] font-bold uppercase">{w.network}</td>
                                <td className="p-4 font-mono text-xs font-black">{w.phone}</td>
                                <td className="p-4 text-right font-black text-lg underline underline-offset-4 decoration-gray-200">
                                    {(parseFloat(w.amount) - (w.fee || 0)).toLocaleString()} {w.User?.currency || 'FBu'}
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                                        w.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                                        w.status === 'approved' ? 'bg-green-100 text-green-600' :
                                        'bg-red-100 text-red-600'
                                    }`}>
                                        {w.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="w-6 h-6 border-2 border-gray-300 mx-auto rounded-sm"></div>
                                </td>
                            </tr>
                        ))}

                    </tbody>
                </table>

                {/* Footer / Signature Area */}
                <div className="grid grid-cols-2 gap-20 pt-16 border-t-2 border-gray-100">
                    <div className="text-center">
                        <div className="border-b-2 border-gray-900 pb-2 mb-2"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Authorized Admin Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b-2 border-gray-900 pb-2 mb-2"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payout Agent Acknowledgement</p>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[10px]">Confidential Institutional Document</p>
                </div>

                {/* Floating Action Button - No Print */}
                <button 
                    onClick={handlePrint}
                    className="no-print fixed bottom-10 right-10 bg-gray-900 text-white px-10 py-5 rounded-full font-black uppercase tracking-[4px] shadow-2xl hover:bg-black transition-all active:scale-95"
                >
                    Print Manifest
                </button>
            </div>
        </div>
    );
}

export default AdminManifest;
