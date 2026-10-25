/**
 * @file BankaHesaplariPage.tsx
 * @description 
 * Şirket banka hesapları listesi ve yönetim sayfası.
 * BaseSystemPage altyapısını kullanarak banka kartlarını açıklamalı kartlar halinde sunar.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  BaseSystemPage, 
  ActionMenu, 
  IbanView, 
  ParaBirimiView, 
  AlertDialog,
  EkleMenuButton,
  BaseSystemCard 
} from '@akalin/ui';
import { Landmark, Edit2, List, Trash2, Plus, RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface BankaHesabiDto {
  id: number | string;
  bankaAdi: string;
  subeAdi?: string;
  hesapAdi?: string;
  hesapNo?: string;
  iban?: string;
  paraBirimiKod?: string;
  paraBirimiSembol?: string;
  aktifMi?: boolean;
  [key: string]: any;
}

export interface BankaHesaplariPageProps {
  showBackButton?: boolean;
  backRoute?: string;
  onBack?: () => void;
  headerSync?: boolean;
}

const BankaHesaplariPage: React.FC<BankaHesaplariPageProps> = ({
  showBackButton = true,
  backRoute = '/ayarlar/sistem-ayarlari',
  onBack,
  headerSync = true
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [items, setItems] = useState<BankaHesabiDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteTarget, setDeleteTarget] = useState<BankaHesabiDto | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/BankaHesaplari');
      setItems(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (err) {
      console.error('Banka hesapları yüklenemedi:', err);
      toast.error(t('banka_hesaplari_yuklenemedi', 'Banka hesapları yüklenirken hata oluştu.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onAdd = (e?: React.MouseEvent) => {
    const url = `/ayarlar/bankalar/hesaplar/yeni`;
    if (e && e.shiftKey) {
      window.open(url, '_blank');
    } else {
      navigate(url, { state: { returnUrl: '/ayarlar/sistem-ayarlari/BankaHesaplari' } });
    }
  };

  const onEdit = (item: BankaHesabiDto, e?: React.MouseEvent) => {
    const url = `/ayarlar/bankalar/hesaplar/duzenle/${item.id}`;
    if (e && e.shiftKey) {
      window.open(url, '_blank');
    } else {
      navigate(url, { state: { returnUrl: '/ayarlar/sistem-ayarlari/BankaHesaplari' } });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`/api/BankaHesaplari/${deleteTarget.id}`);
      toast.success(t('banka_hesabi_silindi', 'Banka hesabı başarıyla silindi.'));
      setItems(prev => prev.filter(x => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Silme hatası:', err);
      toast.error(err?.response?.data?.message || t('banka_hesabi_silinemedi', 'Banka hesabı silinirken bir hata oluştu.'));
    }
  };

  const searchableFields = useMemo(() => [
    { id: 'Tumu', label: t('tumu', 'Tümü'), type: 'text', placeholder: t('ph_banka_hesaplarinda_ara', 'Banka hesaplarında ara...') },
    { id: 'BankaAdi', label: t('banka_adi', 'Banka Adı'), type: 'text' },
    { id: 'HesapAdi', label: t('hesap_adi', 'Hesap Adı'), type: 'text' },
    { id: 'Iban', label: t('iban', 'IBAN'), type: 'text' }
  ], [t]);

  return (
    <BaseSystemPage
      title={t('BankaHesaplari_baslik', 'Banka Hesapları')}
      subtitle={t('BankaHesaplari_aciklama', 'Vadesiz, vadeli ve ticari banka hesapları ile IBAN tanımlamaları')}
      icon={<Landmark size={24} />}
      baseRoute="/ayarlar/sistem-ayarlari"
      backRoute={backRoute}
      showBackButton={showBackButton}
      onBack={onBack}
      headerSync={headerSync}
      searchPlaceholder={t('ph_banka_hesaplarinda_ara', 'Banka hesaplarında ara...')}
      searchableFields={searchableFields}
      onAdd={onAdd}
      addButtonTitle={t('yeni_hesap_ekle', 'Yeni Hesap Ekle')}
    >
      {({ filterItems, searchTerm, isSearching }) => {
        const filteredData = filterItems(items, (item) => [
          item.bankaAdi,
          item.subeAdi,
          item.hesapAdi,
          item.hesapNo,
          item.iban,
          item.paraBirimiKod
        ]);

        return (
          <div className="relative fade-in flex-1 flex flex-col min-h-0">
            {loading ? (
              <div className="glass-card loading-state flex flex-col items-center justify-center p-40">
                <RefreshCcw size={32} className="spinning loading-icon mb-12 text-secondary" />
                <p className="text-secondary m-0">{t('auto_yukleniyor_4deb', 'Yükleniyor...')}</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="surface-card p-40 text-center flex flex-col items-center justify-center rounded-16 my-16">
                <div className="icon-box-large mb-16 bg-surface-variant">
                  <Landmark size={36} className="text-secondary" />
                </div>
                <h3 className="m-0 text-16 font-semibold text-primary mb-6">
                  {isSearching 
                    ? t('eslesen_banka_hesabi_yok', 'Eşleşen Banka Hesabı Bulunamadı') 
                    : t('banka_hesabi_bulunamadi', 'Kayıtlı banka hesabı bulunamadı.')}
                </h3>
                <p className="text-13 text-secondary max-w-400 mb-16">
                  {isSearching 
                    ? t('auto_arama_kriterine_uygun_sonuc_yok', '"{{term}}" arama kriterine uygun banka hesabı bulunamadı.', { term: searchTerm })
                    : t('banka_hesabi_yok_aciklama', 'Finansal işlemlerinizi takip etmek için yeni bir banka hesabı ekleyebilirsiniz.')}
                </p>
                {!isSearching && (
                  <button type="button" className="btn btn-primary" onClick={onAdd}>
                    <Plus size={16} /> {t('yeni_hesap_ekle', 'Yeni Hesap Ekle')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid-auto-320 gap-20 p-24 overflow-y-auto">
                {filteredData.map((item) => (
                  <BaseSystemCard
                    key={item.id}
                    icon={<Landmark size={24} strokeWidth={1.5} />}
                    title={item.bankaAdi}
                    subtitle={item.subeAdi || '-'}
                    actions={[
                      {
                        label: t('auto_duzenle', 'Düzenle'),
                        icon: <Edit2 size={15} />,
                        onClick: (e) => onEdit(item, e)
                      },
                      {
                        label: t('hareketler', 'Hareketler'),
                        icon: <List size={15} />,
                        onClick: () => navigate(`/ayarlar/bankalar/hesaplar/${item.id}/hareketler`, { state: { returnUrl: '/ayarlar/sistem-ayarlari/BankaHesaplari' } })
                      },
                      {
                        label: t('auto_sil', 'Sil'),
                        icon: <Trash2 size={15} />,
                        danger: true,
                        onClick: () => setDeleteTarget(item)
                      }
                    ]}
                    details={[
                      {
                        label: t('auto_hesap_ismi_5400', 'Hesap İsmi'),
                        value: item.hesapAdi || '-'
                      },
                      {
                        label: t('hesap_no', 'Hesap No'),
                        value: item.hesapNo || '-'
                      },
                      {
                        label: t('iban', 'IBAN'),
                        value: <IbanView value={item.iban} className="text-14" icon={null} />
                      },
                      {
                        label: t('para_birimi', 'Para Birimi'),
                        value: (
                          <ParaBirimiView
                            value={{ kod: item.paraBirimiKod, sembol: item.paraBirimiSembol }}
                            className="text-14"
                            icon={null}
                          />
                        )
                      }
                    ]}
                    status={{
                      active: Boolean(item.aktifMi)
                    }}
                    onClick={(e) => onEdit(item, e)}
                  />
                ))}
              </div>
            )}

            <AlertDialog
              isOpen={!!deleteTarget}
              onClose={() => setDeleteTarget(null)}
              type="confirm"
              title={t('banka_hesabi_sil_baslik', 'Banka Hesabı Silinecek')}
              message={t('banka_hesabi_sil_onay', '"{{ad}}" banka hesabını silmek istediğinize emin misiniz?', { ad: deleteTarget?.hesapAdi || deleteTarget?.bankaAdi })}
              confirmText={t('auto_sil', 'Sil')}
              cancelText={t('auto_iptal', 'İptal')}
              onConfirm={handleDeleteConfirm}
            />
          </div>
        );
      }}
    </BaseSystemPage>
  );
};

export default BankaHesaplariPage;
