
import React from 'react';
import { AlertTriangle, X, Info, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const styles = {
    danger: { btn: 'bg-[#f5222d] hover:bg-[#ff4d4f] shadow-red-500/10', icon: <AlertCircle className="w-8 h-8 text-[#f5222d]" />, bg: 'bg-red-50' },
    warning: { btn: 'bg-[#faad14] hover:bg-[#ffc53d] shadow-amber-500/10', icon: <AlertTriangle className="w-8 h-8 text-[#faad14]" />, bg: 'bg-amber-50' },
    info: { btn: 'bg-[#1677ff] hover:bg-[#4096ff] shadow-blue-500/10', icon: <Info className="w-8 h-8 text-[#1677ff]" />, bg: 'bg-blue-50' }
  };

  const current = styles[type];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className={`w-16 h-16 ${current.bg} rounded-full flex items-center justify-center mx-auto mb-6`}>
            {current.icon}
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-xs font-medium text-slate-400 leading-relaxed px-2">{message}</p>
        </div>
        
        <div className="p-4 bg-[#fafafa] border-t border-[#f0f0f0] flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-2.5 bg-white border border-[#d9d9d9] rounded font-bold text-xs uppercase text-slate-500 hover:bg-white transition-all"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded font-bold text-xs uppercase text-white shadow-lg transition-all active:scale-95 ${current.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
