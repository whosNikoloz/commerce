import React, { createContext, useContext, useState, useEffect } from 'react';

export type TenantConfig = {
    templateId: number;
    themeColor: string;
    logoUrl: string;
};

type TenantContextType = {
    config: TenantConfig | null;
    isLoading: boolean;
};

const TenantContext = createContext<TenantContextType>({
    config: null,
    isLoading: true
});

export const useTenant = () => useContext(TenantContext);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<TenantConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const cached = localStorage.getItem("tenantConfig");

        if (cached) {
            setConfig(JSON.parse(cached));
            setIsLoading(false);
        } else {
            const host = window.location.host;
            fetch(`https://api.yourdomain.com/api/tenant-config?host=${host}`)
                .then(res => res.json())
                .then(data => {
                    setConfig(data);
                    localStorage.setItem("tenantConfig", JSON.stringify(data));
                    setIsLoading(false);
                })
                .catch(() => setIsLoading(false));
        }
    }, []);


    return (
        <TenantContext.Provider value={{ config, isLoading }}>
            {children}
        </TenantContext.Provider>
    );
};
