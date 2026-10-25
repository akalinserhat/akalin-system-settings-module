import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ParaBirimiEntegrasyonForm = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    DovizEntegrasyon_Kaynak: 'Manuel',
    DovizEntegrasyon_ApiKey: '',
    DovizEntegrasyon_OtomatikGuncelle: 'false'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/FirmaAyarlari/ParaBirimleri');
        const data = response.data || {};
        setFormData({
          DovizEntegrasyon_Kaynak: data.DovizEntegrasyon_Kaynak || 'Manuel',
          DovizEntegrasyon_ApiKey: data.DovizEntegrasyon_ApiKey || '',
          DovizEntegrasyon_OtomatikGuncelle: data.DovizEntegrasyon_OtomatikGuncelle || 'false'
        });
      } catch (err) {
        console.error('Ayarlar yüklenemedi', err);
        toast.error(t('ParaBirimiEntegrasyonForm_loadError') || 'Entegrasyon ayarları yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/api/FirmaAyarlari/ParaBirimleri', formData);
      toast.success(t('ParaBirimiEntegrasyonForm_saveSuccess') || 'Entegrasyon ayarları başarıyla kaydedildi.');
    } catch (err: any) {
      toast.error(err.response?.data?.mesaj || t('ParaBirimiEntegrasyonForm_saveError') || 'Kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center text-secondary text-14">
        {t('auto_yukleniyor_4deb') || 'Yükleniyor...'}
      </div>
    );
  }

  const showApiKey = formData.DovizEntegrasyon_Kaynak === 'TCMB_EVDS' || formData.DovizEntegrasyon_Kaynak === 'CollectAPI';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-20 p-24">
      <div className="flex flex-col gap-16">
        
        <div className="form-group flex flex-col gap-8">
          <label className="font-semibold text-secondary text-13">
            {t('ParaBirimiEntegrasyonForm_kaynak') || 'Entegrasyon Kaynağı'}
          </label>
          <select
            autoFocus
            className="form-input"
            value={formData.DovizEntegrasyon_Kaynak}
            onChange={(e) => setFormData({ ...formData, DovizEntegrasyon_Kaynak: e.target.value })}
          >
            <option value="Manuel">{t('ParaBirimiEntegrasyonForm_manuel') || 'Manuel (Otomatik Güncelleme Kapalı)'}</option>
            <option value="TCMB_XML">{t('ParaBirimiEntegrasyonForm_tcmbXml') || 'TCMB XML (Ücretsiz / Anahtarsız)'}</option>
            <option value="TCMB_EVDS">{t('ParaBirimiEntegrasyonForm_tcmbEvds') || 'TCMB EVDS (API Anahtarlı)'}</option>
            <option value="CollectAPI">{t('ParaBirimiEntegrasyonForm_collectApi') || 'CollectAPI (Anlık / Serbest Piyasa)'}</option>
          </select>
        </div>

        {showApiKey && (
          <div className="form-group flex flex-col gap-8">
            <label className="font-semibold text-secondary text-13">
              {t('ParaBirimiEntegrasyonForm_apiKey') || 'API Anahtarı / Token'}
            </label>
            <input
              type="password"
              className="form-input"
              value={formData.DovizEntegrasyon_ApiKey}
              onChange={(e) => setFormData({ ...formData, DovizEntegrasyon_ApiKey: e.target.value })}
              placeholder={t('ParaBirimiEntegrasyonForm_apiKeyPlaceholder') || 'API anahtarınızı girin...'}
            />
          </div>
        )}

        <div className="form-group">
          <label className="items-center gap-10 cursor-pointer flex">
            <input
              type="checkbox"
              className="checkbox-input"
              checked={formData.DovizEntegrasyon_OtomatikGuncelle === 'true'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  DovizEntegrasyon_OtomatikGuncelle: e.target.checked ? 'true' : 'false',
                })
              }
            />
            <span className="text-primary font-500 text-14">
              {t('ParaBirimiEntegrasyonForm_otomatikGuncelle') || 'Her Gün Saat 15:30\'da Kurları Otomatik Güncelle'}
            </span>
          </label>
        </div>

      </div>

      <div className="flex justify-end pt-16 border-t border-glass mt-12">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary flex items-center gap-8"
        >
          <Save size={18} />
          {saving ? t('auto_kaydediliyor_23ab') || 'Kaydediliyor...' : t('Kaydet') || 'Kaydet'}
        </button>
      </div>
    </form>
  );
};

export default ParaBirimiEntegrasyonForm;
