/**
 * @file PersonelDavetForm.tsx
 * @description
 * Firmaya e-posta daveti ile yeni personel ekleme formu.
 * Çoklu rol (Multi-Role RBAC) seçimini, BaseCardPage ve MD3 tasarım bileşenlerini destekler.
 */

import React, { useState, useEffect } from 'react';
import { Mail, Shield, Info, Send, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { 
  BaseCardPage, 
  Breadcrumb, 
  BasitInput, 
  FieldError, 
  useAdminValidation,
  RolCard
} from '@akalin/ui';
import { kullanicilarService } from '../services/KullanicilarService';
import { RolDto, FirmaDavetGonderDto } from '../dtos/KullaniciDto';
import { useAppBreadcrumbs } from '../../../hooks/useAppBreadcrumbs';
import { 
  PersonelDavetFormData, 
  validatePersonelDavetField, 
  validatePersonelDavetForm 
} from '../validators/personelDavetValidation';

export interface PersonelDavetFormProps {
  onSuccess?: (result?: any) => void;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onSavingChange?: (isSaving: boolean) => void;
}

const PersonelDavetForm: React.FC<PersonelDavetFormProps> = ({
  onSuccess,
  onCancel,
  onDirtyChange,
  onSavingChange
}) => {
  const { t } = useTranslation();
  const { errors, clearError, validate } = useAdminValidation();

  const [saving, setSaving] = useState(false);
  const [roller, setRoller] = useState<RolDto[]>([]);

  const [formData, setFormData] = useState<PersonelDavetFormData>({
    email: '',
    roller: []
  });

  useEffect(() => {
    kullanicilarService.getRoller()
      .then(res => {
        const roleList = res || [];
        setRoller(roleList);
        if (roleList.length > 0 && formData.roller.length === 0) {
          const defaultRole = roleList.find(r => r.ad.toLowerCase() === 'kullanıcı') || roleList[0];
          if (defaultRole) {
            setFormData(prev => ({ ...prev, roller: [defaultRole.ad] }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleInputChange = (field: keyof PersonelDavetFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
    if (onDirtyChange) onDirtyChange(true);
  };

  const handleBlur = (field: keyof PersonelDavetFormData) => {
    const errorMsg = validatePersonelDavetField(field, formData[field], t);
    if (errorMsg) {
      // Handled centrally by validate on submit or on demand
    }
  };

  const handleRoleToggle = (rolAd: string) => {
    setFormData(prev => {
      const exists = prev.roller.includes(rolAd);
      const nextRoller = exists 
        ? prev.roller.filter(r => r !== rolAd)
        : [...prev.roller, rolAd];
      return { ...prev, roller: nextRoller };
    });
    clearError('roller');
    if (onDirtyChange) onDirtyChange(true);
  };

  const handleSelectAllRoles = () => {
    const allRoleNames = roller.map(r => r.ad);
    setFormData(prev => ({ ...prev, roller: allRoleNames }));
    clearError('roller');
    if (onDirtyChange) onDirtyChange(true);
  };

  const handleClearRoles = () => {
    setFormData(prev => ({ ...prev, roller: [] }));
    if (onDirtyChange) onDirtyChange(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();

    const isValid = validate((data) => validatePersonelDavetForm(data, t), formData);
    if (!isValid) {
      return;
    }

    setSaving(true);
    if (onSavingChange) onSavingChange(true);

    try {
      const payload: FirmaDavetGonderDto = {
        email: formData.email.trim(),
        roller: formData.roller,
        rol: formData.roller.join(', ')
      };

      const result = await kullanicilarService.davetGonder(payload);
      toast.success(t('davet_epostasi_gonderildi', 'Davet e-postası başarıyla gönderildi.'));

      if (onDirtyChange) onDirtyChange(false);
      if (onSuccess) onSuccess(result?.id);
    } catch (err: any) {
      const msg = err?.response?.data?.mesaj || err?.message || t('davet_gonderilemedi', 'Davet e-postası gönderilemedi.');
      toast.error(msg);
    } finally {
      setSaving(false);
      if (onSavingChange) onSavingChange(false);
    }
  };

  const formBreadcrumbItems = useAppBreadcrumbs({ recordTitle: t('personel_davet_et', 'Personel Davet Et') });

  const tabs = [
    {
      id: 1,
      label: t('davet_bilgileri', 'Davet Bilgileri'),
      icon: <Mail size={18} />,
      content: (
        <div className="flex-col gap-20">
          {/* Bilgilendirme Kartı */}
          <div className="davet-info-banner flex-row items-start gap-16">
            <div className="davet-info-icon-box">
              <Info size={22} />
            </div>
            <div className="flex-col gap-4">
              <h4 className="font-600 text-14 text-primary">
                {t('personel_davet_bilgi_baslik', 'E-Posta ile Kullanıcı Daveti')}
              </h4>
              <p className="text-13 text-secondary leading-relaxed">
                {t(
                  'personel_davet_bilgi_aciklama',
                  'Belirttiğiniz e-posta adresine güvenli bir katılım bağlantısı iletilecektir. Kullanıcı bağlantıya tıklayarak server üzerindeki davet kabul sayfasından şifresini belirleyebilecek ve firmanızın yetkili personelleri arasına katılabilecektir. Bağlantı, Firma Yönetim Ayarları\'nda belirlenen süre boyunca geçerlidir.'
                )}
              </p>
            </div>
          </div>

          <div className="form-grid">
            {/* E-Posta Alanı */}
            <div className="form-group col-span-full">
              <label className="flex-row items-center gap-6">
                <Mail size={14} className="text-secondary" />
                <span>{t('eposta_adresi', 'E-Posta Adresi')} *</span>
              </label>
              <BasitInput
                type="email"
                name="email"
                value={formData.email}
                onChange={(e: any) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder={t('eposta_ornek', 'ornek@sirket.com')}
                autoFocus
              />
              <FieldError error={errors.email} />
            </div>

            {/* Yetki Rolleri (Çoklu Seçim) */}
            <div className="form-group col-span-full">
              <div className="flex-row items-center justify-between mb-8">
                <label className="flex-row items-center gap-6 m-0">
                  <Shield size={14} className="text-secondary" />
                  <span>{t('sistem_rolleri', 'Sistem Rolleri')} *</span>
                  <span className="text-11 bg-hover px-6 py-2 rounded-8 text-secondary font-500">
                    {t('secilen_rol_sayisi', '{{count}} seçildi', { count: formData.roller.length })}
                  </span>
                </label>
                <div className="flex-row items-center gap-8">
                  <button
                    type="button"
                    className="personel-roles-action-btn"
                    onClick={handleSelectAllRoles}
                  >
                    {t('tumunu_sec', 'Tümünü Seç')}
                  </button>
                  <span className="text-secondary text-12">|</span>
                  <button
                    type="button"
                    className="personel-roles-action-btn"
                    onClick={handleClearRoles}
                  >
                    {t('secimi_temizle', 'Temizle')}
                  </button>
                </div>
              </div>

              {formData.roller.length > 0 && (
                <div className="flex-row flex-wrap gap-8 mb-12">
                  {formData.roller.map(rName => (
                    <span key={rName} className="personel-role-chip">
                      <Shield size={12} />
                      <span>{rName}</span>
                      <button
                        type="button"
                        className="personel-role-chip-remove"
                        onClick={() => handleRoleToggle(rName)}
                        title={t('rolu_kaldir', 'Rolü Kaldır')}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="personel-roles-selection-box">
                {roller.length === 0 ? (
                  <div className="text-13 text-secondary p-12 text-center">
                    {t('tanimli_rol_bulunamadi', 'Tanımlı sistem rolü bulunamadı.')}
                  </div>
                ) : (
                  roller.map(rol => (
                    <RolCard
                      key={rol.id}
                      rol={rol}
                      checked={formData.roller.includes(rol.ad)}
                      onChange={(_checked, r) => handleRoleToggle(r ? r.ad : rol.ad)}
                    />
                  ))
                )}
              </div>
              <FieldError error={errors.roller} />
              <p className="text-12 text-secondary mt-6">
                {t('sistem_rolleri_aciklama', 'Kullanıcının sahip olacağı yetki rollerini seçiniz. Birden fazla rol seçebilirsiniz.')}
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <BaseCardPage
      id="personelDavetForm"
      onSubmit={handleSubmit}
      icon={<Send size={20} />}
      title={t('personel_davet_et', 'Personel Davet Et')}
      breadcrumb={<Breadcrumb items={formBreadcrumbItems} size="sm" />}
      isSaving={saving}
      saveButtonText={t('davet_gonder', 'Davet Gönder')}
      onSave={handleSubmit}
      onClose={onCancel}
      tabs={tabs}
      activeTabId={1}
      onTabChange={() => {}}
    />
  );
};

export default PersonelDavetForm;
