/**
 * Webakus - Sistem Ayarları / Tüketici Kredisi Firması Formu Doğrulama Kuralları (tuketiciKredisiValidation.ts)
 * 
 * Başlıca Görevleri:
 * - Tüketici kredisi firması ve komisyon belgeleri için veri geçerlilik kontrollerini sağlamak
 */

export const validateTuketiciKredisiForm = (
    formData: any, 
    t: (key: string, options?: any) => string = (k) => k
): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    if (!formData?.kod || formData.kod.trim() === '') {
        errors.kod = t('validation.required_field', { defaultValue: 'Firma kodu zorunludur.' });
    }
    if (!formData?.ad || formData.ad.trim() === '') {
        errors.ad = t('validation.required_field', { defaultValue: 'Firma adı zorunludur.' });
    }
    if (!formData?.bankaId) {
        errors.bankaId = t('validation.required_field', { defaultValue: 'Banka seçimi zorunludur.' });
    }
    if (!formData?.bankaHesapId) {
        errors.bankaHesapId = t('validation.required_field', { defaultValue: 'Banka hesabı seçimi zorunludur.' });
    }
    if (!formData?.paraBirimiId) {
        errors.paraBirimiId = t('validation.required_field', { defaultValue: 'Para birimi seçimi zorunludur.' });
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateTuketiciKredisiKomisyonForm = (
    formData: any, 
    t: (key: string, options?: any) => string = (k) => k
): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    if (!formData?.baslangicTarihi) {
        errors.baslangicTarihi = t('validation.required_field', { defaultValue: 'Başlangıç tarihi zorunludur.' });
    }
    if (formData?.bitisTarihi && new Date(formData.bitisTarihi) < new Date(formData.baslangicTarihi)) {
        errors.bitisTarihi = t('validation.date_range_error', { defaultValue: 'Bitiş tarihi başlangıç tarihinden önce olamaz.' });
    }
    if (!formData?.satirlar || formData.satirlar.length === 0) {
        errors.satirlar = t('validation.required_rows', { defaultValue: 'En az bir komisyon satırı eklenmelidir.' });
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
