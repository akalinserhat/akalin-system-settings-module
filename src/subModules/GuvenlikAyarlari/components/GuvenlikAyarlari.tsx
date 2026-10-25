import React, { useState, useEffect } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Shield, Fingerprint, MonitorSmartphone, CheckCircle, Pencil, Trash2, Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const GuvenlikAyarlari = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [credentials, setCredentials] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await axios.get('/api/WebAuthn/credentials');
      setCredentials(res.data || []);
    } catch (err) {
      console.error('Kayıtlı cihazlar alınamadı', err);
    } finally {
      setFetching(false);
    }
  };

  const handleRegisterDevice = async () => {
    setLoading(true);
    try {
      const resp = await axios.post('/api/WebAuthn/register-options');
      const options = resp.data;

      let attResp;
      try {
        attResp = await startRegistration(options);
      } catch (error) {
        if (error.name === 'InvalidStateError') {
          toast.error('Bu cihaz zaten kayıtlı.');
        } else {
          toast.error('Cihaz kaydı iptal edildi veya desteklenmiyor.');
        }
        setLoading(false);
        return;
      }

      const verificationResp = await axios.post('/api/WebAuthn/register-verify', attResp);
      
      if (verificationResp.status === 200) {
        toast.success('Cihazınız başarıyla kaydedildi!');
        fetchCredentials();
      } else {
        toast.error('Cihaz kaydedilemedi.');
      }
    } catch (err) {
      toast.error(err.response?.data?.mesaj || 'Kayıt sırasında bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCredentials = async (deviceId) => {
    if (!window.confirm("Bu cihazı kaldırmak istediğinize emin misiniz? İşlemi onaylamak için kimliğinizi (parmak izi/yüz tanıma) doğrulamanız gerekecek.")) return;
    setLoading(true);
    try {
      const optResp = await axios.post('/api/WebAuthn/delete-options');
      const options = optResp.data;

      let assertion;
      try {
        assertion = await startAuthentication(options);
      } catch (err) {
        toast.error('Doğrulama iptal edildi veya başarısız oldu.');
        setLoading(false);
        return;
      }

      await axios.post('/api/WebAuthn/credentials/delete-verify', {
        deviceId: deviceId,
        assertionResponse: assertion
      });
      toast.success('Cihaz başarıyla kaldırıldı.');
      fetchCredentials();
    } catch (err) {
      toast.error(err.response?.data?.mesaj || 'Kaldırma işlemi sırasında bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRenameCredential = async (id) => {
    if (!editName.trim()) return;
    try {
      await axios.put(`/api/WebAuthn/credentials/${id}`, { cihazAdi: editName });
      toast.success('Cihaz adı güncellendi.');
      setEditingId(null);
      fetchCredentials();
    } catch (err) {
      toast.error(err.response?.data?.mesaj || 'Cihaz adı güncellenemedi.');
    }
  };

  return (
    <div style={{ padding: '16px 24px 24px 24px', animation: 'fadeIn 0.3s' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="flex-row items-center gap-12 mb-8">
          <div className="flex items-center justify-center w-40 h-40 rounded-10 bg-accent-light text-accent-primary">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-20 font-700 text-primary m-0">{t('GuvenlikAyarlari_baslik', 'Güvenlik Ayarları')}</h2>
            <p className="text-secondary text-14 m-0">
              {t('GuvenlikAyarlari_aciklama', 'Oturum süreleri, şifresiz biyometrik doğrulama ve hesap güvenliği politikalarınızı yönetin.')}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        {/* Device Registration Card */}
        <div style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: '16px', 
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '12px', 
              background: 'var(--accent-light)', 
              color: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <MonitorSmartphone size={24} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Yeni Cihaz Ekle</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{t('auto_mevcut_cihazinizi_pa_6f6f')}</p>
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Shield size={20} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                Farklı tarayıcılar veya telefonlarınız için ayrı kayıtlar oluşturabilirsiniz. Birden fazla cihaz kaydederek her yerden güvenli giriş yapın.
              </p>
            </div>
          </div>

          <button 
            onClick={handleRegisterDevice} 
            disabled={loading || fetching}
            className="btn btn-primary" 
            style={{ 
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: fetching ? 0.7 : 1
            }}
          >
            {loading ? 'İşlem yapılıyor...' : 'Şu Anki Cihazı Kaydet'}
          </button>
        </div>

        {/* Registered Devices List */}
        <div style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: '16px', 
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>{t('auto_kayitli_cihazlarim_de8c')}</h3>
          
          {fetching ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{t('auto_yukleniyor_4deb')}</p>
          ) : credentials.length === 0 ? (
            <div style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: '12px', textAlign: 'center' }}>
              <Fingerprint size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>{t('auto_henuz_kayitli_bir_ci_41bf')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {credentials.map(c => (
                <div key={c.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '16px', background: 'var(--bg-primary)', borderRadius: '12px',
                  border: '1px solid var(--glass-border)'
                }}>
                  {editingId === c.id ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                      <input 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="form-input" 
                        style={{ padding: '6px 12px', flex: 1 }} 
                        autoFocus
                      />
                      <button onClick={() => handleRenameCredential(c.id)} className="btn btn-primary" style={{ padding: '6px' }} title="Kaydet">
                        <Save size={16} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="btn btn-outline" style={{ padding: '6px' }} title="İptal">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'var(--bg-secondary)', padding: '8px', borderRadius: '8px' }}>
                          <CheckCircle size={20} color="var(--success)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px', marginBottom: '2px' }}>
                            {c.cihazAdi || `Kayıtlı Cihaz ${c.id}`}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Eklenme: {new Date(c.regDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-row gap-8">
                        <button 
                          onClick={() => { setEditingId(c.id); setEditName(c.cihazAdi || `Kayıtlı Cihaz ${c.id}`); }} 
                          className="btn btn-outline" 
                          style={{ padding: '8px', borderColor: 'transparent' }} 
                          title="Yeniden Adlandır"
                        >
                          <Pencil size={16} color="var(--text-secondary)" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCredentials(c.id)} 
                          className="btn" 
                          style={{ 
                            padding: '8px', background: 'rgba(239, 68, 68, 0.1)', 
                            color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' 
                          }} 
                          title="Cihazı Kaldır"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GuvenlikAyarlari;
