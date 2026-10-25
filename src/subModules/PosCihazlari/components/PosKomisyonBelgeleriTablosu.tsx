/**
 * @file PosKomisyonBelgeleriTablosu.tsx
 * @description
 * POS Cihazına ait Komisyon Belgeleri ve Oranları listeleme bileşeni.
 * BaseListPage sayfa düzeni standartlarında DataTable, ActionMenu, 3 durumlu yaşam döngüsü
 * (Aktif, Arşiv, Çöp Kutusu), UndoDeleteBar ve sağ alt tarafta dairesel yüzen ekleme butonu (EkleFloatCircleButton) sunar.
 */

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Edit2, Trash2, Layers, Archive, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  DataTable, 
  Column, 
  ActionMenu, 
  EkleFloatCircleButton, 
  UndoDeleteBar, 
  AlertDialog 
} from '@akalin/ui';

export interface PosKomisyonBelgeleriTablosuProps {
  posCihazId: number;
  geriDonusTuru?: number;
}

type ViewMode = 'active' | 'archive' | 'trash';

interface PendingDeletion {
  id: number;
  name: string;
  timerId: any;
}

const PosKomisyonBelgeleriTablosu: React.FC<PosKomisyonBelgeleriTablosuProps> = ({ 
  posCihazId, 
  geriDonusTuru = 1 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Undoable Deletion State
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);
  const pendingDeletionRef = useRef<PendingDeletion | null>(null);
  pendingDeletionRef.current = pendingDeletion;
  const [hiddenRowIds, setHiddenRowIds] = useState<(string | number)[]>([]);

  // AlertDialog State
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

  const baseRoute = `/ayarlar/sistem-ayarlari/PosCihazlari/${posCihazId}/komisyon-belgeleri`;

  const loadData = useCallback(async (mode: ViewMode = viewMode) => {
    setLoading(true);
    try {
      const durumParam = mode === 'active' ? 'aktif' : mode === 'archive' ? 'arsiv' : 'cop';
      const res = await axios.get(`/api/poskomisyonbelgeleri/byposcihaz/${posCihazId}?durum=${durumParam}`);
      setData(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (error) {
      console.error('Komisyon belgeleri yüklenirken hata:', error);
      toast.error(t('komisyon_belgeleri_yuklenemedi', 'Komisyon belgeleri yüklenirken hata oluştu.'));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [posCihazId, viewMode, t]);

  useEffect(() => {
    if (posCihazId) {
      loadData(viewMode);
    }
  }, [posCihazId, viewMode, loadData, refreshKey]);

  // Bekleyen silme işlemini veritabanına uygulayan commit metodu
  const commitPendingDeletion = useCallback(async (del = pendingDeletionRef.current) => {
    if (!del) return;
    if (del.timerId) clearTimeout(del.timerId);
    setPendingDeletion(null);

    try {
      await axios.delete(`/api/poskomisyonbelgeleri/${del.id}`);
      toast.success(t('pos_komisyon_silindi', 'Komisyon belgesi çöp kutusuna taşındı.'));
      setHiddenRowIds(prev => prev.filter(x => x !== del.id));
      loadData(viewMode);
    } catch (err: any) {
      console.error('Silme hatası:', err);
      setHiddenRowIds(prev => prev.filter(x => x !== del.id));
      toast.error(err?.response?.data?.mesaj || err?.response?.data?.message || t('pos_komisyon_silinemedi', 'Komisyon belgesi silinirken hata oluştu.'));
      loadData(viewMode);
    }
  }, [viewMode, loadData, t]);

  // Geri Al (Undo) butonu tıklandığında çalışan fonksiyon
  const handleUndoDelete = useCallback(() => {
    if (!pendingDeletionRef.current) return;
    if (pendingDeletionRef.current.timerId) clearTimeout(pendingDeletionRef.current.timerId);
    const restoredId = pendingDeletionRef.current.id;
    setPendingDeletion(null);
    setHiddenRowIds(prev => prev.filter(x => x !== restoredId));
    toast.success(t('auto_silme_islemi_geri_alindi', 'Silme işlemi geri alındı.'));
  }, [t]);

  // Bildirim çubuğu kapatıldığında bekleyen silmeyi anında uygula
  const handleDismissUndo = useCallback(() => {
    commitPendingDeletion();
  }, [commitPendingDeletion]);

  // Sayfadan ayrılırken bekleyen silme varsa commit et
  useEffect(() => {
    return () => {
      if (pendingDeletionRef.current) {
        commitPendingDeletion(pendingDeletionRef.current);
      }
    };
  }, [commitPendingDeletion]);

  // Sekme değişimi: bekleyen silme varsa uygula ve modu değiştir
  const handleViewModeChange = (newMode: ViewMode) => {
    if (pendingDeletionRef.current) {
      commitPendingDeletion(pendingDeletionRef.current);
    }
    setViewMode(newMode);
  };

  const handleAddNew = useCallback((e?: React.MouseEvent) => {
    const targetUrl = `${baseRoute}/yeni?geriDonusTuru=${geriDonusTuru}`;
    if (e && e.shiftKey) {
      window.open(targetUrl, '_blank');
    } else {
      navigate(targetUrl, {
        state: { returnTo: location.pathname }
      });
    }
  }, [baseRoute, geriDonusTuru, navigate, location.pathname]);

  const handleEdit = useCallback((row: any, e?: React.MouseEvent) => {
    const targetUrl = `${baseRoute}/duzenle/${row.id}`;
    if (e && e.shiftKey) {
      window.open(targetUrl, '_blank');
    } else {
      navigate(targetUrl, {
        state: { returnTo: location.pathname }
      });
    }
  }, [baseRoute, navigate, location.pathname]);

  const handleRowDoubleClick = useCallback((row: any, e?: React.MouseEvent) => {
    if (viewMode === 'trash') return;
    handleEdit(row, e);
  }, [viewMode, handleEdit]);

  const handleDelete = useCallback((row: any) => {
    if (pendingDeletionRef.current) {
      commitPendingDeletion(pendingDeletionRef.current);
    }

    const timerId = setTimeout(() => {
      commitPendingDeletion();
    }, 4000);

    const deletionItem: PendingDeletion = {
      id: row.id,
      name: row.aciklama || `#${row.id}`,
      timerId
    };

    setHiddenRowIds(prev => [...prev, row.id]);
    setPendingDeletion(deletionItem);
  }, [commitPendingDeletion]);

  const handleArchive = useCallback(async (row: any) => {
    try {
      await axios.put(`/api/poskomisyonbelgeleri/${row.id}/arsivle`);
      toast.success(t('pos_komisyon_arsivlendi', 'Komisyon belgesi başarıyla arşive alındı.'));
      loadData(viewMode);
    } catch (err: any) {
      toast.error(err?.response?.data?.mesaj || t('auto_islem_sirasinda_hata', 'İşlem sırasında hata oluştu.'));
    }
  }, [viewMode, loadData, t]);

  const handleUnarchive = useCallback(async (row: any) => {
    try {
      await axios.put(`/api/poskomisyonbelgeleri/${row.id}/arsivden-cikar`);
      toast.success(t('pos_komisyon_arsivden_cikarildi', 'Komisyon belgesi başarıyla arşivden çıkarıldı.'));
      loadData(viewMode);
    } catch (err: any) {
      toast.error(err?.response?.data?.mesaj || t('auto_islem_sirasinda_hata', 'İşlem sırasında hata oluştu.'));
    }
  }, [viewMode, loadData, t]);

  const handleRestore = useCallback(async (row: any) => {
    try {
      await axios.put(`/api/poskomisyonbelgeleri/${row.id}/restore`);
      toast.success(t('pos_komisyon_geri_yuklendi', 'Komisyon belgesi başarıyla geri yüklendi.'));
      loadData(viewMode);
    } catch (err: any) {
      toast.error(err?.response?.data?.mesaj || t('auto_islem_sirasinda_hata', 'İşlem sırasında hata oluştu.'));
    }
  }, [viewMode, loadData, t]);

  const handlePermanentDeleteConfirm = useCallback((row: any) => {
    setAlertDialog({
      isOpen: true,
      type: 'confirm',
      title: t('auto_kalici_sil', 'Kalıcı Sil'),
      message: t('auto_komisyon_kalici_sil_onay', 'Bu komisyon belgesini kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'),
      onConfirm: async () => {
        try {
          await axios.delete(`/api/poskomisyonbelgeleri/${row.id}`);
          toast.success(t('pos_komisyon_kalici_silindi', 'Komisyon belgesi kalıcı olarak silindi.'));
          loadData(viewMode);
        } catch (err: any) {
          toast.error(err?.response?.data?.mesaj || t('pos_komisyon_silinemedi', 'Komisyon belgesi silinirken hata oluştu.'));
        }
      }
    });
  }, [viewMode, loadData, t]);

  const columns: Column[] = useMemo(() => [
    {
      id: 'id',
      accessor: 'id',
      header: t('belge_no', 'Belge No'),
      width: '100px',
      sortable: true,
      render: (row: any) => (
        <span className="font-semibold text-primary">#{row.id}</span>
      )
    },
    {
      id: 'baslangicTarihi',
      accessor: 'baslangicTarihi',
      header: t('auto_baslangic_677c', 'Başlangıç'),
      width: '130px',
      sortable: true,
      render: (row: any) => (
        <span className="text-13">
          {row.baslangicTarihi ? new Date(row.baslangicTarihi).toLocaleDateString('tr-TR') : '-'}
        </span>
      )
    },
    {
      id: 'bitisTarihi',
      accessor: 'bitisTarihi',
      header: t('auto_bitis_7cd2', 'Bitiş'),
      width: '130px',
      sortable: true,
      render: (row: any) => (
        <span className="text-13">
          {row.bitisTarihi ? new Date(row.bitisTarihi).toLocaleDateString('tr-TR') : (
            <span className="text-secondary">{t('suresiz', 'Süresiz')}</span>
          )}
        </span>
      )
    },
    {
      id: 'geriDonusTuru',
      accessor: 'geriDonusTuru',
      header: t('auto_geri_donus_turu_c51a', 'Geri Dönüş Türü'),
      width: '160px',
      sortable: true,
      render: (row: any) => (
        row.geriDonusTuru === 2 ? (
          <span className="chip chip-info text-12 font-medium">{t('gununde_blokeli', 'Gününde (Blokeli)')}</span>
        ) : (
          <span className="chip chip-secondary text-12 font-medium">{t('ertesi_gun', 'Ertesi Gün')}</span>
        )
      )
    },
    {
      id: 'satirlar',
      header: t('taksit_sayisi', 'Taksit / Oran'),
      width: '130px',
      render: (row: any) => (
        <span className="chip chip-neutral text-12 font-medium">
          {row.satirlar?.length || 0} {t('adet_taksit', 'Taksit')}
        </span>
      )
    },
    {
      id: 'aciklama',
      accessor: 'aciklama',
      header: t('auto_aciklama_1bab', 'Açıklama'),
      render: (row: any) => (
        <span className="text-13 text-secondary truncate max-w-300">
          {row.aciklama || '-'}
        </span>
      )
    },
    {
      id: 'durum',
      accessor: 'aktifMi',
      header: t('durum', 'Durum'),
      width: '100px',
      render: (row: any) => (
        <span className={`chip text-12 ${row.aktifMi ? 'chip-success' : 'chip-danger'}`}>
          {row.aktifMi ? t('aktif', 'Aktif') : t('pasif', 'Pasif')}
        </span>
      )
    },
    {
      id: 'actions',
      header: '',
      width: '60px',
      render: (row: any) => {
        const actions = [];

        if (viewMode === 'trash') {
          actions.push({
            label: t('auto_geri_yukle', 'Geri Yükle'),
            icon: <RotateCcw size={16} />,
            onClick: () => handleRestore(row)
          });
          actions.push({
            label: t('auto_kalici_sil', 'Kalıcı Sil'),
            icon: <Trash2 size={16} />,
            danger: true,
            onClick: () => handlePermanentDeleteConfirm(row)
          });
        } else {
          actions.push({
            label: t('duzenle', 'Düzenle'),
            icon: <Edit2 size={16} />,
            onClick: (e?: any) => handleEdit(row, e)
          });

          if (viewMode === 'active') {
            actions.push({
              label: t('arsive_al', 'Arşive Al'),
              icon: <Archive size={16} />,
              onClick: () => handleArchive(row)
            });
          } else if (viewMode === 'archive') {
            actions.push({
              label: t('arsivden_cikar', 'Aktifleştir'),
              icon: <Layers size={16} />,
              onClick: () => handleUnarchive(row)
            });
          }

          actions.push({
            label: t('sil', 'Sil'),
            icon: <Trash2 size={16} />,
            danger: true,
            onClick: () => handleDelete(row)
          });
        }

        return <ActionMenu actions={actions} />;
      }
    }
  ], [t, viewMode, handleEdit, handleDelete, handleArchive, handleUnarchive, handleRestore, handlePermanentDeleteConfirm]);

  const emptyMessage = useMemo(() => {
    if (viewMode === 'trash') {
      return t('cop_kutusu_komisyon_bos', 'Çöp kutusunda silinmiş komisyon belgesi bulunamadı.');
    }
    if (viewMode === 'archive') {
      return t('arsiv_komisyon_bos', 'Arşivde komisyon belgesi bulunamadı.');
    }
    return t('auto_henuz_komisyon_belge_77d7', 'Henüz komisyon belgesi tanımlanmamış.');
  }, [viewMode, t]);

  return (
    <div className="surface-card p-20 rounded-16 border-glass flex flex-col flex-1 min-h-0 gap-16">
      {/* Üst Başlık ve 3 Durumlu Yaşam Döngüsü (Segmented Button Group) */}
      <div className="flex items-center justify-between gap-16 flex-wrap">
        <div>
          <h3 className="m-0 text-16 font-600 text-primary">
            {t('auto_komisyon_sozlesmeler_36f1', 'Komisyon Sözleşmeleri')}
          </h3>
          <p className="m-0 text-13 text-secondary mt-4">
            {t('pos_komisyon_aciklama', 'Bu POS cihazına ait geçmiş ve güncel komisyon anlaşmalarını buradan yönetebilirsiniz.')}
          </p>
        </div>

        {/* Segmented Filter: [Aktif] [Arşiv] [Çöp Kutusu] */}
        <div className="view-mode-segmented-track">
          <button
            type="button"
            className={`view-mode-segment-btn ${viewMode === 'active' ? 'active mode-active' : ''}`}
            onClick={() => handleViewModeChange('active')}
            title={t('auto_aktif_kayitlar', 'Aktif Kayıtlar')}
            aria-label={t('auto_aktif_kayitlar', 'Aktif Kayıtlar')}
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
          >
            <Trash2 size={14} />
            <span className="segment-label">{t('auto_cop_kutusu', 'Çöp Kutusu')}</span>
          </button>
        </div>
      </div>

      {/* BaseListPage Düzeninde DataTable */}
      <div className="table-container flex-1">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          refreshKey={refreshKey}
          hiddenRowIds={hiddenRowIds}
          onRowDoubleClick={handleRowDoubleClick}
          emptyMessage={emptyMessage}
          defaultSortField="baslangicTarihi"
          defaultSortOrder="desc"
        />
      </div>

      {/* Sağ Alt Tarafta Dairesel Yüzen (Circular Float) Ekle Düğmesi */}
      {viewMode === 'active' && (
        <EkleFloatCircleButton
          position="fixed-bottom-right"
          onClick={handleAddNew}
          title={t('yeni_komisyon_belgesi_ekle', 'Yeni Komisyon Belgesi Ekle')}
        />
      )}

      {/* Undoable Deletion Bar (Geri Al Bildirimi) */}
      {pendingDeletion && (
        <UndoDeleteBar
          itemName={pendingDeletion.name}
          duration={4000}
          onUndo={handleUndoDelete}
          onDismiss={handleDismissUndo}
        />
      )}

      {/* Kalıcı Silme & Hata Onay Dialogu */}
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
        confirmText={t('evet_sil', 'Evet, Sil')}
        cancelText={t('auto_iptal', 'İptal')}
      />
    </div>
  );
};

export default PosKomisyonBelgeleriTablosu;
