/**
 * @file KdvAyarlari.tsx
 * @description 
 * Vergi ve KDV oranları yönetim sayfası.
 * BaseSystemPage altyapısını kullanarak KDV tanımlarını ve tarihsel oranlarını kartlar halinde sunar.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseSystemPage, KDVCard, AlertDialog } from '@akalin/ui';
import { Calculator, Plus, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import KdvFormModal from './KdvFormModal';

export interface KdvAyarlariProps {
  inMemoryMode?: boolean;
  initialItems?: any[];
  onSaveMemory?: (items: any[]) => void;
  showTopHeader?: boolean;
  showBackButton?: boolean;
  backRoute?: string;
  onBack?: () => void;
  headerSync?: boolean;
}

const KdvAyarlari: React.FC<KdvAyarlariProps> = ({
  inMemoryMode = false,
  initialItems = [],
  onSaveMemory,
  showTopHeader = false,
  showBackButton = true,
  backRoute = '/ayarlar/sistem-ayarlari',
  onBack,
  headerSync = true
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [items, setItems] = useState<any[]>(inMemoryMode ? initialItems : []);
  const [loading, setLoading] = useState<boolean>(!inMemoryMode);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    if (inMemoryMode) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/KdvGruplari');
      setItems(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (err) {
      console.error('KDV grupları yüklenemedi:', err);
      toast.error(t('kdv_gruplari_yuklenemedi', 'KDV grupları yüklenirken hata oluştu.'));
    } finally {
      setLoading(false);
    }
  }, [inMemoryMode, t]);

  useEffect(() => {
    if (!inMemoryMode) {
      loadData();
    }
  }, [loadData, inMemoryMode]);

  useEffect(() => {
    if (inMemoryMode && initialItems) {
      setItems(initialItems);
    }
  }, [initialItems, inMemoryMode]);

  const handleAddNew = () => {
    if (inMemoryMode) {
      setSelectedItem(null);
      setShowModal(true);
    } else {
      navigate('/ayarlar/sistem-ayarlari/VergiVeKDV/yeni', { state: { returnUrl: '/ayarlar/sistem-ayarlari/VergiVeKDV' } });
    }
  };

  const handleEditItem = (item: any) => {
    if (inMemoryMode) {
      setSelectedItem(item);
      setShowModal(true);
    } else {
      navigate(`/ayarlar/sistem-ayarlari/VergiVeKDV/duzenle/${item.id}`, { state: { returnUrl: '/ayarlar/sistem-ayarlari/VergiVeKDV' } });
    }
  };

  const handleSuccess = () => {
    setShowModal(false);
    if (!inMemoryMode) {
      loadData();
    }
  };

  const handleSaveSingleKdvInMemory = (kdvItem: any) => {
    let updatedList = [...items];
    if (selectedItem) {
      updatedList = updatedList.map(item => (item.id === selectedItem.id || item.kod === selectedItem.kod) ? { ...kdvItem, id: selectedItem.id || selectedItem.kod } : item);
    } else {
      const newId = updatedList.length > 0 ? Math.max(...updatedList.map(i => i.id || 0)) + 1 : 1;
      updatedList.push({ ...kdvItem, id: newId });
    }
    setItems(updatedList);
    setShowModal(false);
    if (onSaveMemory) onSaveMemory(updatedList);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    if (inMemoryMode) {
      const updatedList = items.filter(i => (i.id !== deleteTarget.id && i.kod !== deleteTarget.kod));
      setItems(updatedList);
      toast.success(t('kdv_silindi', 'KDV tanımı silindi.'));
      if (onSaveMemory) onSaveMemory(updatedList);
      setDeleteTarget(null);
      return;
    }

    try {
      await axios.delete(`/api/KdvGruplari/${deleteTarget.id}`);
      toast.success(t('kdv_silindi', 'KDV tanımı silindi.'));
      setItems(prev => prev.filter(x => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Silme hatası:', err);
      toast.error(err?.response?.data?.message || t('kdv_silinemedi', 'KDV tanımı silinirken bir hata oluştu.'));
    }
  };

  const searchableFields = useMemo(() => [
    { id: 'Tumu', label: t('tumu', 'Tümü'), type: 'text', placeholder: t('ph_kdv_ara', 'KDV tanımlarında ara...') },
    { id: 'Ad', label: t('kdv_adi', 'KDV Adı'), type: 'text' },
    { id: 'Kod', label: t('kdv_kodu', 'KDV Kodu'), type: 'text' }
  ], [t]);

  return (
    <BaseSystemPage
      title={t('sektorel_vergi_kdv_baslik', 'Vergi ve KDV Ayarları')}
      subtitle={t('sektorel_vergi_kdv_aciklama', 'Sistem genelinde kullanılacak varsayılan vergi ve KDV oranlarını tanımlayın ve yönetin.')}
      icon={<Calculator size={24} />}
      baseRoute="/ayarlar/sistem-ayarlari"
      backRoute={backRoute}
      showBackButton={showBackButton}
      onBack={onBack}
      headerSync={headerSync}
      searchPlaceholder={t('ph_kdv_ara', 'KDV tanımlarında ara...')}
      searchableFields={searchableFields}
      onAdd={handleAddNew}
      addButtonTitle={t('yeni_kdv_tanimi', 'Yeni KDV Tanımı')}
    >
      {({ filterItems, searchTerm, isSearching }) => {
        const filteredData = filterItems(items, (item) => [
          item.ad,
          item.kod,
          item.oranlar ? item.oranlar.map((o: any) => o.oran).join(' ') : ''
        ]);

        return (
          <div className="relative fade-in flex-1 flex flex-col min-h-0">
            {loading && !inMemoryMode ? (
              <div className="glass-card loading-state flex flex-col items-center justify-center p-40">
                <RefreshCcw size={32} className="spinning loading-icon mb-12 text-secondary" />
                <p className="text-secondary m-0">{t('auto_yukleniyor_4deb', 'Yükleniyor...')}</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="surface-card p-40 text-center flex flex-col items-center justify-center rounded-16 my-16">
                <div className="icon-box-large mb-16 bg-surface-variant">
                  <Calculator size={36} className="text-secondary" />
                </div>
                <h3 className="m-0 text-16 font-semibold text-primary mb-6">
                  {isSearching 
                    ? t('eslesen_kdv_bulunamadi', 'Eşleşen KDV Tanımı Bulunamadı') 
                    : t('henuz_kdv_eklenmedi', 'Henüz vergi ve KDV tanımı eklenmemiş.')}
                </h3>
                <p className="text-13 text-secondary max-w-400 mb-16">
                  {isSearching 
                    ? t('auto_arama_kriterine_uygun_sonuc_yok', '"{{term}}" arama kriterine uygun KDV tanımı bulunamadı.', { term: searchTerm })
                    : t('kdv_ekleme_aciklama', 'Faturalar ve ürün kartları için yeni bir KDV grubu ekleyebilirsiniz.')}
                </p>
                {!isSearching && (
                  <button type="button" className="btn btn-primary" onClick={handleAddNew}>
                    <Plus size={16} /> {t('yeni_kdv_tanimi', 'Yeni KDV Tanımı')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid-auto-320 gap-20 p-24 overflow-y-auto">
                {filteredData.map((grup, idx) => (
                  <KDVCard 
                    key={grup.id || grup.kod || idx} 
                    grup={grup} 
                    onEdit={handleEditItem} 
                    onDelete={(item: any) => setDeleteTarget(item)} 
                  />
                ))}
              </div>
            )}

            {showModal && (
              <KdvFormModal 
                isOpen={showModal}
                initialData={selectedItem}
                onSuccess={handleSuccess}
                onCancel={() => setShowModal(false)}
                inMemoryMode={inMemoryMode}
                onSaveMemory={handleSaveSingleKdvInMemory}
              />
            )}

            <AlertDialog
              isOpen={!!deleteTarget}
              onClose={() => setDeleteTarget(null)}
              type="confirm"
              title={t('kdv_sil_baslik', 'KDV Tanımı Silinecek')}
              message={t('kdv_sil_onay', '"{{ad}}" KDV tanımını silmek istediğinize emin misiniz?', { ad: deleteTarget?.ad || deleteTarget?.kod })}
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

export default KdvAyarlari;
