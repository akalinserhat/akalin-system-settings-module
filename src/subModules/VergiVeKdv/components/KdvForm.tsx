import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const getLocalDateString = (dateObj = new Date()) => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export interface KdvFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onTitleChange?: (title: string) => void;
  onSavingChange?: (isSaving: boolean) => void;
}

const KdvForm: React.FC<KdvFormProps> = ({ 
  initialData, 
  onSuccess, 
  onCancel, 
  onDirtyChange, 
  onTitleChange, 
  onSavingChange 
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    kod: '',
    ad: '',
    aktifMi: true,
    oranlar: [{ oran: 20, baslangicTarihi: getLocalDateString() }]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        kod: initialData.kod || '',
        ad: initialData.ad || '',
        aktifMi: initialData.aktifMi ?? true,
        oranlar: initialData.oranlar && initialData.oranlar.length > 0 ? initialData.oranlar.map((o: any) => {
          const d = new Date(o.baslangicTarihi);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return {
            oran: o.oran,
            baslangicTarihi: `${yyyy}-${mm}-${dd}`
          };
        }) : [{ oran: 20, baslangicTarihi: getLocalDateString() }]
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (onTitleChange && formData.ad) {
      onTitleChange(formData.ad);
    }
  }, [formData.ad, onTitleChange]);

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(formData.kod !== (initialData?.kod || '') || formData.ad !== (initialData?.ad || ''));
    }
  }, [formData, initialData, onDirtyChange]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onSavingChange) onSavingChange(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const hasActiveRate = formData.oranlar.some(o => {
      const baslangic = new Date(o.baslangicTarihi);
      baslangic.setHours(0, 0, 0, 0);
      return baslangic <= today;
    });

    if (!hasActiveRate) {
      toast.error(t('kdv_gecerli_oran_uyari', 'KDV grubunun kullanılabilmesi için en az bir oranın başlangıç tarihi bugüne (veya geçmişe) ait olmalıdır.'));
      if (onSavingChange) onSavingChange(false);
      return;
    }

    try {
      if (initialData?.id) {
        await axios.put(`/api/KdvGruplari/${initialData.id}`, formData);
      } else {
        await axios.post('/api/KdvGruplari', formData);
      }
      toast.success(t('kdv_grubu_kaydedildi', 'KDV grubu başarıyla kaydedildi.'));
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.mesaj || t('kdv_kaydedilemedi', 'Kaydedilemedi.'));
    } finally {
      if (onSavingChange) onSavingChange(false);
    }
  };

  const addOranSatiri = () => {
    setFormData(prev => ({
      ...prev,
      oranlar: [{ oran: 0, baslangicTarihi: getLocalDateString() }, ...prev.oranlar]
    }));
  };

  const removeOranSatiri = (index: number) => {
    setFormData(prev => {
      const newOranlar = [...prev.oranlar];
      newOranlar.splice(index, 1);
      return { ...prev, oranlar: newOranlar };
    });
  };

  const updateOran = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newOranlar = [...prev.oranlar];
      newOranlar[index] = { ...newOranlar[index], [field]: value };
      return { ...prev, oranlar: newOranlar };
    });
  };

  return (
    <form id="base-form" onSubmit={handleSave} className="flex-col gap-24">
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label required">{t('kdv_kodu', 'KDV Kodu')}</label>
          <input 
            type="text" 
            required 
            value={formData.kod}
            onChange={e => setFormData({...formData, kod: e.target.value})}
            placeholder={t('kdv_kodu_placeholder', 'Örn: KDV20')}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label required">{t('auto_grup_adi_0821', 'KDV Grubu Adı')}</label>
          <input 
            type="text" 
            required 
            value={formData.ad}
            onChange={e => setFormData({...formData, ad: e.target.value})}
            placeholder={t('kdv_adi_placeholder', "Örn: %20'lik KDV")}
            className="form-input"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-10">
        <label className="switch">
          <input
            type="checkbox"
            checked={formData.aktifMi}
            onChange={e => setFormData({...formData, aktifMi: e.target.checked})}
          />
          <span className="slider round"></span>
        </label>
        <span className="text-14 font-medium text-primary">
          {formData.aktifMi ? t('aktif_olarak_kullan', 'Aktif Olarak Kullan') : t('pasif', 'Pasif')}
        </span>
      </div>

      <div className="pt-20 border-t-glass flex-col gap-16">
        <div className="flex justify-between items-center">
          <h4 className="m-0 text-15 font-semibold text-primary">{t('tarihsel_oranlar', 'Tarihsel Oranlar')}</h4>
          <button 
            type="button" 
            onClick={addOranSatiri} 
            className="btn btn-ghost text-primary text-13 font-semibold flex items-center gap-6"
          >
            <Plus size={16} /> {t('yeni_oran_ekle', 'Yeni Oran Ekle')}
          </button>
        </div>
        
        <div className="flex-col gap-12">
          {formData.oranlar.map((oran, idx) => (
            <div key={idx} className="surface-card p-16 rounded-12 border-glass flex gap-12 items-end">
              <div className="flex-1">
                <label className="form-label text-12 required">{t('auto_kdv_orani__38a6', 'KDV Oranı (%)')}</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  value={oran.oran}
                  onChange={e => updateOran(idx, 'oran', parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
              </div>
              <div className="flex-1">
                <label className="form-label text-12 required">{t('auto_baslangic_tarihi_0d33', 'Başlangıç Tarihi')}</label>
                <input 
                  type="date" 
                  required 
                  value={oran.baslangicTarihi}
                  onChange={e => updateOran(idx, 'baslangicTarihi', e.target.value)}
                  className="form-input"
                />
              </div>
              {formData.oranlar.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeOranSatiri(idx)} 
                  className="btn btn-ghost text-danger p-8 mb-2"
                  title={t('auto_sil', 'Sil')}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};

export default KdvForm;
