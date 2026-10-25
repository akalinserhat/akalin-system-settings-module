import { BaseDto } from '../../../types';

export interface ParaBirimleriDto extends BaseDto {
    // TODO: Add properties
}

export interface ParaBirimleriCreateDto extends Omit<ParaBirimleriDto, 'id' | 'olusturulmaTarihi' | 'guncellenmeTarihi' | 'silindiMi'> {
    // TODO: Add properties
}

export interface ParaBirimleriUpdateDto extends Partial<ParaBirimleriCreateDto> {
    id: number;
}
