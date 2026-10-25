/**
 * Webakus ERP - Faaliyet Alanı DTO Tanımları
 * Sektör ve alt faaliyet alanlarının API veri transfer modelleri.
 */

import { BaseDto } from '../../../types';

export interface FaaliyetAlaniDto extends BaseDto {
    ustFaaliyetAlaniId?: number | null;
    kod?: string;
    ad: string;
    ikon?: string;
    sira?: number;
    aciklama?: string;
    aktifMi: boolean;
    varsayilanOzelliklerJson?: string | null;
    altFaaliyetAlanlari?: FaaliyetAlaniDto[];
}

export interface FaaliyetAlaniCreateDto extends Omit<FaaliyetAlaniDto, 'id' | 'olusturulmaTarihi' | 'guncellenmeTarihi' | 'silindiMi'> {
}

export interface FaaliyetAlaniUpdateDto extends Partial<FaaliyetAlaniCreateDto> {
    id: number;
}
