/**
 * @file TuketiciKredisiFirmalari.tsx
 * @description 
 * Tüketici kredisi firmaları listesi ve yönetim sayfası.
 * BaseSystemPage altyapısını kullanarak anlaşmalı finansman ve kredi kuruluşlarını kartlar halinde sunar.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Edit2, Trash2, Plus, RefreshCcw } from 'lucide-react';
import { BaseSystemPage, ActionMenu, AlertDialog, BaseSystemCard } from '@akalin/ui';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import axios from 'axios';

export interface TuketiciKredisiFirmasiDto {
  id: number | string;
  ad: string;
  kod: string;
  bankaAdi?: string;
  hesapAdi?: string;
  paraBirimiId?: number;
  aktifMi?: boolean;
  [key: string]: any;
}

export interface TuketiciKredisiFirmalariProps {
  showBackButton?: boolean;
  backRoute?: string;
  onBack?: () => void;
  headerSync?: boolean;
}

const TuketiciKredisiFirmalari: React.FC<TuketiciKredisiFirmalariProps> = ({
  showBackButton = true,
  backRoute = '/ayarlar/sistem-ayarlari',
  onBack,
  headerSync = true
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [items, setItems] = useState<TuketiciKredisiFirmasiDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteTarget, setDeleteTarget] = useState<TuketiciKredisiFirmasiDto | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/TuketiciKredisiFirmalari');
      setItems(Array.isArray(res.data) ? res.data : (res.data?.items || []));
    } catch (err) {
      console.error('Tüketici kredisi firmaları yüklenemedi:', err);
      toast.error(t('tuketici_kredisi_firmalari_yuklenemedi', 'Tüketici kredisi firmaları yüklenirken hata oluştu.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onAdd = (e?: React.MouseEvent) => {
    const url = `/ayarlar/sistem-ayarlari/TuketiciKredisiFirmalari/yeni`;
    if (e && e.shiftKey) {
      window.open(url, '_blank');
    } else {
      navigate(url, { state: { returnUrl: '/ayarlar/sistem-ayarlari/TuketiciKredisiFirmalari' } });
    }
  };

  const onEdit = (item: TuketiciKredisiFirmasiDto, e?: React.MouseEvent) => {
    const url = `/ayarlar/sistem-ayarlari/TuketiciKredisiFirmalari/duzenle/${item.id}`;
    if (e && e.shiftKey) {
      window.open(url, '_blank');
    } else {
      navigate(url, { state: { returnUrl: '/ayarlar/sistem-ayarlari/TuketiciKredisiFirmalari' } });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`/api/TuketiciKredisiFirmalari/${deleteTarget.id}`);
      toast.success(t('tuketici_kredisi_firmasi_silindi', 'Tüketici kredisi firması başarıyla silindi.'));
      setItems(prev => prev.filter(x => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Silme hatası:', err);
      toast.error(err?.response?.data?.message || t('tuketici_kredisi_firmasi_silinemedi', 'Tüketici kredisi firması silinirken bir hata oluştu.'));
    }
  };

  const searchableFields = useMemo(() => [
    { id: 'Tumu', label: t('tumu', 'Tümü'), type: 'text', placeholder: t('ph_tuketici_kredisi_ara', 'Tüketici kredisi firmalarında ara...') },
    { id: 'Ad', label: t('firma_adi', 'Firma Adı'), type: 'text' },
    { id: 'Kod', label: t('firma_kodu', 'Firma Kodu'), type: 'text' },
    { id: 'Banka', label: t('banka_adi', 'Banka Adı'), type: 'text' }
  ], [t]);

  return (
    <BaseSystemPage
      title={t('TuketiciKredisiFirmalari_baslik', 'Tüketici Kredisi Firmaları')}
      subtitle={t('TuketiciKredisiFirmalari_aciklama', 'Tüketici kredisi finansman kuruluşları ayarları ve taksit komisyonları.')}
      icon={<Coins size={24} />}
      baseRoute="/ayarlar/sistem-ayarlari"
      backRoute={backRoute}
      showBackButton={showBackButton}
      onBack={onBack}
      headerSync={headerSync}
      searchPlaceholder={t('ph_tuketici_kredisi_ara', 'Tüketici kredisi firmalarında ara...')}
      searchableFields={searchableFields}
      onAdd={onAdd}
      addButtonTitle={t('yeni_tkf_ekle', 'Yeni Firma Ekle')}
    >
      {({ filterItems, searchTerm, isSearching }) => {
        const filteredData = filterItems(items, (item) => [
          item.ad,
          item.kod,
          item.bankaAdi,
          item.hesapAdi
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
                  <Coins size={36} className="text-secondary" />
                </div>
                <h3 className="m-0 text-16 font-semibold text-primary mb-6">
                  {isSearching 
                    ? t('eslesen_tkf_bulunamadi', 'Eşleşen Tüketici Kredisi Firması Bulunamadı') 
                    : t('TuketiciKredisiFirmalari_empty', 'Henüz tüketici kredisi firması tanımlanmamış.')}
                </h3>
                <p className="text-13 text-secondary max-w-400 mb-16">
                  {isSearching 
                    ? t('auto_arama_kriterine_uygun_sonuc_yok', '"{{term}}" arama kriterine uygun tüketici kredisi firması bulunamadı.', { term: searchTerm })
                    : t('tkf_yok_aciklama', 'Müşterilerinize kredi ve taksit imkanları sunmak için yeni bir tüketici kredisi firması ekleyebilirsiniz.')}
                </p>
                {!isSearching && (
                  <button type="button" className="btn btn-primary" onClick={onAdd}>
                    <Plus size={16} /> {t('yeni_tkf_ekle', 'Yeni Firma Ekle')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid-auto-320 gap-20 p-24 overflow-y-auto">
                {filteredData.map((item) => (
                  <BaseSystemCard
                    key={item.id}
                    icon={<Coins size={24} />}
                    iconBoxVariant="warning"
                    title={item.ad}
                    subtitle={item.kod}
                    actions={[
                      {
                        label: t('auto_duzenle', 'Düzenle'),
                        icon: <Edit2 size={15} />,
                        onClick: (e) => onEdit(item, e)
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
                        label: t('TuketiciKredisiFirmalari_banka', 'Banka'),
                        value: item.bankaAdi || '-'
                      },
                      {
                        label: t('TuketiciKredisiFirmalari_hesap', 'Banka Hesabı'),
                        value: item.hesapAdi || '-'
                      }
                    ]}
                    status={{
                      active: item.aktifMi !== false
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
              title={t('tkf_sil_baslik', 'Tüketici Kredisi Firması Silinecek')}
              message={t('tkf_sil_onay', '"{{ad}}" tüketici kredisi firmasını silmek istediğinize emin misiniz?', { ad: deleteTarget?.ad })}
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

export default TuketiciKredisiFirmalari;
