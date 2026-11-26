/**
 * @akalin/system_settings_module - Banka Ayarları Bileşeni (BankaAyarlari.tsx)
 * Banka Hesapları ve POS Tanımları bölümlerini "Banka" üst başlığı altında BaseSystemPage şablonunda sunar.
 */

import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Landmark, CreditCard } from 'lucide-react';
import { BaseSystemPage, SystemSettingModule } from '@akalin/ui';
import { PosCihazlari } from '@akalin/bank_module';
import BankaHesaplariPage from './BankaHesaplariPage';

const BankaAyarlari: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId?: string }>();

  const queryCategory = searchParams.get('kategori');

  const selectedCategory = useMemo(() => {
    if (queryCategory) return queryCategory;
    if (moduleId === 'BankaHesaplari' || moduleId === 'banka-hesaplari') return 'banka-hesaplari';
    if (
      moduleId === 'PosCihazlari' ||
      moduleId === 'pos-cihazlari' ||
      moduleId === 'PosTanimlari' ||
      moduleId === 'pos-tanimlari'
    ) {
      return 'pos-tanimlari';
    }
    return null;
  }, [queryCategory, moduleId]);

  const handleBack = useCallback(() => {
    if (selectedCategory) {
      if (!moduleId || moduleId === 'Banka' || moduleId === 'banka') {
        setSearchParams({});
      } else {
        navigate('/ayarlar/sistem-ayarlari/Banka');
      }
    } else {
      navigate('/ayarlar/sistem-ayarlari');
    }
  }, [selectedCategory, moduleId, setSearchParams, navigate]);

  const handleModuleClick = useCallback(
    (id: string) => {
      if (moduleId && moduleId !== 'Banka' && moduleId !== 'banka') {
        navigate(`/ayarlar/sistem-ayarlari/Banka?kategori=${id}`);
      } else {
        setSearchParams({ kategori: id });
      }
    },
    [moduleId, navigate, setSearchParams]
  );

  const modules: SystemSettingModule[] = useMemo(
    () => [
      {
        id: 'banka-hesaplari',
        name: t('BankaHesaplari_baslik', 'Banka Hesapları'),
        desc: t(
          'BankaHesaplari_aciklama',
          'Vadesiz, vadeli ve ticari banka hesapları ile IBAN tanımlamaları'
        ),
        icon: <Landmark size={24} />,
        hideHeader: true,
        hasOwnLayout: true,
        component: (
          <BankaHesaplariPage
            showBackButton={false}
            headerSync={false}
            backRoute="/ayarlar/sistem-ayarlari/Banka"
            onBack={handleBack}
          />
        ),
      },
      {
        id: 'pos-tanimlari',
        name: t('PosTanimlari_baslik', 'POS Tanımları'),
        desc: t(
          'PosTanimlari_aciklama',
          'Fiziksel ve sanal POS cihazları ile banka POS anlaşmaları'
        ),
        icon: <CreditCard size={24} />,
        hideHeader: true,
        hasOwnLayout: true,
        component: (
          <PosCihazlari
            showBackButton={false}
            headerSync={false}
            backRoute="/ayarlar/sistem-ayarlari/Banka"
            onBack={handleBack}
          />
        ),
      },
    ],
    [t, handleBack]
  );

  return (
    <BaseSystemPage
      title={t('Banka_baslik', 'Banka')}
      subtitle={t('Banka_aciklama', 'Banka hesapları, IBAN tanımlamaları ve POS cihazı anlaşmaları')}
      baseRoute="/ayarlar/sistem-ayarlari/Banka"
      backRoute="/ayarlar/sistem-ayarlari"
      modules={modules}
      selectedModuleId={selectedCategory}
      onModuleClick={handleModuleClick}
      onBack={handleBack}
      showBackButton={true}
    />
  );
};

export default BankaAyarlari;
