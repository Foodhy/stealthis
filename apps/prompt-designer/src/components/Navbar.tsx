import React from 'react';
import { useRouter } from '@/lib/router';
import { routes } from '@/lib/routes';
import { useI18n } from '@/i18n';
import { BadgeCheck, Database, LayoutGrid, LogOut, Settings, SlidersHorizontal, Waypoints } from 'lucide-react';
import { Button } from '@/components/native/button';

interface NavbarProps {
    onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
    const { navigate, currentPath } = useRouter();
    const { locale, setLocale, t } = useI18n();
    const navClass = (path: string) => {
        const isPromptsRoute =
            path === routes.prompts &&
            (currentPath === routes.home || currentPath === routes.prompts || currentPath.startsWith('/prompts/'));

        const isActive = isPromptsRoute || currentPath === path;

        return isActive
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground';
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Left side - Navigation */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(routes.prompts)}
                            className={`gap-2 ${navClass(routes.prompts)}`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            {t('nav.prompts')}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(routes.newSource)}
                            className={`gap-2 ${navClass(routes.newSource)}`}
                        >
                            <Database className="h-4 w-4" />
                            {t('nav.newSource')}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(routes.testEndpoints)}
                            className={`gap-2 ${navClass(routes.testEndpoints)}`}
                        >
                            <Waypoints className="h-4 w-4" />
                            {t('nav.testEndpoints')}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(routes.values)}
                            className={`gap-2 ${navClass(routes.values)}`}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            {t('nav.values')}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(routes.changelog)}
                            className={`gap-2 ${navClass(routes.changelog)}`}
                        >
                            <BadgeCheck className="h-4 w-4" />
                            {t('nav.changelog')}
                        </Button>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center rounded-md border border-border overflow-hidden">
                            <button
                                type="button"
                                aria-label={`${t('nav.language')}: ${t('lang.en')}`}
                                onClick={() => setLocale('en')}
                                className={`px-2 py-1 text-xs font-medium transition-colors ${
                                    locale === 'en'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                }`}
                            >
                                {t('lang.en')}
                            </button>
                            <button
                                type="button"
                                aria-label={`${t('nav.language')}: ${t('lang.es')}`}
                                onClick={() => setLocale('es')}
                                className={`px-2 py-1 text-xs font-medium transition-colors ${
                                    locale === 'es'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                }`}
                            >
                                {t('lang.es')}
                            </button>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(routes.settings)}
                            className="gap-2"
                        >
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('nav.settings')}</span>
                        </Button>

                        {onLogout && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onLogout}
                                className="gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">{t('nav.logout')}</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
