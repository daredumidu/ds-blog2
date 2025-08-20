/**
 * DOM manipulation helpers and element creation utilities - Enhanced version
 */

import { CONFIG } from './config.js';
import { utils } from './utils.js';
import { state } from './state.js';
import { buttonSystem } from './button-system.js';

export const domHelpers = {
    // Enhanced Policy Area Button Creation
    createPolicyAreaButton: function(dimension, index) {
        const button = document.createElement('button');
        button.className = 'dimension-btn';
        button.setAttribute('data-dimension', dimension.id);
        button.setAttribute('aria-label', `Select ${dimension.id} dimension`);
        button.setAttribute('tabindex', '0');
        
        // Create icon mapping for each dimension
        const iconMap = {
            'Enabling Infrastructure': '🏗️',
            'Legislation & Policy': '⚖️', 
            'Sustainability & Society': '🌱',
            'Economy & Innovation': '💼',
            'Research & Education': '🔬'
        };
        
        // Create description mapping
        const descriptionMap = {
            'Enabling Infrastructure': 'Foundational technological infrastructure for AI development and deployment',
            'Legislation & Policy': 'Legal frameworks, regulations, and governance structures for AI systems',
            'Sustainability & Society': 'Sustainable AI development and addressing societal impacts',
            'Economy & Innovation': 'Economic development and innovation ecosystems for AI advancement',
            'Research & Education': 'Research prioritization and educational frameworks for AI'
        };
        
        button.innerHTML = `
            <div class="dimension-header">
                <div class="dimension-text">${utils.escapeHtml(dimension.short)}</div>
            </div>
        `;
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (!state.isLoading && utils.isValidPolicyArea(dimension.id)) {
                buttonSystem.selectPolicyArea(dimension.id);
            }
        });
        
        return button;
    },

    // Add this new function to domHelpers object:
    createSidebarItem: function(dimension, index) {
        const container = document.createElement('div');
        container.className = 'sidebar-item-container';
        
        // Create the main sidebar item
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.setAttribute('data-dimension', dimension.id);
        item.setAttribute('aria-label', `Select ${dimension.id} dimension`);
        item.setAttribute('tabindex', '0');
        
        // Icon mapping for each dimension
        const iconMap = {
            'Enabling Infrastructure': '🏗️',
            'Legislation & Policy': '⚖️', 
            'Sustainability & Society': '🌱',
            'Economy & Innovation': '💰',
            'Research & Education': '🎓'
        };
        
        // Description mapping
        const descriptionMap = {
            'Enabling Infrastructure': 'Build foundational systems and frameworks',
            'Legislation & Policy': 'Develop legal frameworks and regulations',
            'Sustainability & Society': 'Address social and environmental impacts',
            'Economy & Innovation': 'Implement financial incentives and support',
            'Research & Education': 'Build knowledge and capacity'
        };
        
        item.innerHTML = `
            <div class="sidebar-icon">${iconMap[dimension.id] || '📋'}</div>
            <div class="sidebar-content">
                <div class="sidebar-item-title">${utils.escapeHtml(dimension.short)}</div>
            </div>
        `;
        
        // Create phase dropdown
        const phaseDropdown = this.createPhaseDropdown(dimension.id);
        
        // Add click handler
        item.addEventListener('click', function(e) {
            e.preventDefault();
            if (!state.isLoading && utils.isValidPolicyArea(dimension.id)) {
                buttonSystem.selectPolicyArea(dimension.id);
            }
        });
        
        container.appendChild(item);
        container.appendChild(phaseDropdown);
        
        return container;
    },


    createPhaseDropdown: function(dimensionId) {
        const dimensionConfig = CONFIG.DIMENSIONS.find(d => d.id === dimensionId);
        const color = dimensionConfig ? dimensionConfig.color : '#628ac4';

        const dropdown = document.createElement('div');
        dropdown.className = 'phase-dropdown';
        dropdown.setAttribute('data-dimension', dimensionId);

        const content = document.createElement('div');
        content.className = 'phase-dropdown-content';

        const title = document.createElement('div');
        title.className = 'phase-dropdown-title';
        title.textContent = 'Select Phase:';

        // Arrow connector with dynamic color
        const connector = document.createElement('div');
        connector.className = 'arrow-connector';
        connector.innerHTML = `
          <svg width="24" height="62" viewBox="0 0 24 62" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0 V47 Q12 57, 22 57" stroke="${color}" stroke-width="3" fill="none"/>

          </svg>
        `;

        const grid = document.createElement('div');
        grid.className = 'phase-buttons-grid';

        CONFIG.PHASES.forEach((phase, index) => {
            const button = this.createTimelinePhaseButton(phase, index, color);
            grid.appendChild(button);
        });

        content.appendChild(title);
        content.appendChild(connector);
        content.appendChild(grid);
        dropdown.appendChild(content);

        return dropdown;
    },
    createTimelinePhaseButton: function(phase, index, color) {
        const button = document.createElement('button');
        button.className = 'phase-btn';
        button.setAttribute('data-phase', phase.id);
        button.setAttribute('aria-label', `Select ${phase.id} phase`);
        button.setAttribute('tabindex', '0');

        // Only show arrow for all but the last phase
        const showArrow = index < CONFIG.PHASES.length - 1;
        button.innerHTML = `
          <div class="phase-circle">
              <div class="phase-number">${index + 1}</div>
          </div>
          <div class="phase-label">${utils.escapeHtml(phase.short)}</div>
          ${showArrow ? `
          <div class="arrow-connector">
            <svg width="24" height="80" viewBox="0 0 24 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0 V65 Q12 75, 22 75" stroke="${color}" stroke-width="3" fill="none"/>

            </svg>
          </div>
          ` : ''}
        `;

        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!state.isLoading && utils.isValidPhase(phase.id)) {
                buttonSystem.selectPhase(phase.id);
            }
        });

        return button;
    },

    // Enhanced Phase Button Creation
    createPhaseButton: function(phase, index) {
        const button = document.createElement('button');
        button.className = 'phase-btn';
        button.setAttribute('data-phase', phase.id);
        button.setAttribute('aria-label', `Select ${phase.id} phase`);
        button.setAttribute('tabindex', '0');
        
        // Create icon mapping for phases
        const phaseIconMap = {
            'Analysis': '🔍',
            'Design': '📝', 
            'Implementation': '⚙️',
            'Monitoring and Evaluation': '📊'
        };
        
        button.innerHTML = `
            <span class="phase-icon">${phaseIconMap[phase.id] || ''}</span>
            <span>${utils.escapeHtml(phase.short)}</span>
        `;
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent bubbling to parent
            if (!state.isLoading && utils.isValidPhase(phase.id)) {
                buttonSystem.selectPhase(phase.id);
            }
        });
        
        return button;
    },

    // Progress Indicator Creation
    createProgressIndicator: function(step, stepName) {
        const indicator = document.createElement('div');
        indicator.className = 'progress-indicator';
        
        const dots = Array.from({length: 2}, (_, i) => {
            return `<div class="progress-dot ${i < step ? 'active' : ''}"></div>`;
        }).join('');
        
        indicator.innerHTML = `
            <span>Step ${step}: ${stepName}</span>
            ${dots}
        `;
        
        return indicator;
    },

    // Update existing progress indicator
    updateProgressIndicator: function(container, step) {
        const dots = container.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            if (index < step) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    },

    // Enhanced Policy Item Creation (keep existing but add modern styling support)
    createPolicyItem: function(policyId, policyInfo, dimension, phase) {
        const policyKey = utils.getPolicyKey(dimension, phase, policyId);
        const isSelected = state.selectedPolicies.has(policyKey);

        const button = document.createElement('button');
        button.className = 'policy-item cross-dimensional';
        if (isSelected) {
            button.classList.add('selected');
        }
        button.setAttribute('aria-label', `Select policy initiative ${policyId}: ${policyInfo.policy}`);
        button.setAttribute('data-policy-id', policyId);
        button.setAttribute('data-dimension', dimension);
        button.setAttribute('data-phase', phase);

        const selectedIcon = isSelected ? '<div class="selected-icon">✓</div>' : '';
        const dimensionColor = utils.getPolicyAreaColor(dimension);
        button.innerHTML = `
        <div class="policy-header">
          <div class="policy-info" style="display: flex; flex-direction: column;">
            <span class="policy-title">${utils.escapeHtml(policyInfo.policy)}</span>
            <span class="policy-meta" style="font-size: 0.7rem; color: var(--color-gray-500); margin-top: 0.25rem; font-style: italic;">
              ${utils.escapeHtml(dimension)} - ${utils.escapeHtml(phase)}
            </span>
          </div>
          ${selectedIcon}
        </div>
        <div class="policy-read-more"></div>
        `;
        button.addEventListener('click', function(e) {
            e.preventDefault();
            if (!state.isLoading && window.app) {
                window.app.selectPolicy(policyId);
            }
        });

        return button;
    },

    // Cross-dimensional Policy Item Creation (keep existing)
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
            <div class="policy-info" style="display: flex; flex-direction: column;">
              <span class="policy-title">${utils.escapeHtml(policyInfo.policy)}</span>
              <span class="policy-meta" style="font-size: 0.7rem; color: var(--color-gray-500); margin-top: 0.25rem; font-style: italic;">
                ${utils.escapeHtml(dimension)} - ${utils.escapeHtml(phase)}
              </span>
            </div>
            ${selectedIcon}
          </div>
          <div class="policy-read-more"></div>
        `;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (!state.isLoading && window.app) {
                window.app.selectCrossPolicyAreaPolicy(dimension, phase, policyId);
            }
        });

        return button;
    },
    // Enhanced Section Creation with Progress Support
    createSectionWithProgress: function(title, stepNumber, stepName) {
        const section = document.createElement('div');
        section.className = 'section';
        
        if (stepNumber && stepName) {
            const progressIndicator = this.createProgressIndicator(stepNumber, stepName);
            section.appendChild(progressIndicator);
        }
        
        if (title) {
            const heading = document.createElement('h2');
            heading.textContent = title;
            section.appendChild(heading);
        }
        
        return section;
    },

    // Phase Container Setup with Dynamic Color Support
    setupPhaseContainer: function(container, selectedDimension) {
        if (!container || !selectedDimension) return;
        
        // Find the dimension config to get colors
        const dimensionConfig = CONFIG.DIMENSIONS.find(d => d.id === selectedDimension);
        if (dimensionConfig) {
            container.style.setProperty('--accent-color', dimensionConfig.color);
            // Create a darker variant for the accent-dark color
            const darkColor = this.darkenColor(dimensionConfig.color, 20);
            container.style.setProperty('--accent-dark', darkColor);
        }
        
        container.setAttribute('data-dimension', selectedDimension);
    },

    // Utility function to darken colors
    darkenColor: function(color, percent) {
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    },

    // Animation helper for smooth section transitions
    animateSection: function(element, show = true) {
        if (!element) return Promise.resolve();
        
        return new Promise(resolve => {
            if (show) {
                element.style.display = 'block';
                element.style.opacity = '0';
                element.style.transform = 'translateY(10px)';
                
                requestAnimationFrame(() => {
                    element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                    
                    setTimeout(resolve, 300);
                });
            } else {
                element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.opacity = '0';
                element.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    element.style.display = 'none';
                    resolve();
                }, 300);
            }
        });
    },

    // Keyword Chip Creation (keep existing)
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

    // Empty State Creation (keep existing)
    createEmptyState: function(icon, message) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-text">${message}</div>
        `;
        return emptyState;
    },

    // Loading State Creation (keep existing)
    createLoadingState: function(message = 'Loading...') {
        const loadingState = document.createElement('div');
        loadingState.className = 'loading-state';
        loadingState.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        `;
        return loadingState;
    },

    // Selected Policy Item Creation (keep existing)
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

    // Visibility Management (keep existing methods)
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

    // Animation helpers (keep existing)
    fadeInElement: function(element, duration = 300) {
        return utils.fadeIn(element, duration);
    },

    fadeOutElement: function(element, duration = 300) {
        return utils.fadeOut(element, duration);
    },

    // Content management (keep existing)
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

    // Event delegation helpers (keep existing)
    addDelegatedEventListener: function(container, selector, eventType, handler) {
        if (!container) return;
        
        container.addEventListener(eventType, function(e) {
            const target = e.target.closest(selector);
            if (target) {
                handler.call(target, e);
            }
        });
    },

    // Form helpers (keep existing)
    getFormData: function(form) {
        if (!form) return {};
        
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    },

    // Scroll helpers (keep existing)
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

    // Accessibility helpers (keep existing)
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

    // Element selection helpers (keep existing)
    findElement: function(selector, container = document) {
        return container.querySelector(selector);
    },

    findElements: function(selector, container = document) {
        return Array.from(container.querySelectorAll(selector));
    },

    // CSS class management (keep existing)
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