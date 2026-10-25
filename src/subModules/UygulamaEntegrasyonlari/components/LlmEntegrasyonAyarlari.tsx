import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, Zap, Bot, Package, TrendingUp, CheckCircle2, 
  Coins, ShoppingCart, MessageSquare, ArrowUpRight, ShieldCheck, History
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface LlmEntegrasyonAyarlariProps {
  hideHeader?: boolean;
}

const LlmEntegrasyonAyarlari: React.FC<LlmEntegrasyonAyarlariProps> = ({ hideHeader = false }) => {
  const { t } = useTranslation();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  // Mock firma token bakiyesi ve kullanım verileri
  const tokenStats = {
    toplamKredi: 500000,
    harcananKredi: 74200,
    kalanKredi: 425800,
    toplamIstek: 1284,
    paketAdi: 'Profesyonel Plan',
    yenilenmeTarihi: '01.09.2026'
  };

  const dolulukOrani = Math.round((tokenStats.harcananKredi / tokenStats.toplamKredi) * 100);

  // Kullanılabilir Ajanlar
  const assistants = [
    {
      id: 'genel-asistan',
      name: 'Webakus ERP Akıllı Asistanı',
      role: 'Baş Danışman',
      description: 'Tüm ERP modüllerinde soru-cevap, ekran yönlendirmesi ve işlem rehberliği yapar.',
      icon: <Sparkles size={22} className="text-accent-primary" />,
      badgeColor: 'rgba(99, 102, 241, 0.12)',
      textColor: 'var(--accent-primary)',
      islemSayisi: 840
    },
    {
      id: 'stok-denetci',
      name: 'Stok & Barkod Denetçisi',
      role: 'Envanter Uzmanı',
      description: 'Kritik stok seviyelerini, depo hareketlerini ve sayım farklarını denetler.',
      icon: <Package size={22} className="text-success" />,
      badgeColor: 'rgba(16, 185, 129, 0.12)',
      textColor: '#10b981',
      islemSayisi: 295
    },
    {
      id: 'muhasebe-uzman',
      name: 'Muhasebe & Finans Danışmanı',
      role: 'Mali İşler & Mevzuat',
      description: 'Cari yaşlandırma, KDV oranları, e-Dönüşüm ve fatura dökümlerini analiz eder.',
      icon: <TrendingUp size={22} className="text-warning" />,
      badgeColor: 'rgba(245, 158, 11, 0.12)',
      textColor: '#f59e0b',
      islemSayisi: 149
    }
  ];

  // Token Satın Alma Paketleri
  const packages = [
    {
      id: 'pack_100k',
      name: t('AiKullanim_paketBaslangic') || 'Başlangıç Paketi',
      tokens: '100.000 Token',
      price: '₺199',
      unitPrice: '₺0.0019 / token',
      popular: false,
      features: ['100.000 Token Kredisi', 'Tüm ERP Asistanlarına Erişim', '7/24 Standart Yanıt Hızı', 'Süre Sınırı Yok']
    },
    {
      id: 'pack_500k',
      name: t('AiKullanim_paketPro') || 'Profesyonel Paket',
      tokens: '500.000 Token',
      price: '₺799',
      unitPrice: '₺0.0015 / token',
      popular: true,
      features: ['500.000 Token Kredisi', 'Öncelikli GPU Yanıt Hızı', 'Gelişmiş Raporlama & Analiz', 'Süre Sınırı Yok']
    },
    {
      id: 'pack_2m',
      name: t('AiKullanim_paketKurumsal') || 'Kurumsal Paket',
      tokens: '2.000.000 Token',
      price: '₺2.499',
      unitPrice: '₺0.0012 / token',
      popular: false,
      features: ['2.000.000 Token Kredisi', 'En Yüksek Yanıt Hızı (Turbo)', 'Özel ERP Fonksiyon Entegrasyonu', 'Süre Sınırı Yok']
    }
  ];

  // Son İşlemler
  const recentActivities = [
    { id: 1, tarih: 'Bugün 11:42', asistan: 'Stok & Barkod Denetçisi', soru: 'Depo 1 için kritik seviyedeki ürünleri listele', token: '142 Token', durum: 'Başarılı' },
    { id: 2, tarih: 'Bugün 10:15', asistan: 'Webakus ERP Akıllı Asistanı', soru: 'Satış faturasında tevkifat nasıl uygulanır?', token: '88 Token', durum: 'Başarılı' },
    { id: 3, tarih: 'Dün 16:30', asistan: 'Muhasebe & Finans Danışmanı', soru: 'Bu ayın vadesi geçen cari bakiyelerini özetle', token: '210 Token', durum: 'Başarılı' },
    { id: 4, tarih: 'Dün 14:05', asistan: 'Webakus ERP Akıllı Asistanı', soru: 'Yeni cari hesap açma adımları', token: '65 Token', durum: 'Başarılı' }
  ];

  const handlePurchase = (packId: string, packName: string) => {
    setPurchasing(packId);
    setTimeout(() => {
      setPurchasing(null);
      toast.success(`${packName} talebiniz alındı. Ödeme adımına yönlendiriliyorsunuz.`);
    }, 800);
  };

  return (
    <div className="flex-1 p-24 overflow-y-auto flex flex-col gap-24">
      {/* Üst Başlık & Açıklama */}
      {!hideHeader && (
        <div>
          <h2 className="text-xl font-bold m-0 mb-8 flex items-center gap-8">
            <Sparkles className="text-accent-primary" size={24} />
            {t('AiKullanim_baslik') || 'Yapay Zeka & Akıllı Asistan Yönetimi'}
          </h2>
          <p className="text-secondary m-0">
            {t('AiKullanim_aciklama') || 'Webakus AI akıllı asistanları, kalan token kredisi ve kullanım istatistikleri.'}
          </p>
        </div>
      )}

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
        {/* Kalan Kredi Kartı */}
        <div className="surface-card p-20 rounded-16 border border-glass flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-secondary text-sm mb-8">
              <span>{t('AiKullanim_kalanKredi') || 'Kalan Token Kredisi'}</span>
              <Coins size={18} className="text-accent-primary" />
            </div>
            <div className="text-2xl font-bold text-primary mb-8">
              {tokenStats.kalanKredi.toLocaleString('tr-TR')}
            </div>
          </div>
          <div>
            <div className="w-full bg-hover rounded-full h-8 overflow-hidden mb-6">
              <div 
                className="bg-accent h-full rounded-full transition-all duration-300"
                style={{ width: `${100 - dolulukOrani}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-secondary">
              <span>%{100 - dolulukOrani} Kullanılabilir</span>
              <span>Toplam: {tokenStats.toplamKredi.toLocaleString('tr-TR')}</span>
            </div>
          </div>
        </div>

        {/* Toplam Soru / İşlem */}
        <div className="surface-card p-20 rounded-16 border border-glass flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary text-sm mb-8">
            <span>{t('AiKullanim_toplamSoru') || 'Toplam AI İşlemi'}</span>
            <Zap size={18} className="text-warning" />
          </div>
          <div className="text-2xl font-bold text-primary">
            {tokenStats.toplamIstek.toLocaleString('tr-TR')}
          </div>
          <div className="text-xs text-success flex items-center gap-4 mt-8">
            <ArrowUpRight size={14} />
            <span>Bu ay %18 artış</span>
          </div>
        </div>

        {/* Aktif Asistanlar */}
        <div className="surface-card p-20 rounded-16 border border-glass flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary text-sm mb-8">
            <span>{t('AiKullanim_aktifAsistanlar') || 'Aktif ERP Asistanları'}</span>
            <Bot size={18} className="text-success" />
          </div>
          <div className="text-2xl font-bold text-primary">
            {assistants.length} Asistan
          </div>
          <div className="text-xs text-secondary mt-8">
            ERP Araç Yetkisi: Tam Yetkili
          </div>
        </div>

        {/* Mevcut Plan */}
        <div className="surface-card p-20 rounded-16 border border-glass flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary text-sm mb-8">
            <span>{t('AiKullanim_paketPlani') || 'Mevcut AI Paketi'}</span>
            <ShieldCheck size={18} className="text-accent-primary" />
          </div>
          <div className="text-lg font-bold text-primary">
            {tokenStats.paketAdi}
          </div>
          <div className="text-xs text-secondary mt-8">
            Yenilenme: {tokenStats.yenilenmeTarihi}
          </div>
        </div>
      </div>

      {/* Kullanılabilir Akıllı Asistanlar */}
      <div>
        <h3 className="font-bold text-base m-0 mb-16 text-primary flex items-center gap-8">
          <Bot size={18} className="text-accent-primary" />
          {t('AiKullanim_asistanlarBaslik') || 'Kullanabileceğiniz Akıllı Asistanlar'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {assistants.map((ast) => (
            <div key={ast.id} className="surface-card p-20 rounded-16 border border-glass flex flex-col justify-between gap-16">
              <div>
                <div className="flex items-center gap-12 mb-12">
                  <div 
                    className="w-40 h-40 rounded-12 flex items-center justify-center"
                    style={{ background: ast.badgeColor }}
                  >
                    {ast.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-base m-0 text-primary">{ast.name}</h4>
                    <span className="text-xs font-semibold" style={{ color: ast.textColor }}>{ast.role}</span>
                  </div>
                </div>
                <p className="text-sm text-secondary m-0 leading-normal">
                  {ast.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-12 border-t border-glass text-xs text-secondary">
                <span>{ast.islemSayisi} Yanıt Üretildi</span>
                <span className="text-success font-semibold flex items-center gap-4">
                  <CheckCircle2 size={13} /> Devrede
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Token Satın Alma Paketleri */}
      <div>
        <div className="mb-16">
          <h3 className="font-bold text-base m-0 mb-4 text-primary flex items-center gap-8">
            <ShoppingCart size={18} className="text-accent-primary" />
            {t('AiKullanim_krediYukle') || 'Token / Kredi Paketi Satın Al'}
          </h3>
          <p className="text-sm text-secondary m-0">
            {t('AiKullanim_krediYukleAciklama') || 'Kullanım hacminize uygun token paketini seçerek anında hesabınıza yükleyin.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`surface-card p-24 rounded-16 border flex flex-col justify-between relative ${pkg.popular ? 'border-accent-primary shadow-lg' : 'border-glass'}`}
            >
              {pkg.popular && (
                <div className="absolute -top-12 right-20 bg-accent text-white text-xs font-bold py-4 px-12 rounded-full shadow-md">
                  {t('AiKullanim_populer') || 'En Popüler'}
                </div>
              )}

              <div>
                <h4 className="font-bold text-lg m-0 mb-4 text-primary">{pkg.name}</h4>
                <div className="text-2xl font-extrabold text-accent-primary mb-2">
                  {pkg.tokens}
                </div>
                <div className="flex items-baseline gap-6 mb-16">
                  <span className="text-xl font-bold text-primary">{pkg.price}</span>
                  <span className="text-xs text-secondary">({pkg.unitPrice})</span>
                </div>

                <div className="flex flex-col gap-8 mb-20">
                  {pkg.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-8 text-sm text-secondary">
                      <CheckCircle2 size={15} className="text-success flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className={`btn w-full flex items-center justify-center gap-8 ${pkg.popular ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handlePurchase(pkg.id, pkg.name)}
                disabled={purchasing === pkg.id}
              >
                <ShoppingCart size={16} />
                {purchasing === pkg.id ? 'İşleniyor...' : t('AiKullanim_hemenAl') || 'Satın Al'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Son AI İşlemleri Tablosu */}
      <div>
        <h3 className="font-bold text-base m-0 mb-16 text-primary flex items-center gap-8">
          <History size={18} className="text-accent-primary" />
          {t('AiKullanim_gecmisBaslik') || 'Son Yapay Zeka İşlemleri & Harcamalar'}
        </h3>
        <div className="surface-card rounded-16 border border-glass overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-glass bg-secondary text-secondary">
                <th className="p-12 font-semibold">{t('AiKullanim_tarih') || 'Tarih / Saat'}</th>
                <th className="p-12 font-semibold">{t('AiKullanim_asistan') || 'Asistan'}</th>
                <th className="p-12 font-semibold">{t('AiKullanim_islem') || 'Soru / İşlem'}</th>
                <th className="p-12 font-semibold">{t('AiKullanim_harcananToken') || 'Harcanan Token'}</th>
                <th className="p-12 font-semibold">{t('AiKullanim_durum') || 'Durum'}</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((act) => (
                <tr key={act.id} className="border-b border-glass hover:bg-hover transition-colors">
                  <td className="p-12 text-secondary">{act.tarih}</td>
                  <td className="p-12 font-medium text-primary">{act.asistan}</td>
                  <td className="p-12 text-secondary">{act.soru}</td>
                  <td className="p-12">
                    <code className="text-xs bg-secondary text-accent-primary px-8 py-2 rounded-6">
                      {act.token}
                    </code>
                  </td>
                  <td className="p-12">
                    <span className="text-xs font-semibold text-success bg-success bg-opacity-10 py-4 px-8 rounded-full">
                      {act.durum}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LlmEntegrasyonAyarlari;
