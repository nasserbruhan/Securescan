
import { jsPDF } from 'jspdf';
import { ScanResult, PremiumReport } from '../types';

export async function downloadReportPDF(report: PremiumReport | ScanResult) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(59, 130, 246); // Blue-500
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('SecureScan Audit Report', 20, 25);

  // Scan Summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text(`Target URL: ${report.url}`, 20, 55);
  doc.text(`Security Score: ${report.score}/100`, 20, 65);
  doc.text(`Risk Level: ${report.riskLevel}`, 20, 75);
  doc.text(`Date Scanned: ${new Date(report.timestamp).toLocaleString()}`, 20, 85);

  // Line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 95, pageWidth - 20, 95);

  // Issues
  let y = 110;
  doc.setFontSize(18);
  doc.text('Detected Issues', 20, y);
  y += 15;

  report.issues.forEach((issue) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${issue.status === 'Pass' ? '✓' : '✗'} ${issue.title} (${issue.impact})`, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(issue.description, pageWidth - 40), 20, y + 7);
    
    // If premium, add steps
    if ('detailedRecommendations' in report) {
      const rec = report.detailedRecommendations.find(r => r.issueId === issue.id);
      if (rec) {
        y += 20;
        doc.setFont('helvetica', 'italic');
        doc.text('How to Fix:', 25, y);
        y += 7;
        rec.steps.forEach(step => {
          doc.text(`• ${step}`, 30, y);
          y += 7;
        });
      } else {
         y += 20;
      }
    } else {
      y += 25;
    }
  });

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const disclaimer = 'Disclaimer: This tool performs passive security checks only and does not exploit vulnerabilities. It provides a baseline assessment and should not be considered a comprehensive security audit.';
  doc.text(doc.splitTextToSize(disclaimer, pageWidth - 40), 20, doc.internal.pageSize.getHeight() - 15);

  doc.save(`SecureScan_Report_${report.url.replace(/[^a-z0-9]/gi, '_')}.pdf`);
}
