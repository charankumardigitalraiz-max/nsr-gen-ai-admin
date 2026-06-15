import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="admin-loading">
      <div className="admin-loading-spinner">
        <Loader2 size={28} className="animate-spin text-[#00a86b]" />
      </div>
      <p className="admin-loading-text">{message}</p>
    </div>
  );
}
