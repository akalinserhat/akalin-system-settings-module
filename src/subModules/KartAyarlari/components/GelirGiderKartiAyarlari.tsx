import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AlertCircle, Save } from 'lucide-react';
import { BaseButton, TemplateBuilder } from '@akalin/ui';
import { useTranslation } from 'react-i18next';

const tagGroups = [
  { title: 'Değişkenler', tags: ['[Kart Türü Kısa Kodu]', '[Sayaç]'] }
];

const kartTurleri = [
  { id: 1, key: 'KartTuru_Gelir_KisaKod', name: 'Gelir Kartı', placeholder: 'Örn: GLR' },
  { id: 2, key: 'KartTuru_Gider_KisaKod', name: 'Gider Kartı', placeholder: 'Örn: GDR' }
];

const GelirGiderKartiAyarlari = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/FirmaAyarlari/GelirGiderKartlari`);
      // Eğer ayar hiç yoksa varsayılanları set et
      const defaultSettings = res.data && Object.keys(res.data).length > 0 ? res.data : {
        'KodSablonu': '[Kart Türü Kısa Kodu]-[Sayaç]',
        'KartTuru_Gelir_KisaKod': 'GLR',
        'KartTuru_Gider_KisaKod': 'GDR',
        'SayacUzunlugu': 5
      };
      setSettings(defaultSettings);
    } catch (err) {
      console.error('Ayarlar yüklenemedi:', err);
      // Fallback
      setSettings({
        'KodSablonu': '[Kart Türü Kısa Kodu]-[Sayaç]',
        'KartTuru_Gelir_KisaKod': 'GLR',
        'KartTuru_Gider_KisaKod': 'GDR',
        'SayacUzunlugu': 5
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      Object.keys(settings).forEach((key) => {
        const val = settings[key];
        payload[key] = val !== undefined && val !== null ? String(val) : '';
      });
      await axios.post(`/api/FirmaAyarlari/GelirGiderKartlari`, payload);
      toast.success(t('auto_ayarlar_basariyla_95c4', 'Ayarlar başarıyla kaydedildi.'));
    } catch (err: any) {
      console.error(err);
      toast.error(t('auto_islem_basarisiz_ob4f', 'İşlem başarısız oldu.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-24 text-center text-secondary">{t('auto_yukleniyor_4deb', 'Yükleniyor...')}</div>;
  }

  return (
    <div className="fade-in">
      <div className="mb-24">
        <p className="text-secondary text-14 m-0">
          {t('auto_gelir_gider_kartl_e297', 'Gelir ve Gider kartları oluşturulurken Kod alanının otomatik olarak nasıl oluşturulacağını belirleyin.')}
        </p>
      </div>

      <div className="flex flex-col gap-32">
        <TemplateBuilder
          title={t('auto_kart_kodu_sablonu_8cf1', 'Kart Kodu Şablonu')}
          value={settings['KodSablonu'] || ''}
          onChange={(newVal) => setSettings({...settings, KodSablonu: newVal})}
          availableTags={tagGroups}
          showCounterSettings={true}
          counterLength={settings['SayacUzunlugu'] || 5}
          onCounterLengthChange={(newLen) => setSettings({...settings, SayacUzunlugu: newLen})}
        />
      </div>

      <div className="mt-40">
        <h4 className="m-0 mb-16 text-16 pb-12 border-b border-glass">
          {t('auto_kart_turu_kisa_k_4b02', 'Kart Türü Kısa Kodları')}
        </h4>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {kartTurleri.map((tur, idx) => (
            <div className="form-group" key={tur.id}>
              <label>{tur.name}</label>
              <input
                type="text"
                autoFocus={idx === 0}
                value={settings[tur.key] || ''}
                onChange={(e) => setSettings({...settings, [tur.key]: e.target.value.toUpperCase()})}
                placeholder={tur.placeholder}
                maxLength={3}
                className="form-input uppercase"
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-24 p-12 rounded-8 flex items-start gap-12" style={{ background: 'rgba(255,165,0,0.1)' }}>
        <AlertCircle style={{ color: 'orange', flexShrink: 0 }} size={20} />
        <p className="m-0 text-13 text-secondary leading-normal">
          <strong>{t('auto_not_01ea', 'Not:')}</strong> {t('auto_sayac_etiketi_k_b160', '[Sayaç] etiketi, kart kaydedilirken otomatik artan bir numara atar.')}
        </p>
      </div>
      
      <div className="flex justify-end mt-24 pt-20 border-t border-glass">
        <BaseButton 
          onClick={handleSave} 
          isSaving={saving} 
          text={t('auto_degisiklikleri_kayd_ecb4', 'Değişiklikleri Kaydet')}
          icon={<Save size={18} />}
        />
      </div>
    </div>
  );
};

export default GelirGiderKartiAyarlari;
