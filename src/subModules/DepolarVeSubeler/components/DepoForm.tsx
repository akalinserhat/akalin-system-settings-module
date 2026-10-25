/**
 * Webakus ERP - Depo ve Şube Tanımlama Formu (DepoForm).
 * Depo, şube ve mağaza kartlarının genel bilgilerini, adreslerini,
 * sorumlu personellerini ve hizmet bölgelerini yönetir.
 * PersonelForm / CariForm ile aynı BaseCardPage ve CSS class mimarisini kullanır.
 * 
 * KAYDET DÜĞMESİ VE İÇERİK KONUMLANDIRMA KURALI:
 * - Kaydet düğmesi (BaseCardPage / base-page-footer) her zaman sayfanın content alanının (.base-page-content-inner) altında yer alır.
 * - İçerik sayfa görünür sınırlarını aşmadığında (kısa form): margin-top: auto sayesinde kart alanının en alt kısmına hizalanır.
 * - İçerik sayfa görünür sınırlarını aştığında (uzun form): içeriğin en altında yer alır ve sayfa ile doğal şekilde scroll eder (sabit/fixed kalmaz).
 * - Form içi tab sarmalayıcılarında veya alanlarında asla ekstra overflow-y: auto veya sabit height kullanılmamalıdır.
 */

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Plus, Map, Trash2 } from 'lucide-react';
import { BaseCardPage, AdresSeciciForm, BaseSwitch, useHeaderApi, AlertDialog } from '@akalin/ui';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { depolarService } from '@akalin/warehouse_module';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

interface DepoFormData {
  ad: string;
  kod: string;
  tur: number;
  telefon?: string;
  adres: string;
  adresIlId: string | number | null;
  adresIlceId: string | number | null;
  adresBucakId: string | number | null;
  adresKoyId: string | number | null;
  adresMahalleId: string | number | null;
  adresCaddeSokakId: string | number | null;
  adresDisKapiId: string | number | null;
  adresIcKapiId: string | number | null;
  sorumluPersonelIds: number[];
  aktifMi: boolean;
  seriTakibiYapilirMi: boolean;
  hizmetBolgeleri: any[];
}

export interface DepoFormProps {
  initialData?: any;
  inMemoryMode?: boolean;
  onSaveMemory?: (data: any) => void;
  returnTo?: string;
  onSuccess?: (id?: any) => void;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onTitleChange?: (title: string) => void;
  onSavingChange?: (isSaving: boolean) => void;
}

const DepoForm: React.FC<DepoFormProps> = ({
  initialData,
  inMemoryMode = false,
  onSaveMemory,
  returnTo: customReturnTo,
  onSuccess,
  onCancel,
  onDirtyChange,
  onTitleChange,
  onSavingChange
}) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isRouteId = !inMemoryMode && !!(id && id !== 'yeni' && !isNaN(Number(id)));
  const effectiveId = initialData?.id || (isRouteId ? Number(id) : null);
  const returnTo = customReturnTo || location.state?.returnTo || '/ayarlar/sistem-ayarlari/DepolarVeSubeler';

  const [loading, setLoading] = useState(isRouteId && !initialData && !location.state?.item);
  const [activeTab, setActiveTab] = useState<string | number>('genel');
  const [isAdresModalOpen, setIsAdresModalOpen] = useState(false);
  const [isHizmetModalOpen, setIsHizmetModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    type?: 'info' | 'error' | 'warning' | 'success' | 'confirm';
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: (() => void) | null;
  }>({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    confirmText: t('Evet, Çık'),
    cancelText: t('auto_iptal', 'İptal'),
    onConfirm: null
  });

  const [kullanicilar] = useState([
    { id: 1, adSoyad: 'Serhat Akalın' },
    { id: 2, adSoyad: 'Ahmet Yılmaz' },
    { id: 3, adSoyad: 'Ayşe Demir' },
    { id: 4, adSoyad: 'Mehmet Kaya' }
  ]);

  const defaultState: DepoFormData = {
    ad: '',
    kod: '',
    tur: 3,
    telefon: '',
    adres: '',
    adresIlId: '',
    adresIlceId: '',
    adresBucakId: '',
    adresKoyId: '',
    adresMahalleId: '',
    adresCaddeSokakId: '',
    adresDisKapiId: '',
    adresIcKapiId: '',
    sorumluPersonelIds: [],
    aktifMi: true,
    seriTakibiYapilirMi: false,
    hizmetBolgeleri: []
  };

  const [formData, setFormData] = useState<DepoFormData>(() => {
    if (initialData) return { ...defaultState, ...initialData };
    if (location.state?.item) return { ...defaultState, ...location.state.item };
    return defaultState;
  });
  const [originalData, setOriginalData] = useState<DepoFormData>(() => ({ ...formData }));
  const { setHeaderBreadcrumbOptions } = useHeaderApi() || {};

  useEffect(() => {
    if (isRouteId && !initialData && !location.state?.item) {
      setLoading(true);
      depolarService.getById(Number(id))
        .then(data => {
          const loaded = { ...defaultState, ...data };
          setFormData(loaded);
          setOriginalData(loaded);
          if (onTitleChange && loaded.ad) onTitleChange(loaded.ad);
        })
        .catch(err => {
          console.error('Depo detay hatası:', err);
          toast.error(t('auto_depo_bilgileri_yuklenemedi', 'Depo bilgileri yüklenemedi.'));
          if (onCancel) onCancel();
          else navigate(returnTo, { replace: true });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isRouteId, initialData]);

  useEffect(() => {
    if (initialData) {
      const merged = { ...defaultState, ...initialData };
      setFormData(merged);
      setOriginalData(merged);
      if (onTitleChange && merged.ad) onTitleChange(merged.ad);
    }
  }, [initialData]);

  const recordTitle = formData.ad || (effectiveId ? (formData.ad || t('auto_depo_karti', 'Depo Kartı')) : t('auto_yeni_depo', 'Yeni Depo'));

  useEffect(() => {
    if (setHeaderBreadcrumbOptions) {
      setHeaderBreadcrumbOptions({ recordTitle });
    }
    return () => {
      if (setHeaderBreadcrumbOptions) {
        setHeaderBreadcrumbOptions(null);
      }
    };
  }, [recordTitle, setHeaderBreadcrumbOptions]);

  useEffect(() => {
    if (onTitleChange && formData.ad) {
      onTitleChange(formData.ad);
    }
  }, [formData.ad, onTitleChange]);

  const isDirty = formData.ad !== (originalData.ad || '') ||
                  formData.kod !== (originalData.kod || '') ||
                  formData.tur !== (originalData.tur || 3) ||
                  formData.telefon !== (originalData.telefon || '') ||
                  formData.adres !== (originalData.adres || '') ||
                  formData.aktifMi !== (originalData.aktifMi ?? true) ||
                  formData.seriTakibiYapilirMi !== (originalData.seriTakibiYapilirMi ?? false);

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  const handleTypeChange = (newTypeStr: string) => {
    let typeVal = 3;
    if (newTypeStr === 'Mağaza') typeVal = 2;
    if (newTypeStr === 'Depo') typeVal = 1;
    if (newTypeStr === 'Sanal') typeVal = 5;
    if (newTypeStr === 'Lojistik') typeVal = 6;
    setFormData(prev => ({ ...prev, tur: typeVal }));
  };

  const getSelectedTypeStr = (tur: number) => {
    if (tur === 2) return 'Mağaza';
    if (tur === 1 || tur === 4) return 'Depo';
    if (tur === 5) return 'Sanal';
    if (tur === 6) return 'Lojistik';
    return 'Şube';
  };

  const doCloseNavigation = () => {
    if (onCancel) {
      onCancel();
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(returnTo, { replace: true });
    }
  };

  const handleClose = () => {
    if (isDirty) {
      setAlertDialog({
        isOpen: true,
        type: 'confirm',
        title: t('Kaydedilmemiş Değişiklikler'),
        message: t('Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinize emin misiniz?'),
        confirmText: t('Evet, Çık'),
        cancelText: t('auto_iptal', 'İptal'),
        onConfirm: () => {
          setAlertDialog(prev => ({ ...prev, isOpen: false }));
          doCloseNavigation();
        }
      });
    } else {
      doCloseNavigation();
    }
  };

  const handleSave = async (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.ad || !formData.kod) {
      toast.error(t('Lütfen zorunlu alanları doldurunuz.'));
      return;
    }
    const payload: any = { ...formData };
    ['adresIlId', 'adresIlceId', 'adresBucakId', 'adresKoyId',
     'adresMahalleId', 'adresCaddeSokakId', 'adresDisKapiId', 'adresIcKapiId'
    ].forEach(field => { if (payload[field] === '') payload[field] = null; });

    try {
      setIsSaving(true);
      if (onSavingChange) onSavingChange(true);

      if (inMemoryMode) {
        const savedItem = {
          ...payload,
          id: effectiveId || (initialData?.id || Date.now())
        };
        if (onSaveMemory) {
          onSaveMemory(savedItem);
        }
        toast.success(t('Depo başarıyla kaydedildi.'));
        setOriginalData({ ...formData });
        if (onSuccess) {
          onSuccess(savedItem.id);
        } else {
          doCloseNavigation();
        }
        return;
      }

      let res;
      if (effectiveId) {
        res = await depolarService.update(effectiveId, { ...payload, id: effectiveId });
      } else {
        res = await depolarService.create(payload);
      }
      toast.success(t('Depo başarıyla kaydedildi.'));
      setOriginalData({ ...formData });
      if (onSuccess) {
        onSuccess(res?.id || effectiveId);
      } else if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate(returnTo, { replace: true });
      }
    } catch (err) {
      console.error('Kaydetme hatası:', err);
      toast.error(t('Kayıt sırasında bir hata oluştu.'));
    } finally {
      setIsSaving(false);
      if (onSavingChange) onSavingChange(false);
    }
  };

  // Adres seçici modal — CariForm pattern: conditional early return
  if (isAdresModalOpen) {
    return (
      <AdresSeciciForm
        isOpen={true}
        onClose={() => setIsAdresModalOpen(false)}
        initialData={{
          adresIlId: formData.adresIlId,
          adresIlceId: formData.adresIlceId,
          adresKoyId: formData.adresKoyId,
          adresMahalleId: formData.adresMahalleId,
          adresCaddeSokakId: formData.adresCaddeSokakId,
          adresDisKapiId: formData.adresDisKapiId,
          adresIcKapiId: formData.adresIcKapiId,
        }}
        onSave={({ ids, formattedAdres }) => {
          setFormData(prev => ({ ...prev, ...ids, adres: formattedAdres }));
          setIsAdresModalOpen(false);
        }}
      />
    );
  }

  if (isHizmetModalOpen) {
    return (
      <AdresSeciciForm
        isOpen={true}
        onClose={() => setIsHizmetModalOpen(false)}
        initialData={{}}
        onSave={({ ids, formattedAdres }) => {
          if (!ids.adresIlId) {
            toast.error(t('En az bir İl seçmelisiniz.'));
            return;
          }
          const parts = formattedAdres.split('/');
          const ilName = parts[parts.length - 1]?.trim();
          const ilceName = parts.length > 1 ? parts[parts.length - 2]?.trim().split(' ').pop() : null;
          setFormData(prev => ({
            ...prev,
            hizmetBolgeleri: [
              ...prev.hizmetBolgeleri,
              {
                ilId: ids.adresIlId,
                ilceId: ids.adresIlceId,
                mahalleId: ids.adresMahalleId,
                ilAdi: ilName,
                ilceAdi: ilceName,
                mahalleAdi: ids.adresMahalleId ? t('secili_mahalle', 'Seçili Mahalle') : null
              }
            ]
          }));
          setIsHizmetModalOpen(false);
        }}
      />
    );
  }

  const tabs = [
    {
      id: 'genel',
      label: t('Genel Bilgiler'),
      icon: <Building2 size={18} />,
      content: (
        <div className="dynamic-form-fields-container">
          <div className="form-grid">
            <div className="form-group col-span-full">
              <label>{t('lokasyon_tipi', 'Lokasyon Tipi')}</label>
              <div className="flex flex-wrap gap-8">
                {['Şube', 'Mağaza', 'Depo', 'Sanal', 'Lojistik'].map(typeStr => {
                  const isSelected = getSelectedTypeStr(formData.tur) === typeStr;
                  return (
                    <button
                      key={typeStr}
                      type="button"
                      onClick={() => handleTypeChange(typeStr)}
                      className={`depo-type-btn ${isSelected ? 'active' : ''}`}
                    >
                      {typeStr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kısa Kod */}
            <div className="form-group">
              <label>{t('auto_kisa_kod__2928', 'Kısa Kod')} <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formData.kod}
                onChange={e => setFormData({ ...formData, kod: e.target.value })}
                placeholder="Örn: SB-001"
                autoFocus
              />
            </div>

            {/* Adı */}
            <div className="form-group">
              <label>{t('auto_adi__dee3', 'Adı')} <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-input"
                value={formData.ad}
                onChange={e => setFormData({ ...formData, ad: e.target.value })}
                placeholder="Örn: Merkez Şube"
              />
            </div>

            {/* Telefon */}
            <div className="form-group">
              <label>{t('telefon', 'Telefon')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.telefon || ''}
                onChange={e => setFormData({ ...formData, telefon: e.target.value })}
                placeholder="Örn: 0212 111 22 33"
              />
            </div>

            {/* Sorumlu Personel */}
            <div className="form-group">
              <label>{t('sorumlu_personel', 'Sorumlu / Yetkili Personel')}</label>
              <select
                className="form-input"
                value={formData.sorumluPersonelIds?.length > 0 ? formData.sorumluPersonelIds[0] : ''}
                onChange={e => {
                  const val = e.target.value;
                  setFormData({ ...formData, sorumluPersonelIds: val ? [parseInt(val, 10)] : [] });
                }}
              >
                <option value="">{t('auto__atama_yapilmadi__62ea', '-- Atama Yapılmadı --')}</option>
                {kullanicilar.map(k => (
                  <option key={k.id} value={k.id}>{k.adSoyad}</option>
                ))}
              </select>
            </div>

            {/* Adres Bilgileri */}
            <div className="form-group col-span-full">
              <div className="flex items-center justify-between mb-8">
                <label className="m-0">{t('adres_bilgileri', 'Adres Bilgileri')}</label>
                <button
                  type="button"
                  onClick={() => setIsAdresModalOpen(true)}
                  className="btn btn-secondary btn-sm flex items-center gap-6"
                >
                  <MapPin size={14} /> {t('adres_belirle', 'Adres Belirle')}
                </button>
              </div>
              <div
                className={`form-input flex items-center cursor-default min-h-44 ${formData.adres ? 'text-primary opacity-100' : 'text-secondary opacity-60'}`}
              >
                {formData.adres || t('adres_secilmedi', 'Adres seçilmedi...')}
              </div>
            </div>
          </div>

          {/* Durum Seçenekleri */}
          <div className="depo-status-card">
            <BaseSwitch
              label={t('auto_aktif_islemlere_acik_9187', 'Aktif (İşlemlere Açık)')}
              checked={formData.aktifMi}
              onChange={(e) => setFormData(prev => ({ ...prev, aktifMi: e.target.checked }))}
            />
            <BaseSwitch
              label={t('auto_seri_numarali_takip__8890', 'Seri Numaralı Takip Yapılır')}
              checked={formData.seriTakibiYapilirMi}
              onChange={(e) => setFormData(prev => ({ ...prev, seriTakibiYapilirMi: e.target.checked }))}
            />
          </div>
        </div>
      )
    },
    {
      id: 'hizmet',
      label: t('Hizmet Bölgeleri (Dağıtım Ağı)'),
      icon: <Map size={18} />,
      content: (
        <div className="dynamic-form-fields-container flex flex-col gap-20">
          <div className="flex items-start justify-between gap-16">
            <div>
              <h4 className="m-0 mb-4 text-15 font-700 text-primary">
                {t('auto_dagitim_hizmet_aglar_a7cc', 'Dağıtım & Hizmet Ağları')}
              </h4>
              <p className="m-0 text-13 text-secondary">
                {t('hizmet_bolgeleri_aciklama', 'Bu lokasyonun hizmet verdiği adres sınırlarını belirleyin.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsHizmetModalOpen(true)}
              className="btn btn-primary btn-sm flex items-center gap-6 whitespace-nowrap"
            >
              <Plus size={16} /> {t('yeni_bolge_kurali', 'Yeni Bölge Kuralı')}
            </button>
          </div>

          <div className="flex flex-col gap-12">
            {formData.hizmetBolgeleri.length === 0 ? (
              <div className="depo-empty-regions">
                <Map size={32} className="text-secondary opacity-40 mb-8" />
                <h5 className="m-0 text-14 font-600 text-primary">
                  {t('auto_henuz_bir_kural_ekle_61f9', 'Henüz bir bölge kuralı eklenmemiş')}
                </h5>
                <p className="m-0 text-13 text-secondary">
                  {t('auto_liste_bossa_tum_bolg_cb3b', 'Liste boş ise tüm bölgelere teslimat/hizmet verilebilir.')}
                </p>
              </div>
            ) : (
              formData.hizmetBolgeleri.map((hb, idx) => (
                <div
                  key={idx}
                  className="depo-region-item"
                >
                  <div className="flex items-center gap-12">
                    <div className="depo-region-icon-box">
                      <MapPin size={18} />
                    </div>
                    <span className="text-14 font-600 text-primary">
                      {hb.ilAdi || `İl ID: ${hb.ilId}`}
                      {hb.ilceAdi && ` > ${hb.ilceAdi}`}
                      {hb.mahalleAdi && ` > ${hb.mahalleAdi}`}
                      {!hb.ilceAdi && !hb.ilId && ` > ${t('tum_bolgeler', 'Tüm Bölgeler')}`}
                      {hb.ilceAdi && !hb.mahalleAdi && !hb.mahalleId && ` > ${t('tum_mahalleler', 'Tüm Mahalleler')}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newList = [...formData.hizmetBolgeleri];
                      newList.splice(idx, 1);
                      setFormData({ ...formData, hizmetBolgeleri: newList });
                    }}
                    className="btn btn-ghost text-danger p-8"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-secondary p-24">
        {t('auto_yukleniyor_4deb', 'Yükleniyor...')}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <BaseCardPage
        id="depoFormCardPage"
        onSubmit={handleSave}
        icon={<Building2 size={20} />}
        title={effectiveId ? t('Depo / Lokasyon Kartı Düzenle') : t('Yeni Depo / Lokasyon Kartı')}
        subtitleLeft={t('depo_form_aciklama', 'Depo, mağaza ve şube lokasyon kartı detaylarını yapılandırın.')}
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
        confirmText={alertDialog.confirmText || t('Evet, Çık')}
        cancelText={alertDialog.cancelText || t('auto_iptal', 'İptal')}
      />
    </div>
  );
};

export default DepoForm;
