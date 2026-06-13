import { jsPDF } from 'jspdf';
import { Case } from '../types';

export const exportCaseToPDF = (currentCase: Case, t: (key: string) => string) => {
  // Create instance of jsPDF (A4, portrait, points/millimeters)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  let currentY = 20;

  // Primary Helper: Draw Divider Line
  const drawDivider = (y: number) => {
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // Primary Helper: Wrap Text cleanly and output line coordinates
  const renderWrappedText = (text: string, x: number, y: number, width: number, fontSize: number, fontStyle: 'normal' | 'bold' = 'normal', color: [number, number, number] = [30, 41, 59]): number => {
    doc.setFont('Helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, width);
    doc.text(lines, x, y);
    return lines.length * (fontSize * 0.3527) * 1.25; // Estimate height delta
  };

  // Header Banner
  doc.setFillColor(79, 70, 229); // royal indigo (79, 70, 229)
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Title Text inside Banner
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('WAGEGUARD UAE', margin, 18);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(224, 231, 255);
  doc.text(`Employment Rights Claim Documentation – Ref: #${currentCase.id.toUpperCase().substring(0, 10)}`, margin, 26);

  currentY = 48;

  // Metadata Block
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('CASE INFORMATION SUMMARY', margin, currentY);
  currentY += 6;

  drawDivider(currentY);
  currentY += 7;

  // Render Metadata fields side by side
  // Row 1
  renderWrappedText('Jurisdiction:', margin, currentY, 40, 9, 'bold', [100, 116, 139]);
  const employerText = currentCase.employerType === 'Freezone' && currentCase.freezone 
    ? currentCase.freezone 
    : currentCase.employerType;
  renderWrappedText(employerText, margin + 45, currentY, 50, 9, 'bold', [15, 23, 42]);

  renderWrappedText('Risk Profile:', margin + 100, currentY, 40, 9, 'bold', [100, 116, 139]);
  const riskColor: [number, number, number] = currentCase.riskLevel === 'High' ? [220, 38, 38] : currentCase.riskLevel === 'Medium' ? [217, 119, 6] : [21, 128, 61];
  renderWrappedText(currentCase.riskLevel || 'Medium', margin + 130, currentY, 40, 9, 'bold', riskColor);

  currentY += 8;

  // Row 2
  renderWrappedText('Primary Issue:', margin, currentY, 40, 9, 'bold', [100, 116, 139]);
  renderWrappedText(currentCase.issueTypes?.[0] || 'Unresolved Dispute', margin + 45, currentY, 50, 9, 'bold', [15, 23, 42]);

  renderWrappedText('Date Created:', margin + 100, currentY, 40, 9, 'bold', [100, 116, 139]);
  renderWrappedText(new Date(currentCase.createdAt).toLocaleDateString(), margin + 130, currentY, 40, 9, 'bold', [15, 23, 42]);

  currentY += 10;
  drawDivider(currentY);
  currentY += 8;

  // Description / Background Panel
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('STATEMENT OF SITUATION & EVENT', margin, currentY);
  currentY += 5;

  // Background box for Description
  const descHeight = doc.splitTextToSize(currentCase.description, contentWidth - 6).length * (9 * 0.3527) * 1.35;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(241, 245, 249); // slate-100
  doc.rect(margin, currentY, contentWidth, descHeight + 6, 'FD');
  
  renderWrappedText(currentCase.description, margin + 4, currentY + 5, contentWidth - 8, 9, 'normal', [51, 65, 85]);
  currentY += descHeight + 15;

  // strategic questions
  if (currentCase.strategicQuestions && currentCase.strategicQuestions.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('STRATEGIC SUGGESTED QUESTIONS', margin, currentY);
    currentY += 5;
    drawDivider(currentY);
    currentY += 6;

    currentCase.strategicQuestions.forEach((q, idx) => {
      const qHeight = renderWrappedText(`${idx + 1}. ${q}`, margin + 2, currentY, contentWidth - 4, 8.5, 'normal', [51, 65, 85]);
      currentY += qHeight + 3;
    });

    currentY += 8;
  }

  // Case Roadmap Section
  if (currentCase.roadmap && currentCase.roadmap.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('CASE STEPS & COMPLIANCE ROADMAP', margin, currentY);
    currentY += 5;
    drawDivider(currentY);
    currentY += 6;

    currentCase.roadmap.forEach((task) => {
      if (currentY > pageHeight - 25) {
        doc.addPage();
        currentY = 20;
      }

      // Check symbol status
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      if (task.isCompleted) {
        doc.setTextColor(21, 128, 61); // emerald green
        doc.text('[DONE]', margin, currentY);
      } else {
        doc.setTextColor(100, 116, 139); // slate grey
        doc.text('[ PENDING ]', margin, currentY);
      }
      
      const textX = margin + 22;
      const titleHeight = renderWrappedText(task.title, textX, currentY, contentWidth - 24, 9, 'bold', [15, 23, 42]);
      currentY += titleHeight + 0.5;

      const descHeight = renderWrappedText(task.description, textX, currentY, contentWidth - 24, 8, 'normal', [100, 116, 139]);
      currentY += descHeight + 4;
    });

    currentY += 6;
  }

  // Evidence Checklist Section
  if (currentCase.evidence && currentCase.evidence.length > 0) {
    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('EVIDENCE INVENTORY LOG', margin, currentY);
    currentY += 5;
    drawDivider(currentY);
    currentY += 6;

    currentCase.evidence.forEach((ev) => {
      if (currentY > pageHeight - 25) {
        doc.addPage();
        currentY = 20;
      }

      const fileY = currentY;
      renderWrappedText(`File: ${ev.description}`, margin, fileY, contentWidth / 2 - 5, 8.5, 'bold', [30, 41, 59]);
      renderWrappedText(`Category: ${ev.type}`, margin + (contentWidth / 2) + 2, fileY, contentY => {}, 8.5, 'bold', [79, 70, 229]);
      
      currentY += 5;
      if (ev.summary) {
        const sumHeight = renderWrappedText(`Summary: ${ev.summary}`, margin + 3, currentY, contentWidth - 6, 8, 'normal', [100, 116, 139]);
        currentY += sumHeight + 3;
      } else {
        currentY += 2;
      }
    });
  }

  // Footer styling for single/multi page outputs
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - 10);
    doc.text('WageGuard UAE • Secured Employment Files. Auto-generated compliance PDF record.', margin, pageHeight - 10);
  }

  // Securely trigger local user download on mobile
  doc.save(`WageGuard_Case_${currentCase.id.toUpperCase().substring(0,8)}.pdf`);
};
