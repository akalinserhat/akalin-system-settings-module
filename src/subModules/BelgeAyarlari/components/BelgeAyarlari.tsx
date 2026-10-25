import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, FileText, Building } from 'lucide-react';
import { TemplateBuilder } from '@akalin/ui';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const BelgeAyarlari = () => {
  const { t } = useTranslation();
  const [belgeTipleri, setBelgeTipleri] = useState([]);
  const [formData, setFormData] = useState<any>({});
  const [depolar, setDepolar] = useState([]);
  
  const [activeBelgeId, setActiveBelgeId] = useState('');
  const [activeSubeId, setActiveSubeId] = useState(''); // empty string means "Genel Ayar"
  
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const tagGroups = [
    { title: 'Zaman Değişkenleri', tags: ['[Yıl]', '[Ay]', '[Gün]'] },
    { title: 'Sıra & Sayaç', tags: ['[Harf Serisi]', '[Sayaç]'] }
  ];

  useEffect(() => {
    // 1. Belge Tiplerini Çek
    axios.get('/api/belgeayarlari/tipler')
      .then(res => {
        setBelgeTipleri(res.data || []);
        if (res.data?.length > 0) {
          setActiveBelgeId(res.data[0].belgeId);
        }
      })
      .catch(err => console.error("Belge tipleri alınamadı", err));

    // 2. Şube/Depoları Çek
    axios.get('/api/depolar')
      .then(res => {
        setDepolar(res.data || []);
      })
      .catch(err => console.error("Depolar alınamadı", err));
  }, []);

  useEffect(() => {
    if (activeBelgeId) {
      fetchSettings();
    }
  }, [activeBelgeId, activeSubeId]);

  const parseTemplate = (templateStr) => {
    if (!templateStr) return [];
    const parts = templateStr.split(/(\[[^\]]+\])/g).filter(Boolean);
    return parts.map((part, index) => ({
      id: `chip-${Date.now()}-${index}-${Math.random()}`,
      text: part,
      isTag: part.startsWith('[') && part.endsWith(']')
    }));
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const url = activeSubeId 
        ? `/api/belgeayarlari/${activeBelgeId}?subeId=${activeSubeId}`
        : `/api/belgeayarlari/${activeBelgeId}`;
        
      const res = await axios.get(url);
      const data = res.data || {};
      setSettings(data);
    } catch (err) {
      console.error('Belge ayarları yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = activeSubeId 
        ? `/api/belgeayarlari/${activeBelgeId}?subeId=${activeSubeId}`
        : `/api/belgeayarlari/${activeBelgeId}`;
        
      await axios.post(url, settings);
      toast.success('Belge ayarı başarıyla kaydedildi.');
    } catch (err) {
      toast.error(err.response?.data?.mesaj || err.response?.data?.message || 'Ayarlar kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  if (!belgeTipleri.length) {
    return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>{t('auto_belge_tipleri_yuklen_fe18')}</div>;
  }

  const hasHarfSerisi = (settings.kodSablonu || '').includes('[Harf Serisi]');

  return (
    <div style={{ padding: '16px 24px 24px 24px', animation: 'fadeIn 0.3s' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="flex-row items-center gap-12 mb-8">
          <div className="flex items-center justify-center w-40 h-40 rounded-10 bg-accent-light text-accent-primary">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-20 font-700 text-primary m-0">{t('BelgeAyarlari_baslik', 'Belge Ayarları')}</h2>
            <p className="text-secondary text-14 m-0">
              {t('BelgeAyarlari_aciklama', 'Sipariş, fatura ve irsaliyeler için otomatik seri/numara ve onay kurallarını yapılandırın.')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Header Filters */}
      <div style={{ marginBottom: '32px', background: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} style={{ color: 'var(--accent-primary)' }} /> {t('BelgeAyarlari_kapsam', 'Ayar Kapsamı')}
        </h3>
        <div className="form-grid">
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Belge Tipi Seçin
            </label>
            <select 
              className="form-control"
              value={activeBelgeId}
              onChange={(e) => setActiveBelgeId(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
            >
              {belgeTipleri.map(bt => (
                <option key={bt.belgeId} value={bt.belgeId}>{bt.belgeAdi}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <Building size={14} style={{ display: 'inline', marginBottom: '-2px' }} /> Geçerli Lokasyon (Şube/Mağaza)
            </label>
            <select 
              className="form-control"
              value={activeSubeId}
              onChange={(e) => setActiveSubeId(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
            >
              <option value="">{t('auto_genel_ayarlar_varsay_bb2d')}</option>
              {depolar.map(d => (
                <option key={d.id} value={d.id}>{d.ad}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>{t('auto_ayarlar_yukleniyor_3815')}</div>
      ) : (
        <>
          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Toggle Switch */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: settings.otomatikNumaraVerilsinMi !== false ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: settings.otomatikNumaraVerilsinMi !== false ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--glass-border)', transition: 'all 0.3s' }}>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>{t('auto_otomatik_numaralandi_83b5')}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{t('auto_bu_belge_kaydedilirk_cad3')}</p>
              </div>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                <input 
                  type="checkbox" 
                  checked={settings.otomatikNumaraVerilsinMi ?? true}
                  onChange={(e) => setSettings({...settings, otomatikNumaraVerilsinMi: e.target.checked})}
                  style={{ opacity: 0, width: 0, height: 0 }} 
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: settings.otomatikNumaraVerilsinMi !== false ? 'var(--accent-primary)' : 'var(--glass-border)',
                  transition: '.4s', borderRadius: '34px'
                }}>
                  <span style={{
                    position: 'absolute', content: '""', height: '18px', width: '18px', left: '4px', bottom: '4px',
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                    transform: settings.otomatikNumaraVerilsinMi !== false ? 'translateX(24px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>

            {/* Template Builder Wrapper (Indented Visually) */}
            {settings.otomatikNumaraVerilsinMi !== false && (
              <div style={{ paddingLeft: '24px', borderLeft: '2px solid rgba(99, 102, 241, 0.3)', marginLeft: '12px', animation: 'fadeIn 0.3s' }}>
                <TemplateBuilder 
                  title="Numaratör Şablonu"
                  value={settings.kodSablonu || ''}
                  onChange={(newVal) => setSettings({...settings, kodSablonu: newVal})}
                  availableTags={tagGroups}
                  showCounterSettings={true}
                  counterLength={settings.sayacUzunlugu}
                  onCounterLengthChange={(newLen) => setSettings({...settings, sayacUzunlugu: newLen})}
                  showSeriesInput={hasHarfSerisi}
                  seriesValue={settings.seriNo}
                  onSeriesChange={(newSeries) => setSettings({...settings, seriNo: newSeries})}
                />
              </div>
            )}
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,165,0,0.1)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle style={{ color: 'orange', flexShrink: 0, marginTop: '2px' }} size={20} />
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <strong>Not:</strong> [Sayaç] etiketi numaralandırmanın çekirdeğidir ve her belgede bir kez kullanılmalıdır. [Harf Serisi] bloğunu şablona eklerseniz, aşağıda beliren girdi alanına e-faturada kullanılan (A, B, GIB) gibi sabit seri numaralarınızı girebilirsiniz.
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleSave} 
              disabled={loading || saving}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '15px' }}
            >
              <Save size={18} /> {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BelgeAyarlari;
