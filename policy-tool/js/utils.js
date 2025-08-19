/**
 * Utility functions for the AI Policy Tool
 */

import { CONFIG } from './config.js';

export const utils = {
    // Text processing utilities
    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    setText: function(element, text) {
        if (element) {
            element.textContent = text || '';
        }
    },

    // Validation utilities
    isValidPolicyArea: function(dimension) {
        return CONFIG.DIMENSIONS.some(d => d.id === dimension);
    },

    isValidPhase: function(phase) {
        return CONFIG.PHASES.some(p => p.id === phase);
    },

    isValidPolicy: function(dimension, phase, policy, policyData) {
        return policyData[dimension] && 
               policyData[dimension][phase] && 
               policyData[dimension][phase][policy];
    },

    // Key generation utilities
    getPolicyKey: function(dimension, phase, policyId) {
        return `${dimension}|${phase}|${policyId}`;
    },

    parsePolicyKey: function(policyKey) {
        const [dimension, phase, policyId] = policyKey.split('|');
        return { dimension, phase, policyId };
    },

    // Policy area utilities
    getPolicyAreaShortName: function(dimension) {
        const mapping = {
            'Enabling Infrastructure': 'infrastructure',
            'Legislation & Policy': 'legislation',
            'Sustainability & Society': 'sustainability',
            'Economy & Innovation': 'economic',
            'Research & Education': 'research'
        };
        return mapping[dimension] || 'infrastructure';
    },

    getPolicyAreaColor: function(dimension) {
        const dimConfig = CONFIG.DIMENSIONS.find(d => d.id === dimension);
        return dimConfig ? dimConfig.color : '#666';
    },

    getPolicyAreaInitial: function(dimension) {
        const initials = {
            'Enabling Infrastructure': 'I',
            'Legislation & Policy': 'L',
            'Sustainability & Society': 'S',
            'Economy & Innovation': 'E',
            'Research & Education': 'R'
        };
        return initials[dimension] || 'P';
    },

    // Related policies functionality
    findRelatedPolicies: function(currentPolicyArea, currentPhase, currentPolicyId, policyData, limit = 5) {
        if (!currentPolicyArea || !currentPhase || !currentPolicyId) return [];
        
        const currentPolicy = policyData[currentPolicyArea]?.[currentPhase]?.[currentPolicyId];
        if (!currentPolicy || !Array.isArray(currentPolicy.keywords)) return [];
        
        const currentKeywords = currentPolicy.keywords.map(k => k.toLowerCase());
        const relatedPolicies = [];
        
        // Search across all dimensions and phases
        Object.entries(policyData).forEach(([dimension, phaseData]) => {
            Object.entries(phaseData).forEach(([phase, policies]) => {
                Object.entries(policies).forEach(([policyId, policyInfo]) => {
                    // Skip the current policy
                    if (dimension === currentPolicyArea && phase === currentPhase && policyId === currentPolicyId) {
                        return;
                    }
                    
                    if (!Array.isArray(policyInfo.keywords)) return;
                    
                    const policyKeywords = policyInfo.keywords.map(k => k.toLowerCase());
                    
                    // Calculate keyword overlap
                    const sharedKeywords = currentKeywords.filter(k => 
                        policyKeywords.some(pk => pk.includes(k) || k.includes(pk))
                    );
                    
                    if (sharedKeywords.length >= 1) { // Minimum 1 shared keyword
                        // Calculate similarity score
                        const similarityScore = sharedKeywords.length / Math.max(currentKeywords.length, policyKeywords.length);
                        
                        // Bonus for cross-dimensional relationships
                        const crossPolicyAreaBonus = dimension !== currentPolicyArea ? 0.1 : 0;
                        
                        relatedPolicies.push({
                            dimension,
                            phase,
                            policyId,
                            policy: policyInfo.policy,
                            keywords: policyInfo.keywords,
                            sharedKeywords,
                            similarityScore: similarityScore + crossPolicyAreaBonus,
                            key: `${dimension}|${phase}|${policyId}`
                        });
                    }
                });
            });
        });
        
        // Sort by similarity score and return top results
        return relatedPolicies
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, limit);
    },

    // Search and filter utilities
    searchPolicies: function(searchTerm, policyData, selectedPolicyArea = null, selectedPhase = null) {
        const results = {};
        const term = searchTerm.toLowerCase();
        
        Object.entries(policyData).forEach(([dimension, phaseData]) => {
            // Apply dimension filter if selected
            if (selectedPolicyArea && dimension !== selectedPolicyArea) return;
            
            Object.entries(phaseData).forEach(([phase, policies]) => {
                // Apply phase filter if selected
                if (selectedPhase && phase !== selectedPhase) return;
                
                Object.entries(policies).forEach(([policyId, policyInfo]) => {
                    const searchableText = `${policyInfo.policy} ${policyInfo.details} ${policyInfo.examples || ''}`.toLowerCase();
                    
                    if (searchableText.includes(term)) {
                        const key = this.getPolicyKey(dimension, phase, policyId);
                        results[key] = {
                            ...policyInfo,
                            _dimension: dimension,
                            _phase: phase,
                            _policyId: policyId
                        };
                    }
                });
            });
        });
        
        return results;
    },

    filterPoliciesByKeywords: function(keywords, policyData, selectedPolicyArea = null, selectedPhase = null) {
        if (keywords.size === 0) return {};
        
        const results = {};
        
        Object.entries(policyData).forEach(([dimension, phaseData]) => {
            // Apply dimension filter if selected
            if (selectedPolicyArea && dimension !== selectedPolicyArea) return;
            
            Object.entries(phaseData).forEach(([phase, policies]) => {
                // Apply phase filter if selected
                if (selectedPhase && phase !== selectedPhase) return;
                
                Object.entries(policies).forEach(([policyId, policyInfo]) => {
                    const policyKeywords = Array.isArray(policyInfo.keywords) ? policyInfo.keywords : [];
                    
                    const hasMatchingKeyword = Array.from(keywords).some(keyword =>
                        policyKeywords.some(pk => pk.toLowerCase().includes(keyword.toLowerCase()))
                    );
                    
                    if (hasMatchingKeyword) {
                        const key = this.getPolicyKey(dimension, phase, policyId);
                        results[key] = {
                            ...policyInfo,
                            _dimension: dimension,
                            _phase: phase,
                            _policyId: policyId
                        };
                    }
                });
            });
        });
        
        return results;
    },

    // Collect all unique keywords from policy data
    getAllKeywords: function(policyData) {
        const allKeywords = new Set();
        
        Object.values(policyData).forEach(dimensionData => {
            Object.values(dimensionData).forEach(phaseData => {
                Object.values(phaseData).forEach(policy => {
                    if (Array.isArray(policy.keywords)) {
                        policy.keywords.forEach(keyword => {
                            allKeywords.add(keyword);
                        });
                    }
                });
            });
        });
        
        return Array.from(allKeywords).sort();
    },

    // Find policy location by ID
    findPolicyLocation: function(policyId, policyData) {
        for (const dimension of Object.keys(policyData)) {
            for (const phase of Object.keys(policyData[dimension])) {
                if (policyData[dimension][phase][policyId]) {
                    return { dimension, phase };
                }
            }
        }
        return null;
    },

    // Debounce utility for search
    debounce: function(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    // DOM utilities
    addClass: function(element, className) {
        if (element) {
            element.classList.add(className);
        }
    },

    removeClass: function(element, className) {
        if (element) {
            element.classList.remove(className);
        }
    },

    toggleClass: function(element, className, force) {
        if (element) {
            return element.classList.toggle(className, force);
        }
        return false;
    },

    // Animation utilities
    fadeIn: function(element, duration = 300) {
        if (!element) return Promise.resolve();
        
        return new Promise(resolve => {
            element.style.opacity = 0;
            element.style.display = 'block';
            
            const start = performance.now();
            
            function animate(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.opacity = progress;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }
            
            requestAnimationFrame(animate);
        });
    },

    fadeOut: function(element, duration = 300) {
        if (!element) return Promise.resolve();
        
        return new Promise(resolve => {
            const start = performance.now();
            const startOpacity = parseFloat(getComputedStyle(element).opacity);
            
            function animate(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.opacity = startOpacity * (1 - progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                    resolve();
                }
            }
            
            requestAnimationFrame(animate);
        });
    },

    // Notification utilities
    showTemporaryMessage: function(message, type = 'info', duration = 3000) {
        const messageEl = document.createElement('div');
        messageEl.className = `temp-message temp-message-${type}`;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 0.875rem;
            max-width: 300px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        // Animate in
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            messageEl.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, duration);
    }
};