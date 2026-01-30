import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

interface AdminSettingsProps {
    isAdmin: boolean;
    currentBasePoints: number;
    isPaused: boolean;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ isAdmin, currentBasePoints, isPaused }) => {
    const [newBasePoints, setNewBasePoints] = useState(currentBasePoints.toString());
    const [pauseState, setPauseState] = useState(isPaused);
    const { showNotification } = useNotification();

    if (!isAdmin) {
        return (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
                <p className="text-rose-800 font-bold text-lg">⛔ Access Denied</p>
                <p className="text-rose-600 text-sm mt-2">You must be an administrator to access this panel.</p>
            </div>
        );
    }

    const handleUpdateBasePoints = async () => {
        try {
            // Simulate contract call
            console.log(`Updating base points to: ${newBasePoints}`);

            showNotification({
                type: 'success',
                message: `Base points updated to ${newBasePoints}`,
                duration: 5000
            });
        } catch (error) {
            showNotification({
                type: 'error',
                message: 'Failed to update base points',
                duration: 5000
            });
        }
    };

    const handleTogglePause = async () => {
        try {
            const newState = !pauseState;
            console.log(`Setting contract paused state to: ${newState}`);

            setPauseState(newState);

            showNotification({
                type: 'info',
                message: newState ? 'Contract paused successfully' : 'Contract resumed successfully',
                duration: 5000
            });
        } catch (error) {
            showNotification({
                type: 'error',
                message: 'Failed to update pause state',
                duration: 5000
            });
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm">
                        ⚙️
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">Admin Control Panel</h2>
                        <p className="text-indigo-100 text-sm mt-1">Manage rewards contract parameters</p>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* Contract Status */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${pauseState ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                Contract Status
                            </h3>
                            <p className="text-slate-600 text-sm mt-1">
                                {pauseState ? 'All reward functions are currently paused' : 'Contract is active and processing rewards'}
                            </p>
                        </div>
                        <button
                            onClick={handleTogglePause}
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${pauseState
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                                }`}
                        >
                            {pauseState ? '▶ Resume Contract' : '⏸ Pause Contract'}
                        </button>
                    </div>
                </div>

                {/* Base Points Configuration */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Activity Point Base</h3>
                    <p className="text-slate-600 text-sm mb-6">
                        Configure the base points awarded for contract activity. This value is multiplied by user streaks and impact scores.
                    </p>

                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                                New Base Points Value
                            </label>
                            <input
                                type="number"
                                value={newBasePoints}
                                onChange={(e) => setNewBasePoints(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="50"
                                min="1"
                                max="1000"
                            />
                        </div>
                        <button
                            onClick={handleUpdateBasePoints}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                        >
                            Update
                        </button>
                    </div>

                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-amber-800 text-xs font-medium">
                            ⚠️ <strong>Warning:</strong> Changing base points will affect all future rewards. Current value: <span className="font-mono font-bold">{currentBasePoints}</span>
                        </p>
                    </div>
                </div>

                {/* Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                        <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">Total Users</p>
                        <p className="text-3xl font-black text-blue-900">1,247</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                        <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-2">Points Distributed</p>
                        <p className="text-3xl font-black text-emerald-900">524,891</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
                        <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">Top Score</p>
                        <p className="text-3xl font-black text-amber-900">15,420</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
