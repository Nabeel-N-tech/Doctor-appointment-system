import { useState, useRef, useEffect } from "react";
import { getNotifications, markAsRead } from "../../api/notifications.api";
import toast from "react-hot-toast";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            toast.error("Failed to update notification");
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="relative text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up origin-top-right">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800">Notifications</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {unreadCount} Unread
                        </span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-slate-400 text-sm italic">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                                    onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${!n.is_read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                        <div className="flex-1">
                                            <p className={`text-sm leading-relaxed ${!n.is_read ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1 font-medium italic">
                                                {new Date(n.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                            <button className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline">
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
