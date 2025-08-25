/**
 * Interactive Demo Mode How-to-Use Guide
 * Replace your existing how-to-use-guide.js with this enhanced version
 */

export class HowToUseGuide {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.isDemoMode = false;
        this.originalState = null;
        this.positionTracker = null;
        this.demoElements = new Map();
        
        // Enhanced steps with interactive demo actions
        this.steps = [
            {
                target: '.sidebar-menu',
                title: 'Welcome to the AI Policy Tool',
                content: 'This tool helps you explore and select AI governance policies across 5 key areas. Let\'s take a quick interactive tour!',
                position: 'right',
                highlight: true,
                action: 'showWelcome'
            },
            {
                target: '.sidebar-menu .sidebar-item[data-dimension="Enabling Infrastructure"]',
                title: 'Select a Policy Area',
                content: 'Start by choosing a policy area. Let\'s select "Enabling Infrastructure" to see what happens.',
                position: 'right',
                highlight: true,
                action: 'selectDemoArea',
                actionData: 'Enabling Infrastructure'
            },
            {
                target: '.phases-container',
                title: 'Choose Implementation Phase',
                content: 'Great! Now you can see the 4 implementation phases. Let\'s select "Design" to see policy initiatives.',
                position: 'bottom',
                highlight: true,
                action: 'selectDemoPhase',
                actionData: 'Design'
            },
            {
                target: '.search-input',
                title: 'Search & Filter Options',
                content: 'You can also search across all policies using keywords. Try typing "data" to see cross-dimensional results.',
                position: 'bottom',
                highlight: true,
                action: 'demonstrateSearch',
                actionData: 'data governance'
            },
            {
                target: '.policy-list',
                title: 'Browse Policy Initiatives',
                content: 'Here are the available policy initiatives for this area and phase. Each item shows the policy title and a "Read More" button.',
                position: 'left',
                highlight: true,
                action: 'showPolicyList'
            },
            {
                target: '.policy-list .policy-item:first-child',
                title: 'Select a Policy Initiative',
                content: 'Click on any policy initiative to learn more about it. Let\'s click on the first one to see what happens.',
                position: 'left',
                highlight: true,
                action: 'highlightDemoPolicy'
            },
            {
                target: '.policy-details-column',
                title: 'View Detailed Guidance',
                content: 'Great! Now you can see detailed implementation guidance, examples, and an "Add to Plan" button.',
                position: 'left',
                highlight: true,
                action: 'showDemoPolicyDetails'
            },
            {
                target: '.btn-select',
                title: 'Add to Your Plan',
                content: 'Perfect! Click "Add to Plan" to include this policy initiative in your selection.',
                position: 'top',
                highlight: true,
                action: 'addDemoPolicy'
            },
            {
                target: '.selected-policies-section',
                title: 'Review Your Selected Policies',
                content: 'Excellent! Your selected policy appears here. You can review all your choices, remove policies, or add more.',
                position: 'top',
                highlight: true,
                action: 'showSelectedPolicies'
            },
            {
                target: '.experts-section',
                title: 'Find Relevant Experts',
                content: 'Based on your policy selections, the tool shows experts who work in related areas and can provide guidance.',
                position: 'left',
                highlight: true,
                action: 'showRelevantExperts'
            },
            {
                target: '.selection-matrix-container',
                title: 'Track Your Progress',
                content: 'The matrix visualizes your selected policies as colored bars, helping you see coverage across areas and phases.',
                position: 'left',
                highlight: true,
                action: 'showMatrix'
            },
            {
                target: '.export-pdf',
                title: 'Export Your Plan',
                content: 'Finally, generate a comprehensive PDF report of your policy selection for meetings and implementation.',
                position: 'top',
                highlight: true,
                action: 'highlightExport'
            }
        ];
        
        this.init();
    }

    init() {
        this.createGuideElements();
        this.setupEventListeners();
        
        // Check if user has seen guide before
        if (!localStorage.getItem('tpaf-guide-seen')) {
            // Auto-start guide after a short delay for first-time users
            setTimeout(() => {
                this.startGuide();
            }, 2000);
        }
    }

    createGuideElements() {
        // Create guide overlay with enhanced controls
        const overlay = document.createElement('div');
        overlay.id = 'guideOverlay';
        overlay.className = 'guide-overlay';
        overlay.innerHTML = `
            <div class="guide-tooltip" id="guideTooltip">
                <div class="guide-header">
                    <h3 id="guideTitle"></h3>
                </div>
                <p id="guideContent"></p>
                <div class="guide-tooltip-controls">
                    <span class="guide-step-counter" id="stepCounter"></span>
                    <div class="guide-buttons">
                        <button class="guide-btn guide-btn-skip" id="skipGuide">Skip Guide</button>
                        <button class="guide-btn guide-btn-prev" id="prevStep" style="display: none;">Previous</button>
                        <button class="guide-btn guide-btn-next" id="nextStep">Next</button>
                    </div>
                </div>
            </div>
            <div class="guide-arrow" id="guideArrow"></div>
            <div class="element-highlight" id="elementHighlight"></div>
            <div class="guide-pulse" id="guidePulse"></div>

        `;
        document.body.appendChild(overlay);

        // Add guide trigger button to sidebar
        const sidebarHowTo = document.querySelector('.sidebar-how-to-use');
        if (sidebarHowTo) {
            const guideButton = document.createElement('button');
            guideButton.id = 'startGuideBtn';
            guideButton.className = 'how-to-use-trigger';
            guideButton.innerHTML = '🎯 Interactive Guide';
            sidebarHowTo.appendChild(guideButton);
        }
    }

    setupEventListeners() {
        // Guide trigger button
        const startBtn = document.getElementById('startGuideBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGuide());
        }

        // Guide controls
        document.getElementById('skipGuide')?.addEventListener('click', () => this.endGuide());
        document.getElementById('nextStep')?.addEventListener('click', () => this.nextStep());
        document.getElementById('prevStep')?.addEventListener('click', () => this.previousStep());
        
        // Close on overlay click (but not during demo)
        document.getElementById('guideOverlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget && !this.isDemoMode) {
                this.endGuide();
            }
        });

        // Enhanced keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            if (e.key === 'Escape' && !this.isDemoMode) {
                this.endGuide();
            } else if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                this.nextStep();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousStep();
            }
        });
    }

    // Demo Mode State Management
    enterDemoMode() {
        this.isDemoMode = true;
        this.originalState = this.captureCurrentState();
        
        // Add demo mode styling
        document.body.classList.add('guide-demo-mode');
        document.getElementById('guideDemoOverlay')?.classList.add('active');
        
        console.log('📚 Entered demo mode - original state captured');
    }

    exitDemoMode() {
        this.isDemoMode = false;
        this.restoreOriginalState();
        
        // Remove demo mode styling
        document.body.classList.remove('guide-demo-mode');
        document.getElementById('guideDemoOverlay')?.classList.remove('active');
        
        // Clean up demo elements
        this.cleanupDemoElements();
        
        console.log('📚 Exited demo mode - state restored');
    }

    captureCurrentState() {
        // Import state from your existing state.js
        const currentState = window.state ? window.state.toJSON() : {
            selectedPolicyArea: null,
            selectedPhase: null,
            selectedPolicy: null,
            selectedPolicies: [],
            searchTerm: '',
            activeKeywords: []
        };

        return {
            appState: currentState,
            scrollPosition: window.scrollY,
            visibleSections: {
                phasesSection: !document.getElementById('phasesSection')?.classList.contains('hidden'),
                policySection: !document.getElementById('policySection')?.classList.contains('hidden'),
                selectedPoliciesSection: !document.getElementById('selectedPoliciesSection')?.classList.contains('hidden')
            }
        };
    }

    restoreOriginalState() {
        if (!this.originalState) return;

        // Restore app state
        if (window.state && window.state.fromJSON) {
            window.state.fromJSON(this.originalState.appState);
        }

        // Clear search input
        const searchInput = document.getElementById('policySearchInput');
        if (searchInput) {
            searchInput.value = '';
        }

        // Restore section visibility
        const { visibleSections } = this.originalState;
        
        this.toggleSection('phasesSection', visibleSections.phasesSection);
        this.toggleSection('policySection', visibleSections.policySection);
        this.toggleSection('selectedPoliciesSection', visibleSections.selectedPoliciesSection);

        // Restore scroll position
        setTimeout(() => {
            window.scrollTo({
                top: this.originalState.scrollPosition,
                behavior: 'smooth'
            });
        }, 100);

        // Clear any active states
        document.querySelectorAll('.sidebar-item.active').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.phase-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.policy-item.active').forEach(item => {
            item.classList.remove('active');
        });
    }

    // Demo Actions
    executeStepAction(step) {
        if (!step.action) return;

        console.log(`🎬 Executing demo action: ${step.action}`);

        switch (step.action) {
            case 'showWelcome':
                this.actionShowWelcome();
                break;
            case 'selectDemoArea':
                this.actionSelectDemoArea(step.actionData);
                break;
            case 'selectDemoPhase':
                this.actionSelectDemoPhase(step.actionData);
                break;
            case 'demonstrateSearch':
                this.actionDemonstrateSearch(step.actionData);
                break;
            case 'showPolicyList':
                this.actionShowPolicyList();
                break;
            case 'highlightDemoPolicy':
                this.actionHighlightDemoPolicy();
                break;
            case 'showDemoPolicyDetails':
                this.actionShowDemoPolicyDetails();
                break;
            case 'addDemoPolicy':
                this.actionAddDemoPolicy();
                break;
            case 'showSelectedPolicies':
                this.actionShowSelectedPolicies();
                break;
            case 'showRelevantExperts':
                this.actionShowRelevantExperts();
                break;
            case 'showMatrix':
                this.actionShowMatrix();
                break;
            case 'highlightExport':
                this.actionHighlightExport();
                break;
        }
    }

    actionShowWelcome() {
        // Ensure we start with clean state
        this.toggleSection('phasesSection', false);
        this.toggleSection('policySection', false);
        this.toggleSection('selectedPoliciesSection', false);
    }

    actionSelectDemoArea(dimension) {
        // Simulate selecting a policy area
        const sidebarItem = document.querySelector(`[data-dimension="${dimension}"]`);
        if (sidebarItem) {
            // Visual feedback
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active');
            });
            sidebarItem.classList.add('active');
            
            // Show phases section
            this.toggleSection('phasesSection', true);
            
            // Set the dimension for styling
            const phasesSection = document.getElementById('phasesSection');
            if (phasesSection) {
                phasesSection.setAttribute('data-dimension', dimension);
            }
        }
    }

    actionSelectDemoPhase(phase) {
        // Simulate selecting a phase
        const phaseBtn = document.querySelector(`[data-phase="${phase}"]`);
        if (phaseBtn) {
            // Visual feedback
            document.querySelectorAll('.phase-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            phaseBtn.classList.add('active');
            
            // Show policy section but DON'T show policies yet
            this.toggleSection('policySection', true);
            
            // Clear any existing policy content
            const policyList = document.getElementById('policyList');
            if (policyList) {
                policyList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">Policy initiatives will appear here...</div></div>';
            }
        }
    }

    actionDemonstrateSearch(searchTerm) {
        const searchInput = document.getElementById('policySearchInput');
        if (searchInput) {
            // Animate typing
            this.typeText(searchInput, searchTerm, () => {
                this.showDemoSearchResults();
            });
        }
    }

    actionShowPolicyList() {
        // Just show the policy list without selecting anything
        this.showDemoPolicies();
        // Make sure details panel is NOT shown yet
        const policyContainer = document.getElementById('policyContainer');
        const policyDetailsColumn = document.getElementById('policyDetailsColumn');
        
        if (policyContainer && policyDetailsColumn) {
            policyContainer.classList.remove('details-focused');
            policyDetailsColumn.classList.remove('has-policy');
        }
        
        // Hide select button
        const selectBtn = document.getElementById('selectPolicyBtn');
        if (selectBtn) {
            selectBtn.classList.add('hidden');
        }
    }

    actionHighlightDemoPolicy() {
        // Just highlight the first policy item to show it's being clicked
        // but DON'T show details panel yet
        const policyList = document.getElementById('policyList');
        if (policyList) {
            const firstPolicy = policyList.querySelector('.policy-item');
            if (firstPolicy) {
                // Add visual feedback to show it's selected
                document.querySelectorAll('.policy-item').forEach(item => {
                    item.classList.remove('active');
                });
                firstPolicy.classList.add('active');
                
                // Add a temporary click effect
                firstPolicy.style.transform = 'scale(1.02)';
                // firstPolicy.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                
                setTimeout(() => {
                    firstPolicy.style.transform = '';
                    firstPolicy.style.boxShadow = '';
                }, 300);
            }
        }
        
        // Ensure details panel is still hidden
        const policyContainer = document.getElementById('policyContainer');
        const policyDetailsColumn = document.getElementById('policyDetailsColumn');
        
        if (policyContainer && policyDetailsColumn) {
            policyContainer.classList.remove('details-focused');
            policyDetailsColumn.classList.remove('has-policy');
        }
        
        // Keep select button hidden
        const selectBtn = document.getElementById('selectPolicyBtn');
        if (selectBtn) {
            selectBtn.classList.add('hidden');
        }
    }

    actionShowDemoPolicyDetails() {
        // NOW show the policy details panel
        this.showDemoPolicyDetails();
    }

    actionAddDemoPolicy() {
        // Simulate adding policy to selection
        const selectBtn = document.getElementById('selectPolicyBtn');
        if (selectBtn) {
            // Visual feedback
            selectBtn.style.background = '#16a34a';
            selectBtn.innerHTML = 'Added to Plan ✓';
            
            setTimeout(() => {
                selectBtn.style.background = '';
                selectBtn.innerHTML = 'Remove from plan ×';
            }, 1000);
            
            // Show selected policies section
            this.toggleSection('selectedPoliciesSection', true);
            this.showDemoSelectedPolicies();
        }
    }

    actionShowSelectedPolicies() {
        // Ensure selected policies section is visible and properly populated
        this.toggleSection('selectedPoliciesSection', true);
        this.populateDemoSelectedPolicies();
        
        // Add some visual emphasis
        const section = document.getElementById('selectedPoliciesSection');
        if (section) {
            section.style.border = '2px solid #3b82f6';
            section.style.borderRadius = '8px';
            setTimeout(() => {
                section.style.border = '';
                section.style.borderRadius = '';
            }, 2000);
        }
    }

    actionShowRelevantExperts() {
        // Show demo experts in the experts section
        this.showDemoExperts();
        
        // Add visual emphasis to experts section
        const expertsSection = document.querySelector('.experts-section');
        if (expertsSection) {
            expertsSection.style.border = '2px solid #10b981';
            expertsSection.style.borderRadius = '8px';
            setTimeout(() => {
                expertsSection.style.border = '';
                expertsSection.style.borderRadius = '';
            }, 2000);
        }
    }

    actionShowMatrix() {
        // Add demo bars to matrix
        this.addDemoMatrixBars();
    }

    actionHighlightExport() {
        // Add special highlight to export button
        const exportBtn = document.querySelector('.export-pdf');
        if (exportBtn) {
            exportBtn.classList.add('guide-highlight-export');
            setTimeout(() => {
                exportBtn.classList.remove('guide-highlight-export');
            }, 3000);
        }
    }

    // Demo Content Creation
    showDemoPolicies() {
        this.toggleSection('policySection', true);
        
        const policyList = document.getElementById('policyList');
        if (policyList) {
            policyList.innerHTML = `
                <div class="policy-item" data-policy-id="P1" data-dimension="Enabling Infrastructure" data-phase="Design">
                    <div class="policy-header">
                        <div class="policy-info">
                            <span class="policy-title">Establish AI Infrastructure Standards</span>
                        </div>
                    </div>
                    <div class="policy-read-more"></div>
                </div>
                <div class="policy-item" data-policy-id="P2" data-dimension="Enabling Infrastructure" data-phase="Design">
                    <div class="policy-header">
                        <div class="policy-info">
                            <span class="policy-title">Create National AI Computing Framework</span>
                        </div>
                    </div>
                    <div class="policy-read-more"></div>
                </div>
                <div class="policy-item" data-policy-id="P3" data-dimension="Enabling Infrastructure" data-phase="Design">
                    <div class="policy-header">
                        <div class="policy-info">
                            <span class="policy-title">Develop AI Data Governance Protocols</span>
                        </div>
                    </div>
                    <div class="policy-read-more"></div>
                </div>
            `;
            
            this.demoElements.set('demoPolicies', policyList.innerHTML);
        }
    }

    showDemoSearchResults() {
        this.toggleSection('policySection', true);
        
        const policyList = document.getElementById('policyList');
        if (policyList) {
            policyList.innerHTML = `
                <div class="policy-item cross-dimensional" data-dimension="Legislation & Policy">
                    <div class="policy-header">
                        <div class="policy-info">
                            <span class="policy-title">Data Protection and Privacy Framework</span>
                            <span class="policy-meta">Phase: Analysis</span>
                        </div>
                    </div>
                    <div class="policy-read-more"></div>
                </div>
                <div class="policy-item cross-dimensional" data-dimension="Enabling Infrastructure">
                    <div class="policy-header">
                        <div class="policy-info">
                            <span class="policy-title">National Data Infrastructure Strategy</span>
                            <span class="policy-meta">Phase: Design</span>
                        </div>
                    </div>
                    <div class="policy-read-more"></div>
                </div>
            `;
        }
    }

    showDemoPolicyDetails() {
        const policyDetailsColumn = document.getElementById('policyDetailsColumn');
        const policyContainer = document.getElementById('policyContainer');
        
        if (policyDetailsColumn && policyContainer) {
            policyContainer.classList.add('details-focused');
            policyDetailsColumn.classList.add('has-policy');
            
            const detailsContent = document.getElementById('policyDetailsContent');
            if (detailsContent) {
                detailsContent.innerHTML = `
                    <div class="detail-section">
                        <h2>Establish AI Infrastructure Standards</h2>
                        <br>
                        <h3>Possible Implementation Guidance and Actions</h3>
                        <p>Develop comprehensive technical standards for AI infrastructure including computing requirements, data storage protocols, and interoperability frameworks to ensure consistent AI deployment across government agencies.</p>
                    </div>
                    
                    <div class="detail-section">
                        <h3>Implementation Examples</h3>
                        <div class="examples-box">
                            Create standardized cloud computing environments for AI workloads, establish data quality metrics, and develop API specifications for cross-agency AI integration.
                        </div>
                    </div>
                `;
            }
            
            // Show select button
            const selectBtn = document.getElementById('selectPolicyBtn');
            if (selectBtn) {
                selectBtn.classList.remove('hidden');
                selectBtn.innerHTML = 'Add policy initiative to your plan <span style="color: white; font-size: 1.2em; font-weight: bold;">+</span>';
            }
        }
    }

    showDemoSelectedPolicies() {
        const selectedPoliciesList = document.getElementById('selectedPoliciesList');
        const selectedCount = document.getElementById('selectedPoliciesCount');
        
        if (selectedPoliciesList) {
            selectedPoliciesList.innerHTML = `
                <div class="selected-policy-item">
                    <div class="selected-policy-dimension" style="background-color: #4F8EDB;">I</div>
                    <div class="selected-policy-content">
                        <div class="selected-policy-header">
                            <span class="selected-policy-phase">Design</span>
                        </div>
                        <div class="selected-policy-title">Establish AI Infrastructure Standards</div>
                    </div>
                    <div class="selected-policy-actions">
                        <button class="remove-policy-btn">×</button>
                    </div>
                </div>
            `;
        }
        
        if (selectedCount) {
            selectedCount.textContent = '1 policy selected';
        }
    }

    populateDemoSelectedPolicies() {
        this.showDemoSelectedPolicies();
    }

    addDemoMatrixBars() {
        // Add visual bars to the matrix
        const matrixCells = document.querySelectorAll('.grid-cell');
        matrixCells.forEach((cell, index) => {
            if (index === 5) { // Infrastructure + Design cell
                const barsContainer = cell.querySelector('.policy-bars') || document.createElement('div');
                barsContainer.className = 'policy-bars';
                barsContainer.innerHTML = `
                    <div class="policy-bar selected" style="background-color: #4F8EDB; height: 8px;" title="Establish AI Infrastructure Standards"></div>
                `;
                if (!cell.querySelector('.policy-bars')) {
                    cell.appendChild(barsContainer);
                }
            }
        });
    }

    showDemoExperts() {
        const expertsGrid = document.getElementById('expertsGrid');
        if (expertsGrid) {
            expertsGrid.innerHTML = `
                <div class="expert-card">
                    <div class="expert-avatar-fallback" style="background-color: #4F8EDB;">DR</div>
                    <div class="expert-info">
                        <div class="expert-header">
                            <div>
                                <div class="expert-name">Dr. Sarah Chen</div>
                                <div class="expert-title">AI Infrastructure Policy Advisor</div>
                            </div>
                            <a href="#" class="expert-linkedin">See profile →</a>
                        </div>
                        <div class="expert-details">
                            <div class="expert-detail-row">
                                <svg class="expert-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                                </svg>
                                <span>English, Mandarin</span>
                            </div>
                            <div class="expert-detail-row">
                                <svg class="expert-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span>Asia-Pacific</span>
                            </div>
                        </div>
                        <div class="expert-expertise">
                            <span class="expert-expertise-tag">Infrastructure Standards</span>
                            <span class="expert-expertise-tag">Data Governance</span>
                        </div>
                    </div>
                </div>
                
                <div class="expert-card">
                    <div class="expert-avatar-fallback" style="background-color: #AB47BC;">MR</div>
                    <div class="expert-info">
                        <div class="expert-header">
                            <div>
                                <div class="expert-name">Prof. Michael Rodriguez</div>
                                <div class="expert-title">AI Governance Specialist</div>
                            </div>
                            <a href="#" class="expert-linkedin">See profile →</a>
                        </div>
                        <div class="expert-details">
                            <div class="expert-detail-row">
                                <svg class="expert-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                                </svg>
                                <span>English, Spanish</span>
                            </div>
                            <div class="expert-detail-row">
                                <svg class="expert-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span>Americas, Europe</span>
                            </div>
                        </div>
                        <div class="expert-expertise">
                            <span class="expert-expertise-tag">Policy Design</span>
                            <span class="expert-expertise-tag">Implementation</span>
                        </div>
                    </div>
                </div>
                
                <div class="expert-card">
                    <div class="expert-avatar-fallback" style="background-color: #4CAF50;">KP</div>
                    <div class="expert-info">
                        <div class="expert-header">
                            <div>
                                <div class="expert-name">Dr. Kavita Patel</div>
                                <div class="expert-title">Digital Infrastructure Expert</div>
                            </div>
                            <a href="#" class="expert-linkedin">See profile →</a>
                        </div>
                        <div class="expert-details">
                            <div class="expert-detail-row">
                                <svg class="expert-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                                </svg>
                                <span>English, Hindi</span>
                            </div>
                            <div class="expert-detail-row">
                                <svg class="expert-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span>South Asia</span>
                            </div>
                        </div>
                        <div class="expert-expertise">
                            <span class="expert-expertise-tag">Infrastructure Design</span>
                            <span class="expert-expertise-tag">Standards Development</span>
                        </div>
                    </div>
                </div>
            `;
            
            this.demoElements.set('demoExperts', expertsGrid.innerHTML);
        }
    }

    // Utility Methods
    toggleSection(sectionId, show) {
        const section = document.getElementById(sectionId);
        if (section) {
            if (show) {
                section.classList.remove('hidden');
                section.classList.add('visible');
            } else {
                section.classList.add('hidden');
                section.classList.remove('visible');
            }
        }
    }

    typeText(element, text, callback) {
        element.value = '';
        let index = 0;
        
        const typeInterval = setInterval(() => {
            element.value += text[index];
            index++;
            
            if (index >= text.length) {
                clearInterval(typeInterval);
                if (callback) callback();
            }
        }, 100);
    }

    cleanupDemoElements() {
        // Clear any demo content we added
        this.demoElements.clear();
        
        // Reset policy container
        const policyContainer = document.getElementById('policyContainer');
        if (policyContainer) {
            policyContainer.classList.remove('details-focused');
        }
        
        const policyDetailsColumn = document.getElementById('policyDetailsColumn');
        if (policyDetailsColumn) {
            policyDetailsColumn.classList.remove('has-policy');
        }
        
        // Clear demo matrix bars
        document.querySelectorAll('.policy-bars').forEach(bars => {
            bars.innerHTML = '';
        });
    }

    // Enhanced Position Tracking
    startPositionTracking() {
        this.positionTracker = setInterval(() => {
            if (this.isActive && this.currentStep < this.steps.length) {
                this.updateTooltipPosition();
            }
        }, 50); // 20fps for smooth tracking
    }

    stopPositionTracking() {
        if (this.positionTracker) {
            clearInterval(this.positionTracker);
            this.positionTracker = null;
        }
    }

    updateTooltipPosition() {
        const step = this.steps[this.currentStep];
        if (step) {
            this.positionTooltip(step);
        }
    }

    // Main Guide Flow
    startGuide() {
        this.currentStep = 0;
        this.isActive = true;
        this.enterDemoMode();
        
        const overlay = document.getElementById('guideOverlay');
        if (overlay) {
            overlay.classList.add('active');
            this.startPositionTracking();
            this.showStep();
        }
        
        // Mark guide as seen
        localStorage.setItem('tpaf-guide-seen', 'true');
    }

    showStep() {
        const step = this.steps[this.currentStep];
        if (!step) {
            this.endGuide();
            return;
        }

        // Execute demo action first
        this.executeStepAction(step);

        // Wait a moment for UI updates
        setTimeout(() => {
            const target = document.querySelector(step.target);
            if (!target) {
                console.warn(`Guide target not found: ${step.target}`);
                this.nextStep();
                return;
            }

            // Update content
            document.getElementById('guideTitle').textContent = step.title;
            document.getElementById('guideContent').textContent = step.content;
            document.getElementById('stepCounter').textContent = `${this.currentStep + 1} of ${this.steps.length}`;
            
            // Update button states
            const nextBtn = document.getElementById('nextStep');
            const prevBtn = document.getElementById('prevStep');
            
            nextBtn.textContent = this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next';
            prevBtn.style.display = this.currentStep > 0 ? 'inline-block' : 'none';

            // Position tooltip and highlight
            this.positionTooltip(step);
            
            if (step.highlight) {
                this.highlightElement(step.target);
            }
            
            // Show tooltip with animation
            const tooltip = document.getElementById('guideTooltip');
            setTimeout(() => {
                tooltip.classList.add('active');
            }, 100);

            // Scroll target into view
            this.scrollToTarget(target);
        }, 500);
    }

    scrollToTarget(target) {
        const targetRect = target.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate if we need to scroll
        if (targetRect.top < 100 || targetRect.bottom > windowHeight - 100) {
            const optimalY = windowHeight * 0.4;
            const scrollOffset = targetRect.top - optimalY;
            
            window.scrollBy({
                top: scrollOffset,
                behavior: 'smooth'
            });
        }
    }

    positionTooltip(step) {
        const tooltip = document.getElementById('guideTooltip');
        const arrow = document.getElementById('guideArrow');
        const pulse = document.getElementById('guidePulse');
        const target = document.querySelector(step.target);
        
        if (!target || !tooltip) return;

        const targetRect = target.getBoundingClientRect();
        
        // Reset classes
        arrow.className = `guide-arrow ${step.position}`;
        
        // Calculate positions with viewport constraints
        let tooltipLeft, tooltipTop, arrowLeft, arrowTop, pulseLeft, pulseTop;
        
        switch (step.position) {
            case 'right':
                tooltipLeft = Math.min(targetRect.right + 20, window.innerWidth - 320);
                tooltipTop = Math.max(10, targetRect.top + (targetRect.height / 2) - 75);
                arrowLeft = targetRect.right + 5;
                arrowTop = targetRect.top + (targetRect.height / 2) - 10;
                break;
                
            case 'left':
                tooltipLeft = Math.max(10, targetRect.left - 320);
                tooltipTop = Math.max(10, targetRect.top + (targetRect.height / 2) - 75);
                arrowLeft = targetRect.left - 15;
                arrowTop = targetRect.top + (targetRect.height / 2) - 10;
                break;
                
            case 'bottom':
                tooltipLeft = Math.max(10, Math.min(targetRect.left + (targetRect.width / 2) - 150, window.innerWidth - 320));
                tooltipTop = Math.min(targetRect.bottom + 20, window.innerHeight - 200);
                arrowLeft = targetRect.left + (targetRect.width / 2) - 10;
                arrowTop = targetRect.bottom + 5;
                break;
                
            case 'top':
                tooltipLeft = Math.max(10, Math.min(targetRect.left + (targetRect.width / 2) - 150, window.innerWidth - 320));
                tooltipTop = Math.max(10, targetRect.top - 180);
                arrowLeft = targetRect.left + (targetRect.width / 2) - 10;
                arrowTop = targetRect.top - 15;
                break;
        }

        // Position pulse at center of target
        pulseLeft = targetRect.left + (targetRect.width / 2) - 15;
        pulseTop = targetRect.top + (targetRect.height / 2) - 15;

        // Apply positions
        tooltip.style.left = tooltipLeft + 'px';
        tooltip.style.top = tooltipTop + 'px';
        arrow.style.left = arrowLeft + 'px';
        arrow.style.top = arrowTop + 'px';
        pulse.style.left = pulseLeft + 'px';
        pulse.style.top = pulseTop + 'px';
    }

    highlightElement(selector) {
        const element = document.querySelector(selector);
        const highlight = document.getElementById('elementHighlight');
        
        if (!element || !highlight) return;

        const rect = element.getBoundingClientRect();
        const padding = 8;
        
        highlight.style.left = (rect.left - padding) + 'px';
        highlight.style.top = (rect.top - padding) + 'px';
        highlight.style.width = (rect.width + padding * 2) + 'px';
        highlight.style.height = (rect.height + padding * 2) + 'px';
        highlight.style.display = 'block';
    }

    nextStep() {
        document.getElementById('guideTooltip').classList.remove('active');
        
        setTimeout(() => {
            this.currentStep++;
            if (this.currentStep >= this.steps.length) {
                this.endGuide();
            } else {
                this.showStep();
            }
        }, 200);
    }

    previousStep() {
        if (this.currentStep > 0) {
            document.getElementById('guideTooltip').classList.remove('active');
            
            setTimeout(() => {
                this.currentStep--;
                this.showStep();
            }, 200);
        }
    }

    endGuide() {
        this.isActive = false;
        this.stopPositionTracking();
        this.exitDemoMode();
        
        const overlay = document.getElementById('guideOverlay');
        const tooltip = document.getElementById('guideTooltip');
        const highlight = document.getElementById('elementHighlight');
        
        if (tooltip) tooltip.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        if (highlight) highlight.style.display = 'none';
        
        this.currentStep = 0;
        
        console.log('Interactive guide completed');
    }

    // Public method to restart guide
    restartGuide() {
        this.endGuide();
        setTimeout(() => this.startGuide(), 300);
    }
}

// Create and export singleton instance
export const howToUseGuide = new HowToUseGuide();

// Export the class for creating additional instances if needed
export default HowToUseGuide;