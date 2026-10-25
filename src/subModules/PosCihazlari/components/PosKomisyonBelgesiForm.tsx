/**
 * @file PosKomisyonBelgesiForm.tsx
 * @description POS komisyon oranları ve taksit tanımları belge formu bileşeni.
 */

import React, { useState, useEffect } from 'react';
import { BasitInput, SpreadsheetGrid, YuzdelikInput } from '@akalin/ui';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface PosKomisyonBelgesiFormProps {
    initialData?: any;
    onSuccess: () => void;
    onCancel: () => void;
    onDirtyChange?: (isDirty: boolean) => void;
    onTitleChange?: (title: string) => void;
    onSavingChange?: (isSaving: boolean) => void;
}

const PosKomisyonBelgesiForm: React.FC<PosKomisyonBelgesiFormProps> = ({
    initialData,
    onSuccess,
    onCancel,
    onDirtyChange,
    onSavingChange,
}) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<any>(initialData || {
        baslangicTarihi: '',
        bitisTarihi: '',
        aktifMi: true,
        geriDonusTuru: 1,
        satirlar: [
            { taksitSayisi: 1, aciklama: 'Tek Çekim', bankaKesintiOrani: 0, musteriVadeFarkiOrani: 0, vadeGunu: 1 }
        ]
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!formData.id && formData.posCihazId) {
            const fetchAndSetDates = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(`/api/poskomisyonbelgeleri/byposcihaz/${formData.posCihazId}`);
                    const existingRecords = response.data || [];

                    let currentDate = new Date();
                    let startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    let endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

                    let found = false;
                    while (!found) {
                        const hasRecord = existingRecords.some((record: any) => {
                            if (!record.baslangicTarihi) return false;
                            const rStart = new Date(record.baslangicTarihi);
                            const rEnd = record.bitisTarihi ? new Date(record.bitisTarihi) : new Date(8640000000000000);
                            return rStart <= endOfMonth && rEnd >= startOfMonth;
                        });

                        if (hasRecord) {
                            startOfMonth.setMonth(startOfMonth.getMonth() + 1);
                            startOfMonth.setDate(1);
                            endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
                        } else {
                            found = true;
                        }
                    }

                    const formatString = (date: Date) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    };

                    setFormData((prev: any) => ({
                        ...prev,
                        baslangicTarihi: formatString(startOfMonth),
                        bitisTarihi: formatString(endOfMonth)
                    }));
                } catch (error) {
                    console.error('Tarih hesaplanırken hata oluştu:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchAndSetDates();
        } else if (!formData.id && !formData.baslangicTarihi) {
            const currentDate = new Date();
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            
            const formatString = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            setFormData((prev: any) => ({
                ...prev,
                baslangicTarihi: formatString(startOfMonth),
                bitisTarihi: formatString(endOfMonth)
            }));
        }
    }, [formData.id, formData.posCihazId]);

    const handleChange = (field: string, value: any) => {
setFormData((prev: any) => ({ ...prev, [field]: value }));
        if (onDirtyChange) onDirtyChange(true);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            if (onSavingChange) onSavingChange(true);
            const payload = {
                ...formData,
                baslangicTarihi: new Date(formData.baslangicTarihi).toISOString(),
                bitisTarihi: formData.bitisTarihi ? new Date(formData.bitisTarihi).toISOString() : null,
                satirlar: formData.satirlar.filter((s: any) => s.taksitSayisi > 0)
            };

            if (formData.id) {
                await axios.put(`/api/poskomisyonbelgeleri/${formData.id}`, payload);
                toast.success('Belge güncellendi.');
            } else {
                await axios.post('/api/poskomisyonbelgeleri', payload);
                toast.success('Belge oluşturuldu.');
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Kaydedilirken bir hata oluştu.');
        } finally {
            setLoading(false);
            if (onSavingChange) onSavingChange(false);
        }
    };

    const handleRowChange = (idx: number, field: string, value: any) => {
        const newData = [...formData.satirlar];
        const currentRow = { ...newData[idx], [field]: value };

        // taksitSayisi değiştiğinde aciklama'yı otomatik güncelle
        // (yalnızca açıklama henüz özelleştirilmemişse)
        if (field === 'taksitSayisi') {
            const n = Number(value);
            const autoAciklama = (taksit: number) =>
                taksit === 1 ? 'Tek Çekim' : `${taksit} Taksit`;
            const prevAciklama = newData[idx].aciklama || '';
            const prevN = newData[idx].taksitSayisi;
            const wasAuto = prevAciklama === '' || prevAciklama === autoAciklama(prevN);
            if (wasAuto && n > 0) {
                currentRow.aciklama = autoAciklama(n);
            }
        }

        newData[idx] = currentRow;
        handleChange('satirlar', newData);
    };

    // geriDonusTuru POS kartından otomatik gelir; Vadeli ise vadeGunu sütunu gösterilir
    const geriDonusTuru = formData.geriDonusTuru || 1;

    const gridColumns = [
        {
            id: 'taksitSayisi',
            header: 'Taksit',
            width: '80px',
            render: (row: any, idx: number) => (
                <input
                    type="number"
                    className="grid-input text-center"
                    value={row.taksitSayisi || ''}
                    onChange={e => handleRowChange(idx, 'taksitSayisi', Number(e.target.value))}
                    min={1}
                />
            )
        },
        {
            id: 'aciklama',
            header: 'Açıklama',
            width: '200px',
            render: (row: any, idx: number) => {
                const autoLabel = row.taksitSayisi === 1
                    ? 'Tek Çekim'
                    : row.taksitSayisi > 1
                        ? `${row.taksitSayisi} Taksit`
                        : '';
                const isAuto = !row.aciklama || row.aciklama === autoLabel;
                return (
                    <input
                        type="text"
                        className="grid-input"
                        value={isAuto ? autoLabel : row.aciklama}
                        placeholder={autoLabel}
                        onChange={e => handleRowChange(idx, 'aciklama', e.target.value)}
                    />
                );
            }
        },
        {
            id: 'bankaKesintiOrani',
            header: 'Banka Kesinti (%)',
            width: '140px',
            render: (row: any, idx: number) => (
                <YuzdelikInput
                    className="grid-input"
                    value={row.bankaKesintiOrani}
                    onChange={e => handleRowChange(idx, 'bankaKesintiOrani', e.target.value)}
                    decimalPlaces={2}
                />
            )
        },
        ...(geriDonusTuru === 2 ? [{
            id: 'vadeGunu',
            header: 'Vade/Bloke Günü',
            width: '130px',
            render: (row: any, idx: number) => (
                <input
                    type="number"
                    className="grid-input text-right"
                    value={row.vadeGunu}
                    onChange={e => handleRowChange(idx, 'vadeGunu', Number(e.target.value))}
                />
            )
        }] : [])
    ];

    const getEmptyRow = () => ({
        taksitSayisi: formData.satirlar.length + 1,
        aciklama: '',
        bankaKesintiOrani: 0,
        musteriVadeFarkiOrani: 0,
        vadeGunu: geriDonusTuru === 2 ? 30 : 1
    });

    const handleGridChange = (newData: any[]) => {
        handleChange('satirlar', newData);
    };

    return (
        <form
            id="base-form"
            onSubmit={e => { e.preventDefault(); handleSave(); }}
            className="flex-col h-full"
        >
            {/* geriDonusTuru hidden - POS kartından otomatik gelir */}
            <input type="hidden" value={geriDonusTuru} />

            <div className="flex-1 overflow-y-auto content-area flex-col gap-20">
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label required">{t('auto_baslangic_tarihi_0d33')}</label>
                        <BasitInput
                            type="date"
                            autoFocus
                            value={formData.baslangicTarihi ? formData.baslangicTarihi.split('T')[0] : ''}
                            onChange={(e: any) => handleChange('baslangicTarihi', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auto_bitis_tarihi_c672')}</label>
                        <BasitInput
                            type="date"
                            value={formData.bitisTarihi ? formData.bitisTarihi.split('T')[0] : ''}
                            onChange={(e: any) => handleChange('bitisTarihi', e.target.value)}
                        />
                        <small className="text-secondary mt-4 block">{t('auto_suresiz_ise_bos_bira_d580')}</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Durum</label>
                        <div className="flex-row items-center h-42 gap-8">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={formData.aktifMi}
                                    onChange={(e) => handleChange('aktifMi', e.target.checked)}
                                />
                                <span className="slider round"></span>
                            </label>
                            <span className="text-14 text-secondary">Aktif</span>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex-row justify-between items-center mb-8">
                        <h4 className="text-14 font-semibold m-0">{t('auto_taksit_ve_komisyon_o_6b57')}</h4>
                        <span className="badge badge-secondary">Satır Sayısı: {formData.satirlar.length}</span>
                    </div>
                    <SpreadsheetGrid
                        columns={gridColumns}
                        data={formData.satirlar}
                        onAddRow={() => handleGridChange([...formData.satirlar, getEmptyRow()])}
                        onRemoveRow={(idx: number) => {
                            const newData = [...formData.satirlar];
                            newData.splice(idx, 1);
                            handleGridChange(newData);
                        }}
                        isEmptyRow={(row: any) => !row.taksitSayisi}
                    />
                </div>
            </div>
        </form>
    );
};

export default PosKomisyonBelgesiForm;
