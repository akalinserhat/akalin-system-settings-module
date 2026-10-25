import { BaseService } from '../../../services/BaseService';
import { httpClient } from '../../../services/httpClient';
import {
  MigrationSourceType,
  MigrationEntityType,
  MigrationProviderInfoDto,
  MigrationPreviewResultDto,
  MigrationExecuteRequestDto,
  MigrationExecutionResultDto,
  MigrationLogDto,
  AbakusContainerStatusDto,
  AbakusCariInventoryDto,
  AbakusCariMigrationRequestDto,
  AbakusCariBatchResultDto,
  AbakusStokInventoryDto,
  AbakusStokMigrationRequestDto,
  AbakusStokBatchResultDto,
  AbakusMarkaInventoryDto,
  AbakusMarkaMigrationRequestDto,
  AbakusMarkaBatchResultDto,
  AbakusUrunGrubuInventoryDto,
  AbakusUrunGrubuMigrationRequestDto,
  AbakusUrunGrubuBatchResultDto,
  AbakusSiparisInventoryDto,
  AbakusSiparisMigrationRequestDto,
  AbakusSiparisBatchResultDto
} from '../dtos/MigrationDtos';

class MigrationService extends BaseService<MigrationLogDto, any, any> {
  constructor() {
    super('/api/Migration');
  }

  /**
   * Sistemde kayıtlı veri aktarım sağlayıcılarını listeler.
   */
  public async getProviders(): Promise<MigrationProviderInfoDto[]> {
    const response = await httpClient.get<MigrationProviderInfoDto[]>(`${this.basePath}/providers`);
    return response.data;
  }

  /**
   * Belirtilen kaynak ve varlık türü için şablon dosyasını indirir ve tarayıcıda tetikler.
   */
  public async downloadTemplate(sourceType: MigrationSourceType, entityType: MigrationEntityType): Promise<void> {
    const response = await httpClient.get(`${this.basePath}/template`, {
      params: { sourceType, entityType },
      responseType: 'blob'
    });

    const isExcel = sourceType === MigrationSourceType.Excel;
    const fileName = isExcel
      ? `Webakus_${MigrationEntityType[entityType]}_Sablonu.xlsx`
      : `Webakus_${MigrationSourceType[sourceType]}_Rehberi.sql`;

    const blob = new Blob([response.data], {
      type: isExcel 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        : 'text/plain'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Yüklenen dosyayı veya bağlantı ayarlarını önizleme ve doğrulama için API'ye gönderir.
   */
  public async preview(formData: FormData): Promise<MigrationPreviewResultDto> {
    const response = await httpClient.post<MigrationPreviewResultDto>(`${this.basePath}/preview`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  /**
   * Doğrulanmış verileri Webakus veritabanına aktarır.
   */
  public async execute(request: MigrationExecuteRequestDto): Promise<MigrationExecutionResultDto> {
    const response = await httpClient.post<MigrationExecutionResultDto>(`${this.basePath}/execute`, request);
    return response.data;
  }

  /**
   * Geçmiş aktarım loglarını getirir.
   */
  public async getHistory(): Promise<MigrationLogDto[]> {
    const response = await httpClient.get<MigrationLogDto[]>(`${this.basePath}/history`);
    return response.data;
  }

  /**
   * Abakus .bak dosyasını Docker container'ına yükleyip restore eder ve özet döner.
   */
  public async inspectBackup(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('dosya', file);

    const response = await httpClient.post(`${this.basePath}/inspect-backup`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 300000
    });
    return response.data;
  }

  /**
   * Firmanın aktif Abakus container ve veritabanı durumunu sorgular.
   */
  public async getAbakusStatus(): Promise<AbakusContainerStatusDto> {
    const response = await httpClient.get<AbakusContainerStatusDto>(`${this.basePath}/abakus/status`);
    return response.data;
  }

  /**
   * Docker Desktop / servisini arka planda çalıştırmak için API'yi tetikler.
   */
  public async startDocker(): Promise<{ success: boolean; message: string }> {
    const response = await httpClient.post<{ success: boolean; message: string }>(`${this.basePath}/abakus/start-docker`, {}, {
      timeout: 60000
    });
    return response.data;
  }

  /**
   * Firmanın Abakus container'ını ve tüm geçici veritabanlarını Docker'dan tamamen kaldırır ve sıfırlar.
   */
  public async resetAbakusContainer(): Promise<{ success: boolean; message: string }> {
    const response = await httpClient.post<{ success: boolean; message: string }>(`${this.basePath}/abakus/reset`);
    return response.data;
  }

  /**
   * Abakus ERP Cari ve Adres envanterini (3. Aşama) getirir.
   */
  public async getCariInventory(dbName: string): Promise<AbakusCariInventoryDto> {
    const response = await httpClient.get<AbakusCariInventoryDto>(`${this.basePath}/abakus/cari-inventory`, {
      params: { dbName }
    });
    return response.data;
  }

  /**
   * Abakus ERP Stok / Ürün envanterini (3. Aşama) getirir.
   */
  public async getStokInventory(dbName: string): Promise<AbakusStokInventoryDto> {
    const response = await httpClient.get<AbakusStokInventoryDto>(`${this.basePath}/abakus/stok-inventory`, {
      params: { dbName }
    });
    return response.data;
  }

  /**
   * Abakus ERP Cari ve Adres verilerini batch (sayfalama) halinde aktarır (4. Aşama).
   */
  public async migrateCariBatch(request: AbakusCariMigrationRequestDto): Promise<AbakusCariBatchResultDto> {
    const response = await httpClient.post<AbakusCariBatchResultDto>(`${this.basePath}/abakus/migrate-cari-batch`, request);
    return response.data;
  }

  /**
   * Abakus ERP Stok / Ürün verilerini batch (sayfalama) halinde aktarır (4. Aşama).
   */
  public async migrateStokBatch(request: AbakusStokMigrationRequestDto): Promise<AbakusStokBatchResultDto> {
    const response = await httpClient.post<AbakusStokBatchResultDto>(`${this.basePath}/abakus/migrate-stok-batch`, request);
    return response.data;
  }

  /**
   * Abakus ERP Marka envanterini (3. Aşama) getirir.
   */
  public async getMarkaInventory(dbName: string): Promise<AbakusMarkaInventoryDto> {
    const response = await httpClient.get<AbakusMarkaInventoryDto>(`${this.basePath}/abakus/marka-inventory`, {
      params: { dbName }
    });
    return response.data;
  }

  /**
   * Abakus ERP Ürün Grubu / Kategori envanterini (3. Aşama) getirir.
   */
  public async getUrunGrubuInventory(dbName: string): Promise<AbakusUrunGrubuInventoryDto> {
    const response = await httpClient.get<AbakusUrunGrubuInventoryDto>(`${this.basePath}/abakus/urun-grubu-inventory`, {
      params: { dbName }
    });
    return response.data;
  }

  /**
   * Abakus ERP Marka verilerini batch halinde aktarır (4. Aşama).
   */
  public async migrateMarkaBatch(request: AbakusMarkaMigrationRequestDto): Promise<AbakusMarkaBatchResultDto> {
    const response = await httpClient.post<AbakusMarkaBatchResultDto>(`${this.basePath}/abakus/migrate-marka-batch`, request);
    return response.data;
  }

  /**
   * Abakus ERP Ürün Grubu verilerini batch halinde aktarır (4. Aşama).
   */
  public async migrateUrunGrubuBatch(request: AbakusUrunGrubuMigrationRequestDto): Promise<AbakusUrunGrubuBatchResultDto> {
    const response = await httpClient.post<AbakusUrunGrubuBatchResultDto>(`${this.basePath}/abakus/migrate-urun-grubu-batch`, request);
    return response.data;
  }

  /**
   * Abakus ERP Sipariş envanterini (3. Aşama) getirir (fisTipi: 100=Alınan Sipariş, 101=Verilen Sipariş).
   */
  public async getSiparisInventory(dbName: string, fisTipi: number = 100): Promise<AbakusSiparisInventoryDto> {
    const response = await httpClient.get<AbakusSiparisInventoryDto>(`${this.basePath}/abakus/siparis-inventory`, {
      params: { dbName, fisTipi }
    });
    return response.data;
  }

  /**
   * Abakus ERP Sipariş verilerini batch halinde aktarır (4. Aşama).
   */
  public async migrateSiparisBatch(request: AbakusSiparisMigrationRequestDto): Promise<AbakusSiparisBatchResultDto> {
    const response = await httpClient.post<AbakusSiparisBatchResultDto>(`${this.basePath}/abakus/migrate-siparis-batch`, request);
    return response.data;
  }

  /**
   * İşlem bittiğinde veya iptal edildiğinde geçici veritabanını ve dosyaları temizler.
   */
  public async cleanupAbakus(databaseName?: string, bakFileName?: string): Promise<any> {
    const response = await httpClient.post(`${this.basePath}/cleanup-abakus`, {
      databaseName,
      bakFileName
    });
    return response.data;
  }

}

export const migrationService = new MigrationService();
