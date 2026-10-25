import axios, { AxiosInstance } from 'axios';

let client: AxiosInstance = axios;

export const setHttpClient = (customClient: AxiosInstance) => {
    client = customClient;
};

export const getHttpClient = (): AxiosInstance => {
    return client;
};

export const httpClient = {
    get: (...args: Parameters<AxiosInstance['get']>) => client.get(...args),
    post: (...args: Parameters<AxiosInstance['post']>) => client.post(...args),
    put: (...args: Parameters<AxiosInstance['put']>) => client.put(...args),
    delete: (...args: Parameters<AxiosInstance['delete']>) => client.delete(...args),
    patch: (...args: Parameters<AxiosInstance['patch']>) => client.patch(...args),
    request: (...args: Parameters<AxiosInstance['request']>) => client.request(...args),
};

export default httpClient;
