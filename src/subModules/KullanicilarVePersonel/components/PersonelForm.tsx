/**
 * @file PersonelForm.tsx
 * @description 
 * Kullanıcı / Personel Kartı tanımlama ve düzenleme formu.
 * BaseCardPage, TabLayout, BaseSwitch ve modern MD3 arayüz bileşenlerini kullanır.
 */

import React, { useState, useEffect } from 'react';
import { Info, Shield, Key, MapPin, CheckSquare, Square, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { BaseCardPage, Breadcrumb, BaseSwitch } from '@akalin/ui';
import { kullanicilarService } from '../services/KullanicilarService';
import { RolDto, LokasyonDto } from '../dtos/KullaniciDto';
import { useAppBreadcrumbs } from '../../../hooks/useAppBreadcrumbs';

export interface PersonelFormProps {
  initialData?: any;
  onSuccess?: (resultId?: any) => void;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onSavingChange?: (isSaving: boolean) => void;
}

const PersonelForm: React.FC<PersonelFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
  onDirtyChange,
  onSavingChange
}) => {
  const { t } = useTranslation();
  const id = initialData?.id;
  const isEditing = !!id;

  const [activeTabId, setActiveTabId] = useState<string | number>(1);
  const [saving, setSaving] = useState(false);
  const [roller, setRoller] = useState<RolDto[]>([]);
  const [lokasyonlar, setLokasyonlar] = useState<LokasyonDto[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    adSoyad: '',
    email: '',
    telefon: '',
    sifre: '',
    sifreTekrar: '',
    rolId: '',
    lokasyonIds: [] as number[],
    aktifMi: true
  });

  useEffect(() => {
    kullanicilarService.getRoller()
      .then(res => setRoller(res || []))
      .catch(() => {});

    kullanicilarService.getLokasyonlar()
      .then(res => setLokasyonlar(res || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        adSoyad: initialData.adSoyad || '',
        email: initialData.email || '',
        telefon: initialData.telefon || '',
        sifre: '',
        sifreTekrar: '',
        rolId: initialData.rolId ? String(initialData.rolId) : '',
        lokasyonIds: initialData.lokasyonIds || [],
        aktifMi: initialData.aktifMi !== undefined ? initialData.aktifMi : true
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;

    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (onDirtyChange) onDirtyChange(true);
  };

  const handleLokasyonToggle = (locId: number) => {
    setFormData(prev => {
      const isSelected = prev.lokasyonIds.includes(locId);
      const newIds = isSelected 
        ? prev.lokasyonIds.filter(item => item !== locId) 
        : [...prev.lokasyonIds, locId];
      
      return { ...prev, lokasyonIds: newIds };
    });
    if (onDirtyChange) onDirtyChange(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();

    if (formData.sifre && formData.sifre !== formData.sifreTekrar) {
      toast.error(t('sifreler_eslesmiyor', 'Şifreler eşleşmiyor!'));
      return;
    }

    if (initialData && initialData.aktifMi === true && formData.aktifMi === false) {
      if (formData.lokasyonIds && formData.lokasyonIds.length > 0) {
        toast.error(t('personel_pasif_yapilamaz_lokasyon_var', 'Bu personeli pasife alamazsınız! Personelin üzerine atanmış aktif lokasyon yetkileri bulunmaktadır. Lütfen önce yetkilerini kaldırın.'));
        return;
      }
    }

    setSaving(true);
    if (onSavingChange) onSavingChange(true);

    try {
      const payload = {
        adSoyad: formData.adSoyad,
        email: formData.email,
        telefon: formData.telefon,
        sifre: formData.sifre ? formData.sifre : undefined,
        rolId: Number(formData.rolId) || (roller[0]?.id ?? 1),
        lokasyonIds: formData.lokasyonIds,
        aktifMi: formData.aktifMi
      };

      let result;
      if (isEditing) {
        result = await kullanicilarService.update(id, payload);
        toast.success(t('personel_guncellendi', 'Personel bilgileri güncellendi.'));
      } else {
        result = await kullanicilarService.create(payload);
        toast.success(t('personel_olusturuldu', 'Yeni personel başarıyla eklendi.'));
      }

      if (onDirtyChange) onDirtyChange(false);
      if (onSuccess) onSuccess(result?.id ?? id);
    } catch (err: any) {
      const msg = err?.response?.data?.mesaj || err?.message || t('islem_basarisiz', 'İşlem başarısız oldu.');
      toast.error(msg);
    } finally {
      setSaving(false);
      if (onSavingChange) onSavingChange(false);
    }
  };

  const recordTitle = formData.adSoyad || (isEditing ? t('auto_personel_karti', 'Personel Kartı') : t('auto_yeni_personel', 'Yeni Personel'));
  const formBreadcrumbItems = useAppBreadcrumbs({ recordTitle });

  const tabs = [
    {
      id: 1,
      label: t('genel_bilgiler', 'Genel Bilgiler'),
      icon: <Info size={18} />,
      content: (
        <div>
          <div className="form-grid">
            <div className="form-group col-span-full">
              <label>{t('ad_soyad', 'Ad Soyad')} *</label>
              <input 
                required 
                type="text" 
                className="form-input" 
                name="adSoyad" 
                value={formData.adSoyad} 
                onChange={handleInputChange} 
                placeholder={t('ad_soyad_ornek', 'Örn: Ahmet Yılmaz')}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>{t('eposta', 'E-Posta')} *</label>
              <input 
                required 
                type="email" 
                className="form-input" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder={t('eposta_ornek', 'ornek@sirket.com')} 
              />
            </div>

            <div className="form-group">
              <label>{t('telefon', 'Telefon')}</label>
              <input 
                type="tel" 
                className="form-input" 
                name="telefon" 
                value={formData.telefon} 
                onChange={handleInputChange} 
                placeholder={t('telefon_ornek', '05XX XXX XX XX')} 
              />
            </div>

            <div className="form-group col-span-full mt-12 pt-16 border-t border-glass">
              <h4 className="flex-row items-center gap-8 text-14 font-600 text-primary mb-12">
                <Key size={16} className="text-accent" /> {t('sifre_belirleme', 'Şifre Belirleme')}
              </h4>
              {isEditing && (
                <p className="text-12 text-secondary mb-12">
                  {t('sifre_degistirme_aciklama', 'Kullanıcının şifresini değiştirmek istemiyorsanız bu alanları boş bırakın.')}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>{t('yeni_sifre', 'Yeni Şifre')} {isEditing ? '' : '*'}</label>
              <input 
                type="password" 
                className="form-input" 
                name="sifre" 
                value={formData.sifre} 
                onChange={handleInputChange} 
                required={!isEditing}
                placeholder="••••••••" 
              />
            </div>

            <div className="form-group">
              <label>{t('sifre_tekrar', 'Şifre Tekrar')} {isEditing ? '' : '*'}</label>
              <input 
                type="password" 
                className="form-input" 
                name="sifreTekrar" 
                value={formData.sifreTekrar} 
                onChange={handleInputChange} 
                required={!isEditing && formData.sifre.length > 0}
                placeholder="••••••••" 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', marginTop: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <BaseSwitch
              label={t('aktif_kullanici', 'Aktif Kullanıcı')}
              checked={formData.aktifMi}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, aktifMi: e.target.checked }));
                if (onDirtyChange) onDirtyChange(true);
              }}
            />
          </div>
        </div>
      )
    },
    {
      id: 2,
      label: t('yetki_ve_lokasyon', 'Yetki ve Lokasyon'),
      icon: <Shield size={18} />,
      content: (
        <div>
          <div className="form-grid">
            <div className="form-group col-span-full">
              <label>{t('sistem_rolu', 'Sistem Rolü')} *</label>
              <select required className="form-input" name="rolId" value={formData.rolId} onChange={handleInputChange}>
                <option value="">{t('rol_seciniz', '-- Rol Seçiniz --')}</option>
                {roller.map(r => (
                  <option key={r.id} value={r.id}>{r.ad}</option>
                ))}
              </select>
              <p className="text-12 text-secondary mt-6">
                {t('sistem_rolu_aciklama', 'Kullanıcının sistemdeki erişim yetkilerini belirler (Örn: Ekranları görüntüleme, işlem yapma).')}
              </p>
            </div>

            <div className="form-group col-span-full mt-16">
              <label>{t('erisebildigi_subeler', 'Erişebildiği Şube ve Depolar')}</label>
              <div className="flex-col gap-8 p-12 rounded-12 bg-secondary border border-glass">
                {lokasyonlar.length === 0 ? (
                  <div className="text-13 text-secondary p-12 text-center">{t('tanimli_lokasyon_bulunamadi', 'Tanımlı şube bulunamadı.')}</div>
                ) : (
                  lokasyonlar.map(loc => {
                    const isSelected = formData.lokasyonIds.includes(loc.id);
                    return (
                      <div 
                        key={loc.id}
                        onClick={() => handleLokasyonToggle(loc.id)}
                        className={`flex-row items-center gap-10 p-10 rounded-8 cursor-pointer border transition-all ${isSelected ? 'bg-accent-light border-accent' : 'bg-primary border-glass'}`}
                      >
                        <div className={isSelected ? 'text-accent' : 'text-secondary'}>
                          {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                        </div>
                        <MapPin size={16} className="text-secondary ml-4" />
                        <span className={`text-14 flex-1 ${isSelected ? 'font-600 text-accent' : 'font-500 text-primary'}`}>
                          {loc.ad}
                        </span>
                        <span className="text-11 bg-hover px-8 py-2 rounded-10 text-secondary">
                          {loc.tip}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <BaseCardPage
      id="personelForm"
      onSubmit={handleSubmit}
      icon={<Users size={20} />}
      title={isEditing ? (formData.adSoyad ? `${t('auto_personel_karti', 'Personel Kartı')} - ${formData.adSoyad}` : t('auto_personel_karti', 'Personel Kartı')) : t('auto_yeni_personel', 'Yeni Personel')}
      breadcrumb={<Breadcrumb items={formBreadcrumbItems} size="sm" />}
      isSaving={saving}
      onSave={handleSubmit}
      onClose={onCancel}
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={setActiveTabId}
    />
  );
};

export default PersonelForm;
