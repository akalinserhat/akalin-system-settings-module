/**
 * Webakus ERP - Para Birimleri ve Kurlar Yönetimi (ParaBirimleri)
 * Para birimleri tanımlama, günlük kurlar ve entegrasyon ayarlarını yönetir.
 * BaseSystemPage sayfasından türetilmiştir.
 * inMemoryMode desteği ile AdminUI Sektörel Seed Yapılandırmasında doğrudan kullanılabilir.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BaseSystemPage, 
  AlertDialog,
  BaseTabItem,
  ParaBirimCard
} from '@akalin/ui';
import ParaBirimiForm from './ParaBirimiForm';
import { 
  Coins, 
  Calendar, 
  Settings, 
  Plus, 
  RefreshCcw 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import GunlukKurlarList from './GunlukKurlarList';
import ParaBirimiEntegrasyonForm from './ParaBirimiEntegrasyonForm';

export interface ParaBirimleriProps {
  inMemoryMode?: boolean;
  initialItems?: any[];
  onSaveMemory?: (items: any[]) => void;
  hideOtherTabs?: boolean;
  showTopHeader?: boolean;
  showBackButton?: boolean;
  backRoute?: string;
  onBack?: () => void;
  headerSync?: boolean;
}

const ParaBirimleri: React.FC<ParaBirimleriProps> = ({
  inMemoryMode = false,
  initialItems = [],
  onSaveMemory,
  hideOtherTabs = false,
  showTopHeader = true,
  showBackButton = true,
  backRoute = '/ayarlar/sistem-ayarlari',
  onBack,
  headerSync = true
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('currencies');
  const [items, setItems] = useState<any[]>(inMemoryMode ? initialItems : []);
  const [memoryItems, setMemoryItems] = useState<any[]>(initialItems);
  const [loading, setLoading] = useState<boolean>(!inMemoryMode);

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    if (inMemoryMode) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/ParaBirimleri');
      setItems(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (err) {
      console.error('Para birimleri yüklenemedi:', err);
      toast.error(t('ParaBirimleri_yuklenemedi', 'Para birimleri yüklenirken hata oluştu.'));
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
      setMemoryItems(initialItems);
      setItems(initialItems);
    }
  }, [initialItems, inMemoryMode]);

  const handleAddNew = () => {
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEditModal = (item: any) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    if (!inMemoryMode) {
      loadData();
    }
  };

  const handleSaveSingleCurrencyInMemory = (currencyItem: any) => {
    let list = [...memoryItems];
    if (currencyItem.varsayilanMi) {
      list = list.map((c: any) => ({ ...c, varsayilanMi: false }));
    }

    const matchKod = (selectedItem?.kod || currencyItem.kod).toUpperCase();
    const existingIndex = list.findIndex((c: any) => c.kod.toUpperCase() === matchKod);

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...currencyItem };
    } else {
      list.push({ ...currencyItem, id: currencyItem.id || Date.now() });
    }

    if (!list.some((c: any) => c.varsayilanMi) && list.length > 0) {
      list[0].varsayilanMi = true;
    }

    setMemoryItems(list);
    setItems(list);
    if (onSaveMemory) onSaveMemory(list);
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleDeleteMemory = (itemToDelete: any) => {
    const list = memoryItems.filter((x: any) => x.kod.toUpperCase() !== itemToDelete.kod.toUpperCase());
    if (list.length > 0 && !list.some((x: any) => x.varsayilanMi)) {
      list[0].varsayilanMi = true;
    }
    setMemoryItems(list);
    setItems(list);
    if (onSaveMemory) onSaveMemory(list);
  };

  const handleSetDefault = async (item: any) => {
    if (inMemoryMode) {
      const list = memoryItems.map((c: any) => ({
        ...c,
        varsayilanMi: c.kod.toUpperCase() === item.kod.toUpperCase()
      }));
      setMemoryItems(list);
      setItems(list);
      if (onSaveMemory) onSaveMemory(list);
      toast.success(t('ParaBirimi_varsayilanYapildi', 'Varsayılan para birimi değiştirildi.'));
      return;
    }
    try {
      await axios.put(`/api/ParaBirimleri/${item.id}`, { ...item, varsayilanMi: true });
      toast.success(t('ParaBirimi_varsayilanYapildi', 'Varsayılan para birimi değiştirildi.'));
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('auto_hata_olustu', 'Bir hata oluştu.'));
    }
  };

  const handleDeleteClick = (item: any) => {
    if (item.varsayilanMi) {
      toast.error(t('ParaBirimi_varsayilanSilinemez', 'Varsayılan para birimi silinemez. Önce başka bir para birimini varsayılan yapmalısınız.'));
      return;
    }
    setDeleteTarget(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (inMemoryMode) {
      handleDeleteMemory(deleteTarget);
      toast.success(t('ParaBirimi_silindi', 'Para birimi başarıyla silindi.'));
      setDeleteTarget(null);
      return;
    }
    try {
      await axios.delete(`/api/ParaBirimleri/${deleteTarget.id}`);
      toast.success(t('ParaBirimi_silindi', 'Para birimi başarıyla silindi.'));
      setItems(prev => prev.filter(x => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Silme hatası:', err);
      toast.error(err?.response?.data?.message || t('ParaBirimi_silinemedi', 'Para birimi silinirken bir hata oluştu.'));
    }
  };

  const searchableFields = useMemo(() => [
    { id: 'Tumu', label: t('tumu', 'Tümü'), type: 'text', placeholder: t('ph_para_birimi_ara', 'Para birimlerinde ara...') },
    { id: 'Kod', label: t('auto_kod_78c2', 'Kod'), type: 'text' },
    { id: 'Ad', label: t('auto_para_birimi_adi_212e', 'Para Birimi Adı'), type: 'text' },
    { id: 'Sembol', label: t('auto_sembol', 'Sembol'), type: 'text' }
  ], [t]);

  const tabs: BaseTabItem[] = useMemo(() => [
    { 
      id: 'currencies', 
      label: t('ParaBirimleri_tabCurrencies', 'Para Birimleri'), 
      icon: <Coins size={18} />
    },
    ...(!hideOtherTabs ? [
      { 
        id: 'rates', 
        label: t('ParaBirimleri_tabRates', 'Günlük Kurlar'), 
        icon: <Calendar size={18} />,
        content: (
          <div className="surface-card flex flex-col flex-1 min-h-0 overflow-y-auto rounded-16 border border-glass">
            <GunlukKurlarList />
          </div>
        )
      },
      { 
        id: 'settings', 
        label: t('ParaBirimleri_tabSettings', 'Entegrasyon Ayarları'), 
        icon: <Settings size={18} />,
        content: (
          <div className="surface-card flex flex-col flex-1 min-h-0 overflow-y-auto rounded-16 border border-glass">
            <ParaBirimiEntegrasyonForm />
          </div>
        )
      }
    ] : [])
  ], [t, hideOtherTabs]);

  const activeCurrencyData = inMemoryMode ? memoryItems : items;

  return (
    <BaseSystemPage
      hideHeader={!showTopHeader}
      title={t('ParaBirimleri_tabCurrencies', 'Para Birimleri')}
      subtitle={t('ParaBirimleri_subtitle', 'Döviz kurları, aktif para birimleri ve kur güncelleme seçenekleri')}
      icon={<Coins size={24} />}
      baseRoute="/ayarlar/sistem-ayarlari"
      backRoute={backRoute}
      showBackButton={showBackButton}
      onBack={onBack}
      headerSync={headerSync}
      searchPlaceholder={t('ph_para_birimi_ara', 'Para birimlerinde ara...')}
      searchableFields={searchableFields}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(String(id))}
      hideIfSingleTab={true}
      onAdd={handleAddNew}
      addButtonTitle={t('ParaBirimi_yeni', 'Yeni Para Birimi')}
      hideAddButton={activeTab !== 'currencies'}
    >
      {({ filterItems, searchTerm, isSearching }) => {
        const filteredData = filterItems(activeCurrencyData, (item) => [
          item.kod,
          item.ad,
          item.sembol
        ]);

        return (
          <div className="relative fade-in flex-1 flex flex-col min-h-0">
            {loading && !inMemoryMode ? (
              <div className="glass-card loading-state flex flex-col items-center justify-center p-40">
                <RefreshCcw size={32} className="spinning loading-icon mb-12 text-secondary" />
                <p className="text-secondary m-0">{t('auto_yukleniyor_4deb', 'Yükleniyor...')}</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="surface-card p-40 text-center flex flex-col items-center justify-center rounded-16 my-16 mx-24">
                <div className="icon-box-large mb-16 bg-surface-variant">
                  <Coins size={36} className="text-secondary" />
                </div>
                <h3 className="m-0 text-16 font-semibold text-primary mb-6">
                  {isSearching 
                    ? t('eslesen_para_birimi_bulunamadi', 'Eşleşen Para Birimi Bulunamadı') 
                    : t('henuz_para_birimi_eklenmedi', 'Henüz para birimi tanımlanmamış.')}
                </h3>
                <p className="text-13 text-secondary max-w-400 mb-16">
                  {isSearching 
                    ? t('auto_arama_kriterine_uygun_sonuc_yok', '"{{term}}" arama kriterine uygun para birimi bulunamadı.', { term: searchTerm })
                    : t('para_birimi_ekleme_aciklama', 'İşletmenizde kullanmak istediğiniz döviz kurlarını ve para birimlerini buradan ekleyebilirsiniz.')}
                </p>
                {!isSearching && (
                  <button type="button" className="btn btn-primary" onClick={handleAddNew}>
                    <Plus size={16} /> {t('ParaBirimi_yeni', 'Yeni Para Birimi')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid-auto-320 gap-20 p-24 overflow-y-auto">
                {filteredData.map((item) => (
                  <ParaBirimCard
                    key={item.id || item.kod}
                    paraBirimi={item}
                    onEdit={handleEditModal}
                    onDelete={handleDeleteClick}
                    onSetDefault={handleSetDefault}
                  />
                ))}
              </div>
            )}

            {showModal && (
              <ParaBirimiForm 
                isOpen={showModal}
                initialData={selectedItem} 
                onSuccess={handleSuccess} 
                onCancel={() => setShowModal(false)} 
                onDirtyChange={() => {}}
                inMemoryMode={inMemoryMode}
                onSaveMemory={handleSaveSingleCurrencyInMemory}
              />
            )}

            <AlertDialog
              isOpen={!!deleteTarget}
              onClose={() => setDeleteTarget(null)}
              type="confirm"
              title={t('para_birimi_sil_baslik', 'Para Birimi Silinecek')}
              message={t('para_birimi_sil_onay', '"{{ad}}" ({{kod}}) para birimini silmek istediğinize emin misiniz?', { ad: deleteTarget?.ad, kod: deleteTarget?.kod })}
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

export default ParaBirimleri;
