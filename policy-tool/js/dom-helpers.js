/**
 * DOM manipulation helpers and element creation utilities
 */

import { CONFIG } from './config.js';
import { utils } from './utils.js';
import { state } from './state.js';
import { buttonSystem } from './button-system.js';

export const domHelpers = {
    // Policy Area Button Creation
    createPolicyAreaButton: function(dimension, index) {
        const button = document.createElement('button');
        button.className = 'dimension-btn';
        button.setAttribute('data-dimension', dimension.id);
        button.setAttribute('aria-label', `Select ${dimension.id} dimension`);
        button.setAttribute('tabindex', '0');
        
        button.innerHTML = `
            <img src="${dimension.coloredIcon}" alt="" class="dimension-icon" />
            <div class="dimension-text">${utils.escapeHtml(dimension.short)}</div>
        `;
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (!state.isLoading && utils.isValidPolicyArea(dimension.id)) {
                buttonSystem.selectPolicyArea(dimension.id);
            }
        });
        
        return button;
    },

    // Phase Button Creation
    createPhaseButton: function(phase, index) {
        const button = document.createElement('button');
        button.className = 'phase-btn';
        button.setAttribute('data-phase', phase.id);
        button.setAttribute('aria-label', `Select ${phase.id} phase`);
        button.setAttribute('tabindex', '0');
        
        button.innerHTML = `${utils.escapeHtml(phase.short)}`;
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (!state.isLoading && utils.isValidPhase(phase.id)) {
                buttonSystem.selectPhase(phase.id);
            }
        });
        
        return button;
    },

    // Policy Item Creation
    createPolicyItem: function(policyId, policyInfo, dimension, phase) {
        const policyKey = utils.getPolicyKey(dimension, phase, policyId);
        const isSelected = state.selectedPolicies.has(policyKey);
        
        const button = document.createElement('button');
        button.className = 'policy-item';
        if (isSelected) {
            button.classList.add('selected');
        }
        button.setAttribute('aria-label', `Select policy initiative ${policyId}: ${policyInfo.policy}`);
        button.setAttribute('data-policy-id', policyId);
        button.setAttribute('data-dimension', dimension);
        button.setAttribute('data-phase', phase);
        
        const selectedIcon = isSelected ? '<div class="selected-icon">✓</div>' : '';
        
        button.innerHTML = `
            <div class="policy-header">
                <div class="policy-info">
                    <span class="policy-title">${utils.escapeHtml(policyInfo.policy)}</span>
                </div>
                ${selectedIcon}
            </div>
            <div class="policy-read-more">Read more →</div>
        `;
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (!state.isLoading && window.app) {
                window.app.selectPolicy(policyId);
            }
        });
        
        return button;
    },

    // Cross-dimensional Policy Item Creation
    createCrossPolicyAreaPolicyItem: function(key, policyInfo) {
        const [dimension, phase, policyId] = key.split('|');
        const policyKey = utils.getPolicyKey(dimension, phase, policyId);
        const isSelected = state.selectedPolicies.has(policyKey);
        
        const button = document.createElement('button');
        button.className = 'policy-item cross-dimensional';
        if (isSelected) {
            button.classList.add('selected');
        }
        button.setAttribute('aria-label', `Select policy ${policyId}: ${policyInfo.policy}`);
        button.setAttribute('data-policy-id', policyId);
        button.setAttribute('data-dimension', dimension);
        button.setAttribute('data-phase', phase);
        
        const selectedIcon = isSelected ? '<div class="selected-icon">✓</div>' : '';
        const dimensionColor = utils.getPolicyAreaColor(dimension);
        
        button.innerHTML = `
            <div class="policy-header">
                <div class="policy-info">
                    <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem;">
                        <span class="policy-id" style="background: ${dimensionColor}; color: white;">${utils.escapeHtml(policyId)}</span>
                    </div>
                    <span class="policy-title">${utils.escapeHtml(policyInfo.policy)}</span>
                </div>
                ${selectedIcon}
            </div>
            <div style="font-size: 0.7rem; color: var(--color-gray-500); margin-top: 0.25rem; font-style: italic; padding-left: 0.5rem;">
                ${utils.escapeHtml(dimension)} - ${utils.escapeHtml(phase)}
            </div>
        `;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (!state.isLoading && window.app) {
                window.app.selectCrossPolicyAreaPolicy(dimension, phase, policyId);
            }
        });
        
        return button;
    },

    // Keyword Chip Creation
    createKeywordChip: function(keyword, onRemove) {
        const chip = document.createElement('div');
        chip.className = 'keyword-chip';
        chip.innerHTML = `
            <span class="keyword-chip-text">${utils.escapeHtml(keyword)}</span>
            <button class="keyword-chip-remove" aria-label="Remove ${keyword} filter">×</button>
        `;
        
        const removeBtn = chip.querySelector('.keyword-chip-remove');
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (onRemove) {
                onRemove(keyword);
            }
        });
        
        return chip;
    },

    // Empty State Creation
    createEmptyState: function(icon, message) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-text">${message}</div>
        `;
        return emptyState;
    },

    // Loading State Creation
    createLoadingState: function(message = 'Loading...') {
        const loadingState = document.createElement('div');
        loadingState.className = 'loading-state';
        loadingState.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        `;
        return loadingState;
    },

    // Selected Policy Item Creation
    createSelectedPolicyItem: function(policyKey, policyInfo, onRemove, onHighlight) {
        const { dimension, phase, policyId } = utils.parsePolicyKey(policyKey);
        
        const item = document.createElement('div');
        item.className = 'selected-policy-item';
        item.setAttribute('data-policy-key', policyKey);
        
        const dimensionColor = utils.getPolicyAreaColor(dimension);
        const dimensionInitial = utils.getPolicyAreaInitial(dimension);
        
        item.innerHTML = `
            <div class="selected-policy-dimension" style="background-color: ${dimensionColor}">
                ${dimensionInitial}
            </div>
            <div class="selected-policy-content">
                <div class="selected-policy-header">
                    <span class="selected-policy-id">${utils.escapeHtml(policyId)}</span>
                    <span class="selected-policy-phase">${utils.escapeHtml(phase)}</span>
                </div>
                <div class="selected-policy-title">${utils.escapeHtml(policyInfo.policy)}</div>
            </div>
            <div class="selected-policy-actions">
                <button class="remove-policy-btn" title="Remove this policy" data-policy-key="${policyKey}">
                    ×
                </button>
            </div>
        `;
        
        // Add click handler for highlighting
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-policy-btn') && onHighlight) {
                onHighlight(policyKey);
            }
        });
        
        // Add remove button handler
        const removeBtn = item.querySelector('.remove-policy-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (onRemove) {
                onRemove(policyKey);
            }
        });
        
        return item;
    },

    // Visibility Management
    showElement: function(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    },

    hideElement: function(element) {
        if (element) {
            element.classList.add('hidden');
        }
    },

    toggleElement: function(element, show) {
        if (element) {
            element.classList.toggle('hidden', !show);
        }
    },

    // Animation helpers
    fadeInElement: function(element, duration = 300) {
        return utils.fadeIn(element, duration);
    },

    fadeOutElement: function(element, duration = 300) {
        return utils.fadeOut(element, duration);
    },

    // Content management
    setElementContent: function(element, content) {
        if (element) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else if (content instanceof Node) {
                element.innerHTML = '';
                element.appendChild(content);
            } else if (Array.isArray(content)) {
                element.innerHTML = '';
                content.forEach(item => {
                    if (typeof item === 'string') {
                        element.insertAdjacentHTML('beforeend', item);
                    } else if (item instanceof Node) {
                        element.appendChild(item);
                    }
                });
            }
        }
    },

    clearElement: function(element) {
        if (element) {
            element.innerHTML = '';
        }
    },

    // Event delegation helpers
    addDelegatedEventListener: function(container, selector, eventType, handler) {
        if (!container) return;
        
        container.addEventListener(eventType, function(e) {
            const target = e.target.closest(selector);
            if (target) {
                handler.call(target, e);
            }
        });
    },

    // Form helpers
    getFormData: function(form) {
        if (!form) return {};
        
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    },

    // Scroll helpers
    scrollToElement: function(element, options = {}) {
        if (element) {
            const defaultOptions = {
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            };
            element.scrollIntoView({ ...defaultOptions, ...options });
        }
    },

    scrollToTop: function(element = window, options = {}) {
        const defaultOptions = {
            top: 0,
            behavior: 'smooth'
        };
        
        if (element === window) {
            window.scrollTo({ ...defaultOptions, ...options });
        } else if (element) {
            element.scrollTop = 0;
        }
    },

    // Accessibility helpers
    setAriaLabel: function(element, label) {
        if (element) {
            element.setAttribute('aria-label', label);
        }
    },

    setAriaExpanded: function(element, expanded) {
        if (element) {
            element.setAttribute('aria-expanded', expanded.toString());
        }
    },

    announceToScreenReader: function(message, priority = 'polite') {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 1000);
    },

    // Element selection helpers
    findElement: function(selector, container = document) {
        return container.querySelector(selector);
    },

    findElements: function(selector, container = document) {
        return Array.from(container.querySelectorAll(selector));
    },

    // CSS class management
    hasClass: function(element, className) {
        return element ? element.classList.contains(className) : false;
    },

    addClass: function(element, ...classNames) {
        if (element) {
            element.classList.add(...classNames);
        }
    },

    removeClass: function(element, ...classNames) {
        if (element) {
            element.classList.remove(...classNames);
        }
    },

    toggleClass: function(element, className, force) {
        if (element) {
            return element.classList.toggle(className, force);
        }
        return false;
    }
};