/**
 * Webakus ERP - Kargo Kuralları Formu (KargoKurallarForm)
 * BaseCardPage mimarisinden türetilmiş Kargo Fiyat ve Bölge Kuralları tanımlama ve düzenleme kartı.
 * 
 * Sekmeler:
 * 1. Genel Bilgiler: Kural Adı, Öncelik, Durum Switch, Geçerli Günler seçimi ve kısayolları
 * 2. Bölge Kapsamı: NVI / UAVT Adres Seçici entegrasyonu, Depo/Lokasyon mimarisine tam uyumlu hiyerarşik kartlar
 * 3. Fiyatlandırma & Desi: Ücretsiz, Sabit Fiyat veya Desi Kademeleri, Baraj ve Eşik Değerleri
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Settings, 
  MapPin, 
  Package, 
  DollarSign, 
  Plus, 
  Trash2, 
  Navigation, 
  Check, 
  Calendar 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  BaseCardPage, 
  BaseInput, 
  BaseSwitch, 
  AdresSeciciForm, 
  FieldError, 
  PageLoader,
  useHeaderApi
} from '@akalin/ui';
import { 
  KargoKuralFormData, 
  validateKargoKuralField, 
  validateKargoKuralForm 
} from '../validators/kargoKuralValidation';

export interface BolgeItem {
  ilId?: number | string | null;
  ilceId?: number | string | null;
  mahalleId?: number | string | null;
  caddeSokakId?: number | string | null;
  ilAdi?: string;
  ilceAdi?: string;
  mahalleAdi?: string;
  bolgeMetin: string;
}

export interface DesiFiyatItem {
  minDesi: number | string;
  maxDesi: number | string;
  fiyat: number | string;
}

export interface KargoKurallarFormProps {
  kargoFirmasiId?: string | number | null;
  kargoFirmasiAdi?: string;
  initialData?: any;
  kuralId?: string | number | null;
  onClose?: () => void;
  onSuccess?: (savedItem?: any) => void;
  showBackButton?: boolean;
}

const INITIAL_FORM: KargoKuralFormData = {
  kuralAdi: '',
  aktifMi: true,
  oncelik: 1,
  bolgeler: [],
  gecerliGunler: '',
  urunGrubuId: '',
  fiyatlamaTipi: 'Ucretsiz',
  fiyat: 0,
  ucretsizKargoBaraji: '',
  maksimumDesiSiniri: '',
  ekstraDesiFiyati: '',
  desiFiyatlari: []
};

const GUNLER = [
  { id: '1', ad: 'Pzt' },
  { id: '2', ad: 'Sal' },
  { id: '3', ad: 'Çar' },
  { id: '4', ad: 'Per' },
  { id: '5', ad: 'Cum' },
  { id: '6', ad: 'Cmt' },
  { id: '7', ad: 'Paz' }
];

export default function KargoKurallarForm({
  kargoFirmasiId,
  kargoFirmasiAdi,
  initialData,
  kuralId,
  onClose,
  onSuccess,
  showBackButton = true
}: KargoKurallarFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const effectiveKuralId = kuralId || initialData?.id || null;
  const isEditing = Boolean(effectiveKuralId);

  const [activeTab, setActiveTab] = useState<string | number>('genel');
  const [formData, setFormData] = useState<KargoKuralFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdresModal, setShowAdresModal] = useState(false);

  // Form verisini yükle
  useEffect(() => {
    if (initialData) {
      setFormData({
        kuralAdi: initialData.kuralAdi || '',
        aktifMi: initialData.aktifMi ?? true,
        oncelik: initialData.oncelik ?? 1,
        bolgeler: initialData.bolgeler || [],
        gecerliGunler: initialData.gecerliGunler || '',
        urunGrubuId: initialData.urunGrubuId || '',
        fiyatlamaTipi: initialData.fiyatlamaTipi || 'Ucretsiz',
        fiyat: initialData.fiyat || 0,
        ucretsizKargoBaraji: initialData.ucretsizKargoBaraji || '',
        maksimumDesiSiniri: initialData.maksimumDesiSiniri || '',
        ekstraDesiFiyati: initialData.ekstraDesiFiyati || '',
        desiFiyatlari: initialData.desiFiyatlari || []
      });
    } else if (kargoFirmasiId && effectiveKuralId) {
      setLoading(true);
      axios.get(`/api/KargoFirmasi/${kargoFirmasiId}`)
        .then(res => {
          const kural = (res.data?.kurallar || []).find((k: any) => String(k.id) === String(effectiveKuralId));
          if (kural) {
            setFormData({
              kuralAdi: kural.kuralAdi || '',
              aktifMi: kural.aktifMi ?? true,
              oncelik: kural.oncelik ?? 1,
              bolgeler: kural.bolgeler || [],
              gecerliGunler: kural.gecerliGunler || '',
              urunGrubuId: kural.urunGrubuId || '',
              fiyatlamaTipi: kural.fiyatlamaTipi || 'Ucretsiz',
              fiyat: kural.fiyat || 0,
              ucretsizKargoBaraji: kural.ucretsizKargoBaraji || '',
              maksimumDesiSiniri: kural.maksimumDesiSiniri || '',
              ekstraDesiFiyati: kural.ekstraDesiFiyati || '',
              desiFiyatlari: kural.desiFiyatlari || []
            });
          }
        })
        .catch(err => {
          console.error('Kural yükleme hatası:', err);
          toast.error(t('kargo_kurallari_yuklenemedi', 'Kargo kuralları yüklenemedi.'));
        })
        .finally(() => setLoading(false));
    } else {
      setFormData(INITIAL_FORM);
    }
  }, [initialData, kargoFirmasiId, effectiveKuralId, t]);

  const { setHeaderBreadcrumbOptions } = useHeaderApi() || {};
  const kuralName = formData.kuralAdi || (isEditing ? t('auto_kurali_duzenle', 'Kural Düzenle') : t('auto_yeni_kural', 'Yeni Kural'));
  const effectiveBreadcrumbTitle = kargoFirmasiAdi ? `${kargoFirmasiAdi} - ${kuralName}` : kuralName;

  useEffect(() => {
    if (setHeaderBreadcrumbOptions) {
      setHeaderBreadcrumbOptions({ recordTitle: effectiveBreadcrumbTitle });
    }
    return () => {
      if (setHeaderBreadcrumbOptions) {
        setHeaderBreadcrumbOptions(null);
      }
    };
  }, [effectiveBreadcrumbTitle, setHeaderBreadcrumbOptions]);

  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleFieldBlur = (fieldName: string, value: any) => {
    const errorMsg = validateKargoKuralField(fieldName, value, formData, t);
    setErrors(prev => {
      const next = { ...prev };
      if (errorMsg) {
        next[fieldName] = errorMsg;
      } else {
        delete next[fieldName];
      }
      return next;
    });
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/ayarlar/sistem-ayarlari/KargoFirmalari');
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    const validationErrors = validateKargoKuralForm(formData, t);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Hatalı sekme tespit edilerek odaklanılır
      if (validationErrors.kuralAdi) {
        setActiveTab('genel');
      } else if (validationErrors.desiFiyatlari || validationErrors.fiyat) {
        setActiveTab('fiyatlandirma');
      }
      toast.error(t('auto_zorunlu_alanlari_doldurunuz', 'Lütfen zorunlu alanları doldurunuz.'));
      return;
    }

    if (!kargoFirmasiId) {
      toast.error(t('auto_kargo_firmasi_secilmedi', 'Kargo firması kimliği bulunamadı.'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        bolgeler: (formData.bolgeler || []).map((b: any) => ({
          ilId: b.ilId ? parseInt(String(b.ilId), 10) : null,
          ilceId: b.ilceId ? parseInt(String(b.ilceId), 10) : null,
          mahalleId: b.mahalleId ? parseInt(String(b.mahalleId), 10) : null,
          caddeSokakId: b.caddeSokakId ? parseInt(String(b.caddeSokakId), 10) : null,
          bolgeMetin: b.bolgeMetin
        })),
        urunGrubuId: formData.urunGrubuId ? parseInt(String(formData.urunGrubuId), 10) : null,
        ucretsizKargoBaraji: formData.ucretsizKargoBaraji ? parseFloat(String(formData.ucretsizKargoBaraji)) : null,
        maksimumDesiSiniri: formData.maksimumDesiSiniri ? parseFloat(String(formData.maksimumDesiSiniri)) : null,
        ekstraDesiFiyati: formData.ekstraDesiFiyati ? parseFloat(String(formData.ekstraDesiFiyati)) : null,
        desiFiyatlari: formData.fiyatlamaTipi === 'DesiBazli' ? (formData.desiFiyatlari || []).map((d: any) => ({
          minDesi: parseFloat(String(d.minDesi)),
          maxDesi: parseFloat(String(d.maxDesi)),
          fiyat: parseFloat(String(d.fiyat))
        })) : []
      };

      let response;
      if (isEditing) {
        response = await axios.put(`/api/KargoFirmasi/${kargoFirmasiId}/kurallar/${effectiveKuralId}`, payload);
        toast.success(t('kural_guncellendi', 'Kural başarıyla güncellendi.'));
      } else {
        response = await axios.post(`/api/KargoFirmasi/${kargoFirmasiId}/kurallar`, payload);
        toast.success(t('kural_eklendi', 'Yeni kural başarıyla eklendi.'));
      }

      if (onSuccess) {
        onSuccess(response?.data);
      } else {
        handleClose();
      }
    } catch (err: any) {
      console.error('Kural kaydetme hatası:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.title || t('kural_kaydedilemedi', 'Kural kaydedilirken hata oluştu.');
      toast.error(typeof errorMsg === 'string' ? errorMsg : t('kural_kaydedilemedi', 'Kural kaydedilirken hata oluştu.'));
    } finally {
      setSaving(false);
    }
  };

  const handleBolgeSave = ({ ids, formattedAdres, parts }: any) => {
    let ilAdi = parts?.il || '';
    let ilceAdi = parts?.ilce || '';
    let mahalleAdi = parts?.mahalle || '';

    if (!ilAdi && formattedAdres) {
      const segs = formattedAdres.split(' / ').map((s: string) => s.trim());
      if (segs.length === 2) {
        ilceAdi = segs[0];
        ilAdi = segs[1];
      } else if (segs.length >= 3) {
        mahalleAdi = segs[0];
        ilceAdi = segs[1];
        ilAdi = segs[2];
      } else {
        ilAdi = formattedAdres;
      }
    }

    const yeniBolge: BolgeItem = {
      ilId: ids?.adresIlId || null,
      ilceId: ids?.adresIlceId || null,
      mahalleId: ids?.adresMahalleId || null,
      caddeSokakId: ids?.adresCaddeSokakId || null,
      ilAdi,
      ilceAdi,
      mahalleAdi,
      bolgeMetin: formattedAdres || t('auto_tum_turkiye_secim_ya_edf1', 'Tüm Türkiye')
    };

    setFormData(prev => ({
      ...prev,
      bolgeler: [...(prev.bolgeler || []), yeniBolge]
    }));
  };

  const removeBolge = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bolgeler: (prev.bolgeler || []).filter((_, i) => i !== index)
    }));
  };

  const toggleGun = (gunId: string) => {
    let seciliGunler = formData.gecerliGunler ? formData.gecerliGunler.split(',') : [];
    if (seciliGunler.includes(gunId)) {
      seciliGunler = seciliGunler.filter(g => g !== gunId);
    } else {
      seciliGunler.push(gunId);
    }
    setFormData(prev => ({ ...prev, gecerliGunler: seciliGunler.sort().join(',') }));
  };

  const setGunlerPreset = (preset: 'her_gun' | 'hafta_ici' | 'hafta_sonu') => {
    if (preset === 'her_gun') {
      setFormData(prev => ({ ...prev, gecerliGunler: '1,2,3,4,5,6,7' }));
    } else if (preset === 'hafta_ici') {
      setFormData(prev => ({ ...prev, gecerliGunler: '1,2,3,4,5' }));
    } else if (preset === 'hafta_sonu') {
      setFormData(prev => ({ ...prev, gecerliGunler: '6,7' }));
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

  const parseBolgeSegments = (b: BolgeItem) => {
    if (b.ilAdi) {
      const list = [{ name: b.ilAdi, level: 'il' }];
      if (b.ilceAdi) list.push({ name: b.ilceAdi, level: 'ilce' });
      if (b.mahalleAdi) list.push({ name: b.mahalleAdi, level: 'mahalle' });
      return list;
    }

    const text = b.bolgeMetin || '';
    if (text.includes(' / ')) {
      const parts = text.split(' / ').map(s => s.trim());
      if (parts.length === 2) {
        return [
          { name: parts[1], level: 'il' },
          { name: parts[0], level: 'ilce' }
        ];
      } else if (parts.length >= 3) {
        return [
          { name: parts[parts.length - 1], level: 'il' },
          { name: parts[parts.length - 2], level: 'ilce' },
          { name: parts.slice(0, parts.length - 2).join(' / '), level: 'mahalle' }
        ];
      }
    }

    return [{ name: text || t('auto_tum_turkiye_secim_ya_edf1', 'Tüm Türkiye'), level: 'tum' }];
  };

  const getBolgeScopeBadge = (b: BolgeItem) => {
    if (b.mahalleId || b.mahalleAdi) return t('auto_mahalle_duzeyi', 'Mahalle Düzeyinde');
    if (b.ilceId || b.ilceAdi) return t('auto_ilce_duzeyi', 'İlçe Düzeyinde');
    if (b.ilId || b.ilAdi) return t('auto_il_duzeyi', 'İl Düzeyinde');
    const segs = parseBolgeSegments(b);
    if (segs.length >= 3) return t('auto_mahalle_duzeyi', 'Mahalle Düzeyinde');
    if (segs.length === 2) return t('auto_ilce_duzeyi', 'İlçe Düzeyinde');
    return t('auto_ozel_bolge', 'Özel Bölge');
  };

  // 1. SEKME: Genel Bilgiler
  const renderGenelTab = () => (
    <div className="dynamic-form-fields-container flex flex-col gap-20">
      <div className="form-grid">
        <div className="form-group">
          <label>
            {t('auto_kural_adi_16bf', 'Kural Adı')} <span className="text-danger">*</span>
          </label>
          <BaseInput
            value={formData.kuralAdi}
            onChange={(e: any) => {
              setFormData(prev => ({ ...prev, kuralAdi: e.target.value }));
              clearFieldError('kuralAdi');
            }}
            onBlur={() => handleFieldBlur('kuralAdi', formData.kuralAdi)}
            placeholder={t('auto_kural_adi_placeholder', 'Örn: İstanbul İçi Ücretsiz Kargo, Marmara Desi Kuralı')}
            error={Boolean(errors.kuralAdi)}
            autoFocus
          />
          <FieldError error={errors.kuralAdi} />
        </div>

        <div className="form-group">
          <label>{t('auto_oncelik_sirasi', 'Öncelik Sırası')}</label>
          <BaseInput
            type="number"
            value={formData.oncelik ?? 1}
            onChange={(e: any) => setFormData(prev => ({ ...prev, oncelik: parseInt(e.target.value, 10) || 1 }))}
            placeholder="1"
          />
          <p className="text-12 text-secondary mt-4">
            {t('auto_oncelik_aciklama', 'Küçük sayılar önce değerlendirilir (1 en yüksek önceliktir).')}
          </p>
        </div>
      </div>

      {/* Durum Switch Kartı */}
      <div className="depo-status-card">
        <BaseSwitch
          label={t('auto_kural_aktif_acik', 'Kural Aktif (Uygulamaya Açık)')}
          checked={formData.aktifMi ?? true}
          onChange={(e) => setFormData(prev => ({ ...prev, aktifMi: e.target.checked }))}
        />
      </div>

      {/* Geçerli Günler Paneli */}
      <div className="p-16 bg-primary rounded-12 border border-glass flex flex-col gap-12">
        <div className="flex justify-between items-center flex-wrap gap-8">
          <div className="flex items-center gap-8">
            <Calendar size={18} className="text-accent" />
            <span className="text-14 font-semibold text-primary">
              {t('auto_gecerli_gunler_d13c', 'Geçerli Günler')}
            </span>
            <span className="badge badge-secondary text-11">
              {getGunlerSummary(formData.gecerliGunler)}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setGunlerPreset('her_gun')}
              className="kargo-preset-btn"
            >
              {t('auto_her_gun_btn', 'Her Gün')}
            </button>
            <button
              type="button"
              onClick={() => setGunlerPreset('hafta_ici')}
              className="kargo-preset-btn"
            >
              {t('auto_hafta_ici_btn', 'Hafta İçi')}
            </button>
            <button
              type="button"
              onClick={() => setGunlerPreset('hafta_sonu')}
              className="kargo-preset-btn"
            >
              {t('auto_hafta_sonu_btn', 'Hafta Sonu')}
            </button>
          </div>
        </div>

        <p className="text-12 text-secondary m-0">
          {t('auto_gecerli_gunler_aciklama', 'Kuralın geçerli olacağı teslimat veya sipariş günlerini seçiniz. Seçim yapılmazsa her gün geçerli kabul edilir.')}
        </p>

        <div className="flex items-center gap-8 flex-wrap mt-4">
          {GUNLER.map(gun => {
            const isSecili = formData.gecerliGunler ? formData.gecerliGunler.split(',').includes(gun.id) : false;
            return (
              <button
                key={gun.id}
                type="button"
                onClick={() => toggleGun(gun.id)}
                className={`kargo-gun-chip ${isSecili ? 'is-active' : ''}`}
              >
                {gun.ad}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // 2. SEKME: Bölge Kapsamı (Depo ve Lokasyon Mimarisi ile Birebir Uyumlu)
  const renderBolgelerTab = () => (
    <div className="dynamic-form-fields-container flex flex-col gap-20">
      {/* Üst Bilgi ve Bölge Ekleme Butonu */}
      <div className="flex items-start justify-between gap-16 pb-16 border-b border-glass">
        <div>
          <h4 className="m-0 mb-4 text-15 font-700 text-primary flex items-center gap-8">
            <MapPin size={18} className="text-accent" />
            {t('auto_hedef_bolgeler_kapsami', 'Hedef Bölge ve Lokasyon Kapsamı')}
            <span className="badge badge-primary">
              {formData.bolgeler?.length || 0}
            </span>
          </h4>
          <p className="m-0 text-13 text-secondary">
            {t('auto_bolge_aciklama_nvi', 'Türkiye NVI/UAVT standartlarında İl, İlçe, Mahalle veya Sokak düzeyinde hedef kural bölgeleri tanımlayabilirsiniz.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdresModal(true)}
          className="btn btn-primary btn-sm flex items-center gap-6 whitespace-nowrap"
        >
          <Plus size={16} />
          <span>{t('auto_yeni_bolge_ekle', 'Yeni Bölge Ekle')}</span>
        </button>
      </div>

      {/* Tanımlı Bölgeler Listesi veya Boş Durum */}
      {(!formData.bolgeler || formData.bolgeler.length === 0) ? (
        <div className="depo-empty-regions">
          <MapPin size={36} className="text-secondary opacity-40 mb-8" />
          <h5 className="m-0 text-14 font-600 text-primary">
            {t('auto_tum_turkiye_ozel_bolge_yok', 'Tüm Türkiye (Özel Bölge Kısıtı Yok)')}
          </h5>
          <p className="m-0 text-13 text-secondary max-w-400">
            {t('auto_henuz_ozel_bolge_yok', 'Henüz özel bir bölge kısıtlaması eklenmedi. Bu kural herhangi bir bölge ayrımı olmaksızın tüm Türkiye için geçerli olacaktır.')}
          </p>
          <button
            type="button"
            onClick={() => setShowAdresModal(true)}
            className="btn btn-primary btn-sm flex items-center gap-6 mt-8"
          >
            <Plus size={15} />
            <span>{t('auto_yeni_bolge_ekle', 'Yeni Bölge Ekle')}</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {formData.bolgeler.map((b, idx) => {
            const segments = parseBolgeSegments(b);
            const scopeBadge = getBolgeScopeBadge(b);

            return (
              <div key={idx} className="kargo-region-item">
                <div className="flex items-center gap-14 min-w-0">
                  <div className="kargo-region-icon-box">
                    <MapPin size={18} />
                  </div>
                  <div className="flex flex-col gap-4 min-w-0">
                    <div className="text-14 font-semibold text-primary flex items-center gap-6 flex-wrap">
                      {segments.map((seg, sIdx) => (
                        <React.Fragment key={sIdx}>
                          {sIdx > 0 && (
                            <span className="text-secondary opacity-40 font-normal">›</span>
                          )}
                          <span className={sIdx === segments.length - 1 ? 'text-primary font-bold' : 'text-secondary font-medium'}>
                            {seg.name}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="flex items-center gap-8">
                      <span className="badge badge-secondary text-11">
                        {scopeBadge}
                      </span>
                      {b.bolgeMetin && (
                        <span className="text-11 text-secondary opacity-75 truncate max-w-300">
                          {b.bolgeMetin}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeBolge(idx)}
                  className="btn btn-ghost text-danger p-8 rounded-8 hover-danger"
                  title={t('auto_sil', 'Sil')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // 3. SEKME: Fiyatlandırma & Desi
  const renderFiyatlandirmaTab = () => (
    <div className="dynamic-form-fields-container flex flex-col gap-24">
      {/* Fiyatlandırma Türü Seçimi */}
      <div>
        <h4 className="m-0 mb-4 text-15 font-700 text-primary flex items-center gap-8">
          <Package size={18} className="text-accent" />
          {t('auto_fiyatlandirma_tipi_secimi', 'Fiyatlandırma Türü')}
        </h4>
        <p className="m-0 text-13 text-secondary mb-12">
          {t('auto_fiyatlandirma_tipi_aciklama', 'Bu kural için uygulanacak kargo ücret hesaplama modelini seçiniz.')}
        </p>

        <div className="kargo-fiyatlama-options-grid">
          <div
            onClick={() => setFormData(prev => ({ ...prev, fiyatlamaTipi: 'Ucretsiz' }))}
            className={`kargo-fiyatlama-option ${formData.fiyatlamaTipi === 'Ucretsiz' ? 'is-active-ucretsiz' : ''}`}
          >
            <div className="flex items-center gap-8 font-semibold text-14">
              <span className="kargo-fiyatlama-radio">
                {formData.fiyatlamaTipi === 'Ucretsiz' && <Check size={12} />}
              </span>
              <span>{t('auto_ucretsiz_56d3', 'Ücretsiz Teslimat')}</span>
            </div>
            <p className="text-12 text-secondary m-0 mt-6">
              {t('auto_ucretsiz_kargo_aciklama', 'Bu kural kapsamına giren gönderilerden kargo ücreti tahsil edilmez.')}
            </p>
          </div>

          <div
            onClick={() => setFormData(prev => ({ ...prev, fiyatlamaTipi: 'SabitFiyat' }))}
            className={`kargo-fiyatlama-option ${formData.fiyatlamaTipi === 'SabitFiyat' ? 'is-active-sabit' : ''}`}
          >
            <div className="flex items-center gap-8 font-semibold text-14">
              <span className="kargo-fiyatlama-radio">
                {formData.fiyatlamaTipi === 'SabitFiyat' && <Check size={12} />}
              </span>
              <span>{t('auto_sabit_fiyat', 'Sabit Fiyat')}</span>
            </div>
            <p className="text-12 text-secondary m-0 mt-6">
              {t('auto_sabit_fiyat_aciklama', 'Desi ve ağırlıktan bağımsız tek bir standart kargo gönderim bedeli uygulanır.')}
            </p>
          </div>

          <div
            onClick={() => setFormData(prev => ({ ...prev, fiyatlamaTipi: 'DesiBazli' }))}
            className={`kargo-fiyatlama-option ${formData.fiyatlamaTipi === 'DesiBazli' ? 'is-active-desi' : ''}`}
          >
            <div className="flex items-center gap-8 font-semibold text-14">
              <span className="kargo-fiyatlama-radio">
                {formData.fiyatlamaTipi === 'DesiBazli' && <Check size={12} />}
              </span>
              <span>{t('auto_desi_bazli_9861', 'Desi Bazlı Fiyat')}</span>
            </div>
            <p className="text-12 text-secondary m-0 mt-6">
              {t('auto_desi_bazli_aciklama', 'Paketin desi aralığına göre kademeli fiyat tablosu kullanılır.')}
            </p>
          </div>
        </div>
      </div>

      {/* Sabit Fiyat Girişi */}
      {formData.fiyatlamaTipi === 'SabitFiyat' && (
        <div className="p-16 bg-secondary rounded-12 border border-glass flex flex-col gap-6 max-w-400">
          <label className="text-13 font-semibold text-secondary">
            {t('auto_sabit_kargo_ucreti', 'Sabit Kargo Ücreti (₺)')} <span className="text-danger">*</span>
          </label>
          <div className="flex items-center gap-8">
            <BaseInput
              type="number"
              step="0.01"
              value={formData.fiyat || ''}
              onChange={(e: any) => {
                setFormData(prev => ({ ...prev, fiyat: parseFloat(e.target.value) || 0 }));
                clearFieldError('fiyat');
              }}
              onBlur={() => handleFieldBlur('fiyat', formData.fiyat)}
              placeholder="0.00"
              error={Boolean(errors.fiyat)}
              className="text-right"
            />
            <span className="text-14 font-semibold text-secondary">₺ TRY</span>
          </div>
          <FieldError error={errors.fiyat} />
        </div>
      )}

      {/* Desi Kademeleri Tablosu */}
      {formData.fiyatlamaTipi === 'DesiBazli' && (
        <div className="flex flex-col gap-12">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-14 font-semibold text-primary m-0 flex items-center gap-6">
                <Package size={16} className="text-accent" />
                {t('auto_desi_kademeleri_tablosu', 'Desi Fiyat Kademeleri')}
              </h4>
              <p className="text-12 text-secondary m-0 mt-2">
                {t('auto_desi_kademeleri_aciklama', 'Min ve Maksimum desi aralıkları için uygulanacak net fiyatları belirleyiniz.')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const kademeler = formData.desiFiyatlari || [];
                const son = kademeler[kademeler.length - 1];
                const yMin = son ? Number(son.maxDesi) : 0;
                const yMax = son ? Number(son.maxDesi) + 5 : 5;
                setFormData(prev => ({
                  ...prev,
                  desiFiyatlari: [...(prev.desiFiyatlari || []), { minDesi: yMin, maxDesi: yMax, fiyat: '' }]
                }));
                clearFieldError('desiFiyatlari');
              }}
              className="btn btn-secondary btn-sm flex items-center gap-6"
            >
              <Plus size={15} />
              <span>{t('auto_kademe_ekle', 'Kademe Ekle')}</span>
            </button>
          </div>

          <FieldError error={errors.desiFiyatlari} />

          {(!formData.desiFiyatlari || formData.desiFiyatlari.length === 0) ? (
            <div className="depo-empty-regions">
              <Package size={32} className="text-secondary opacity-40 mb-8" />
              <h5 className="m-0 text-13 font-semibold text-primary">
                {t('auto_henuz_kademe_eklenmedi', 'Henüz Desi Kademesi Eklenmedi')}
              </h5>
              <p className="text-12 text-secondary m-0">
                {t('auto_kademe_ekle_ipucu', 'Yukarıdaki "Kademe Ekle" butonuna basarak örneğin 0-5 Desi için 45 TL gibi fiyat aralıkları tanımlayabilirsiniz.')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-10 border border-glass">
              <table className="kargo-desi-table">
                <thead>
                  <tr>
                    <th className="kargo-desi-th">{t('auto_min_desi', 'Min Desi')}</th>
                    <th className="kargo-desi-th">{t('auto_max_desi', 'Maksimum Desi')}</th>
                    <th className="kargo-desi-th text-right">{t('auto_kargo_ucreti', 'Kargo Ücreti (₺)')}</th>
                    <th className="kargo-desi-th w-50"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.desiFiyatlari.map((kademe, index) => (
                    <tr key={index}>
                      <td className="kargo-desi-td">
                        <BaseInput
                          type="number"
                          step="0.1"
                          value={kademe.minDesi}
                          onChange={(e: any) => {
                            const val = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              desiFiyatlari: (prev.desiFiyatlari || []).map((d, i) => i === index ? { ...d, minDesi: val } : d)
                            }));
                            clearFieldError('desiFiyatlari');
                          }}
                          placeholder="0"
                        />
                      </td>
                      <td className="kargo-desi-td">
                        <BaseInput
                          type="number"
                          step="0.1"
                          value={kademe.maxDesi}
                          onChange={(e: any) => {
                            const val = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              desiFiyatlari: (prev.desiFiyatlari || []).map((d, i) => i === index ? { ...d, maxDesi: val } : d)
                            }));
                            clearFieldError('desiFiyatlari');
                          }}
                          placeholder="5"
                        />
                      </td>
                      <td className="kargo-desi-td">
                        <BaseInput
                          type="number"
                          step="0.01"
                          value={kademe.fiyat}
                          onChange={(e: any) => {
                            const val = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              desiFiyatlari: (prev.desiFiyatlari || []).map((d, i) => i === index ? { ...d, fiyat: val } : d)
                            }));
                            clearFieldError('desiFiyatlari');
                          }}
                          placeholder="50.00"
                          className="text-right"
                        />
                      </td>
                      <td className="kargo-desi-td text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              desiFiyatlari: (prev.desiFiyatlari || []).filter((_, i) => i !== index)
                            }));
                          }}
                          className="btn btn-ghost text-danger p-6 rounded-6 hover-danger"
                          title={t('auto_sil', 'Sil')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Eşik Değerleri ve Limitler */}
      <div className="pt-16 border-t border-glass flex flex-col gap-12">
        <h4 className="text-14 font-semibold text-primary m-0 flex items-center gap-6">
          <DollarSign size={16} className="text-accent" />
          {t('auto_esik_ve_limitler', 'Eşik Değerleri ve Ekstra Ücretler')}
        </h4>

        <div className="grid cols-3 gap-16">
          <div className="form-group">
            <label>{t('auto_ucretsiz_kargo_baraji_tl', 'Ücretsiz Kargo Barajı (₺)')}</label>
            <BaseInput
              type="number"
              step="0.01"
              value={formData.ucretsizKargoBaraji ?? ''}
              onChange={(e: any) => setFormData(prev => ({ ...prev, ucretsizKargoBaraji: e.target.value }))}
              placeholder={t('auto_ornek_tutar_placeholder', 'Örn: 750 (Boşsa limitsiz)')}
              className="text-right"
            />
            <span className="text-11 text-secondary mt-2">
              {t('auto_ucretsiz_baraj_aciklama', 'Sepet bu tutarı aştığında kargo bedelsiz olur.')}
            </span>
          </div>

          <div className="form-group">
            <label>{t('auto_maksimum_desi_siniri', 'Maksimum Desi Sınırı')}</label>
            <BaseInput
              type="number"
              step="0.1"
              value={formData.maksimumDesiSiniri ?? ''}
              onChange={(e: any) => setFormData(prev => ({ ...prev, maksimumDesiSiniri: e.target.value }))}
              placeholder={t('auto_ornek_desi_placeholder', 'Örn: 30')}
            />
            <span className="text-11 text-secondary mt-2">
              {t('auto_maksimum_desi_aciklama', 'Bu desi aşıldığında ekstra ücret devreye girer.')}
            </span>
          </div>

          <div className="form-group">
            <label>{t('auto_ekstra_desi_fiyati_tl', 'Ekstra Desi Başına Ücret (₺)')}</label>
            <BaseInput
              type="number"
              step="0.01"
              value={formData.ekstraDesiFiyati ?? ''}
              onChange={(e: any) => setFormData(prev => ({ ...prev, ekstraDesiFiyati: e.target.value }))}
              placeholder="0.00"
              className="text-right"
            />
            <span className="text-11 text-secondary mt-2">
              {t('auto_ekstra_desi_aciklama', 'Maksimum limit üstündeki her desi için eklenir.')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = useMemo(() => [
    {
      id: 'genel',
      label: t('auto_genel_bilgiler', 'Genel Bilgiler'),
      icon: <Settings size={18} />,
      content: renderGenelTab()
    },
    {
      id: 'bolgeler',
      label: t('auto_bolge_kapsami', 'Bölge Kapsamı'),
      icon: <MapPin size={18} />,
      badge: formData.bolgeler?.length ? formData.bolgeler.length : undefined,
      content: renderBolgelerTab()
    },
    {
      id: 'fiyatlandirma',
      label: t('auto_fiyatlandirma_ve_desi', 'Fiyatlandırma & Desi'),
      icon: <Package size={18} />,
      content: renderFiyatlandirmaTab()
    }
  ], [formData, errors]);

  if (loading) {
    return <PageLoader />;
  }

  const pageTitleText = isEditing 
    ? t('kurali_duzenle', 'Kuralı Düzenle') 
    : t('yeni_kural_olustur', 'Yeni Kural Oluştur');

  return (
    <>
      <BaseCardPage
        title={pageTitleText}
        pageTitle={pageTitleText}
        icon={<Navigation size={22} />}
        subtitleLeft={kargoFirmasiAdi ? `${t('auto_kargo_firmasi', 'Kargo Firması')}: ${kargoFirmasiAdi}` : undefined}
        subtitleRight={formData.kuralAdi || pageTitleText}
        showBackButton={showBackButton}
        onClose={handleClose}
        onSave={handleSave}
        isSaving={saving}
        saveButtonText={t('auto_kaydet', 'Kaydet')}
        asForm={false}
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
        hideIfSingleTab={false}
      />

      {/* NVI / UAVT Adres Seçici Modal */}
      <AdresSeciciForm
        isOpen={showAdresModal}
        onClose={() => setShowAdresModal(false)}
        onSave={(data: any) => {
          handleBolgeSave(data);
          setShowAdresModal(false);
        }}
        title={t('auto_hedef_bolge_sec', 'Hedef Kargo Bölgesi Seçimi')}
      />
    </>
  );
}
