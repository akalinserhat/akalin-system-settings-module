import { BaseService } from '../../../services/BaseService';
import { httpClient } from '../../../services/httpClient';
import { MetadataDto, MetadataCreateDto, MetadataUpdateDto } from '../dtos/MetadataDto';

class MetadataService extends BaseService<MetadataDto, MetadataCreateDto, MetadataUpdateDto> {
  constructor() {
    super('/api/Metadata');
  }
}

export const metadataService = new MetadataService();
