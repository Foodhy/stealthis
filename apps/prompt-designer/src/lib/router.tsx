import React, { createContext, useContext, useState, useCallback } from 'react';

interface RouterContextValue {
  currentPath: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextValue>({
  currentPath: '/',
  navigate: () => {}
});

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a Router');
  }
  return context;
};

interface RouterProps {
  children: React.ReactNode;
}

export const Router: React.FC<RouterProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  const navigate = useCallback((path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
  }, []);

  // Handle browser back/forward buttons
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const handlePopState = () => {
        setCurrentPath(window.location.pathname);
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

interface RouteProps {
  path: string;
  element: React.ReactElement;
}

export const Route: React.FC<RouteProps> = ({ path, element }) => {
  const { currentPath } = useRouter();
  
  if (path === '*') {
    // Catch-all route - only show if no other routes match
    return element;
  }
  
  return currentPath === path ? element : null;
};

interface RoutesProps {
  children: React.ReactNode;
}

export const Routes: React.FC<RoutesProps> = ({ children }) => {
  const { currentPath } = useRouter();
  
  // Find matching route
  const routes = React.Children.toArray(children) as React.ReactElement[];
  const matchedRoute = routes.find(route => {
    if (route.props.path === currentPath) return true;
    return false;
  });
  
  // If no exact match, show catch-all route (*)
  if (!matchedRoute) {
    const catchAllRoute = routes.find(route => route.props.path === '*');
    return catchAllRoute || null;
  }
  
  return matchedRoute;
};