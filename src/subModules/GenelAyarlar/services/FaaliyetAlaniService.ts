import { BaseService } from '../../../services/BaseService';
import { httpClient } from '../../../services/httpClient';
import { FaaliyetAlaniDto, FaaliyetAlaniCreateDto, FaaliyetAlaniUpdateDto } from '../dtos/FaaliyetAlaniDto';

class FaaliyetAlaniService extends BaseService<FaaliyetAlaniDto, FaaliyetAlaniCreateDto, FaaliyetAlaniUpdateDto> {
  constructor() {
    super('/api/FaaliyetAlani');
  }
}

export const faaliyetAlaniService = new FaaliyetAlaniService();
