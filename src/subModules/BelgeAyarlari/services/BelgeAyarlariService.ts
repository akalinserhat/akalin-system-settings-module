import { BaseService } from '../../../services/BaseService';
import { httpClient } from '../../../services/httpClient';
import { BelgeAyarlariDto, BelgeAyarlariCreateDto, BelgeAyarlariUpdateDto } from '../dtos/BelgeAyarlariDto';

class BelgeAyarlariService extends BaseService<BelgeAyarlariDto, BelgeAyarlariCreateDto, BelgeAyarlariUpdateDto> {
  constructor() {
    super('/api/BelgeAyarlari');
  }

  getAyarByBelgeTuru(belgeTuru: string, subeId?: number): Promise<any> {
    return httpClient.get<any>(`${this.basePath}/${belgeTuru}`, { params: { subeId } }).then(res => res.data);
  }
}

export const belgeAyarlariService = new BelgeAyarlariService();
