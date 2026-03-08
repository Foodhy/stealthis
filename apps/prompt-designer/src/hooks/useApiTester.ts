import { useState, useEffect } from 'react';
import { apiConfigService, ApiConfiguration } from '@/services/apiConfigService';
import { useI18n } from '@/i18n';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface Header {
    id: string;
    key: string;
    value: string;
}

interface ApiResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
    duration: number;
}

interface UseApiTesterReturn {
    url: string;
    setUrl: (url: string) => void;
    method: HttpMethod;
    setMethod: (method: HttpMethod) => void;
    body: string;
    setBody: (body: string) => void;
    headers: Header[];
    setHeaders: (headers: Header[]) => void;
    addHeader: () => void;
    updateHeader: (id: string, key: string, value: string) => void;
    removeHeader: (id: string) => void;
    response: ApiResponse | null;
    isLoading: boolean;
    error: string | null;
    executeRequest: () => Promise<void>;
    resetResponse: () => void;
    restoreLastConfiguration: () => void;
    restoreConfiguration: (id: string) => void;
    deleteConfiguration: (id: string) => void;
    clearAllConfigurations: () => void;
    savedConfigurations: ApiConfiguration[];
    hasSavedConfigurations: boolean;
}

export const useApiTester = (): UseApiTesterReturn => {
    const { t } = useI18n();
    const [url, setUrl] = useState('');
    const [method, setMethod] = useState<HttpMethod>('GET');
    const [body, setBody] = useState('');
    const [headers, setHeaders] = useState<Header[]>([
        { id: '1', key: 'Content-Type', value: 'application/json' }
    ]);
    const [response, setResponse] = useState<ApiResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedConfigurations, setSavedConfigurations] = useState<ApiConfiguration[]>([]);

    // Load saved configurations on mount and refresh after saves/deletes
    useEffect(() => {
        setSavedConfigurations(apiConfigService.getAll());
    }, []);

    const resetResponse = () => {
        setResponse(null);
        setError(null);
    };

    const addHeader = () => {
        const newHeader: Header = {
            id: Date.now().toString(),
            key: '',
            value: ''
        };
        setHeaders([...headers, newHeader]);
    };

    const updateHeader = (id: string, key: string, value: string) => {
        setHeaders(headers.map(h => 
            h.id === id ? { ...h, key, value } : h
        ));
    };

    const removeHeader = (id: string) => {
        setHeaders(headers.filter(h => h.id !== id));
    };

    const executeRequest = async () => {
        setIsLoading(true);
        resetResponse();
        const startTime = performance.now();

        try {
            if (!url.trim()) {
                throw new Error(t('apiTester.error.urlRequired'));
            }

            let normalizedUrl = url.trim();
            if (!/^https?:\/\//i.test(normalizedUrl)) {
                normalizedUrl = `https://${normalizedUrl}`;
            }

            let parsedUrl: URL;
            try {
                parsedUrl = new URL(normalizedUrl);
            } catch {
                throw new Error(t('apiTester.error.urlInvalid'));
            }

            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                throw new Error(t('apiTester.error.protocol'));
            }

            // Build headers object from headers array, filtering out empty keys
            const headersObj: Record<string, string> = {};
            headers.forEach(header => {
                if (header.key.trim()) {
                    headersObj[header.key.trim()] = header.value;
                }
            });

            const options: RequestInit = {
                method,
                headers: headersObj,
            };

            if (method !== 'GET' && body.trim()) {
                try {
                    // Validate JSON before sending
                    JSON.parse(body);
                    options.body = body;
                } catch {
                    throw new Error(t('apiTester.error.invalidJson'));
                }
            }

            const res = await fetch(parsedUrl.toString(), options);
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            const responseHeaders: Record<string, string> = {};
            res.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            let responseData: unknown;
            const contentType = res.headers.get('content-type');
            const responseText = await res.text();

            if (contentType && contentType.includes('application/json')) {
                try {
                    responseData = responseText ? JSON.parse(responseText) : null;
                } catch {
                    responseData = responseText;
                }
            } else {
                responseData = responseText;
            }

            const apiResponse = {
                status: res.status,
                statusText: res.statusText,
                headers: responseHeaders,
                data: responseData,
                duration,
            };

            setResponse(apiResponse);

            // Save configuration after execution (deduplicated in service)
            apiConfigService.saveConfiguration({
                url: parsedUrl.toString(),
                method,
                headers: headers.filter(h => h.key.trim()),
                body
            });
            setSavedConfigurations(apiConfigService.getAll());
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('apiTester.error.unexpected'));
        } finally {
            setIsLoading(false);
        }
    };

    const restoreLastConfiguration = () => {
        const lastConfig = apiConfigService.getLast();
        if (lastConfig) {
            restoreConfiguration(lastConfig.id);
        }
    };

    const restoreConfiguration = (id: string) => {
        const config = apiConfigService.getById(id);
        if (config) {
            setUrl(config.url);
            setMethod(config.method);
            setHeaders(config.headers);
            setBody(config.body);
        }
    };

    const deleteConfiguration = (id: string) => {
        if (window.confirm(t('apiTester.confirm.deleteConfiguration'))) {
            apiConfigService.deleteById(id);
            setSavedConfigurations(apiConfigService.getAll());
        }
    };

    const clearAllConfigurations = () => {
        if (window.confirm(t('apiTester.confirm.clearConfigurations'))) {
            apiConfigService.clearAll();
            setSavedConfigurations([]);
        }
    };

    const hasSavedConfigurations = savedConfigurations.length > 0;

    return {
        url,
        setUrl,
        method,
        setMethod,
        body,
        setBody,
        headers,
        setHeaders,
        addHeader,
        updateHeader,
        removeHeader,
        response,
        isLoading,
        error,
        executeRequest,
        resetResponse,
        restoreLastConfiguration,
        restoreConfiguration,
        deleteConfiguration,
        clearAllConfigurations,
        savedConfigurations,
        hasSavedConfigurations,
    };
};
