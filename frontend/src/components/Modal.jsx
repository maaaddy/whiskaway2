import React, { useEffect } from 'react';

export default function Modal({ children, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#f2faf9] rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="overflow-auto max-h-[90vh] p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
