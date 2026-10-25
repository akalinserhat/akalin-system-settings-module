import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface TuketiciKredisiKomisyonBelgeleriTablosuProps {
    tuketiciKredisiFirmasiId: number;
}

const TuketiciKredisiKomisyonBelgeleriTablosu: React.FC<TuketiciKredisiKomisyonBelgeleriTablosuProps> = ({ tuketiciKredisiFirmasiId }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const baseRoute = `/ayarlar/sistem-ayarlari/TuketiciKredisiFirmalari/${tuketiciKredisiFirmasiId}/komisyon-belgeleri`;

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/TuketiciKredisiKomisyonBelgeleri/ByFirm/${tuketiciKredisiFirmasiId}`);
            setData(res.data || []);
        } catch (error) {
            console.error('Komisyon belgeleri yüklenirken hata:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [tuketiciKredisiFirmasiId]);

    useEffect(() => {
        if (tuketiciKredisiFirmasiId) {
            loadData();
        }
    }, [tuketiciKredisiFirmasiId, loadData]);

    const handleDelete = async (id: number) => {
        if (window.confirm(t('TuketiciKredisiKomisyonBelgeleriTablosu_silOnay', { defaultValue: 'Bu belgeyi silmek istediğinize emin misiniz?' }))) {
            try {
                await axios.delete(`/api/TuketiciKredisiKomisyonBelgeleri/${id}`);
                toast.success(t('TuketiciKredisiKomisyonBelgeleriTablosu_silBasarili', { defaultValue: 'Belge silindi' }));
                loadData();
            } catch (error) {
                toast.error(t('TuketiciKredisiKomisyonBelgeleriTablosu_silHata', { defaultValue: 'Silinirken hata oluştu' }));
            }
        }
    };

    return (
        <div className="flex-col gap-16">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                        {t('TuketiciKredisiKomisyonBelgeleriTablosu_baslik', { defaultValue: 'Komisyon Sözleşmeleri' })}
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {t('TuketiciKredisiKomisyonBelgeleriTablosu_aciklama', { defaultValue: 'Bu firmaya ait geçmiş ve güncel komisyon anlaşmalarını buradan yönetebilirsiniz.' })}
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate(`${baseRoute}/yeni`)}
                >
                    <Plus size={18} /> {t('TuketiciKredisiKomisyonBelgeleriTablosu_yeniBelgeButton', { defaultValue: 'Yeni Belge Ekle' })}
                </button>
            </div>

            <div style={{
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'var(--bg-primary)'
            }}>
                {loading ? (
                    <div style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                        <Loader2 size={28} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontSize: '14px' }}>{t('auto_yukleniyor_4deb', { defaultValue: 'Yükleniyor...' })}</span>
                    </div>
                ) : data.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                        <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '50%' }}>
                            <Search size={28} opacity={0.4} />
                        </div>
                        <span style={{ fontSize: '14px' }}>
                            {t('TuketiciKredisiKomisyonBelgeleriTablosu_empty', { defaultValue: 'Henüz komisyon belgesi eklenmemiş.' })}
                        </span>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-secondary)' }}>
                                <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('TuketiciKredisiKomisyonBelgeleriTablosu_kampanyaAdiHeader', { defaultValue: 'Kampanya Adı' })}</th>
                                <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('auto_baslangic_677c', { defaultValue: 'Başlangıç' })}</th>
                                <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('auto_bitis_7cd2', { defaultValue: 'Bitiş' })}</th>
                                <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('auto_aciklama_1bab', { defaultValue: 'Açıklama' })}</th>
                                <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Durum</th>
                                <th style={{ padding: '12px 16px', width: '90px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row: any) => (
                                <tr key={row.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600 }}>
                                        {row.kampanyaAdi || '-'}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                                        {new Date(row.baslangicTarihi).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                                        {row.bitisTarihi ? new Date(row.bitisTarihi).toLocaleDateString('tr-TR') : t('TuketiciKredisiKomisyonBelgeleriTablosu_suresiz', { defaultValue: 'Süresiz' })}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        {row.aciklama || '-'}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span className={row.aktifMi ? 'badge badge-success' : 'badge badge-danger'}>
                                            {row.aktifMi ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                className="btn-icon"
                                                type="button"
                                                onClick={() => navigate(`${baseRoute}/duzenle/${row.id}`)}
                                                title="Düzenle"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn-icon text-danger"
                                                type="button"
                                                onClick={() => handleDelete(row.id)}
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TuketiciKredisiKomisyonBelgeleriTablosu;
