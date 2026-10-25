/**
 * Webakus - Sistem Ayarları / POS Cihazı Formu Varsayılan Değerleri (posCihazDefaultValue.ts)
 * 
 * Başlıca Görevleri:
 * - POS Cihazı formu için ilk açılış varsayılan verilerini ve odaklanılacak alanı sunmak
 */

import axios from 'axios';

export const getPosCihazDefaults = () => {
    return {
        values: {
            ad: '',
            aktifMi: true,
            tip: 1,          // 1: Fiziksel POS varsayılan
            bankaId: '',
            bankaHesapId: '',
            paraBirimi: '' as number | '',
            geriDonusTuru: 1, // 1: Normal (Anında) varsayılan — zorunlu alan
            merchantId: '',
            terminalId: '',
            storeKey: '',
            apiUser: '',
            apiPassword: '',
            secure3DType: 1
        },
        focusId: 'pos-banka-secici' // İlk odaklanılacak inputun DOM ID'si
    };
};

/**
 * Sistemde tanımlı varsayılan para birimini dinamik olarak çeker
 * ve formun başlangıç değerlerine ekler (AGENTS.md form default value mimarisi).
 */
export const fetchPosCihazDefaultValues = async () => {
    const defaults = getPosCihazDefaults();
    try {
        const res = await axios.get('/api/ParaBirimleri');
        const list = Array.isArray(res.data) ? res.data : [];
        const varsayilan = list.find((p: any) => p.varsayilanMi && p.aktifMi !== false) 
            || list.find((p: any) => p.aktifMi !== false);
        if (varsayilan?.id) {
            defaults.values.paraBirimi = Number(varsayilan.id);
        }
    } catch (err) {
        console.error('Varsayılan para birimi yüklenemedi:', err);
    }
    return defaults;
};

