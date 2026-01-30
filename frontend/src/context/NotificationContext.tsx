import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'reward';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
    points?: number; // Optional for reward notifications
}

interface NotificationContextType {
    notifications: Notification[];
    showNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newNotification = { ...notification, id };

        setNotifications((prev) => [...prev, newNotification]);

        if (notification.duration !== 0) {
            setTimeout(() => {
                removeNotification(id);
            }, notification.duration || 5000);
        }
    }, [removeNotification]);

    return (
        <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`p-4 rounded-lg shadow-lg border-l-4 min-w-[300px] animate-slide-in ${n.type === 'reward' ? 'bg-amber-50 border-amber-500 text-amber-900' :
                                n.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' :
                                    n.type === 'error' ? 'bg-rose-50 border-rose-500 text-rose-900' :
                                        'bg-slate-50 border-slate-500 text-slate-900'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-sm uppercase">{n.type}</p>
                                <p className="">{n.message}</p>
                                {n.points && (
                                    <p className="text-sm font-bold mt-1 text-amber-600">
                                        +{n.points} Points Earned!
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => removeNotification(n.id)}
                                className="text-slate-400 hover:text-slate-600 ml-4"
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
