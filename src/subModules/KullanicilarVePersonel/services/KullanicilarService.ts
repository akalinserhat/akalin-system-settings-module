import { BaseService } from '../../../services/BaseService';
import { httpClient } from '../../../services/httpClient';
import { 
  KullaniciDto, 
  KullaniciCreateDto, 
  KullaniciUpdateDto, 
  RolDto, 
  LokasyonDto,
  FirmaDavetGonderDto,
  FirmaDavetListDto
} from '../dtos/KullaniciDto';

class KullanicilarService extends BaseService<KullaniciDto, KullaniciCreateDto, KullaniciUpdateDto> {
  constructor() {
    super('/api/Kullanicilar');
  }

  /**
   * Firmaya ait aktif sistem rollerini getirir.
   */
  public async getRoller(): Promise<RolDto[]> {
    const response = await httpClient.get<RolDto[]>('/api/Kullanicilar/roller');
    return response.data;
  }

  /**
   * Firmaya ait yetkilendirilebilir şubeleri getirir.
   */
  public async getLokasyonlar(): Promise<LokasyonDto[]> {
    const response = await httpClient.get<LokasyonDto[]>('/api/Kullanicilar/lokasyonlar');
    return response.data;
  }

  /**
   * Firmaya yeni bir personel davet etmek için e-posta daveti gönderir.
   */
  public async davetGonder(dto: FirmaDavetGonderDto): Promise<FirmaDavetListDto> {
    const response = await httpClient.post<FirmaDavetListDto>('/api/Kullanicilar/davet-gonder', dto);
    return response.data;
  }

  /**
   * Giriş yapılan firmanın davet listesini getirir.
   */
  public async getDavetler(): Promise<FirmaDavetListDto[]> {
    const response = await httpClient.get<FirmaDavetListDto[]>('/api/Kullanicilar/davetler');
    return response.data;
  }

  /**
   * Bekleyen daveti iptal eder.
   */
  public async davetIptal(davetId: number): Promise<void> {
    await httpClient.delete(`/api/Kullanicilar/davetler/${davetId}`);
  }
}

export const kullanicilarService = new KullanicilarService();

