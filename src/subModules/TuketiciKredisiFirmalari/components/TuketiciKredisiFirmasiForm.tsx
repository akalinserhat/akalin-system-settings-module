/**
 * @file TuketiciKredisiFirmasiForm.tsx
 * @description 
 * Tüketici Kredisi Firması tanımlama ve düzenleme formu.
 * BaseCardPage altyapısını kullanarak Banka, hesap, para birimi ve komisyon belgeleri yönetimini sağlar.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Landmark, Percent, AlignLeft, RefreshCcw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  BaseCardPage, 
  BankaSecici, 
  BankaHesapSecici, 
  FieldError, 
  ParaBirimiSecici, 
  BasitInput, 
  NotInput,
  AlertDialog 
} from '@akalin/ui';
import { getTuketiciKredisiDefaults } from '../defaults/tuketiciKredisiDefaultValue';
import { validateTuketiciKredisiForm } from '../validators/tuketiciKredisiValidation';
import TuketiciKredisiKomisyonBelgeleriTablosu from './TuketiciKredisiKomisyonBelgeleriTablosu';

export interface TuketiciKredisiFirmasiFormProps {
  id?: string;
  initialData?: any;
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  onSavingChange?: (isSaving: boolean) => void;
}

const TuketiciKredisiFirmasiForm: React.FC<TuketiciKredisiFirmasiFormProps> = ({ 
  id: propId, 
  initialData, 
  onSuccess, 
  onCancel, 
  onSavingChange 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: urlId } = useParams<{ id: string }>();

  const effectiveId = propId || (urlId && urlId !== 'yeni' ? urlId : undefined);
  const isEditing = !!effectiveId;

  const defaults = getTuketiciKredisiDefaults();
  const [formData, setFormData] = useState<any>(initialData || defaults.values);
  const [loading, setLoading] = useState<boolean>(isEditing && !initialData);
  const [errors, setErrors] = useState<any>({});
  const [activeTab, setActiveTab] = useState<string | number>('genel');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    type?: 'confirm' | 'info' | 'error' | 'warning';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const returnTo = location.state?.returnTo || '/ayarlar/sistem-ayarlari/TuketiciKredisiFirmalari';

  useEffect(() => {
    if (isEditing && !initialData) {
      setLoading(true);
      axios.get(`/api/TuketiciKredisiFirmalari/${effectiveId}`)
        .then(res => {
          setFormData(res.data);
        })
        .catch(err => {
          console.error(err);
          toast.error(t('tuketici_kredisi_yuklenemedi', 'Tüketici kredisi firması yüklenemedi.'));
        })
        .finally(() => setLoading(false));
    }
  }, [effectiveId, isEditing, initialData, t]);

  useEffect(() => {
    if (!isEditing && !initialData) {
      axios.get('/api/FirmaAyarlari/TuketiciKredisiFirmalari')
        .then(res => {
          const ayar = res.data || {};
          const sablon = ayar.KodSablonu || '[Kart Türü Kısa Kodu]-[Sayaç]';
          const prefix = ayar.KartTuru_KisaKod || 'TKF';
          const yeniKod = sablon.replace('[Kart Türü Kısa Kodu]', prefix).replace('[Sayaç]', '????');
          setFormData((prev: any) => ({ ...prev, kod: yeniKod }));
        })
        .catch(err => {
          console.error('Tüketici kredisi ayarları yüklenemedi:', err);
          setFormData((prev: any) => ({ ...prev, kod: 'TKF-????' }));
        });
    }
  }, [isEditing, initialData]);

  useEffect(() => {
    if (!isEditing && defaults.focusId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(defaults.focusId);
        if (el) el.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isEditing, defaults.focusId]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const updated = { ...prev, [field]: value };
      if (field === 'bankaId') {
        updated.bankaHesapId = '';
      }
      return updated;
    });
    setIsDirty(true);

    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { isValid, errors: validationErrors } = validateTuketiciKredisiForm(formData);
    if (!isValid) {
      setErrors(validationErrors);
      toast.error(t('form_hatalarini_duzeltin', 'Lütfen formdaki hataları düzeltin.'));
      return;
    }

    setIsSaving(true);
    if (onSavingChange) onSavingChange(true);

    try {
      if (effectiveId) {
        await axios.put(`/api/TuketiciKredisiFirmalari/${effectiveId}`, formData);
        toast.success(t('TuketiciKredisiFirmasiForm_guncellemeBasarili', 'Tüketici kredisi firması başarıyla güncellendi.'));
      } else {
        const res = await axios.post('/api/TuketiciKredisiFirmalari', formData);
        toast.success(t('TuketiciKredisiFirmasiForm_kayitBasarili', 'Yeni tüketici kredisi firması eklendi.'));
        if (res.data?.id) {
          setFormData((prev: any) => ({ ...prev, id: res.data.id }));
        }
      }
      setIsDirty(false);
      if (onSuccess) {
        onSuccess(formData);
      } else {
        navigate(returnTo);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || t('TuketiciKredisiFirmasiForm_hata', 'Kaydedilirken bir hata oluştu.'));
    } finally {
      setIsSaving(false);
      if (onSavingChange) onSavingChange(false);
    }
  };

  const handleClose = () => {
    const doClose = () => {
      if (onCancel) {
        onCancel();
      } else {
        navigate(returnTo);
      }
    };

    if (isDirty) {
      setAlertDialog({
        isOpen: true,
        type: 'confirm',
        title: t('kaydedilmemis_degisiklikler', 'Kaydedilmemiş Değişiklikler'),
        message: t('auto_degisiklikler_kaydedilmedi_onay', 'Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinize emin misiniz?'),
        onConfirm: doClose
      });
    } else {
      doClose();
    }
  };

  const tabs = useMemo(() => [
    {
      id: 'genel',
      label: t('TuketiciKredisiFirmasiForm_tabGenel', 'Temel Bilgiler'),
      icon: <Landmark size={18} />,
      content: (
        <div className="surface-card p-24 rounded-16 border-glass flex-col gap-20">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">{t('TuketiciKredisiFirmasiForm_kod', 'Firma Kodu')}</label>
              <BasitInput
                id="tk-kod-input"
                type="text"
                error={!!errors.kod}
                value={formData.kod || ''}
                onChange={(e: any) => handleChange('kod', e.target.value)}
                placeholder="Örn: FIBABANK-01"
              />
              <FieldError error={errors.kod} />
            </div>

            <div className="form-group">
              <label className="form-label required">{t('TuketiciKredisiFirmasiForm_ad', 'Firma Adı')}</label>
              <BasitInput
                type="text"
                error={!!errors.ad}
                value={formData.ad || ''}
                onChange={(e: any) => handleChange('ad', e.target.value)}
                placeholder="Örn: Fibabanka Alışveriş Kredisi"
              />
              <FieldError error={errors.ad} />
            </div>

            <div className="form-group">
              <label className="form-label required">{t('TuketiciKredisiFirmasiForm_banka', 'Banka')}</label>
              <BankaSecici
                id="tk-banka-secici"
                className={`form-control ${errors.bankaId ? 'is-invalid' : ''}`}
                value={formData.bankaId}
                onChange={(val: any) => handleChange('bankaId', val)}
                sadeceHesapliBankalar={true}
              />
              <FieldError error={errors.bankaId} />
            </div>

            <div className="form-group">
              <label className="form-label required">{t('TuketiciKredisiFirmasiForm_hesap', 'Banka Hesabı')}</label>
              <BankaHesapSecici
                className={`form-control ${errors.bankaHesapId ? 'is-invalid' : ''}`}
                value={formData.bankaHesapId}
                bankaId={formData.bankaId}
                onChange={(val: any) => handleChange('bankaHesapId', val)}
                hideBalance={true}
              />
              <FieldError error={errors.bankaHesapId} />
            </div>

            <div className="form-group">
              <label className="form-label required">{t('TuketiciKredisiFirmasiForm_paraBirimi', 'Para Birimi')}</label>
              <ParaBirimiSecici
                className={`form-control ${errors.paraBirimiId ? 'is-invalid' : ''}`}
                value={formData.paraBirimiId}
                onChange={(val: any) => handleChange('paraBirimiId', val)}
              />
              <FieldError error={errors.paraBirimiId} />
            </div>

            <div className="form-group">
              <label className="form-label">{t('TuketiciKredisiFirmasiForm_durum', 'Durum')}</label>
              <div className="flex items-center h-42 gap-8">
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={formData.aktifMi ?? true} 
                    onChange={(e) => handleChange('aktifMi', e.target.checked)} 
                  />
                  <span className="slider round"></span>
                </label>
                <span className="text-14 text-secondary">
                  {formData.aktifMi ? t('aktif', 'Aktif') : t('pasif', 'Pasif')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'oranlar',
      label: t('TuketiciKredisiFirmasiForm_tabOranlar', 'Komisyon Oranları'),
      icon: <Percent size={18} />,
      content: (
        <div className="surface-card p-24 rounded-16 border-glass flex-col gap-20">
          {!effectiveId ? (
            <div className="flex-col items-center justify-center p-48 text-center gap-16 rounded-16 border-dashed border-glass bg-surface-variant">
              <div className="icon-box-large bg-warning-light text-warning rounded-full">
                <Percent size={28} />
              </div>
              <div className="flex-col gap-8 items-center max-w-450">
                <h4 className="m-0 text-primary text-16 font-600">
                  {t('TuketiciKredisiFirmasiForm_kaydetmeGerekliTitle', 'Önce Tanımı Kaydetmeniz Gerekmektedir')}
                </h4>
                <p className="m-0 text-secondary text-14 leading-relaxed">
                  {t('TuketiciKredisiFirmasiForm_kaydetmeGerekliDesc', 'Bu firmaya ait taksit ve komisyon oranlarını girebilmek için, öncelikle firmanın temel bilgilerini kaydetmeniz gerekmektedir.')}
                </p>
              </div>
            </div>
          ) : (
            <TuketiciKredisiKomisyonBelgeleriTablosu
              tuketiciKredisiFirmasiId={Number(effectiveId)}
            />
          )}
        </div>
      )
    },
    {
      id: 'aciklama',
      label: t('TuketiciKredisiFirmasiForm_aciklama', 'Açıklama'),
      icon: <AlignLeft size={18} />,
      content: (
        <div className="surface-card p-24 rounded-16 border-glass flex-col gap-20">
          <div className="form-group">
            <label className="form-label">{t('TuketiciKredisiFirmasiForm_aciklama', 'Açıklama')}</label>
            <NotInput
              value={formData.aciklama || ''}
              onChange={(e: any) => handleChange('aciklama', e.target.value)}
              placeholder={t('TuketiciKredisiFirmasiForm_aciklamaPlaceholder', 'Genel açıklamaları buraya yazabilirsiniz...')}
            />
          </div>
        </div>
      )
    }
  ], [t, errors, formData, effectiveId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-40">
        <RefreshCcw size={32} className="spinning text-secondary mb-12" />
        <p className="text-secondary m-0">{t('auto_yukleniyor_4deb', 'Yükleniyor...')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <BaseCardPage
        id="tuketiciKredisiFirmasiFormCardPage"
        icon={<Landmark size={20} />}
        title={isEditing ? (formData.ad || t('tuketici_kredisi_duzenle', 'Tüketici Kredisi Firması Düzenle')) : t('yeni_tuketici_kredisi', 'Yeni Tüketici Kredisi Firması')}
        subtitleLeft={t('tuketici_kredisi_aciklama', 'Anlaşmalı tüketici finansman ve kredi kuruluşları yönetimi')}
        isSaving={isSaving}
        onSave={handleSave}
        onClose={handleClose}
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      />

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}
        type={alertDialog.type || 'confirm'}
        title={alertDialog.title}
        message={alertDialog.message}
        onConfirm={() => {
          if (alertDialog.onConfirm) alertDialog.onConfirm();
          setAlertDialog(prev => ({ ...prev, isOpen: false }));
        }}
        confirmText={t('evet_cik', 'Evet, Çık')}
        cancelText={t('auto_iptal', 'İptal')}
      />
    </div>
  );
};

export default TuketiciKredisiFirmasiForm;
