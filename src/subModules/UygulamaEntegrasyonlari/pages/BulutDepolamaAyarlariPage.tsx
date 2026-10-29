/**
 * @akalin/system_settings_module - Bulut Depolama Ayarları Sayfası (BulutDepolamaAyarlariPage.tsx)
 * Kullanıcının Google Drive, OneDrive ve Dropbox entegrasyonlarını yönettiği tam sayfa arayüzü sunar.
 */

import React from 'react';
import { BulutDepolamaAyarlari } from '@akalin/file_manager_module';

const BulutDepolamaAyarlariPage: React.FC = () => {
  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <BulutDepolamaAyarlari />
    </div>
  );
};

export default BulutDepolamaAyarlariPage;
