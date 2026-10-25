/**
 * @file GelirGiderKartlariList.tsx
 * @description 
 * Gelir ve Gider kartları listesi ve yönetim sayfası.
 * BaseSystemPage altyapısını kullanarak gelir ve gider kartlarını filtreli ve modern bir ızgarada sunar.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowDownRight, ArrowUpRight, Edit2, Trash2, Plus, RefreshCcw } from 'lucide-react';
import { BaseSystemPage, ActionMenu, AlertDialog, BaseSystemCard } from '@akalin/ui';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export interface GelirGiderKartiDto {
  id: number | string;
  ad: string;
  kod: string;
  tur: number; // 1: Gelir, 2: Gider
  kdvOrani?: number;
  muhasebeKodu?: string;
  aciklama?: string;
  aktifMi?: boolean;
  [key: string]: any;
}

export interface GelirGiderKartlariListProps {
  showBackButton?: boolean;
  backRoute?: string;
  onBack?: () => void;
  headerSync?: boolean;
}

const GelirGiderKartlariList: React.FC<GelirGiderKartlariListProps> = ({
  showBackButton = true,
  backRoute = '/ayarlar/sistem-ayarlari',
  onBack,
  headerSync = true
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [items, setItems] = useState<GelirGiderKartiDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<number>(0); // 0: All, 1: Income, 2: Expense
  const [deleteTarget, setDeleteTarget] = useState<GelirGiderKartiDto | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/GelirGiderKartlari');
      setItems(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (err) {
      console.error('Gelir/Gider kartları yüklenemedi:', err);
      toast.error(t('gelir_gider_kartlari_yuklenemedi', 'Gelir/Gider kartları yüklenirken hata oluştu.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddNew = (e?: React.MouseEvent) => {
    const url = '/ayarlar/sistem-ayarlari/gelirgider/yeni';
    if (e && e.shiftKey) {
      window.open(url, '_blank');
    } else {
      navigate(url, { state: { returnUrl: '/ayarlar/sistem-ayarlari/GelirGiderKartlari' } });
    }
  };

  const handleEditItem = (item: GelirGiderKartiDto, e?: React.MouseEvent) => {
    const url = `/ayarlar/sistem-ayarlari/gelirgider/duzenle/${item.id}`;
    if (e && e.shiftKey) {
      window.open(url, '_blank');
    } else {
      navigate(url, { state: { returnUrl: '/ayarlar/sistem-ayarlari/GelirGiderKartlari' } });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`/api/GelirGiderKartlari/${deleteTarget.id}`);
      toast.success(t('gelir_gider_karti_silindi', 'Gelir/Gider kartı başarıyla silindi.'));
      setItems(prev => prev.filter(x => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Silme hatası:', err);
      toast.error(err?.response?.data?.message || t('gelir_gider_karti_silinemedi', 'Gelir/Gider kartı silinirken bir hata oluştu.'));
    }
  };

  const searchableFields = useMemo(() => [
    { id: 'Tumu', label: t('tumu', 'Tümü'), type: 'text', placeholder: t('ph_gelirgider_ara', 'Gelir/Gider kartlarında ara...') },
    { id: 'Ad', label: t('kart_adi', 'Kart Adı'), type: 'text' },
    { id: 'Kod', label: t('kart_kodu', 'Kart Kodu'), type: 'text' },
    { id: 'MuhasebeKodu', label: t('muhasebe_kodu', 'Muhasebe Kodu'), type: 'text' }
  ], [t]);

  return (
    <BaseSystemPage
      title={t('auto_gelir_gider_kartlar__b415', 'Gelir / Gider Kartları')}
      subtitle={t('auto_kasa_ve_banka_islemle_7f5c', 'Kasa ve Banka işlemlerinizde kullanacağınız gelir ve gider kalemlerini tanımlayın.')}
      icon={<FileText size={24} />}
      baseRoute="/ayarlar/sistem-ayarlari"
      backRoute={backRoute}
      showBackButton={showBackButton}
      onBack={onBack}
      headerSync={headerSync}
      searchPlaceholder={t('ph_gelirgider_ara', 'Gelir/Gider kartlarında ara...')}
      searchableFields={searchableFields}
      onAdd={handleAddNew}
      addButtonTitle={t('yeni_kart_ekle', 'Yeni Kart Ekle')}
    >
      {({ filterItems, searchTerm, isSearching }) => {
        let filteredData = filterItems(items, (item) => [
          item.ad,
          item.kod,
          item.muhasebeKodu,
          item.aciklama
        ]);

        if (filterType !== 0) {
          filteredData = filteredData.filter(item => item.tur === filterType);
        }

        return (
          <div className="relative fade-in flex-1 flex flex-col min-h-0">
            {/* Filter Tabs Header */}
            <div className="p-24 pb-0 flex items-center gap-12">
              <div className="flex gap-8 bg-secondary p-4 rounded-12 w-fit">
                <button
                  type="button"
                  onClick={() => setFilterType(0)}
                  className={`btn-tab-filter ${filterType === 0 ? 'active' : ''}`}
                >
                  {t('auto_tumu_ff12', 'Tümü')}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType(1)}
                  className={`btn-tab-filter text-success flex items-center gap-6 ${filterType === 1 ? 'active' : ''}`}
                >
                  <ArrowDownRight size={16} /> {t('auto_gelir_9a12', 'Gelirler')}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType(2)}
                  className={`btn-tab-filter text-danger flex items-center gap-6 ${filterType === 2 ? 'active' : ''}`}
                >
                  <ArrowUpRight size={16} /> {t('auto_gider_12cf', 'Giderler')}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="glass-card loading-state flex flex-col items-center justify-center p-40">
                <RefreshCcw size={32} className="spinning loading-icon mb-12 text-secondary" />
                <p className="text-secondary m-0">{t('auto_yukleniyor_4deb', 'Yükleniyor...')}</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="surface-card p-40 text-center flex flex-col items-center justify-center rounded-16 my-16 mx-24">
                <div className="icon-box-large mb-16 bg-surface-variant">
                  <FileText size={36} className="text-secondary" />
                </div>
                <h3 className="m-0 text-16 font-semibold text-primary mb-6">
                  {isSearching 
                    ? t('eslesen_kart_bulunamadi', 'Eşleşen Gelir/Gider Kartı Bulunamadı') 
                    : t('auto_henuz_hic_gelirgider_e50f', 'Bu filtreye uygun Gelir/Gider Kartı bulunamadı.')}
                </h3>
                <p className="text-13 text-secondary max-w-400 mb-16">
                  {isSearching 
                    ? t('auto_arama_kriterine_uygun_sonuc_yok', '"{{term}}" arama kriterine uygun kayıt bulunamadı.', { term: searchTerm })
                    : t('gelirgider_yok_aciklama', 'Masraf ve ek gelirlerinizi takip etmek için yeni bir gelir/gider kartı oluşturabilirsiniz.')}
                </p>
                {!isSearching && (
                  <button type="button" className="btn btn-primary" onClick={handleAddNew}>
                    <Plus size={16} /> {t('yeni_kart_ekle', 'Yeni Kart Ekle')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid-auto-320 gap-20 p-24 overflow-y-auto">
                {filteredData.map((kart) => (
                  <BaseSystemCard 
                    key={kart.id} 
                    icon={kart.tur === 1 ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}
                    iconBoxVariant={kart.tur === 1 ? 'success' : 'danger'}
                    borderHighlight={kart.tur === 1 ? 'border-l-success' : 'border-l-danger'}
                    title={kart.ad}
                    subtitle={kart.kod}
                    badge={
                      <span className={`badge ${kart.tur === 1 ? 'badge-success' : 'badge-danger'} text-11`}>
                        {kart.tur === 1 ? t('gelir', 'Gelir') : t('gider', 'Gider')}
                      </span>
                    }
                    actions={[
                      {
                        label: t('auto_duzenle', 'Düzenle'),
                        icon: <Edit2 size={15} />,
                        onClick: (e) => handleEditItem(kart, e)
                      },
                      {
                        label: t('auto_sil', 'Sil'),
                        icon: <Trash2 size={15} />,
                        danger: true,
                        onClick: () => setDeleteTarget(kart)
                      }
                    ]}
                    details={[
                      ...(kart.muhasebeKodu ? [{
                        label: t('muh_kodu', 'Muhasebe Kodu'),
                        value: kart.muhasebeKodu
                      }] : []),
                      {
                        label: t('kdv_orani', 'KDV Oranı'),
                        value: `%${kart.kdvOrani ?? 0}`
                      }
                    ]}
                    status={{
                      active: kart.aktifMi !== false
                    }}
                    onClick={(e) => handleEditItem(kart, e)}
                  />
                ))}
              </div>
            )}

            <AlertDialog
              isOpen={!!deleteTarget}
              onClose={() => setDeleteTarget(null)}
              type="confirm"
              title={t('gelirgider_sil_baslik', 'Gelir/Gider Kartı Silinecek')}
              message={t('gelirgider_sil_onay', '"{{ad}}" gelir/gider kartını silmek istediğinize emin misiniz?', { ad: deleteTarget?.ad || deleteTarget?.kod })}
              confirmText={t('auto_sil', 'Sil')}
              cancelText={t('auto_iptal', 'İptal')}
              onConfirm={handleDeleteConfirm}
            />
          </div>
        );
      }}
    </BaseSystemPage>
  );
};

export default GelirGiderKartlariList;
