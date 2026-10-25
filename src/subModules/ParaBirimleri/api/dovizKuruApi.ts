import axios from 'axios';

export interface DovizKuruDto {
  id: number;
  tarih: string;
  paraBirimiId: number;
  paraBirimiKod: string;
  paraBirimiSembol: string;
  dovizAlis: number;
  dovizSatis: number;
  efektifAlis: number;
  efektifSatis: number;
}

export interface DovizKuruGuncelleDto {
  dovizAlis: number;
  dovizSatis: number;
  efektifAlis: number;
  efektifSatis: number;
}

export const getDovizKurlari = async (tarih?: string): Promise<DovizKuruDto[]> => {
  const response = await axios.get<DovizKuruDto[]>('/api/DovizKurlari', {
    params: { tarih }
  });
  return response.data;
};

export const syncDovizKurlari = async (tarih?: string): Promise<DovizKuruDto[]> => {
  const response = await axios.post<DovizKuruDto[]>('/api/DovizKurlari/sync', null, {
    params: { tarih }
  });
  return response.data;
};

export const updateDovizKuru = async (id: number, dto: DovizKuruGuncelleDto): Promise<DovizKuruDto> => {
  const response = await axios.put<DovizKuruDto>(`/api/DovizKurlari/${id}`, dto);
  return response.data;
};
