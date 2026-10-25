import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { BasePopup, BaseSwitch, AlertDialog } from '@akalin/ui';

export interface KdvFormModalProps {
  isOpen?: boolean;
  initialData?: any;
  onSuccess?: (data?: any) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  inMemoryMode?: boolean;
  onSaveMemory?: (data: any) => void;
}

const getLocalDateString = (dateObj = new Date()) => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const KdvFormModal: React.FC<KdvFormModalProps> = ({
  isOpen = true,
  initialData,
  onSuccess,
  onCancel,
  onDirtyChange,
  inMemoryMode = false,
  onSaveMemory
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    id: 0,
    kod: '',
    ad: '',
    varsayilanMi: false,
    aktifMi: true,
    oranlar: [{ oran: 20, baslangicTarihi: getLocalDateString() }]
  });
  const [saving, setSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  useEffect(() => {
    if (initialData) {
      const oranlarList = initialData.oranlar && initialData.oranlar.length > 0
        ? initialData.oranlar.map((o: any) => {
            const dStr = typeof o.baslangicTarihi === 'string' 
              ? o.baslangicTarihi.split('T')[0] 
              : getLocalDateString(new Date(o.baslangicTarihi));
            return {
              oran: typeof o.oran === 'number' ? o.oran : (parseFloat(o.oran) || 0),
              baslangicTarihi: dStr || getLocalDateString()
            };
          })
        : [{ oran: initialData.oran ?? 20, baslangicTarihi: getLocalDateString() }];

      setFormData({
        id: initialData.id || 0,
        kod: initialData.kod || '',
        ad: initialData.ad || '',
        varsayilanMi: initialData.varsayilanMi || false,
        aktifMi: initialData.aktifMi ?? true,
        oranlar: oranlarList
      });
    } else {
      setFormData({
        id: 0,
        kod: '',
        ad: '',
        varsayilanMi: false,
        aktifMi: true,
        oranlar: [{ oran: 20, baslangicTarihi: getLocalDateString() }]
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(
        formData.kod !== (initialData?.kod || '') ||
        formData.ad !== (initialData?.ad || '')
      );
    }
  }, [formData, initialData, onDirtyChange]);

  const addOranSatiri = () => {
    setFormData(prev => ({
      ...prev,
      oranlar: [...prev.oranlar, { oran: 0, baslangicTarihi: getLocalDateString() }]
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

  const executeSave = async () => {
    if (!formData.kod?.trim()) {
      toast.error(t('kdv_kodu_zorunlu', 'KDV Kodu zorunludur.'));
      return;
    }
    if (!formData.ad?.trim()) {
      toast.error(t('kdv_adi_zorunlu', 'KDV Grup Adı zorunludur.'));
      return;
    }
    if (!formData.oranlar || formData.oranlar.length === 0) {
      toast.error(t('kdv_orani_zorunlu', 'En az bir KDV oranı tanımlanmalıdır.'));
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hasActiveRate = formData.oranlar.some((o: any) => {
      const d = new Date(o.baslangicTarihi);
      d.setHours(0, 0, 0, 0);
      return d <= today;
    });

    if (!hasActiveRate) {
      toast.error(t('kdv_gecerli_tarih_hata', 'KDV grubunun kullanılabilmesi için en az bir oranın başlangıç tarihi bugüne veya geçmişe ait olmalıdır.'));
      return;
    }

    const aktifOranObj = formData.oranlar.find((o: any) => new Date(o.baslangicTarihi) <= today);
    const primaryOran = aktifOranObj?.oran ?? formData.oranlar[0]?.oran ?? 0;

    const payload = {
      ...formData,
      kod: formData.kod.trim().toUpperCase(),
      ad: formData.ad.trim(),
      oran: primaryOran
    };

    setSaving(true);
    try {
      if (inMemoryMode) {
        if (onSaveMemory) {
          onSaveMemory(payload);
        }
        toast.success(t('kdv_grubu_kaydedildi', 'KDV grubu başarıyla kaydedildi.'));
        if (onSuccess) onSuccess(payload);
      } else {
        if (initialData?.id) {
          await axios.put(`/api/KdvGruplari/${initialData.id}`, payload);
        } else {
          await axios.post('/api/KdvGruplari', payload);
        }
        toast.success(t('kdv_grubu_kaydedildi', 'KDV grubu başarıyla kaydedildi.'));
        if (onSuccess) onSuccess(payload);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.mesaj || t('Kaydedilemedi', 'Kaydedilemedi.'));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (formData.varsayilanMi && (!initialData || !initialData.varsayilanMi)) {
      setConfirmDialog({
        isOpen: true,
        title: t('kdv_varsayilan_degistir_baslik', 'Varsayılan KDV Grubu Değişikliği'),
        message: t(
          'kdv_varsayilan_degistir_mesaj',
          'Varsayılan KDV grubunu değiştirmek üzeresiniz. Daha önceki varsayılan KDV grubu devre dışı bırakılacak ve yeni varsayılan olarak bu grup atanacaktır. Devam etmek istiyor musunuz?'
        ),
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          executeSave();
        }
      });
    } else {
      executeSave();
    }
  };

  const title = initialData?.id || initialData?.kod
    ? t('kdv_grubu_duzenle', 'KDV Grubu Düzenle')
    : t('yeni_kdv_grubu', 'Yeni KDV Grubu');

  return (
    <>
      <BasePopup
        isOpen={isOpen}
        onClose={onCancel}
        title={title}
        modalSize="md"
        onSave={handleSave}
        isSaving={saving}
      >
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {t('kdv_kodu_etiket', 'KDV Kodu')} <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.kod}
                onChange={e => setFormData({ ...formData, kod: e.target.value.toUpperCase() })}
                placeholder={t('kdv_kodu_placeholder', 'Örn: KDV-20')}
                maxLength={20}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px', textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {t('kdv_grup_adi_etiket', 'KDV Grup Adı')} <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.ad}
                onChange={e => setFormData({ ...formData, ad: e.target.value })}
                placeholder={t('kdv_adi_placeholder', 'Örn: Genel KDV (%20)')}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <BaseSwitch
              checked={formData.varsayilanMi}
              onChange={e => setFormData({ ...formData, varsayilanMi: e.target.checked })}
              label={t('varsayilan_yap', 'Varsayılan Yap')}
            />
            <BaseSwitch
              checked={formData.aktifMi}
              onChange={e => setFormData({ ...formData, aktifMi: e.target.checked })}
              label={t('Aktif', 'Aktif')}
            />
          </div>

          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {t('tarihsel_oranlar', 'Tarihsel Oranlar')}
              </h4>
              <button
                type="button"
                onClick={addOranSatiri}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> {t('yeni_oran_ekle', 'Yeni Oran Ekle')}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formData.oranlar.map((oran, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-end',
                    padding: '12px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {t('kdv_orani_yuzde', 'KDV Oranı (%)')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={oran.oran}
                      onChange={e => updateOran(idx, 'oran', parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1.2 }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {t('baslangic_tarihi', 'Başlangıç Tarihi')}
                    </label>
                    <input
                      type="date"
                      required
                      value={oran.baslangicTarihi}
                      onChange={e => updateOran(idx, 'baslangicTarihi', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                    />
                  </div>
                  {formData.oranlar.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOranSatiri(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '8px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        borderRadius: '8px'
                      }}
                      title={t('Sil', 'Sil')}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </BasePopup>

      <AlertDialog
        isOpen={confirmDialog.isOpen}
        type="confirm"
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        confirmText={t('Evet', 'Evet')}
        cancelText={t('Vazgec', 'Vazgeç')}
      />
    </>
  );
};

export default KdvFormModal;
