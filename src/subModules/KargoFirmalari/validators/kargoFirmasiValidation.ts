/**
 * Webakus ERP - Kargo Firması Formu Doğrulama Kuralları (kargoFirmasiValidation.ts)
 * 
 * Başlıca Sorumlulukları:
 * - Kargo firması tanım formu için alan bazlı ve form geneli doğrulama kurallarını yönetmek.
 * - Firma Adı ve E-posta format geçerliliğini denetlemek.
 */

export interface KargoFirmasiFormData {
  ad: string;
  tip?: string;
  sorumluKisi?: string;
  telefon?: string;
  eposta?: string;
  aktifMi?: boolean;
  adres?: {
    adresIsmi?: string;
    ilId?: number | string | null;
    ilAdi?: string;
    ilceId?: number | string | null;
    ilceAdi?: string;
    acikAdres?: string;
  };
  [key: string]: any;
}

/**
 * Tekil alan doğrulaması (onBlur veya anlık denetim için).
 */
export const validateKargoFirmasiField = (
  name: string,
  value: any,
  _formData?: KargoFirmasiFormData,
  t: any = (k: string, f?: string) => f || k
): string | null => {
  const strVal = value != null ? value.toString().trim() : '';

  switch (name) {
    case 'ad':
      if (!strVal) {
        return `${t('auto_kargo_firmasi_adi_ee12', 'Kargo Firması Adı')} ${t('validation_zorunludur', 'zorunludur.')}`;
      }
      break;

    case 'eposta':
      if (strVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal)) {
        return t('gecerli_bir_eposta_giriniz', 'Lütfen geçerli bir e-posta adresi giriniz.');
      }
      break;

    default:
      break;
  }

  return null;
};

/**
 * Form geneli toplu doğrulama (kaydetmeden önce çağrılır).
 */
export const validateKargoFirmasiForm = (
  formData: KargoFirmasiFormData,
  t: any = (k: string, f?: string) => f || k
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const adErr = validateKargoFirmasiField('ad', formData.ad, formData, t);
  if (adErr) errors.ad = adErr;

  const epostaErr = validateKargoFirmasiField('eposta', formData.eposta, formData, t);
  if (epostaErr) errors.eposta = epostaErr;

  return errors;
};
