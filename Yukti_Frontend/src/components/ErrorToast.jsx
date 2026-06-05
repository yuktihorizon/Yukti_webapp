import { X } from 'lucide-react';

const ErrorToast = ({ closeToast, message }) => (
  <div className="flex items-start p-4 bg-white rounded shadow-md border-l-8 border-red-500 w-full max-w-sm">
    <div className="mr-3 text-red-500 mt-1">
      ❌
    </div>
    <div className="flex-1">
      <strong className="text-sm text-gray-800">Error</strong>
      <p className="text-xs text-gray-600">{message}</p>
    </div>
    <button onClick={closeToast} className="ml-2 text-gray-400 hover:text-gray-600">
      <X size={16} />
    </button>
  </div>
);

export default ErrorToast;
