import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Check, Folder, ChevronRight, ChevronDown, FolderOpen, Edit2, Trash2, Layers } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertDialog, BaseTabItem, BaseSystemPage, useTableAction, useTableNavigation } from '@akalin/ui';
import { useTranslation } from 'react-i18next';
import { openCenteredPopup } from '../../../utils/windowUtils';

const sortTreeAlphabetically = (nodes: any[]): any[] => {
  if (!nodes || !Array.isArray(nodes)) return [];
  return [...nodes]
    .map(node => ({
      ...node,
      id: node.id ?? node.Id,
      ad: node.ad ?? node.Ad,
      kod: node.kod ?? node.Kod,
      altGruplar: sortTreeAlphabetically(node.altGruplar || node.AltGruplar || [])
    }))
    .sort((a, b) => (a.ad || '').localeCompare(b.ad || '', 'tr', { sensitivity: 'base' }));
};

const UrunGruplari = ({ tur = 1, baslik, aciklama }: { tur?: number; baslik?: string; aciklama?: string }) => {
  const { t } = useTranslation();
  const defaultTitle = tur === 2 
    ? t('auto_hizmet_gruplari_header', 'Hizmet Grupları') 
    : t('auto_urun_gruplari_header', 'Ürün Grupları');
  const defaultDesc = tur === 2 
    ? t('auto_hizmet_kategorilerini_agac_yapisinda_yonetin', 'Hizmet kategorilerini ağaç yapısında yönetin') 
    : t('auto_kategorileri_agac_yapisinda_yonetin', 'Kategorileri ağaç yapısında yönetin');

  const headerTitle = baslik || defaultTitle;
  const headerDesc = aciklama || defaultDesc;

  const [agac, setAgac] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const SESSION_KEY = `urun_gruplari_expanded_nodes_${tur}`;
  const [expandedNodes, setExpandedNodes] = useState<Set<string | number>>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Session storage okunurken hata:', e);
    }
    return new Set();
  });
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: null as any });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  
  const { highlightedId, setHighlightedId } = useTableAction(fetchData);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchData(true);
  }, [tur]);

  const LAST_NODE_KEY = `urun_gruplari_last_node_${tur}`;

  // Oturum tabanlı navigasyon için ağacın genişletilmiş düğümlerini kaydet
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(Array.from(expandedNodes)));
    } catch (e) {}
  }, [expandedNodes, SESSION_KEY]);

  // Yeni grup eklenip dönüldüğünde ilgili satırı vurgula
  useEffect(() => {
    if (location.state && (location.state as any).newlyAddedUrunGrupId) {
      const newId = (location.state as any).newlyAddedUrunGrupId;
      setHighlightedId(newId);
      
      // Hemen session'a kaydedelim ki state silindiğinde kaybolmasın
      sessionStorage.setItem(LAST_NODE_KEY, String(newId));
    } else {
      const lastId = sessionStorage.getItem(LAST_NODE_KEY);
      if (lastId) {
        setHighlightedId(Number(lastId));
      }
    }
  }, [location.state, setHighlightedId, LAST_NODE_KEY]);

  const findAncestors = (nodes: any[], targetId: number | string, path: any[] = []): any[] | null => {
    for (const node of nodes) {
      if (node.id === targetId) return path;
      if (node.altGruplar && node.altGruplar.length > 0) {
        const found = findAncestors(node.altGruplar, targetId, [...path, node.id]);
        if (found) return found;
      }
    }
    return null;
  };

  // Vurgulanan (highlightedId) öğenin tüm üst gruplarını (ancestors) otomatik aç
  useEffect(() => {
    if (highlightedId && agac.length > 0) {
      const ancestors = findAncestors(agac, highlightedId);
      if (ancestors && ancestors.length > 0) {
        setExpandedNodes(prev => {
          const next = new Set(prev);
          let changed = false;
          for (const anc of ancestors) {
            if (!next.has(anc)) {
              next.add(anc);
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      }
    }
  }, [highlightedId, agac]);

  async function fetchData(isInitial = false) {
    if (isInitial || agac.length === 0) {
      setLoading(true);
    }
    try {
      const res = await axios.get('/api/UrunVeHizmetGruplari/agac', { params: { tur } });
      const sortedTree = sortTreeAlphabetically(res.data);
      setAgac(sortedTree);
    } catch (err) {
      console.error('Ürün grupları yüklenemedi:', err);
      toast.error(t('auto_urun_gruplari_yuklenemedi_b10a', 'Ürün grupları yüklenemedi.'));
    } finally {
      setLoading(false);
    }
  }

  // Düzleştirme işlemi: Sadece görünür olan (üst grubu açık olan) düğümleri listeye ekler
  const flattenNodes = (nodes: any[], level = 0) => {
    let result: any[] = [];
    for (const node of nodes) {
      result.push({ ...node, level });
      if (expandedNodes.has(node.id) && node.altGruplar && node.altGruplar.length > 0) {
        result = result.concat(flattenNodes(node.altGruplar, level + 1));
      }
    }
    return result;
  };

  const visibleNodes = flattenNodes(agac);

  const scrolledForHighlightRef = React.useRef<number | string | null>(null);

  // Vurgulanan satıra (eklenen/düzenlenen) sadece 1 kez kaydır
  useEffect(() => {
    if (highlightedId && scrolledForHighlightRef.current !== highlightedId) {
      const el = document.getElementById(`tree-node-${highlightedId}`);
      if (el) {
        scrolledForHighlightRef.current = highlightedId;
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }
    }
  }, [highlightedId, visibleNodes]);

  function getTargetReturnTo() {
    return location.pathname.includes('/sistem-ayarlari/')
      ? location.pathname + location.search
      : (tur === 2 ? '/ayarlar/sistem-ayarlari/HizmetGruplari' : '/ayarlar/sistem-ayarlari/UrunGruplari');
  }

  function handleEdit(node: any, e?: any) {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    const nodeId = node?.id ?? node?.Id;
    if (!nodeId) return;
    sessionStorage.setItem(LAST_NODE_KEY, String(nodeId));
    const popupUrl = `/popup/urun-gruplari/form?id=${nodeId}&tur=${node.tur || tur}`;
    const pageUrl = `/urun-gruplari/duzenle/${nodeId}?tur=${node.tur || tur}`;

    if (e?.shiftKey) {
      openCenteredPopup(popupUrl, t('auto_grup_duzenle', 'Grup Düzenle'), 600, 500);
    } else if (e?.metaKey || e?.ctrlKey) {
      window.open(pageUrl, '_blank');
    } else {
      navigate(pageUrl, { state: { returnTo: getTargetReturnTo() } });
    }
  }

  function handleAddNewRoot(e?: any) {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    const popupUrl = `/popup/urun-gruplari/form?tur=${tur}`;
    const pageUrl = `/urun-gruplari/yeni?tur=${tur}`;

    if (e?.shiftKey) {
      openCenteredPopup(popupUrl, t('auto_yeni_ana_grup', 'Yeni Ana Grup'), 600, 500);
    } else if (e?.metaKey || e?.ctrlKey) {
      window.open(pageUrl, '_blank');
    } else {
      navigate(pageUrl, { state: { returnTo: getTargetReturnTo() } });
    }
  }

  function handleAddChild(node: any, e?: any) {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    const nodeId = node?.id ?? node?.Id;
    if (!nodeId) {
      toast.error(t('auto_parent_not_found', 'Üst grup bulunamadı, lütfen yeniden deneyin.'));
      console.warn('UrunGruplari: Unable to determine node ID for add child', node);
      return;
    }
    sessionStorage.setItem(LAST_NODE_KEY, String(nodeId));
    const encodedId = encodeURIComponent(nodeId);
    const popupUrl = `/popup/urun-gruplari/form?tur=${tur}&ustGrupId=${encodedId}`;
    const pageUrl = `/urun-gruplari/yeni?tur=${tur}&ustGrupId=${encodedId}`;

    if (e?.shiftKey) {
      openCenteredPopup(popupUrl, t('auto_yeni_alt_grup', 'Yeni Alt Grup'), 600, 500);
    } else if (e?.metaKey || e?.ctrlKey) {
      window.open(pageUrl, '_blank');
    } else {
      navigate(pageUrl, { state: { returnTo: getTargetReturnTo() } });
    }
  }

  const findNextTargetIdAfterDelete = (nodes: any[], nodeToDelete: any) => {
    const currentIndex = nodes.findIndex(n => n.id === nodeToDelete.id);
    if (currentIndex === -1) return null;

    // Silinen düğümün alt gruplarını atlayıp bir sonraki bağımsız düğümü bul
    for (let i = currentIndex + 1; i < nodes.length; i++) {
      const candidate = nodes[i];
      if (candidate.level <= nodeToDelete.level) {
        return candidate.id;
      }
    }

    // Eğer silinen öğe listenin en sonundaysa bir önceki öğeye odaklan
    if (currentIndex > 0) {
      return nodes[currentIndex - 1].id;
    }

    return null;
  };

  function handleDelete(node: any) {
    const targetNextId = findNextTargetIdAfterDelete(visibleNodes, node);

    setConfirmDialog({
      isOpen: true,
      title: t('auto_emin_misiniz', 'Emin misiniz?'),
      message: t('auto_urun_grubu_sil_onay', 'Bu ürün grubunu silmek istediğinize emin misiniz?'),
      onConfirm: async () => {
        try {
          await axios.delete(`/api/UrunVeHizmetGruplari/${node.id}`);
          toast.success(t('auto_grup_basariyla_silindi', 'Grup başarıyla silindi.'));
          
          if (targetNextId) {
            setHighlightedId(targetNextId);
            sessionStorage.setItem(LAST_NODE_KEY, String(targetNextId));
            scrolledForHighlightRef.current = null;
          } else {
            setHighlightedId(null);
            sessionStorage.removeItem(LAST_NODE_KEY);
          }

          fetchData();
        } catch (err: any) {
          setErrorDialog({
            isOpen: true,
            title: t('auto_silme_basarisiz', 'Silme Başarısız'),
            message: err.response?.data?.mesaj || t('auto_silme_islemi_basarisiz', 'Silme işlemi başarısız.')
          });
        }
      }
    });
  }

  const { selectedIndex, setSelectedIndex } = useTableNavigation({
    data: visibleNodes,
    highlightedId,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onAddNew: handleAddNewRoot,
    onAddChild: handleAddChild,
    onArrowRight: (node: any) => {
      if (node.altGruplar && node.altGruplar.length > 0 && !expandedNodes.has(node.id)) {
        setExpandedNodes(prev => new Set([...prev, node.id]));
      }
    },
    onArrowLeft: (node: any) => {
      if (expandedNodes.has(node.id)) {
        setExpandedNodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(node.id);
          return newSet;
        });
      }
    },
    isActive: true
  });

  // Seçili olan öğeyi session storage'a kaydet
  useEffect(() => {
    if (visibleNodes.length > 0 && visibleNodes[selectedIndex]) {
      sessionStorage.setItem(LAST_NODE_KEY, String(visibleNodes[selectedIndex].id));
    }
  }, [selectedIndex, visibleNodes, LAST_NODE_KEY]);

  const toggleNode = (nodeId: any, e: any) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const [activeTabId, setActiveTabId] = useState<string>('kategoriler');

  const tabs: BaseTabItem[] = [
    {
      id: 'kategoriler',
      label: t('auto_kategoriler', 'Kategoriler'),
      content: (
        <div className="surface-card" style={{ padding: 0, overflowX: 'auto', minHeight: '400px' }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>{t('auto_yukleniyor_4deb')}</div>
          ) : visibleNodes.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>{t('auto_henuz_kayitli_grup_b_d4e7')}</div>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              {visibleNodes.map((node, index) => {
                const isExpanded = expandedNodes.has(node.id);
                const hasChildren = node.altGruplar && node.altGruplar.length > 0;
                let rowClass = 'tree-row';
                if (selectedIndex === index) rowClass += ' row-selected';
                if (highlightedId === node.id) rowClass += ' row-highlighted';

                return (
                  <div 
                    key={node.id} 
                    id={`tree-node-${node.id}`}
                    className={rowClass}
                    onClick={() => setSelectedIndex(index)}
                    onDoubleClick={(e) => handleEdit(node, e)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '12px 16px', 
                      borderBottom: '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ paddingLeft: `${node.level * 24}px`, display: 'flex', alignItems: 'center', flex: 1, gap: '8px' }}>
                      <div 
                        onClick={(e) => {
                          if (hasChildren) toggleNode(node.id, e);
                        }}
                        style={{ 
                          width: '24px', height: '24px', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          opacity: hasChildren ? 1 : 0,
                          borderRadius: '4px',
                          background: hasChildren ? 'var(--bg-primary)' : 'transparent',
                          cursor: hasChildren ? 'pointer' : 'default'
                        }}
                      >
                        {hasChildren ? (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : null}
                      </div>
                      
                      {isExpanded ? <FolderOpen size={18} style={{ color: 'var(--accent-primary)' }}/> : <Folder size={18} style={{ color: 'var(--text-secondary)' }}/>}
                      
                      <span style={{ fontWeight: selectedIndex === index ? '600' : '500' }}>{node.ad}</span>
                      <span style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', marginLeft: '4px' }}>
                        {node.kod}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' }}>
                        {node.urunVeHizmetKartiSayisi || 0} {t('auto_kayit', 'Kayıt')}
                      </span>
                    </div>
                    
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '120px', justifyContent: 'flex-end' }}
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        type="button"
                        className="btn-icon" 
                        onClick={(e) => handleAddChild(node, e)} 
                        onDoubleClick={(e) => { e.stopPropagation(); handleAddChild(node, e); }}
                        title={t('auto_alt_grup_ekle_tooltip', 'Alt Grup Ekle (Insert)')}
                        style={{ color: 'var(--success)' }}
                      >
                        <Plus size={16} />
                      </button>
                      <button 
                        type="button"
                        className="btn-icon" 
                        onClick={(e) => handleEdit(node, e)} 
                        onDoubleClick={(e) => { e.stopPropagation(); handleEdit(node, e); }}
                        title={t('auto_duzenle_tooltip', 'Düzenle (F2)')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        type="button"
                        className="btn-icon" 
                        onClick={(e) => handleDelete(node)} 
                        onDoubleClick={(e) => e.stopPropagation()}
                        style={{ color: 'var(--danger)' }} 
                        title={t('auto_sil_tooltip', 'Sil (Del)')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <BaseSystemPage
      title={headerTitle}
      subtitle={headerDesc}
      icon={<Layers size={24} />}
      baseRoute={tur === 2 ? "/ayarlar/sistem-ayarlari/HizmetGruplari" : "/ayarlar/sistem-ayarlari/UrunGruplari"}
      backRoute="/ayarlar/sistem-ayarlari"
      showBackButton={true}
      headerSync={true}
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={(tabId) => setActiveTabId(String(tabId))}
      hideIfSingleTab={true}
      onAdd={handleAddNewRoot}
      addButtonTitle={t('auto_yeni_ana_grup_ekle', 'Yeni Ana Grup Ekle')}
    >

      <style>{`
        .tree-row:hover { background: var(--hover-bg); }
      `}</style>

      <AlertDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog(prev => ({ ...prev, isOpen: false }))}
        type="error"
        title={errorDialog.title}
        message={errorDialog.message}
      />

      <AlertDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type="confirm"
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
        confirmText={t('auto_evet', 'Evet')}
        cancelText={t('auto_iptal', 'İptal')}
      />
    </BaseSystemPage>
  );
};

export default UrunGruplari;
