import { BaseDto } from '../../../types';

export interface SystemSettingsDto extends BaseDto {
    // TODO: Add properties
}

export interface SystemSettingsCreateDto extends Omit<SystemSettingsDto, 'id' | 'olusturulmaTarihi' | 'guncellenmeTarihi' | 'silindiMi'> {
    // TODO: Add properties
}

export interface SystemSettingsUpdateDto extends Partial<SystemSettingsCreateDto> {
    id: number;
}
