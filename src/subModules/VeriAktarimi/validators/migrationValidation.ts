import { MigrationSourceType, MigrationEntityType } from '../dtos/MigrationDtos';

export interface MigrationFormValues {
  sourceType: MigrationSourceType;
  entityType: MigrationEntityType;
  file: File | null;
  connectionString?: string;
}

/**
/// Tek bir alanın doğrulanması.
*/
export function validateMigrationField(name: string, value: any, t: (key: string) => string): string {
  switch (name) {
    case 'file':
      if (!value) {
        return t('Lütfen aktarmak istediğiniz dosyayı seçiniz.');
      }
      return '';
    case 'sourceType':
      if (!value) {
        return t('Lütfen veri aktarım kaynağını seçiniz.');
      }
      return '';
    case 'entityType':
      if (!value) {
        return t('Lütfen aktarılacak varlık türünü seçiniz.');
      }
      return '';
    case 'connectionString':
      if (!value || !value.trim()) {
        return t('Lütfen veritabanı bağlantı dizesini giriniz.');
      }
      return '';
    default:
      return '';
  }
}

/**
/// Tüm aktarım formunun topluca doğrulanması.
*/
export function validateMigrationForm(values: MigrationFormValues, t: (key: string) => string): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.sourceType) {
    errors.sourceType = t('Lütfen veri aktarım kaynağını seçiniz.');
  }

  if (!values.entityType) {
    errors.entityType = t('Lütfen aktarılacak varlık türünü seçiniz.');
  }

  if (values.sourceType === MigrationSourceType.Excel) {
    if (!values.file) {
      errors.file = t('Lütfen aktarmak istediğiniz dosyayı seçiniz.');
    } else {
      const allowedExtensions = ['.xlsx', '.xls'];
      const fileExt = values.file.name.substring(values.file.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExtensions.includes(fileExt)) {
        errors.file = t('Sadece .xlsx ve .xls uzantılı Excel dosyaları desteklenmektedir.');
      }
    }
  } else if (values.sourceType === MigrationSourceType.Abakus) {
    if (!values.connectionString && !values.file) {
      errors.connectionString = t('Lütfen geçerli bir MS SQL bağlantı dizesi veya SQL çıktısı belirtiniz.');
    }
  }

  return errors;
}
