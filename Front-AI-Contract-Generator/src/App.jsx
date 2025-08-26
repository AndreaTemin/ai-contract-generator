import React, { useState, useRef } from 'react';
import { Play, Square, Download, Wind, AlertTriangle, Loader, FileText } from 'lucide-react';
import DOMPurify from 'dompurify';

// The base URL for the backend service. This should be an empty string in production
// if you are using Vercel rewrites, as the request will be proxied.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Main App Component
export default function App() {
    // State for the user's input prompt
    const [prompt, setPrompt] = useState('Draft terms of service for a cloud cyber SaaS company based in New York');
    // State to hold the array of document sections
    const [sections, setSections] = useState([]);
    // State to track if generation is in progress
    const [isGenerating, setIsGenerating] = useState(false);
    // State for handling any errors
    const [error, setError] = useState(null);
    // Ref to hold the AbortController to cancel the fetch request
    const abortControllerRef = useRef(null);

    /**
     * Initiates the two-step streaming process to generate the contract.
     */
    const startGeneration = async () => {
        // Reset state for a new generation
        setIsGenerating(true);
        setSections([]);
        setError(null);
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch(`${API_BASE_URL}/api/generate_tos_points`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/x-ndjson',
                },
                body: JSON.stringify({ prompt }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            // Process the newline-delimited JSON stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep the last, possibly incomplete, line for the next chunk

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    try {
                        const data = JSON.parse(line);

                        // Message 1: The initial skeleton
                        if (data.skeleton) {
                            setSections(data.skeleton);
                        }
                        // Message 2: Content chunks for specific sections
                        else if (data.id && data.content) {
                            setSections(prevSections =>
                                prevSections.map(sec =>
                                    sec.id === data.id
                                        ? { ...sec, content: sec.content + data.content }
                                        : sec
                                )
                            );
                        }
                        // Message 3: Error from the stream
                        else if (data.error) {
                            setError(data.error);
                            console.error("Error from stream:", data.error);
                            // Stop further processing on error
                            return;
                        }
                    } catch (e) {
                        console.error("Failed to parse stream chunk:", line, e);
                    }
                }
            }
        } catch (err) {
            // Ignore abort errors, as they are user-initiated
            if (err.name !== 'AbortError') {
                setError('Failed to connect to the generator service. Please ensure it is running and accessible.');
                console.error(err);
            }
        } finally {
            setIsGenerating(false);
            abortControllerRef.current = null;
        }
    };

    /**
     * Stops the ongoing generation process by aborting the fetch request.
     */
    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsGenerating(false);
    };

    /**
     * Compiles the generated sections into a full HTML document and triggers a download.
     */
    const downloadHtml = () => {
        const generatedHtml = sections
            .map(sec => `<h2>${sec.title}</h2>\n<div>${DOMPurify.sanitize(sec.content)}</div>`)
            .join('\n\n');

        const fullHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Generated Terms of Service</title>
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
                            disabled={isGenerating}
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
                                disabled={!sections.length || isGenerating}
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
                    <div className="flex-grow bg-white p-8 rounded-lg shadow-inner border border-gray-200 overflow-y-auto">
                        {error && (
                            <div className="flex flex-col items-center justify-center h-full text-red-600">
                                <AlertTriangle className="h-12 w-12 mb-4" />
                                <h3 className="text-lg font-semibold">An Error Occurred</h3>
                                <p className="text-center">{error}</p>
                            </div>
                        )}
                        
                        {!error && sections.length > 0 && (
                            <div className="prose prose-lg max-w-none">
                                <h1>Terms of Service</h1>
                                {sections.map(section => (
                                    <section key={section.id}>
                                        <h2 className="text-2xl font-semibold mt-8 mb-3 border-b pb-2">{section.title}</h2>
                                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.content) }} />
                                        {isGenerating && !section.content && (
                                            <div className="flex items-center space-x-2 text-gray-400 py-4">
                                                <Loader className="h-5 w-5 animate-spin" />
                                                <span>Generating content...</span>
                                            </div>
                                        )}
                                    </section>
                                ))}
                            </div>
                        )}

                        {!error && !isGenerating && sections.length === 0 && (
                           <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-400">
                                    <FileText className="mx-auto h-12 w-12" />
                                    <h3 className="mt-2 text-lg font-medium text-gray-600">Your generated contract will appear here.</h3>
                                    <p className="mt-1 text-sm">Describe your business and click 'Generate' to begin.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
