import React from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallPromptProps {
  className?: string;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className = '' }) => {
  const { isInstallable, isInstalled, install, dismiss } = usePWAInstall();

  // Add custom styles for animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slide-in-from-bottom-5 {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      .animate-in {
        animation-fill-mode: both;
      }
      .slide-in-from-bottom-5 {
        animation-name: slide-in-from-bottom-5;
      }
      .duration-300 {
        animation-duration: 300ms;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      console.log('PWA installed successfully');
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 relative animate-in slide-in-from-bottom-5 duration-300">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Tutup"
        >
          <X size={16} className="text-slate-500 dark:text-slate-400" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl">
            <Smartphone className="text-orange-600 dark:text-orange-400" size={20} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">
              Install EzyKasir
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Install aplikasi untuk akses lebih cepat, offline mode, dan pengalaman yang lebih baik.
            </p>
            
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 mb-3">
              <Monitor size={12} />
              <span>Tersedia untuk desktop & mobile</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download size={14} />
                Install Sekarang
              </button>
              <button
                onClick={dismiss}
                className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Nanti
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
