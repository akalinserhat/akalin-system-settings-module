import { BaseDto } from '../../../types';

export interface TanimlarDto extends BaseDto {
    // TODO: Add properties
}

export interface TanimlarCreateDto extends Omit<TanimlarDto, 'id' | 'olusturulmaTarihi' | 'guncellenmeTarihi' | 'silindiMi'> {
    // TODO: Add properties
}

export interface TanimlarUpdateDto extends Partial<TanimlarCreateDto> {
    id: number;
}
