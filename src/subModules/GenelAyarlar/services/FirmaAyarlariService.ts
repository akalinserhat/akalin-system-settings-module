import { BaseService } from '../../../services/BaseService';
import { httpClient } from '../../../services/httpClient';
import { FirmaAyarlariDto, FirmaAyarlariCreateDto, FirmaAyarlariUpdateDto } from '../dtos/FirmaAyarlariDto';

class FirmaAyarlariService extends BaseService<FirmaAyarlariDto, FirmaAyarlariCreateDto, FirmaAyarlariUpdateDto> {
  constructor() {
    super('/api/FirmaAyarlari');
  }
}

export const firmaAyarlariService = new FirmaAyarlariService();
