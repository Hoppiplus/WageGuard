import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Explicitly log start to debug white screen issues
console.log("[App] Starting bootstrap sequence...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("[App] Fatal: Root element not found!");
  document.body.innerHTML = '<div style="color:red; padding:20px;">Error: Root element missing.</div>';
} else {
  console.log("[App] Root element found, mounting React...");
  
  try {
    const root = ReactDOM.createRoot(rootElement);
    
    // Simple Error Boundary
    class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
      constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
      }

      componentDidCatch(error: any, errorInfo: any) {
        console.error("[App] React Error Boundary caught:", error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          return (
            <div className="p-8 text-center">
              <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
              <p className="text-sm text-gray-600 mb-4">Please refresh the page.</p>
              <pre className="bg-gray-100 p-4 rounded text-left text-xs overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </div>
          );
        }
        return this.props.children;
      }
    }

    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("[App] Mount command sent.");
  } catch (e) {
    console.error("[App] Fatal error during mount:", e);
    rootElement.innerHTML = `<div style="color:red; padding:20px;">Fatal Mount Error: ${e}</div>`;
  }
}
