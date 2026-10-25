import { BaseDto } from '../../../types';

export interface BelgeAyarlariDto extends BaseDto {
    // TODO: Add properties
}

export interface BelgeAyarlariCreateDto extends Omit<BelgeAyarlariDto, 'id' | 'olusturulmaTarihi' | 'guncellenmeTarihi' | 'silindiMi'> {
    // TODO: Add properties
}

export interface BelgeAyarlariUpdateDto extends Partial<BelgeAyarlariCreateDto> {
    id: number;
}
