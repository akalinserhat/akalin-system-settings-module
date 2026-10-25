import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BaseListPage, ActionMenu } from '@akalin/ui';
import { Truck, ShieldCheck, Edit2, Trash2 } from 'lucide-react';

export default function KargoFirmalari() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddNew = (e?: React.MouseEvent) => {
    const url = '/ayarlar/sistem-ayarlari/KargoFirmalari/yeni';
    if (e && e.shiftKey) {
      window.open(url, '_blank');
    } else {
      navigate(url, { state: { returnUrl: '/ayarlar/sistem-ayarlari/KargoFirmalari' } });
    }
  };

  const handleEdit = (item: any, e?: React.MouseEvent, targetTab = 'genel') => {
    const url = `/ayarlar/sistem-ayarlari/KargoFirmalari/duzenle/${item.id}`;
    if (e && e.shiftKey) {
      window.open(url, '_blank');
    } else {
      navigate(url, { state: { activeTab: targetTab, returnUrl: '/ayarlar/sistem-ayarlari/KargoFirmalari' } });
    }
  };

  const columns = [
    {
      header: t('auto_kargo_firmasi_adi_ee12', 'Kargo Firması Adı'),
      accessor: 'ad',
      sortable: true,
      render: (item: any) => (
        <div className="flex items-center gap-12">
          <div className="kargo-icon-box">
            <Truck size={16} />
          </div>
          <div className="font-semibold text-primary text-14">{item.ad}</div>
        </div>
      )
    },
    {
      header: t('auto_turu_tablo', 'Türü'),
      accessor: 'tip',
      render: (item: any) => (
        <span className="kargo-tip-badge">
          {item.tip}
        </span>
      )
    },
    {
      header: t('auto_iletisim_tablo', 'İletişim'),
      accessor: 'iletisim',
      render: (item: any) => (
        item.sorumluKisi ? (
          <div>
            <div className="text-primary font-medium">{item.sorumluKisi}</div>
            <div className="text-12 mt-2 text-secondary">{item.telefon}</div>
            <div className="text-12 mt-2 text-secondary">{item.adres?.ilAdi || '-'} {item.adres?.ilceAdi && `- ${item.adres.ilceAdi}`}</div>
          </div>
        ) : <span className="text-muted">-</span>
      )
    },
    {
      header: t('auto_fiyat_bolge_kurallari_kargo', 'Fiyat / Bölge Kuralları'),
      accessor: 'kurallar',
      render: (item: any) => (
        <button 
          type="button" 
          onClick={(e) => { 
            e.stopPropagation(); 
            handleEdit(item, e, 'kurallar');
          }} 
          className="kargo-rule-btn"
        >
          <ShieldCheck size={14} /> 
          {item.kuralSayisi || 0} {t('auto_kural_tanimli_kargo', 'Kural Tanımlı')}
        </button>
      )
    },
    {
      id: 'actions',
      header: '',
      width: '60px',
      render: (row: any, index: number, tableActions: any) => (
        <ActionMenu
          actions={[
            {
              label: t('auto_duzenle', 'Düzenle'),
              icon: <Edit2 size={16} />,
              onClick: (e) => tableActions?.handleEdit && tableActions.handleEdit(row, e)
            },
            {
              label: t('auto_sil', 'Sil'),
              icon: <Trash2 size={16} />,
              onClick: () => tableActions?.handleDelete && tableActions.handleDelete(row),
              danger: true
            }
          ]}
        />
      )
    }
  ];

  return (
    <BaseListPage
      title={t('auto_kargo_firmasi_yonetimi_kargo', 'Kargo Firması Yönetimi')}
      subtitle={t('auto_kargo_firmasi_aciklama_kargo', 'Farklı bölgelere, ürün gruplarına ve günlere göre fiyatlandırma motoru (Kurallar).')}
      icon={<Truck size={24} />}
      apiEndpoint="/api/KargoFirmasi"
      columns={columns}
      searchableFields={['ad', 'tip', 'sorumluKisi', 'telefon']}
      onAddNew={handleAddNew}
      onEdit={handleEdit}
      itemNameResolver={(item: any) => item.ad}
      baseRoute="/ayarlar/sistem-ayarlari/KargoFirmalari"
      refreshKey={refreshKey}
    />
  );
}
