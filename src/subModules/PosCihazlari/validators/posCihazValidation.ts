/**
 * Webakus - Sistem Ayarları / POS Cihazı Formu Doğrulama Kuralları (posCihazValidation.ts)
 * 
 * Başlıca Görevleri:
 * - POS Cihazı tanımlama ve düzenleme formunun alan geçerlilik kontrollerini sağlamak
 */

export const validatePosCihazForm = (
    formData: any, 
    t: (key: string, options?: any) => string = (k) => k
): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!formData?.ad || formData.ad.trim() === '') {
        errors.ad = t('validation.required_field', { defaultValue: 'POS Adı zorunludur.' });
    }
    if (!formData?.bankaId) {
        errors.bankaId = t('validation.required_field', { defaultValue: 'Banka seçimi zorunludur.' });
    }
    if (!formData?.bankaHesapId) {
        errors.bankaHesapId = t('validation.required_field', { defaultValue: 'Banka hesabı seçimi zorunludur.' });
    }
    if (!formData?.geriDonusTuru) {
        errors.geriDonusTuru = t('validation.required_field', { defaultValue: 'Geri Dönüş Türü zorunludur.' });
    }
    if (!formData?.tip) {
        errors.tip = t('validation.required_field', { defaultValue: 'POS Tipi zorunludur.' });
    }
    if (!formData?.paraBirimi) {
        errors.paraBirimi = t('validation.required_field', { defaultValue: 'Para Birimi zorunludur.' });
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
