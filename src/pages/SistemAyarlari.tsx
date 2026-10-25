/**
 * Webakus UI - Sistem Ayarları Sayfası
 * BaseSystemPage altyapısını kullanarak tüm sistem ayarlarını ve dinamik modül ayarlarını yönetir.
 * 
 * Başlıca Görevleri:
 * - Çekirdek ve dinamik ayar modüllerini BaseSystemPage ve SistemKart üzerinden açıklamalı kartlar halinde sunmak
 * - Rota parametresine (:moduleId) göre ilgili ayar bileşenini açmak
 * - /api/moduller/ayarlarim üzerinden dinamik modül ayarlarını yüklemek
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Settings, 
  Calculator, 
  Tags, 
  Layers, 
  Sliders, 
  Scale, 
  Shield, 
  FileText, 
  Vault, 
  Landmark, 
  CreditCard, 
  Coins, 
  Blocks,
  ArrowRightLeft,
  Warehouse,
  Truck,
  Users,
  Box,
  Barcode,
  Globe,
  Zap,
  Receipt
} from 'lucide-react';
import { BaseSystemPage, SystemSettingModule } from '@akalin/ui';
import { useSystemSettingModules, useModuleRegistry } from '@akalin/module_core';
import { useTranslation } from 'react-i18next';

import { KdvAyarlari } from '../subModules/VergiVeKdv';
import { ParaBirimleri } from '../subModules/ParaBirimleri';
import { KullanicilarPage } from '../subModules/KullanicilarVePersonel';
import { RolVeYetkiler } from '../subModules/RolVeYetkiler';
import { Markalar } from '../subModules/Markalar';
import { UrunGruplari } from '../subModules/UrunGruplari';
import { Birimler } from '../subModules/Birimler';
import { OzellikTanimlari } from '../subModules/OzellikTanimlari';
import { DepolarVeSubeler } from '../subModules/DepolarVeSubeler';
import { KargoFirmalari } from '../subModules/KargoFirmalari';
import { BarkodYonetimi } from '../subModules/BarkodYonetimi';
import { KasaListesiPage } from '../subModules/KasaHesaplari';
import { BankaHesaplariPage } from '../subModules/BankaHesaplari';
import { PosCihazlari } from '../subModules/PosCihazlari';
import { TuketiciKredisiFirmalari } from '../subModules/TuketiciKredisiFirmalari';
import { GelirGiderKartlariList } from '../subModules/GelirGiderKartlari';
import { BelgeAyarlari } from '../subModules/BelgeAyarlari';
import { GuvenlikAyarlari } from '../subModules/GuvenlikAyarlari';
import { KartAyarlari } from '../subModules/KartAyarlari';
import { FiyatListeTanimlariCardView } from '../subModules/FiyatListesiTanimlari';
import { UygulamaEntegrasyonlari } from '../subModules/UygulamaEntegrasyonlari';
import { MigrationHubPage } from '../subModules/VeriAktarimi';
import { GenelAyarlar } from '../subModules/GenelAyarlar';
import { CariModulAyarlari } from '@akalin/customer_module';

const coreModules: SystemSettingModule[] = [
  { 
    id: 'Genel', 
    name: 'Genel Ayarlar', 
    desc: 'Sistem genel çalışma parametreleri, firma tercihleri ve temel ayarlar',
    icon: <Settings size={24} />,
    hideHeader: true
  },
  { 
    id: 'DepolarVeSubeler', 
    name: 'Depolar ve Şubeler', 
    desc: 'İşletmenize ait fiziksel ve sanal lokasyonlar, mağaza ve depo tanımlamaları',
    icon: <Warehouse size={24} />,
    hideHeader: true 
  },
  { 
    id: 'VergiVeKDV', 
    name: 'Vergi ve KDV Ayarları', 
    desc: 'KDV oranları, tevkifat ve vergi istisnası tanımlamaları',
    icon: <Calculator size={24} />,
    hideHeader: true
  },
  { 
    id: 'ParaBirimleri', 
    name: 'Para Birimleri', 
    desc: 'Döviz kurları, aktif para birimleri ve kur güncelleme seçenekleri',
    icon: <Coins size={24} />,
    hideHeader: true
  },
  { 
    id: 'Markalar', 
    name: 'Markalar', 
    desc: 'Ürün ve hizmetlere ait üretici ve marka tanımlamaları',
    icon: <Tags size={24} />,
    hideHeader: true
  },
  { 
    id: 'UrunGruplari', 
    name: 'Ürün Grupları', 
    desc: 'Ürün kategorileri ve hiyerarşik ürün grup ağacı yönetimi',
    icon: <Layers size={24} />,
    hideHeader: true 
  },
  { 
    id: 'HizmetGruplari', 
    name: 'Hizmet Grupları', 
    desc: 'Hizmet kategorileri ve hizmet grup ağacı yönetimi',
    icon: <Layers size={24} />,
    hideHeader: true 
  },
  { 
    id: 'Birimler', 
    name: 'Birimler', 
    desc: 'Adet, kg, metre gibi temel ölçü birimleri ve çevrim oranları',
    icon: <Scale size={24} />,
    hideHeader: true
  },
  { 
    id: 'OzellikTanimlari', 
    name: 'Özellik Tanımları', 
    desc: 'Ürün ve hizmetlere özel dinamik varyant ve nitelik tanımları',
    icon: <Sliders size={24} />,
    hideHeader: true
  },
  { 
    id: 'Kullanicilar', 
    name: 'Kullanıcı ve Personel', 
    desc: 'Sistem kullanıcıları, personel hesapları, roller ve davet yönetimi',
    icon: <Users size={24} />,
    hideHeader: true
  },
  { 
    id: 'RolVeYetkiler', 
    name: 'Rol ve Yetki Yönetimi', 
    desc: 'Kullanıcı rolleri, menü izinleri ve detaylı yetkilendirme politikaları',
    icon: <Shield size={24} />,
    hideHeader: true
  },
  { 
    id: 'GuvenlikAyarlari', 
    name: 'Güvenlik Ayarları', 
    desc: 'Oturum süreleri, şifre kuralları ve hesap güvenliği politikaları',
    icon: <Shield size={24} />,
    hideHeader: true
  },
  { 
    id: 'KartAyarlari', 
    name: 'Kart Ayarları', 
    desc: 'Cari, ürün ve diğer kartlar için zorunlu alan ve varsayılan değerler',
    icon: <Layers size={24} />,
    hideHeader: true
  },
  { 
    id: 'BelgeAyarlari', 
    name: 'Belge Ayarları', 
    desc: 'Sipariş, fatura ve irsaliyeler için otomatik seri/numara ve onay kuralları',
    icon: <FileText size={24} />,
    hideHeader: true
  },
  { 
    id: 'KasaHesaplari', 
    name: 'Kasa Hesapları', 
    desc: 'Nakit kasa hesapları, devir bakiyeleri ve kasa hareket yönetimi',
    icon: <Vault size={24} />,
    hideHeader: true
  },
  { 
    id: 'BankaHesaplari', 
    name: 'Banka Hesapları', 
    desc: 'Vadesiz, vadeli ve ticari banka hesapları ile IBAN tanımlamaları',
    icon: <Landmark size={24} />,
    hideHeader: true,
    aliases: ['banka-hesaplari', 'Bankalar', 'bankalar', 'banka-hesap', 'BankaTanimlari']
  },
  { 
    id: 'PosCihazlari', 
    name: 'POS Cihazları', 
    desc: 'Fiziksel ve sanal POS cihazları ile banka pos anlaşmaları',
    icon: <CreditCard size={24} />,
    hideHeader: true
  },
  { 
    id: 'TuketiciKredisiFirmalari', 
    name: 'Tüketici Kredisi Firmaları', 
    desc: 'Anlaşmalı tüketici finansman ve kredi kuruluşları yönetimi',
    icon: <Coins size={24} />,
    hideHeader: true
  },
  { 
    id: 'GelirGiderKartlari', 
    name: 'Gelir / Gider Kartları', 
    desc: 'İşletme masraf, genel gider ve ek gelir kalemlerinin tanımlari',
    icon: <FileText size={24} />,
    hideHeader: true
  },
  { 
    id: 'FiyatListesiTanimlari', 
    name: 'Fiyat Listesi Tanımları', 
    desc: 'Toptan, perakende ve özel müşteri fiyat listesi şablonları',
    icon: <Tags size={24} />,
    hideHeader: true
  },
  { 
    id: 'KargoFirmalari', 
    name: 'Kargo Firmaları', 
    desc: 'Anlaşmalı kargo firmaları, kargo entegrasyonları ve kural tanımları',
    icon: <Truck size={24} />,
    hideHeader: true 
  },
  { 
    id: 'UygulamaEntegrasyonlari', 
    name: 'Uygulama Entegrasyonları', 
    desc: 'E-Dönüşüm (e-Fatura, e-İrsaliye), SMS, kargo ve harici servisler',
    icon: <Blocks size={24} />,
    hideHeader: true
  },
  { 
    id: 'VeriAktarimi', 
    name: 'Veri Aktarım Merkezi', 
    desc: 'Excel veya eski muhasebe yazılımlarından toplu cari ve ürün verilerini aktarın',
    icon: <ArrowRightLeft size={24} />,
    hideHeader: true
  }
];

const MODULE_REQUIREMENT_MAP: Record<string, string> = {
  'VeriAktarimi': 'MOD_VERI_AKTARIMI',
  'DepolarVeSubeler': 'MOD_DEPO_SUBE',
  'KargoFirmalari': 'MOD_KARGO',
};

const getSettingIconComponent = (iconName?: string, size = 24): React.ReactNode => {
  const icons: Record<string, React.ReactNode> = {
    Settings: <Settings size={size} />,
    Calculator: <Calculator size={size} />,
    Tags: <Tags size={size} />,
    Layers: <Layers size={size} />,
    Sliders: <Sliders size={size} />,
    Scale: <Scale size={size} />,
    Shield: <Shield size={size} />,
    FileText: <FileText size={size} />,
    Vault: <Vault size={size} />,
    Landmark: <Landmark size={size} />,
    CreditCard: <CreditCard size={size} />,
    Coins: <Coins size={size} />,
    Blocks: <Blocks size={size} />,
    ArrowRightLeft: <ArrowRightLeft size={size} />,
    Warehouse: <Warehouse size={size} />,
    Truck: <Truck size={size} />,
    Users: <Users size={size} />,
    Box: <Box size={size} />,
    Barcode: <Barcode size={size} />,
    Globe: <Globe size={size} />,
    Zap: <Zap size={size} />,
    Receipt: <Receipt size={size} />
  };
  return (iconName && icons[iconName]) || <Box size={size} />;
};

const SistemAyarlari = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { registry } = useModuleRegistry();
  const [dinamikAyarlar, setDinamikAyarlar] = useState<SystemSettingModule[]>([]);
  const registeredSettingModules = useSystemSettingModules();

  const componentMap: Record<string, React.ReactNode> = {
    'DepolarVeSubeler': <DepolarVeSubeler />,
    'KargoFirmalari': <KargoFirmalari />,
    'BarkodYonetimi': <BarkodYonetimi />,
    'CariModulAyarlari': <CariModulAyarlari />
  };

  useEffect(() => {
    axios.get('/api/moduller/ayarlarim')
      .then(res => {
        const apiSettings = res.data.map((ayar: any) => ({
          id: ayar.id,
          name: ayar.baslik,
          desc: ayar.aciklama || ayar.altBaslik || `${ayar.baslik} modülüne ait yapılandırma ve parametreler`,
          icon: getSettingIconComponent(ayar.ikon, 24),
          bilesenId: ayar.bilesenId,
          hideHeader: true
        }));
        setDinamikAyarlar(apiSettings);
      })
      .catch(err => console.error('Dinamik ayarlar alınamadı', err));
  }, []);

  const renderModuleContent = (mod: SystemSettingModule) => {
    let content: React.ReactNode = null;

    if (mod.id === 'DepolarVeSubeler' || mod.bilesenId === 'DepolarVeSubeler') content = <DepolarVeSubeler />;
    else if (mod.id === 'CariModulAyarlari' || mod.bilesenId === 'CariModulAyarlari') {
      return (
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          <CariModulAyarlari />
        </div>
      );
    }
    else if (mod.id === 'VergiVeKDV') content = <KdvAyarlari />;
    else if (mod.id === 'ParaBirimleri') content = <ParaBirimleri />;
    else if (mod.id === 'UygulamaEntegrasyonlari') {
      return (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <UygulamaEntegrasyonlari />
        </div>
      );
    }
    else if (mod.id === 'VeriAktarimi') return <MigrationHubPage />;
    else if (mod.id === 'BelgeAyarlari') content = <BelgeAyarlari />;
    else if (mod.id === 'GuvenlikAyarlari') content = <GuvenlikAyarlari />;
    else if (mod.id === 'Markalar') content = <Markalar />;
    else if (mod.id === 'UrunGruplari') content = <UrunGruplari tur={1} />;
    else if (mod.id === 'HizmetGruplari') content = <UrunGruplari tur={2} />;
    else if (mod.id === 'Birimler') content = <Birimler />;
    else if (mod.id === 'OzellikTanimlari') content = <OzellikTanimlari />;
    else if (mod.id === 'KasaHesaplari') content = <KasaListesiPage />;
    else if (mod.id === 'BankaHesaplari') content = <BankaHesaplariPage />;
    else if (mod.id === 'PosCihazlari') content = <PosCihazlari />;
    else if (mod.id === 'TuketiciKredisiFirmalari') content = <TuketiciKredisiFirmalari />;
    else if (mod.id === 'GelirGiderKartlari') content = <GelirGiderKartlariList />;
    else if (mod.id === 'FiyatListesiTanimlari') content = <FiyatListeTanimlariCardView />;
    else if (mod.id === 'RolVeYetkiler') content = <RolVeYetkiler />;
    else if (mod.id === 'Kullanicilar' || mod.id === 'KullanicilarVePersonel') content = <KullanicilarPage />;
    else if (mod.id === 'KargoFirmalari' || mod.bilesenId === 'KargoFirmalari') content = <KargoFirmalari />;
    else if (mod.id === 'Genel') {
      return (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <GenelAyarlar />
        </div>
      );
    }
    else if (mod.bilesenId && componentMap[mod.bilesenId]) content = componentMap[mod.bilesenId];

    if (!content) {
      return (
        <div className="surface-card p-24 text-center text-secondary rounded-16">
          {t('auto_bu_modul_icin_henuz_bir_ayar_tanimlanmadi', 'Bu modül için henüz bir ayar tanımlanmadı.')}
        </div>
      );
    }

    // Eğer modül BaseListPage tabanlı bir liste ise doğrudan render et (çünkü BaseListPage artık kendi surface-card penceresini ve başlığını yönetmektedir)
    const listBasedModules = [
      'DepolarVeSubeler', 'VergiVeKDV', 'ParaBirimleri', 'Markalar', 
      'Birimler', 'OzellikTanimlari', 'KasaHesaplari', 'BankaHesaplari', 
      'PosCihazlari', 'TuketiciKredisiFirmalari', 'GelirGiderKartlari', 'RolVeYetkiler',
      'Kullanicilar', 'KullanicilarVePersonel',
      'FiyatListesiTanimlari', 'UrunGruplari', 'HizmetGruplari', 'BarkodYonetimi', 'KargoFirmalari'
    ];

    if (listBasedModules.includes(mod.id)) {
      return (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {content}
        </div>
      );
    }

    return (
      <div className="surface-card p-0 flex flex-col flex-1 min-h-0 overflow-y-auto rounded-16">
        <div className="settings-group-content flex-1">
          {content}
        </div>
      </div>
    );
  };

  const modules = useMemo(() => {
    const filteredCore = coreModules.filter(m => {
      const requiredMod = MODULE_REQUIREMENT_MAP[m.id];
      if (requiredMod) {
        return registry.isModuleActive({ id: requiredMod, defaultActive: false } as any);
      }
      return true;
    });
    return [...filteredCore, ...(registeredSettingModules as unknown as SystemSettingModule[]), ...dinamikAyarlar];
  }, [registry, registeredSettingModules, dinamikAyarlar]);

  return (
    <BaseSystemPage
      title={t('auto_sistem_ayarlari_93b5') || "Sistem Ayarları"}
      subtitle={t('auto_kurumunuzun_ve_modul_cc76') || "Kurumunuzun ve modüllerinizin tüm sistem ayarlarını buradan yapılandırabilirsiniz."}
      baseRoute="/ayarlar/sistem-ayarlari"
      modules={modules}
      renderModuleContent={renderModuleContent}
    />
  );
};

export default SistemAyarlari;
