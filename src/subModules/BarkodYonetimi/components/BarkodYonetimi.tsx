/**
 * @file BarkodYonetimi.tsx
 * @description Barkod yönetimi, ITF-14 üretici, dahili barkod ve etiket basımı yönetim paneli.
 * BaseSystemPage sayfasından türetilmiştir.
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Barcode, Box, Printer, List, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { DataTable, BaseSystemPage, BaseTabItem } from '@akalin/ui';

export interface BarkodYonetimiProps {
  showBackButton?: boolean;
  backRoute?: string;
  onBack?: () => void;
  headerSync?: boolean;
}

const BarkodYonetimi: React.FC<BarkodYonetimiProps> = ({
  showBackButton = true,
  backRoute = '/ayarlar/sistem-ayarlari',
  onBack,
  headerSync = true
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('liste');
  const [baseBarkod, setBaseBarkod] = useState('');
  const [ambalajSeviyesi, setAmbalajSeviyesi] = useState('1');
  const [generatedItf14, setGeneratedItf14] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tabs: BaseTabItem[] = useMemo(() => [
    { 
      id: 'liste', 
      label: t('auto_tum_barkodlar', 'Tüm Barkodlar'), 
      icon: <List size={16} />,
      content: (
        <div className="surface-card flex flex-col flex-1 min-h-0 overflow-y-auto rounded-16 border border-glass p-20">
          <DataTable
            columns={[
              { header: t('auto_barkod', 'Barkod'), accessor: 'barkod', sortable: true },
              { header: t('Tip', 'Tip'), accessor: 'tip' },
              { header: t('Birim', 'Birim'), accessor: 'birimTipi' },
              { header: t('auto_urun_adi', 'Ürün Adı'), accessor: 'urunAdi' },
              { header: t('auto_urun_kodu', 'Ürün Kodu'), accessor: 'urunKodu' },
              { 
                header: t('auto_varsayilan', 'Varsayılan'), 
                accessor: 'varsayilanMi', 
                render: (item) => item.varsayilanMi ? t('Evet', 'Evet') : t('Hayir', 'Hayır') 
              }
            ]}
            fetchData={async () => {
              const res = await axios.get('/api/BarkodYonetimi/list');
              return { data: res.data };
            }}
            pageSize={10}
            emptyMessage={t('auto_henuz_barkod_bulunamadi', 'Sistemde henüz kayıtlı barkod bulunamadı.')}
          />
        </div>
      )
    },
    { 
      id: 'itf14', 
      label: t('auto_itf14_uretici', 'ITF-14 Üretici'), 
      icon: <Box size={16} />,
      content: (
        <div className="flex flex-col gap-20 p-20">
          <div className="surface-card p-24 rounded-16 border border-glass">
            <div className="form-grid items-end gap-16">
              <div>
                <label className="form-label">{t('auto_urun_barkodu_ean13_b10f', 'Ürün Barkodu (EAN-13)')}</label>
                <input 
                  type="text" 
                  placeholder={t('ph_ornek_barkod', 'Örn: 8691234567891')} 
                  value={baseBarkod} 
                  onChange={e => setBaseBarkod(e.target.value)} 
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">{t('auto_ambalaj_seviyesi', 'Ambalaj Seviyesi (1-8)')}</label>
                <select 
                  value={ambalajSeviyesi} 
                  onChange={e => setAmbalajSeviyesi(e.target.value)}
                  className="form-input"
                >
                  <option value="1">{t('auto_ambalaj_seviye_1', '1 - Birinci Seviye Koli (Örn: 12\'li Kutu)')}</option>
                  <option value="2">{t('auto_ambalaj_seviye_2', '2 - İkinci Seviye Koli (Örn: 24\'lü Koli)')}</option>
                  <option value="3">{t('auto_3_ucuncu_seviye_koli_5ffb', '3 - Üçüncü Seviye Koli (Örn: Palet)')}</option>
                </select>
              </div>
              <div>
                <button 
                  onClick={async () => {
                    try {
                      setError(null);
                      const res = await axios.get(`/api/BarkodYonetimi/generate-itf14?baseBarkod=${baseBarkod}&ambalajSeviyesi=${ambalajSeviyesi}`);
                      setGeneratedItf14(res.data.itf14);
                    } catch (err: any) {
                      setError(err.response?.data || t('auto_bir_hata_olustu', 'Bir hata oluştu.'));
                      setGeneratedItf14(null);
                    }
                  }} 
                  disabled={!baseBarkod || baseBarkod.length < 12}
                  className="btn btn-primary flex items-center gap-8 h-42"
                >
                  <Box size={16} /> {t('auto_koli_barkodu_uret', 'Koli Barkodu Üret')}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}

          {generatedItf14 && (
            <div className="surface-card p-24 rounded-16 border-success flex flex-col items-center gap-16">
              <div className="flex items-center gap-8 text-success font-bold text-15">
                <CheckCircle size={20} /> {t('auto_itf14_basariyla_uretildi', 'ITF-14 Başarıyla Üretildi')}
              </div>
              <div className="barcode-display font-mono text-24 font-bold tracking-widest text-primary p-16 bg-surface-variant rounded-12 border border-glass">
                {generatedItf14}
              </div>
              <div className="text-13 text-secondary">{t('auto_bu_barkodu_ilgili_ur_c658', 'Bu barkodu koli ve ambalaj etiketlerinizde kullanabilirsiniz.')}</div>
            </div>
          )}
        </div>
      )
    },
    { 
      id: 'dahili', 
      label: t('auto_dahili_barkod', 'Dahili Barkod'), 
      icon: <Barcode size={16} />,
      content: (
        <div className="surface-card p-40 text-center flex flex-col items-center justify-center rounded-16 m-20">
          <Barcode size={36} className="text-secondary opacity-50 mb-16" />
          <h4 className="m-0 mb-8 text-primary">{t('auto_dahili_barkod_uretic_be6a', 'Dahili Barkod Üretici')}</h4>
          <p className="m-0 text-secondary text-14">{t('auto_isletmenize_ozel_ser_7598', 'İşletmenize özel seri barkodlar ve dahili takip kodları oluşturun.')}</p>
        </div>
      )
    },
    { 
      id: 'etiket', 
      label: t('auto_etiket_basimi', 'Etiket Basımı'), 
      icon: <Printer size={16} />,
      content: (
        <div className="surface-card p-40 text-center flex flex-col items-center justify-center rounded-16 m-20">
          <Printer size={36} className="text-secondary opacity-50 mb-16" />
          <h4 className="m-0 mb-8 text-primary">{t('auto_etiket_tasarimi_ve_b_0ccf', 'Etiket Tasarımı ve Basımı')}</h4>
          <p className="m-0 text-secondary text-14">{t('auto_urunleriniz_icin_ter_f087', 'Termal ve lazer yazıcılar için özel etiket şablonları tasarlayın ve yazdırın.')}</p>
        </div>
      )
    },
  ], [t, baseBarkod, ambalajSeviyesi, generatedItf14, error]);

  return (
    <BaseSystemPage
      title={t('BarkodYonetimi_baslik', 'Barkod Yönetimi')}
      subtitle={t('BarkodYonetimi_aciklama', 'Sistemdeki tüm barkodları yönetin, koli barkodları (ITF-14) üretin ve etiket şablonlarını tasarlayın.')}
      icon={<Barcode size={24} />}
      baseRoute="/ayarlar/sistem-ayarlari"
      backRoute={backRoute}
      showBackButton={showBackButton}
      onBack={onBack}
      headerSync={headerSync}
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(String(id))}
      hideIfSingleTab={true}
    />
  );
};

export default BarkodYonetimi;
