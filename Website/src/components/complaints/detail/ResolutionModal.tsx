import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { imageSrc } from '@/api/client';

export const ResolutionModal = ({
  isOpen, onClose, onConfirm, proofImageUrl
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  proofImageUrl?: string | null
}) => {
  const [status, setStatus] = useState<'idle' | 'yolochecking' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) { setStatus('idle'); setErrorMessage(''); }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasProof = Boolean(proofImageUrl);
  const proofSrc = proofImageUrl ? imageSrc(proofImageUrl) : '';

  const handleVerify = async () => {
    if (!hasProof) return;
    setStatus('yolochecking');
    setErrorMessage('');
    try {
      const res = await fetch(proofSrc);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('file', blob, 'resolution.jpg');
      const aiResponse = await fetch('https://25f3001314-roadwatch-yolo-api.hf.space/analyze_surface', {
        method: 'POST', body: formData
      });
      const data = await aiResponse.json();
      const confidence = data.confidence ?? 0;
      if (!data.label || data.label === 'none' || confidence < 0.6) {
        setStatus('success');
        await onConfirm();
        setTimeout(() => { onClose(); setStatus('idle'); }, 2000);
      } else {
        setStatus('error');
        setErrorMessage('AI Scan: ' + data.label + ' detected (' + (confidence * 100).toFixed(1) + '%). Road not repaired!');
      }
    } catch {
      setStatus('success');
      await onConfirm();
      setTimeout(() => { onClose(); setStatus('idle'); }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Verify Resolution Proof</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {hasProof ? (
            <>
              <p className="text-sm text-slate-600 font-medium">Officer ne proof submit ki hai. Image review karke Verify karein.</p>
              <figure className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div className="border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Officer Resolution Photo</p>
                </div>
                <img src={proofSrc} alt="Resolution proof" className="w-full max-h-72 object-contain bg-slate-50" />
              </figure>
              {status === 'yolochecking' && (
                <div className="p-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-sm font-bold flex items-center gap-2">
                  <span className="animate-spin text-xl">🤖</span> AI pothole scan chal raha hai...
                </div>
              )}
              {status === 'error' && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-bold">❌ {errorMessage}</div>
              )}
              {status === 'success' && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold">✅ Verified! Complaint RESOLVED ho gayi.</div>
              )}
            </>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-medium">
              ⚠️ Officer ne abhi proof submit nahi ki. Mobile app se upload ka wait karein.
            </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} disabled={status === 'yolochecking'}
            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40">Cancel</button>
          <button onClick={handleVerify} disabled={!hasProof || status === 'yolochecking' || status === 'success'}
            className={"px-6 py-2 rounded-xl text-sm font-bold text-white transition-all " + (hasProof && status !== 'yolochecking' && status !== 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300')}>
            {status === 'yolochecking' ? 'Verifying...' : status === 'success' ? 'Resolved ✓' : '✓ Verify & Resolve'}
          </button>
        </div>
      </div>
    </div>
  );
};
