import { useRouter } from "@/lib/router";
import { useEffect } from "react";

const NotFound = () => {
  const { currentPath } = useRouter();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", currentPath);
  }, [currentPath]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="mb-4 text-6xl md:text-4xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-xl md:text-lg text-muted-foreground">Oops! Page not found</p>
        <a 
          href="/prompts" 
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
