/**
 * @file DepolarVeSubeler.tsx
 * @description 
 * Depo, şube ve mağaza tanımları yönetim sayfası.
 * BaseSystemPage altyapısını kullanarak lokasyon kartlarını duyarlı ve modern bir ızgarada listeler.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Warehouse, Plus, RefreshCcw } from 'lucide-react';
import { BaseSystemPage, DepoVeSubeCard, AlertDialog } from '@akalin/ui';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import DepoForm from './DepoForm';

export interface DepolarVeSubelerProps {
  inMemoryMode?: boolean;
  initialItems?: any[];
  onSaveMemory?: (items: any[]) => void;
  showTopHeader?: boolean;
  onEditItem?: (item: any) => void;
  onAddNewItem?: () => void;
  showBackButton?: boolean;
  backRoute?: string;
  onBack?: () => void;
  headerSync?: boolean;
}

const DEFAULT_LOCATIONS = [
  { id: 1, kod: 'DEP-01', ad: 'Merkez Depo', tur: 1, seriTakibiYapilirMi: true, aktifMi: true, adres: 'Merkez Mahallesi, Ana Caddesi No:1' },
  { id: 2, kod: 'SUB-01', ad: 'Merkez Şube', tur: 3, telefon: '0212 111 22 33', aktifMi: true, adres: 'Atatürk Caddesi No:10' }
];

const DepolarVeSubeler: React.FC<DepolarVeSubelerProps> = ({
  inMemoryMode = false,
  initialItems = DEFAULT_LOCATIONS,
  onSaveMemory,
  showTopHeader = true,
  onEditItem,
  onAddNewItem,
  showBackButton = false,
  backRoute = '/ayarlar/sistem-ayarlari',
  onBack,
  headerSync = true
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [items, setItems] = useState<any[]>(inMemoryMode ? (initialItems?.length ? initialItems : DEFAULT_LOCATIONS) : []);
  const [loading, setLoading] = useState<boolean>(!inMemoryMode);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // In-Memory Form State
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);

  const loadData = useCallback(async () => {
    if (inMemoryMode) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/Depolar');
      setItems(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (err) {
      console.error('Depolar yüklenemedi:', err);
      toast.error(t('depolar_yuklenemedi', 'Depolar yüklenirken hata oluştu.'));
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
      setItems(initialItems.length > 0 ? initialItems : DEFAULT_LOCATIONS);
    }
  }, [initialItems, inMemoryMode]);

  const searchableFields = useMemo(() => [
    { id: 'Tumu', label: t('tumu', 'Tümü'), iconName: 'Search', type: 'text', placeholder: t('ph_tum_lokasyonlarda_ara', 'Tüm lokasyonlarda ara...') },
    { id: 'Sube', label: t('sube_unvani', 'Şube'), iconName: 'Building2', type: 'enum' },
    { id: 'Magaza', label: t('magaza', 'Mağaza'), iconName: 'Store', type: 'enum' },
    { id: 'Depo', label: t('depo_unvani', 'Depo'), iconName: 'Warehouse', type: 'enum' },
    { id: 'Lojistik', label: t('lojistik', 'Lojistik'), iconName: 'Truck', type: 'enum' },
    { id: 'Sanal', label: t('sanal', 'Sanal'), iconName: 'Cloud', type: 'enum' }
  ], [t]);

  const kullanicilar = useMemo(() => [
    { id: 1, adSoyad: 'Serhat Akalın', telefon: '0532 111 22 33' },
    { id: 2, adSoyad: 'Ahmet Yılmaz', telefon: '0555 444 55 66' },
    { id: 3, adSoyad: 'Ayşe Demir', telefon: '0544 777 88 99' },
    { id: 4, adSoyad: 'Mehmet Kaya', telefon: '0533 999 88 77' }
  ], []);

  const handleAddNew = () => {
    if (onAddNewItem) {
      onAddNewItem();
    } else if (inMemoryMode) {
      setEditingItem(null);
      setIsAddingItem(true);
    } else {
      navigate('/ayarlar/depolar/yeni', { state: { returnUrl: '/ayarlar/sistem-ayarlari/DepolarVeSubeler' } });
    }
  };

  const handleEditItemClick = (item: any) => {
    if (onEditItem) {
      onEditItem(item);
    } else if (inMemoryMode) {
      setEditingItem(item);
      setIsAddingItem(false);
    } else {
      navigate(`/ayarlar/depolar/${item.id}`, { state: { returnUrl: '/ayarlar/sistem-ayarlari/DepolarVeSubeler' } });
    }
  };

  const handleSaveMemoryDepo = (savedData: any) => {
    let updatedList = [...items];
    if (editingItem) {
      updatedList = updatedList.map(item => item.id === editingItem.id ? { ...item, ...savedData, id: editingItem.id } : item);
    } else {
      const newId = updatedList.length > 0 ? Math.max(...updatedList.map(i => i.id || 0)) + 1 : 1;
      updatedList.push({ ...savedData, id: newId });
    }
    setItems(updatedList);
    setEditingItem(null);
    setIsAddingItem(false);
    if (onSaveMemory) onSaveMemory(updatedList);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    if (inMemoryMode) {
      const updatedList = items.filter(item => item.id !== deleteTarget.id);
      setItems(updatedList);
      toast.success(t('lokasyon_silindi', 'Lokasyon tohum kaydı silindi.'));
      if (onSaveMemory) onSaveMemory(updatedList);
      setDeleteTarget(null);
      return;
    }

    try {
      await axios.delete(`/api/Depolar/${deleteTarget.id}`);
      toast.success(t('depo_silindi', 'Lokasyon kaydı başarıyla silindi.'));
      setItems(prev => prev.filter(x => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Silme hatası:', err);
      toast.error(err?.response?.data?.message || t('depo_silinemedi', 'Lokasyon silinirken bir hata oluştu.'));
    }
  };

  if (inMemoryMode && (editingItem || isAddingItem)) {
    return (
      <DepoForm
        initialData={editingItem}
        inMemoryMode={true}
        onSaveMemory={handleSaveMemoryDepo}
        onCancel={() => {
          setEditingItem(null);
          setIsAddingItem(false);
        }}
        onSuccess={() => {
          setEditingItem(null);
          setIsAddingItem(false);
        }}
      />
    );
  }

  return (
    <BaseSystemPage
      title={t('depolar_ve_subeler', 'Depolar ve Şubeler')}
      subtitle={t('depolar_ve_subeler_alt_baslik', 'İşletmenize ait fiziksel ve sanal lokasyonlar, mağaza ve depo tanımlamaları')}
      icon={<Warehouse size={24} />}
      baseRoute="/ayarlar/sistem-ayarlari"
      backRoute={backRoute}
      showBackButton={showBackButton}
      onBack={onBack}
      headerSync={headerSync}
      searchPlaceholder={t('ph_tum_lokasyonlarda_ara', 'Tüm lokasyonlarda ara...')}
      searchableFields={searchableFields}
      onAdd={handleAddNew}
      addButtonTitle={t('auto_yeni_ekle', 'Yeni Ekle')}
    >
      {({ filterItems, searchTerm, isSearching, searchType }) => {
        let filteredLocations = filterItems(items, (item) => [
          item.ad,
          item.kod,
          item.adres,
          item.telefon
        ]);

        if (searchType && searchType !== 'Tumu') {
          filteredLocations = filteredLocations.filter((loc) => {
            if (searchType === 'Sube') return loc.tur === 3;
            if (searchType === 'Magaza') return loc.tur === 2;
            if (searchType === 'Depo') return loc.tur === 1 || loc.tur === 4 || loc.tur === 5 || loc.tur === 6 || loc.tur === undefined;
            if (searchType === 'Lojistik') return loc.tur === 6;
            if (searchType === 'Sanal') return loc.tur === 5;
            return true;
          });
        }

        return (
          <div className="relative fade-in flex-1 flex flex-col min-h-0">
            {loading && !inMemoryMode ? (
              <div className="glass-card loading-state flex flex-col items-center justify-center p-40">
                <RefreshCcw size={32} className="spinning loading-icon mb-12 text-secondary" />
                <p className="text-secondary m-0">{t('auto_yukleniyor_4deb', 'Yükleniyor...')}</p>
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="surface-card p-40 text-center flex flex-col items-center justify-center rounded-16 my-16">
                <div className="icon-box-large mb-16 bg-surface-variant">
                  <Warehouse size={36} className="text-secondary" />
                </div>
                <h3 className="m-0 text-16 font-semibold text-primary mb-6">
                  {isSearching 
                    ? t('eslesen_lokasyon_yok', 'Eşleşen Lokasyon Bulunamadı') 
                    : t('auto_kayit_bulunamadi', 'Kayıt bulunamadı.')}
                </h3>
                <p className="text-13 text-secondary max-w-400 mb-16">
                  {isSearching 
                    ? t('auto_arama_kriterine_uygun_sonuc_yok', '"{{term}}" arama kriterine uygun lokasyon bulunamadı.', { term: searchTerm })
                    : t('lokasyon_yok_aciklama', 'İşletmenize ait depo, mağaza veya şube lokasyonlarını ekleyebilirsiniz.')}
                </p>
                {!isSearching && (
                  <button type="button" className="btn btn-primary" onClick={handleAddNew}>
                    <Plus size={16} /> {t('auto_yeni_ekle', 'Yeni Ekle')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid-auto-320 gap-20 p-24 overflow-y-auto">
                {filteredLocations.map((loc) => (
                  <DepoVeSubeCard
                    key={loc.id}
                    loc={loc}
                    inMemoryMode={inMemoryMode}
                    kullanicilar={kullanicilar}
                    onEdit={(item) => handleEditItemClick(item)}
                    onDelete={(item) => setDeleteTarget(item)}
                  />
                ))}
              </div>
            )}

            <AlertDialog
              isOpen={!!deleteTarget}
              onClose={() => setDeleteTarget(null)}
              type="confirm"
              title={t('lokasyon_sil_baslik', 'Lokasyon Silinecek')}
              message={t('lokasyon_sil_onay', '"{{ad}}" lokasyonunu silmek istediğinize emin misiniz?', { ad: deleteTarget?.ad })}
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

export default DepolarVeSubeler;
