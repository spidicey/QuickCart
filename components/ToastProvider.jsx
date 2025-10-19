"use client";
import { useAppContext } from "@/context/AppContext";
import Toast from "./Toast";

const ToastProvider = () => {
  const { toast, hideToast } = useAppContext();

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onClose={hideToast}
    />
  );
};

export default ToastProvider;
