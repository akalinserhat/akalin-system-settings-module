/**
 * @file TuketiciKredisiKomisyonBelgesiForm.tsx
 * @description Tüketici kredisi komisyon oranları ve taksit vadeleri belge formu bileşeni.
 */

import React, { useState, useEffect } from 'react';
import { BasitInput, SpreadsheetGrid, TamsayiInput, YuzdelikInput } from '@akalin/ui';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useMetadata } from '../../../context/MetadataContext';

interface TuketiciKredisiKomisyonBelgesiFormProps {
    initialData?: any;
    onSuccess: () => void;
    onCancel: () => void;
    onDirtyChange?: (isDirty: boolean) => void;
    onSavingChange?: (isSaving: boolean) => void;
}

const TuketiciKredisiKomisyonBelgesiForm: React.FC<TuketiciKredisiKomisyonBelgesiFormProps> = ({
    initialData,
    onSuccess,
    onCancel,
    onDirtyChange,
    onSavingChange,
}) => {
    const { t } = useTranslation();
    const { enums } = useMetadata();
    const [formData, setFormData] = useState<any>(initialData || {
        baslangicTarihi: '',
        bitisTarihi: '',
        kampanyaAdi: '',
        kampanyaTuru: 1,
        aktifMi: true,
        aciklama: '',
        satirlar: [
            { taksitSayisi: 2, aciklama: '2 Taksit', oran: 0, vadeGunu: 1 }
        ]
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!formData.id && formData.tuketiciKredisiFirmasiId) {
            const fetchAndSetDates = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(`/api/TuketiciKredisiKomisyonBelgeleri/ByFirm/${formData.tuketiciKredisiFirmasiId}`);
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
    }, [formData.id, formData.tuketiciKredisiFirmasiId]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
        if (onDirtyChange) onDirtyChange(true);
    };

    const handleSave = async () => {
        if (!formData.kampanyaAdi || formData.kampanyaAdi.trim() === '') {
            toast.error(t('TuketiciKredisiKomisyonBelgesiForm_kampanyaAdiRequired', { defaultValue: 'Kampanya ismi zorunludur.' }));
            return;
        }
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
                await axios.put(`/api/TuketiciKredisiKomisyonBelgeleri/${formData.id}`, payload);
                toast.success(t('TuketiciKredisiKomisyonBelgesiForm_guncellemeBasarili', { defaultValue: 'Belge güncellendi.' }));
            } else {
                await axios.post('/api/TuketiciKredisiKomisyonBelgeleri', payload);
                toast.success(t('TuketiciKredisiKomisyonBelgesiForm_kayitBasarili', { defaultValue: 'Belge oluşturuldu.' }));
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error(t('TuketiciKredisiKomisyonBelgesiForm_hata', { defaultValue: 'Kaydedilirken bir hata oluştu.' }));
        } finally {
            setLoading(false);
            if (onSavingChange) onSavingChange(false);
        }
    };

    const handleRowChange = (idx: number, field: string, value: any) => {
        const newData = [...formData.satirlar];
        const currentRow = { ...newData[idx], [field]: value };

        if (field === 'taksitSayisi') {
            const n = Number(value);
            const autoAciklama = (taksit: number) => `${taksit} Taksit`;
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

    const gridColumns = [
        {
            id: 'taksitSayisi',
            header: t('TuketiciKredisiKomisyonBelgesiForm_taksitHeader', { defaultValue: 'Vade (Taksit)' }),
            width: '100px',
            render: (row: any, idx: number) => (
                <TamsayiInput
                    className="grid-input text-center text-control"
                    value={row.taksitSayisi}
                    onChange={e => handleRowChange(idx, 'taksitSayisi', e.target.value)}
                    placeholder="0"
                />
            )
        },
        {
            id: 'aciklama',
            header: t('auto_aciklama_1bab', { defaultValue: 'Açıklama' }),
            width: '150px',
            render: (row: any, idx: number) => {
                const autoLabel = row.taksitSayisi > 0 ? `${row.taksitSayisi} Taksit` : '';
                const isAuto = !row.aciklama || row.aciklama === autoLabel;
                return (
                    <input
                        type="text"
                        className="grid-input text-control"
                        value={isAuto ? autoLabel : row.aciklama}
                        placeholder={autoLabel}
                        onChange={e => handleRowChange(idx, 'aciklama', e.target.value)}
                    />
                );
            }
        },
        {
            id: 'oran',
            header: t('TuketiciKredisiKomisyonBelgesiForm_oranHeader', { defaultValue: 'Oran (%)' }),
            width: '130px',
            render: (row: any, idx: number) => (
                <YuzdelikInput
                    className="grid-input"
                    value={row.oran}
                    onChange={e => handleRowChange(idx, 'oran', e.target.value)}
                    decimalPlaces={2}
                />
            )
        },
        {
            id: 'vadeGunu',
            header: t('TuketiciKredisiKomisyonBelgesiForm_vadeGunuHeader', { defaultValue: 'Valör Gün' }),
            width: '100px',
            render: (row: any, idx: number) => (
                <input
                    type="number"
                    className="grid-input text-right text-control"
                    value={row.vadeGunu}
                    onChange={e => handleRowChange(idx, 'vadeGunu', Number(e.target.value))}
                    min={0}
                />
            )
        }
    ];

    const getEmptyRow = () => ({
        taksitSayisi: (formData.satirlar[formData.satirlar.length - 1]?.taksitSayisi || 0) + 12,
        aciklama: '',
        oran: 0,
        vadeGunu: 1
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
            <div className="flex-1 overflow-y-auto content-area flex-col gap-20">
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label required">{t('TuketiciKredisiKomisyonBelgesiForm_kampanyaAdi', { defaultValue: 'Kampanya İsmi' })}</label>
                        <BasitInput
                            id="tkk-kampanya-adi"
                            type="text"
                            value={formData.kampanyaAdi || ''}
                            onChange={(e: any) => handleChange('kampanyaAdi', e.target.value)}
                            placeholder={t('TuketiciKredisiKomisyonBelgesiForm_kampanyaAdiPlaceholder', { defaultValue: 'Kampanya ismi girin...' })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">{t('TuketiciKredisiKomisyonBelgesiForm_kampanyaTuruHeader', { defaultValue: 'Kampanya Türü' })}</label>
                        <select
                            id="tkk-kampanya-turu"
                            className="form-input"
                            value={formData.kampanyaTuru || 1}
                            onChange={(e: any) => handleChange('kampanyaTuru', Number(e.target.value))}
                        >
                            {enums?.TuketiciKredisiKampanyaTuru?.map((item: any) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">{t('auto_baslangic_tarihi_0d33', { defaultValue: 'Başlangıç Tarihi' })}</label>
                        <BasitInput
                            id="tkk-baslangic-tarihi"
                            type="date"
                            value={formData.baslangicTarihi ? formData.baslangicTarihi.split('T')[0] : ''}
                            onChange={(e: any) => handleChange('baslangicTarihi', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auto_bitis_tarihi_c672', { defaultValue: 'Bitiş Tarihi' })}</label>
                        <BasitInput
                            type="date"
                            value={formData.bitisTarihi ? formData.bitisTarihi.split('T')[0] : ''}
                            onChange={(e: any) => handleChange('bitisTarihi', e.target.value)}
                        />
                        <small className="text-secondary mt-4 block">{t('auto_suresiz_ise_bos_bira_d580', { defaultValue: 'Süresiz ise boş bırakınız.' })}</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('TuketiciKredisiKomisyonBelgesiForm_durum', { defaultValue: 'Durum' })}</label>
                        <div className="flex-row items-center h-42 gap-8" style={{ height: '42px' }}>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={formData.aktifMi}
                                    onChange={(e) => handleChange('aktifMi', e.target.checked)}
                                />
                                <span className="slider round"></span>
                            </label>
                            <span className="text-14 text-secondary">{t('Aktif')}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex-row justify-between items-center mb-8">
                        <h4 className="text-14 font-semibold m-0">{t('TuketiciKredisiKomisyonBelgesiForm_gridBaslik', { defaultValue: 'Vade ve Komisyon Oranları' })}</h4>
                        <span className="badge badge-secondary">{t('TuketiciKredisiKomisyonBelgesiForm_satirSayisi', { defaultValue: 'Satır Sayısı' })}: {formData.satirlar.length}</span>
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

export default TuketiciKredisiKomisyonBelgesiForm;
