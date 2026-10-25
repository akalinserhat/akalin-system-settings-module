/**
 * Webakus UI - Rol Servisi
 * @deprecated Bu servis bağımsız `@akalin/user_auth_module` paketine taşınmıştır.
 * Geriye dönük uyumluluk için buradan re-export edilmektedir.
 */

import { defaultUserAuthService } from '@akalin/user_auth_module';

export * from '@akalin/user_auth_module';

export const getRoles = defaultUserAuthService.getRoles;
export const getRoleById = defaultUserAuthService.getRoleById;
export const createRole = defaultUserAuthService.createRole;
export const updateRole = defaultUserAuthService.updateRole;
export const saveRole = defaultUserAuthService.saveRole;
export const deleteRole = defaultUserAuthService.deleteRole;
export const canDeleteRole = defaultUserAuthService.canDeleteRole;

export const rolService = defaultUserAuthService;
export default rolService;
