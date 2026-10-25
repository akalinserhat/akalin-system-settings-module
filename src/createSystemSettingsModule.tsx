import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { type IModuleDefinition } from '@akalin/module_core';
import { SystemSettingsServiceProvider, type SystemSettingsServiceContextValue } from './adapters/SystemSettingsServiceContext';
import { MetadataProvider } from './context/MetadataContext';

export interface CreateSystemSettingsModuleOptions {
  id?: string;
  appName?: string;
  baseRoute?: string;
  order?: number;
  serviceContext?: SystemSettingsServiceContextValue;
}

export const SistemAyarlariPage = lazy(() => import('./pages/SistemAyarlari'));
export const KullanicilarPage = lazy(() => import('./subModules/KullanicilarVePersonel').then(m => ({ default: m.KullanicilarPage })));
export const PersonelDavetPage = lazy(() => import('./subModules/KullanicilarVePersonel').then(m => ({ default: m.PersonelDavetPage })));
export const PersonelFormPage = lazy(() => import('./subModules/KullanicilarVePersonel').then(m => ({ default: m.PersonelFormPage })));
export const KargoFirmalariPage = lazy(() => import('./subModules/KargoFirmalari').then(m => ({ default: m.KargoFirmalari })));
export const KargoFirmasiFormPage = lazy(() => import('./subModules/KargoFirmalari').then(m => ({ default: m.KargoFirmasiFormPage })));
export const GelirGiderKartiFormPage = lazy(() => import('./subModules/GelirGiderKartlari').then(m => ({ default: m.GelirGiderKartiFormPage })));
export const KdvFormPage = lazy(() => import('./subModules/VergiVeKdv').then(m => ({ default: m.KdvFormPage })));
export const PosCihazFormPage = lazy(() => import('./subModules/PosCihazlari').then(m => ({ default: m.PosCihazFormPage })));
export const PosKomisyonBelgesiFormPage = lazy(() => import('./subModules/PosCihazlari').then(m => ({ default: m.PosKomisyonBelgesiFormPage })));
export const TuketiciKredisiFirmasiFormPage = lazy(() => import('./subModules/TuketiciKredisiFirmalari').then(m => ({ default: m.TuketiciKredisiFirmasiFormPage })));
export const TuketiciKredisiKomisyonBelgesiFormPage = lazy(() => import('./subModules/TuketiciKredisiFirmalari').then(m => ({ default: m.TuketiciKredisiKomisyonBelgesiFormPage })));
export const FiyatListesiTanimFormPage = lazy(() => import('./subModules/FiyatListesiTanimlari').then(m => ({ default: m.FiyatListesiTanimFormPage })));
export const KasaListesiPage = lazy(() => import('./subModules/KasaHesaplari').then(m => ({ default: m.KasaListesiPage })));
export const BankaHesaplariPage = lazy(() => import('./subModules/BankaHesaplari').then(m => ({ default: m.BankaHesaplariPage })));
export const MigrationHubPage = lazy(() => import('./subModules/VeriAktarimi').then(m => ({ default: m.MigrationHubPage })));
export const DepoFormPage = lazy(() => import('./subModules/DepolarVeSubeler').then(m => ({ default: m.DepoFormPage })));
export const UrunGrupFormPage = lazy(() => import('./subModules/UrunGruplari/pages/UrunGrupFormPage'));

export const createSystemSettingsModule = (
  options: CreateSystemSettingsModuleOptions = {}
): IModuleDefinition => {
  const {
    id = 'sistem-ayarlari',
    order = 80,
    serviceContext
  } = options;

  const withProvider = (Component: React.ComponentType<any>) => {
    return (props: any) => (
      <SystemSettingsServiceProvider value={serviceContext}>
        <MetadataProvider>
          <Component {...props} />
        </MetadataProvider>
      </SystemSettingsServiceProvider>
    );
  };

  return {
    id,
    title: 'Sistem Ayarları',
    icon: React.createElement(Settings, { size: 20 }),
    iconName: 'Settings',
    order,
    isCore: true,
    routes: [
      { path: '/ayarlar/sistem-ayarlari', element: React.createElement(withProvider(SistemAyarlariPage)), title: 'Sistem Ayarları' },
      { path: '/ayarlar/sistem-ayarlari/:moduleId', element: React.createElement(withProvider(SistemAyarlariPage)), title: 'Sistem Ayarları' },
      { path: '/ayarlar/depolar', element: React.createElement(Navigate, { to: '/ayarlar/sistem-ayarlari/DepolarVeSubeler', replace: true }), title: 'Depolar ve Şubeler' },
      { path: '/ayarlar/depolar/yeni', element: React.createElement(withProvider(DepoFormPage)), title: 'Yeni Depo Tanımı' },
      { path: '/ayarlar/depolar/:id', element: React.createElement(withProvider(DepoFormPage)), title: 'Depo Tanımı Düzenle' },
      { path: '/ayarlar/kullanicilar', element: React.createElement(Navigate, { to: '/ayarlar/sistem-ayarlari/Kullanicilar', replace: true }), title: 'Kullanıcı ve Personel' },
      { path: '/ayarlar/kullanicilar/yeni', element: React.createElement(withProvider(PersonelDavetPage)), title: 'Personel Davet Et' },
      { path: '/ayarlar/kullanicilar/:id', element: React.createElement(withProvider(PersonelFormPage)), title: 'Kullanıcı Düzenle' },
      { path: '/ayarlar/sistem-ayarlari/Kullanicilar/yeni', element: React.createElement(withProvider(PersonelDavetPage)), title: 'Personel Davet Et' },
      { path: '/ayarlar/sistem-ayarlari/Kullanicilar/:id', element: React.createElement(withProvider(PersonelFormPage)), title: 'Kullanıcı Düzenle' },
      { path: '/ayarlar/kargo-firmalari', element: React.createElement(Navigate, { to: '/ayarlar/sistem-ayarlari/KargoFirmalari', replace: true }), title: 'Kargo Firmaları' },
      { path: '/ayarlar/kargo-firmalari/yeni', element: React.createElement(Navigate, { to: '/ayarlar/sistem-ayarlari/KargoFirmalari/yeni', replace: true }), title: 'Yeni Kargo Firması' },
      { path: '/ayarlar/kargo-firmalari/duzenle/:id', element: React.createElement(withProvider(KargoFirmasiFormPage)), title: 'Kargo Firması Düzenle' },
      { path: '/ayarlar/kargo-firmalari/:id', element: React.createElement(withProvider(KargoFirmasiFormPage)), title: 'Kargo Firması Düzenle' },
      { path: '/ayarlar/sistem-ayarlari/KargoFirmalari/yeni', element: React.createElement(withProvider(KargoFirmasiFormPage)), title: 'Yeni Kargo Firması' },
      { path: '/ayarlar/sistem-ayarlari/KargoFirmalari/duzenle/:id', element: React.createElement(withProvider(KargoFirmasiFormPage)), title: 'Kargo Firması Düzenle' },
      { path: '/ayarlar/sistem-ayarlari/KargoFirmalari/:id', element: React.createElement(withProvider(KargoFirmasiFormPage)), title: 'Kargo Firması Düzenle' },
      { path: '/ayarlar/sistem-ayarlari/gelirgider/yeni', element: React.createElement(withProvider(GelirGiderKartiFormPage)), title: 'Yeni Gelir/Gider Kartı' },
      { path: '/ayarlar/sistem-ayarlari/gelirgider/duzenle/:id', element: React.createElement(withProvider(GelirGiderKartiFormPage)), title: 'Gelir/Gider Kartı Düzenle' },
      { path: '/ayarlar/sistem-ayarlari/VergiVeKDV/yeni', element: React.createElement(withProvider(KdvFormPage)), title: 'Yeni KDV Tanımı' },
      { path: '/ayarlar/sistem-ayarlari/VergiVeKDV/duzenle/:id', element: React.createElement(withProvider(KdvFormPage)), title: 'KDV Tanımı Düzenle' },
      { path: '/ayarlar/sistem-ayarlari/PosCihazlari/yeni', element: React.createElement(withProvider(PosCihazFormPage)), title: 'Yeni POS Cihazı' },
      { path: '/ayarlar/sistem-ayarlari/PosCihazlari/duzenle/:id', element: React.createElement(withProvider(PosCihazFormPage)), title: 'POS Cihazı Düzenle' },
      { path: '/ayarlar/sistem-ayarlari/PosCihazlari/:posCihazId/komisyon-belgeleri/yeni', element: React.createElement(withProvider(PosKomisyonBelgesiFormPage)), title: 'Yeni POS Komisyon Belgesi' },
      { path: '/ayarlar/sistem-ayarlari/PosCihazlari/:posCihazId/komisyon-belgeleri/duzenle/:id', element: React.createElement(withProvider(PosKomisyonBelgesiFormPage)), title: 'POS Komisyon Belgesi Düzenle' },
      { path: '/ayarlar/sistem-ayarlari/TuketiciKredisiFirmalari/yeni', element: React.createElement(withProvider(TuketiciKredisiFirmasiFormPage)), title: 'Yeni Tüketici Kredisi Firması' },
      { path: '/ayarlar/sistem-ayarlari/TuketiciKredisiFirmalari/duzenle/:id', element: React.createElement(withProvider(TuketiciKredisiFirmasiFormPage)), title: 'Tüketici Kredisi Firması Düzenle' },
      { path: '/ayarlar/sistem-ayarlari/TuketiciKredisiFirmalari/:tuketiciKredisiFirmasiId/komisyon-belgeleri/yeni', element: React.createElement(withProvider(TuketiciKredisiKomisyonBelgesiFormPage)), title: 'Yeni Komisyon Belgesi' },
      { path: '/ayarlar/sistem-ayarlari/TuketiciKredisiFirmalari/:tuketiciKredisiFirmasiId/komisyon-belgeleri/duzenle/:id', element: React.createElement(withProvider(TuketiciKredisiKomisyonBelgesiFormPage)), title: 'Komisyon Belgesi Düzenle' },
      { path: '/ayarlar/sistem-ayarlari/fiyat-listesi-tanimlari/yeni', element: React.createElement(withProvider(FiyatListesiTanimFormPage)), title: 'Yeni Fiyat Listesi Tanımı' },
      { path: '/ayarlar/sistem-ayarlari/fiyat-listesi-tanimlari/duzenle/:id', element: React.createElement(withProvider(FiyatListesiTanimFormPage)), title: 'Fiyat Listesi Tanımı Düzenle' },
      { path: '/finans/kasalar/liste', element: React.createElement(withProvider(KasaListesiPage)), title: 'Kasa Listesi' },
      { path: '/ayarlar/bankalar/hesaplar', element: React.createElement(withProvider(BankaHesaplariPage)), title: 'Banka Hesapları' },
      { path: '/ayarlar/veri-aktarimi', element: React.createElement(withProvider(MigrationHubPage)), title: 'Veri Aktarım Merkezi' },
      { path: '/araclar/veri-aktarimi', element: React.createElement(withProvider(MigrationHubPage)), title: 'Veri Aktarım Merkezi' },
      { path: '/urun-gruplari/yeni', element: React.createElement(withProvider(UrunGrupFormPage)), title: 'Yeni Ürün Grubu' },
      { path: '/urun-gruplari/duzenle/:id', element: React.createElement(withProvider(UrunGrupFormPage)), title: 'Ürün Grubu Düzenle' },
      { path: '/urun-gruplari/:id', element: React.createElement(withProvider(UrunGrupFormPage)), title: 'Ürün Grubu' },
      { path: '/ayarlar/sistem-ayarlari/UrunGruplari/yeni', element: React.createElement(withProvider(UrunGrupFormPage)), title: 'Yeni Ürün Grubu' },
      { path: '/ayarlar/sistem-ayarlari/UrunGruplari/duzenle/:id', element: React.createElement(withProvider(UrunGrupFormPage)), title: 'Ürün Grubu Düzenle' },
      { path: '/ayarlar/sistem-ayarlari/HizmetGruplari/yeni', element: React.createElement(withProvider(UrunGrupFormPage)), title: 'Yeni Hizmet Grubu' },
      { path: '/ayarlar/sistem-ayarlari/HizmetGruplari/duzenle/:id', element: React.createElement(withProvider(UrunGrupFormPage)), title: 'Hizmet Grubu Düzenle' }
    ],
    popupRoutes: [
      { path: 'urun-gruplari/form', element: React.createElement(withProvider(UrunGrupFormPage)), title: 'Ürün Grubu Tanımı', isPopup: true }
    ],
    menuItems: [
      {
        id: 'sistem-ayarlari-item',
        label: 'Sistem Ayarları',
        path: '/ayarlar/sistem-ayarlari',
        icon: React.createElement(Settings, { size: 20 }),
        order: 80
      }
    ]
  };
};

export const SistemAyarlariModule = createSystemSettingsModule();

export default SistemAyarlariModule;
