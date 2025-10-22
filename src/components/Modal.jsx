import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      {/* Modal Container */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 z-50 w-full max-w-md">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times; {/* This is an 'X' character */}
          </button>
        </div>
        {/* Modal Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;