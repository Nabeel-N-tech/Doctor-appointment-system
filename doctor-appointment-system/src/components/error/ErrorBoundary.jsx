import { Component } from 'react';
import toast from 'react-hot-toast';

/**
 * Error Boundary Component
 * ✅ Catches React component errors and prevents entire app crash
 * Shows user-friendly error message with fallback UI
 */
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('Error caught by boundary:', error);
        console.error('Error info:', errorInfo);

        // Notify user
        toast.error(error.message || 'An unexpected error occurred');
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
                            >
                                Go to Home
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                            >
                                Retry
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-6 text-left bg-gray-100 p-3 rounded text-xs">
                                <summary className="cursor-pointer font-bold">Error Details</summary>
                                <pre className="mt-2 overflow-auto text-red-600">
                                    {this.state.error?.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
