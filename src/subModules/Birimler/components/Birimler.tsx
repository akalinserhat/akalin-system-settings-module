import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Scale } from 'lucide-react';
import { BaseModalCrud, BirimlerGrid } from '@akalin/ui';
import BirimForm from '../../../../UrunYonetimi/components/BirimForm';
import { useTranslation } from 'react-i18next';

export interface BirimlerProps {
  inMemoryMode?: boolean;
  initialItems?: any[];
  onSaveMemory?: (items: any[]) => void;
  showTopHeader?: boolean;
}

const Birimler: React.FC<BirimlerProps> = ({
  inMemoryMode = false,
  initialItems = [],
  onSaveMemory,
  showTopHeader = true
}) => {
  const { t } = useTranslation();
  const [birimTipleri, setBirimTipleri] = useState<any[]>([
    { value: 1, label: 'Sayılabilir' },
    { value: 2, label: 'Ağırlık' },
    { value: 3, label: 'Hacim (Sıvı)' },
    { value: 4, label: 'Uzunluk' },
    { value: 5, label: 'Alan' },
    { value: 6, label: 'Zaman' }
  ]);
  const [memoryItems, setMemoryItems] = useState<any[]>(initialItems);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (inMemoryMode && initialItems) {
      setMemoryItems(initialItems);
    }
  }, [initialItems, inMemoryMode]);

  useEffect(() => {
    fetchBirimTipleri();
  }, []);

  async function fetchBirimTipleri() {
    try {
      const res = await axios.get('/api/Tanimlar/birim-tipleri');
      if (res.data && res.data.length > 0) {
        setBirimTipleri(res.data.map((t: any) => ({ value: t.id, label: t.ad })));
      }
    } catch (err) {
      console.error('Birim tipleri yüklenemedi:', err);
    }
  }

  const handleSaveMemoryItem = (savedItem: any) => {
    let list = [...memoryItems];
    const existingIndex = list.findIndex((x: any) => (x.id && savedItem.id && x.id === savedItem.id) || (x.ad && savedItem.ad && x.ad.toLowerCase() === savedItem.ad.toLowerCase()));
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...savedItem };
    } else {
      list.push({ ...savedItem, id: savedItem.id || Date.now() });
    }
    setMemoryItems(list);
    setRefreshKey(prev => prev + 1);
    if (onSaveMemory) onSaveMemory(list);
  };

  const handleDeleteMemory = async (idOrItem: any) => {
    const targetId = typeof idOrItem === 'object' ? idOrItem.id : idOrItem;
    const targetAd = typeof idOrItem === 'object' ? idOrItem.ad : idOrItem;
    const list = memoryItems.filter((x: any) => x.id !== targetId && x.ad !== targetAd);
    setMemoryItems(list);
    setRefreshKey(prev => prev + 1);
    if (onSaveMemory) onSaveMemory(list);
  };

  const customRenderContent = ({ data, loading, handleEdit, handleDelete }: any) => {
    const renderList = inMemoryMode ? memoryItems : data;

    return (
      <BirimlerGrid
        data={renderList}
        loading={!inMemoryMode && loading}
        birimTipleri={birimTipleri}
        onEdit={handleEdit}
        onDelete={inMemoryMode ? handleDeleteMemory : handleDelete}
      />
    );
  };


  const MemoryBirimFormWrapper = (formProps: any) => (
    <BirimForm
      {...formProps}
      inMemoryMode={inMemoryMode}
      onSaveMemory={handleSaveMemoryItem}
    />
  );

  const crudProps = inMemoryMode ? {
    customFetchData: async () => ({ data: memoryItems }),
    customDeleteData: handleDeleteMemory,
    refreshKey: refreshKey
  } : {
    apiEndpoint: "/api/Birimler"
  };

  return (
    <BaseModalCrud
      icon={<Scale size={24} />}
      title={t('birimler_baslik', 'Birimler')}
      subtitle={t('birimler_aciklama', 'Ürün ve hizmet kartlarında kullanılacak birim tanımlarını yönetin.')}
      itemNameResolver={(item) => item.ad}
      formComponent={MemoryBirimFormWrapper}
      modalTitlePrefix={t('birim', 'Birim')}
      customRenderContent={customRenderContent}
      {...crudProps}
    />
  );
};

export default Birimler;
