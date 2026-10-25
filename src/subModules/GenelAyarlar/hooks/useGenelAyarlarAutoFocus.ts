/**
 * Webakus ERP - Genel Ayarlar Otomatik Odaklanma (AutoFocus) Hook'u
 */

import { useEffect, useRef } from 'react';

export const useGenelAyarlarAutoFocus = (loading: boolean) => {
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [loading]);

  return firstInputRef;
};
