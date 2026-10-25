import { BaseDto } from '../../../types';

export interface StorageDto extends BaseDto {
    // TODO: Add properties
}

export interface StorageCreateDto extends Omit<StorageDto, 'id' | 'olusturulmaTarihi' | 'guncellenmeTarihi' | 'silindiMi'> {
    // TODO: Add properties
}

export interface StorageUpdateDto extends Partial<StorageCreateDto> {
    id: number;
}
