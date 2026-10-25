/**
 * @file index.ts
 * @description @akalin/system_settings_module ana giriş ve dışa aktarım noktası.
 * Webakus ERP ekosistemi için bağımsız, modüler Sistem Ayarları Yönetim Paketi.
 */

// Tipler ve DTO'lar
export * from './types';

// Servis Altyapısı ve Adaptörler
export * from './services/httpClient';
export * from './services/BaseService';
export * from './adapters/SystemSettingsServiceContext';
export * from './context/MetadataContext';
export * from './utils/windowUtils';
export * from './hooks/useAppBreadcrumbs';

// SubModules - Genel Ayarlar
export * from './subModules/GenelAyarlar';
export * from './subModules/GenelAyarlar/services/SystemSettingsService';
export * from './subModules/GenelAyarlar/services/FirmaAyarlariService';
export * from './subModules/GenelAyarlar/services/FaaliyetAlaniService';
export * from './subModules/GenelAyarlar/services/MetadataService';
export * from './subModules/GenelAyarlar/services/ModullerService';
export * from './subModules/GenelAyarlar/services/StorageService';
export * from './subModules/GenelAyarlar/services/TanimlarService';

// SubModules - Belge Ayarları
export * from './subModules/BelgeAyarlari';
export * from './subModules/BelgeAyarlari/services/BelgeAyarlariService';

// SubModules - Vergi ve KDV
export * from './subModules/VergiVeKdv';
export * from './subModules/VergiVeKdv/services/KdvGruplariService';

// SubModules - Para Birimleri
export * from './subModules/ParaBirimleri';
export * from './subModules/ParaBirimleri/services/ParaBirimleriService';

// SubModules - Kargo Firmaları
export * from './subModules/KargoFirmalari';
export * from './subModules/KargoFirmalari/services/KargoFirmasiService';

// SubModules - POS Cihazları
export * from './subModules/PosCihazlari';

// SubModules - Tüketici Kredisi Firmaları
export * from './subModules/TuketiciKredisiFirmalari';

// SubModules - Gelir Gider Kartları
export * from './subModules/GelirGiderKartlari';

// SubModules - Güvenlik Ayarları
export * from './subModules/GuvenlikAyarlari';

// SubModules - Kart Ayarları
export * from './subModules/KartAyarlari';

// SubModules - Kullanıcılar ve Personel
export * from './subModules/KullanicilarVePersonel';
export * from './subModules/KullanicilarVePersonel/services/KullanicilarService';

// SubModules - Uygulama Entegrasyonları
export * from './subModules/UygulamaEntegrasyonlari';

// SubModules - Veri Aktarımı
export * from './subModules/VeriAktarimi';
export * from './subModules/VeriAktarimi/services/MigrationService';

// SubModules - Depolar ve Şubeler
export * from './subModules/DepolarVeSubeler';
export * from './subModules/DepolarVeSubeler/services/SubelerService';

// SubModules - Finans & Kart Entegrasyonları (Kasa, Banka, Markalar, Birimler, vb.)
export * from './subModules/KasaHesaplari';
export * from './subModules/BankaHesaplari';
export * from './subModules/BarkodYonetimi';
export * from './subModules/RolVeYetkiler';
export * from './subModules/Markalar';
export * from './subModules/Birimler';
export * from './subModules/OzellikTanimlari';
export * from './subModules/UrunGruplari';
export * from './subModules/FiyatListesiTanimlari';

// Sayfalar
export { default as SistemAyarlariPage } from './pages/SistemAyarlari';

// Modül Tanımı ve Fabrika Fonksiyonu
export * from './createSystemSettingsModule';
export { SistemAyarlariModule as default } from './createSystemSettingsModule';
