export enum MigrationSourceType {
  Excel = 1,
  Abakus = 2,
  Logo = 3,
  Mikro = 4,
  Netsis = 5,
  Parasut = 6
}

export enum MigrationEntityType {
  Cari = 1,
  UrunVeHizmet = 2,
  BakiyeDevir = 3,
  Marka = 4,
  UrunGrubu = 5,
  AlinanSiparis = 6,
  VerilenSiparis = 7
}

export enum MigrationImportMode {
  SkipDuplicates = 1,
  UpdateDuplicates = 2,
  ErrorOnDuplicates = 3
}

export enum MigrationItemStatus {
  Valid = 1,
  Warning = 2,
  Error = 3,
  Duplicate = 4
}

export enum MigrationStatus {
  Completed = 1,
  PartiallyCompleted = 2,
  Failed = 3
}

export interface MigrationProviderInfoDto {
  sourceType: MigrationSourceType;
  name: string;
  description: string;
  supportedEntities: MigrationEntityType[];
  isReady: boolean;
}

export interface MigrationPreviewItemDto {
  rowIndex: number;
  rawValues: Record<string, string | null>;
  mappedValues: Record<string, any>;
  status: MigrationItemStatus;
  messages: string[];
}

export interface MigrationPreviewResultDto {
  sourceType: MigrationSourceType;
  entityType: MigrationEntityType;
  totalRecordCount: number;
  validRecordCount: number;
  warningRecordCount: number;
  errorRecordCount: number;
  duplicateRecordCount: number;
  headers: string[];
  items: MigrationPreviewItemDto[];
}

export interface MigrationExecuteRequestDto {
  sourceType: MigrationSourceType;
  entityType: MigrationEntityType;
  importMode: MigrationImportMode;
  dosyaAdi?: string;
  items: MigrationPreviewItemDto[];
}

export interface MigrationItemErrorDto {
  rowIndex: number;
  itemIdentifier: string;
  errorMessage: string;
}

export interface MigrationExecutionResultDto {
  success: boolean;
  message: string;
  totalProcessed: number;
  successCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  logId: number;
  itemErrors: MigrationItemErrorDto[];
}

export interface MigrationLogDto {
  id: number;
  sourceType: MigrationSourceType;
  sourceTypeName: string;
  entityType: MigrationEntityType;
  entityTypeName: string;
  dosyaAdi?: string;
  toplamKayit: number;
  basariliKayit: number;
  hataliKayit: number;
  atlananKayit: number;
  durum: MigrationStatus;
  durumName: string;
  olusturulmaTarihi: string;
  hataDetaylariJson?: string;
}

export interface AbakusBackupSummaryDto {
  databaseName: string;
  bakFileName: string;
  originalFileName?: string;
  fileSizeFormatted?: string;
  earliestMovementDate?: string;
  latestMovementDate?: string;
  cariCount: number;
  adresCount: number;
  stokCount: number;
  markaCount: number;
  urunGrubuCount: number;
  alinanSiparisCount: number;
  verilenSiparisCount: number;
  success: boolean;
  message: string;
}

export interface AbakusContainerStatusDto {
  containerExists: boolean;
  isRunning: boolean;
  containerName: string;
  port: number;
  hasActiveDatabase: boolean;
  databaseName?: string;
  originalFileName?: string;
  fileSizeFormatted?: string;
  earliestMovementDate?: string;
  latestMovementDate?: string;
  cariCount: number;
  adresCount: number;
  stokCount: number;
  markaCount: number;
  urunGrubuCount: number;
  alinanSiparisCount: number;
  verilenSiparisCount: number;
  bakFileName?: string;
  isDockerRunning?: boolean;
  message: string;
}

export interface AbakusCariInventoryDto {
  totalCariCount: number;
  musteriCount: number;
  saticiCount: number;
  musteriSaticiCount: number;
  cariWithAddressCount: number;
  totalAddressCount: number;
  cariWithPhoneCount: number;
  cariWithEmailCount: number;
  cariWithBalanceCount: number;
  totalBalance: number;
  databaseName: string;
}

export interface AbakusCariMigrationRequestDto {
  databaseName: string;
  bakFileName?: string;
  aktarTemelKartlar: boolean;
  aktarAdresler: boolean;
  aktarIletisim: boolean;
  aktarBakiyeler: boolean;
  importMode: MigrationImportMode;
  offset: number;
  batchSize: number;
}

export interface AbakusCariBatchResultDto {
  processedCount: number;
  successCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  addressCount: number;
  totalCount: number;
  isCompleted: boolean;
  message: string;
  errors: string[];
}

export interface AbakusStokInventoryDto {
  totalStokCount: number;
  stokWithBarcodeCount: number;
  stokWithUreticiKoduCount: number;
  stokWithPriceCount: number;
  stokWithBalanceCount: number;
  totalStokBalance: number;
  databaseName: string;
}

export interface AbakusStokMigrationRequestDto {
  databaseName: string;
  bakFileName?: string;
  aktarTemelKartlar: boolean;
  aktarFiyatlar: boolean;
  aktarBarkodlar: boolean;
  aktarBakiyeler?: boolean;
  importMode: MigrationImportMode;
  offset: number;
  batchSize: number;
}

export interface AbakusStokBatchResultDto {
  processedCount: number;
  successCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  totalCount: number;
  isCompleted: boolean;
  message: string;
  errors: string[];
}

export interface AbakusMarkaInventoryDto {
  totalMarkaCount: number;
  activeMarkaCount: number;
  inactiveMarkaCount: number;
  databaseName: string;
}

export interface AbakusMarkaMigrationRequestDto {
  databaseName: string;
  bakFileName?: string;
  importMode: MigrationImportMode;
  offset: number;
  batchSize: number;
}

export interface AbakusMarkaBatchResultDto {
  processedCount: number;
  successCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  totalCount: number;
  isCompleted: boolean;
  message: string;
  errors: string[];
}

export interface AbakusUrunGrubuInventoryDto {
  totalCategoryCount: number;
  rootCategoryCount: number;
  subCategoryCount: number;
  databaseName: string;
}

export interface AbakusUrunGrubuMigrationRequestDto {
  databaseName: string;
  bakFileName?: string;
  importMode: MigrationImportMode;
  offset: number;
  batchSize: number;
}

export interface AbakusUrunGrubuBatchResultDto {
  processedCount: number;
  successCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  totalCount: number;
  isCompleted: boolean;
  message: string;
  errors: string[];
}

export interface AbakusSiparisInventoryDto {
  fisTipi: number;
  totalOrderCount: number;
  totalSiparisCount?: number;
  totalLineCount: number;
  totalAmount: number;
  earliestDate?: string;
  latestDate?: string;
  firstDate?: string;
  lastDate?: string;
  pastYearOrderCount?: number;
  databaseName: string;
}

export interface AbakusSiparisMigrationRequestDto {
  databaseName: string;
  bakFileName?: string;
  fisTipi: number; // 100 = Alınan Sipariş, 101 = Verilen Sipariş
  importMode: MigrationImportMode;
  offset: number;
  batchSize: number;
  guncelYildanEskileriArsivle?: boolean;
}

export interface AbakusSiparisBatchResultDto {
  processedCount: number;
  successCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  totalLineCount: number;
  archivedCount?: number;
  totalCount: number;
  isCompleted: boolean;
  message: string;
  errors: string[];
}




