import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { BasePopup, BaseSwitch, AlertDialog } from '@akalin/ui';

export interface ParaBirimiFormProps {
  isOpen?: boolean;
  initialData?: any;
  onSuccess?: (data?: any) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  inMemoryMode?: boolean;
  onSaveMemory?: (data: any) => void;
}

const ParaBirimiForm: React.FC<ParaBirimiFormProps> = ({
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
    kod: '',
    ad: '',
    sembol: '',
    varsayilanMi: false,
    aktifMi: true
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
      setFormData({
        kod: initialData.kod || '',
        ad: initialData.ad || '',
        sembol: initialData.sembol || '',
        varsayilanMi: initialData.varsayilanMi || false,
        aktifMi: initialData.aktifMi ?? true
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(formData.kod !== (initialData?.kod || '') || formData.ad !== (initialData?.ad || ''));
    }
  }, [formData, initialData, onDirtyChange]);

  const executeSave = async () => {
    if (!formData.kod?.trim() || !formData.ad?.trim() || !formData.sembol?.trim()) {
      toast.error(t('auto_lutfen_tum_zorunlu_alanlari_doldurun', 'Lütfen tüm zorunlu alanları doldurunuz.'));
      return;
    }

    setSaving(true);
    try {
      if (inMemoryMode) {
        if (onSaveMemory) {
          onSaveMemory(formData);
        }
        toast.success(t('ParaBirimi_basariylaKaydedildi', 'Para birimi başarıyla kaydedildi.'));
        if (onSuccess) onSuccess(formData);
      } else {
        if (initialData?.id) {
          await axios.put(`/api/ParaBirimleri/${initialData.id}`, formData);
        } else {
          await axios.post('/api/ParaBirimleri', formData);
        }
        toast.success(t('ParaBirimi_basariylaKaydedildi', 'Para birimi başarıyla kaydedildi.'));
        if (onSuccess) onSuccess(formData);
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
        title: t('ParaBirimi_varsayilanDegistirBaslik', 'Varsayılan Para Birimi Değişikliği'),
        message: t(
          'ParaBirimi_varsayilanDegistirMesaj',
          'Varsayılan para birimini değiştirmek üzeresiniz. Daha önceki varsayılan para birimi devre dışı bırakılacak ve yeni varsayılan olarak bu kayıt atanacaktır. Devam etmek istiyor musunuz?'
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
    ? t('ParaBirimi_duzenle', 'Para Birimi Düzenle')
    : t('ParaBirimi_yeni', 'Yeni Para Birimi');

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
        <div className="p-24 flex flex-col gap-20">
          <div className="grid-cols-2 gap-16">
            <div>
              <label className="block mb-8 text-13 font-semibold text-secondary">
                {t('auto_kod_orn_try_usd_5ab9', 'Kod (Örn: TRY, USD)')} <span className="text-danger">*</span>
              </label>
              <input 
                type="text" 
                required 
                value={formData.kod}
                onChange={e => setFormData({ ...formData, kod: e.target.value.toUpperCase() })}
                maxLength={5}
                className="form-input uppercase"
              />
            </div>
            <div>
              <label className="block mb-8 text-13 font-semibold text-secondary">
                {t('auto_sembol_orn__f8c8', 'Sembol (Örn: ₺, $)')} <span className="text-danger">*</span>
              </label>
              <input 
                type="text" 
                required 
                value={formData.sembol}
                onChange={e => setFormData({ ...formData, sembol: e.target.value })}
                maxLength={5}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="block mb-8 text-13 font-semibold text-secondary">
              {t('auto_para_birimi_adi_212e', 'Para Birimi Adı')} <span className="text-danger">*</span>
            </label>
            <input 
              type="text" 
              required 
              value={formData.ad}
              onChange={e => setFormData({ ...formData, ad: e.target.value })}
              placeholder={t('ParaBirimi_ornekAd', 'Örn: Türk Lirası, Amerikan Doları')}
              className="form-input"
            />
          </div>
          
          <div className="flex gap-24 mt-8">
            <BaseSwitch
              checked={formData.varsayilanMi}
              onChange={e => setFormData({ ...formData, varsayilanMi: e.target.checked })}
              label={t('auto_varsayilan_yap_9889', 'Varsayılan Yap')}
            />
            <BaseSwitch
              checked={formData.aktifMi}
              onChange={e => setFormData({ ...formData, aktifMi: e.target.checked })}
              label={t('Aktif', 'Aktif')}
            />
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

export default ParaBirimiForm;
