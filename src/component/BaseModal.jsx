import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

export default function BaseModal({ isOpen, onClose, title, children }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" onClick={onClose} />

      {/* Modal Panel */}
      <div className="fixed inset-0 flex items-center justify-center px-4 py-8">
        <Dialog.Panel
          onClick={(e) => e.stopPropagation()}
          className="bg-color-1 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative"
        >
          {/* Close Button */}
          {/* <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray"
          >
            <X className="w-5 h-5" />
          </button> */}

          {/* Header */}
          {title && (
            <div className="flex-shrink-0 p-6 pb-0">
              <Dialog.Title className="text-color font-semibold text-xl">{title}</Dialog.Title>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500">
            {children}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
