import React, { useState, useEffect } from 'react';
import { BaseCardPage, AlertDialog } from '@akalin/ui';
import TuketiciKredisiKomisyonBelgesiForm from '../components/TuketiciKredisiKomisyonBelgesiForm';
import { useParams, useNavigate } from 'react-router-dom';
import { Percent, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const TuketiciKredisiKomisyonBelgesiFormPage: React.FC = () => {
    const { t } = useTranslation();
    const { tuketiciKredisiFirmasiId, id } = useParams<{ tuketiciKredisiFirmasiId: string; id?: string }>();
    const navigate = useNavigate();

    const isEditing = !!(id && id !== 'yeni');
    const baseRoute = `/ayarlar/sistem-ayarlari/TuketiciKredisiFirmalari/duzenle/${tuketiciKredisiFirmasiId}`;

    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(isEditing);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [title, setTitle] = useState<string>('');
    const [alertDialog, setAlertDialog] = useState<{
        isOpen: boolean;
        type?: 'confirm' | 'info' | 'error' | 'warning';
        title: string;
        message: string;
        onConfirm?: () => void;
    }>({
        isOpen: false,
        title: '',
        message: ''
    });

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            axios.get(`/api/TuketiciKredisiKomisyonBelgeleri/${id}`)
                .then(res => {
                    setInitialData(res.data);
                    if (res.data?.baslangicTarihi) {
                        setTitle(res.data.baslangicTarihi.split('T')[0]);
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast.error(t('komisyon_belgesi_yuklenemedi', 'Komisyon belgesi yüklenemedi.'));
                    navigate(baseRoute);
                })
                .finally(() => setLoading(false));
        } else {
            setInitialData({
                tuketiciKredisiFirmasiId: Number(tuketiciKredisiFirmasiId),
                baslangicTarihi: '',
                bitisTarihi: '',
                kampanyaAdi: '',
                kampanyaTuru: 1,
                aktifMi: true,
                aciklama: '',
                satirlar: [
                    { taksitSayisi: 2, aciklama: '2 Taksit', oran: 0, vadeGunu: 1 }
                ]
            });
        }
    }, [id, isEditing, tuketiciKredisiFirmasiId, t, navigate, baseRoute]);

    const handleSave = () => {
        const form = document.getElementById('base-form') as HTMLFormElement;
        if (form) {
            form.requestSubmit();
        }
    };

    const handleClose = () => {
        if (isDirty) {
            setAlertDialog({
                isOpen: true,
                type: 'confirm',
                title: t('kaydedilmemis_degisiklikler', 'Kaydedilmemiş Değişiklikler'),
                message: t('auto_degisiklikler_kaydedilmedi_onay', 'Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinize emin misiniz?'),
                onConfirm: () => navigate(baseRoute)
            });
        } else {
            navigate(baseRoute);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-40">
                <RefreshCcw size={32} className="spinning text-secondary mb-12" />
                <p className="text-secondary m-0">{t('auto_yukleniyor_4deb', 'Yükleniyor...')}</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <BaseCardPage
                id="tuketiciKredisiKomisyonBelgesiFormCardPage"
                icon={<Percent size={20} />}
                title={isEditing 
                    ? t('tuketici_kredisi_komisyon_duzenle', { title: title || '', defaultValue: 'Komisyon Anlaşma Belgesi Düzenle' })
                    : t('yeni_tuketici_kredisi_komisyon', 'Yeni Komisyon Anlaşma Belgesi')
                }
                subtitleLeft={t('tuketici_kredisi_komisyon_aciklama', 'Tüketici kredisi firması kampanya ve komisyon oranları')}
                showBackButton={true}
                onClose={handleClose}
                onSave={handleSave}
                isSaving={isSaving}
            >
                <div className="dynamic-form-fields-container">
                    <TuketiciKredisiKomisyonBelgesiForm
                        initialData={initialData}
                        onSuccess={() => navigate(baseRoute)}
                        onCancel={handleClose}
                        onDirtyChange={setIsDirty}
                        onSavingChange={setIsSaving}
                    />
                </div>
            </BaseCardPage>

            <AlertDialog
                isOpen={alertDialog.isOpen}
                onClose={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}
                type={alertDialog.type || 'confirm'}
                title={alertDialog.title}
                message={alertDialog.message}
                onConfirm={() => {
                    if (alertDialog.onConfirm) alertDialog.onConfirm();
                    setAlertDialog(prev => ({ ...prev, isOpen: false }));
                }}
                confirmText={t('evet_cik', 'Evet, Çık')}
                cancelText={t('auto_iptal', 'İptal')}
            />
        </div>
    );
};

export default TuketiciKredisiKomisyonBelgesiFormPage;
