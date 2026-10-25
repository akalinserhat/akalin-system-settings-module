import { BaseService } from '../../../services/BaseService';
import { httpClient } from '../../../services/httpClient';
import { KargoFirmasiDto, KargoFirmasiCreateDto, KargoFirmasiUpdateDto } from '../dtos/KargoFirmasiDto';

class KargoFirmasiService extends BaseService<KargoFirmasiDto, KargoFirmasiCreateDto, KargoFirmasiUpdateDto> {
  constructor() {
    super('/api/KargoFirmasi');
  }
}

export const kargoFirmasiService = new KargoFirmasiService();
export default kargoFirmasiService;
