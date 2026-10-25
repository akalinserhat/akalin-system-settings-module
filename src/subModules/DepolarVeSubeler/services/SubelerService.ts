import { BaseService } from '../../../services/BaseService';
import { httpClient } from '../../../services/httpClient';
import { SubelerDto, SubelerCreateDto, SubelerUpdateDto } from '../dtos/SubelerDto';

class SubelerService extends BaseService<SubelerDto, SubelerCreateDto, SubelerUpdateDto> {
  constructor() {
    super('/api/Subeler');
  }
}

export const subelerService = new SubelerService();
