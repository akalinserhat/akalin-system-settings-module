import { BaseDto } from '../../../types';

export interface FirmaAyarlariDto extends BaseDto {
    // TODO: Add properties
}

export interface FirmaAyarlariCreateDto extends Omit<FirmaAyarlariDto, 'id' | 'olusturulmaTarihi' | 'guncellenmeTarihi' | 'silindiMi'> {
    // TODO: Add properties
}

export interface FirmaAyarlariUpdateDto extends Partial<FirmaAyarlariCreateDto> {
    id: number;
}
