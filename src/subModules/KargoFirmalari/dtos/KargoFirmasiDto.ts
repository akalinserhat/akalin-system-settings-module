import { BaseDto } from '../../../types';

export interface KargoFirmasiDto extends BaseDto {
    ad?: string;
    tip?: string;
    sorumluKisi?: string;
    telefon?: string;
    eposta?: string;
    adres?: any;
    kuralSayisi?: number;
}

export interface KargoFirmasiCreateDto extends Omit<KargoFirmasiDto, 'id' | 'olusturulmaTarihi' | 'guncellenmeTarihi' | 'silindiMi'> {
}

export interface KargoFirmasiUpdateDto extends Partial<KargoFirmasiCreateDto> {
    id: number;
}
