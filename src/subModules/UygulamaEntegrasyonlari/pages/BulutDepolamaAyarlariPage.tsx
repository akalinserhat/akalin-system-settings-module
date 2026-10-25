/**
 * Bulut Depolama Ayarları Sayfası (BulutDepolamaAyarlariPage) Bileşeni.
 * Kullanıcının Google Drive, OneDrive ve Dropbox entegrasyonlarını yönettiği tam sayfa arayüzü sunar.
 */
import { BulutDepolamaAyarlari } from '@akalin/storage_module';

const BulutDepolamaAyarlariPage: React.FC = () => {
    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <BulutDepolamaAyarlari />
        </div>
    );
};

export default BulutDepolamaAyarlariPage;
