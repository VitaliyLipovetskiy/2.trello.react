import { useRef, useState } from 'react';

interface ConfirmState {
  isOpen: boolean;
  message: string;
}

export const useConfirm = () => {
  const [state, setState] = useState<ConfirmState>({ isOpen: false, message: '' });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = (message: string): Promise<boolean> => {
    setState({ isOpen: true, message });
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleConfirm = () => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setState({ isOpen: false, message: '' });
  };

  const handleCancel = () => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setState({ isOpen: false, message: '' });
  };

  return { confirm, confirmState: state, handleConfirm, handleCancel };
};