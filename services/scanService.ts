
import { ScanResult, RiskLevel, SecurityIssue } from '../types';

/**
 * MOCK SCAN LOGIC
 * In a real production environment, this service would call a Node.js API 
 * that performs real network requests, header analysis, and port scanning.
 */
export async function performWebsiteScan(targetUrl: string): Promise<ScanResult> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 2500));

  let url = targetUrl;
  if (!url.startsWith('http')) url = 'https://' + url;
  
  // Randomizing results for the sake of the MVP demo to show different states
  const hasHttps = !url.includes('http://');
  const missingHeaders = ['Content-Security-Policy', 'X-Frame-Options', 'Strict-Transport-Security'].filter(() => Math.random() > 0.5);
  const openPorts = [80, 443];
  if (Math.random() > 0.7) openPorts.push(22); // SSH exposed
  if (Math.random() > 0.8) openPorts.push(3306); // MySQL exposed

  const tech = ['Nginx'];
  if (Math.random() > 0.5) tech.push('WordPress 6.4');
  if (Math.random() > 0.6) tech.push('PHP 7.4 (Outdated)');

  const issues: SecurityIssue[] = [];

  // 1. HTTPS Check
  if (!hasHttps) {
    issues.push({
      id: 'https-missing',
      category: 'HTTPS',
      title: 'Missing HTTPS Encryption',
      description: 'Your website is communicating over unencrypted HTTP, making it vulnerable to data interception.',
      impact: 'Critical',
      status: 'Fail'
    });
  } else {
    issues.push({
      id: 'https-ok',
      category: 'HTTPS',
      title: 'HTTPS Enabled',
      description: 'Secure connection is active via SSL/TLS.',
      impact: 'Info',
      status: 'Pass'
    });
  }

  // 2. Headers Check
  missingHeaders.forEach(header => {
    issues.push({
      id: `header-${header.toLowerCase()}`,
      category: 'Headers',
      title: `Missing ${header}`,
      description: `The security header ${header} is missing from your server configuration.`,
      impact: 'Warning',
      status: 'Fail'
    });
  });

  // 3. Port Check
  const riskyPorts = openPorts.filter(p => ![80, 443].includes(p));
  riskyPorts.forEach(port => {
    issues.push({
      id: `port-${port}`,
      category: 'Ports',
      title: `Open Port Detected: ${port}`,
      description: `Port ${port} is open and accessible from the public internet.`,
      impact: 'Critical',
      status: 'Fail'
    });
  });

  // 4. Technology Check
  if (tech.some(t => t.includes('Outdated'))) {
    issues.push({
      id: 'tech-outdated',
      category: 'Tech',
      title: 'Outdated Technology Detected',
      description: 'Publicly exposed version information shows you are running outdated software.',
      impact: 'Warning',
      status: 'Fail'
    });
  }

  // Scoring Logic
  let score = 100;
  if (!hasHttps) score -= 30;
  score -= (missingHeaders.length * 5);
  score -= (riskyPorts.length * 15);
  if (tech.some(t => t.includes('Outdated'))) score -= 10;

  score = Math.max(0, score);

  let riskLevel = RiskLevel.LOW;
  if (score < 50) riskLevel = RiskLevel.HIGH;
  else if (score < 80) riskLevel = RiskLevel.MEDIUM;

  return {
    url,
    score,
    riskLevel,
    timestamp: new Date().toISOString(),
    issues,
    techStack: tech,
    openPorts,
    httpsStatus: {
      enabled: hasHttps,
      redirects: hasHttps,
      validCert: hasHttps
    }
  };
}
