import { BaseDto } from '../../../types';

export interface MetadataDto extends BaseDto {
    // TODO: Add properties
}

export interface MetadataCreateDto extends Omit<MetadataDto, 'id' | 'olusturulmaTarihi' | 'guncellenmeTarihi' | 'silindiMi'> {
    // TODO: Add properties
}

export interface MetadataUpdateDto extends Partial<MetadataCreateDto> {
    id: number;
}
