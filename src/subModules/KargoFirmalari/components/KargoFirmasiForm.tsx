/**
 * Webakus ERP - Kargo Firması Formu (KargoFirmasiForm)
 * BaseCardPage mimarisinden türetilmiş kargo firması tanımlama ve düzenleme kartı.
 * 
 * Sekmeler:
 * 1. Genel Bilgiler: Kargo Firması Adı, Firma Türü, Aktif/Pasif durumu
 * 2. İletişim Bilgileri: Sorumlu Kişi, Telefon (PhoneInput), E-Posta
 * 3. Adres Bilgileri: Açık Adres, Doluluk İlerleme Çubuğu, AdresSeciciForm modal entegrasyonu
 * 4. Fiyat / Bölge Kuralları: Tanımlı kurallar listesi ve KargoKurallarForm (BaseCardPage) entegrasyonu
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  AlertCircle,
  Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  BaseCardPage, 
  BaseInput,
  BaseDropdownSecici,
  type DropdownOption,
  PhoneInput, 
  EmailInput,
  AdresSeciciForm, 
  AdresInput, 
  BaseSwitch, 
  CancelButton, 
  PageLoader,
  AlertDialog,
  FieldError,
  useHeaderApi
} from '@akalin/ui';
import { useTranslation } from 'react-i18next';
import KargoKurallarForm from './KargoKurallarForm';
import {
  validateKargoFirmasiField,
  validateKargoFirmasiForm,
  type KargoFirmasiFormData
} from '../validators/kargoFirmasiValidation';

export interface KargoFirmasiFormProps {
  id?: string | number;
  initialData?: any;
  onSuccess?: (savedItem?: any) => void;
  onCancel?: () => void;
  showBackButton?: boolean;
}

const GUNLER = [
  { id: '1', ad: 'Pzt' },
  { id: '2', ad: 'Sal' },
  { id: '3', ad: 'Çar' },
  { id: '4', ad: 'Per' },
  { id: '5', ad: 'Cum' },
  { id: '6', ad: 'Cmt' },
  { id: '7', ad: 'Paz' }
];

export default function KargoFirmasiForm({
  id: propId,
  initialData,
  onSuccess,
  onCancel,
  showBackButton
}: KargoFirmasiFormProps) {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const effectiveId = propId || params.id || initialData?.id;
  const isEditing = Boolean(effectiveId);

  const [activeTab, setActiveTab] = useState<string | number>(location.state?.activeTab || 'genel');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdresModal, setShowAdresModal] = useState(false);

  // Kural Yönetimi State'leri
  const [kurallar, setKurallar] = useState<any[]>([]);
  const [editingKural, setEditingKural] = useState<any | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | string | null>(null);
  const [deletingRule, setDeletingRule] = useState(false);

  const { setHeaderBreadcrumbOptions } = useHeaderApi() || {};

  const [formData, setFormData] = useState<KargoFirmasiFormData>(() => {
    const defaultData: KargoFirmasiFormData = {
      ad: '',
      tip: 'Kargo Firması',
      sorumluKisi: '',
      telefon: '',
      eposta: '',
      aktifMi: true,
      adres: { adresIsmi: '', ilId: null, ilAdi: '', ilceId: null, ilceAdi: '', acikAdres: '' }
    };
    const src = initialData || location.state?.item;
    if (src) {
      return {
        ...defaultData,
        ad: src.ad || '',
        tip: src.tip || 'Kargo Firması',
        sorumluKisi: src.sorumluKisi || '',
        telefon: src.telefon || '',
        eposta: src.eposta || '',
        aktifMi: src.aktifMi ?? true,
        adres: src.adres || defaultData.adres
      };
    }
    return defaultData;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const firmaTuruOptions: DropdownOption[] = useMemo(() => {
    const list: DropdownOption[] = [
      { id: 'Kargo Firması', label: t('auto_kargo_firmasi_3aca', 'Kargo Firması') },
      { id: 'Yetkili Servis', label: t('auto_yetkili_servis', 'Yetkili Servis') },
      { id: 'Kurye', label: t('auto_kurye_cb54', 'Kurye') },
      { id: 'Lojistik', label: t('auto_lojistik_d732', 'Lojistik') },
      { id: 'Kendi Dağıtımımız', label: t('auto_kendi_dagitimimiz_6bf1', 'Kendi Dağıtımımız') }
    ];
    if (formData.tip && !list.some(o => o.id === formData.tip)) {
      list.push({ id: formData.tip, label: formData.tip });
    }
    return list;
  }, [t, formData.tip]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBlur = (field: string) => {
    const error = validateKargoFirmasiField(field, (formData as any)[field], formData, t);
    setErrors(prev => {
      if (error) {
        return { ...prev, [field]: error };
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const fetchKurallar = useCallback(async () => {
    if (!effectiveId) return;
    try {
      const res = await axios.get(`/api/KargoFirmasi/${effectiveId}`);
      if (res.data) {
        setKurallar(res.data.kurallar || []);
      }
    } catch (err) {
      console.error('Kargo kuralları çekilemedi:', err);
    }
  }, [effectiveId]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ad: initialData.ad || '',
        tip: initialData.tip || 'Kargo Firması',
        sorumluKisi: initialData.sorumluKisi || '',
        telefon: initialData.telefon || '',
        eposta: initialData.eposta || '',
        aktifMi: initialData.aktifMi ?? true,
        adres: initialData.adres || { adresIsmi: '', ilId: null, ilAdi: '', ilceId: null, ilceAdi: '', acikAdres: '' }
      });
      setKurallar(initialData.kurallar || []);
    } else if (effectiveId) {
      setLoading(true);
      axios.get(`/api/KargoFirmasi/${effectiveId}`)
        .then(res => {
          if (res.data) {
            setFormData({
              ad: res.data.ad || '',
              tip: res.data.tip || 'Kargo Firması',
              sorumluKisi: res.data.sorumluKisi || '',
              telefon: res.data.telefon || '',
              eposta: res.data.eposta || '',
              aktifMi: res.data.aktifMi ?? true,
              adres: res.data.adres || { adresIsmi: '', ilId: null, ilAdi: '', ilceId: null, ilceAdi: '', acikAdres: '' }
            });
            setKurallar(res.data.kurallar || []);
          }
        })
        .catch(err => {
          console.error('Kargo firması verisi çekilemedi:', err);
          toast.error(t('auto_kaydedilirken_hata_olustu', 'Kaydedilirken hata oluştu.'));
        })
        .finally(() => setLoading(false));
    }
  }, [initialData, effectiveId, t]);

  const recordTitle = formData.ad || (isEditing ? t('auto_kargo_firmasi_duzenle', 'Kargo Firması Düzenle') : t('auto_yeni_kargo_firmasi', 'Yeni Kargo Firması'));

  useEffect(() => {
    if (setHeaderBreadcrumbOptions && editingKural === null) {
      setHeaderBreadcrumbOptions({ recordTitle });
    }
    return () => {
      if (setHeaderBreadcrumbOptions && editingKural === null) {
        setHeaderBreadcrumbOptions(null);
      }
    };
  }, [recordTitle, setHeaderBreadcrumbOptions, editingKural]);

  const confirmDeleteKural = async () => {
    if (!deleteTargetId || !effectiveId) return;
    try {
      setDeletingRule(true);
      await axios.delete(`/api/KargoFirmasi/${effectiveId}/kurallar/${deleteTargetId}`);
      toast.success(t('kural_silindi', 'Kural başarıyla silindi.'));
      setDeleteTargetId(null);
      fetchKurallar();
    } catch (err) {
      console.error('Kural silinirken hata:', err);
      toast.error(t('kural_silinemedi', 'Kural silinirken hata oluştu.'));
    } finally {
      setDeletingRule(false);
    }
  };

  const getGunlerSummary = (gunlerStr?: string) => {
    if (!gunlerStr) return t('her_gun', 'Her Gün');
    const secili = gunlerStr.split(',');
    if (secili.length === 7) return t('her_gun', 'Her Gün');
    if (secili.length === 5 && !secili.includes('6') && !secili.includes('7')) return t('hafta_ici', 'Hafta İçi');
    if (secili.length === 2 && secili.includes('6') && secili.includes('7')) return t('hafta_sonu', 'Hafta Sonu');
    return secili.map(s => GUNLER.find(g => g.id === s)?.ad).join(', ');
  };

  const handleAdresSecimi = ({ ids, formattedAdres, parts }: any) => {
    let acikAdres = formattedAdres;
    if (parts) {
      const acikAdresParts: string[] = [];
      if (parts.koy && !parts.koy.toLocaleLowerCase('tr-TR').includes('merkez köy')) acikAdresParts.push(parts.koy);
      if (parts.mahalle && parts.mahalle.toLocaleLowerCase('tr-TR') !== 'merkez mahallesi' && parts.mahalle.toLocaleLowerCase('tr-TR') !== 'merkez') acikAdresParts.push(parts.mahalle);
      if (parts.cadde) acikAdresParts.push(parts.cadde);
      if (parts.disKapi) acikAdresParts.push(`No: ${parts.disKapi}`);
      if (parts.icKapi && !parts.icKapi.toLocaleLowerCase('tr-TR').includes('yok')) acikAdresParts.push(`İç Kapı: ${parts.icKapi}`);
      
      const streetPart = acikAdresParts.join(' ').trim();
      if (parts.ilce && parts.il) {
        acikAdres = streetPart ? `${streetPart} - ${parts.ilce} / ${parts.il}` : `${parts.ilce} / ${parts.il}`;
      } else if (parts.il) {
        acikAdres = parts.il;
      }
    }

    setFormData(prev => ({
      ...prev,
      adres: {
        ...prev.adres,
        ilId: ids.adresIlId || null,
        ilAdi: parts?.il || '',
        ilceId: ids.adresIlceId || null,
        ilceAdi: parts?.ilce || '',
        acikAdres: acikAdres || ''
      }
    }));
  };

  const getModalInitialData = () => {
    return {
      adresIlId: formData.adres?.ilId,
      adresIlceId: formData.adres?.ilceId
    };
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else {
      const returnUrl = location.state?.returnUrl || '/ayarlar/sistem-ayarlari/KargoFirmalari';
      navigate(returnUrl);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    const validationErrors = validateKargoFirmasiForm(formData, t);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.ad) {
        setActiveTab('genel');
      } else if (validationErrors.eposta) {
        setActiveTab('iletisim');
      }
      toast.error(t('auto_zorunlu_alanlari_doldurunuz', 'Lütfen zorunlu alanları doldurunuz.'));
      return;
    }

    setSaving(true);
    try {
      let savedResult;
      if (isEditing) {
        const res = await axios.put(`/api/KargoFirmasi/${effectiveId}`, formData);
        savedResult = res.data;
        toast.success(t('auto_kargo_firmasi_guncellendi', 'Kargo firması başarıyla güncellendi.'));
      } else {
        const res = await axios.post('/api/KargoFirmasi', formData);
        savedResult = res.data;
        toast.success(t('auto_kargo_firmasi_kaydedildi', 'Kargo firması başarıyla kaydedildi.'));
      }

      if (onSuccess) {
        onSuccess(savedResult);
      } else {
        handleClose();
      }
    } catch (err: any) {
      console.error('Kargo firması kaydetme hatası:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.title || t('auto_kaydedilirken_hata_olustu', 'Kaydedilirken hata oluştu.');
      toast.error(typeof errorMsg === 'string' ? errorMsg : t('auto_kaydedilirken_hata_olustu', 'Kaydedilirken hata oluştu.'));
    } finally {
      setSaving(false);
    }
  };

  // EĞER KURAL DÜZENLENİYOR VEYA YENİ KURAL OLUŞTURULUYORSA DOĞRUDAN BaseCardPage'e GEÇ
  if (editingKural !== null) {
    return (
      <KargoKurallarForm
        kargoFirmasiId={effectiveId}
        kargoFirmasiAdi={formData.ad}
        initialData={editingKural === 'new' ? undefined : editingKural}
        kuralId={editingKural === 'new' ? undefined : editingKural.id}
        onClose={() => setEditingKural(null)}
        onSuccess={() => {
          setEditingKural(null);
          fetchKurallar();
        }}
        showBackButton={true}
      />
    );
  }

  const tabs = [
    {
      id: 'genel',
      label: t('auto_genel_bilgiler', 'Genel Bilgiler'),
      icon: <Truck size={18} />,
      content: (
        <div className="dynamic-form-fields-container">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">
                {t('auto_kargo_firmasi_adi_ee12', 'Kargo Firması Adı')}
              </label>
              <BaseInput
                type="text"
                value={formData.ad}
                onChange={(e) => handleChange('ad', e.target.value)}
                onBlur={() => handleBlur('ad')}
                placeholder={t('auto_ornek_aras_kargo_yurtici__31bb', 'Örn: Aras Kargo, Yurtiçi Kargo')}
                error={Boolean(errors.ad)}
                autoFocus
              />
              <FieldError error={errors.ad} />
            </div>

            <div className="form-group">
              <label className="form-label">
                {t('auto_firma_turu', 'Firma Türü')}
              </label>
              <BaseDropdownSecici
                value={formData.tip}
                onChange={(val) => handleChange('tip', String(val))}
                options={firmaTuruOptions}
                clearable={false}
              />
            </div>

            <div className="form-group col-span-full pt-8">
              <BaseSwitch
                checked={formData.aktifMi}
                onChange={(e) => handleChange('aktifMi', e.target.checked)}
                label={t('auto_kargo_firmasi_aktif_olarak_b6e4', 'Kargo firması aktif olarak kullanılsın')}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'iletisim',
      label: t('auto_iletisim_bilgileri', 'İletişim Bilgileri'),
      icon: <Phone size={18} />,
      content: (
        <div className="dynamic-form-fields-container">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                {t('auto_yetkili_sorumlu_kisi', 'Yetkili / Sorumlu Kişi')}
              </label>
              <BaseInput
                type="text"
                value={formData.sorumluKisi}
                onChange={(e) => handleChange('sorumluKisi', e.target.value)}
                placeholder={t('auto_ad_soyad_unvan', 'Ad Soyad / Unvan')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {t('auto_telefon_numarasi', 'Telefon Numarası')}
              </label>
              <PhoneInput
                value={formData.telefon}
                onChange={(val) => handleChange('telefon', val)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {t('auto_eposta_adresi', 'E-Posta Adresi')}
              </label>
              <EmailInput
                value={formData.eposta}
                onChange={(e) => handleChange('eposta', e.target.value)}
                onBlur={() => handleBlur('eposta')}
                placeholder="info@kargo.com"
                error={errors.eposta}
              />
              <FieldError error={errors.eposta} />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'adres',
      label: t('auto_adres_bilgileri', 'Adres Bilgileri'),
      icon: <MapPin size={18} />,
      content: (
        <div className="dynamic-form-fields-container">
          <AdresInput
            value={{
              adresIsmi: formData.adres?.adresIsmi || '',
              ilId: formData.adres?.ilId ?? null,
              ilAdi: formData.adres?.ilAdi || '',
              ilceId: formData.adres?.ilceId ?? null,
              ilceAdi: formData.adres?.ilceAdi || '',
              acikAdres: formData.adres?.acikAdres || ''
            }}
            onChange={(val) => {
              setFormData(prev => ({
                ...prev,
                adres: {
                  ...prev.adres,
                  adresIsmi: val.adresIsmi || '',
                  ilId: val.ilId ?? null,
                  ilAdi: val.ilAdi || '',
                  ilceId: val.ilceId ?? null,
                  ilceAdi: val.ilceAdi || '',
                  acikAdres: val.acikAdres || ''
                }
              }));
            }}
          />
        </div>
      )
    },
    {
      id: 'kurallar',
      label: t('auto_fiyat_bolge_kurallari_kargo', 'Fiyat / Bölge Kuralları'),
      icon: <Navigation size={18} />,
      badge: kurallar.length ? kurallar.length : undefined,
      content: (
        <div className="dynamic-form-fields-container kargo-kurallar-tab-container">
          {/* Header & Add Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="m-0 text-15 font-semibold text-primary flex items-center gap-8">
                <Navigation size={18} className="text-primary" />
                {t('auto_fiyat_bolge_kurallari_kargo', 'Fiyat / Bölge Kuralları')}
              </h3>
              <p className="m-0 text-12 text-secondary mt-2">
                {formData.ad ? `${formData.ad} - ` : ''}
                {t('auto_kargo_firmasi_aciklama_kargo', 'Farklı bölgelere, ürün gruplarına ve günlere göre fiyatlandırma motoru (Kurallar).')}
              </p>
            </div>

            {effectiveId && (
              <button 
                type="button" 
                onClick={() => setEditingKural('new')}
                className="btn btn-primary flex items-center gap-6"
              >
                <Plus size={16} />
                <span>{t('auto_yeni_kural_ekle', 'Yeni Kural Ekle')}</span>
              </button>
            )}
          </div>

          {!effectiveId ? (
            <div className="empty-state-box flex flex-col items-center justify-center p-32 text-center gap-12">
              <AlertCircle size={36} className="text-secondary" />
              <h4 className="text-16 font-semibold text-primary m-0">
                {t('auto_kural_tanimi_icin_kaydedin', 'Kural Tanımı İçin Kargo Firmasını Kaydedin')}
              </h4>
              <p className="text-13 text-secondary m-0 max-w-400">
                {t('auto_kural_eklemeden_once_kaydet_aciklama', 'Fiyat ve bölge kuralları tanımlayabilmek için lütfen önce kargo firmasının Genel Bilgilerini kaydediniz.')}
              </p>
            </div>
          ) : kurallar.length === 0 ? (
            <div className="empty-state-box flex flex-col items-center justify-center p-32 text-center gap-12">
              <Navigation size={40} className="text-secondary opacity-50" />
              <h4 className="text-15 font-semibold text-primary m-0">
                {t('auto_henuz_kural_yok_ed17', 'Henüz Kural Tanımlanmamış')}
              </h4>
              <p className="text-13 text-secondary m-0 max-w-400">
                {t('auto_kural_eklemediginiz__f83f', 'Kural eklemediğinizde kargo firması için herhangi bir bölgesel veya fiyatlama kısıtı uygulanmaz.')}
              </p>
              <button 
                type="button" 
                onClick={() => setEditingKural('new')} 
                className="btn btn-primary flex items-center gap-6 mt-8"
              >
                <Plus size={16} />
                <span>{t('yeni_kural_olustur', 'Yeni Kural Oluştur')}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {kurallar.map(k => (
                <div key={k.id} className="kargo-kural-card">
                  <div className="flex justify-between items-start gap-12">
                    <div>
                      <div className="flex items-center gap-8 mb-6">
                        <span className={`kargo-kural-badge ${
                          k.fiyatlamaTipi === 'Ucretsiz' ? 'is-ucretsiz' : k.fiyatlamaTipi === 'DesiBazli' ? 'is-desi' : 'is-sabit'
                        }`}>
                          {k.fiyatlamaTipi === 'Ucretsiz' ? t('auto_ucretsiz_56d3', 'Ücretsiz Teslimat') : k.fiyatlamaTipi === 'DesiBazli' ? t('auto_desi_bazli_9861', 'Desi Bazlı Fiyat') : t('auto_sabit_fiyat', 'Sabit Fiyat')}
                        </span>
                      </div>
                      <h4 className="text-15 font-semibold text-primary m-0">{k.kuralAdi}</h4>
                      <div className="text-12 text-secondary mt-4 flex items-center gap-4 flex-wrap">
                        <MapPin size={12} className="text-primary" />
                        <span>
                          {(k.bolgeler && k.bolgeler.length > 0) ? k.bolgeler.map((b: any) => b.bolgeMetin).join(' • ') : t('auto_tum_turkiye_secim_ya_edf1', 'Tüm Türkiye')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <button 
                        type="button" 
                        onClick={() => setEditingKural(k)} 
                        className="btn-icon" 
                        title={t('auto_duzenle', 'Düzenle')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setDeleteTargetId(k.id)} 
                        className="btn-icon text-danger" 
                        title={t('auto_sil', 'Sil')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="kargo-kural-details-grid">
                    <div>
                      <div className="text-11 text-secondary uppercase font-semibold mb-2">
                        {t('auto_gecerli_gunler_d13c', 'Geçerli Günler')}
                      </div>
                      <div className="text-13 font-medium text-primary flex items-center gap-6">
                        <Calendar size={13} className="text-warning" />
                        <span>{getGunlerSummary(k.gecerliGunler)}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-11 text-secondary uppercase font-semibold mb-2">
                        {t('auto_fiyatlama_ve_kosullar', 'Fiyatlama & Koşullar')}
                      </div>
                      <div className="text-13 font-medium text-primary flex items-center gap-6">
                        {k.fiyatlamaTipi === 'Ucretsiz' ? (
                          <span className="text-success font-semibold">{t('auto_bedelsiz_kargo', 'Bedelsiz Kargo')}</span>
                        ) : k.fiyatlamaTipi === 'SabitFiyat' ? (
                          <span>{k.fiyat ? `${k.fiyat} ₺` : '0.00 ₺'}</span>
                        ) : (
                          <span>{k.desiFiyatlari?.length || 0} {t('auto_adet_desi_kademesi', 'kademe tanımlı')}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-11 text-secondary uppercase font-semibold mb-2">
                        {t('auto_esik_degerleri', 'Eşik Değerleri')}
                      </div>
                      <div className="text-13 font-medium text-secondary">
                        {k.ucretsizKargoBaraji ? `Baraj: ${k.ucretsizKargoBaraji} ₺` : 'Barajsız'}
                        {k.maksimumDesiSiniri ? ` • Maks: ${k.maksimumDesiSiniri} Desi` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <BaseCardPage
        id="kargoFirmasiFormCardPage"
        icon={<Truck size={22} />}
        title={isEditing ? (formData.ad || t('auto_kargo_firmasi_duzenle', 'Kargo Firması Düzenle')) : t('auto_yeni_kargo_firmasi', 'Yeni Kargo Firması')}
        subtitleLeft={formData.ad ? (formData.tip || t('auto_kargo_firmasi_3aca', 'Kargo Firması')) : t('auto_kargo_firmasi_aciklama_kargo', 'Farklı bölgelere, ürün gruplarına ve günlere göre fiyatlandırma motoru (Kurallar).')}
        subtitleRight={formData.sorumluKisi ? `${formData.sorumluKisi}` : undefined}
        isSaving={saving}
        onSave={handleSubmit}
        onClose={handleClose}
        showBackButton={showBackButton ?? !onCancel}
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
        footerExtra={onCancel ? <CancelButton onClick={handleClose} disabled={saving} /> : undefined}
      />

      <AdresSeciciForm 
        isOpen={showAdresModal} 
        onClose={() => setShowAdresModal(false)} 
        onSave={handleAdresSecimi} 
        initialData={getModalInitialData()} 
      />

      {/* Kural Silme Onay Modalı */}
      <AlertDialog
        isOpen={Boolean(deleteTargetId)}
        title={t('auto_kurali_sil_onay_baslik', 'Kuralı Sil')}
        message={t('auto_kurali_sil_onay_aciklama', 'Bu fiyat/bölge kuralını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')}
        confirmText={t('auto_sil', 'Sil')}
        cancelText={t('auto_vazgec', 'Vazgeç')}
        type="confirm"
        showCancel={true}
        onConfirm={confirmDeleteKural}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
