import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ActionMenu, CurrencyIcon } from '@akalin/ui';
import { BaseDetailDialog } from '@akalin/ui';
import { getDovizKurlari, syncDovizKurlari, DovizKuruDto } from '../api/dovizKuruApi';
import GunlukKurDuzenleForm from './GunlukKurDuzenleForm';

const GunlukKurlarList = () => {
  const { t } = useTranslation();
  
  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getLocalDateString(new Date()));
  const [rates, setRates] = useState<DovizKuruDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editingRate, setEditingRate] = useState<DovizKuruDto | null>(null);

  const fetchRates = async (selectedDate: string) => {
    setLoading(true);
    try {
      const data = await getDovizKurlari(selectedDate);
      setRates(data);
    } catch (err) {
      console.error('Kurlar alınamadı', err);
      toast.error(t('GunlukKurlarList_fetchError') || 'Kurlar alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates(date);
  }, [date]);

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading(t('GunlukKurlarList_syncing') || 'Kurlar güncelleniyor...');
    try {
      const data = await syncDovizKurlari(date);
      setRates(data);
      toast.success(t('GunlukKurlarList_syncSuccess') || 'Kurlar başarıyla güncellendi.', { id: toastId });
    } catch (err: any) {
      console.error('Kur senkronizasyonu başarısız', err);
      toast.error(err.response?.data?.mesaj || t('GunlukKurlarList_syncError') || 'Kurlar güncellenemedi.', { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-20 p-24">
      {/* Üst Filtre / Aksiyon Barı */}
      <div className="flex justify-between items-center gap-16 flex-wrap">
        <div className="flex items-center gap-8">
          <Calendar size={18} className="text-secondary" />
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button
          type="button"
          disabled={syncing || loading}
          onClick={handleSync}
          className="btn btn-outline flex items-center gap-8"
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          {t('GunlukKurlarList_syncButton') || 'Çevrim İçi Kurları Getir / Güncelle'}
        </button>
      </div>

      {/* Kur Tablosu / Listesi */}
      {loading ? (
        <div className="p-20 text-center text-secondary text-14">
          {t('auto_yukleniyor_4deb') || 'Yükleniyor...'}
        </div>
      ) : rates.length === 0 ? (
        <div className="p-32 text-center bg-secondary rounded-16 border border-glass">
          <p className="m-0 text-secondary text-14 mb-16">
            {t('GunlukKurlarList_empty') || 'Seçilen tarihte kayıtlı kur bilgisi bulunamadı.'}
          </p>
          <button
            type="button"
            disabled={syncing}
            onClick={handleSync}
            className="btn btn-primary"
          >
            {t('GunlukKurlarList_syncNow') || 'Çevrim İçi Kurları Şimdi Çek'}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-16 border border-glass">
          <table className="w-full text-left border-collapse bg-primary">
            <thead>
              <tr className="border-b border-glass bg-secondary">
                <th className="p-12 font-semibold text-secondary text-13 w-80">{t('ParaBirimi') || 'Para Birimi'}</th>
                <th className="p-12 font-semibold text-secondary text-13 text-right">{t('DovizAlis') || 'Döviz Alış'}</th>
                <th className="p-12 font-semibold text-secondary text-13 text-right">{t('DovizSatis') || 'Döviz Satış'}</th>
                <th className="p-12 font-semibold text-secondary text-13 text-right">{t('EfektifAlis') || 'Efektif Alış'}</th>
                <th className="p-12 font-semibold text-secondary text-13 text-right">{t('EfektifSatis') || 'Efektif Satış'}</th>
                <th className="p-12 font-semibold text-secondary text-13 text-center w-60"></th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate.id} className="border-b border-glass table-row-hover">
                  <td className="p-12 text-14 font-bold text-primary">
                    <div className="flex items-center gap-8">
                      <CurrencyIcon code={rate.paraBirimiKod} symbol={rate.paraBirimiSembol} size={18} />
                      <span className="bg-accent-light text-accent-primary font-semibold text-12 p-4 rounded-8">
                        {rate.paraBirimiKod}
                      </span>
                    </div>
                  </td>
                  <td className="p-12 text-14 text-right text-primary font-mono">
                    {rate.dovizAlis ? rate.dovizAlis.toFixed(4) : '-'}
                  </td>
                  <td className="p-12 text-14 text-right text-primary font-mono">
                    {rate.dovizSatis ? rate.dovizSatis.toFixed(4) : '-'}
                  </td>
                  <td className="p-12 text-14 text-right text-primary font-mono">
                    {rate.efektifAlis ? rate.efektifAlis.toFixed(4) : '-'}
                  </td>
                  <td className="p-12 text-14 text-right text-primary font-mono">
                    {rate.efektifSatis ? rate.efektifSatis.toFixed(4) : '-'}
                  </td>
                  <td className="p-12 text-center">
                    <ActionMenu
                      actions={[
                        {
                          label: t('Düzenle') || 'Düzenle',
                          icon: <Edit2 size={16} />,
                          onClick: () => setEditingRate(rate)
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Düzenleme Modalı */}
      {editingRate && (
        <BaseDetailDialog
          isOpen={true}
          onClose={() => setEditingRate(null)}
          title={t('GunlukKurlarList_editModalTitle') || 'Kur Bilgisini Düzenle'}
          hideFooter={true}
          size="sm"
        >
          <GunlukKurDuzenleForm
            rate={editingRate}
            onSuccess={() => {
              setEditingRate(null);
              fetchRates(date);
            }}
            onCancel={() => setEditingRate(null)}
          />
        </BaseDetailDialog>
      )}
    </div>
  );
};

export default GunlukKurlarList;
