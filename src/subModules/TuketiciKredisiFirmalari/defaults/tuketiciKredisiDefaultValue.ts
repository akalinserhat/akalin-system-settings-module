/**
 * Webakus - Sistem Ayarları / Tüketici Kredisi Formu Varsayılan Değerleri (tuketiciKredisiDefaultValue.ts)
 * 
 * Başlıca Görevleri:
 * - Tüketici kredisi firması ve komisyon belgeleri için ilk açılış varsayılan verilerini sunmak
 */

export const getTuketiciKredisiDefaults = () => {
    return {
        values: {
            kod: '',
            ad: '',
            bankaId: '',
            bankaHesapId: '',
            paraBirimiId: 1, // TRY varsayılan
            aktifMi: true,
            aciklama: ''
        },
        focusId: 'tk-kod-input'
    };
};

export const getTuketiciKredisiKomisyonDefaults = (tuketiciKredisiFirmasiId: number) => {
    return {
        values: {
            tuketiciKredisiFirmasiId,
            baslangicTarihi: new Date().toISOString().split('T')[0],
            bitisTarihi: '',
            aktifMi: true,
            aciklama: '',
            satirlar: []
        },
        focusId: 'tkk-baslangic-tarihi'
    };
};
