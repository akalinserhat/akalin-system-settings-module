import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { HarfDonusumu } from '@akalin/ui';
import { toast } from 'react-hot-toast';
import { AlertCircle, Save } from 'lucide-react';
import { BaseButton, TemplateBuilder } from '@akalin/ui';
import { useTranslation } from 'react-i18next';

const urunTurleri = [
  { id: 1, key: 'UrunTuru_1_KisaKod', name: 'Ürün', placeholder: 'Örn: ÜR' },
  { id: 2, key: 'UrunTuru_2_KisaKod', name: 'Hizmet', placeholder: 'Örn: HZ' },
  { id: 3, key: 'UrunTuru_3_KisaKod', name: 'Sarf Malzemesi', placeholder: 'Örn: SM' },
  { id: 4, key: 'UrunTuru_4_KisaKod', name: 'Hammadde', placeholder: 'Örn: HM' },
  { id: 5, key: 'UrunTuru_5_KisaKod', name: 'Demirbaş', placeholder: 'Örn: DB' },
  { id: 6, key: 'UrunTuru_6_KisaKod', name: 'Yarı Mamul', placeholder: 'Örn: YM' },
  { id: 7, key: 'UrunTuru_7_KisaKod', name: 'Mamul', placeholder: 'Örn: MM' },
  { id: 8, key: 'UrunTuru_8_KisaKod', name: 'Paket / Set', placeholder: 'Örn: PS' }
];

const UrunVeHizmetlerAyarlari = () => {
  const { t } = useTranslation();

  const tagGroups = useMemo(() => [
    { title: t('auto_temel_etiketler', 'Temel Etiketler'), tags: ['[Sayaç]', '[Üretici Kodu]', '[Ürün Türü Kısa Kod]'] },
    { title: t('auto_urun_grubu', 'Ürün Grubu'), tags: ['[Ürün Grubu]', '[Ürün Grubu Tekil]', '[Ürün Grubu Kısa Kod]'] },
    { title: t('auto_marka', 'Marka'), tags: ['[Marka]', '[Marka Kısa Kod]'] },
    { title: t('auto_ozellikler', 'Özellikler'), tags: ['[Özellik 1]', '[Özellik 2]', '[Özellik 3]', '[Özellik 4]'] }
  ], [t]);

  const DEFAULT_SETTINGS = useMemo(() => ({
    KodSablonu: '[Ürün Grubu Kısa Kod]-[Sayaç]',
    AciklamaSablonu: '[Marka] [Ürün Grubu Tekil]',
    SayacUzunlugu: 5,
    UreticiKoduMetinTercihi: 'hepsiBuyuk',
    UrunTuru_1_KisaKod: 'ÜR',
    UrunTuru_2_KisaKod: 'HZ',
    UrunTuru_3_KisaKod: 'SM',
    UrunTuru_4_KisaKod: 'HM',
    UrunTuru_5_KisaKod: 'DB',
    UrunTuru_6_KisaKod: 'YM',
    UrunTuru_7_KisaKod: 'MM',
    UrunTuru_8_KisaKod: 'PS'
  }), []);

  const [settings, setSettings] = useState<Record<string, any>>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const casingOptions: Array<{
    id: HarfDonusumu;
    title: string;
    description: string;
    example: string;
  }> = useMemo(() => [
    {
      id: 'hepsiBuyuk',
      title: t('harf_donusumu_buyuk_baslik', 'Tümü Büyük Harf'),
      description: t('uretici_kodu_buyuk_aciklama', 'Üretici kodu girişinde tüm harfler otomatik olarak büyük harfe dönüştürülür.'),
      example: 'PRD-ABC-01'
    },
    {
      id: 'basHarflerBuyuk',
      title: t('harf_donusumu_basharfler_baslik', 'İlk Harfleri Büyük'),
      description: t('uretici_kodu_basharfler_aciklama', 'Üretici kodundaki her kelimenin ilk harfi büyük, diğer harfleri küçük harfe dönüştürülür.'),
      example: 'Prd-Abc-01'
    },
    {
      id: 'hepsiKucuk',
      title: t('harf_donusumu_kucuk_baslik', 'Tümü Küçük Harf'),
      description: t('uretici_kodu_kucuk_aciklama', 'Üretici kodu girişinde tüm harfler otomatik olarak küçük harfe dönüştürülür.'),
      example: 'prd-abc-01'
    },
    {
      id: 'girildigiGibi',
      title: t('harf_donusumu_serbest_baslik', 'Serbest (Dönüşüm Yok)'),
      description: t('uretici_kodu_serbest_aciklama', 'Kullanıcının yazdığı karakterler olduğu gibi korunur.'),
      example: 'Prd-aBc-01'
    }
  ], [t]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/FirmaAyarlari/UrunVeHizmetler`);
      const data = res.data || {};
      setSettings({
        ...DEFAULT_SETTINGS,
        ...data,
        KodSablonu: data.KodSablonu || data.kodSablonu || DEFAULT_SETTINGS.KodSablonu,
        AciklamaSablonu: data.AciklamaSablonu || data.aciklamaSablonu || DEFAULT_SETTINGS.AciklamaSablonu,
        SayacUzunlugu: data.SayacUzunlugu ? Number(data.SayacUzunlugu) : DEFAULT_SETTINGS.SayacUzunlugu
      });
    } catch (err) {
      console.error('Ayarlar yüklenemedi:', err);
      setSettings(DEFAULT_SETTINGS);
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
      await axios.post(`/api/FirmaAyarlari/UrunVeHizmetler`, payload);
      toast.success(t('ayarlar_basariyla_kaydedildi', 'Ayarlar başarıyla kaydedildi.'));
    } catch (err: any) {
      console.error(err);
      toast.error(t('islem_basarisiz_oldu', 'İşlem başarısız oldu.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-24 text-center text-secondary">{t('auto_yukleniyor_4deb')}</div>;
  }

  return (
    <div className="fade-in">
      <div className="mb-24">
        <p className="text-secondary text-14 m-0">
          {t('urun_kartlari_olusturulurken_kod', 'Ürün kartları oluşturulurken Kod ve Açıklama (İsim) alanlarının otomatik olarak nasıl oluşturulacağını belirleyin.')}
        </p>
      </div>

      <div className="flex flex-col gap-32">
        <TemplateBuilder
          title={t('urun_kodu_sablonu', 'Ürün Kodu Şablonu')}
          value={settings['KodSablonu'] || ''}
          onChange={(newVal) => setSettings({...settings, KodSablonu: newVal})}
          availableTags={tagGroups}
          showCounterSettings={true}
          counterLength={settings['SayacUzunlugu'] || 5}
          onCounterLengthChange={(newLen) => setSettings({...settings, SayacUzunlugu: newLen})}
        />

        <TemplateBuilder
          title={t('urun_aciklama_sablonu', 'Ürün Açıklama Şablonu')}
          value={settings['AciklamaSablonu'] || ''}
          onChange={(newVal) => setSettings({...settings, AciklamaSablonu: newVal})}
          availableTags={tagGroups}
        />
      </div>

      <div className="mt-40">
        <h4 className="m-0 mb-16 text-16 pb-12 border-b border-glass">{t('auto_urun_turu_kisa_kodla_2068')}</h4>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {urunTurleri.map((tur, idx) => (
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

      <div className="mt-40">
        <h4 className="m-0 mb-16 text-16 pb-12 border-b border-glass">{t('uretici_kodu_metin_tercihleri_baslik', 'Üretici Kodu Metin Giriş Tercihleri')}</h4>
        <p className="text-secondary text-14 mb-16">
          {t('uretici_kodu_metin_tercihleri_aciklama', 'Ürün kartı sayfasında Üretici Kodu alanında metinlerin otomatik nasıl dönüştürüleceğini belirleyin.')}
        </p>
        <div className="casing-options-grid">
          {casingOptions.map((opt) => {
            const currentCasing = settings['UreticiKoduMetinTercihi'] || 'hepsiBuyuk';
            const isSelected = currentCasing === opt.id || (opt.id === 'girildigiGibi' && (currentCasing === 'none' || currentCasing === 'serbest'));
            return (
              <label
                key={opt.id}
                className={`casing-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="casing-card-header">
                  <input
                    type="radio"
                    name="ureticiKoduMetinTercihi"
                    className="casing-radio"
                    checked={isSelected}
                    onChange={() => setSettings({...settings, UreticiKoduMetinTercihi: opt.id})}
                  />
                  <span className="casing-card-title">{opt.title}</span>
                </div>
                <div className="casing-card-example">
                  {opt.description}
                </div>
                <div className="casing-card-example">
                  {t('ornek_etiketi', 'Örnek:')} <span className="casing-card-preview-value">{opt.example}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
      
      <div className="mt-24 p-12 rounded-8 flex items-start gap-12" style={{ background: 'rgba(255,165,0,0.1)' }}>
        <AlertCircle style={{ color: 'orange', flexShrink: 0 }} size={20} />
        <p className="m-0 text-13 text-secondary leading-normal">
          <strong>{t('not', 'Not:')}</strong> {t('sayac_etiketi_urun', '[Sayaç] etiketi, ürün kaydedilirken otomatik artan bir numara atar. [Özellik X] etiketleri ise, seçilen ürün grubunun özelliklerinden çekilir.')}
        </p>
      </div>
      
      <div className="flex justify-end mt-24 pt-20 border-t border-glass">
        <BaseButton 
          onClick={handleSave} 
          isSaving={saving} 
          text={t('degisiklikleri_kaydet', 'Değişiklikleri Kaydet')} 
          icon={<Save size={18} />}
        />
      </div>
    </div>
  );
};

export default UrunVeHizmetlerAyarlari;
