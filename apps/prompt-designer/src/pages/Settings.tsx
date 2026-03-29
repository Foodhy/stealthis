import React from 'react';
import { useRouter } from '@/lib/router';
import { routes } from '@/lib/routes';
import { useI18n } from '@/i18n';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/native/card';
import { Button } from '@/components/native/button';
import { ArrowLeft, Check } from 'lucide-react';

const themes = [
    {
        id: 'dark' as const,
        colors: {
            primary: 'hsl(217, 91%, 60%)',
            background: 'hsl(220, 25%, 8%)',
            card: 'hsl(220, 25%, 15%)',
        },
    },
    {
        id: 'light' as const,
        colors: {
            primary: 'hsl(217, 91%, 60%)',
            background: 'hsl(220, 15%, 95%)',
            card: 'hsl(220, 10%, 97%)',
        },
    },
    {
        id: 'amber' as const,
        colors: {
            primary: 'hsl(45, 90%, 60%)',
            background: 'hsl(40, 20%, 12%)',
            card: 'hsl(40, 18%, 18%)',
        },
    },
    {
        id: 'pink' as const,
        colors: {
            primary: 'hsl(330, 80%, 65%)',
            background: 'hsl(330, 20%, 12%)',
            card: 'hsl(330, 18%, 18%)',
        },
    },
    {
        id: 'green' as const,
        colors: {
            primary: 'hsl(150, 70%, 55%)',
            background: 'hsl(150, 25%, 12%)',
            card: 'hsl(150, 22%, 18%)',
        },
    },
    {
        id: 'blue' as const,
        colors: {
            primary: 'hsl(210, 100%, 50%)',
            background: 'hsl(222, 47%, 11%)',
            card: 'hsl(222, 45%, 15%)',
        },
    },
    {
        id: 'purple' as const,
        colors: {
            primary: 'hsl(270, 70%, 60%)',
            background: 'hsl(265, 40%, 10%)',
            card: 'hsl(265, 35%, 16%)',
        },
    },
    {
        id: 'sepia' as const,
        colors: {
            primary: 'hsl(30, 80%, 45%)',
            background: 'hsl(35, 30%, 88%)',
            card: 'hsl(35, 25%, 92%)',
        },
    },
    {
        id: 'crimson' as const,
        colors: {
            primary: 'hsl(345, 80%, 55%)',
            background: 'hsl(0, 10%, 90%)',
            card: 'hsl(0, 5%, 88%)',
        },
    },
    {
        id: 'sunset' as const,
        colors: {
            primary: 'hsl(15, 90%, 60%)',
            background: 'hsl(20, 20%, 90%)',
            card: 'hsl(20, 15%, 88%)',
        },
    },
];

const Settings = () => {
    const { navigate } = useRouter();
    const { t } = useI18n();
    const { theme, setTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(routes.prompts)}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('settings.back')}
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">{t('settings.title')}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('settings.subtitle')}
                        </p>
                    </div>
                </div>

                {/* Theme Selection */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-medium text-foreground">{t('settings.themeTitle')}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('settings.themeSubtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {themes.map((themeOption) => {
                            const isActive = theme === themeOption.id;

                            return (
                                <Card
                                    key={themeOption.id}
                                    className={`p-5 cursor-pointer transition-all duration-200 hover:border-primary/50 ${isActive ? 'border-primary ring-2 ring-primary/20' : ''
                                        }`}
                                    onClick={() => setTheme(themeOption.id)}
                                >
                                    <div className="space-y-4">
                                        {/* Theme Info */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-foreground flex items-center gap-2">
                                                    {t(`settings.theme.${themeOption.id}.name`)}
                                                    {isActive && (
                                                        <Check className="h-4 w-4 text-primary" />
                                                    )}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {t(`settings.theme.${themeOption.id}.description`)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Color Preview */}
                                        <div className="flex gap-2">
                                            <div
                                                className="h-10 flex-1 rounded border border-border"
                                                style={{ backgroundColor: themeOption.colors.background }}
                                                title={t('settings.preview.background')}
                                            />
                                            <div
                                                className="h-10 flex-1 rounded border border-border"
                                                style={{ backgroundColor: themeOption.colors.card }}
                                                title={t('settings.preview.card')}
                                            />
                                            <div
                                                className="h-10 flex-1 rounded border border-border"
                                                style={{ backgroundColor: themeOption.colors.primary }}
                                                title={t('settings.preview.primary')}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Info */}
                <Card className="p-4 bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">{t('settings.noteTitle')}</strong>{' '}
                        {t('settings.noteText')}
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
