import { toast } from 'react-toastify';

export const dispatchWithToast = async <T extends { result: string }>(
  action: Promise<T>,
  expected: string,
  successMsg: string,
  errorMsg: string,
  onSuccess?: (response: T) => void
): Promise<boolean> => {
  try {
    const response = await action;
    if (response.result === expected) {
      onSuccess?.(response);
      toast.success(successMsg);
      return true;
    }
    toast.error(errorMsg);
    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    if (error instanceof Error) {
      toast.error(error.message);
    }
    return false;
  }
};
