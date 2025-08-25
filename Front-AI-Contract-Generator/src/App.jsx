import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Download, Wind, AlertTriangle } from 'lucide-react';

// The base URL for the backend service.
// This can be changed to an elastic IP or domain name in production.
// const API_BASE_URL = 'https://gd1m7o7036.execute-api.us-east-1.amazonaws.com';
// const API_BASE_URL = 'http://ai-contract-alb-1009035318.us-east-1.elb.amazonaws.com';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Main App Component
export default function App() {
    const [prompt, setPrompt] = useState('Draft terms of service for a cloud cyber SaaS company based in New York');
    const [generatedHtml, setGeneratedHtml] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const contentRef = useRef(null);
    // Use a ref to hold the AbortController, allowing us to cancel the fetch request.
    const abortControllerRef = useRef(null);

    // Effect to scroll to the bottom of the content as it streams
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [generatedHtml]);

    const startGeneration = async () => {
        // Reset state before starting a new generation
        setIsGenerating(true);
        setGeneratedHtml('');
        setError(null);
        
        // Create a new AbortController for this request
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch(`${API_BASE_URL}/api/stream_text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/html',
                },
                body: JSON.stringify({ prompt }),
                // Pass the signal to the fetch request
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            // Handle the streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                const chunk = decoder.decode(value, { stream: true });
                setGeneratedHtml((prev) => prev + chunk);
            }

        } catch (err) {
            // If the error is an AbortError, it's an expected cancellation, so we don't set an error state.
            if (err.name !== 'AbortError') {
                setError('Failed to connect to the generator service. Please ensure it is running and accessible.');
                console.error(err);
            }
        } finally {
            setIsGenerating(false);
            abortControllerRef.current = null;
        }
    };

    const stopGeneration = () => {
        if (abortControllerRef.current) {
            // Abort the fetch request
            abortControllerRef.current.abort();
        }
        setIsGenerating(false);
    };

    const downloadHtml = () => {
        const fullHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Generated Contract</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 0 20px; }
                    h1 { font-size: 2.5em; color: #111; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 30px; }
                    h2 { font-size: 1.8em; color: #222; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 40px; margin-bottom: 20px; }
                    h3 { font-size: 1.3em; color: #333; margin-top: 30px; }
                    p { margin-bottom: 15px; }
                    strong { font-weight: 600; }
                </style>
            </head>
            <body>
                <h1>Terms of Service</h1>
                ${generatedHtml}
            </body>
            </html>
        `;
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'terms_of_service.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-sans">
            <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
                <div className="flex items-center space-x-3">
                    <Wind className="h-8 w-8 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-800">AI Contract Generator</h1>
                </div>
            </header>

            <main className="flex-grow flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
                {/* Control Panel */}
                <div className="w-full md:w-1/3 flex flex-col space-y-4">
                    <div className="bg-white p-6 rounded-lg shadow-md flex-grow flex flex-col">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Describe Your Business</h2>
                        <textarea
                            className="w-full flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out resize-none"
                            placeholder="e.g., 'Draft terms of service for a cloud cyber SaaS company...'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={8}
                        />
                        <div className="flex space-x-3 mt-4">
                            {!isGenerating ? (
                                <button
                                    onClick={startGeneration}
                                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
                                >
                                    <Play className="mr-2 -ml-1 h-5 w-5" />
                                    Generate
                                </button>
                            ) : (
                                <button
                                    onClick={stopGeneration}
                                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-105"
                                >
                                    <Square className="mr-2 -ml-1 h-5 w-5" />
                                    Stop
                                </button>
                            )}
                            <button
                                onClick={downloadHtml}
                                disabled={!generatedHtml || isGenerating}
                                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Download className="mr-2 -ml-1 h-5 w-5" />
                                Download
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Display */}
                <div className="w-full md:w-2/3 flex flex-col">
                    <div ref={contentRef} className="flex-grow bg-white p-8 rounded-lg shadow-inner border border-gray-200 overflow-y-auto">
                        {error && (
                            <div className="flex flex-col items-center justify-center h-full text-red-600">
                                <AlertTriangle className="h-12 w-12 mb-4" />
                                <h3 className="text-lg font-semibold">Connection Error</h3>
                                <p className="text-center">{error}</p>
                            </div>
                        )}
                        {!error && generatedHtml && (
                            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: generatedHtml }} />
                        )}
                        {!error && !generatedHtml && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-400">
                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <h3 className="mt-2 text-lg font-medium text-gray-600">Your generated contract will appear here.</h3>
                                    <p className="mt-1 text-sm">Click 'Generate' to begin.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
