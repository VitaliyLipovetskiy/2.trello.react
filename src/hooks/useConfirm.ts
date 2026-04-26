import { useRef, useState } from 'react';

interface ConfirmState {
  isOpen: boolean;
  message: string;
}

export const useConfirm = (): {
  confirm: (message: string) => Promise<boolean>;
  confirmState: ConfirmState;
  handleConfirm: () => void;
  handleCancel: () => void;
} => {
  const [state, setState] = useState<ConfirmState>({ isOpen: false, message: '' });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = (message: string): Promise<boolean> => {
    resolveRef.current?.(false);
    setState({ isOpen: true, message });
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleConfirm = (): void => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setState({ isOpen: false, message: '' });
  };

  const handleCancel = (): void => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setState({ isOpen: false, message: '' });
  };

  return { confirm, confirmState: state, handleConfirm, handleCancel };
};
