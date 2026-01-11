
import React, { useState, useCallback } from 'react';
import { performWebsiteScan } from './services/scanService';
import { generateSecurityRecommendations } from './services/geminiService';
import { downloadReportPDF } from './services/pdfService';
import { ScanResult, RiskLevel, PremiumReport } from './types';
import SecurityGauge from './components/SecurityGauge';

// Icons as SVG components for simplicity and speed
const ShieldIcon = () => (
  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumReport, setPremiumReport] = useState<PremiumReport | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setScanResult(null);
    setPremiumReport(null);
    setIsPremium(false);

    try {
      const result = await performWebsiteScan(url);
      setScanResult(result);
    } catch (err) {
      alert("Scan failed. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!scanResult) return;
    
    setLoading(true);
    // Simulate Stripe Payment Redirect
    alert("Opening secure checkout for $10...");
    await new Promise(r => setTimeout(r, 1500));
    
    try {
      const recs = await generateSecurityRecommendations(scanResult);
      const fullReport: PremiumReport = {
        ...scanResult,
        detailedRecommendations: recs
      };
      setPremiumReport(fullReport);
      setIsPremium(true);
      alert("Payment Successful! Premium features unlocked.");
    } catch (err) {
      alert("Error generating premium report.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const reportToDownload = premiumReport || scanResult;
    if (reportToDownload) {
      downloadReportPDF(reportToDownload);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setScanResult(null); setUrl('');}}>
            <ShieldIcon />
            <span className="text-xl font-bold tracking-tight text-slate-800">SecureScan</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600">Enterprise</a>
            <a href="#" className="hover:text-blue-600">Pricing</a>
            <a href="#" className="hover:text-blue-600">Docs</a>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
            Get Started
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        {!scanResult && !loading && (
          <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
              Check Your Website's <span className="text-blue-600 underline decoration-blue-200">Security</span> in 60 Seconds
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Identify vulnerabilities, check encryption, and harden your servers before attackers do. 
              Non-intrusive scans for peace of mind.
            </p>
            
            <form onSubmit={handleScan} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="https://your-website.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-grow px-5 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-lg font-medium"
                required
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-1"
              >
                Scan Website
              </button>
            </form>
            
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-slate-400">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Passive Analysis</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Instant Report</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Zero Exploitation</div>
            </div>
          </div>
        )}

        {loading && (
          <div className="max-w-4xl mx-auto px-4 py-32 text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
               <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 animate-pulse">Scanning {url}...</h2>
            <div className="max-w-md mx-auto mt-4 bg-slate-200 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 scan-line"></div>
            </div>
            <p className="mt-4 text-slate-500 italic">Checking security headers, SSL certificates, and open ports...</p>
          </div>
        )}

        {scanResult && !loading && (
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row gap-8 mb-12">
              {/* Score Header */}
              <div className="flex-grow bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-10">
                <SecurityGauge score={scanResult.score} />
                <div className="flex-grow">
                  <h2 className="text-3xl font-bold mb-2">Security Audit Result</h2>
                  <p className="text-slate-500 mb-6 flex items-center gap-2">
                    Report generated for <span className="font-mono text-blue-600 font-semibold">{scanResult.url}</span>
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-2xl border ${scanResult.riskLevel === RiskLevel.LOW ? 'bg-green-50 border-green-100' : scanResult.riskLevel === RiskLevel.MEDIUM ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                      <div className="text-xs font-bold uppercase text-slate-400 mb-1">Risk Level</div>
                      <div className={`text-xl font-bold ${scanResult.riskLevel === RiskLevel.LOW ? 'text-green-700' : scanResult.riskLevel === RiskLevel.MEDIUM ? 'text-amber-700' : 'text-red-700'}`}>
                        {scanResult.riskLevel}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl border bg-slate-50 border-slate-100">
                      <div className="text-xs font-bold uppercase text-slate-400 mb-1">Infrastructure</div>
                      <div className="text-slate-700 font-semibold truncate">{scanResult.techStack.join(', ') || 'Unknown'}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                   <button 
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                     PDF Report
                   </button>
                   <button 
                    onClick={() => setScanResult(null)}
                    className="w-full px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                   >
                     New Scan
                   </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Issues Column */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  Detected Findings
                  <span className="bg-slate-100 text-slate-500 text-xs py-1 px-2 rounded-full font-mono">{scanResult.issues.length} Items</span>
                </h3>
                
                {scanResult.issues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${issue.status === 'Fail' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${issue.status === 'Fail' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {issue.status === 'Fail' ? '!' : '✓'}
                          </span>
                          <h4 className="font-bold text-lg text-slate-800">{issue.title}</h4>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${issue.impact === 'Critical' ? 'bg-red-100 text-red-700' : issue.impact === 'Warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {issue.impact}
                        </span>
                      </div>
                      <p className="text-slate-600 ml-11">{issue.description}</p>
                      
                      {isPremium && premiumReport && (
                        <div className="mt-6 ml-11 p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <h5 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Expert Fix Steps
                          </h5>
                          <ul className="text-sm text-blue-700 space-y-2">
                            {premiumReport.detailedRecommendations.find(r => r.issueId === issue.id)?.steps.map((step, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span className="text-blue-400 flex-shrink-0">•</span>
                                <span>{step}</span>
                              </li>
                            )) || <li className="italic">Standard best practices recommended.</li>}
                          </ul>
                          {premiumReport.detailedRecommendations.find(r => r.issueId === issue.id)?.remediationLink && (
                             <a 
                              href={premiumReport.detailedRecommendations.find(r => r.issueId === issue.id)?.remediationLink} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-block mt-3 text-sm font-bold text-blue-600 hover:underline"
                             >
                               Read official documentation &rarr;
                             </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar / Premium Lock */}
              <div className="space-y-6">
                {!isPremium ? (
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Unlock Full Recommendations</h3>
                      <p className="text-blue-100 mb-8 leading-relaxed">
                        Get step-by-step fix guides for every detected issue powered by SecureScan Intelligence. Includes code snippets and server configs.
                      </p>
                      <ul className="mb-8 space-y-3">
                         <li className="flex items-center gap-2 text-sm font-medium"><span className="text-blue-300">✓</span> Detailed Remediations</li>
                         <li className="flex items-center gap-2 text-sm font-medium"><span className="text-blue-300">✓</span> Downloadable Full PDF Audit</li>
                         <li className="flex items-center gap-2 text-sm font-medium"><span className="text-blue-300">✓</span> Continuous Monitoring</li>
                      </ul>
                      <button 
                        onClick={handleUpgrade}
                        className="w-full py-4 bg-white text-blue-700 rounded-2xl font-extrabold text-lg shadow-lg hover:bg-blue-50 transition-all active:scale-95"
                      >
                        Unlock for $10
                      </button>
                      <p className="mt-4 text-center text-xs text-blue-200 opacity-80 uppercase tracking-widest font-bold">One-time payment</p>
                    </div>
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Scan Details</h3>
                    <div className="space-y-4">
                      <div>
                         <div className="text-xs font-bold text-slate-400 uppercase mb-1">Ports Checked</div>
                         <div className="flex flex-wrap gap-2">
                           {[80, 443, 21, 22, 3306].map(p => (
                             <span key={p} className={`px-2 py-1 rounded text-xs font-mono font-bold ${scanResult.openPorts.includes(p) ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                               {p}
                             </span>
                           ))}
                         </div>
                      </div>
                      <div>
                         <div className="text-xs font-bold text-slate-400 uppercase mb-1">HTTPS Status</div>
                         <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-sm">
                               <span className="text-slate-600">Enabled</span>
                               <span className={scanResult.httpsStatus.enabled ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{scanResult.httpsStatus.enabled ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                               <span className="text-slate-600">HSTS Redirects</span>
                               <span className={scanResult.httpsStatus.redirects ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{scanResult.httpsStatus.redirects ? 'Yes' : 'No'}</span>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-900 p-8 rounded-3xl text-white">
                   <h3 className="text-xl font-bold mb-4">Need More?</h3>
                   <p className="text-slate-400 text-sm mb-6">Talk to a security engineer for a manual penetration test and compliance audit (SOC2, ISO27001).</p>
                   <button className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 border border-slate-700 transition-all">
                     Book Consultation
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <ShieldIcon />
            <span className="text-lg font-bold text-slate-800">SecureScan</span>
          </div>
          <p className="text-slate-500 max-w-xl mx-auto mb-8 text-sm italic">
            “This tool performs passive security checks only and does not exploit vulnerabilities.”
          </p>
          <div className="flex justify-center gap-8 text-sm text-slate-400">
            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600">Terms of Service</a>
            <a href="#" className="hover:text-blue-600">Responsible Disclosure</a>
          </div>
          <p className="mt-8 text-slate-400 text-xs font-medium">
            &copy; {new Date().getFullYear()} SecureScan Inc. Built for the modern web.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
