import React from 'react';
import { MarkaFormPopup } from '@akalin/product_module';
import { ActionMenu, BaseCrudPopup } from '@akalin/ui';
import { Check, X, Edit2, Trash2, Tags } from 'lucide-react';

const Markalar = ({ title = "Markalar", subtitle = "Ürün ve hizmet markalarınızı yönetin" }: any) => {
  const columns = [
    { 
      accessor: 'kod', 
      header: 'Kod', 
      style: { width: '80px' },
      render: (m: any) => (
        <span style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
          {m.kod}
        </span>
      )
    },
    { accessor: 'ad', header: 'Marka Adı', render: (m: any) => <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{m.ad}</span> },
    { 
      accessor: 'aktifMi', 
      header: 'Durum', 
      align: 'center', 
      style: { width: '100px' },
      render: (m: any) => (
        m.aktifMi 
          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '12px', fontWeight: '600' }}><Check size={12}/> Aktif</span>
          : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '12px', fontWeight: '600' }}><X size={12}/> Pasif</span>
      )
    }
  ];

  const searchableFields = ['kod', 'ad'];

  return (
    <BaseCrudPopup
      icon={<Tags size={24} />}
      title={title}
      subtitle={subtitle}
      apiEndpoint="/api/Markalar"
      columns={columns}
      searchableFields={searchableFields}
      itemNameResolver={(item: any) => item.ad}
      formComponent={MarkaFormPopup}
      modalTitlePrefix="Marka"
    />
  );
};

export default Markalar;
