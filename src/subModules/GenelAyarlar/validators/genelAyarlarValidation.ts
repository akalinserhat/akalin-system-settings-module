/**
 * Webakus ERP - Genel Ayarlar Form Validatörü
 * Sıfır Satır-İçi Validasyon kuralına (Zero Inline Validation Policy) uygun saf (pure) TypeScript fonksiyonları.
 */

export interface IGenelAyarlarFormData {
  firmaAdi: string;
  vergiDairesi: string;
  vergiNo: string;
  adres?: string;
  yetkiliAdSoyad?: string;
  telefon?: string;
  email: string;
  metinHarfDonusumu?: string;
  varsayilanDil?: string;
}

export const validateGenelAyarlarField = (
  name: string,
  value: any,
  t: (key: string, fallback?: string) => string
): string | null => {
  const strVal = typeof value === 'string' ? value.trim() : '';

  switch (name) {
    case 'firmaAdi':
      if (!strVal) {
        return t('firma_unvani_zorunludur', 'Firma ünvanı zorunludur.');
      }
      if (strVal.length > 250) {
        return t('firma_unvani_en_fazla_250_karakter', 'Firma ünvanı en fazla 250 karakter olabilir.');
      }
      return null;

    case 'vergiDairesi':
      if (!strVal) {
        return t('vergi_dairesi_zorunludur', 'Vergi dairesi zorunludur.');
      }
      return null;

    case 'vergiNo':
      if (!strVal) {
        return t('vergi_no_zorunludur', 'Vergi numarası / TCKN zorunludur.');
      }
      if (!/^[0-9]{10,11}$/.test(strVal)) {
        return t('vergi_no_formati_gecersiz', 'Vergi numarası 10 haneli VKN veya 11 haneli TCKN formatında olmalıdır.');
      }
      return null;

    case 'email':
      if (!strVal) {
        return t('email_adresi_zorunludur', 'E-posta adresi zorunludur.');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal)) {
        return t('gecerli_bir_email_giriniz', 'Geçerli bir e-posta adresi giriniz.');
      }
      return null;

    default:
      return null;
  }
};

export const validateGenelAyarlarForm = (
  formData: Partial<IGenelAyarlarFormData>,
  t: (key: string, fallback?: string) => string
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const fieldsToValidate = ['firmaAdi', 'vergiDairesi', 'vergiNo', 'email'];

  fieldsToValidate.forEach((field) => {
    const error = validateGenelAyarlarField(field, (formData as any)[field], t);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};
