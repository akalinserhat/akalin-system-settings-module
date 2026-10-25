import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sliders, Box, Layers, FolderOpen, Edit2, Trash2 } from 'lucide-react';
import { BaseModalCrud, useTableNavigation } from '@akalin/ui';
import { OzellikTanimForm } from '@akalin/product_module';
import { useTranslation } from 'react-i18next';

const OzellikTanimlari = () => {
  const { t } = useTranslation();
  const [gruplar, setGruplar] = useState([]);
  const [refreshGruplarCounter, setRefreshGruplarCounter] = useState(0);

  useEffect(() => {
    fetchGruplar();
  }, [refreshGruplarCounter]);

  async function fetchGruplar() {
    try {
      const gruplarRes = await axios.get('/api/OzellikTanimlariGruplari');
      setGruplar(gruplarRes.data || []);
    } catch (err) {
      console.error('Özellik tanımları grupları yüklenemedi:', err);
    }
  }

  const handleGroupDelete = async (grup: any, setRefreshKey: any) => {
    if (grup.tanimlar.length > 0) {
      alert(`'${grup.ad}' grubunu silemezsiniz çünkü altında kayıtlı ${grup.tanimlar.length} özellik bulunuyor. Lütfen önce bu özellikleri silin veya başka gruba taşıyın.`);
      return;
    }
    if (!window.confirm(`'${grup.ad}' isimli boş grubu silmek istediğinize emin misiniz?`)) return;
    try {
      await axios.delete(`/api/OzellikTanimlariGruplari/${grup.id}`);
      setRefreshGruplarCounter(prev => prev + 1);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      alert(err.response?.data?.mesaj || 'Grup silinemedi.');
    }
  };

  const handleGroupEdit = async (grup: any, setRefreshKey: any) => {
    const newAd = window.prompt(`'${grup.ad}' grubunun yeni adını girin:`, grup.ad);
    if (!newAd || newAd.trim() === '' || newAd === grup.ad) return;

    try {
      await axios.put(`/api/OzellikTanimlariGruplari/${grup.id}`, { ad: newAd.trim() });
      setRefreshGruplarCounter(prev => prev + 1);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      alert(err.response?.data?.mesaj || 'Grup güncellenemedi.');
    }
  };

  const customRenderContent = ({ data, loading, handleEdit, handleDelete, setRefreshKey }: any) => {
    const groupedData: any[] = gruplar.map((g: any) => ({
      id: g.id,
      ad: g.ad,
      tanimlar: data.filter(t => t.ozellikTanimiGrubuId === g.id)
    }));

    const unassigned = data.filter((t: any) => !t.ozellikTanimiGrubuId);
    if (unassigned.length > 0) {
      groupedData.push({ id: 'none', ad: 'Gruplandırılmamış Özellikler', tanimlar: unassigned, isUnassigned: true });
    }

    const flatDisplayTanimlar: any[] = [];
    groupedData.forEach(g => flatDisplayTanimlar.push(...g.tanimlar));

    const { selectedIndex, setSelectedIndex } = useTableNavigation({
      data: flatDisplayTanimlar,
      onEdit: handleEdit,
      isActive: true
    });

    if (loading) {
      return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>{t('auto_yukleniyor_4deb')}</div>;
    }

    return (
      <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-secondary)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <tr>
              <th style={{ padding: '16px 24px', width: '60px', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.5px' }}><Sliders size={16} /></th>
              <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.5px' }}>{t('auto_ozellik_kodu_adi_32a0')}</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.5px' }}>Veri Tipi</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.5px' }}>{t('auto_secenekler_1693')}</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.5px' }}>Durum</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', width: '100px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.5px' }}>{t('auto_islem_792e')}</th>
            </tr>
          </thead>
          <tbody>
            {groupedData.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Kayıtlı özellik bulunamadı.
                </td>
              </tr>
            ) : (
              groupedData.map((grup: any) => (
                <React.Fragment key={grup.id}>
                  <tr className="group-header-row" style={{ background: grup.isUnassigned ? 'var(--bg-secondary)' : 'rgba(99, 102, 241, 0.05)' }}>
                    <td colSpan={6} style={{ padding: '12px 24px', borderBottom: '1px solid var(--glass-border)', borderTop: '1px solid var(--glass-border)' }}>
                      <div className="flex-row items-center justify-between">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: grup.isUnassigned ? 'var(--bg-primary)' : 'rgba(99, 102, 241, 0.1)', color: grup.isUnassigned ? 'var(--text-secondary)' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {grup.isUnassigned ? <Box size={16} /> : <FolderOpen size={16} />}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{grup.ad}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px', border: '1px solid var(--glass-border)' }}>
                            {grup.tanimlar.length} özellik
                          </span>
                        </div>
                        
                        {!grup.isUnassigned && (
                          <div className="group-actions" style={{ display: 'flex', gap: '8px', opacity: 0.6, transition: 'opacity 0.2s' }}>
                            <button className="btn-icon" onClick={() => handleGroupEdit(grup, setRefreshKey)} style={{ color: 'var(--text-secondary)' }} title="Grubu Düzenle">
                              <Edit2 size={16} />
                            </button>
                            <button className="btn-icon" onClick={() => handleGroupDelete(grup, setRefreshKey)} style={{ color: 'var(--danger)' }} title="Grubu Sil">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {grup.tanimlar.map((s: any) => {
                    const index = flatDisplayTanimlar.findIndex(item => item.id === s.id);
                    let rowClass = 'table-row-hover';
                    if (selectedIndex === index) rowClass += ' row-selected';
                    
                    return (
                      <tr 
                        key={s.id} 
                        className={rowClass}
                        onClick={() => setSelectedIndex(index)}
                        onDoubleClick={() => handleEdit(s)}
                        style={{ borderBottom: '1px solid var(--glass-border)', cursor: 'pointer' }}
                      >
                        <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: s.varyantIcinKullanilirMi ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: s.varyantIcinKullanilirMi ? '#f59e0b' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                            {s.varyantIcinKullanilirMi ? <Layers size={18} /> : <Sliders size={18} />}
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>{s.ad}</span>
                            <div className="flex-row items-center gap-8">
                              <span style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', border: '1px solid var(--glass-border)' }}>
                                {s.kod}
                              </span>
                              {s.varyantIcinKullanilirMi && (
                                <span style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', letterSpacing: '0.5px' }}>
                                  VARYANT BOYUTU
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>
                          {s.veriTipiAd}
                        </td>
                        <td style={{ padding: '14px 24px', color: 'var(--text-secondary)' }}>
                          <div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '13px' }}>
                            {s.secenekler || '-'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '8px', 
                            fontSize: '12px',
                            fontWeight: '600',
                            background: s.aktifMi ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: s.aktifMi ? 'var(--success)' : 'var(--danger)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                            {s.aktifMi ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleEdit(s); }} style={{ color: 'var(--text-secondary)' }} title="Düzenle">
                              <Edit2 size={16} />
                            </button>
                            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleDelete(s); }} style={{ color: 'var(--danger)' }} title="Sil">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
        <style>{`
          .table-row-hover:hover { background: var(--hover-bg); }
          .group-header-row:hover .group-actions { opacity: 1 !important; }
        `}</style>
      </div>
    );
  };

  return (
    <BaseModalCrud
      icon={<Sliders size={24} />}
      title="Özellik Tanımları"
      subtitle="Ürün ve hizmetlere bağlanacak dinamik özellikleri ve varyant boyutlarını yönetin."
      apiEndpoint="/api/OzellikTanimlari"
      itemNameResolver={(item) => item.ad}
      formComponent={OzellikTanimForm}
      modalTitlePrefix="Özellik"
      customRenderContent={customRenderContent}
    />
  );
};

export default OzellikTanimlari;
