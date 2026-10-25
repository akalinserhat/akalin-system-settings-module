import { BaseService } from '../../../services/BaseService';
import { httpClient } from '../../../services/httpClient';
import { TanimlarDto, TanimlarCreateDto, TanimlarUpdateDto } from '../dtos/TanimlarDto';

class TanimlarService extends BaseService<TanimlarDto, TanimlarCreateDto, TanimlarUpdateDto> {
  constructor() {
    super('/api/Tanimlar');
  }
}

export const tanimlarService = new TanimlarService();
