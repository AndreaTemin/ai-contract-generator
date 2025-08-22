import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Download, Wind } from 'lucide-react';

// Mock Contract Data - A comprehensive Terms of Service document
const MOCK_CONTRACT_SECTIONS = [
    { title: "1. Introduction", content: "<p>Welcome to SaaS Corp. These Terms of Service ('Terms') govern your use of our cloud cybersecurity software-as-a-service platform ('Service'). By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy. If you are using the Service on behalf of an organization, you are agreeing to these Terms for that organization and promising that you have the authority to bind that organization to these terms. In that case, 'you' and 'your' will refer to that organization.</p>" },
    { title: "2. Definitions", content: "<p><strong>'Service'</strong> means the cloud cybersecurity SaaS platform provided by SaaS Corp. <strong>'Customer Data'</strong> means all electronic data or information submitted by you to the Service. <strong>'User'</strong> means an individual authorized by you to use the Service. <strong>'Subscription Term'</strong> means the period during which you have agreed to subscribe to the Service.</p>" },
    { title: "3. Use of Service", content: "<h3>3.1. License Grant</h3><p>Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, non-sublicensable license to use the Service for your internal business purposes during the Subscription Term.</p><h3>3.2. Acceptable Use</h3><p>You agree not to (a) misuse our Service, (b) resell or white-label the Service, (c) use the Service to store or transmit infringing, libelous, or otherwise unlawful or tortious material, or to store or transmit material in violation of third-party privacy rights, (d) use the Service to store or transmit malicious code, or (e) attempt to gain unauthorized access to the Service or its related systems or networks.</p>" },
    { title: "4. Customer Data", content: "<p>You retain all right, title, and interest in and to your Customer Data. You grant us a worldwide, limited-term license to host, copy, transmit, and display your Customer Data as necessary for us to provide the Service in accordance with these Terms. We will maintain administrative, physical, and technical safeguards for the protection of the security, confidentiality, and integrity of your Customer Data.</p>" },
    { title: "5. Fees and Payment", content: "<h3>5.1. Subscription Fees</h3><p>You will pay all fees specified in your order form. Except as otherwise specified herein, (i) fees are based on services purchased and not actual usage, (ii) payment obligations are non-cancelable and fees paid are non-refundable, and (iii) quantities purchased cannot be decreased during the relevant subscription term.</p><h3>5.2. Invoicing and Payment</h3><p>Fees will be invoiced in advance and otherwise in accordance with the relevant order form. Unless otherwise stated, invoiced charges are due net 30 days from the invoice date. You are responsible for providing complete and accurate billing and contact information to us and notifying us of any changes to such information.</p><h3>5.3. Taxes</h3><p>Our fees do not include any taxes, levies, duties or similar governmental assessments of any nature, including, for example, value-added, sales, use or withholding taxes, assessable by any jurisdiction whatsoever (collectively, 'Taxes'). You are responsible for paying all Taxes associated with your purchases hereunder.</p>" },
    { title: "6. Confidentiality", content: "<p><strong>'Confidential Information'</strong> means all information disclosed by a party ('Disclosing Party') to the other party ('Receiving Party'), whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure. The Receiving Party will use the same degree of care that it uses to protect the confidentiality of its own confidential information of like kind (but not less than reasonable care) and agrees (i) not to use any Confidential Information of the Disclosing Party for any purpose outside the scope of this agreement, and (ii) except as otherwise authorized by the Disclosing Party in writing, to limit access to Confidential Information of the Disclosing Party to those of its and its affiliates’ employees and contractors who need that access for purposes consistent with this agreement and who have signed confidentiality agreements with the Receiving Party containing protections no less stringent than those herein.</p>" },
    { title: "7. Warranties and Disclaimers", content: "<h3>7.1. Our Warranties</h3><p>We warrant that the Service will perform materially in accordance with the applicable documentation. For any breach of a warranty above, your exclusive remedy shall be as provided in Section 10 (Termination).</p><h3>7.2. Disclaimers</h3><p>EXCEPT AS EXPRESSLY PROVIDED HEREIN, NEITHER PARTY MAKES ANY WARRANTY OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE, AND EACH PARTY SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES, INCLUDING ANY IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.</p>" },
    { title: "8. Limitation of Liability", content: "<p>IN NO EVENT SHALL EITHER PARTY'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED THE TOTAL AMOUNT PAID BY YOU HEREUNDER IN THE 12 MONTHS PRECEDING THE FIRST INCIDENT OUT OF WHICH THE LIABILITY AROSE. THE FOREGOING LIMITATION WILL APPLY WHETHER AN ACTION IS IN CONTRACT OR TORT AND REGARDLESS OF THE THEORY OF LIABILITY.</p><p>IN NO EVENT WILL EITHER PARTY HAVE ANY LIABILITY TO THE OTHER PARTY FOR ANY LOST PROFITS, REVENUES OR INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, COVER OR PUNITIVE DAMAGES, WHETHER AN ACTION IS IN CONTRACT OR TORT AND REGARDLESS OF THE THEORY OF LIABILITY, EVEN IF A PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>" },
    { title: "9. Term and Termination", content: "<h3>9.1. Term of Agreement</h3><p>This Agreement commences on the date you first accept it and continues until all subscription terms hereunder have expired or have been terminated.</p><h3>9.2. Termination for Cause</h3><p>A party may terminate this Agreement for cause (i) upon 30 days written notice to the other party of a material breach if such breach remains uncured at the expiration of such period, or (ii) if the other party becomes the subject of a petition in bankruptcy or any other proceeding relating to insolvency, receivership, liquidation or assignment for the benefit of creditors.</p><h3>9.3. Effect of Termination</h3><p>Upon any termination for cause by you, we will refund you any prepaid fees covering the remainder of the term of all order forms after the effective date of termination. Upon any termination for cause by us, you will pay any unpaid fees covering the remainder of the term of all order forms.</p>" },
    { title: "10. Governing Law and Jurisdiction", content: "<p>This Agreement shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of laws principles. The parties agree that the state and federal courts located in New York County, New York shall have exclusive jurisdiction to adjudicate any dispute arising out of or relating to this Agreement.</p>" },
    { title: "11. General Provisions", content: "<h3>11.1. Entire Agreement</h3><p>This Agreement is the entire agreement between you and us regarding the subject matter of this Agreement. This Agreement supersedes all prior or contemporaneous representations, understandings, agreements, or communications between you and us, whether written or verbal, regarding the subject matter of this Agreement.</p><h3>11.2. Assignment</h3><p>Neither party may assign any of its rights or obligations hereunder, whether by operation of law or otherwise, without the other party’s prior written consent (not to be unreasonably withheld).</p><h3>11.3. Notices</h3><p>Any notice or other communication to be given hereunder will be in writing and given by postpaid registered or certified mail return receipt requested, or electronic mail.</p>" },
    { title: "12. Contact Information", content: "<p>If you have any questions about these Terms, please contact us at legal@saascorp.com.</p><p><strong>SaaS Corp.</strong><br>123 Tech Avenue<br>New York, NY 10001<br>USA</p>" }
];

// Main App Component
export default function App() {
    const [prompt, setPrompt] = useState('Draft terms of service for a cloud cyber SaaS company based in New York');
    const [generatedHtml, setGeneratedHtml] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const streamIntervalRef = useRef(null);
    const contentRef = useRef(null);

    // Effect to scroll to the bottom of the content as it streams
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [generatedHtml]);

    const startGeneration = () => {
        setIsGenerating(true);
        setGeneratedHtml('');
        let sectionIndex = 0;

        // Simulate a real-time stream with a delay
        streamIntervalRef.current = setInterval(() => {
            if (sectionIndex < MOCK_CONTRACT_SECTIONS.length) {
                const section = MOCK_CONTRACT_SECTIONS[sectionIndex];
                const sectionHtml = `<div class="mb-8 animate-fade-in">
                    <h2 class="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">${section.title}</h2>
                    <div class="prose prose-lg max-w-none text-gray-700">${section.content}</div>
                </div>`;
                setGeneratedHtml(prev => prev + sectionHtml);
                sectionIndex++;
            } else {
                stopGeneration();
            }
        }, 700); // Adjust delay to simulate different streaming speeds
    };

    const stopGeneration = () => {
        setIsGenerating(false);
        if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
        }
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
                ${generatedHtml.replace(/class="[^"]*"/g, '')}
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
                        {generatedHtml ? (
                            <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
                        ) : (
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
