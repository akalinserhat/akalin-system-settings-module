import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PersonelDavetForm from '../components/PersonelDavetForm';
import { AlertDialog } from '@akalin/ui';
import { useTranslation } from 'react-i18next';

const PersonelDavetPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const returnTo = location.state?.returnTo || '/ayarlar/kullanicilar';

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
            navigate(returnTo, { state: { newlyAddedDavetId: resultId }, replace: true });
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <PersonelDavetForm
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

export default PersonelDavetPage;
