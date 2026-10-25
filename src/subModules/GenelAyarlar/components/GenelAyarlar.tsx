/**
 * Webakus ERP - Genel Ayarlar Bileşeni (GenelAyarlar.tsx)
 * Firma kimlik/vergi bilgileri ile sistem geneli metin giriş tercihlerini (Harf Dönüşümü) yönetir.
 * akalin/ui kütüphanesindeki BaseCardPage base bileşeni üzerine inşa edilmiştir.
 */

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  Type, 
  Mail, 
  MapPin, 
  User, 
  Sparkles,
  CheckCircle2,
  Globe,
  Settings,
  RefreshCw
} from 'lucide-react';
import { BaseCardPage, BaseTabItem } from '@akalin/ui';
import { 
  BaseInput, 
  PhoneInput, 
  FieldError, 
  HarfDonusumu, 
} from '@akalin/ui';
import { useSystemSettingsService } from '../../../adapters/SystemSettingsServiceContext';
import { 
  IGenelAyarlarFormData, 
  validateGenelAyarlarField, 
  validateGenelAyarlarForm 
} from '../validators/genelAyarlarValidation';
import { getGenelAyarlarDefaultValues } from '../defaults/genelAyarlarDefaultValue';
import { useGenelAyarlarAutoFocus } from '../hooks/useGenelAyarlarAutoFocus';

export interface GenelAyarlarProps {
  showBackButton?: boolean;
  onClose?: () => void;
}

export const GenelAyarlar: React.FC<GenelAyarlarProps> = ({
  showBackButton = false,
  onClose
}) => {
  const { t, i18n } = useTranslation();
  const { refreshProfile } = useSystemSettingsService();

  const [formData, setFormData] = useState<IGenelAyarlarFormData>(getGenelAyarlarDefaultValues());
  const [initialData, setInitialData] = useState<IGenelAyarlarFormData>(getGenelAyarlarDefaultValues());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTabId, setActiveTabId] = useState<string | number>('genel');
  const [testMetni, setTestMetni] = useState<string>(() => t('ornek_metin_degeri', 'Örnek Metin'));

  const firstInputRef = useGenelAyarlarAutoFocus(loading);

  const casingOptions: Array<{
    id: HarfDonusumu;
    title: string;
    description: string;
    example: string;
  }> = useMemo(() => [
    {
      id: 'none',
      title: t('harf_donusumu_serbest_baslik', 'Serbest (Dönüşüm Yok)'),
      description: t('harf_donusumu_serbest_aciklama', 'Kullanıcının yazdığı karakterler olduğu gibi korunur.'),
      example: 'Örnek Metin'
    },
    {
      id: 'hepsiBuyuk',
      title: t('harf_donusumu_buyuk_baslik', 'Tümü Büyük Harf'),
      description: t('harf_donusumu_buyuk_aciklama', 'Giriş yapılan tüm metinler otomatik olarak büyük harfe çevrilir.'),
      example: 'ÖRNEK METİN'
    },
    {
      id: 'basHarflerBuyuk',
      title: t('harf_donusumu_basharfler_baslik', 'İlk Harfleri Büyük'),
      description: t('harf_donusumu_basharfler_aciklama', 'Her kelimenin ilk harfi büyük, diğer harfleri küçük harfe dönüştürülür.'),
      example: 'Örnek Metin'
    },
    {
      id: 'hepsiKucuk',
      title: t('harf_donusumu_kucuk_baslik', 'Tümü Küçük Harf'),
      description: t('harf_donusumu_kucuk_aciklama', 'Giriş yapılan tüm metinler otomatik olarak küçük harfe çevrilir.'),
      example: 'örnek metin'
    }
  ], [t]);

  useEffect(() => {
    fetchGenelAyarlar();
  }, []);

  const fetchGenelAyarlar = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/Firma/genel-ayarlar');
      if (res.data) {
        const loaded: IGenelAyarlarFormData = {
          firmaAdi: res.data.firmaAdi || '',
          vergiDairesi: res.data.vergiDairesi || '',
          vergiNo: res.data.vergiNo || '',
          adres: res.data.adres || '',
          yetkiliAdSoyad: res.data.yetkiliAdSoyad || '',
          telefon: res.data.telefon || '',
          email: res.data.email || '',
          metinHarfDonusumu: res.data.metinHarfDonusumu || 'basHarflerBuyuk',
          varsayilanDil: res.data.varsayilanDil || 'tr'
        };
        setFormData(loaded);
        setInitialData(loaded);
      }
    } catch (err: any) {
      console.error('Genel ayarlar yüklenirken hata oluştu:', err);
      toast.error(err.response?.data?.mesaj || t('genel_ayarlar_yuklenemedi', 'Genel ayarlar yüklenirken hata oluştu.'));
    } finally {
      setLoading(false);
    }
  };

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const handleChange = (field: keyof IGenelAyarlarFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleBlur = (field: string) => {
    const errorMsg = validateGenelAyarlarField(field, (formData as any)[field], t as any);
    setErrors((prev) => {
      const updated = { ...prev };
      if (errorMsg) {
        updated[field] = errorMsg;
      } else {
        delete updated[field];
      }
      return updated;
    });
  };

  const handleSave = async () => {
    const formErrors = validateGenelAyarlarForm(formData, t as any);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      const firmaFields = ['firmaAdi', 'vergiDairesi', 'vergiNo', 'email'];
      if (firmaFields.some((f) => formErrors[f])) {
        setActiveTabId('genel');
      }
      toast.error(t('lutfen_zorunlu_alanlari_doldurunuz', 'Lütfen zorunlu alanları eksiksiz doldurunuz.'));
      return;
    }

    try {
      setSaving(true);
      await axios.put('/api/Firma/genel-ayarlar', formData);
      setInitialData(formData);
      toast.success(t('genel_ayarlar_kaydedildi', 'Genel ayarlar başarıyla kaydedildi.'));
      
      if (formData.varsayilanDil && formData.varsayilanDil !== i18n.language) {
        i18n.changeLanguage(formData.varsayilanDil);
      }

      // Global Auth profilini yenile böylece harf formatı ve dil anında tüm uygulamaya yansısın
      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (err: any) {
      console.error('Genel ayarlar kaydedilemedi:', err);
      toast.error(err.response?.data?.mesaj || t('genel_ayarlar_kaydedilemedi', 'Genel ayarlar kaydedilirken hata oluştu.'));
    } finally {
      setSaving(false);
    }
  };

  const tabs: BaseTabItem[] = useMemo(() => [
    {
      id: 'genel',
      label: t('firma_ve_vergi_bilgileri_baslik', 'Firma ve Vergi Kimlik Bilgileri'),
      icon: <Building2 size={16} />,
      content: (
        <div className="flex-col gap-16 p-24">
          <p className="text-13 text-secondary m-0">
            {t('firma_ve_vergi_bilgileri_aciklama', 'İşletmenizin yasal ticari ünvanı, vergi dairesi ve iletişim bilgilerini yapılandırın.')}
          </p>

          <div className="form-grid mt-8">
            {/* Firma Ünvanı */}
            <div className="form-group">
              <label htmlFor="firmaAdiInput" className="form-label required">
                {t('firma_unvani_etiket', 'Firma Ünvanı')}
              </label>
              <BaseInput
                ref={firstInputRef}
                id="firmaAdiInput"
                casing="none"
                placeholder={t('firma_unvani_yer_tutucu', 'Örn: Webakus Bilişim ve Yazılım A.Ş.')}
                value={formData.firmaAdi}
                onChange={(e) => handleChange('firmaAdi', e.target.value)}
                onBlur={() => handleBlur('firmaAdi')}
                error={Boolean(errors.firmaAdi)}
              />
              <FieldError error={errors.firmaAdi} />
            </div>

            {/* Vergi Dairesi */}
            <div className="form-group">
              <label htmlFor="vergiDairesiInput" className="form-label required">
                {t('vergi_dairesi_etiket', 'Vergi Dairesi')}
              </label>
              <BaseInput
                id="vergiDairesiInput"
                casing="none"
                placeholder={t('vergi_dairesi_yer_tutucu', 'Örn: Kadıköy Vergi Dairesi')}
                value={formData.vergiDairesi}
                onChange={(e) => handleChange('vergiDairesi', e.target.value)}
                onBlur={() => handleBlur('vergiDairesi')}
                error={Boolean(errors.vergiDairesi)}
              />
              <FieldError error={errors.vergiDairesi} />
            </div>

            {/* Vergi Numarası / TCKN */}
            <div className="form-group">
              <label htmlFor="vergiNoInput" className="form-label required">
                {t('vergi_no_etiket', 'Vergi Numarası / TCKN')}
              </label>
              <BaseInput
                id="vergiNoInput"
                casing="none"
                placeholder={t('vergi_no_yer_tutucu', '10 haneli VKN veya 11 haneli TCKN')}
                value={formData.vergiNo}
                maxLength={11}
                onChange={(e) => {
                  const numericOnly = e.target.value.replace(/[^0-9]/g, '');
                  handleChange('vergiNo', numericOnly);
                }}
                onBlur={() => handleBlur('vergiNo')}
                error={Boolean(errors.vergiNo)}
              />
              <FieldError error={errors.vergiNo} />
            </div>

            {/* Yetkili Adı Soyadı */}
            <div className="form-group">
              <label htmlFor="yetkiliAdSoyadInput" className="form-label">
                {t('yetkili_ad_soyad_etiket', 'Yetkili Adı Soyadı')}
              </label>
              <BaseInput
                id="yetkiliAdSoyadInput"
                icon={<User size={16} />}
                casing="none"
                placeholder={t('yetkili_ad_soyad_yer_tutucu', 'Örn: Serhat Akalın')}
                value={formData.yetkiliAdSoyad}
                onChange={(e) => handleChange('yetkiliAdSoyad', e.target.value)}
              />
            </div>

            {/* Telefon */}
            <div className="form-group">
              <label htmlFor="telefonInput" className="form-label">
                {t('telefon_etiket', 'Telefon Numarası')}
              </label>
              <PhoneInput
                id="telefonInput"
                value={formData.telefon}
                onChange={(val) => handleChange('telefon', val)}
              />
            </div>

            {/* E-Posta */}
            <div className="form-group">
              <label htmlFor="emailInput" className="form-label required">
                {t('email_etiket', 'E-Posta Adresi')}
              </label>
              <BaseInput
                id="emailInput"
                type="email"
                icon={<Mail size={16} />}
                casing="none"
                placeholder={t('email_yer_tutucu', 'info@sirketiniz.com')}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                error={Boolean(errors.email)}
              />
              <FieldError error={errors.email} />
            </div>

            {/* Adres (Tam Genişlik) */}
            <div className="form-group form-col-full">
              <label htmlFor="adresInput" className="form-label">
                {t('adres_etiket', 'Firma Adresi')}
              </label>
              <BaseInput
                id="adresInput"
                multiline={true}
                rows={3}
                icon={<MapPin size={16} />}
                casing="none"
                placeholder={t('adres_yer_tutucu', 'Açık adres bilgilerini giriniz...')}
                value={formData.adres}
                onChange={(e) => handleChange('adres', e.target.value)}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'metin',
      label: t('metin_harf_donusumu_baslik', 'Form ve Metin Giriş Tercihleri'),
      icon: <Type size={16} />,
      content: (
        <div className="flex-col gap-20 p-24">
          <p className="text-13 text-secondary m-0">
            {t('metin_harf_donusumu_aciklama', 'Sistemdeki formlarda kullanıcıların veri girişi yaparken metinlerin otomatik nasıl dönüştürüleceğini belirleyin.')}
          </p>

          {/* Seçenek Kartları Grid */}
          <div className="casing-options-grid mt-8">
            {casingOptions.map((opt) => {
              const isSelected = (formData.metinHarfDonusumu || 'none') === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`casing-card ${isSelected ? 'selected' : ''}`}
                >
                  <div className="casing-card-header">
                    <input
                      type="radio"
                      name="metinHarfDonusumu"
                      className="casing-radio"
                      checked={isSelected}
                      onChange={() => handleChange('metinHarfDonusumu', opt.id)}
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

          {/* Canlı Deneme Alanı (Live Sandbox) */}
          <div className="casing-test-box">
            <div className="casing-test-title">
              <Sparkles size={16} />
              <span>{t('canli_onizleme_ve_test_alani', 'Canlı Harf Dönüşüm Testi')}</span>
            </div>
            <BaseInput
              id="casingTestInput"
              casing={formData.metinHarfDonusumu as HarfDonusumu}
              placeholder={t('buraya_yazi_yazarak_test_edebilirsiniz', 'Buraya metin yazarak seçili kuralın anlık dönüşümünü deneyin...')}
              value={testMetni}
              onChange={(e) => setTestMetni(e.target.value)}
            />
          </div>
        </div>
      )
    },
    {
      id: 'dil',
      label: t('varsayilan_dil_etiket', 'Varsayılan Sistem Dili'),
      icon: <Globe size={16} />,
      content: (
        <div className="flex-col gap-16 p-24">
          <p className="text-13 text-secondary m-0">
            {t('varsayilan_dil_aciklama', 'Sistem arayüzünde kullanıcıların ilk girişte karşılaşacağı varsayılan dili seçin.')}
          </p>

          <div className="casing-options-grid mt-8">
            <div
              className={`casing-card ${formData.varsayilanDil === 'tr' ? 'selected' : ''}`}
              onClick={() => handleChange('varsayilanDil', 'tr')}
            >
              <div className="casing-card-header">
                <span className="casing-card-title">{t('dil_turkce', 'Türkçe (TR)')}</span>
                {formData.varsayilanDil === 'tr' ? (
                  <CheckCircle2 size={18} className="casing-card-check" />
                ) : (
                  <div className="casing-card-circle" />
                )}
              </div>
              <p className="casing-card-desc">{t('dil_turkce_aciklama', 'Webakus ERP Türkçe arayüz standardı')}</p>
              <div className="casing-card-example">
                <span className="casing-example-label">{t('ornek_etiketi', 'Örnek:')}</span>
                <span className="casing-example-val">{t('dil_ornek_turkce', 'Hoş Geldiniz')}</span>
              </div>
            </div>

            <div
              className={`casing-card ${formData.varsayilanDil === 'en' ? 'selected' : ''}`}
              onClick={() => handleChange('varsayilanDil', 'en')}
            >
              <div className="casing-card-header">
                <span className="casing-card-title">{t('dil_ingilizce', 'English (EN)')}</span>
                {formData.varsayilanDil === 'en' ? (
                  <CheckCircle2 size={18} className="casing-card-check" />
                ) : (
                  <div className="casing-card-circle" />
                )}
              </div>
              <p className="casing-card-desc">{t('dil_ingilizce_aciklama', 'Webakus ERP English user interface')}</p>
              <div className="casing-card-example">
                <span className="casing-example-label">{t('ornek_etiketi', 'Örnek:')}</span>
                <span className="casing-example-val">{t('dil_ornek_ingilizce', 'Welcome')}</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ], [
    t, 
    formData, 
    errors, 
    firstInputRef, 
    casingOptions, 
    testMetni
  ]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <BaseCardPage
      id="genelAyarlarCardPage"
      title={t('genel_ayarlar_baslik', 'Genel Ayarlar')}
      subtitleLeft={t('genel_ayarlar_aciklama', 'Sistem genel çalışma parametreleri, firma tercihleri ve temel ayarlar.')}
      icon={<Settings size={22} />}
      asForm={false}
      onSave={handleSave}
      isSaving={saving}
      showBackButton={showBackButton}
      onClose={onClose}
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={setActiveTabId}
      extraDropdownActions={[
        {
          label: t('Yenile', 'Yenile'),
          icon: <RefreshCw size={15} />,
          onClick: fetchGenelAyarlar
        }
      ]}
    />
  );
};

export default GenelAyarlar;
