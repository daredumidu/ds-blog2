/**
 * Main application logic and orchestration
 */

import { CONFIG } from './config.js';
import { state } from './state.js';
import { utils } from './utils.js';
import { dataLoader } from './data-loader.js';
import { expertsManager } from './experts.js';
import { buttonSystem } from './button-system.js';
import { domHelpers } from './dom-helpers.js';

export class PolicyToolApp {
    constructor() {
        this.elements = {};
        this.debounceTimers = new Map();
        
        // Bind methods to maintain context
        this.handleSearchInput = this.handleSearchInput.bind(this);
        this.handleKeywordChange = this.handleKeywordChange.bind(this);
        this.handleClearFilters = this.handleClearFilters.bind(this);
    }

    async init() {
        try {
            // Cache DOM elements
            this.cacheElements();
            
            // Initialize components
            this.initializeComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup state listeners
            this.setupStateListeners();
            
            // Render initial UI
            this.renderInitialUI();
            
            console.log('Application initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showInitializationError(error);
            return false;
        }
    }

    cacheElements() {
        this.elements = {
            // Search and filters
            searchInput: document.getElementById('policySearchInput'),
            keywordDropdown: document.getElementById('keywordDropdown'),
            clearFiltersBtn: document.getElementById('clearFiltersBtn'),
            visibleKeywords: document.getElementById('visibleKeywords'),
            keywordsOverflow: document.getElementById('keywordsOverflow'),
            keywordsTooltip: document.getElementById('keywordsTooltip'),
            tooltipKeywords: document.getElementById('tooltipKeywords'),
            
            // Navigation
            dimensionGrid: document.getElementById('dimensionGrid'),
            phaseGrid: document.getElementById('phaseGrid'),
            phasesSection: document.getElementById('phasesSection'),
            
            // Policy sections
            policySection: document.getElementById('policySection'),
            policyContainer: document.getElementById('policyContainer'),
            policyListTitle: document.getElementById('policyListTitle'),
            policyList: document.getElementById('policyList'),
            policyDetailsColumn: document.getElementById('policyDetailsColumn'),
            policyDetailsContent: document.getElementById('policyDetailsContent'),
            policyListToggle: document.getElementById('policyListToggle'),
            selectPolicyBtn: document.getElementById('selectPolicyBtn'),
            
            // Selected policies
            selectedPoliciesSection: document.getElementById('selectedPoliciesSection'),
            selectedPoliciesCount: document.getElementById('selectedPoliciesCount'),
            selectedPoliciesList: document.getElementById('selectedPoliciesList'),
            clearAllBtn: document.getElementById('clearAllBtn'),
            
            // Right panel
            selectionGrid: document.getElementById('selectionGrid'),
            selectionInfo: document.getElementById('selectionInfo'),
            expertsGrid: document.getElementById('expertsGrid')
        };
    }

    initializeComponents() {
        // Initialize button system
        if (!buttonSystem.init()) {
            console.warn('Button system initialization failed');
        }
        
        // Initialize experts manager
        if (!expertsManager.init()) {
            console.warn('Experts manager initialization failed');
        }
    }

    setupEventListeners() {
        // Search functionality
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', this.handleSearchInput);
        }

        // Keyword dropdown functionality
        if (this.elements.keywordDropdown) {
            this.elements.keywordDropdown.addEventListener('change', this.handleKeywordChange);
        }

        // Clear filters button
        if (this.elements.clearFiltersBtn) {
            this.elements.clearFiltersBtn.addEventListener('click', this.handleClearFilters);
        }

        // Policy list toggle
        if (this.elements.policyListToggle) {
            this.elements.policyListToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.togglePolicyListVisibility();
            });
        }

        // Select policy button
        if (this.elements.selectPolicyBtn) {
            this.elements.selectPolicyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addPolicyToSelection();
            });
        }

        // Clear all policies button
        if (this.elements.clearAllBtn) {
            this.elements.clearAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearAllPolicies();
            });
        }

        // Keywords overflow tooltip
        if (this.elements.keywordsOverflow && this.elements.keywordsTooltip) {
            this.elements.keywordsOverflow.addEventListener('mouseenter', () => {
                this.elements.keywordsTooltip.classList.add('visible');
            });

            this.elements.keywordsOverflow.addEventListener('mouseleave', () => {
                this.elements.keywordsTooltip.classList.remove('visible');
            });
        }
    }

    setupStateListeners() {
        // Listen to state changes
        state.on('policyAreaChanged', () => this.handlePolicyAreaChange());
        state.on('phaseChanged', () => this.handlePhaseChange());
        state.on('policyChanged', () => this.handlePolicyChange());
        state.on('policyAdded', () => this.handlePolicyAdded());
        state.on('policyRemoved', () => this.handlePolicyRemoved());
        state.on('allPoliciesCleared', () => this.handleAllPoliciesCleared());
        state.on('searchChanged', () => this.handleSearchChange());
        state.on('keywordAdded', () => this.handleKeywordAdded());
        state.on('keywordRemoved', () => this.handleKeywordRemoved());
        state.on('allFiltersCleared', () => this.handleAllFiltersCleared());
        state.on('loadingChanged', (e) => this.handleLoadingChange(e.detail.isLoading));
    }

    renderInitialUI() {
        this.renderPolicyAreas();
        this.renderPhases();
        this.generateSelectionGrid();
        this.populateKeywordFilters();
        this.updateClearFiltersButton();
        this.updateCurrentSelection();
    }

    // Event Handlers
    handleSearchInput(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        // Debounce search input
        if (this.debounceTimers.has('search')) {
            clearTimeout(this.debounceTimers.get('search'));
        }
        
        this.debounceTimers.set('search', setTimeout(() => {
            state.setSearchTerm(searchTerm);
        }, CONFIG.UI.DEBOUNCE_DELAY));
    }

    handleKeywordChange(e) {
        const selectedKeyword = e.target.value;
        if (selectedKeyword) {
            state.addKeyword(selectedKeyword);
            e.target.value = ''; // Reset dropdown
        }
    }

    handleClearFilters(e) {
        e.preventDefault();
        state.clearAllFilters();
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
        }
        if (this.elements.keywordDropdown) {
            this.elements.keywordDropdown.value = '';
        }
    }

    // State Change Handlers
    handlePolicyAreaChange() {
        this.showPolicySection();
        this.showPolicyList();
        this.clearPolicyDetails();
        this.updateCurrentSelection();
        this.updateSelectionGrid();
        buttonSystem.syncWithState();
    }

    handlePhaseChange() {
        // Clear search when phase changes but keep keyword filters
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
        }
        
        this.showPolicySection();
        this.showPolicyList();
        this.clearPolicyDetails();
        this.updateCurrentSelection();
        this.updateSelectionGrid();
        buttonSystem.syncWithState();
    }

    handlePolicyChange() {
        this.showPolicyDetails();
        this.updateCurrentSelection();
        this.updateSelectionGrid();
    }

    handleSearchChange() {
        if (state.searchTerm || state.activeKeywords.size > 0) {
            this.showPolicySection();
            this.showPolicyList();
        } else if (!state.selectedPolicyArea || !state.selectedPhase) {
            this.clearPolicyView();
        }
        this.updateClearFiltersButton();
    }

    handleKeywordAdded() {
        this.updateActiveKeywordsDisplay();
        this.showPolicySection();
        this.showPolicyList();
        this.updateClearFiltersButton();
    }

    handleKeywordRemoved() {
        this.updateActiveKeywordsDisplay();
        if (state.activeKeywords.size === 0 && !state.searchTerm) {
            this.clearPolicyView();
        } else {
            this.showPolicyList();
        }
        this.updateClearFiltersButton();
    }

    handleAllFiltersCleared() {
        this.updateActiveKeywordsDisplay();
        if (!state.selectedPolicyArea || !state.selectedPhase) {
            this.clearPolicyView();
        } else {
            this.showPolicyList();
        }
        this.updateClearFiltersButton();
    }

    handlePolicyAdded() {
        this.updateSelectionGrid();
        this.updateSelectedPoliciesSection();
        this.showPolicyList();
        this.showPolicyDetails();
    }

    handlePolicyRemoved() {
        this.updateSelectionGrid();
        this.updateSelectedPoliciesSection();
        this.showPolicyList();
        this.showPolicyDetails();
    }

    handleAllPoliciesCleared() {
        this.updateSelectionGrid();
        this.updateSelectedPoliciesSection();
        this.showPolicyList();
        this.showPolicyDetails();
    }

    handleLoadingChange(isLoading) {
        document.body.classList.toggle('loading', isLoading);
    }

    // UI Rendering Methods
    renderPolicyAreas() {
        if (!this.elements.dimensionGrid) return;
        
        domHelpers.clearElement(this.elements.dimensionGrid);
        CONFIG.DIMENSIONS.forEach((dimension, index) => {
            const button = domHelpers.createPolicyAreaButton(dimension, index);
            this.elements.dimensionGrid.appendChild(button);
        });
    }

    renderPhases() {
        if (!this.elements.phaseGrid) return;
        
        domHelpers.clearElement(this.elements.phaseGrid);
        CONFIG.PHASES.forEach((phase, index) => {
            const button = domHelpers.createPhaseButton(phase, index);
            this.elements.phaseGrid.appendChild(button);
        });
    }

    // Policy Display Methods
    showPolicySection() {
        domHelpers.showElement(this.elements.policySection);
    }

    clearPolicyView() {
        domHelpers.hideElement(this.elements.policySection);
    }

    showPolicyList() {
        if (!this.elements.policyList || !this.elements.policyListTitle) return;

        // Primary workflow: Keyword/Search-driven exploration
        if (state.searchTerm || state.activeKeywords.size > 0) {
            this.showFilteredResults();
            return;
        }

        // Secondary workflow: Traditional dimension-phase navigation
        if (state.selectedPolicyArea && state.selectedPhase) {
            this.showPolicyAreaPhaseResults();
            return;
        }

        // Show all policies for selected dimension (no phase)
        if (state.selectedPolicyArea && !state.selectedPhase) {
            this.showAllPoliciesForDimension();
            return;
        }

        // Default empty state
        domHelpers.setElementContent(this.elements.policyList, 
            domHelpers.createEmptyState('📋', 'Search for policy initiatives or select a policy area to get started')
        );

        
    }

    showFilteredResults() {
        const listColumn = document.querySelector('.policy-list-column');
        
        // Remove dimension-specific styling for cross-dimensional results
        if (listColumn) {
            if (state.selectedPolicyArea && state.selectedPhase) {
                listColumn.setAttribute('data-dimension', state.selectedPolicyArea);
            } else {
                listColumn.removeAttribute('data-dimension');
            }
        }

        // Build title based on active filters
        let titleText = this.buildFilteredResultsTitle();
        utils.setText(this.elements.policyListTitle, titleText);
        
        // Get filtered policies across all dimensions
        const filteredPolicies = this.getGlobalFilteredPolicies();
        const policyEntries = Object.entries(filteredPolicies);
        
        domHelpers.clearElement(this.elements.policyList);
        
        if (policyEntries.length > 0) {
            policyEntries.forEach(([key, policyInfo]) => {
                const policyItem = domHelpers.createCrossPolicyAreaPolicyItem(key, policyInfo);
                this.elements.policyList.appendChild(policyItem);
            });
        } else {
            domHelpers.setElementContent(this.elements.policyList,
                domHelpers.createEmptyState('🔍', 'No policy initiatives found matching your search criteria')
            );
        }
    }

    buildFilteredResultsTitle() {
        if (state.selectedPolicyArea && state.selectedPhase) {
            return `${state.selectedPolicyArea} - ${state.selectedPhase}`;
        } else if (state.selectedPolicyArea) {
            return `${state.selectedPolicyArea} - All Phases`;
        } else if (state.searchTerm || state.activeKeywords.size > 0) {
            let filterParts = [];
            if (state.searchTerm) filterParts.push(`Search: "${state.searchTerm}"`);
            if (state.activeKeywords.size > 0) {
                const keywordCount = state.activeKeywords.size;
                filterParts.push(`${keywordCount} keyword${keywordCount > 1 ? 's' : ''}`);
            }
            return `Filtered Results (${filterParts.join(', ')})`;
        }
        return 'Search Results';
    }

    showPolicyAreaPhaseResults() {
        const listColumn = document.querySelector('.policy-list-column');
        
        // Set dimension attribute for styling
        if (listColumn && state.selectedPolicyArea) {
            listColumn.setAttribute('data-dimension', state.selectedPolicyArea);
        }

        utils.setText(this.elements.policyListTitle, `${state.selectedPolicyArea} - ${state.selectedPhase}`);
        
        const policyData = dataLoader.getPolicyData();
        const allPolicies = policyData[state.selectedPolicyArea]?.[state.selectedPhase] || {};
        const policyEntries = Object.entries(allPolicies);
        
        domHelpers.clearElement(this.elements.policyList);
        
        if (policyEntries.length > 0) {
            policyEntries.forEach(([policyId, policyInfo]) => {
                const policyItem = domHelpers.createPolicyItem(policyId, policyInfo, state.selectedPolicyArea, state.selectedPhase);
                this.elements.policyList.appendChild(policyItem);
            });
        } else {
            domHelpers.setElementContent(this.elements.policyList,
                domHelpers.createEmptyState('📋', 'No policy initiatives available for this combination')
            );
        }
    }

    showAllPoliciesForDimension() {
        const listColumn = document.querySelector('.policy-list-column');
        
        if (listColumn && state.selectedPolicyArea) {
            listColumn.setAttribute('data-dimension', state.selectedPolicyArea);
        }

        utils.setText(this.elements.policyListTitle, `${state.selectedPolicyArea} - All Phases`);
        
        const policyData = dataLoader.getPolicyData();
        const allPoliciesInDimension = {};
        const dimensionData = policyData[state.selectedPolicyArea] || {};
        
        Object.entries(dimensionData).forEach(([phase, policies]) => {
            Object.entries(policies).forEach(([policyId, policyInfo]) => {
                const key = `${state.selectedPolicyArea}|${phase}|${policyId}`;
                allPoliciesInDimension[key] = {
                    ...policyInfo,
                    _dimension: state.selectedPolicyArea,
                    _phase: phase,
                    _policyId: policyId
                };
            });
        });
        
        const policyEntries = Object.entries(allPoliciesInDimension);
        domHelpers.clearElement(this.elements.policyList);
        
        if (policyEntries.length > 0) {
            policyEntries.forEach(([key, policyInfo]) => {
                const policyItem = domHelpers.createCrossPolicyAreaPolicyItem(key, policyInfo);
                this.elements.policyList.appendChild(policyItem);
            });
        } else {
            domHelpers.setElementContent(this.elements.policyList,
                domHelpers.createEmptyState('📋', 'No policy initiatives available for this policy area')
            );
        }
    }

    getGlobalFilteredPolicies() {
        const policyData = dataLoader.getPolicyData();
        const filteredPolicies = {};
        
        // Search across all dimensions and phases
        Object.entries(policyData).forEach(([dimension, phaseData]) => {
            // Apply dimension filter if selected
            if (state.selectedPolicyArea && dimension !== state.selectedPolicyArea) return;
            
            Object.entries(phaseData).forEach(([phase, policies]) => {
                // Apply phase filter if selected
                if (state.selectedPhase && phase !== state.selectedPhase) return;
                
                Object.entries(policies).forEach(([policyId, policyInfo]) => {
                    let matchesSearch = true;
                    let matchesKeywords = true;

                    // Search term filter
                    if (state.searchTerm) {
                        const searchableText = `${policyInfo.policy} ${policyInfo.details} ${policyInfo.examples || ''}`.toLowerCase();
                        matchesSearch = searchableText.includes(state.searchTerm);
                    }

                    // Keyword filter
                    if (state.activeKeywords.size > 0) {
                        const policyKeywords = Array.isArray(policyInfo.keywords) ? policyInfo.keywords : [];
                        matchesKeywords = Array.from(state.activeKeywords).some(keyword =>
                            policyKeywords.some(pk => pk.toLowerCase().includes(keyword.toLowerCase()))
                        );
                    }

                    if (matchesSearch && matchesKeywords) {
                        const key = `${dimension}|${phase}|${policyId}`;
                        filteredPolicies[key] = {
                            ...policyInfo,
                            _dimension: dimension,
                            _phase: phase,
                            _policyId: policyId
                        };
                    }
                });
            });
        });

        return filteredPolicies;
    }

    // Policy Selection Methods
    selectPolicy(policyId) {
        if (!utils.isValidPolicy(state.selectedPolicyArea, state.selectedPhase, policyId, dataLoader.getPolicyData())) return;
        
        state.setLoading(true);
        state.setPolicy(policyId);

        // Update UI
        document.querySelectorAll('.policy-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = document.querySelector(`[data-policy-id="${policyId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }

        // Show the details panel
        const policyContainer = this.elements.policyContainer;
        const policyDetailsColumn = this.elements.policyDetailsColumn;

        if (policyContainer && policyDetailsColumn) {
            policyContainer.classList.add('details-focused');
            policyDetailsColumn.classList.add('has-policy');
        }
        
        state.setLoading(false);
    }

    selectCrossPolicyAreaPolicy(dimension, phase, policyId) {
        // Update state to match the selected policy
        state.setPolicyArea(dimension);
        state.setPhase(phase);
        state.setPolicy(policyId);

        // Update UI to show the dimension and phase are selected
        buttonSystem.syncWithState();

        // Show policy section and details
        this.showPolicySection();
        this.showPolicyList();
        
        // Highlight the corresponding dimension and phase
        this.highlightPolicyAreaAndPhase(dimension, phase);
    }

    highlightPolicyAreaAndPhase(dimension, phase) {
        // Add temporary highlighting
        const dimensionBtn = document.querySelector(`[data-dimension="${dimension}"]`);
        const phaseBtn = document.querySelector(`[data-phase="${phase}"]`);
        
        [dimensionBtn, phaseBtn].forEach(btn => {
            if (btn) {
                btn.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
                setTimeout(() => {
                    btn.style.boxShadow = '';
                }, 2000);
            }
        });
    }

    addPolicyToSelection() {
        if (!state.selectedPolicy) return;
        
        const policyKey = state.currentPolicyKey;
        if (policyKey) {
            state.addSelectedPolicy(policyKey);
            
            const selectedPolicy = document.querySelector('.policy-item.active');
            if (selectedPolicy) {
                selectedPolicy.classList.add('pulse');
                setTimeout(() => selectedPolicy.classList.remove('pulse'), 500);
            }
        }
    }

    clearAllPolicies() {
        if (state.selectedPolicies.size === 0) return;
        
        if (confirm(`Are you sure you want to clear all ${state.selectedPolicies.size} selected policy initiatives?`)) {
            state.clearAllSelectedPolicies();
        }
    }

    removePolicyFromSelection(policyKey) {
        state.removeSelectedPolicy(policyKey);
    }

    // Policy Details Methods
    showPolicyDetails() {
        const policyData = dataLoader.getPolicyData();
        const policyInfo = policyData[state.selectedPolicyArea]?.[state.selectedPhase]?.[state.selectedPolicy];
        if (!policyInfo) return;
        
        const policyContainer = this.elements.policyContainer;
        const policyDetailsColumn = this.elements.policyDetailsColumn;

        if (policyContainer && policyDetailsColumn) {
            policyContainer.classList.add('details-focused');
            policyDetailsColumn.classList.add('has-policy');
        }
        
        const isSelected = state.isCurrentPolicySelected;
        
        // Update related policies
        const relatedPolicies = utils.findRelatedPolicies(
            state.selectedPolicyArea, 
            state.selectedPhase, 
            state.selectedPolicy,
            policyData
        );
        
        state.setRelatedPolicies(relatedPolicies.map(rp => rp.key));
        
        // Update relevant experts
        expertsManager.updateRelevantExperts({
            dimension: state.selectedPolicyArea,
            phase: state.selectedPhase,
            policyId: state.selectedPolicy
        }, policyData);
        
        // Render details content
        this.renderPolicyDetailsContent(policyInfo, relatedPolicies, isSelected);
    }

    renderPolicyDetailsContent(policyInfo, relatedPolicies, isSelected) {
        if (!this.elements.policyDetailsContent) return;
        
        // Get special considerations for this dimension-phase combination
        const considerations = dataLoader.getConsiderationsForDimensionPhase(
            state.selectedPolicyArea, 
            state.selectedPhase
        );

        console.log('Considerations data:', considerations);
        console.log('Universal considerations:', considerations.universal);
        console.log('Context-dependent:', considerations.contextDependent);
        console.log('Sector-specific:', considerations.sectorSpecific);

        let considerationsHtml = '';
        if (considerations.universal.length > 0 || considerations.contextDependent.length > 0 || considerations.sectorSpecific.length > 0) {
            considerationsHtml = `
                <div class="detail-section">
                    <h3>Special Implementation Considerations</h3>
                    ${this.renderConsiderationsContent(considerations)}
                </div>
            `;
        }
        
        let relationshipContext = '';
        if (relatedPolicies.length > 0) {
            const crossPolicyAreaCount = relatedPolicies.filter(rp => rp.dimension !== state.selectedPolicyArea).length;
        }
        
        this.elements.policyDetailsContent.innerHTML = `
            <div class="detail-section">
                <h3>Initiative Overview</h3>
                <p>${utils.escapeHtml(policyInfo.policy)}</p>
            </div>
            
            <div class="detail-section">
                <h3>Possible Implementation Guidance and Actions</h3>
                <p>${utils.escapeHtml(policyInfo.details)}</p>
            </div>
            
            ${policyInfo.examples ? `
            <div class="detail-section">
                <h3>Implementation Examples</h3>
                <div class="examples-box">
                    ${utils.escapeHtml(policyInfo.examples)}
                </div>
            </div>
            ` : ''}
            
            <div class="detail-section">
                <h3>Keywords</h3>
                <div class="keywords-container">
                    ${policyInfo.keywords.map(keyword => 
                        `<span class="keyword">${utils.escapeHtml(keyword)}</span>`
                    ).join('')}
                </div>
            </div>
            
            ${considerationsHtml}
            
            ${relatedPolicies.length > 0 ? `
            <div class="related-policies-section">
                <h3>
                    Related Policy Initiatives
                    <span style="font-size: 0.7rem; font-weight: normal; color: var(--color-gray-500);">
                        (${relatedPolicies.length} found)
                    </span>
                </h3>
                
                <div class="related-policies-list">
                    ${relatedPolicies.map(related => `
                        <div class="related-policy-item" data-dimension="${utils.escapeHtml(related.dimension)}" data-phase="${utils.escapeHtml(related.phase)}" data-policy-id="${utils.escapeHtml(related.policyId)}">
                            <div class="related-policy-dimension" style="background-color: ${utils.getPolicyAreaColor(related.dimension)}">
                                ${utils.getPolicyAreaInitial(related.dimension)}
                            </div>
                            <div class="related-policy-content">
                                <div class="related-policy-header">
                                    <span class="related-policy-id">${utils.escapeHtml(related.policyId)}</span>
                                    <span class="related-policy-phase">${utils.escapeHtml(related.phase)}</span>
                                </div>
                                <div class="related-policy-title">${utils.escapeHtml(related.policy)}</div>
                                <div class="related-policy-match">
                                    ${related.dimension !== state.selectedPolicyArea ? 'Cross Policy Areas • ' : ''}Shared: ${related.sharedKeywords.join(', ')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;

        // Add click handlers for related policies
        this.elements.policyDetailsContent.querySelectorAll('.related-policy-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const dimension = item.dataset.dimension;
                const phase = item.dataset.phase;
                const policyId = item.dataset.policyId;
                this.navigateToPolicy(dimension, phase, policyId);
            });
        });

        // Update select button
        if (this.elements.selectPolicyBtn) {
            utils.setText(this.elements.selectPolicyBtn, isSelected ? 'Selected' : 'Add policy initiative to your plan ➕');
            this.elements.selectPolicyBtn.disabled = isSelected;
            domHelpers.removeClass(this.elements.selectPolicyBtn, 'hidden');
        }
    }

    renderConsiderationsContent(considerations) {
        // Create a high-level summary
        const totalConsiderations = considerations.universal.length + 
                                   considerations.contextDependent.reduce((sum, ctx) => sum + ctx.items.length, 0) + 
                                   considerations.sectorSpecific.reduce((sum, sector) => sum + sector.items.length, 0);
        
        if (totalConsiderations === 0) return '';
        
        // Build better aggregated summary
        const summaryParts = [];
        
        // Add universal considerations first
        if (considerations.universal.length > 0) {
            summaryParts.push(...considerations.universal.slice(0, 2).map(item => item.name));
        }
        
        // Add context-dependent considerations (grouped by context)
        if (considerations.contextDependent.length > 0 && summaryParts.length < 3) {
            considerations.contextDependent.forEach(context => {
                if (summaryParts.length >= 3) return;
                const remainingSlots = 3 - summaryParts.length;
                const contextItems = context.items.slice(0, remainingSlots);
                
                if (contextItems.length === 1) {
                    summaryParts.push(`${context.title}: ${contextItems[0].name}`);
                } else if (contextItems.length > 1) {
                    const itemNames = contextItems.map(item => item.name.toLowerCase());
                    summaryParts.push(`${context.title} (${itemNames.join(', ')})`);
                }
            });
        }
        
        // Add sector-specific considerations if still space
        if (considerations.sectorSpecific.length > 0 && summaryParts.length < 3) {
            considerations.sectorSpecific.forEach(sector => {
                if (summaryParts.length >= 3) return;
                const remainingSlots = 3 - summaryParts.length;
                const sectorItems = sector.items.slice(0, remainingSlots);
                
                if (sectorItems.length === 1) {
                    summaryParts.push(`${sector.title}: ${sectorItems[0].name}`);
                } else if (sectorItems.length > 1) {
                    const itemNames = sectorItems.map(item => item.name.toLowerCase());
                    summaryParts.push(`${sector.title} (${itemNames.join(', ')})`);
                }
            });
        }
        
        const summaryText = summaryParts.length > 0 
            ? `Key considerations include: ${summaryParts.join('; ')}.`
            : `${totalConsiderations} implementation considerations identified for this policy area and phase.`;
        
        // Build detailed content for expansion
        let detailedHtml = '';
        
        // Universal considerations
        if (considerations.universal.length > 0) {
            detailedHtml += `
                <p><strong>Universal Considerations:</strong></p>
                <ul>
                    ${considerations.universal.map(item => `
                        <li><strong>${utils.escapeHtml(item.name)}</strong> - ${utils.escapeHtml(item.description)}</li>
                    `).join('')}
                </ul>
            `;
        }
        
        // Context-dependent considerations
        if (considerations.contextDependent.length > 0) {
            detailedHtml += `<p><strong>Context-Specific Considerations:</strong></p>`;
            considerations.contextDependent.forEach(context => {
                detailedHtml += `
                    <p><em>${context.icon} ${utils.escapeHtml(context.title)}:</em></p>
                    <ul>
                        ${context.items.map(item => `
                            <li><strong>${utils.escapeHtml(item.name)}</strong> - ${utils.escapeHtml(item.description)}</li>
                        `).join('')}
                    </ul>
                `;
            });
        }
        
        // Sector-specific considerations
        if (considerations.sectorSpecific.length > 0) {
            detailedHtml += `<p><strong>Sector-Specific Considerations:</strong></p>`;
            considerations.sectorSpecific.forEach(sector => {
                detailedHtml += `
                    <p><em>${utils.escapeHtml(sector.title)}:</em></p>
                    <ul>
                        ${sector.items.map(item => `
                            <li><strong>${utils.escapeHtml(item.name)}</strong> - ${utils.escapeHtml(item.description)}</li>
                        `).join('')}
                    </ul>
                `;
            });
        }
        
        return `
            <div class="considerations-summary">
                <p>${summaryText}</p>
                <button class="considerations-toggle" onclick="this.parentElement.classList.toggle('expanded'); this.textContent = this.parentElement.classList.contains('expanded') ? 'Show less' : 'Read more details';">Read more details</button>
                <div class="considerations-details">${detailedHtml}</div>
            </div>
        `;
    }

    clearPolicyDetails() {
        // Remove details-focused class to hide details panel
        const policyContainer = this.elements.policyContainer;
        const policyDetailsColumn = this.elements.policyDetailsColumn;

        if (policyContainer && policyDetailsColumn) {
            policyContainer.classList.remove('details-focused');
            policyDetailsColumn.classList.remove('has-policy');
        }
        
        // Clear related policies
        state.setRelatedPolicies([]);
        
        // Reset experts to default view
        expertsManager.showDefaultExperts();
        
        if (this.elements.policyDetailsContent) {
            domHelpers.setElementContent(this.elements.policyDetailsContent,
                domHelpers.createEmptyState('📄', 'Select a policy from the list to view its details')
            );
        }
        
        if (this.elements.selectPolicyBtn) {
            domHelpers.addClass(this.elements.selectPolicyBtn, 'hidden');
        }
    }

    navigateToPolicy(dimension, phase, policyId) {
        // Update state
        state.setPolicyArea(dimension);
        state.setPhase(phase);
        state.setPolicy(policyId);

        // Update UI
        buttonSystem.syncWithState();
        
        // Show policy section and update lists
        this.showPolicySection();
        this.showPolicyList();
        
        // Select the specific policy in the list
        document.querySelectorAll('.policy-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const targetPolicyItem = document.querySelector(`[data-policy-id="${policyId}"]`);
        if (targetPolicyItem) {
            targetPolicyItem.classList.add('active');
            domHelpers.scrollToElement(targetPolicyItem, { behavior: 'smooth', block: 'center' });
            
            // Add temporary highlight
            targetPolicyItem.style.backgroundColor = '#fef3c7';
            setTimeout(() => {
                targetPolicyItem.style.backgroundColor = '';
            }, 2000);
        }
    }

    togglePolicyListVisibility() {
        const policyContainer = this.elements.policyContainer;
        const policyDetailsColumn = this.elements.policyDetailsColumn;
        
        if (policyContainer && policyDetailsColumn) {
            const isFocused = policyContainer.classList.contains('details-focused');
            
            if (isFocused) {
                policyContainer.classList.remove('details-focused');
                policyDetailsColumn.classList.remove('has-policy');
            } else {
                policyContainer.classList.add('details-focused');
                if (state.selectedPolicy) {
                    policyDetailsColumn.classList.add('has-policy');
                }
            }
        }
    }

    // Filter Management
    populateKeywordFilters() {
        if (!this.elements.keywordDropdown) return;
        
        const allKeywords = utils.getAllKeywords(dataLoader.getPolicyData());
        
        // Clear existing options
        this.elements.keywordDropdown.innerHTML = '<option value="">Filter by keyword...</option>';
        this.elements.keywordDropdown.disabled = false;
        
        if (allKeywords.length === 0) {
            this.elements.keywordDropdown.innerHTML = '<option value="">No keywords available</option>';
            this.elements.keywordDropdown.disabled = true;
            return;
        }
        
        // Add options for each keyword
        allKeywords.forEach(keyword => {
            const option = document.createElement('option');
            option.value = keyword;
            option.textContent = keyword;
            this.elements.keywordDropdown.appendChild(option);
        });

        this.updateActiveKeywordsDisplay();
    }

    updateActiveKeywordsDisplay() {
        if (!this.elements.visibleKeywords) return;

        domHelpers.clearElement(this.elements.visibleKeywords);
        if (this.elements.tooltipKeywords) {
            domHelpers.clearElement(this.elements.tooltipKeywords);
        }
        
        if (state.activeKeywords.size === 0) {
            if (this.elements.keywordsOverflow) {
                this.elements.keywordsOverflow.style.display = 'none';
            }
            return;
        }

        const keywordsArray = Array.from(state.activeKeywords);
        
        // Show visible chips
        const visibleChips = keywordsArray.slice(0, CONFIG.UI.MAX_VISIBLE_CHIPS);
        visibleChips.forEach(keyword => {
            const chip = domHelpers.createKeywordChip(keyword, (kw) => state.removeKeyword(kw));
            this.elements.visibleKeywords.appendChild(chip);
        });

        // Handle overflow
        const overflowCount = keywordsArray.length - CONFIG.UI.MAX_VISIBLE_CHIPS;
        if (overflowCount > 0 && this.elements.keywordsOverflow) {
            this.elements.keywordsOverflow.textContent = `+${overflowCount} more`;
            this.elements.keywordsOverflow.style.display = 'flex';
            
            // Add all chips to tooltip
            if (this.elements.tooltipKeywords) {
                keywordsArray.forEach(keyword => {
                    const chip = domHelpers.createKeywordChip(keyword, (kw) => state.removeKeyword(kw));
                    this.elements.tooltipKeywords.appendChild(chip);
                });
            }
        } else if (this.elements.keywordsOverflow) {
            this.elements.keywordsOverflow.style.display = 'none';
        }
    }

    updateClearFiltersButton() {
        if (this.elements.clearFiltersBtn) {
            const hasActiveFilters = state.searchTerm || state.activeKeywords.size > 0;
            this.elements.clearFiltersBtn.style.display = hasActiveFilters ? 'block' : 'none';
        }
    }

    // Selected Policies Management
    updateSelectedPoliciesSection() {
        if (!this.elements.selectedPoliciesSection || !this.elements.selectedPoliciesCount || !this.elements.selectedPoliciesList) return;
        
        const selectedCount = state.selectedPolicies.size;
        
        // Update count
        this.elements.selectedPoliciesCount.textContent = `${selectedCount} ${selectedCount === 1 ? 'policy' : 'policies'} selected`;
        
        // Enable/disable clear all button
        if (this.elements.clearAllBtn) {
            this.elements.clearAllBtn.disabled = selectedCount === 0;
        }
        
        // Show/hide section
        if (selectedCount === 0) {
            domHelpers.hideElement(this.elements.selectedPoliciesSection);
            domHelpers.setElementContent(this.elements.selectedPoliciesList,
                domHelpers.createEmptyState('📋', 'No policy initiatives selected yet. Select initiatives to see them here')
            );
            return;
        }
        
        domHelpers.showElement(this.elements.selectedPoliciesSection);
        
        // Render selected policies
        this.renderSelectedPolicies();
    }

    renderSelectedPolicies() {
        if (!this.elements.selectedPoliciesList) return;
        
        const policyData = dataLoader.getPolicyData();
        domHelpers.clearElement(this.elements.selectedPoliciesList);
        
        Array.from(state.selectedPolicies).forEach(policyKey => {
            const { dimension, phase, policyId } = utils.parsePolicyKey(policyKey);
            const policyInfo = policyData[dimension]?.[phase]?.[policyId];
            
            if (policyInfo) {
                const item = domHelpers.createSelectedPolicyItem(
                    policyKey,
                    policyInfo,
                    (key) => this.removePolicyFromSelection(key),
                    (key) => this.highlightSelectedPolicy(key)
                );
                this.elements.selectedPoliciesList.appendChild(item);
            }
        });
    }

    highlightSelectedPolicy(policyKey) {
        // Remove previous highlights
        document.querySelectorAll('.selected-policy-item').forEach(item => {
            item.classList.remove('highlighted');
        });
        
        // Add highlight to target policy
        const targetItem = document.querySelector(`[data-policy-key="${policyKey}"]`);
        if (targetItem) {
            targetItem.classList.add('highlighted');
            domHelpers.scrollToElement(targetItem, { behavior: 'smooth', block: 'center' });
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
                targetItem.classList.remove('highlighted');
            }, 3000);
        }
    }

    // Matrix Grid Management
    generateSelectionGrid() {
        if (!this.elements.selectionGrid) return;
        
        domHelpers.clearElement(this.elements.selectionGrid);
        
        const phases = ['Monitoring and Evaluation', 'Implementation', 'Design', 'Analysis'];
        const dimensions = CONFIG.DIMENSIONS.map(d => d.id);
        
        // Create grid cells (4 rows x 5 columns)
        phases.forEach((phase) => {
            dimensions.forEach((dimension) => {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.setAttribute('data-dimension', dimension);
                cell.setAttribute('data-phase', phase);
                
                // Add selection indicator
                if (state.selectedPolicyArea === dimension && state.selectedPhase === phase) {
                    cell.classList.add('selected');
                }
                
                // Create bars container
                const barsContainer = document.createElement('div');
                barsContainer.className = 'policy-bars';
                
                // Add bars for selected policies in this cell
                this.addPolicyBarsToCell(barsContainer, dimension, phase);
                
                cell.appendChild(barsContainer);
                this.elements.selectionGrid.appendChild(cell);
            });
        });
    }

    addPolicyBarsToCell(container, dimension, phase) {
        // Find all selected policies for this dimension-phase combination
        const selectedPoliciesInCell = Array.from(state.selectedPolicies).filter(policyKey => {
            const [dim, ph] = policyKey.split('|');
            return dim === dimension && ph === phase;
        });

        // Find related policies for this cell
        const relatedPoliciesInCell = Array.from(state.relatedPolicies).filter(policyKey => {
            const [dim, ph] = policyKey.split('|');
            return dim === dimension && ph === phase;
        });

        const allPoliciesInCell = [...selectedPoliciesInCell, ...relatedPoliciesInCell];
        
        if (allPoliciesInCell.length === 0) return;

        // Get dimension color
        const dimColor = utils.getPolicyAreaColor(dimension);
        
        // Calculate dynamic bar height
        const maxCellHeight = 52;
        const minBarHeight = 4;
        const maxBarHeight = 16;
        const gapHeight = 1;
        
        const policyCount = allPoliciesInCell.length;
        let barHeight = minBarHeight;
        
        if (policyCount > 0) {
            const totalGapHeight = (policyCount - 1) * gapHeight;
            const availableHeight = maxCellHeight - totalGapHeight;
            barHeight = Math.max(minBarHeight, Math.min(maxBarHeight, Math.floor(availableHeight / policyCount)));
        }
        
        // Create bars for each policy
        selectedPoliciesInCell.forEach(policyKey => {
            this.createPolicyBar(container, policyKey, dimColor, barHeight, 'selected');
        });

        relatedPoliciesInCell.forEach(policyKey => {
            this.createPolicyBar(container, policyKey, dimColor, barHeight, 'related');
        });
    }

    createPolicyBar(container, policyKey, dimColor, barHeight, type) {
        const { dimension, phase, policyId } = utils.parsePolicyKey(policyKey);
        const policyData = dataLoader.getPolicyData();
        const policyInfo = policyData[dimension]?.[phase]?.[policyId];
        const policyTitle = policyInfo ? `${policyId}: ${policyInfo.policy}` : `${policyId}`;
        
        const bar = document.createElement('div');
        bar.className = `policy-bar ${type}`;
        bar.style.backgroundColor = dimColor;
        bar.style.height = `${barHeight}px`;
        bar.setAttribute('data-policy-key', policyKey);
        bar.setAttribute('data-dimension', dimension);
        bar.setAttribute('data-phase', phase);
        bar.setAttribute('data-policy-id', policyId);
        
        // Check if this is the currently viewing policy
        if (state.selectedPolicyArea === dimension && state.selectedPhase === phase && state.selectedPolicy === policyId) {
            bar.classList.add('current-viewing');
        }
        
        // Add tooltip
        bar.title = policyTitle;
        
        // Add click handler
        bar.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (type === 'selected') {
                this.highlightSelectedPolicy(policyKey);
            } else {
                this.navigateToPolicy(dimension, phase, policyId);
            }
        });
        
        container.appendChild(bar);
    }

    updateSelectionGrid() {
        this.generateSelectionGrid();
    }

    updateCurrentSelection() {
        if (!this.elements.selectionInfo) return;
        
        let content = '';
        
        if (state.selectedPolicyArea) {
            content += `<div><strong>Policy Area:</strong> ${utils.escapeHtml(state.selectedPolicyArea)}</div>`;
        }
        if (state.selectedPhase) {
            content += `<div><strong>Phase:</strong> ${utils.escapeHtml(state.selectedPhase)}</div>`;
        }
        if (state.selectedPolicy) {
            content += `<div><strong>Initiative Overview:</strong> ${utils.escapeHtml(state.selectedPolicy)}</div>`;
            const isSelected = state.isCurrentPolicySelected;
            content += `<div class="status-badge ${isSelected ? 'status-selected' : 'status-viewing'}" style="background: ${isSelected ? 'var(--color-green-100)' : '#fef3c7'}; color: ${isSelected ? 'var(--color-green-700)' : '#92400e'}; display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-top: 0.5rem;">
                ${isSelected ? 'Selected' : 'Viewing'}
            </div>`;
        }
        
        // Show active filters if no dimension/phase selected
        if (!state.selectedPolicyArea && !state.selectedPhase) {
            if (state.searchTerm || state.activeKeywords.size > 0) {
                content = '<div><strong>Active Filters:</strong></div>';
                if (state.searchTerm) {
                    content += `<div>Search: "${utils.escapeHtml(state.searchTerm)}"</div>`;
                }
                if (state.activeKeywords.size > 0) {
                    const keywords = Array.from(state.activeKeywords).join(', ');
                    content += `<div>Keywords: ${utils.escapeHtml(keywords)}</div>`;
                }
            } else {
                content = 'Select a dimension or use search/filters to begin';
            }
        } else if (!content) {
            content = 'Select a dimension to begin';
        }
        
        this.elements.selectionInfo.innerHTML = content;
        this.updateSelectedPoliciesSection();
    }

    // Public API Methods (called by button system)
    selectPolicyArea(dimension, color) {
        if (!utils.isValidPolicyArea(dimension)) return;
        
        state.setLoading(true);
        state.setPolicyArea(dimension);
        
        // Set dimension attribute for phase container styling
        if (this.elements.phaseGrid) {
            this.elements.phaseGrid.setAttribute('data-dimension', dimension);
        }
        
        state.setLoading(false);
    }

    deselectPolicyArea() {
        state.setLoading(true);
        state.clearPolicyArea();
        
        // Clear dimension attribute for phase container
        if (this.elements.phaseGrid) {
            this.elements.phaseGrid.removeAttribute('data-dimension');
        }
        
        // If there's still search or keyword filters, show those results
        if (state.searchTerm || state.activeKeywords.size > 0) {
            this.showPolicySection();
            this.showPolicyList();
        }
        
        state.setLoading(false);
    }

    selectPhase(phase) {
        if (!utils.isValidPhase(phase)) return;
        
        state.setLoading(true);
        state.setPhase(phase);
        state.setLoading(false);
    }

    deselectPhase() {
        state.setLoading(true);
        state.clearPhase();
        
        // Clear search input but keep keyword filters
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
        }

        // If dimension is still selected or there are filters, show appropriate results
        if (state.selectedPolicyArea || state.searchTerm || state.activeKeywords.size > 0) {
            this.showPolicySection();
            this.showPolicyList();
        } else {
            this.clearPolicyView();
        }
        
        state.setLoading(false);
    }

    // Error handling
    showInitializationError(error) {
        document.body.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div class="error-message" style="
                    background: #fee2e2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    max-width: 500px;
                    margin: 0 auto;
                ">
                    <h3 style="margin: 0 0 1rem 0;">Failed to initialize application</h3>
                    <p style="margin: 0;">Please refresh the page and try again.</p>
                    <details style="margin-top: 1rem; text-align: left;">
                        <summary>Error details</summary>
                        <pre style="font-size: 0.8rem; margin-top: 0.5rem;">${error.message}</pre>
                    </details>
                </div>
            </div>
        `;
    }

    // Cleanup
    destroy() {
        // Remove event listeners
        if (this.elements.searchInput) {
            this.elements.searchInput.removeEventListener('input', this.handleSearchInput);
        }
        
        // Clear debounce timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
        
        // Destroy components
        buttonSystem.destroy();
        
        console.log('Application destroyed');
    }
}

// Create and export singleton instance
export const app = new PolicyToolApp();

// Make app available globally for button system and other components
window.app = app;

// Export the class for creating additional instances if needed
export default PolicyToolApp;