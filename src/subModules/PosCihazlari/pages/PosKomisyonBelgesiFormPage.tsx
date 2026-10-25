/**
 * @file PosKomisyonBelgesiFormPage.tsx
 * @description 
 * POS Komisyon Belgesi tanımlama ve düzenleme sayfası.
 * BaseDocumentPage mimarisinden türetilmiş olup Header (Geçerlilik ve Durum) - Detail (Taksit & Komisyon Tablosu) - Footer (Özet Panel)
 * yapısını standart belge mimarisine uygun şekilde sunar.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Percent, Calendar, AlignLeft, Plus, Power } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  BaseDocumentPage, 
  DocumentHeaderPanel, 
  DocumentHeaderField, 
  DocumentResultPanel, 
  DocumentResultPanelsGroup,
  BasitInput, 
  YuzdelikInput, 
  AlertDialog,
  DateRangeInput,
  BaseSwitch,
  ActionMenuItem
} from '@akalin/ui';

export interface PosKomisyonSatir {
  id?: number;
  taksitSayisi: number;
  aciklama: string;
  bankaKesintiOrani: number;
  musteriVadeFarkiOrani: number;
  vadeGunu: number;
}

export interface PosKomisyonFormData {
  id?: number;
  posCihazId: number;
  baslangicTarihi: string;
  bitisTarihi?: string | null;
  aktifMi: boolean;
  geriDonusTuru: number;
  aciklama?: string;
  satirlar: PosKomisyonSatir[];
}

const PosKomisyonBelgesiFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { posCihazId, id } = useParams<{ posCihazId: string; id?: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isEditing = !!(id && id !== 'yeni');
  const returnTo = location.state?.returnTo || `/ayarlar/sistem-ayarlari/PosCihazlari/duzenle/${posCihazId}`;

  const [posCihazAdi, setPosCihazAdi] = useState<string>('');
  const [geriDonusTuru, setGeriDonusTuru] = useState<number>(
    Number(searchParams.get('geriDonusTuru') || '1')
  );

  const [formData, setFormData] = useState<PosKomisyonFormData>({
    posCihazId: Number(posCihazId),
    baslangicTarihi: '',
    bitisTarihi: '',
    aktifMi: true,
    geriDonusTuru: Number(searchParams.get('geriDonusTuru') || '1'),
    aciklama: '',
    satirlar: [
      { taksitSayisi: 1, aciklama: 'Tek Çekim', bankaKesintiOrani: 0, musteriVadeFarkiOrani: 0, vadeGunu: 1 }
    ]
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeHeaderTab, setActiveHeaderTab] = useState<string>('genel');
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

  // POS Cihazı bilgilerini yükle (cihaz adı ve geri dönüş türü)
  useEffect(() => {
    if (posCihazId) {
      axios.get(`/api/PosCihazlari/${posCihazId}`)
        .then(res => {
          if (res.data) {
            setPosCihazAdi(res.data.ad || '');
            if (res.data.geriDonusTuru) {
              setGeriDonusTuru(Number(res.data.geriDonusTuru));
              setFormData(prev => ({ ...prev, geriDonusTuru: Number(res.data.geriDonusTuru) }));
            }
          }
        })
        .catch(err => {
          console.error('POS cihazı yüklenemedi:', err);
        });
    }
  }, [posCihazId]);

  // Belge verisini yükle veya yeni kayıt için akıllı tarih aralığı hesapla
  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      axios.get(`/api/poskomisyonbelgeleri/${id}`)
        .then(res => {
          const data = res.data;
          setFormData({
            ...data,
            baslangicTarihi: data.baslangicTarihi ? data.baslangicTarihi.split('T')[0] : '',
            bitisTarihi: data.bitisTarihi ? data.bitisTarihi.split('T')[0] : '',
            satirlar: Array.isArray(data.satirlar) && data.satirlar.length > 0 
              ? data.satirlar 
              : [{ taksitSayisi: 1, aciklama: 'Tek Çekim', bankaKesintiOrani: 0, musteriVadeFarkiOrani: 0, vadeGunu: 1 }]
          });
          if (data.geriDonusTuru) {
            setGeriDonusTuru(Number(data.geriDonusTuru));
          }
        })
        .catch(err => {
          console.error(err);
          toast.error(t('komisyon_belgesi_yuklenemedi', 'Komisyon belgesi yüklenemedi.'));
          navigate(returnTo);
        })
        .finally(() => setLoading(false));
    } else {
      // Yeni kayıtta mevcut komisyon belgelerine göre çakışmayan ay aralığı belirle
      const fetchAndSetDates = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`/api/poskomisyonbelgeleri/byposcihaz/${posCihazId}`);
          const existingRecords = response.data || [];

          let currentDate = new Date();
          let startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          let endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

          let found = false;
          while (!found) {
            const hasRecord = existingRecords.some((record: any) => {
              if (!record.baslangicTarihi) return false;
              const rStart = new Date(record.baslangicTarihi);
              const rEnd = record.bitisTarihi ? new Date(record.bitisTarihi) : new Date(8640000000000000);
              return rStart <= endOfMonth && rEnd >= startOfMonth;
            });

            if (hasRecord) {
              startOfMonth.setMonth(startOfMonth.getMonth() + 1);
              startOfMonth.setDate(1);
              endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
            } else {
              found = true;
            }
          }

          const formatString = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          setFormData(prev => ({
            ...prev,
            baslangicTarihi: formatString(startOfMonth),
            bitisTarihi: formatString(endOfMonth)
          }));
        } catch (error) {
          console.error('Tarih hesaplanırken hata oluştu:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchAndSetDates();
    }
  }, [id, isEditing, posCihazId, returnTo, t, navigate]);

  const handleChange = (field: keyof PosKomisyonFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRowFieldChange = (idx: number, field: keyof PosKomisyonSatir, value: any) => {
    setFormData(prev => {
      const newRows = [...prev.satirlar];
      const currentRow = { ...newRows[idx], [field]: value };

      // Taksit sayısı değiştiğinde otomatik açıklama güncelle (kullanıcı özel girmemişse)
      if (field === 'taksitSayisi') {
        const n = Number(value);
        const autoAciklama = (taksit: number) =>
          taksit === 1 ? t('tek_cekim', 'Tek Çekim') : `${taksit} ${t('taksit', 'Taksit')}`;
        const prevAciklama = newRows[idx].aciklama || '';
        const prevN = newRows[idx].taksitSayisi;
        const wasAuto = prevAciklama === '' || prevAciklama === autoAciklama(prevN);
        if (wasAuto && n > 0) {
          currentRow.aciklama = autoAciklama(n);
        }
      }

      newRows[idx] = currentRow;
      return { ...prev, satirlar: newRows };
    });
    setIsDirty(true);
  };

  const handleAddRow = () => {
    setFormData(prev => {
      const nextTaksit = prev.satirlar.length + 1;
      const newRow: PosKomisyonSatir = {
        taksitSayisi: nextTaksit,
        aciklama: nextTaksit === 1 ? t('tek_cekim', 'Tek Çekim') : `${nextTaksit} ${t('taksit', 'Taksit')}`,
        bankaKesintiOrani: 0,
        musteriVadeFarkiOrani: 0,
        vadeGunu: geriDonusTuru === 2 ? 30 : 1
      };
      return { ...prev, satirlar: [...prev.satirlar, newRow] };
    });
    setIsDirty(true);
  };

  const handleRemoveRow = (idx: number) => {
    setFormData(prev => {
      const newRows = [...prev.satirlar];
      newRows.splice(idx, 1);
      return { ...prev, satirlar: newRows };
    });
    setIsDirty(true);
  };

  const handleGridChange = (newData: any[]) => {
    setFormData(prev => ({ ...prev, satirlar: newData }));
    setIsDirty(true);
  };

  // Validasyon
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.baslangicTarihi) {
      errs.baslangicTarihi = t('validation.required_field', 'Başlangıç tarihi zorunludur.');
    }
    const gecerliSatirlar = formData.satirlar.filter(s => Number(s.taksitSayisi) > 0);
    if (gecerliSatirlar.length === 0) {
      errs.satirlar = t('en_az_bir_taksit_orani_giriniz', 'En az 1 adet geçerli taksit ve komisyon satırı girilmelidir.');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error(t('form_hatalarini_duzeltin', 'Lütfen formdaki eksik alanları doldurunuz.'));
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        baslangicTarihi: new Date(formData.baslangicTarihi).toISOString(),
        bitisTarihi: formData.bitisTarihi ? new Date(formData.bitisTarihi).toISOString() : null,
        satirlar: formData.satirlar.filter(s => Number(s.taksitSayisi) > 0)
      };

      if (isEditing) {
        await axios.put(`/api/poskomisyonbelgeleri/${id}`, payload);
        toast.success(t('komisyon_belgesi_guncellendi', 'Komisyon belgesi başarıyla güncellendi.'));
      } else {
        await axios.post('/api/poskomisyonbelgeleri', payload);
        toast.success(t('komisyon_belgesi_olusturuldu', 'Komisyon belgesi başarıyla oluşturuldu.'));
      }

      setIsDirty(false);
      navigate(returnTo);
    } catch (err: any) {
      console.error('Kaydetme hatası:', err);
      toast.error(err?.response?.data?.message || t('pos_cihaz_kayit_hata', 'Belge kaydedilirken hata oluştu.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      setAlertDialog({
        isOpen: true,
        type: 'confirm',
        title: t('kaydedilmemis_degisiklikler', 'Kaydedilmemiş Değişiklikler'),
        message: t('auto_degisiklikler_kaydedilmedi_onay', 'Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinize emin misiniz?'),
        onConfirm: () => navigate(returnTo)
      });
    } else {
      navigate(returnTo);
    }
  };

  // Izgara Sütunları
  const gridColumns = useMemo(() => [
    {
      id: 'taksitSayisi',
      header: t('taksit', 'Taksit'),
      width: '90px',
      render: (row: any, idx: number) => (
        <input
          type="number"
          className="grid-input text-center font-medium"
          value={row.taksitSayisi || ''}
          onChange={e => handleRowFieldChange(idx, 'taksitSayisi', Number(e.target.value))}
          min={1}
        />
      )
    },
    {
      id: 'aciklama',
      header: t('aciklama', 'Açıklama'),
      width: '220px',
      render: (row: any, idx: number) => {
        const autoLabel = row.taksitSayisi === 1
          ? t('tek_cekim', 'Tek Çekim')
          : row.taksitSayisi > 1
            ? `${row.taksitSayisi} ${t('taksit', 'Taksit')}`
            : '';
        const isAuto = !row.aciklama || row.aciklama === autoLabel;
        return (
          <input
            type="text"
            className="grid-input"
            value={isAuto ? autoLabel : row.aciklama}
            placeholder={autoLabel}
            onChange={e => handleRowFieldChange(idx, 'aciklama', e.target.value)}
          />
        );
      }
    },
    {
      id: 'bankaKesintiOrani',
      header: t('banka_kesinti_orani', 'Banka Kesinti (%)'),
      width: '150px',
      render: (row: any, idx: number) => (
        <YuzdelikInput
          className="grid-input text-right font-semibold"
          value={row.bankaKesintiOrani}
          onChange={(e: any) => handleRowFieldChange(idx, 'bankaKesintiOrani', Number(e.target.value))}
          decimalPlaces={2}
        />
      )
    },
    {
      id: 'musteriVadeFarkiOrani',
      header: t('musteri_vade_farki', 'Müşteri Vade Farkı (%)'),
      width: '160px',
      render: (row: any, idx: number) => (
        <YuzdelikInput
          className="grid-input text-right"
          value={row.musteriVadeFarkiOrani}
          onChange={(e: any) => handleRowFieldChange(idx, 'musteriVadeFarkiOrani', Number(e.target.value))}
          decimalPlaces={2}
        />
      )
    },
    ...(geriDonusTuru === 2 ? [{
      id: 'vadeGunu',
      header: t('vade_bloke_gunu', 'Vade/Bloke Günü'),
      width: '130px',
      render: (row: any, idx: number) => (
        <input
          type="number"
          className="grid-input text-right"
          value={row.vadeGunu ?? 30}
          onChange={(e: any) => handleRowFieldChange(idx, 'vadeGunu', Number(e.target.value))}
        />
      )
    }] : [])
  ], [geriDonusTuru, t]);

  // Özet İstatistikler (Footer için)
  const gecerliSatirlar = useMemo(() => 
    formData.satirlar.filter(s => Number(s.taksitSayisi) > 0),
    [formData.satirlar]
  );

  const tekCekimSatiri = gecerliSatirlar.find(s => Number(s.taksitSayisi) === 1);
  const tekCekimOrani = tekCekimSatiri ? Number(tekCekimSatiri.bankaKesintiOrani || 0) : 0;
  const ortalamaKesinti = gecerliSatirlar.length > 0 
    ? (gecerliSatirlar.reduce((acc, curr) => acc + (Number(curr.bankaKesintiOrani) || 0), 0) / gecerliSatirlar.length)
    : 0;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-40">
        <Percent size={36} className="spinning text-primary mb-12" />
        <p className="text-secondary m-0">{t('auto_yukleniyor_4deb', 'Yükleniyor...')}</p>
      </div>
    );
  }

  const pageTitle = isEditing
    ? (posCihazAdi ? `${posCihazAdi} - ${t('komisyon_belgesi_duzenle', 'Komisyon Belgesi Düzenle')}` : t('komisyon_belgesi_duzenle', 'Komisyon Belgesi Düzenle'))
    : (posCihazAdi ? `${posCihazAdi} - ${t('yeni_pos_komisyon_belgesi', 'Yeni POS Komisyon Belgesi')}` : t('yeni_pos_komisyon_belgesi', 'Yeni POS Komisyon Belgesi'));

  return (
    <>
      <BaseDocumentPage
        formId="posKomisyonBelgesiForm"
        pageTitle={pageTitle}
        onBack={handleBack}
        onSubmit={(e) => { e?.preventDefault(); handleSubmit(); }}
        onSave={handleSubmit}
        isSaving={isSaving}
        isDirty={isDirty}
        onDirtyChange={setIsDirty}
        documentType="PosKomisyonBelgesi"
        documentId={isEditing ? Number(id) : undefined}
        formData={formData}
        errors={errors}
        tabs={[
          { id: 'genel', title: t('temel_bilgiler', 'Temel Bilgiler'), icon: <Calendar size={16} /> },
          { id: 'notlar', title: t('notlar', 'Açıklama / Not'), icon: <AlignLeft size={16} /> }
        ]}
        activeTabId={activeHeaderTab}
        onTabChange={(tabId) => setActiveHeaderTab(String(tabId))}
        extraDropdownActions={[
          {
            custom: (
              <BaseSwitch
                id="actionMenuPosKomisyonBelgesiAktifSwitch"
                checked={formData.aktifMi ?? true}
                onChange={(e) => handleChange('aktifMi', e.target.checked)}
                label={
                  <span className="flex items-center gap-8">
                    <Power size={15} className={formData.aktifMi ? "text-success" : "text-secondary"} />
                    <span className="font-medium">{t('durum', 'Durum')}:</span>
                    <span className={formData.aktifMi ? "text-success font-semibold" : "text-secondary font-semibold"}>
                      {formData.aktifMi ? t('aktif', 'Aktif') : t('pasif', 'Pasif')}
                    </span>
                  </span>
                }
                className="action-menu-switch-item"
              />
            ),
            dividerAbove: false
          },
          {
            label: t('yeni_taksit_satiri_ekle', 'Yeni Taksit Satırı Ekle'),
            icon: <Plus size={16} />,
            dividerAbove: true,
            onClick: handleAddRow
          }
        ]}
        headerContent={
          <div className="flex flex-col gap-16">
            {activeHeaderTab === 'genel' && (
              <DocumentHeaderPanel columns={1}>
                <DocumentHeaderField 
                  name="baslangicTarihi" 
                  label={t('gecerlilik_tarihleri', 'Geçerlilik Tarihleri (Başlangıç - Bitiş)')} 
                  required
                >
                  <DateRangeInput
                    baslangicTarihi={formData.baslangicTarihi}
                    bitisTarihi={formData.bitisTarihi}
                    onChange={(start, end) => {
                      setFormData(prev => ({
                        ...prev,
                        baslangicTarihi: start,
                        bitisTarihi: end
                      }));
                      setIsDirty(true);
                      if (errors.baslangicTarihi) {
                        setErrors(prev => ({ ...prev, baslangicTarihi: '' }));
                      }
                    }}
                    autoFocus
                  />
                </DocumentHeaderField>
              </DocumentHeaderPanel>
            )}

            {activeHeaderTab === 'notlar' && (
              <DocumentHeaderPanel columns={1}>
                <DocumentHeaderField 
                  name="aciklama" 
                  label={t('auto_aciklama_1bab', 'Açıklama')} 
                  fullWidth
                >
                  <BasitInput
                    type="text"
                    placeholder={t('komisyon_belgesi_aciklama_ph', 'Belgeye ait özel şartlar veya anlaşma notları...')}
                    value={formData.aciklama || ''}
                    onChange={(e: any) => handleChange('aciklama', e.target.value)}
                  />
                </DocumentHeaderField>
              </DocumentHeaderPanel>
            )}
          </div>
        }
        gridProps={{
          columns: gridColumns,
          data: formData.satirlar,
          onAddRow: handleAddRow,
          onRemoveRow: (idx: number) => handleRemoveRow(idx),
          onChange: handleGridChange,
          isEmptyRow: (row: any) => !row.taksitSayisi,
          maxOneEmptyRow: false
        }}
        footerContent={
          <DocumentResultPanelsGroup align="end">
            <DocumentResultPanel
              title={t('belge_ozeti', 'Belge Özeti')}
              readOnly={true}
              hideAddButton={true}
              onSave={() => {}}
              items={[
                {
                  id: 'toplamTaksit',
                  label: t('tanimli_taksit_sayisi', 'Tanımlı Taksit Sayısı'),
                  value: `${gecerliSatirlar.length} ${t('secenek', 'Seçenek')}`,
                  visibilityRule: 'always'
                },
                {
                  id: 'tekCekimOrani',
                  label: t('tek_cekim_komisyonu', 'Tek Çekim Kesintisi'),
                  value: `% ${tekCekimOrani.toFixed(2)}`,
                  visibilityRule: 'always'
                },
                {
                  id: 'ortalamaKesinti',
                  label: t('ortalama_kesinti_orani', 'Ortalama Kesinti'),
                  value: `% ${ortalamaKesinti.toFixed(2)}`,
                  visibilityRule: 'always',
                  isPrimary: true
                }
              ]}
            />
          </DocumentResultPanelsGroup>
        }
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
    </>
  );
};

export default PosKomisyonBelgesiFormPage;
