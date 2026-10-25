/**
 * @file KasaListesiPage.tsx
 * @description 
 * Nakit kasa hesapları listesi ve yönetim sayfası.
 * BaseSystemPage altyapısını kullanarak kasa kartlarını ve bakiyelerini sunar.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  BaseSystemPage, 
  KasaCard, 
  AlertDialog 
} from '@akalin/ui';
import { Vault, Plus, RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface KasaDto {
  id: number | string;
  ad: string;
  kod: string;
  paraBirimiKod?: string;
  paraBirimiSembol?: string;
  bakiye?: number;
  aktifMi?: boolean;
  subeAd?: string;
  aciklama?: string;
  [key: string]: any;
}

export interface KasaListesiPageProps {
  showBackButton?: boolean;
  backRoute?: string;
  onBack?: () => void;
  headerSync?: boolean;
}

const KasaListesiPage: React.FC<KasaListesiPageProps> = ({
  showBackButton = true,
  backRoute = '/ayarlar/sistem-ayarlari',
  onBack,
  headerSync = true
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [items, setItems] = useState<KasaDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteTarget, setDeleteTarget] = useState<KasaDto | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/Kasalar');
      setItems(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (err) {
      console.error('Kasa hesapları yüklenemedi:', err);
      toast.error(t('kasa_hesaplari_yuklenemedi', 'Kasa hesapları yüklenirken hata oluştu.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onAdd = (e?: React.MouseEvent) => {
    const url = `/finans/kasalar/yeni`;
    if (e && e.shiftKey) {
      window.open(url, '_blank');
    } else {
      navigate(url, { state: { returnUrl: '/ayarlar/sistem-ayarlari/KasaHesaplari' } });
    }
  };

  const onEdit = (item: KasaDto, e?: React.MouseEvent) => {
    const url = `/finans/kasalar/duzenle/${item.id}`;
    if (e && e.shiftKey) {
      window.open(url, '_blank');
    } else {
      navigate(url, { state: { returnUrl: '/ayarlar/sistem-ayarlari/KasaHesaplari' } });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`/api/Kasalar/${deleteTarget.id}`);
      toast.success(t('kasa_silindi', 'Kasa hesabı başarıyla silindi.'));
      setItems(prev => prev.filter(x => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Silme hatası:', err);
      toast.error(err?.response?.data?.message || t('kasa_silinemedi', 'Kasa hesabı silinirken bir hata oluştu.'));
    }
  };

  const searchableFields = useMemo(() => [
    { id: 'Tumu', label: t('tumu', 'Tümü'), type: 'text', placeholder: t('ph_kasa_hesaplarinda_ara', 'Kasa hesaplarında ara...') },
    { id: 'Ad', label: t('kasa_adi', 'Kasa Adı'), type: 'text' },
    { id: 'Kod', label: t('kasa_kodu', 'Kasa Kodu'), type: 'text' }
  ], [t]);

  return (
    <BaseSystemPage
      title={t('KasaHesaplari_baslik', 'Kasa Hesapları')}
      subtitle={t('KasaHesaplari_aciklama', 'Nakit kasa hesapları, devir bakiyeleri ve kasa hareket yönetimi')}
      icon={<Vault size={24} />}
      baseRoute="/ayarlar/sistem-ayarlari"
      backRoute={backRoute}
      showBackButton={showBackButton}
      onBack={onBack}
      headerSync={headerSync}
      searchPlaceholder={t('ph_kasa_hesaplarinda_ara', 'Kasa hesaplarında ara...')}
      searchableFields={searchableFields}
      onAdd={onAdd}
      addButtonTitle={t('yeni_kasa_ekle', 'Yeni Kasa Ekle')}
    >
      {({ filterItems, searchTerm, isSearching }) => {
        const filteredData = filterItems(items, (item) => [
          item.ad,
          item.kod,
          item.paraBirimiKod,
          item.aciklama
        ]);

        return (
          <div className="relative fade-in flex-1 flex flex-col min-h-0">
            {loading ? (
              <div className="glass-card loading-state flex flex-col items-center justify-center p-40">
                <RefreshCcw size={32} className="spinning loading-icon mb-12 text-secondary" />
                <p className="text-secondary m-0">{t('auto_yukleniyor_4deb', 'Yükleniyor...')}</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="surface-card p-40 text-center flex flex-col items-center justify-center rounded-16 my-16">
                <div className="icon-box-large mb-16 bg-surface-variant">
                  <Vault size={36} className="text-secondary" />
                </div>
                <h3 className="m-0 text-16 font-semibold text-primary mb-6">
                  {isSearching 
                    ? t('eslesen_kasa_bulunamadi', 'Eşleşen Kasa Hesabı Bulunamadı') 
                    : t('kasa_bulunamadi', 'Kayıtlı kasa hesabı bulunamadı.')}
                </h3>
                <p className="text-13 text-secondary max-w-400 mb-16">
                  {isSearching 
                    ? t('auto_arama_kriterine_uygun_sonuc_yok', '"{{term}}" arama kriterine uygun kasa hesabı bulunamadı.', { term: searchTerm })
                    : t('kasa_yok_aciklama', 'Nakit giriş ve çıkışlarınızı yönetmek için yeni bir kasa hesabı ekleyebilirsiniz.')}
                </p>
                {!isSearching && (
                  <button type="button" className="btn btn-primary" onClick={onAdd}>
                    <Plus size={16} /> {t('yeni_kasa_ekle', 'Yeni Kasa Ekle')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid-auto-320 gap-20 p-24 overflow-y-auto">
                {filteredData.map((kasa) => (
                  <KasaCard 
                    key={kasa.id} 
                    kasa={{
                      ...kasa,
                      aktifMi: kasa.aktifMi !== false,
                      paraBirimiKod: kasa.paraBirimiKod || 'TRY'
                    }}
                    onEdit={(item: any, e: any) => onEdit(item, e)}
                    onDelete={(item: any) => setDeleteTarget(item)}
                    onViewTransactions={(item: any) => navigate(`/finans/kasalar/${item.id}/hareketler`)}
                  />
                ))}
              </div>
            )}

            <AlertDialog
              isOpen={!!deleteTarget}
              onClose={() => setDeleteTarget(null)}
              type="confirm"
              title={t('kasa_sil_baslik', 'Kasa Hesabı Silinecek')}
              message={t('kasa_sil_onay', '"{{ad}}" kasa hesabını silmek istediğinize emin misiniz?', { ad: deleteTarget?.ad })}
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

export default KasaListesiPage;
