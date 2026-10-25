import { BaseDto } from '../../../types';

export interface SubelerDto extends BaseDto {
    // TODO: Add properties
}

export interface SubelerCreateDto extends Omit<SubelerDto, 'id' | 'olusturulmaTarihi' | 'guncellenmeTarihi' | 'silindiMi'> {
    // TODO: Add properties
}

export interface SubelerUpdateDto extends Partial<SubelerCreateDto> {
    id: number;
}
