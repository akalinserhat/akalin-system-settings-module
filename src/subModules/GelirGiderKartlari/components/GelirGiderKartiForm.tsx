/**
 * @file GelirGiderKartiForm.tsx
 * @description 
 * Gelir ve Gider Kartı Tanımlama ve Düzenleme Formu.
 * Gelir/Gider türü, KDV oranı ve açıklama bilgilerini yönetir.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { BaseCardPage, KdvSecici, PageLoader } from '@akalin/ui';

interface GelirGiderKartiFormProps {
  id?: string;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  asForm?: boolean;
}

const GelirGiderKartiForm: React.FC<GelirGiderKartiFormProps> = ({ id, initialData, onSuccess, onCancel, onDirtyChange, asForm = false }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    kod: '',
    ad: '',
    tur: 1, // 1: Gelir, 2: Gider
    kdvOrani: 0,
    muhasebeKodu: '',
    aciklama: '',
    aktifMi: true
  });
  const [kdvGruplari, setKdvGruplari] = useState<any[]>([]);
  const [conflictDialog, setConflictDialog] = useState(false);
  const [conflictError, setConflictError] = useState('');
  const [isCodeManuallyChanged, setIsCodeManuallyChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchKdvGruplari = async () => {
      try {
        const res = await axios.get('/api/KdvGruplari/aktif-oranlar');
        setKdvGruplari(res.data || []);
      } catch (err) {
        console.error('KDV Grupları çekilemedi:', err);
      }
    };
    fetchKdvGruplari();
  }, []);

  const getOran = (kdv: any) => {
    if (!kdv) return 0;
    if (kdv.oranlar && Array.isArray(kdv.oranlar) && kdv.oranlar.length > 0) {
        const sorted = [...kdv.oranlar].sort((a: any, b: any) => new Date(b.baslangicTarihi).getTime() - new Date(a.baslangicTarihi).getTime());
        return sorted[0].oran;
    }
    return kdv.aktifOran ?? kdv.oran ?? kdv.kdvOrani ?? kdv.deger ?? 0;
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      axios.get(`/api/GelirGiderKartlari/${id}`)
        .then(res => {
          const data = res.data;
          setFormData({
            kod: data.kod || '',
            ad: data.ad || '',
            tur: data.tur || 1,
            kdvOrani: data.kdvOrani || 0,
            muhasebeKodu: data.muhasebeKodu || '',
            aciklama: data.aciklama || '',
            aktifMi: data.aktifMi ?? true
          });
        })
        .catch(err => {
          console.error('Kayıt çekilemedi:', err);
          toast.error(t('auto_kayit_bulunamadi_6a12', 'Kayıt bulunamadı.'));
        })
        .finally(() => setIsLoading(false));
    } else if (initialData) {
      setFormData({
        kod: initialData.kod || '',
        ad: initialData.ad || '',
        tur: initialData.tur || 1,
        kdvOrani: initialData.kdvOrani || 0,
        muhasebeKodu: initialData.muhasebeKodu || '',
        aciklama: initialData.aciklama || '',
        aktifMi: initialData.aktifMi ?? true
      });
    }
  }, [id, initialData]);

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(formData.kod !== (initialData?.kod || '') || formData.ad !== (initialData?.ad || ''));
    }
  }, [formData, initialData, onDirtyChange]);

  const fetchNextCode = async (tur: number) => {
    try {
      const res = await axios.get(`/api/GelirGiderKartlari/next-code?tur=${tur}`);
      if (res.data && res.data.code) {
        setFormData(prev => ({ ...prev, kod: res.data.code }));
        setIsCodeManuallyChanged(false);
      }
    } catch (err) {
      console.error('Next code fetch error:', err);
    }
  };

  useEffect(() => {
    if (!id && (!initialData || !initialData.id)) {
      fetchNextCode(formData.tur);
    }
  }, [id, initialData]);

  const handleTurChange = (yeniTur: number) => {
    setFormData({ ...formData, tur: yeniTur });
    if (!id && !initialData?.id && !isCodeManuallyChanged) {
      fetchNextCode(yeniTur);
    }
  };

  const handleGenerateNewCodeAndSave = async () => {
    setConflictDialog(false);
    setIsSaving(true);
    try {
      const res = await axios.get(`/api/GelirGiderKartlari/next-code?tur=${formData.tur}`);
      if (res.data && res.data.code) {
        const yeniKod = res.data.code;
        setFormData(prev => ({ ...prev, kod: yeniKod }));
        
        // Auto submit with new code
        const updatedData = { ...formData, kod: yeniKod };
        if (id || initialData?.id) {
          const editId = id || initialData.id;
          await axios.put(`/api/GelirGiderKartlari/${editId}`, updatedData);
        } else {
          await axios.post('/api/GelirGiderKartlari', updatedData);
        }
        toast.success(t('auto_kay_t_ba_ar_yla_93df', 'Kayıt başarıyla kaydedildi.'));
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('auto_kaydedilemedi_a4cf', 'Kaydedilemedi.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSaving(true);
    try {
      if (id || initialData?.id) {
        const editId = id || initialData.id;
        await axios.put(`/api/GelirGiderKartlari/${editId}`, formData);
      } else {
        await axios.post('/api/GelirGiderKartlari', formData);
      }
      toast.success(t('auto_kay_t_ba_ar_yla_93df', 'Kayıt başarıyla kaydedildi.'));
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || '';
      if (err.response?.status === 400 && msg.includes('zaten var')) {
        setConflictError(msg);
        setConflictDialog(true);
      } else {
        toast.error(msg || t('auto_kaydedilemedi_a4cf', 'Kaydedilemedi.'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <>
      <BaseCardPage
        id="gelirGiderKartiForm"
        asForm={asForm}
        onSubmit={handleSave}
        icon={formData.tur === 1 ? <ArrowDownRight size={28} /> : <ArrowUpRight size={28} />}
        title={formData.ad || (formData.tur === 1 ? t('auto_yeni_gelir_kart__28a9', 'Yeni Gelir Kartı') : t('auto_yeni_gider_kart__93ba', 'Yeni Gider Kartı'))}
        subtitleLeft={formData.kod || t('auto_kod_bekleniyor_488a', 'Kod Bekleniyor')}
        subtitleRight={formData.tur === 1 ? t('auto_gelir_kart__b477', 'Gelir Kartı') : t('auto_gider_kart__92bb', 'Gider Kartı')}
        isSaving={isSaving}
        onSave={handleSave}
        onClose={onCancel}
      >
        <div className="flex-col gap-20">
        
        <div className="form-grid">
          <div className="form-group">
            <label>{t('auto_kod_78c2', 'Kod')}</label>
            <input 
              type="text" required value={formData.kod}
              onChange={e => {
                setFormData({...formData, kod: e.target.value.toUpperCase()});
                setIsCodeManuallyChanged(true);
              }}
              maxLength={50}
              className="form-input uppercase"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>{t('auto_kart_turu_2d1e', 'Kart Türü')}</label>
            <div className="flex gap-12 h-40">
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-8 rounded-8 cursor-pointer font-600 text-14 border-glass ${formData.tur === 1 ? 'bg-success-light text-success' : 'bg-primary text-secondary'}`}
                onClick={() => handleTurChange(1)}
              >
                <ArrowDownRight size={18} /> {t('auto_gelir_9a12', 'Gelir')}
              </button>
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-8 rounded-8 cursor-pointer font-600 text-14 border-glass ${formData.tur === 2 ? 'bg-danger-light text-danger' : 'bg-primary text-secondary'}`}
                onClick={() => handleTurChange(2)}
              >
                <ArrowUpRight size={18} /> {t('auto_gider_12cf', 'Gider')}
              </button>
            </div>
          </div>
        </div>

        <div className="form-group mt-16">
          <label>{t('auto_ad_71cc', 'Ad')}</label>
          <input 
            type="text" required value={formData.ad}
            onChange={e => setFormData({...formData, ad: e.target.value})}
            placeholder="Örn: Banka Masrafı, Elektrik Faturası"
            className="form-input"
          />
        </div>

        <div className="form-grid mt-16">
          <div className="form-group">
            <label>{t('auto_kdv_oran_fccf', 'KDV Oranı (%)')}</label>
            <KdvSecici 
              kdvGruplari={kdvGruplari}
              value={kdvGruplari.find(k => getOran(k) === formData.kdvOrani)?.id ?? ''}
              onChange={(id) => {
                const group = kdvGruplari.find(k => k.id === id);
                setFormData({...formData, kdvOrani: getOran(group)});
              }}
            />
          </div>
          <div className="form-group">
            <label>{t('auto_muhasebe_kodu_184d', 'Muhasebe Kodu')}</label>
            <input 
              type="text" value={formData.muhasebeKodu}
              onChange={e => setFormData({...formData, muhasebeKodu: e.target.value})}
              placeholder="Örn: 770.01.01"
              maxLength={50}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="form-group mt-16">
          <label>{t('auto_aciklama_913e', 'Açıklama')}</label>
          <textarea 
            value={formData.aciklama}
            onChange={e => setFormData({...formData, aciklama: e.target.value})}
            rows={3}
            className="form-input"
          />
        </div>

        <div className="flex items-center gap-24 mt-24">
          <label className="flex items-center gap-10 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.aktifMi}
              onChange={e => setFormData({...formData, aktifMi: e.target.checked})}
            />
            <span className="text-14 font-500 text-primary">{t('auto_aktif_18de', 'Aktif')}</span>
          </label>
        </div>
        </div>
      </BaseCardPage>

      {conflictDialog && (
        <div className="overlay active flex items-center justify-center" style={{ zIndex: 1000 }}>
          <div className="surface-card p-24 w-full max-w-400 flex flex-col gap-16" style={{ background: 'var(--bg-primary)' }}>
            <h3 className="m-0 text-18 font-bold text-danger">{t('auto_kod_cakismasi_52ff', 'Kod Çakışması')}</h3>
            <p className="m-0 text-14 text-secondary leading-normal">
              {conflictError}
            </p>
            <p className="m-0 text-14 text-secondary leading-normal">
              {t('auto_yeni_kod_uretip_c299', 'Sizin için otomatik olarak yeni bir kod üretilip işlemin kaydedilmesini ister misiniz?')}
            </p>
            <div className="flex gap-12 mt-8 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setConflictDialog(false)}>
                {t('auto_hayir_iptal_92ff', 'Hayır, İptal')}
              </button>
              <button type="button" className="btn-primary" onClick={handleGenerateNewCodeAndSave}>
                {t('auto_evet_yeni_kod_42ee', 'Evet, Yeni Kod Üret')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GelirGiderKartiForm;
