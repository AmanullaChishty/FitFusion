// frontend/src/components/Modal.tsx
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<Props> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-lg shadow-lg">
        {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
        <div>{children}</div>
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
