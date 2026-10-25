/**
 * @file PosCihazlari.tsx
 * @description 
 * POS cihazları listesi ve yönetim sayfası.
 * BaseSystemPage altyapısını kullanarak Fiziksel ve Sanal POS cihazlarını kartlar halinde sunar.
 * "Aktif", "Arşiv" ve "Çöp Kutusu" (3 durumlu yaşam döngüsü) mimarisini ve UndoDeleteBar altyapısını destekler.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Edit2, Trash2, Plus, RefreshCcw, Layers, Archive, RotateCcw } from 'lucide-react';
import { BaseSystemPage, AlertDialog, BaseSystemCard, UndoDeleteBar } from '@akalin/ui';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export interface PosCihazDto {
  id: number | string;
  ad: string;
  tip?: number;
  bankaAdi?: string;
  hesapAdi?: string;
  paraBirimi?: string;
  aktifMi?: boolean;
  arsivlendiMi?: boolean;
  silindiMi?: boolean;
  [key: string]: any;
}

export interface PosCihazlariProps {
  showBackButton?: boolean;
  backRoute?: string;
  onBack?: () => void;
  headerSync?: boolean;
}

type ViewMode = 'active' | 'archive' | 'trash';

interface PendingDeletion {
  id: number | string;
  name: string;
  timerId: any;
}

const PosCihazlari: React.FC<PosCihazlariProps> = ({
  showBackButton = true,
  backRoute = '/ayarlar/sistem-ayarlari',
  onBack,
  headerSync = true
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [items, setItems] = useState<PosCihazDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteTarget, setDeleteTarget] = useState<PosCihazDto | null>(null);

  // Undoable Deletion State & Refs
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);
  const pendingDeletionRef = useRef<PendingDeletion | null>(null);
  pendingDeletionRef.current = pendingDeletion;
  const [hiddenRowIds, setHiddenRowIds] = useState<(string | number)[]>([]);

  const loadData = useCallback(async (mode: ViewMode = viewMode) => {
    setLoading(true);
    try {
      const durumParam = mode === 'active' ? 'aktif' : mode === 'archive' ? 'arsiv' : 'cop';
      const res = await axios.get(`/api/PosCihazlari?durum=${durumParam}`);
      setItems(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (err) {
      console.error('POS cihazları yüklenemedi:', err);
      toast.error(t('pos_cihazlari_yuklenemedi', 'POS cihazları yüklenirken hata oluştu.'));
    } finally {
      setLoading(false);
    }
  }, [viewMode, t]);

  useEffect(() => {
    loadData(viewMode);
  }, [viewMode, loadData]);

  // Bekleyen silme işlemini commit eden metot
  const commitPendingDeletion = useCallback(async (del = pendingDeletionRef.current) => {
    if (!del) return;
    if (del.timerId) clearTimeout(del.timerId);
    setPendingDeletion(null);

    try {
      await axios.delete(`/api/PosCihazlari/${del.id}`);
      toast.success(t('pos_cihaz_silindi', 'POS cihazı çöp kutusuna taşındı.'));
      setHiddenRowIds(prev => prev.filter(x => x !== del.id));
      loadData(viewMode);
    } catch (err: any) {
      console.error('Silme hatası:', err);
      setHiddenRowIds(prev => prev.filter(x => x !== del.id));
      toast.error(err?.response?.data?.mesaj || t('pos_cihaz_silinemedi', 'POS cihazı silinirken hata oluştu.'));
      loadData(viewMode);
    }
  }, [viewMode, loadData, t]);

  // Geri al (Undo) metodu
  const handleUndoDelete = useCallback(() => {
    if (!pendingDeletionRef.current) return;
    if (pendingDeletionRef.current.timerId) clearTimeout(pendingDeletionRef.current.timerId);
    const restoredId = pendingDeletionRef.current.id;
    setPendingDeletion(null);
    setHiddenRowIds(prev => prev.filter(x => x !== restoredId));
    toast.success(t('auto_silme_islemi_geri_alindi', 'Silme işlemi geri alındı.'));
  }, [t]);

  // Bildirim kapatıldığında anında commit et
  const handleDismissUndo = useCallback(() => {
    commitPendingDeletion();
  }, [commitPendingDeletion]);

  // Sayfadan ayrılırken veya unmount olduğunda bekleyen silmeyi garantiye al
  useEffect(() => {
    return () => {
      if (pendingDeletionRef.current) {
        commitPendingDeletion(pendingDeletionRef.current);
      }
    };
  }, [commitPendingDeletion]);

  // Sekme değişimi: bekleyen silme varsa hemen commit et
  const handleViewModeChange = (newMode: ViewMode) => {
    if (pendingDeletionRef.current) {
      commitPendingDeletion(pendingDeletionRef.current);
    }
    setViewMode(newMode);
  };

  const onAdd = (e?: React.MouseEvent) => {
    const url = `/ayarlar/sistem-ayarlari/PosCihazlari/yeni`;
    if (e && e.shiftKey) {
      window.open(url, '_blank');
    } else {
      navigate(url, { state: { returnUrl: '/ayarlar/sistem-ayarlari/PosCihazlari' } });
    }
  };

  const onEdit = (item: PosCihazDto, e?: React.MouseEvent) => {
    const url = `/ayarlar/sistem-ayarlari/PosCihazlari/duzenle/${item.id}`;
    if (e && e.shiftKey) {
      window.open(url, '_blank');
    } else {
      navigate(url, { state: { returnUrl: '/ayarlar/sistem-ayarlari/PosCihazlari' } });
    }
  };

  const handleArchive = async (item: PosCihazDto) => {
    try {
      await axios.put(`/api/PosCihazlari/${item.id}/arsivle`);
      toast.success(t('pos_cihaz_arsivlendi', 'POS cihazı başarıyla arşive alındı.'));
      loadData(viewMode);
    } catch (err: any) {
      console.error('Arşivleme hatası:', err);
      toast.error(err?.response?.data?.mesaj || t('auto_islem_sirasinda_hata', 'İşlem sırasında hata oluştu.'));
    }
  };

  const handleUnarchive = async (item: PosCihazDto) => {
    try {
      await axios.put(`/api/PosCihazlari/${item.id}/aktiflestir`);
      toast.success(t('pos_cihaz_aktiflestirildi', 'POS cihazı arşivden çıkarıldı ve aktifleştirildi.'));
      loadData(viewMode);
    } catch (err: any) {
      console.error('Aktifleştirme hatası:', err);
      toast.error(err?.response?.data?.mesaj || t('auto_islem_sirasinda_hata', 'İşlem sırasında hata oluştu.'));
    }
  };

  const handleRestore = async (item: PosCihazDto) => {
    try {
      await axios.put(`/api/PosCihazlari/${item.id}/restore`);
      toast.success(t('pos_cihaz_geri_yuklendi', 'POS cihazı başarıyla geri yüklendi.'));
      loadData(viewMode);
    } catch (err: any) {
      console.error('Geri yükleme hatası:', err);
      toast.error(err?.response?.data?.mesaj || t('auto_islem_sirasinda_hata', 'Geri yüklenirken hata oluştu.'));
    }
  };

  // Silme tetikleyici: Çöp kutusunda ise AlertDialog, aktif/arşivde ise UndoDeleteBar
  const handleDeleteClick = (item: PosCihazDto) => {
    if (viewMode === 'trash') {
      setDeleteTarget(item);
    } else {
      if (pendingDeletionRef.current) {
        commitPendingDeletion(pendingDeletionRef.current);
      }
      setHiddenRowIds(prev => [...prev, item.id]);

      const timerId = setTimeout(() => {
        commitPendingDeletion();
      }, 4000);

      setPendingDeletion({
        id: item.id,
        name: item.ad,
        timerId
      });
    }
  };

  // Sadece çöp kutusunda kalıcı silme onayı
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`/api/PosCihazlari/${deleteTarget.id}/kalici`);
      toast.success(t('pos_cihaz_kalici_silindi', 'POS cihazı kalıcı olarak silindi.'));
      setDeleteTarget(null);
      loadData(viewMode);
    } catch (err: any) {
      console.error('Kalıcı silme hatası:', err);
      toast.error(err?.response?.data?.mesaj || err?.response?.data?.message || t('pos_cihaz_silinemedi', 'POS cihazı silinirken bir hata oluştu.'));
    }
  };

  const getPosTypeName = (tip?: number) => {
    switch (tip) {
      case 1: return t('fiziksel_pos', 'Fiziksel POS');
      case 2: return t('sanal_pos', 'Sanal POS');
      case 4: return t('tedarikci_pos', 'Tedarikçi POS');
      case 5: return t('ortak_pos', 'Ortak POS');
      default: return t('diger', 'Diğer');
    }
  };

  const searchableFields = useMemo(() => [
    { id: 'Tumu', label: t('tumu', 'Tümü'), type: 'text', placeholder: t('ph_pos_cihazlarinda_ara', 'POS cihazlarında ara...') },
    { id: 'Ad', label: t('pos_adi', 'POS Adı'), type: 'text' },
    { id: 'Banka', label: t('banka_adi', 'Banka Adı'), type: 'text' }
  ], [t]);

  const segmentedControl = (
    <div className="view-mode-segmented-track" role="group" aria-label={t('auto_gorunum_modu', 'Görünüm Modu')}>
      <button
        type="button"
        className={`view-mode-segment-btn ${viewMode === 'active' ? 'active mode-active' : ''}`}
        onClick={() => handleViewModeChange('active')}
        title={t('auto_aktif_kayitlar', 'Aktif Kayıtlar')}
        aria-label={t('auto_aktif_kayitlar', 'Aktif Kayıtlar')}
        aria-pressed={viewMode === 'active'}
      >
        <Layers size={14} />
        <span className="segment-label">{t('auto_aktif_18de', 'Aktif')}</span>
      </button>
      <button
        type="button"
        className={`view-mode-segment-btn ${viewMode === 'archive' ? 'active mode-archive' : ''}`}
        onClick={() => handleViewModeChange('archive')}
        title={t('auto_arsivdekileri_goster', 'Arşivdekileri Göster')}
        aria-label={t('auto_arsivdekileri_goster', 'Arşivdekileri Göster')}
        aria-pressed={viewMode === 'archive'}
      >
        <Archive size={14} />
        <span className="segment-label">{t('auto_arsiv', 'Arşiv')}</span>
      </button>
      <button
        type="button"
        className={`view-mode-segment-btn ${viewMode === 'trash' ? 'active mode-trash' : ''}`}
        onClick={() => handleViewModeChange('trash')}
        title={t('auto_cop_kutusu', 'Çöp Kutusu')}
        aria-label={t('auto_cop_kutusu', 'Çöp Kutusu')}
        aria-pressed={viewMode === 'trash'}
      >
        <Trash2 size={14} />
        <span className="segment-label">{t('auto_cop_kutusu', 'Çöp Kutusu')}</span>
      </button>
    </div>
  );

  const getEmptyStateTitle = (isSearching: boolean) => {
    if (isSearching) return t('eslesen_pos_bulunamadi', 'Eşleşen POS Cihazı Bulunamadı');
    if (viewMode === 'trash') return t('auto_cop_kutusu_bos', 'Çöp kutusu boş.');
    if (viewMode === 'archive') return t('auto_arsiv_bos', 'Arşivde POS cihazı bulunamadı.');
    return t('auto_henuz_pos_cihazi_ekl_e1d9', 'Henüz POS cihazı eklenmemiş.');
  };

  const getEmptyStateDesc = (isSearching: boolean, searchTerm: string) => {
    if (isSearching) {
      return t('auto_arama_kriterine_uygun_sonuc_yok', '"{{term}}" arama kriterine uygun POS cihazı bulunamadı.', { term: searchTerm });
    }
    if (viewMode === 'trash') {
      return t('auto_cop_kutusu_bos_aciklama', 'Silinmiş herhangi bir POS cihazı bulunmuyor.');
    }
    if (viewMode === 'archive') {
      return t('auto_arsiv_bos_aciklama', 'Arşivlenmiş veya pasif duruma alınmış POS cihazı bulunmuyor.');
    }
    return t('pos_yok_aciklama', 'Tahsilat işlemlerinizi yönetebilmek için yeni bir fiziksel veya sanal POS ekleyebilirsiniz.');
  };

  return (
    <BaseSystemPage
      title={t('PosCihazlari_baslik', 'POS Cihazları')}
      subtitle={t('PosCihazlari_aciklama', 'Fiziksel ve sanal POS cihazları ile banka pos anlaşmalarınızı yönetin.')}
      icon={<CreditCard size={24} />}
      baseRoute="/ayarlar/sistem-ayarlari"
      backRoute={backRoute}
      showBackButton={showBackButton}
      onBack={onBack}
      headerSync={headerSync}
      searchPlaceholder={t('ph_pos_cihazlarinda_ara', 'POS cihazlarında ara...')}
      searchableFields={searchableFields}
      onAdd={viewMode !== 'trash' ? onAdd : undefined}
      hideAddButton={viewMode === 'trash'}
      addButtonTitle={t('yeni_pos_ekle', 'Yeni POS Ekle')}
      customHeaderActions={segmentedControl}
    >
      {({ filterItems, searchTerm, isSearching }) => {
        const filteredData = filterItems(items, (item) => [
          item.ad,
          item.bankaAdi,
          item.hesapAdi,
          getPosTypeName(item.tip)
        ]);

        const visibleData = filteredData.filter(item => !hiddenRowIds.includes(item.id));

        return (
          <div className="relative fade-in flex-1 flex flex-col min-h-0">
            {loading ? (
              <div className="glass-card loading-state flex flex-col items-center justify-center p-40">
                <RefreshCcw size={32} className="spinning loading-icon mb-12 text-secondary" />
                <p className="text-secondary m-0">{t('auto_yukleniyor_4deb', 'Yükleniyor...')}</p>
              </div>
            ) : visibleData.length === 0 ? (
              <div className="surface-card p-40 text-center flex flex-col items-center justify-center rounded-16 my-16">
                <div className="icon-box-large mb-16 bg-surface-variant">
                  {viewMode === 'trash' ? (
                    <Trash2 size={36} className="text-secondary" />
                  ) : viewMode === 'archive' ? (
                    <Archive size={36} className="text-secondary" />
                  ) : (
                    <CreditCard size={36} className="text-secondary" />
                  )}
                </div>
                <h3 className="m-0 text-16 font-semibold text-primary mb-6">
                  {getEmptyStateTitle(isSearching)}
                </h3>
                <p className="text-13 text-secondary max-w-400 mb-16">
                  {getEmptyStateDesc(isSearching, searchTerm)}
                </p>
                {!isSearching && viewMode === 'active' && (
                  <button type="button" className="btn btn-primary" onClick={onAdd}>
                    <Plus size={16} /> {t('yeni_pos_ekle', 'Yeni POS Ekle')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid-auto-320 gap-20 p-24 overflow-y-auto">
                {visibleData.map((item) => {
                  const cardActions = [];

                  if (viewMode === 'trash') {
                    cardActions.push({
                      label: t('auto_geri_yukle', 'Geri Yükle'),
                      icon: <RotateCcw size={15} />,
                      onClick: (e?: React.MouseEvent) => {
                        e?.stopPropagation();
                        handleRestore(item);
                      }
                    });
                    cardActions.push({
                      label: t('auto_kalici_sil', 'Kalıcı Sil'),
                      icon: <Trash2 size={15} />,
                      danger: true,
                      onClick: (e?: React.MouseEvent) => {
                        e?.stopPropagation();
                        handleDeleteClick(item);
                      }
                    });
                  } else if (viewMode === 'archive') {
                    cardActions.push({
                      label: t('auto_duzenle', 'Düzenle'),
                      icon: <Edit2 size={15} />,
                      onClick: (e?: React.MouseEvent) => {
                        e?.stopPropagation();
                        onEdit(item, e);
                      }
                    });
                    cardActions.push({
                      label: t('auto_arsivden_cikar', 'Arşivden Çıkar'),
                      icon: <RotateCcw size={15} />,
                      onClick: (e?: React.MouseEvent) => {
                        e?.stopPropagation();
                        handleUnarchive(item);
                      }
                    });
                    cardActions.push({
                      label: t('auto_sil', 'Sil'),
                      icon: <Trash2 size={15} />,
                      danger: true,
                      onClick: (e?: React.MouseEvent) => {
                        e?.stopPropagation();
                        handleDeleteClick(item);
                      }
                    });
                  } else {
                    // viewMode === 'active'
                    cardActions.push({
                      label: t('auto_duzenle', 'Düzenle'),
                      icon: <Edit2 size={15} />,
                      onClick: (e?: React.MouseEvent) => {
                        e?.stopPropagation();
                        onEdit(item, e);
                      }
                    });
                    cardActions.push({
                      label: t('auto_arsive_al', 'Arşive Al'),
                      icon: <Archive size={15} />,
                      onClick: (e?: React.MouseEvent) => {
                        e?.stopPropagation();
                        handleArchive(item);
                      }
                    });
                    cardActions.push({
                      label: t('auto_sil', 'Sil'),
                      icon: <Trash2 size={15} />,
                      danger: true,
                      onClick: (e?: React.MouseEvent) => {
                        e?.stopPropagation();
                        handleDeleteClick(item);
                      }
                    });
                  }

                  return (
                    <BaseSystemCard
                      key={item.id}
                      icon={<CreditCard size={24} />}
                      title={item.ad}
                      badge={
                        <div className="flex items-center gap-4">
                          <span className={`badge ${item.tip === 1 ? 'badge-primary' : 'badge-secondary'} text-11`}>
                            {getPosTypeName(item.tip)}
                          </span>
                          {viewMode === 'archive' && (
                            <span className="badge badge-warning text-11">
                              {t('auto_arsiv', 'Arşiv')}
                            </span>
                          )}
                          {viewMode === 'trash' && (
                            <span className="badge badge-danger text-11">
                              {t('auto_silindi', 'Silindi')}
                            </span>
                          )}
                        </div>
                      }
                      actions={cardActions}
                      details={[
                        {
                          label: t('banka', 'Banka'),
                          value: item.bankaAdi || '-'
                        },
                        {
                          label: t('auto_bagli_hesap_81f4', 'Bağlı Hesap'),
                          value: item.hesapAdi || '-'
                        },
                        {
                          label: t('auto_pos_turu_0e11', 'POS Türü'),
                          value: getPosTypeName(item.tip)
                        }
                      ]}
                      status={{
                        active: viewMode === 'active' ? item.aktifMi !== false : false
                      }}
                      onClick={viewMode !== 'trash' ? (e) => onEdit(item, e) : undefined}
                    />
                  );
                })}
              </div>
            )}

            <AlertDialog
              isOpen={!!deleteTarget}
              onClose={() => setDeleteTarget(null)}
              type="confirm"
              title={t('pos_cihaz_kalici_sil_baslik', 'POS Cihazı Kalıcı Olarak Silinecek')}
              message={t('pos_cihaz_kalici_sil_onay', '"{{ad}}" POS cihazını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', { ad: deleteTarget?.ad })}
              confirmText={t('auto_kalici_sil', 'Kalıcı Sil')}
              cancelText={t('auto_iptal', 'İptal')}
              onConfirm={handleDeleteConfirm}
            />

            {pendingDeletion && (
              <UndoDeleteBar
                itemName={pendingDeletion.name}
                duration={4000}
                onUndo={handleUndoDelete}
                onDismiss={handleDismissUndo}
              />
            )}
          </div>
        );
      }}
    </BaseSystemPage>
  );
};

export default PosCihazlari;
