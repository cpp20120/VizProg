import { useAppDispatch, useAppSelector } from '@app/hooks';
import { removeToast } from '@features/ui/uiSlice';

export const NotificationCenter = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.ui.toasts);
  return (
    <div className="toasts">
      {toasts.map((toast) => (
        <button className={`toast ${toast.kind}`} key={toast.id} onClick={() => dispatch(removeToast(toast.id))}>
          {toast.message}
        </button>
      ))}
    </div>
  );
};
