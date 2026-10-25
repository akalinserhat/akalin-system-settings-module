import { TFunction } from 'i18next';

export interface PersonelDavetFormData {
  email: string;
  roller: string[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validatePersonelDavetField = (
  fieldName: keyof PersonelDavetFormData,
  value: any,
  t: TFunction
): string | null => {
  switch (fieldName) {
    case 'email': {
      if (!value || typeof value !== 'string' || !value.trim()) {
        return t('eposta_alani_zorunludur', 'E-posta adresi zorunludur.');
      }
      if (!EMAIL_REGEX.test(value.trim())) {
        return t('gecerli_bir_eposta_giriniz', 'Lütfen geçerli bir e-posta adresi giriniz.');
      }
      return null;
    }

    case 'roller': {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return t('en_az_bir_rol_seciniz', 'Lütfen en az bir yetki rolü seçiniz.');
      }
      return null;
    }

    default:
      return null;
  }
};

export const validatePersonelDavetForm = (
  formData: PersonelDavetFormData,
  t: TFunction
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const emailError = validatePersonelDavetField('email', formData.email, t);
  if (emailError) errors.email = emailError;

  const rollerError = validatePersonelDavetField('roller', formData.roller, t);
  if (rollerError) errors.roller = rollerError;

  return errors;
};
