import { BaseService } from '../../../services/BaseService';
import { httpClient } from '../../../services/httpClient';
import { ParaBirimleriDto, ParaBirimleriCreateDto, ParaBirimleriUpdateDto } from '../dtos/ParaBirimleriDto';

class ParaBirimleriService extends BaseService<ParaBirimleriDto, ParaBirimleriCreateDto, ParaBirimleriUpdateDto> {
  constructor() {
    super('/api/ParaBirimleri');
  }
}

export const paraBirimleriService = new ParaBirimleriService();
