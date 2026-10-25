import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { updateDovizKuru, DovizKuruDto } from '../api/dovizKuruApi';

interface GunlukKurDuzenleFormProps {
  rate: DovizKuruDto;
  onSuccess: () => void;
  onCancel: () => void;
}

const GunlukKurDuzenleForm = ({ rate, onSuccess, onCancel }: GunlukKurDuzenleFormProps) => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    dovizAlis: rate.dovizAlis,
    dovizSatis: rate.dovizSatis,
    efektifAlis: rate.efektifAlis,
    efektifSatis: rate.efektifSatis
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDovizKuru(rate.id, formData);
      toast.success(t('GunlukKurDuzenleForm_saveSuccess') || 'Kur bilgisi başarıyla güncellendi.');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.mesaj || t('GunlukKurDuzenleForm_saveError') || 'Güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between">
      <div className="flex flex-col gap-16 p-24 overflow-y-auto">
        <h3 className="m-0 text-16 font-bold mb-12">
          {rate.paraBirimiKod} {t('GunlukKurDuzenleForm_titleSuffix') || 'Kuru Güncelle'}
        </h3>
        
        <div className="flex flex-col gap-12">
          <div className="form-group flex flex-col gap-8">
            <label className="font-semibold text-secondary text-13">
              {t('DovizAlis') || 'Döviz Alış'}
            </label>
            <input
              autoFocus
              type="number"
              step="0.0001"
              required
              className="form-input"
              value={formData.dovizAlis}
              onChange={(e) => setFormData({ ...formData, dovizAlis: Number(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group flex flex-col gap-8">
            <label className="font-semibold text-secondary text-13">
              {t('DovizSatis') || 'Döviz Satış'}
            </label>
            <input
              type="number"
              step="0.0001"
              required
              className="form-input"
              value={formData.dovizSatis}
              onChange={(e) => setFormData({ ...formData, dovizSatis: Number(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group flex flex-col gap-8">
            <label className="font-semibold text-secondary text-13">
              {t('EfektifAlis') || 'Efektif Alış'}
            </label>
            <input
              type="number"
              step="0.0001"
              required
              className="form-input"
              value={formData.efektifAlis}
              onChange={(e) => setFormData({ ...formData, efektifAlis: Number(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group flex flex-col gap-8">
            <label className="font-semibold text-secondary text-13">
              {t('EfektifSatis') || 'Efektif Satış'}
            </label>
            <input
              type="number"
              step="0.0001"
              required
              className="form-input"
              value={formData.efektifSatis}
              onChange={(e) => setFormData({ ...formData, efektifSatis: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-12 p-20 border-t border-glass bg-secondary">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          {t('İptal') || 'İptal'}
        </button>
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

export default GunlukKurDuzenleForm;
