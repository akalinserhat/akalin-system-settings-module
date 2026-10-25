import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BaseCardPage, AlertDialog } from '@akalin/ui';
import KdvForm from '../components/KdvForm';
import { Calculator, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const KdvFormPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const isEditing = !!(id && id !== 'yeni');
  const returnTo = location.state?.returnTo || '/ayarlar/sistem-ayarlari/VergiVeKDV';

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
      axios.get(`/api/KdvGruplari/${id}`)
        .then(res => {
          setInitialData(res.data);
          if (res.data?.ad) {
            setTitle(res.data.ad);
          }
        })
        .catch(err => {
          console.error(err);
          toast.error(t('kdv_tanimi_yuklenemedi', 'KDV tanımı bilgileri yüklenemedi.'));
          navigate(returnTo);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, navigate, returnTo, t]);

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
        onConfirm: () => navigate(returnTo)
      });
    } else {
      navigate(returnTo);
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
        id="kdvFormCardPage"
        icon={<Calculator size={20} />}
        title={isEditing 
          ? (title || t('kdv_duzenle_baslik', 'KDV Grubu Düzenle')) 
          : t('kdv_yeni_baslik', 'Yeni KDV Grubu')
        }
        subtitleLeft={t('kdv_form_aciklama', 'KDV oranı ve tarihsel oran tanımlamalarını yapılandırın.')}
        showBackButton={true}
        onClose={handleClose}
        onSave={handleSave}
        isSaving={isSaving}
      >
        <div className="dynamic-form-fields-container">
          <KdvForm
            initialData={initialData}
            onSuccess={() => navigate(returnTo)}
            onCancel={handleClose}
            onDirtyChange={setIsDirty}
            onTitleChange={setTitle}
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

export default KdvFormPage;
