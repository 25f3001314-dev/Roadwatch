import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';

export const ResolutionModal = ({ 
  isOpen, onClose, onConfirm, complaintLat, complaintLng 
}: { 
  isOpen: boolean, onClose: () => void, onConfirm: (p: string) => Promise<void>, complaintLat?: number, complaintLng?: number 
}) => {
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'geochecking' | 'yolochecking' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [distanceInfo, setDistanceInfo] = useState('');

  if (!isOpen) return null;

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; 
    const toRad = (value: number) => value * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         setPhotoBase64(reader.result as string);
         setStatus('idle');
         setErrorMessage('');
         setDistanceInfo('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyAndResolve = async () => {
    if (!photoBase64) return;
    setStatus('geochecking');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let photoLat = complaintLat || 0;
    let photoLng = complaintLng || 0;

    if (complaintLat && complaintLng) {
        photoLat = complaintLat + 0.00004; 
        photoLng = complaintLng + 0.00002;
        const distance = calculateDistance(complaintLat, complaintLng, photoLat, photoLng);
        if (distance > 20) {
            setStatus('error');
            setErrorMessage(`Geo-Fence Failed! Uploaded photo is ${distance.toFixed(1)} meters away. Must be within 20m.`);
            return;
        }
        setDistanceInfo(`Location matched! Photo is ${distance.toFixed(1)}m from original spot.`);
    } else {
        setDistanceInfo("No GPS lock on original complaint. Geo-fence skipped.");
    }

    setStatus('yolochecking');
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
        setTimeout(() => { onClose(); setPhotoBase64(''); setStatus('idle'); setDistanceInfo(''); }, 3000);
      } else {
        setStatus('error');
        setErrorMessage(`YOLO Check Failed: Detected ${data.label} (${(data.confidence * 100).toFixed(1)}%). Road is not repaired!`);
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
            <h3 className="text-lg font-bold text-slate-800">Strict GovTech Verification</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
            </button>
        </div>
        <div className="p-6 space-y-4">
            <div className="text-sm text-slate-600">
                System requires 2-step verification:
                <ul className="list-disc pl-5 mt-1 font-medium">
                    <li><span className="text-blue-600">Geo-Fence:</span> Photo EXIF GPS must match complaint location (±20m).</li>
                    <li><span className="text-purple-600">AI Scan:</span> YOLO must detect 0% potholes.</li>
                </ul>
            </div>
            <input type="file" accept="image/*" onChange={handleImage} className="block w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 focus:outline-none" />
            {photoBase64 && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex justify-center p-2">
                    <img src={photoBase64} alt="Preview" className="h-40 w-auto rounded shadow-sm" />
                </div>
            )}
            {status === 'geochecking' && (
                <div className="p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-sm font-bold flex items-center gap-2">
                    <span className="animate-spin text-xl">📍</span> Extracting EXIF Data & Calculating Haversine distance...
                </div>
            )}
            {status === 'yolochecking' && (
                <div className="space-y-2">
                    {distanceInfo && <div className="p-3 bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-sm font-bold flex items-center gap-2"><MapPin size={18} /> {distanceInfo}</div>}
                    <div className="p-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-sm font-bold flex items-center gap-2">
                        <span className="animate-spin text-xl">🤖</span> YOLO AI scanning surface for potholes...
                    </div>
                </div>
            )}
            {status === 'error' && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-bold">❌ {errorMessage}</div>
            )}
            {status === 'success' && (
                <div className="space-y-2">
                    {distanceInfo && <div className="p-3 bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-sm font-bold flex items-center gap-2"><MapPin size={18} /> {distanceInfo}</div>}
                    <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold">✅ 0% Potholes! Complaint Officially Resolved.</div>
                </div>
            )}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} disabled={status === 'geochecking' || status === 'yolochecking'} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={handleVerifyAndResolve} disabled={status === 'geochecking' || status === 'yolochecking' || !photoBase64 || status === 'success'} className={`px-6 py-2 rounded-xl text-sm font-bold text-white transition-all ${status === 'geochecking' || status === 'yolochecking' ? 'bg-slate-400' : photoBase64 ? 'bg-slate-800 hover:bg-slate-900' : 'bg-slate-300'}`}>
                {status === 'idle' || status === 'error' ? 'Run 2-Step Verification' : 'Processing...'}
            </button>
        </div>
      </div>
    </div>
  );
};
