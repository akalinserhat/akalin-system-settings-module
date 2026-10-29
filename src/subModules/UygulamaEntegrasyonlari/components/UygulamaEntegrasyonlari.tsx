import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Cloud, Sparkles } from 'lucide-react';
import { BaseSystemPage, SystemSettingModule } from '@akalin/ui';
import { BulutDepolamaAyarlari } from '@akalin/file_manager_module';
import LlmEntegrasyonAyarlari from './LlmEntegrasyonAyarlari';

const UygulamaEntegrasyonlari: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedCategory = searchParams.get('kategori');

  const handleBack = React.useCallback(() => {
    if (selectedCategory) {
      setSearchParams({});
    } else {
      navigate('/ayarlar/sistem-ayarlari');
    }
  }, [selectedCategory, setSearchParams, navigate]);

  const modules: SystemSettingModule[] = useMemo(() => [
    { 
      id: 'bulut-depolama', 
      name: t('BulutDepolama_baslik', 'Bulut Depolama Ayarları'), 
      desc: t('BulutDepolama_aciklama', 'Dosyalarınızı kendi bulut sürücülerinizde (Google Drive, OneDrive vb.) saklayın.'),
      icon: <Cloud size={24} />,
      component: (
        <BulutDepolamaAyarlari 
          onBack={handleBack} 
          backRoute="/ayarlar/sistem-ayarlari/UygulamaEntegrasyonlari" 
          showBackButton={false}
        />
      ),
      hideHeader: true
    },
    { 
      id: 'llm-entegrasyon', 
      name: t('AiKullanim_baslik', 'Yapay Zeka & Akıllı Asistan Yönetimi'), 
      desc: t('AiKullanim_aciklama', 'Webakus AI akıllı asistanları, kalan token kredisi ve kullanım istatistikleri.'),
      icon: <Sparkles size={24} />,
      component: <LlmEntegrasyonAyarlari hideHeader={true} />
    }
  ], [t, handleBack]);

  return (
    <BaseSystemPage
      title={t('Entegrasyonlar_baslik', 'Uygulama Entegrasyonları')}
      subtitle={t('Entegrasyonlar_aciklama', 'Webakus\'u harici servisler ve bulut uygulamaları ile bağlayın.')}
      baseRoute="/ayarlar/sistem-ayarlari/UygulamaEntegrasyonlari"
      backRoute="/ayarlar/sistem-ayarlari"
      modules={modules}
      selectedModuleId={selectedCategory || null}
      onModuleClick={(moduleId) => setSearchParams({ kategori: moduleId })}
      onBack={handleBack}
      showBackButton={true}
    />
  );
};

export default UygulamaEntegrasyonlari;
