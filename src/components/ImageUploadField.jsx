import { useEffect, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { apiUpload, resolveUploadUrl } from '../lib/api';

/**
 * @param {boolean} deferUpload - When true, file is held locally until parent uploads on submit
 * @param {File|null} pendingFile - Selected file waiting for submit
 * @param {(file: File|null) => void} onPendingFile - Called when user picks or clears a file
 */
export default function ImageUploadField({
  label,
  value,
  onChange,
  deferUpload = false,
  pendingFile = null,
  onPendingFile,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [localPreview, setLocalPreview] = useState('');

  useEffect(() => {
    if (!pendingFile) {
      setLocalPreview('');
      return undefined;
    }
    const blobUrl = URL.createObjectURL(pendingFile);
    setLocalPreview(blobUrl);
    return () => URL.revokeObjectURL(blobUrl);
  }, [pendingFile]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');

    if (deferUpload) {
      onPendingFile?.(file);
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const url = await apiUpload(file);
      onChange(url);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const clearPending = () => {
    onPendingFile?.(null);
  };

  const previewUrl = localPreview || resolveUploadUrl(value);

  return (
    <div className="flex flex-col gap-1.5 border border-slate-100 rounded-xl p-3.5 bg-slate-50/50">
      <label className="admin-label">{label}</label>

      <div className="flex gap-4 items-center">
        <div className="w-14 h-14 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
          {previewUrl ? (
            <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="text-slate-400" size={20} />
          )}
        </div>

        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex gap-2 flex-wrap">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm flex-shrink-0 select-none">
              <Upload size={14} className="text-slate-500" />
              <span>{deferUpload ? 'Choose File' : uploading ? 'Uploading...' : 'Choose File'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleFileChange}
              />
            </label>

            {deferUpload && pendingFile && (
              <button
                type="button"
                className="text-xs font-semibold text-slate-500 hover:text-red-600 px-2"
                onClick={clearPending}
              >
                Remove
              </button>
            )}
          </div>

          {deferUpload && pendingFile && (
            <span className="text-[10px] text-[#00a86b] font-medium">
              Ready to upload on Save — {pendingFile.name}
            </span>
          )}

          {error && <span className="text-[10px] text-red-500 font-medium">{error}</span>}
        </div>
      </div>
    </div>
  );
}
