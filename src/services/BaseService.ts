import { httpClient } from './httpClient';

export class BaseService<TDto, TCreateDto = Partial<TDto>, TUpdateDto = Partial<TDto>> {
    protected endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    async getAll(params?: Record<string, any>): Promise<TDto[]> {
        const response = await httpClient.get(this.endpoint, { params });
        return response.data;
    }

    async getById(id: string | number): Promise<TDto> {
        const response = await httpClient.get(`${this.endpoint}/${id}`);
        return response.data;
    }

    async create(data: TCreateDto): Promise<TDto> {
        const response = await httpClient.post(this.endpoint, data);
        return response.data;
    }

    async update(id: string | number, data: TUpdateDto): Promise<TDto> {
        const response = await httpClient.put(`${this.endpoint}/${id}`, data);
        return response.data;
    }

    async delete(id: string | number): Promise<void> {
        await httpClient.delete(`${this.endpoint}/${id}`);
    }
}

export default BaseService;
