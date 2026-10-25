import React, { createContext, useContext } from 'react';
import { AxiosInstance } from 'axios';
import { setHttpClient } from '../services/httpClient';

export interface SystemSettingsServiceContextValue {
    httpClient?: AxiosInstance;
    apiBaseUrl?: string;
    refreshProfile?: () => Promise<void>;
}

const SystemSettingsServiceContext = createContext<SystemSettingsServiceContextValue>({});

export interface SystemSettingsServiceProviderProps {
    children: React.ReactNode;
    value?: SystemSettingsServiceContextValue;
}

export const SystemSettingsServiceProvider: React.FC<SystemSettingsServiceProviderProps> = ({
    children,
    value = {},
}) => {
    if (value.httpClient) {
        setHttpClient(value.httpClient);
    }

    return (
        <SystemSettingsServiceContext.Provider value={value}>
            {children}
        </SystemSettingsServiceContext.Provider>
    );
};

export const useSystemSettingsService = () => useContext(SystemSettingsServiceContext);

export default SystemSettingsServiceContext;
