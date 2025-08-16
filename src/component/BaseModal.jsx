import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

export default function BaseModal({ isOpen, onClose, title, children }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" onClick={onClose} />

      {/* Modal Panel */}
      <div className="fixed inset-0 flex items-center justify-center px-4">
        <Dialog.Panel
          onClick={(e) => e.stopPropagation()}
          className="bg-color-1 rounded-xl shadow-lg max-w-md w-full p-6 relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          {title && <Dialog.Title className="text-color font-semibold mb-4">{title}</Dialog.Title>}

          {/* Content */}
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
