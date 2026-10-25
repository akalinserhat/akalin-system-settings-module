/**
 * Webakus ERP - Kargo Kuralları Formu Doğrulama Kuralları (kargoKuralValidation.ts)
 * 
 * Başlıca Sorumlulukları:
 * - Kargo firması fiyat/bölge kuralı formu için alan bazlı ve form geneli doğrulama kurallarını yönetmek.
 * - Kural Adı, Fiyatlama Tipi, Sabit Fiyat ve Desi Kademeleri geçerliliğini denetlemek.
 */

export interface KargoKuralFormData {
  kuralAdi: string;
  aktifMi?: boolean;
  oncelik?: number | string;
  bolgeler?: any[];
  gecerliGunler?: string;
  urunGrubuId?: string | number;
  fiyatlamaTipi: 'Ucretsiz' | 'SabitFiyat' | 'DesiBazli';
  fiyat?: number | string;
  ucretsizKargoBaraji?: string | number;
  maksimumDesiSiniri?: string | number;
  ekstraDesiFiyati?: string | number;
  desiFiyatlari?: Array<{
    minDesi: number | string;
    maxDesi: number | string;
    fiyat: number | string;
  }>;
  [key: string]: any;
}

/**
 * Tekil alan doğrulaması (onBlur veya anlık denetim için).
 */
export const validateKargoKuralField = (
  name: string,
  value: any,
  formData: KargoKuralFormData,
  t: any = (k: string, f?: string) => f || k
): string | null => {
  const strVal = value != null ? value.toString().trim() : '';

  switch (name) {
    case 'kuralAdi':
      if (!strVal) {
        return t('validation_kural_adi_zorunlu', 'Kural Adı zorunludur.');
      }
      break;

    case 'fiyat':
      if (formData.fiyatlamaTipi === 'SabitFiyat') {
        if (!strVal || parseFloat(strVal) < 0 || isNaN(parseFloat(strVal))) {
          return t('validation_gecerli_fiyat_giriniz', 'Lütfen geçerli bir sabit fiyat giriniz.');
        }
      }
      break;

    default:
      break;
  }

  return null;
};

/**
 * Tüm formun toplu doğrulaması (Kaydet öncesi denetim).
 */
export const validateKargoKuralForm = (
  formData: KargoKuralFormData,
  t: any = (k: string, f?: string) => f || k
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const kuralAdiErr = validateKargoKuralField('kuralAdi', formData.kuralAdi, formData, t);
  if (kuralAdiErr) errors.kuralAdi = kuralAdiErr;

  if (formData.fiyatlamaTipi === 'SabitFiyat') {
    const fiyatErr = validateKargoKuralField('fiyat', formData.fiyat, formData, t);
    if (fiyatErr) errors.fiyat = fiyatErr;
  }

  if (formData.fiyatlamaTipi === 'DesiBazli') {
    if (!formData.desiFiyatlari || formData.desiFiyatlari.length === 0) {
      errors.desiFiyatlari = t('validation_en_az_bir_desi_kademesi', 'Desi bazlı fiyatlandırma için en az 1 desi kademesi eklemelisiniz.');
    } else {
      for (let i = 0; i < formData.desiFiyatlari.length; i++) {
        const item = formData.desiFiyatlari[i];
        if (
          item.minDesi === '' ||
          item.maxDesi === '' ||
          item.fiyat === '' ||
          isNaN(Number(item.minDesi)) ||
          isNaN(Number(item.maxDesi)) ||
          isNaN(Number(item.fiyat))
        ) {
          errors.desiFiyatlari = t('validation_desi_kademeleri_eksik', 'Tüm desi kademelerinde Min, Max ve Fiyat alanları eksiksiz doldurulmalıdır.');
          break;
        }
      }
    }
  }

  return errors;
};
