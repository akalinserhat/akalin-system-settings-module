import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PersonelForm from '../components/PersonelForm';
import { kullanicilarService } from '../services/KullanicilarService';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { AlertDialog } from '@akalin/ui';

const PersonelFormPage: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const returnTo = location.state?.returnTo || '/ayarlar/kullanicilar';

    const isEditing = !!(id && id !== 'yeni' && !isNaN(Number(id)));
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(isEditing);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [alertDialog, setAlertDialog] = useState<{
        isOpen: boolean;
        type?: 'info' | 'error' | 'warning' | 'success' | 'confirm';
        title: string;
        message: string;
        onConfirm?: (() => void) | null;
    }>({
        isOpen: false,
        type: 'confirm',
        title: '',
        message: '',
        onConfirm: null
    });

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            kullanicilarService.getById(Number(id))
                .then(data => {
                    setInitialData(data);
                })
                .catch(() => {
                    toast.error(t('auto_personel_bilgileri_yuklenemedi', 'Personel bilgileri yüklenemedi.'));
                    handleClose();
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEditing]);

    const doNavigateBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(returnTo, { replace: true });
        }
    };

    const handleClose = () => {
        if (isFormDirty) {
            setAlertDialog({
                isOpen: true,
                type: 'confirm',
                title: t('auto_kaydedilmemis_degisiklikler', 'Kaydedilmemiş Değişiklikler'),
                message: t('auto_kaydedilmemis_degisiklikler_var', 'Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinize emin misiniz?'),
                onConfirm: () => {
                    setAlertDialog(prev => ({ ...prev, isOpen: false }));
                    doNavigateBack();
                }
            });
        } else {
            doNavigateBack();
        }
    };

    const handleSuccess = (resultId?: any) => {
        setIsFormDirty(false);
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(returnTo, { state: { newlyAddedPersonelId: resultId }, replace: true });
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center text-secondary p-24">
                {t('auto_yukleniyor_4deb', 'Yükleniyor...')}
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <PersonelForm
                initialData={initialData}
                onSuccess={handleSuccess}
                onCancel={handleClose}
                onDirtyChange={setIsFormDirty}
            />

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
                confirmText={t('auto_evet_cik', 'Evet, Çık')}
                cancelText={t('auto_iptal', 'İptal')}
            />
        </div>
    );
};

export default PersonelFormPage;
