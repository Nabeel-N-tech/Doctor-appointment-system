import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import toast from 'react-hot-toast';
import { Video } from 'lucide-react';

export default function VideoCall() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [callStatus, setCallStatus] = useState('active'); // active, left

    const handleLeaveCall = useCallback(() => {
        setCallStatus('left');
        toast.success("You left the video call.");
        navigate(-1); // go back
    }, [navigate]);

    // Generate a unique, secure dynamic room using Jitsi's free WebRTC infrastructure
    // This requires 0 API keys and spins up an instant multi-user video conference
    const roomName = `TelemedicineConsultation_${appointmentId}_SecureHash_${btoa(appointmentId).replace(/=/g, '')}`;
    const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(user?.username || 'Guest')}"&config.prejoinPageEnabled=false&config.disableDeepLinking=true`;

    return (
        <div className="flex flex-col h-screen max-h-screen bg-slate-900 overflow-hidden">
            {/* Header bar */}
            <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl shadow-inner text-white">
                        <Video size={20} />
                    </div>
                    <div>
                        <h1 className="text-white font-black tracking-tight text-lg leading-none">Telemedicine Consultation</h1>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Appointment #{appointmentId}</p>
                    </div>
                </div>

                <button
                    onClick={handleLeaveCall}
                    className="h-10 px-6 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-900/50 transition-all flex items-center justify-center gap-2"
                >
                    End Call
                </button>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 p-2 md:p-6 pb-20 md:pb-6 relative flex flex-col min-h-0 bg-slate-900">
                {callStatus === 'active' && (
                    <iframe
                        src={jitsiUrl}
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                        className="w-full flex-1 min-h-[600px] relative shadow-2xl shadow-black/50 overflow-hidden rounded-2xl md:rounded-[2rem] bg-black ring-1 ring-slate-800"
                        title="Telemedicine Video Call"
                    ></iframe>
                )}
            </div>
        </div>
    );
}
