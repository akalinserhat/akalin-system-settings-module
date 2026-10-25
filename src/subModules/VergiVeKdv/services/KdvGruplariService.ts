import { BaseService } from '../../../services/BaseService';
import { httpClient } from '../../../services/httpClient';
import { KdvGruplariDto, KdvGruplariCreateDto, KdvGruplariUpdateDto } from '../dtos/KdvGruplariDto';

class KdvGruplariService extends BaseService<KdvGruplariDto, KdvGruplariCreateDto, KdvGruplariUpdateDto> {
  constructor() {
    super('/api/KdvGruplari');
  }
}

export const kdvGruplariService = new KdvGruplariService();
