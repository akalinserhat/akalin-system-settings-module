import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, ArrowRight, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FiyatListesiAyarlari: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="surface-card p-24">
            <div className="flex-row items-center gap-16 mb-24">
                <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--accent-light)', color: 'var(--accent-primary)', display: 'flex' }}>
                    <Tag size={32} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                        {t('FiyatListesi_ayarlarBaslik') || 'Fiyat Listesi Tanımları ve Yönetimi'}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {t('FiyatListesi_ayarlarAciklama') || 'Ürün ve hizmetleriniz için satış/alış fiyat listelerini tanımlayabilir, cari grubu bazlı özel fiyatlar kurgulayabilirsiniz.'}
                    </p>
                </div>
            </div>

            <div className="surface-card p-16 mb-24" style={{ background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '600' }}>
                    {t('FiyatListesi_bilgiNotuBaslik') || 'ERP Standartlarına Uygun Fiyat Yapısı'}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
                    <li>{t('FiyatListesi_not1') || 'Satış ve Alış fiyat listeleri bağımsız olarak yönetilebilir.'}</li>
                    <li>{t('FiyatListesi_not2') || 'Fiyat listelerine geçerlilik başlangıç ve bitiş tarihleri atanabilir.'}</li>
                    <li>{t('FiyatListesi_not3') || 'Özel cari gruplarına özel (örneğin Bayi veya VIP Müşteriler) fiyat matrisi kurgulanabilir.'}</li>
                    <li>{t('FiyatListesi_not4') || 'Tüm fiyat listesi kalemlerine tek tıkla toplu % zam veya % indirim uygulanabilir.'}</li>
                </ul>
            </div>

            <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/fiyat-listeleri')}
            >
                <span>{t('FiyatListesi_yonetimSayfasinaGit') || 'Fiyat Listeleri Sayfasına Git'}</span>
                <ArrowRight size={18} />
            </button>
        </div>
    );
};

export default FiyatListesiAyarlari;
