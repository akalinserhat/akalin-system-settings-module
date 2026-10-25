/**
 * @file Kullanicilar.tsx
 * @description 
 * Personel ve kullanıcı hesapları listesi ve yönetim sayfası.
 * BaseSystemPage altyapısını kullanarak aktif personelleri ve bekleyen davetleri sunar.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, 
  Shield, 
  Key, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Search, 
  Edit2, 
  Trash2, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Plus,
  RefreshCcw
} from 'lucide-react';
import { BaseSystemPage, ActionMenu, AlertDialog, BaseSystemCard } from '@akalin/ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { kullanicilarService } from '../services/KullanicilarService';
import { KullaniciDto, FirmaDavetListDto } from '../dtos/KullaniciDto';

export interface KullanicilarProps {
  showBackButton?: boolean;
  backRoute?: string;
  onBack?: () => void;
  headerSync?: boolean;
}

export default function Kullanicilar({
  showBackButton = true,
  backRoute = '/ayarlar/sistem-ayarlari',
  onBack,
  headerSync = true
}: KullanicilarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeSubTab, setActiveSubTab] = useState<'personeller' | 'davetler'>('personeller');
  const [personeller, setPersoneller] = useState<KullaniciDto[]>([]);
  const [personelLoading, setPersonelLoading] = useState(true);
  const [davetler, setDavetler] = useState<FirmaDavetListDto[]>([]);
  const [davetlerLoading, setDavetlerLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KullaniciDto | null>(null);

  const loadPersoneller = useCallback(async () => {
    setPersonelLoading(true);
    try {
      const res = await kullanicilarService.getAll();
      setPersoneller(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      toast.error(t('personeller_yuklenemedi', 'Personel listesi yüklenemedi.'));
    } finally {
      setPersonelLoading(false);
    }
  }, [t]);

  const fetchDavetler = useCallback(async () => {
    try {
      setDavetlerLoading(true);
      const res = await kullanicilarService.getDavetler();
      setDavetler(res || []);
    } catch {
      // sessiz hata
    } finally {
      setDavetlerLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPersoneller();
    fetchDavetler();
  }, [loadPersoneller, fetchDavetler]);

  const handleDavetIptal = async (davetId: number) => {
    try {
      await kullanicilarService.davetIptal(davetId);
      toast.success(t('davet_iptal_edildi', 'Davet başarıyla iptal edildi.'));
      setDavetler(prev => prev.filter(d => d.id !== davetId));
    } catch (err: any) {
      toast.error(err?.response?.data?.mesaj || t('davet_iptal_edilemedi', 'Davet iptal edilirken bir hata oluştu.'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await kullanicilarService.delete(deleteTarget.id);
      toast.success(t('personel_silindi', 'Personel kaydı silindi.'));
      setPersoneller(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.mesaj || t('personel_silinemedi', 'Personel silinirken bir hata oluştu.'));
    }
  };

  const onAdd = (e?: React.MouseEvent) => {
    const url = '/ayarlar/kullanicilar/yeni';
    if (e && e.shiftKey) {
      window.open(url, '_blank');
    } else {
      navigate(url, { state: { returnUrl: '/ayarlar/sistem-ayarlari' } });
    }
  };

  const onEdit = (user: KullaniciDto, e?: React.MouseEvent) => {
    const url = `/ayarlar/kullanicilar/${user.id}`;
    if (e && e.shiftKey) {
      window.open(url, '_blank');
    } else {
      navigate(url, { state: { returnUrl: '/ayarlar/sistem-ayarlari' } });
    }
  };

  const pendingDavetCount = davetler.filter(d => !d.kullanildiMi && new Date(d.gecerlilikTarihi) > new Date()).length;

  const searchableFields = useMemo(() => [
    { id: 'Tumu', label: t('tumu', 'Tümü'), type: 'text', placeholder: t('ph_personel_ara', 'Personel veya davetlerde ara...') },
    { id: 'AdSoyad', label: t('ad_soyad', 'Ad Soyad'), type: 'text' },
    { id: 'Email', label: t('eposta', 'E-Posta'), type: 'text' },
    { id: 'Rol', label: t('rol', 'Rol'), type: 'text' }
  ], [t]);

  return (
    <BaseSystemPage
      title={t('personel_yonetimi', 'Personel Yönetimi')}
      subtitle={t('personel_yonetimi_aciklama', 'Sistemi kullanacak personelleri, rollerini ve erişim yetkilerini yönetin.')}
      icon={<Users size={24} />}
      baseRoute="/ayarlar/sistem-ayarlari"
      backRoute={backRoute}
      showBackButton={showBackButton}
      onBack={onBack}
      headerSync={headerSync}
      searchPlaceholder={t('ph_personel_ara', 'Personel veya davetlerde ara...')}
      searchableFields={searchableFields}
      onAdd={onAdd}
      addButtonTitle={t('personel_davet_et', 'Personel Davet Et')}
    >
      {({ filterItems, searchTerm, isSearching }) => {
        const filteredPersonel = filterItems(personeller, (k) => [
          k.adSoyad,
          k.email,
          k.rolAd,
          k.telefon
        ]);

        const filteredDavetler = filterItems(davetler, (d) => [
          d.email,
          d.rol,
          d.davetEdenKullanici
        ]);

        return (
          <div className="relative fade-in flex-1 flex flex-col min-h-0">
            {/* Üst Alt-Sekmeler */}
            <div className="p-24 pb-0 flex items-center gap-12">
              <div className="kullanicilar-tabs">
                <button
                  type="button"
                  className={`kullanicilar-tab-btn ${activeSubTab === 'personeller' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('personeller')}
                >
                  <Users size={16} />
                  <span>{t('personeller', 'Personeller')}</span>
                  <span className="kullanicilar-badge">{personeller.length}</span>
                </button>

                <button
                  type="button"
                  className={`kullanicilar-tab-btn ${activeSubTab === 'davetler' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSubTab('davetler');
                    fetchDavetler();
                  }}
                >
                  <Send size={16} />
                  <span>{t('bekleyen_davetler', 'Bekleyen Davetler')}</span>
                  {pendingDavetCount > 0 && (
                    <span className="kullanicilar-badge">{pendingDavetCount}</span>
                  )}
                </button>
              </div>
            </div>

            {/* İçerik */}
            {activeSubTab === 'personeller' && (
              personelLoading ? (
                <div className="glass-card loading-state flex flex-col items-center justify-center p-40">
                  <RefreshCcw size={32} className="spinning loading-icon mb-12 text-secondary" />
                  <p className="text-secondary m-0">{t('auto_yukleniyor_4deb', 'Yükleniyor...')}</p>
                </div>
              ) : filteredPersonel.length === 0 ? (
                <div className="surface-card p-40 text-center flex flex-col items-center justify-center rounded-16 my-16 mx-24">
                  <div className="icon-box-large mb-16 bg-surface-variant">
                    <Users size={36} className="text-secondary" />
                  </div>
                  <h3 className="m-0 text-16 font-semibold text-primary mb-6">
                    {isSearching 
                      ? t('eslesen_personel_yok', 'Eşleşen Personel Bulunamadı') 
                      : t('personel_bulunamadi', 'Kayıtlı personel bulunamadı.')}
                  </h3>
                  <p className="text-13 text-secondary max-w-400 mb-16">
                    {isSearching 
                      ? t('auto_arama_kriterine_uygun_sonuc_yok', '"{{term}}" arama kriterine uygun kayıt bulunamadı.', { term: searchTerm })
                      : t('personel_yok_aciklama', 'İşletmenizde çalışacak personelleri eklemek için davet gönderebilirsiniz.')}
                  </p>
                  {!isSearching && (
                    <button type="button" className="btn btn-primary" onClick={onAdd}>
                      <Plus size={16} /> {t('personel_davet_et', 'Personel Davet Et')}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid-auto-320 gap-20 p-24 overflow-y-auto">
                  {filteredPersonel.map((k) => (
                    <BaseSystemCard
                      key={k.id}
                      icon={k.adSoyad ? k.adSoyad.charAt(0).toUpperCase() : <Users size={20} />}
                      title={k.adSoyad || t('isimsiz_kullanici', 'İsimsiz Kullanıcı')}
                      subtitle={
                        <span className="flex items-center gap-4 text-12">
                          <Mail size={12} />
                          <span>{k.email}</span>
                        </span>
                      }
                      badge={
                        <span className="badge badge-secondary text-11 flex items-center gap-4">
                          <Key size={11} /> {k.rolAd || t('rolsuz', 'Rol Yok')}
                        </span>
                      }
                      actions={[
                        {
                          label: t('auto_duzenle', 'Düzenle'),
                          icon: <Edit2 size={15} />,
                          onClick: (e) => onEdit(k, e)
                        },
                        {
                          label: t('auto_sil', 'Sil'),
                          icon: <Trash2 size={15} />,
                          danger: true,
                          onClick: () => setDeleteTarget(k)
                        }
                      ]}
                      middleContent={
                        k.lokasyonAdlari && k.lokasyonAdlari.length > 0 ? (
                          <div className="flex flex-wrap gap-4 mt-2">
                            {k.lokasyonAdlari.map((locName, lIdx) => (
                              <span key={lIdx} className="badge badge-secondary text-11 flex items-center gap-4">
                                <MapPin size={10} />
                                {locName}
                              </span>
                            ))}
                          </div>
                        ) : undefined
                      }
                      details={[
                        ...(k.telefon ? [{
                          label: t('telefon', 'Telefon'),
                          value: k.telefon
                        }] : [])
                      ]}
                      status={{
                        active: Boolean(k.aktifMi)
                      }}
                      footer={
                        k.eklenmeTarihi ? (
                          <div className="flex justify-between items-center text-11 text-secondary w-full">
                            <span>{t('eklenme_tarihi', 'Eklenme')}</span>
                            <span>{new Date(k.eklenmeTarihi).toLocaleDateString('tr-TR')}</span>
                          </div>
                        ) : undefined
                      }
                      onClick={(e) => onEdit(k, e)}
                    />
                  ))}
                </div>
              )
            )}

            {activeSubTab === 'davetler' && (
              davetlerLoading ? (
                <div className="glass-card loading-state flex flex-col items-center justify-center p-40">
                  <RefreshCcw size={32} className="spinning loading-icon mb-12 text-secondary" />
                  <p className="text-secondary m-0">{t('auto_yukleniyor_4deb', 'Yükleniyor...')}</p>
                </div>
              ) : (
                <div className="p-24 overflow-x-auto">
                  <table className="kullanicilar-table">
                    <thead className="kullanicilar-thead">
                      <tr>
                        <th className="kullanicilar-th-icon"><Mail size={16} /></th>
                        <th className="kullanicilar-th">{t('davet_edilen_eposta', 'Davet Edilen E-Posta')}</th>
                        <th className="kullanicilar-th">{t('sistem_rolu', 'Sistem Rolü')}</th>
                        <th className="kullanicilar-th">{t('davet_eden', 'Davet Eden')}</th>
                        <th className="kullanicilar-th">{t('son_gecerlilik', 'Son Geçerlilik')}</th>
                        <th className="kullanicilar-th-center">{t('durum', 'Durum')}</th>
                        <th className="kullanicilar-th-action">{t('auto_islem_792e', 'İşlem')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDavetler.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="kullanicilar-empty text-center p-40">
                            <div className="flex-col items-center gap-12">
                              <Send size={48} className="kullanicilar-empty-icon text-secondary opacity-40 mb-8" />
                              <span className="text-secondary">{t('bekleyen_davet_bulunamadi', 'Bekleyen veya geçmiş davet bulunamadı.')}</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredDavetler.map((d) => {
                          const isExpired = new Date(d.gecerlilikTarihi) < new Date();
                          const isUsed = d.kullanildiMi;

                          return (
                            <tr key={d.id} className="kullanicilar-tr">
                              <td className="kullanicilar-td-center">
                                <div className="kullanicilar-avatar">
                                  <Mail size={18} />
                                </div>
                              </td>

                              <td className="kullanicilar-td">
                                <div className="flex-col gap-4">
                                  <span className="font-600 text-14 text-primary">{d.email}</span>
                                  <span className="text-12 text-secondary flex-row items-center gap-4">
                                    <Clock size={12} />
                                    {new Date(d.olusturulmaTarihi).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </td>

                              <td className="kullanicilar-td">
                                <div className="flex-row flex-wrap gap-6 items-center">
                                  {(d.roller && d.roller.length > 0 
                                    ? d.roller 
                                    : (d.rol || '').split(',').map(r => r.trim()).filter(Boolean)
                                  ).map((rName, idx) => (
                                    <span key={idx} className="kullanicilar-role-badge">
                                      <Key size={12} /> {rName}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="kullanicilar-td text-secondary text-13">
                                {d.davetEdenKullanici || t('yonetici', 'Yönetici')}
                              </td>

                              <td className="kullanicilar-td text-secondary text-13">
                                <div className="flex-row items-center gap-6">
                                  <Calendar size={14} />
                                  <span>
                                    {new Date(d.gecerlilikTarihi).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </td>

                              <td className="kullanicilar-td-center">
                                {isUsed ? (
                                  <span className="kullanicilar-status-badge active">
                                    <CheckCircle2 size={12} />
                                    <span>{t('kabul_edildi', 'Kabul Edildi')}</span>
                                  </span>
                                ) : isExpired ? (
                                  <span className="kullanicilar-status-badge expired">
                                    <AlertTriangle size={12} />
                                    <span>{t('suresi_doldu', 'Süresi Doldu')}</span>
                                  </span>
                                ) : (
                                  <span className="kullanicilar-status-badge pending">
                                    <Clock size={12} />
                                    <span>{t('bekliyor', 'Bekliyor')}</span>
                                  </span>
                                )}
                              </td>

                              <td className="kullanicilar-td-center">
                                {!isUsed && !isExpired && (
                                  <button
                                    type="button"
                                    className="btn-icon text-danger"
                                    onClick={() => handleDavetIptal(d.id)}
                                    title={t('daveti_iptal_et', 'Daveti İptal Et')}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )
            )}

            <AlertDialog
              isOpen={!!deleteTarget}
              onClose={() => setDeleteTarget(null)}
              type="confirm"
              title={t('personel_sil_baslik', 'Personel Silinecek')}
              message={t('personel_sil_onay', '"{{ad}}" personelini sistemden silmek istediğinize emin misiniz?', { ad: deleteTarget?.adSoyad || deleteTarget?.email })}
              confirmText={t('auto_sil', 'Sil')}
              cancelText={t('auto_iptal', 'İptal')}
              onConfirm={handleDeleteConfirm}
            />
          </div>
        );
      }}
    </BaseSystemPage>
  );
}
