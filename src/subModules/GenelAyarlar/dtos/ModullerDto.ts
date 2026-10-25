import { BaseDto } from '../../../types';

export interface ModullerDto extends BaseDto {
    // TODO: Add properties
}

export interface ModullerCreateDto extends Omit<ModullerDto, 'id' | 'olusturulmaTarihi' | 'guncellenmeTarihi' | 'silindiMi'> {
    // TODO: Add properties
}

export interface ModullerUpdateDto extends Partial<ModullerCreateDto> {
    id: number;
}
