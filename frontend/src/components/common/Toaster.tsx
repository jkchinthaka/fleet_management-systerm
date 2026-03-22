import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../../store/toastStore';

export const Toaster = () => {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  useEffect(() => {
    if (!toasts.length) return;
    const timer = setTimeout(() => remove(toasts[0].id), 2800);
    return () => clearTimeout(timer);
  }, [toasts, remove]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`pointer-events-auto rounded-xl px-4 py-3 text-sm text-white shadow-soft ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
          >
            {toast.title}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
