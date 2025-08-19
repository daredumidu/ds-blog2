/**
 * Expert matching and rendering functionality
 */

import { dataLoader } from './data-loader.js';
import { utils } from './utils.js';

export class ExpertsManager {
    constructor() {
        this.expertsGrid = null;
        this.currentExperts = [];
    }

    init() {
        this.expertsGrid = document.getElementById('expertsGrid');
        if (!this.expertsGrid) {
            console.warn('Experts grid element not found');
            return false;
        }
        
        // Show initial loading state
        this.showLoadingState();
        return true;
    }

    showLoadingState() {
        if (!this.expertsGrid) return;
        this.expertsGrid.innerHTML = `
            <div class="loading-message" style="
                text-align: center;
                color: #6b7280;
                font-size: 0.875rem;
                padding: 1rem;
            ">
                Loading experts...
            </div>
        `;
    }

    // Generate avatar color based on name
    getAvatarColor(name) {
        const colors = [
            '#4F8EDB', '#FFA726', '#AB47BC', '#EF5350', 
            '#66BB6A', '#FF7043', '#42A5F5', '#9CCC65'
        ];
        const hash = name.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    }

    // Get initials from name
    getInitials(name) {
        return name.split(' ')
                  .map(word => word[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);
    }

    // Find experts relevant to given keywords
    findRelevantExperts(policyKeywords, limit = 4) {
        const expertsData = dataLoader.getExpertsData();
        
        if (!expertsData || expertsData.length === 0) {
            return [];
        }

        if (!policyKeywords || policyKeywords.length === 0) {
            // Return a sample of experts if no specific keywords
            return expertsData.slice(0, limit);
        }

        const scoredExperts = expertsData.map(expert => {
            const expertKeywords = expert.keywords || [];
            let score = 0;
            
            // Calculate keyword overlap
            policyKeywords.forEach(policyKeyword => {
                expertKeywords.forEach(expertKeyword => {
                    if (expertKeyword.toLowerCase().includes(policyKeyword.toLowerCase()) ||
                        policyKeyword.toLowerCase().includes(expertKeyword.toLowerCase())) {
                        score += 1;
                    }
                });
            });

            return { ...expert, relevanceScore: score };
        });

        // Sort by relevance score and return top results
        return scoredExperts
            .filter(expert => expert.relevanceScore > 0)
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, limit);
    }

    // Find experts relevant to multiple selected policies
    findRelevantExpertsForPolicies(selectedPolicies) {
        const policyData = dataLoader.getPolicyData();
        
        // Collect all keywords from selected policies
        const allKeywords = new Set();
        
        Array.from(selectedPolicies).forEach(policyKey => {
            const { dimension, phase, policyId } = utils.parsePolicyKey(policyKey);
            const policyInfo = policyData[dimension]?.[phase]?.[policyId];
            if (policyInfo && Array.isArray(policyInfo.keywords)) {
                policyInfo.keywords.forEach(keyword => allKeywords.add(keyword));
            }
        });
        
        // Find experts matching these keywords
        const policyKeywords = Array.from(allKeywords);
        return this.findRelevantExperts(policyKeywords, 3);
    }

    // Render expert card HTML
    renderExpertCard(expert) {
        const initials = this.getInitials(expert.name);
        const avatarColor = this.getAvatarColor(expert.name);
        
        const avatarElement = expert.imageUrl 
            ? `<img src="${expert.imageUrl}" alt="${expert.name}" class="expert-avatar">`
            : `<div class="expert-avatar-fallback" style="background-color: ${avatarColor};">${initials}</div>`;
        
        const linkedinElement = expert.linkedin 
            ? `<a href="${expert.linkedin}" target="_blank" rel="noopener noreferrer" class="expert-linkedin" onclick="event.stopPropagation();">
                 See profile →
               </a>`
            : '';

        const keywordsDisplay = expert.keywords ? expert.keywords.slice(0, 3) : [];
        
        return `
            <div class="expert-card" onclick="openExpertProfile('${expert.profileUrl || expert.linkedin || '#'}')" title="Click to view ${expert.name}'s profile">
                ${avatarElement}
                <div class="expert-info">
                    <div class="expert-header">
                        <div>
                            <div class="expert-name">${utils.escapeHtml(expert.name)}</div>
                            <div class="expert-title">${utils.escapeHtml(expert.title || '')}</div>
                        </div>
                        ${linkedinElement}
                    </div>
                    
                    <div class="expert-details">
                        ${expert.languages ? `
                        <div class="expert-detail-row">
                            <svg class="expert-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                            </svg>
                            <span>${expert.languages.join(', ')}</span>
                        </div>
                        ` : ''}
                        ${expert.regions ? `
                        <div class="expert-detail-row">
                            <svg class="expert-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span>${expert.regions.join(', ')}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${keywordsDisplay.length > 0 ? `
                    <div class="expert-expertise">
                        ${keywordsDisplay.map(area => `<span class="expert-expertise-tag">${utils.escapeHtml(area)}</span>`).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Update experts display based on current policy selection
    updateRelevantExperts(selectedPolicy = null, policyData = null) {
        if (!this.expertsGrid) return;

        const expertsData = dataLoader.getExpertsData();
        if (!expertsData || expertsData.length === 0) {
            this.showNoExpertsMessage();
            return;
        }

        let policyKeywords = [];
        
        // Get keywords from currently selected policy if provided
        if (selectedPolicy && policyData) {
            const policyInfo = policyData[selectedPolicy.dimension]?.[selectedPolicy.phase]?.[selectedPolicy.policyId];
            if (policyInfo && policyInfo.keywords) {
                policyKeywords = policyInfo.keywords;
            }
        }

        // Find relevant experts
        const relevantExperts = this.findRelevantExperts(policyKeywords, 4);
        
        if (relevantExperts.length > 0) {
            this.renderExperts(relevantExperts);
        } else {
            // Fallback to showing first 4 experts if no matches
            const fallbackExperts = expertsData.slice(0, 4);
            this.renderExperts(fallbackExperts);
        }

        this.currentExperts = relevantExperts.length > 0 ? relevantExperts : expertsData.slice(0, 4);
    }

    // Render experts in the grid
    renderExperts(experts) {
        if (!this.expertsGrid) return;
        
        this.expertsGrid.innerHTML = experts.map(expert => this.renderExpertCard(expert)).join('');
    }

    // Show message when no experts are available
    showNoExpertsMessage() {
        if (!this.expertsGrid) return;
        
        this.expertsGrid.innerHTML = `
            <div class="no-experts-message" style="
                text-align: center;
                color: #6b7280;
                font-size: 0.875rem;
                padding: 1rem;
            ">
                No expert profiles available
            </div>
        `;
    }

    // Show default experts (when no specific policy is selected)
    showDefaultExperts() {
        const expertsData = dataLoader.getExpertsData();
        if (expertsData && expertsData.length > 0) {
            const defaultExperts = expertsData.slice(0, 4);
            this.renderExperts(defaultExperts);
            this.currentExperts = defaultExperts;
        } else {
            this.showNoExpertsMessage();
        }
    }

    // Get currently displayed experts
    getCurrentExperts() {
        return [...this.currentExperts];
    }

    // Open expert profile in new tab
    openExpertProfile(profileUrl) {
        if (profileUrl && profileUrl !== '#') {
            window.open(profileUrl, '_blank', 'noopener,noreferrer');
        }
    }
}

// Global function for expert profile opening (called from rendered HTML)
window.openExpertProfile = function(profileUrl) {
    if (profileUrl && profileUrl !== '#') {
        window.open(profileUrl, '_blank', 'noopener,noreferrer');
    }
};

// Create and export singleton instance
export const expertsManager = new ExpertsManager();

// Export the class for creating additional instances if needed
export default ExpertsManager;