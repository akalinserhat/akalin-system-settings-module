import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Save, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TemplateBuilder } from '@akalin/ui';
import { useTranslation } from 'react-i18next';

const CariAyarlar = () => {
  const { t } = useTranslation();
  const [ayar, setAyar] = useState({
    kodSablonu: '[Cari Türü Kısa Kodu]-[Sayaç]',
    sayacUzunlugu: 5,
    aliciKarakteri: 'AL',
    saticiKarakteri: 'SA',
    aliciSaticiKarakteri: 'AS',
    personelKarakteri: 'PE',
    bireyselUnvanSablonu: 2
  });
  const [initialAyar, setInitialAyar] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const tagGroups = [
    { title: 'Değişkenler', tags: ['[Cari Türü Kısa Kodu]', '[Sayaç]'] }
  ];

  useEffect(() => {
    fetchAyarlar();
  }, []);

  const fetchAyarlar = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/CariAyarlar');
      if (response.data.ayar) {
        setAyar(response.data.ayar);
        setInitialAyar(response.data.ayar);
      } else {
        setInitialAyar(ayar);
      }
      setIsLocked(response.data.isLocked);
    } catch (err) {
      toast.error(t('ayarlar_yuklenirken_hata', 'Ayarlar yüklenirken hata oluştu.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put('/api/CariAyarlar', ayar);
      setInitialAyar(ayar);
      toast.success(t('cari_hesap_ayarlari_kaydedildi', 'Cari hesap ayarları başarıyla kaydedildi.'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('ayarlar_kaydedilirken_hata', 'Ayarlar kaydedilirken hata oluştu.'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setAyar({ ...ayar, [field]: value });
  };

  const getFinalCodePreview = (prefix) => {
    const paddingStr = '1'.padStart(ayar.sayacUzunlugu || 5, '0');
    const sablon = ayar.kodSablonu || '[Cari Türü Kısa Kodu]-[Sayaç]';
    return sablon
      .replace('[Cari Türü Kısa Kodu]', prefix || '')
      .replace('[Sayaç]', paddingStr);
  };

  const isDirty = initialAyar && (
    ayar.kodSablonu !== initialAyar.kodSablonu ||
    ayar.sayacUzunlugu !== initialAyar.sayacUzunlugu ||
    ayar.aliciKarakteri !== initialAyar.aliciKarakteri ||
    ayar.saticiKarakteri !== initialAyar.saticiKarakteri ||
    ayar.aliciSaticiKarakteri !== initialAyar.aliciSaticiKarakteri ||
    ayar.personelKarakteri !== initialAyar.personelKarakteri ||
    ayar.bireyselUnvanSablonu !== initialAyar.bireyselUnvanSablonu
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      
      {/* Lock Banner */}
      {isLocked && (
        <div className="mb-24 p-16 flex gap-16 items-start" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px' }}>
          <div className="mt-4" style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '50%', flexShrink: 0 }}>
            <Lock size={24} color="#ef4444" />
          </div>
          <div>
            <h4 className="m-0 mb-8 font-bold text-16" style={{ color: '#b91c1c' }}>{t('ayarlar_kilitlendi', 'Ayarlar Kilitlendi')}</h4>
            <p className="m-0 text-14" style={{ color: '#991b1b', lineHeight: '1.5' }}>
              {t('sistemde_daha_onceden_olusturulmus', 'Sistemde daha önceden oluşturulmuş Cari Hesap kayıtları bulunduğu için sayaçların çakışmasını engellemek amacıyla')} <strong>{t('auto_cari_kodu_ve_sayac_53ef')}</strong> {t('auto_ayarlari_saltokunur__a071', 'ayarları salt-okunur (read-only) moda alınmıştır. Bireysel Cari Ünvan Görünümü ayarını değiştirmeye devam edebilirsiniz.')}
            </p>
          </div>
        </div>
      )}

      {/* Template Builder */}
      <div className={isLocked ? 'opacity-70' : ''}>
        <TemplateBuilder
          title={t('cari_kodu_sablonu', 'Cari Kodu Şablonu')}
          value={ayar.kodSablonu || ''}
          onChange={(newVal) => handleChange('kodSablonu', newVal)}
          availableTags={tagGroups}
          showCounterSettings={true}
          counterLength={ayar.sayacUzunlugu}
          onCounterLengthChange={(newLen) => handleChange('sayacUzunlugu', newLen)}
          disabled={isLocked}
        />
      </div>

      <div className={`mt-32 ${isLocked ? 'opacity-70' : ''}`}>
        <h4 className="m-0 mb-16 text-16 pb-12 border-b border-glass">{t('auto_cari_turu_kisa_kodla_0809')}</h4>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          
          <div className="form-group">
            <label>{t('auto_alici_musteri_d322')}</label>
            <input
              type="text"
              autoFocus
              className="form-input"
              style={{ textTransform: 'uppercase' }}
              value={ayar.aliciKarakteri || ''}
              onChange={(e) => handleChange('aliciKarakteri', e.target.value.toUpperCase())}
              placeholder="Örn: AL"
              maxLength={5}
              disabled={isLocked}
            />
            <div className="mt-8 text-12 text-muted">{t('auto_onizleme_7a82')} <span className="text-accent-primary font-bold">{getFinalCodePreview(ayar.aliciKarakteri)}</span></div>
          </div>

          <div className="form-group">
            <label>{t('auto_satici_tedarikci_5792')}</label>
            <input
              type="text"
              className="form-input"
              style={{ textTransform: 'uppercase' }}
              value={ayar.saticiKarakteri || ''}
              onChange={(e) => handleChange('saticiKarakteri', e.target.value.toUpperCase())}
              placeholder="Örn: SA"
              maxLength={5}
              disabled={isLocked}
            />
            <div className="mt-8 text-12 text-muted">{t('auto_onizleme_7a82')} <span className="text-accent-primary font-bold">{getFinalCodePreview(ayar.saticiKarakteri)}</span></div>
          </div>

          <div className="form-group">
            <label>{t('auto_alici_satici_29e6', 'Alıcı & Satıcı')}</label>
            <input
              type="text"
              className="form-input"
              style={{ textTransform: 'uppercase' }}
              value={ayar.aliciSaticiKarakteri || ''}
              onChange={(e) => handleChange('aliciSaticiKarakteri', e.target.value.toUpperCase())}
              placeholder="Örn: AS"
              maxLength={5}
              disabled={isLocked}
            />
            <div className="mt-8 text-12 text-muted">{t('auto_onizleme_7a82')} <span className="text-accent-primary font-bold">{getFinalCodePreview(ayar.aliciSaticiKarakteri)}</span></div>
          </div>

          <div className="form-group">
            <label>{t('personel', 'Personel')}</label>
            <input
              type="text"
              className="form-input"
              style={{ textTransform: 'uppercase' }}
              value={ayar.personelKarakteri || ''}
              onChange={(e) => handleChange('personelKarakteri', e.target.value.toUpperCase())}
              placeholder="Örn: PE"
              maxLength={5}
              disabled={isLocked}
            />
            <div className="mt-8 text-12 text-muted">{t('auto_onizleme_7a82')} <span className="text-accent-primary font-bold">{getFinalCodePreview(ayar.personelKarakteri)}</span></div>
          </div>

        </div>
      </div>
      
      <div className="mt-32">
        <h4 className="m-0 mb-16 text-16 pb-12 border-b border-glass">{t('auto_bireysel_cari_unvan__8841')}</h4>
        <p className="text-secondary text-13 mb-16">
          {t('bireysel_cari_kayitlarinda_ad', 'Bireysel cari kayıtlarında Ad, Orta İsim ve Soyad bilgilerinin')} <b>{t('auto_unvan_b865')}</b> {t('auto_alaninda_nasil_birle_4d9c')}
        </p>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {[
            { id: 1, label: '[İsim] [Orta İsim] [Soyisim]', ex: 'Ahmet Can Yılmaz' },
            { id: 2, label: '[Soyisim], [İsim] [Orta İsim]', ex: 'Yılmaz, Ahmet Can' },
            { id: 3, label: '[Soyisim] [İsim] [Orta İsim]', ex: 'Yılmaz Ahmet Can' },
            { id: 4, label: '[İsim] [Soyisim]', ex: 'Ahmet Yılmaz' }
          ].map(sablon => (
            <label 
              key={sablon.id} 
              className={`flex flex-col gap-8 p-16 rounded-12 border cursor-pointer transition-all ${ayar.bireyselUnvanSablonu === sablon.id ? 'border-accent-primary bg-accent-light' : 'border-glass bg-primary'}`}
            >
              <div className="flex items-center gap-12">
                <input 
                  type="radio" 
                  name="bireyselUnvanSablonu" 
                  checked={ayar.bireyselUnvanSablonu === sablon.id}
                  onChange={() => handleChange('bireyselUnvanSablonu', sablon.id)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
                <span className="font-600 text-14 text-primary">{sablon.label}</span>
              </div>
              <div className="pl-28 text-13 text-secondary">{t('auto_ornek_3d9d', 'Örnek:')} <span className="text-primary font-500">{sablon.ex}</span></div>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-32 pt-24 border-t border-glass flex justify-end">
        <button 
          className="btn btn-primary" 
          onClick={handleSave}
          disabled={saving || !isDirty}
        >
          {saving ? <div className="spinner w-16 h-16 mr-8"></div> : <Save size={16} className="mr-8" />}
          {saving ? t('kaydediliyor', 'Kaydediliyor...') : t('degisiklikleri_kaydet', 'Değişiklikleri Kaydet')}
        </button>
      </div>
      
    </div>
  );
};

export default CariAyarlar;
