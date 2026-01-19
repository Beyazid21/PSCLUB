import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Upload } from 'lucide-react';

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'import' | 'export';
  data: string; // Current JSON data for export
  onImport: (json: string) => void;
}

const JsonModal: React.FC<JsonModalProps> = ({ isOpen, onClose, type, data, onImport }) => {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && type === 'export') {
      setInputText(data);
    } else if (isOpen && type === 'import') {
      setInputText('');
      setError(null);
    }
  }, [isOpen, type, data]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    try {
      if (!inputText.trim()) return;
      JSON.parse(inputText); // Just check if valid JSON
      onImport(inputText);
      onClose();
    } catch (e) {
      setError("Invalid JSON format. Please check your input.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            {type === 'export' ? 'Export Scene JSON' : 'Import Scene JSON'}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 relative mb-4">
          <textarea
            className="w-full h-96 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg font-mono text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            readOnly={type === 'export'}
            placeholder={type === 'import' ? 'Paste your scene JSON here...' : ''}
          />
          {type === 'export' && (
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
              title="Copy to Clipboard"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-500 font-medium px-2">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
          {type === 'import' && (
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-lg shadow-sm transition-colors"
            >
              <Upload size={16} />
              Import Scenario
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonModal;
