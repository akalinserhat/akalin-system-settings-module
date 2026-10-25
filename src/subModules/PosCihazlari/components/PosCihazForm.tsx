/**
 * @file PosCihazForm.tsx
 * @description 
 * POS Cihazı tanımlama ve düzenleme formu bileşeni.
 * BaseCardPage altyapısını kullanarak Fiziksel, Sanal ve Diğer POS cihazlarının
 * banka hesabı bağlantısı, komisyon oranları ve teknik entegrasyon parametrelerini yönetir.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Percent, Server, RefreshCcw, Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  BaseCardPage, 
  BankaSecici, 
  BankaHesapSecici, 
  FieldError, 
  PosGeriDonusTuruSecici, 
  PosTipiSecici, 
  ParaBirimiSecici, 
  BasitInput,
  AlertDialog
} from '@akalin/ui';
import { getPosCihazDefaults, fetchPosCihazDefaultValues } from '../defaults/posCihazDefaultValue';
import { validatePosCihazForm } from '../validators/posCihazValidation';
import PosKomisyonBelgeleriTablosu from './PosKomisyonBelgeleriTablosu';

export interface PosCihazFormProps {
  id?: string;
  initialData?: any;
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  onSavingChange?: (isSaving: boolean) => void;
}

const PosCihazForm: React.FC<PosCihazFormProps> = ({ 
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

  const defaults = getPosCihazDefaults();
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

  const returnTo = location.state?.returnTo || '/ayarlar/sistem-ayarlari/PosCihazlari';

  useEffect(() => {
    if (isEditing && !initialData) {
      setLoading(true);
      axios.get(`/api/PosCihazlari/${effectiveId}`)
        .then(res => {
          setFormData(res.data);
        })
        .catch(err => {
          console.error(err);
          toast.error(t('pos_cihaz_yuklenemedi', 'POS cihazı bilgileri yüklenemedi.'));
        })
        .finally(() => setLoading(false));
    }
  }, [effectiveId, isEditing, initialData, t]);

  useEffect(() => {
    if (!isEditing && defaults.focusId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(defaults.focusId);
        if (el) el.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isEditing, defaults.focusId]);

  // Yeni kayıtta sistemde tanımlı varsayılan para birimini otomatik yükle
  useEffect(() => {
    if (!isEditing && !initialData) {
      fetchPosCihazDefaultValues().then((def) => {
        if (def?.values?.paraBirimi) {
          setFormData((prev: any) => {
            if (!prev.paraBirimi) {
              return { ...prev, paraBirimi: def.values.paraBirimi };
            }
            return prev;
          });
        }
      });
    }
  }, [isEditing, initialData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  const focusFirstErrorField = (validationErrors: Record<string, string>) => {
    const firstErrorField = Object.keys(validationErrors)[0];
    const fieldIdMap: Record<string, string> = {
      bankaId: 'pos-banka-secici',
      bankaHesapId: 'pos-banka-hesap-secici',
      ad: 'pos-ad-input',
      tip: 'pos-tip-secici',
      paraBirimi: 'pos-para-birimi-secici',
      geriDonusTuru: 'pos-geri-donus-turu-secici'
    };
    const targetElementId = fieldIdMap[firstErrorField];
    if (targetElementId) {
      setTimeout(() => {
        const el = document.getElementById(targetElementId);
        if (el) el.focus();
      }, 200);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { isValid, errors: validationErrors } = validatePosCihazForm(formData, t);
    if (!isValid) {
      setErrors(validationErrors);
      setActiveTab('genel');
      toast.error(t('form_hatalarini_duzeltin', 'Lütfen formdaki hataları düzeltin.'));
      focusFirstErrorField(validationErrors);
      return;
    }

    setIsSaving(true);
    if (onSavingChange) onSavingChange(true);

    try {
      if (effectiveId) {
        await axios.put(`/api/PosCihazlari/${effectiveId}`, formData);
        toast.success(t('pos_cihaz_guncellendi', 'POS cihazı başarıyla güncellendi.'));
      } else {
        const res = await axios.post('/api/PosCihazlari', formData);
        toast.success(t('pos_cihaz_eklendi', 'Yeni POS cihazı eklendi.'));
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
      toast.error(err?.response?.data?.message || err?.response?.data?.mesaj || t('pos_cihaz_kayit_hata', 'POS cihazı kaydedilirken bir hata oluştu.'));
    } finally {
      setIsSaving(false);
      if (onSavingChange) onSavingChange(false);
    }
  };

  // "Komisyon ve Oranlar" sekmesindeki "Ekle" düğmesine tıklandığında çalışan metot
  const handleSaveAndAddKomisyon = async () => {
    const { isValid, errors: validationErrors } = validatePosCihazForm(formData, t);
    if (!isValid) {
      setErrors(validationErrors);
      // Eksik alan var ise "Temel Bilgiler" alanı açılsın
      setActiveTab('genel');
      toast.error(t('pos_eksik_alanlar_var_uyari', 'Komisyon ekleyebilmek için lütfen Temel Bilgiler alanındaki zorunlu alanları doldurunuz.'));
      focusFirstErrorField(validationErrors);
      return;
    }

    // Eksik alan yok ise form kendiliğinden kaydedilsin
    setIsSaving(true);
    if (onSavingChange) onSavingChange(true);

    try {
      const res = await axios.post('/api/PosCihazlari', formData);
      const newId = res.data?.id || res.data?.Id;
      toast.success(t('pos_cihaz_kaydedildi', 'POS cihazı başarıyla kaydedildi.'));
      setIsDirty(false);

      if (newId) {
        // Komisyon belgesi ekleme sayfasına yönlendir
        navigate(`/ayarlar/sistem-ayarlari/PosCihazlari/${newId}/komisyon-belgeleri/yeni?geriDonusTuru=${formData.geriDonusTuru || 1}`, {
          state: { returnTo: `/ayarlar/sistem-ayarlari/PosCihazlari/duzenle/${newId}` }
        });
      }
    } catch (err: any) {
      console.error('POS Cihazı kaydetme hatası:', err);
      toast.error(err?.response?.data?.mesaj || err?.response?.data?.message || t('pos_cihaz_kayit_hata', 'POS cihazı kaydedilirken bir hata oluştu.'));
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

  const isSanalPos = [2, 4, 5].includes(Number(formData.tip));

  const tabs = useMemo(() => {
    const tabList = [
      {
        id: 'genel',
        label: t('pos_temel_bilgiler', 'Temel Bilgiler'),
        icon: <CreditCard size={18} />,
        content: (
          <div className="surface-card p-24 rounded-16 border-glass flex-col gap-20">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label required">{t('auto_banka_secimi_011b', 'Banka Seçimi')}</label>
                <BankaSecici 
                  id="pos-banka-secici"
                  className={`form-control ${errors.bankaId ? 'is-invalid' : ''}`} 
                  value={formData.bankaId} 
                  sadeceHesapliBankalar={true}
                  onChange={(val: any) => {
                    handleChange('bankaId', val);
                    handleChange('bankaHesapId', '');
                  }} 
                />
                <FieldError error={errors.bankaId} />
              </div>

              <div className="form-group">
                <label className="form-label required">{t('auto_bagli_banka_hesabi_d5cc', 'Bağlı Banka Hesabı')}</label>
                <BankaHesapSecici 
                  id="pos-banka-hesap-secici"
                  className={`form-control ${errors.bankaHesapId ? 'is-invalid' : ''}`} 
                  value={formData.bankaHesapId} 
                  bankaId={formData.bankaId}
                  onChange={(val: any) => handleChange('bankaHesapId', val)} 
                  hideBalance={true}
                />
                <FieldError error={errors.bankaHesapId} />
              </div>

              <div className="form-group">
                <label className="form-label required">{t('auto_pos_tanimi_adi_ca46', 'POS Tanımı Adı')}</label>
                <BasitInput
                  id="pos-ad-input"
                  type="text"
                  error={!!errors.ad}
                  value={formData.ad || ''}
                  onChange={(e: any) => handleChange('ad', e.target.value)}
                  placeholder={t('pos_ad_placeholder', 'Örn: Garanti Sanal POS')}
                />
                <FieldError error={errors.ad} />
              </div>

              <div className="form-group">
                <label className="form-label required">{t('pos_tipi', 'POS Tipi')}</label>
                <PosTipiSecici 
                  id="pos-tip-secici"
                  className={`form-control ${errors.tip ? 'is-invalid' : ''}`}
                  value={formData.tip} 
                  onChange={(val: any) => handleChange('tip', val)} 
                />
                <FieldError error={errors.tip} />
              </div>

              <div className="form-group">
                <label className="form-label required">{t('para_birimi', 'Para Birimi')}</label>
                <ParaBirimiSecici 
                  id="pos-para-birimi-secici"
                  className={`form-control ${errors.paraBirimi ? 'is-invalid' : ''}`}
                  value={formData.paraBirimi} 
                  onChange={(val: any) => handleChange('paraBirimi', val)} 
                  selectDefault={!isEditing && !initialData}
                />
                <FieldError error={errors.paraBirimi} />
              </div>
              
              <div className="form-group">
                <label className="form-label required">{t('auto_geri_donus_turu_c51a', 'Geri Dönüş Türü')}</label>
                <PosGeriDonusTuruSecici
                  id="pos-geri-donus-turu-secici"
                  className={`form-control ${errors.geriDonusTuru ? 'is-invalid' : ''}`}
                  value={formData.geriDonusTuru}
                  onChange={(val: any) => handleChange('geriDonusTuru', val)}
                />
                <FieldError error={errors.geriDonusTuru} />
              </div>

              <div className="form-group">
                <label className="form-label">{t('durum', 'Durum')}</label>
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
        label: t('pos_komisyon_ve_oranlar', 'Komisyon ve Oranlar'),
        icon: <Percent size={18} />,
        content: !effectiveId ? (
          <div className="surface-card p-24 rounded-16 border-glass flex-col gap-20">
            <div className="flex-col items-center justify-center p-48 text-center gap-20 rounded-16 border-dashed border-glass bg-surface-variant">
              <div className="icon-box-large bg-primary-light text-primary rounded-full">
                <Percent size={28} />
              </div>
              <div className="flex-col gap-8 items-center max-w-450">
                <h4 className="m-0 text-primary text-16 font-600">
                  {t('pos_komisyon_ve_oranlar', 'Komisyon ve Oranlar')}
                </h4>
                <p className="m-0 text-secondary text-14 leading-relaxed">
                  {t('pos_oran_kayit_oncesi_bilgi_ekle', 'Bu POS cihazına ait komisyon belgesi ve taksit oranlarını tanımlamak için "Ekle" düğmesine basabilirsiniz. Temel bilgiler otomatik kaydedilerek komisyon tanım ekranı açılacaktır.')}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary px-24 py-12 flex items-center gap-8 font-medium shadow-md cursor-pointer"
                onClick={handleSaveAndAddKomisyon}
                disabled={isSaving}
              >
                <Plus size={18} />
                <span>{t('auto_ekle', 'Ekle')}</span>
              </button>
            </div>
          </div>
        ) : (
          <PosKomisyonBelgeleriTablosu
            posCihazId={Number(effectiveId)}
            geriDonusTuru={formData.geriDonusTuru || 1}
          />
        )
      }
    ];

    if (isSanalPos) {
      tabList.push({
        id: 'api',
        label: t('pos_api_entegrasyon', 'API & Entegrasyon'),
        icon: <Server size={18} />,
        content: (
          <div className="surface-card p-24 rounded-16 border-glass flex-col gap-16">
            <div className="surface-card p-16 rounded-12 border-primary bg-primary-light mb-8">
              <div className="flex items-center gap-8 text-primary mb-8 font-600">
                <Server size={18} /> {t('api_bilgileri_guvenligi', 'API Bilgileri Güvenliği')}
              </div>
              <p className="m-0 text-13 text-secondary leading-relaxed">
                {t('api_guvenlik_uyari', 'Aşağıda girdiğiniz API şifreleri ve gizli anahtarlar veritabanında kriptolanarak saklanacaktır. Lütfen bilgileri bankanızın / ödeme kuruluşunuzun entegrasyon paneline birebir uyumlu şekilde giriniz.')}
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{t('auto_uye_isyeri_no_mercha_15a2', 'Üye İşyeri No (Merchant ID)')}</label>
                <BasitInput 
                  type="text" 
                  value={formData.merchantId || ''} 
                  onChange={(e: any) => handleChange('merchantId', e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('terminal_no', 'Terminal No (Terminal ID)')}</label>
                <BasitInput 
                  type="text" 
                  value={formData.terminalId || ''} 
                  onChange={(e: any) => handleChange('terminalId', e.target.value)} 
                />
              </div>

              <div className="form-group span-2">
                <label className="form-label">{t('auto_magaza_kodu_store_ke_1907', 'Mağaza Kodu (Store Key)')}</label>
                <BasitInput 
                  type="text" 
                  value={formData.storeKey || ''} 
                  onChange={(e: any) => handleChange('storeKey', e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auto_api_kullanici_adi_ap_1c32', 'API Kullanıcı Adı (API User)')}</label>
                <BasitInput 
                  type="text" 
                  value={formData.apiUser || ''} 
                  onChange={(e: any) => handleChange('apiUser', e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auto_api_sifresi_api_pass_8dbf', 'API Şifresi (API Password)')}</label>
                <BasitInput 
                  type="password" 
                  value={formData.apiPassword || ''} 
                  onChange={(e: any) => handleChange('apiPassword', e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('secure_3d_tercihi', '3D Secure Tercihi')}</label>
                <select 
                  className="form-select" 
                  value={formData.secure3DType || 1} 
                  onChange={(e) => handleChange('secure3DType', Number(e.target.value))}
                >
                  <option value={1}>{t('auto_zorunlu_sadece_3d_il_ce25', 'Zorunlu (Sadece 3D İle Ödeme)')}</option>
                  <option value={2}>{t('opsiyonel', 'Opsiyonel')}</option>
                  <option value={3}>{t('auto_kapali_nonsecure_bc1a', 'Kapalı (Non-Secure)')}</option>
                </select>
              </div>
            </div>
          </div>
        )
      });
    }

    return tabList;
  }, [t, errors, formData, isSanalPos, effectiveId, isSaving]);

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
        id="posCihazFormCardPage"
        icon={<CreditCard size={20} />}
        title={isEditing ? (formData.ad || t('pos_cihazi_duzenle', 'POS Cihazı Düzenle')) : t('yeni_pos_cihazi', 'Yeni POS Cihazı')}
        subtitleLeft={t('pos_cihaz_aciklama', 'Fiziksel ve sanal POS cihazları ile banka pos anlaşmaları')}
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

export default PosCihazForm;
