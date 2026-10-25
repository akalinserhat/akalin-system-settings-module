import { BaseService } from '../../../services/BaseService';
import { httpClient } from '../../../services/httpClient';
import { ModullerDto, ModullerCreateDto, ModullerUpdateDto } from '../dtos/ModullerDto';

class ModullerService extends BaseService<ModullerDto, ModullerCreateDto, ModullerUpdateDto> {
  constructor() {
    super('/api/Moduller');
  }
}

export const modullerService = new ModullerService();
