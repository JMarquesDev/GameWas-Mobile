import { useEffect, useRef, type ReactNode } from 'react';

export function Modal({ open, title, onClose, children, className = '' }: { open: boolean; title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) { dialog.current?.showModal(); if (dialog.current) dialog.current.scrollTop = 0; }
    if (!open) dialog.current?.close();
  }, [open]);
  return <dialog ref={dialog} className={className} aria-label={title} onCancel={event => { event.preventDefault(); onClose(); }}>{open && children}</dialog>;
}
