/**
 * Webakus ERP - Genel Ayarlar Varsayılan Başlangıç Değerleri
 */

import { IGenelAyarlarFormData } from '../validators/genelAyarlarValidation';

export const getGenelAyarlarDefaultValues = (): IGenelAyarlarFormData => ({
  firmaAdi: '',
  vergiDairesi: '',
  vergiNo: '',
  adres: '',
  yetkiliAdSoyad: '',
  telefon: '',
  email: '',
  metinHarfDonusumu: 'basHarflerBuyuk',
  varsayilanDil: 'tr'
});
