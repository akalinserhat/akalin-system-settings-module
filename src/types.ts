export interface BaseDto {
    id: number | string;
    olusturulmaTarihi?: string;
    guncellenmeTarihi?: string;
    silindiMi?: boolean;
}

export * from './subModules/BelgeAyarlari/dtos/BelgeAyarlariDto';
export * from './subModules/GenelAyarlar/dtos/FaaliyetAlaniDto';
export * from './subModules/GenelAyarlar/dtos/FirmaAyarlariDto';
export * from './subModules/GenelAyarlar/dtos/MetadataDto';
export * from './subModules/GenelAyarlar/dtos/ModullerDto';
export * from './subModules/GenelAyarlar/dtos/StorageDto';
export * from './subModules/GenelAyarlar/dtos/SystemSettingsDto';
export * from './subModules/GenelAyarlar/dtos/TanimlarDto';
export * from './subModules/KargoFirmalari/dtos/KargoFirmasiDto';
export * from './subModules/KullanicilarVePersonel/dtos/KullaniciDto';
export * from './subModules/ParaBirimleri/dtos/ParaBirimleriDto';
export * from './subModules/VergiVeKdv/dtos/KdvGruplariDto';
export * from './subModules/VeriAktarimi/dtos/MigrationDtos';
