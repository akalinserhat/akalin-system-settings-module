import { BaseService } from '../../../services/BaseService';
import { httpClient } from '../../../services/httpClient';
import { SystemSettingsDto, SystemSettingsCreateDto, SystemSettingsUpdateDto } from '../dtos/SystemSettingsDto';

class SystemSettingsService extends BaseService<SystemSettingsDto, SystemSettingsCreateDto, SystemSettingsUpdateDto> {
  constructor() {
    super('/api/SystemSettings');
  }
}

export const systemSettingsService = new SystemSettingsService();
