import React, { useState } from 'react';
import { Layers, Box, FileText, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@akalin/ui';
import { TabLayout } from '@akalin/ui';
import CariAyarlar from './CariAyarlar';
import UrunVeHizmetlerAyarlari from './UrunVeHizmetlerAyarlari';
import GelirGiderKartiAyarlari from './GelirGiderKartiAyarlari';
import TuketiciKredisiKartiAyarlari from './TuketiciKredisiKartiAyarlari';

const KartAyarlari = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('cari');

  const tabs = [
    { 
      id: 'cari', 
      label: t('auto_cari_hesap_kartlari_2cd5', 'Cari Hesap Kartları'), 
      icon: <Layers size={18} />,
      content: (
        <div className="fade-in" style={{ padding: '32px' }}>
          <h3 className="m-0 mb-24 text-primary">
            {t('auto_cari_hesap_ayarlari_5d5e', 'Cari Hesap Kartı Ayarları')}
          </h3>
          <CariAyarlar />
        </div>
      )
    },
    { 
      id: 'urun', 
      label: t('auto_urun_ve_hizmet_9b2d', 'Ürün ve Hizmet Kartları'), 
      icon: <Box size={18} />,
      content: (
        <div className="fade-in" style={{ padding: '32px' }}>
          <h3 className="m-0 mb-24 text-primary">
            {t('auto_urun_ve_hizmet_4a1f', 'Ürün ve Hizmet Kartı Ayarları')}
          </h3>
          <UrunVeHizmetlerAyarlari />
        </div>
      )
    },
    { 
      id: 'gelirgider', 
      label: t('auto_gelir_gider_kartlari_f1a2', 'Gelir / Gider Kartları'), 
      icon: <FileText size={18} />,
      content: (
        <div className="fade-in" style={{ padding: '32px' }}>
          <h3 className="m-0 mb-24 text-primary">
            {t('auto_gelir_gider_karti_9f2a', 'Gelir ve Gider Kartı Ayarları')}
          </h3>
          <GelirGiderKartiAyarlari />
        </div>
      )
    },
    { 
      id: 'tuketiciKredisi', 
      label: t('KartAyarlari_tabTuketiciKredisi', 'Tüketici Kredisi Kartları'), 
      icon: <Coins size={18} />,
      content: (
        <div className="fade-in" style={{ padding: '32px' }}>
          <h3 className="m-0 mb-24 text-primary">
            {t('TuketiciKredisiKartiAyarlari_baslik', 'Tüketici Kredisi Kartı Ayarları')}
          </h3>
          <TuketiciKredisiKartiAyarlari />
        </div>
      )
    }
  ];

  return (
    <div className="h-full flex flex-col flex-1 p-20">
      <div className="page-header" style={{ marginBottom: '16px', padding: '0 4px' }}>
        <div className="flex-row items-center gap-12">
          <div className="flex items-center justify-center w-40 h-40 rounded-10 bg-accent-light text-accent-primary">
            <Layers size={24} />
          </div>
          <div>
            <h2 className="text-20 font-700 text-primary m-0">{t('KartAyarlari_baslik', 'Kart Ayarları')}</h2>
            <p className="text-secondary text-14 m-0">
              {t('KartAyarlari_aciklama', 'Cari, ürün ve diğer kartlar için zorunlu alanlar ve varsayılan değerleri yapılandırın.')}
            </p>
          </div>
        </div>
      </div>

      <Card className="h-full border-0 shadow-sm" style={{ display: 'flex', flexDirection: 'column' }}>
        <TabLayout 
          tabs={tabs} 
          activeId={activeTab} 
          onChange={(id) => setActiveTab(String(id))} 
          className="h-full kart-ayarlari-tabs"
        />
      </Card>
      
      <style>{`
        .kart-ayarlari-tabs {
          display: flex;
          flex-direction: column;
        }
        .kart-ayarlari-tabs .md3-tab-header-container {
          padding: 16px 24px 0 24px;
          border-bottom: 1px solid var(--glass-border);
        }
        .kart-ayarlari-tabs .md3-tab-panel {
          flex: 1;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default KartAyarlari;
