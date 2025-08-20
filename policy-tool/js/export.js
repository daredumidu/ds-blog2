/**
 * PDF Export functionality
 */

import { state } from './state.js';
import { dataLoader } from './data-loader.js';
import { expertsManager } from './experts.js';
import { utils } from './utils.js';

export class ExportManager {
    constructor() {
        this.DESIGN = {
            colors: {
                // TPAF dimension colors
                infrastructure: '#005193',
                legislation: '#FBAD17', 
                sustainability: '#9C27B0',
                economic: '#E11A2C',
                education: '#4CAF50',
                
                // Document colors
                primary: '#1a365d',
                secondary: '#2d3748',
                text: '#2d3748',
                textLight: '#4a5568',
                textMuted: '#718096',
                background: '#ffffff',
                backgroundLight: '#f8fafc',
                border: '#e2e8f0',
                accent: '#3182ce'
            },
            
            typography: {
                title: 18,
                sectionTitle: 14,
                heading: 11,
                subheading: 9,
                body: 9,
                small: 8,
                tiny: 7
            },
            
            spacing: {
                margin: 20,
                section: 12,
                policy: 8,
                paragraph: 4,
                element: 3
            },
            
            layout: {
                lineHeight: 1.4,
                paragraphSpacing: 4,
                maxTextWidth: 170
            }
        };
    }

    // Convert hex to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result 
            ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
            : [0, 0, 0];
    }

    // Get dimension color
    getPolicyAreaColor(dimension) {
        const colorMap = {
            'Enabling Infrastructure': 'var(--color-infrastructure)',
            'Legislation & Policy': 'var(--color-legislation)',
            'Sustainability & Society': 'var(--color-sustainability)',
            'Economy & Innovation': 'var(--color-economy)',
            'Research & Education': 'var(--color-research)'
        };
        relatedPolicyDimensionEl.style.background = colorMap[policy.dimension] || 'var(--color-gray-200)';
    }

    // Render paragraph with proper spacing
    renderParagraph(pdf, text, x, y, maxWidth, pageWidth, fontSize = null, lineHeight = null) {
        if (!text || text.trim() === '') return 0;

        fontSize = fontSize || this.DESIGN.typography.body;
        lineHeight = lineHeight || this.DESIGN.layout.lineHeight;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(fontSize);
        
        const actualMaxWidth = Math.min(maxWidth, pageWidth - x - this.DESIGN.spacing.margin);
        const lines = pdf.splitTextToSize(text.trim(), actualMaxWidth);
        const lineHeightInMM = (fontSize * lineHeight) / 2.83465;
        
        lines.forEach((line, index) => {
            pdf.text(line, x, y + (index * lineHeightInMM));
        });
        
        return lines.length * lineHeightInMM;
    }

    // Draw section header
    drawSectionHeader(pdf, title, subtitle, color, x, y, width, percentage) {
        const headerHeight = 25;
        
        pdf.setFillColor(...this.hexToRgb(color));
        pdf.rect(x, y, width, headerHeight, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(this.DESIGN.typography.sectionTitle);
        
        const titleWidth = pdf.getStringUnitWidth(title) * this.DESIGN.typography.sectionTitle / pdf.internal.scaleFactor;
        const maxTitleWidth = width - (percentage ? 40 : 16);
        
        let displayTitle = title;
        if (titleWidth > maxTitleWidth) {
            while (pdf.getStringUnitWidth(displayTitle + '...') * this.DESIGN.typography.sectionTitle / pdf.internal.scaleFactor > maxTitleWidth && displayTitle.length > 0) {
                displayTitle = displayTitle.slice(0, -1);
            }
            displayTitle += '...';
        }
        
        pdf.text(displayTitle, x + 8, y + 12);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(this.DESIGN.typography.small);
        pdf.text(subtitle, x + 8, y + 20);
        
        if (percentage !== undefined) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
        }
        
        return headerHeight;
    }

    // Capture matrix visualization
    async captureMatrixVisualization() {
        try {
            const html2canvas = (await import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.min.js')).default;
            
            const matrixContainer = document.querySelector('.selection-matrix-container');
            if (!matrixContainer) return null;

            const canvas = await html2canvas(matrixContainer, {
                backgroundColor: 'white',
                scale: 2,
                logging: false,
                useCORS: true
            });

            return canvas.toDataURL('image/png', 0.95);
        } catch (error) {
            console.error('Implementation Plan Dashboard capture failed:', error);
            return null;
        }
    }

    // Group policies by dimension
    groupPoliciesByDimension() {
        const policyData = dataLoader.getPolicyData();
        const policiesByPolicyArea = {};
        
        Array.from(state.selectedPolicies).forEach(policyKey => {
            const [dimension, phase, policyId] = policyKey.split('|');
            if (!policiesByPolicyArea[dimension]) {
                policiesByPolicyArea[dimension] = [];
            }
            
            const policyInfo = policyData[dimension]?.[phase]?.[policyId];
            if (policyInfo) {
                policiesByPolicyArea[dimension].push({
                    id: policyId,
                    phase: phase,
                    policy: policyInfo.policy,
                    details: policyInfo.details,
                    examples: policyInfo.examples,
                    keywords: policyInfo.keywords
                });
            }
        });

        return policiesByPolicyArea;
    }

    // Generate cover page
    generateCoverPage(pdf, pageWidth, pageHeight, savedCount, dimensionCount) {
        const margin = this.DESIGN.spacing.margin;

        pdf.setFillColor(...this.hexToRgb(this.DESIGN.colors.primary));
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        // G20 Logo area
        pdf.setFillColor(255, 255, 255);
        pdf.rect(margin, 15, 60, 15, 'F');
        pdf.setTextColor(...this.hexToRgb(this.DESIGN.colors.primary));
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('G20 TPAF', margin + 30, 25, { align: 'center' });

        // Main title
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(24);
        pdf.text('Implementation Plan: Selected Policy Initiatives', pageWidth/2, 87, { align: 'center' });
        
        // Subtitle
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        const today = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', month: 'long', day: 'numeric' 
        });
        pdf.text(`Generated: ${today}`, pageWidth/2, 120, { align: 'center' });
        pdf.text(`Selected Policy Initiatives: ${savedCount}`, pageWidth/2, 135, { align: 'center' });
        pdf.text(`Covering ${dimensionCount} policy areas`, pageWidth/2, 150, { align: 'center' });

        // Summary information at bottom
        const summaryBoxY = pageHeight - 80;
        pdf.setFontSize(this.DESIGN.typography.body);
        const summaryTextY = summaryBoxY + 15;
        pdf.text('G20 Technology Policy Assistance Facility (TPAF)', pageWidth / 2, summaryTextY, { align: 'center' });
        pdf.text('Selected Policy Initiatives', pageWidth / 2, summaryTextY + 10, { align: 'center' });
    }

    // Generate executive summary
    generateExecutiveSummary(pdf, pageWidth, savedCount, dimensionCount, policiesByPolicyArea) {
        const margin = this.DESIGN.spacing.margin;
        const contentWidth = pageWidth - (margin * 2);
        let currentY = margin;

        pdf.setTextColor(...this.hexToRgb(this.DESIGN.colors.primary));
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(this.DESIGN.typography.sectionTitle);
        pdf.text('Executive Summary', margin, currentY);
        currentY += 15;

        pdf.setTextColor(...this.hexToRgb(this.DESIGN.colors.text));
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(this.DESIGN.typography.body);
        
        const overviewText = `This implementation plan outlines ${savedCount} selected AI policy initiatives across ${dimensionCount} key policy areas.`;
        
        currentY += this.renderParagraph(pdf, overviewText, margin, currentY, contentWidth, pageWidth);
        currentY += this.DESIGN.spacing.paragraph;

        // Policy Area Overview
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(this.DESIGN.typography.heading);
        pdf.text('Selected Policy Areas', margin, currentY);
        currentY += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(this.DESIGN.typography.body);

        Object.entries(policiesByPolicyArea).forEach(([dimension, policies]) => {
            const dimColor = this.getPolicyAreaColor(dimension);
            
            pdf.setFillColor(...this.hexToRgb(dimColor));
            pdf.rect(margin, currentY - 2, 3, 6, 'F');
            
            pdf.setTextColor(...this.hexToRgb(this.DESIGN.colors.text));
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${dimension}:`, margin + 6, currentY);
            
            pdf.setFont('helvetica', 'normal');
            const uniquePhases = [...new Set(policies.map(p => p.phase))];
            const summaryText = `${policies.length} policy options selected, covering ${uniquePhases.length} implementation phases`;
            currentY += this.renderParagraph(pdf, summaryText, margin + 6, currentY + 4, contentWidth - 6, pageWidth, this.DESIGN.typography.small);
            currentY += 8;
        });

        // Add relevant experts section
        if (expertsManager.getCurrentExperts().length > 0) {
            const relevantExperts = expertsManager.findRelevantExpertsForPolicies(state.selectedPolicies);
            
            if (relevantExperts.length > 0) {
                currentY += 8;
                pdf.setTextColor(...this.hexToRgb(this.DESIGN.colors.text));
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(this.DESIGN.typography.body);
                
                const expertNames = relevantExperts.map(expert => expert.name).join(', ');
                const expertsText = `Relevant experts working in similar policy areas: ${expertNames}`;
                
                currentY += this.renderParagraph(pdf, expertsText, margin, currentY, contentWidth, pageWidth);
            }
        }

        return currentY;
    }

    // Generate matrix visualization page
    async generateMatrixPage(pdf, pageWidth, matrixImageData) {
        if (!matrixImageData) return;

        const margin = this.DESIGN.spacing.margin;
        const contentWidth = pageWidth - (margin * 2);
        let currentY = margin;

        pdf.addPage();

        pdf.setTextColor(...this.hexToRgb(this.DESIGN.colors.primary));
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(this.DESIGN.typography.sectionTitle);
        pdf.text('Implementation Plan Dashboard', margin, currentY);
        currentY += 15;

        const imgWidth = contentWidth;
        const imgHeight = Math.min(224, imgWidth * 0.84);
        
        pdf.addImage(matrixImageData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(this.DESIGN.typography.small);
        pdf.setTextColor(...this.hexToRgb(this.DESIGN.colors.textMuted));
        const captionText = 'This matrix shows your selected policy initiatives (represented by colored bars) across the five policy areas and four implementation phases.';
        this.renderParagraph(pdf, captionText, margin, currentY, contentWidth, pageWidth, this.DESIGN.typography.small);
    }

    // Generate detailed policy sections
    generatePolicyDetails(pdf, pageWidth, pageHeight, policiesByPolicyArea) {
        const margin = this.DESIGN.spacing.margin;
        const contentWidth = pageWidth - (margin * 2);

        Object.entries(policiesByPolicyArea).forEach(([dimension, policies]) => {
            pdf.addPage();
            let currentY = margin;

            const dimColor = this.getPolicyAreaColor(dimension);
            
            const headerHeight = this.drawSectionHeader(
                pdf, 
                dimension, 
                `${policies.length} selected policy options`,
                dimColor,
                margin,
                currentY,
                contentWidth
            );
            currentY += headerHeight + this.DESIGN.spacing.section;

            // Individual Policy Sections
            policies.forEach((policy, policyIndex) => {
                const estimatedPolicyHeight = 100;
                if (currentY > pageHeight - estimatedPolicyHeight && policyIndex > 0) {
                    pdf.addPage();
                    currentY = margin;
                }

                // Policy header
                const headerWidth = contentWidth;
                pdf.setFillColor(...this.hexToRgb(this.DESIGN.colors.backgroundLight));
                pdf.rect(margin, currentY, headerWidth, 12, 'F');
                
                pdf.setFillColor(...this.hexToRgb(dimColor));
                pdf.rect(margin, currentY, 4, 12, 'F');

                pdf.setTextColor(...this.hexToRgb(this.DESIGN.colors.text));
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(this.DESIGN.typography.heading);
                
                const titleText = `${policyIndex + 1}. ${policy.id}: ${policy.policy}`;
                const titleHeight = this.renderParagraph(pdf, titleText, margin + 8, currentY + 8, headerWidth - 16, pageWidth, this.DESIGN.typography.heading);
                
                const actualHeaderHeight = Math.max(12, titleHeight + 4);
                if (actualHeaderHeight > 12) {
                    pdf.setFillColor(...this.hexToRgb(this.DESIGN.colors.backgroundLight));
                    pdf.rect(margin, currentY, headerWidth, actualHeaderHeight, 'F');
                    pdf.setFillColor(...this.hexToRgb(dimColor));
                    pdf.rect(margin, currentY, 4, actualHeaderHeight, 'F');
                    pdf.setTextColor(...this.hexToRgb(this.DESIGN.colors.text));
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(this.DESIGN.typography.heading);
                    this.renderParagraph(pdf, titleText, margin + 8, currentY + 8, headerWidth - 16, pageWidth, this.DESIGN.typography.heading);
                }
                
                currentY += actualHeaderHeight + 3;

                // Implementation phase
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(this.DESIGN.typography.small);
                pdf.setTextColor(...this.hexToRgb(this.DESIGN.colors.textMuted));
                pdf.text(`Implementation Phase: ${policy.phase}`, margin, currentY);
                currentY += 8;

                // Policy details
                if (policy.details && policy.details.trim()) {
                    pdf.setTextColor(...this.hexToRgb(this.DESIGN.colors.text));
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(this.DESIGN.typography.subheading);
                    pdf.text('Implementation Details:', margin, currentY);
                    currentY += 6;
                    
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(this.DESIGN.typography.body);
                    const detailsHeight = this.renderParagraph(pdf, policy.details, margin, currentY, contentWidth, pageWidth);
                    currentY += detailsHeight + this.DESIGN.spacing.paragraph;
                }

                // Examples
                if (policy.examples && policy.examples.trim()) {
                    if (currentY > pageHeight - 40) {
                        pdf.addPage();
                        currentY = margin;
                    }

                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(this.DESIGN.typography.subheading);
                    pdf.text('Implementation Examples:', margin, currentY);
                    currentY += 6;
                    
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(this.DESIGN.typography.body);
                    const examplesHeight = this.renderParagraph(pdf, policy.examples, margin, currentY, contentWidth, pageWidth);
                    currentY += examplesHeight + this.DESIGN.spacing.paragraph;
                }

                // Keywords
                if (policy.keywords && policy.keywords.length > 0) {
                    if (currentY > pageHeight - 15) {
                        pdf.addPage();
                        currentY = margin;
                    }
                    
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(this.DESIGN.typography.small);
                    pdf.setTextColor(...this.hexToRgb(this.DESIGN.colors.textMuted));
                    pdf.text('Keywords: ', margin, currentY);
                    
                    pdf.setFont('helvetica', 'normal');
                    const keywordText = Array.isArray(policy.keywords) ? policy.keywords.join(', ') : policy.keywords;
                    const keywordsHeight = this.renderParagraph(pdf, keywordText, margin + 20, currentY, contentWidth - 20, pageWidth, this.DESIGN.typography.small);
                    currentY += Math.max(8, keywordsHeight);
                }

                // Add relevant experts per policy
                if (expertsManager.isExpertsDataLoaded() && policy.keywords && policy.keywords.length > 0) {
                    const relevantExperts = expertsManager.findRelevantExperts(policy.keywords, 3);
                    
                    if (relevantExperts.length > 0) {
                        if (currentY > pageHeight - 15) {
                            pdf.addPage();
                            currentY = margin;
                        }
                        
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFontSize(this.DESIGN.typography.small);
                        pdf.setTextColor(...this.hexToRgb(this.DESIGN.colors.textMuted));
                        pdf.text('Relevant experts: ', margin, currentY);
                        
                        pdf.setFont('helvetica', 'normal');
                        const expertNames = relevantExperts.map(expert => expert.name).join(', ');
                        const expertsHeight = this.renderParagraph(pdf, expertNames, margin + 28, currentY, contentWidth - 28, pageWidth, this.DESIGN.typography.small);
                        currentY += Math.max(8, expertsHeight);
                    }
                }

                currentY += this.DESIGN.spacing.policy;
            });
        });
    }

    // Add footer system
    addFooters(pdf, totalPages) {
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = this.DESIGN.spacing.margin;
        
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            
            if (i === 1) continue; // Skip cover
            
            pdf.setDrawColor(...this.hexToRgb(this.DESIGN.colors.border));
            pdf.setLineWidth(0.3);
            pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
            
            pdf.setTextColor(...this.hexToRgb(this.DESIGN.colors.textMuted));
            pdf.setFontSize(this.DESIGN.typography.tiny);
            
            pdf.text('G20 TPAF Implementation Plan', margin, pageHeight - 7);
            pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
        }
    }

    // Main export function
    async exportToPDF() {
        if (state.selectedPolicies.size === 0) {
            utils.showTemporaryMessage('Please select at least one policy initiative before exporting.', 'error');
            return;
        }

        try {
            // Check if jsPDF is available
            let jsPDF;
            if (window.jspdf && window.jspdf.jsPDF) {
                jsPDF = window.jspdf.jsPDF;
            } else if (window.jsPDF) {
                jsPDF = window.jsPDF;
            } else {
                utils.showTemporaryMessage('PDF library not loaded. Please refresh the page and try again.', 'error');
                return;
            }

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            pdf.setProperties({
                subject: 'Selected Policy Options for Implementation',
                keywords: 'AI governance, policy implementation, TPAF, G20, policy options',
                creator: 'G20 TPAF Platform'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Calculate statistics
            const savedCount = state.selectedPolicies.size;
            const policiesByPolicyArea = this.groupPoliciesByDimension();
            const dimensionCount = Object.keys(policiesByPolicyArea).length;

            // Generate cover page
            this.generateCoverPage(pdf, pageWidth, pageHeight, savedCount, dimensionCount);

            // Generate executive summary
            pdf.addPage();
            this.generateExecutiveSummary(pdf, pageWidth, savedCount, dimensionCount, policiesByPolicyArea);

            // Generate matrix visualization
            const matrixImageData = await this.captureMatrixVisualization();
            await this.generateMatrixPage(pdf, pageWidth, matrixImageData);

            // Generate detailed policy sections
            this.generatePolicyDetails(pdf, pageWidth, pageHeight, policiesByPolicyArea);

            // Add footer system
            const totalPages = pdf.internal.pages.length - 1;
            this.addFooters(pdf, totalPages);

            // Save PDF
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `G20_TPAF_Implementation_Plan_${timestamp}.pdf`;
            
            pdf.save(filename);
            console.log(`Implementation plan generated: ${filename}`);
            utils.showTemporaryMessage('PDF exported successfully!', 'success');
            
        } catch (error) {
            console.error('PDF Export Error:', error);
            utils.showTemporaryMessage(`Export failed: ${error.message}. Please try refreshing the page.`, 'error');
        }
    }
}

// Create and export singleton instance
export const exportManager = new ExportManager();

// Global function for PDF export (called from HTML)
window.exportToPDF = function() {
    exportManager.exportToPDF();
};

// Export the class for creating additional instances if needed
export default ExportManager;