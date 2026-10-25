import { BaseDto } from '../../../types';

export interface KdvGruplariDto extends BaseDto {
    // TODO: Add properties
}

export interface KdvGruplariCreateDto extends Omit<KdvGruplariDto, 'id' | 'olusturulmaTarihi' | 'guncellenmeTarihi' | 'silindiMi'> {
    // TODO: Add properties
}

export interface KdvGruplariUpdateDto extends Partial<KdvGruplariCreateDto> {
    id: number;
}
