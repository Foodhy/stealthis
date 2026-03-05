import React from 'react';
import { useRouter } from '@/lib/router';
import { Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/native/button';

interface NavbarProps {
    onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
    const { navigate, currentPath } = useRouter();
    const navClass = (path: string) =>
        currentPath === path || (path === '/prompts' && currentPath === '/')
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Left side - Navigation */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/prompts')}
                            className={navClass('/prompts')}
                        >
                            Prompts
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/nueva-fuente')}
                            className={navClass('/nueva-fuente')}
                        >
                            Nueva fuente
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/probar-endpoints')}
                            className={navClass('/probar-endpoints')}
                        >
                            Probar endpoints
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/valores')}
                            className={navClass('/valores')}
                        >
                            Valores
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/changelog')}
                            className={navClass('/changelog')}
                        >
                            Changelog
                        </Button>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/configuracion')}
                            className="gap-2"
                        >
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">Configuración</span>
                        </Button>

                        {onLogout && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onLogout}
                                className="gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Cerrar sesión</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
