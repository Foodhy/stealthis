import { PasswordGate } from '@/components/PasswordGate';
import { useApiTester } from '@/hooks/useApiTester';
import { RequestPanel } from '@/components/ApiTester/RequestPanel';
import { ResponsePanel } from '@/components/ApiTester/ResponsePanel';

const TestEndpoints = () => {
    const {
        url,
        setUrl,
        method,
        setMethod,
        body,
        setBody,
        headers,
        addHeader,
        updateHeader,
        removeHeader,
        response,
        isLoading,
        error,
        executeRequest,
        restoreConfiguration,
        deleteConfiguration,
        clearAllConfigurations,
        savedConfigurations,
        hasSavedConfigurations
    } = useApiTester();

    return (
        <PasswordGate>
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <h1 className="text-2xl font-semibold text-foreground">API Tester</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <RequestPanel
                                url={url}
                                onUrlChange={setUrl}
                                method={method}
                                onMethodChange={setMethod}
                                body={body}
                                onBodyChange={setBody}
                                headers={headers}
                                onAddHeader={addHeader}
                                onUpdateHeader={updateHeader}
                                onRemoveHeader={removeHeader}
                                onExecute={executeRequest}
                                isLoading={isLoading}
                                onRestoreConfiguration={restoreConfiguration}
                                onDeleteConfiguration={deleteConfiguration}
                                onClearHistory={clearAllConfigurations}
                                savedConfigurations={savedConfigurations}
                                hasSavedConfigurations={hasSavedConfigurations}
                            />
                        </div>
                        <div className="h-full min-h-[500px]">
                            <ResponsePanel response={response} error={error} />
                        </div>
                    </div>
                </div>
            </div>
        </PasswordGate>
    );
};

export default TestEndpoints;
