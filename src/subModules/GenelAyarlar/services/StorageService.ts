import { BaseService } from '../../../services/BaseService';
import { httpClient } from '../../../services/httpClient';
import { StorageDto, StorageCreateDto, StorageUpdateDto } from '../dtos/StorageDto';

class StorageService extends BaseService<StorageDto, StorageCreateDto, StorageUpdateDto> {
  constructor() {
    super('/api/Storage');
  }
}

export const storageService = new StorageService();
