import { useNavigate, useLocation, useParams } from "react-router-dom";
import { deleteUser } from "../../api/users.api";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

export default function UserDetails() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { userId } = useParams();

    // Prefer state user if available, otherwise we might fetch (omitted for now as we navigate from list)
    const user = state?.user;

    if (!user) {
        return (
            <div className="p-8 text-center space-y-4">
                <p className="text-slate-500">User details not available directly. Please go back.</p>
                <Button onClick={() => navigate("/users")}>Go Back</Button>
            </div>
        )
    }

    const handleDeleteUser = async () => {
        if (!window.confirm(`Are you sure you want to delete ${user.username}? This cannot be undone.`)) return;

        try {
            await deleteUser(user.id);
            toast.success("User deleted successfully");
            navigate("/users"); // Go back to list
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-10">
            {/* Back Navigation */}
            <button
                onClick={() => navigate("/users")}
                className="group flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors font-medium"
            >
                <div className="p-2 rounded-full bg-white shadow-sm border border-slate-100 group-hover:border-teal-200 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                </div>
                <span>Back to Users</span>
            </button>

            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">

                {/* Hero Section / Header */}
                <div className={`
             relative h-48 md:h-64 flex flex-col items-center justify-center text-white
             ${user.role === 'admin' ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800' :
                        user.role === 'doctor' ? 'bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700' :
                            'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500'}
        `}>
                    {/* Decorative Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

                    {/* Avatar (Floating) */}
                    <div className="absolute -bottom-12 md:-bottom-16">
                        <div className="p-1.5 md:p-2 bg-white rounded-full shadow-xl">
                            <div className={`
                        w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-4xl md:text-6xl font-extrabold capitalize
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                                    user.role === 'doctor' ? 'bg-teal-100 text-teal-600' :
                                        'bg-orange-100 text-orange-600'}
                    `}>
                                {user.username[0]}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="pt-16 md:pt-20 px-6 md:px-12 pb-10 text-center">

                    {/* Name & Role */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">{user.username}</h1>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border
                        ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                    user.role === 'doctor' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                        'bg-orange-50 text-orange-700 border-orange-200'}
                     `}>
                                <span className="w-2 h-2 rounded-full bg-current"></span>
                                {user.role} Account
                            </span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-left">

                        {/* Email Card */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email</label>
                                <span className="text-xl text-slate-300 group-hover:text-blue-500 transition-colors">✉️</span>
                            </div>
                            <p className="font-semibold text-slate-800 break-all">{user.email}</p>
                        </div>

                        {/* Status Card */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Status</label>
                                <span className="text-xl text-slate-300 group-hover:text-green-500 transition-colors">🟢</span>
                            </div>
                            <p className="font-semibold text-green-600 flex items-center gap-2">
                                Active
                            </p>
                        </div>

                        {/* ID Card */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">User ID</label>
                                <span className="text-xl text-slate-300 group-hover:text-purple-500 transition-colors">🆔</span>
                            </div>
                            <p className="font-mono text-slate-600 font-medium">#{user.id}</p>
                        </div>

                        {/* Date Card (Placeholder) */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Joined</label>
                                <span className="text-xl text-slate-300 group-hover:text-orange-500 transition-colors">📅</span>
                            </div>
                            <p className="font-medium text-slate-700">Jan 12, 2024</p>
                        </div>

                        {/* Security/Password (Placeholder) */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group col-span-1 md:col-span-2 lg:col-span-2">
                            <div className="flex items-start justify-between mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Security</label>
                                <span className="text-xl text-slate-300 group-hover:text-red-500 transition-colors">🔒</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="font-medium text-slate-700">Password is set</p>
                                <button onClick={() => navigate("/users/add", { state: { userToEdit: user } })} className="text-xs text-teal-600 font-bold hover:underline">Change Password</button>
                            </div>
                        </div>

                    </div>

                    {/* Actions */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5"
                            onClick={() => navigate("/users/add", { state: { userToEdit: user } })}
                        >
                            Edit User Profile
                        </button>
                        <button
                            onClick={handleDeleteUser}
                            className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all"
                        >
                            Delete Account
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
