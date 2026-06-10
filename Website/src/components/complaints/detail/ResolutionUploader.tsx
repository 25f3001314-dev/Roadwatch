import React, { useState } from 'react';

export const ResolutionUploader = ({ onConfirm }: { onConfirm: (photoData: string) => void }) => {
  const [photoBase64, setPhotoBase64] = useState<string>('');

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mt-6 p-5 border-2 border-dashed border-green-400 bg-green-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📸</span>
            <h4 className="text-md font-bold text-green-900">Proof of Resolution Required</h4>
        </div>
        <p className="text-sm text-green-700 mb-4">
            Strict GovTech SLA: Please upload a field photo of the repaired road to officially close this complaint.
        </p>
        
        <input 
            type="file" 
            accept="image/*" 
            onChange={handleImage} 
            className="mb-4 block w-full text-sm text-gray-600
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-green-600 file:text-white
            hover:file:bg-green-700 focus:outline-none" 
        />
        
        {photoBase64 && (
            <div className="mb-4">
                <img src={photoBase64} alt="Preview" className="h-32 w-auto rounded-lg shadow-sm border border-green-200" />
            </div>
        )}

        <button
          onClick={() => photoBase64 ? onConfirm(photoBase64) : alert('⚠️ Please upload a resolution photo first!')}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              photoBase64 ? 'bg-green-600 hover:bg-green-700 shadow-md' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Confirm & Mark as Resolved
        </button>
    </div>
  );
};
