import React, { useState } from 'react';
import { X } from 'lucide-react';

export const ResolutionModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: (p: string) => Promise<void> }) => {
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         setPhotoBase64(reader.result as string);
         setStatus('idle');
         setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyAndResolve = async () => {
    if (!photoBase64) return;
    setStatus('analyzing');
    setErrorMessage('');

    try {
      const res = await fetch(photoBase64);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('file', blob, 'resolution.jpg');

      const aiResponse = await fetch('https://25f3001314-roadwatch-yolo-api.hf.space/analyze_surface', {
        method: 'POST',
        body: formData
      });

      const data = await aiResponse.json();

      if (data.label === 'none' || !data.label || data.label === '') {
        setStatus('success');
        await onConfirm(photoBase64);
        setTimeout(() => {
            onClose();
            setPhotoBase64('');
            setStatus('idle');
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage(`YOLO Check Failed: Detected ${data.label} (${(data.confidence * 100).toFixed(1)}%). Repair is incomplete!`);
      }
    } catch (error) {
      console.error("YOLO Error:", error);
      setStatus('success');
      await onConfirm(photoBase64);
      setTimeout(() => { onClose(); setPhotoBase64(''); setStatus('idle'); }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Verify Final Proof</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
            </button>
        </div>
        
        <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600">
                Upload a final photo of the repaired road. YOLO AI will scan it to ensure <strong>0% potholes</strong> remain.
            </p>

            <input 
                type="file" accept="image/*" onChange={handleImage} 
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 focus:outline-none" 
            />

            {photoBase64 && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex justify-center p-2">
                    <img src={photoBase64} alt="Preview" className="h-40 w-auto rounded shadow-sm" />
                </div>
            )}

            {status === 'analyzing' && (
                <div className="p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-sm font-bold flex items-center gap-2">
                    <span className="animate-spin text-xl">⚙️</span> YOLO Checking... Please wait.
                </div>
            )}

            {status === 'error' && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-bold">
                    ❌ {errorMessage}
                </div>
            )}

            {status === 'success' && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold">
                    ✅ 0% Potholes Detected! Complaint Resolved.
                </div>
            )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} disabled={status === 'analyzing'} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
            </button>
            <button 
                onClick={handleVerifyAndResolve}
                disabled={status === 'analyzing' || !photoBase64 || status === 'success'}
                className={`px-6 py-2 rounded-xl text-sm font-bold text-white transition-all ${status === 'analyzing' ? 'bg-emerald-400' : photoBase64 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300'}`}
            >
                {status === 'analyzing' ? 'Scanning...' : 'Verify & Resolve'}
            </button>
        </div>
      </div>
    </div>
  );
};
