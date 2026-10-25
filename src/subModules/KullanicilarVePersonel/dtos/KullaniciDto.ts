import { BaseDto } from '../../../types';

export interface KullaniciDto extends BaseDto {
  id: number;
  adSoyad: string;
  ad?: string;
  soyad?: string;
  email: string;
  telefon?: string;
  rolId: number;
  rolAd: string;
  lokasyonIds: number[];
  lokasyonAdlari?: string[];
  sonGiris?: string | null;
  aktifMi: boolean;
  eklenmeTarihi?: string;
}

export interface KullaniciCreateDto {
  adSoyad: string;
  email: string;
  telefon?: string;
  sifre?: string;
  rolId: number;
  lokasyonIds?: number[];
  aktifMi?: boolean;
}

export interface KullaniciUpdateDto {
  adSoyad: string;
  email: string;
  telefon?: string;
  sifre?: string;
  rolId: number;
  lokasyonIds?: number[];
  aktifMi?: boolean;
}

export interface RolDto {
  id: number;
  ad: string;
  aciklama?: string;
}

export interface LokasyonDto {
  id: number;
  ad: string;
  tip: string;
}

export interface FirmaDavetGonderDto {
  email: string;
  rol?: string;
  roller: string[];
}

export interface FirmaDavetListDto {
  id: number;
  firmaId: number;
  email: string;
  rol: string;
  roller?: string[];
  gecerlilikTarihi: string;
  kullanildiMi: boolean;
  kullanilmaTarihi?: string | null;
  olusturulmaTarihi: string;
  davetEdenKullanici?: string | null;
}

