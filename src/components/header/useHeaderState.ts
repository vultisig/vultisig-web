import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import constantModals from "modals/constant-modals";

export const useHeaderState = () => {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === `#${constantModals.MENU}`) {
      setVisible(true);
    } else {
      setLoading(false);
      setVisible(false);
    }
  }, [hash]);

  return {
    loading,
    setLoading,
    visible,
    setVisible,
  };
};

