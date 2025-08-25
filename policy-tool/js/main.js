/**
 * Updated main.js - Add this import and initialization
 */

import { dataLoader } from './data-loader.js';
import { expertsManager } from './experts.js';
import { buttonSystem } from './button-system.js';
import { app } from './app.js';
import { state } from './state.js';
import { howToUseGuide } from './how-to-use-guide.js'; // Add this import

class ApplicationBootstrap {
    constructor() {
        this.initializationSteps = [
            { name: 'Data Loading', fn: this.loadData.bind(this) },
            { name: 'App Initialization', fn: this.initializeApp.bind(this) },
            { name: 'Guide Setup', fn: this.initializeGuide.bind(this) }, // Add this step
            { name: 'Final Setup', fn: this.finalizeSetup.bind(this) }
        ];
        this.currentStep = 0;
    }

    async initialize() {
        try {
            console.log('Starting AI Policy Tool initialization...');
            
            // Show loading state
            this.showLoadingState();
            
            // Execute initialization steps
            for (const step of this.initializationSteps) {
                console.log(`📋 ${step.name}...`);
                await step.fn();
                this.currentStep++;
                this.updateLoadingProgress();
            }
            
            // Hide loading state
            this.hideLoadingState();
            
            // Setup development debugging
            this.setupDevelopmentDebugging();
            
            console.log('✅ Application initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showInitializationError(error);
            return false;
        }
    }

    async loadData() {
        const loadingResults = await dataLoader.loadAllData();
        
        if (!loadingResults.policyLoaded) {
            throw new Error('Policy data failed to load - application cannot function without core policy data');
        }
        
        if (!loadingResults.expertsLoaded) {
            console.warn('⚠️ Experts data failed to load - expert features will be limited');
        }
        
        if (!loadingResults.considerationsLoaded) {
            console.warn('⚠️ Special considerations failed to load - considerations will not be displayed');
        }
        
        // Log data statistics
        const stats = dataLoader.getDataStatistics();
        console.log(` Loaded ${stats.totalPolicies} policies across ${stats.totalDimensions} dimensions`);
        if (stats.totalExperts > 0) {
            console.log(` Loaded ${stats.totalExperts} expert profiles`);
        }
    }

    async initializeApp() {
        const success = await app.init();
        if (!success) {
            throw new Error('Main application initialization failed');
        }
        
        // Initialize experts display if data is available
        if (dataLoader.isExpertsDataLoaded()) {
            expertsManager.showDefaultExperts();
        }
    }

    // Add this new method
    async initializeGuide() {
        try {
            // The guide initializes itself when imported, but we can add additional setup here
            console.log('📖 How-to-use guide initialized');
            
            // Optional: Add guide to debug tools
            if (window.PolicyToolDebug) {
                window.PolicyToolDebug.guide = howToUseGuide;
            }
            
            return true;
        } catch (error) {
            console.error('Failed to initialize guide:', error);
            // Don't fail the whole app if guide fails
            return true;
        }
    }

    async finalizeSetup() {
        // Setup global event listeners for cross-component communication
        this.setupGlobalEventListeners();
        
        // Setup URL handling for deep linking (if needed in the future)
        this.setupURLHandling();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Setup error handling
        this.setupErrorHandling();
        
        // Initial state logging
        console.log('🔍 Initial application state:', state.toJSON());
    }

    setupGlobalEventListeners() {
        // Listen for button system events
        document.addEventListener('tpafSelectionChange', (e) => {
            console.log('🔍 Selection changed:', e.detail);
        });

        // Listen for visibility change to pause/resume if needed
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 Application backgrounded');
            } else {
                console.log('📱 Application foregrounded');
            }
        });

        // Listen for online/offline events
        window.addEventListener('online', () => {
            console.log('Application back online');
        });

        window.addEventListener('offline', () => {
            console.log('Application offline');
        });
    }

    setupURLHandling() {
        // Basic URL handling setup for future deep linking features
        const handleURLChange = () => {
            const url = new URL(window.location);
            const params = url.searchParams;
            
            // Handle guide parameter for direct linking to guide
            if (params.has('guide') && params.get('guide') === 'start') {
                setTimeout(() => {
                    howToUseGuide.startGuide();
                }, 1000);
            }
            
            // Future: Handle deep linking parameters
            // Example: ?dimension=Infrastructure&phase=Analysis&policy=P1
            if (params.has('dimension') || params.has('phase') || params.has('policy')) {
                console.log('🔗 Deep link detected:', Object.fromEntries(params.entries()));
                // Implementation would go here
            }
        };

        // Listen for URL changes
        window.addEventListener('popstate', handleURLChange);
        
        // Check initial URL
        handleURLChange();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('policySearchInput');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Ctrl/Cmd + H for help guide
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                howToUseGuide.startGuide();
            }
            
            // Escape to clear current selection
            if (e.key === 'Escape') {
                if (state.selectedPolicy) {
                    state.clearPolicy();
                } else if (state.selectedPhase) {
                    state.clearPhase();
                } else if (state.selectedPolicyArea) {
                    state.clearPolicyArea();
                }
            }
        });
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.handleGlobalError(e.error);
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.handleGlobalError(e.reason);
        });
    }

    handleGlobalError(error) {
        // Don't spam the user with error messages for non-critical errors
        if (error.name === 'NetworkError' || error.message.includes('Loading CSS chunk')) {
            return;
        }

        // Show user-friendly error message for critical errors
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 1rem;
            border-radius: 0.5rem;
            max-width: 400px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        errorContainer.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.5rem;">Something went wrong</div>
            <div style="font-size: 0.875rem;">The application encountered an error. Please refresh the page if problems persist.</div>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 0.5rem; 
                background: #dc2626; 
                color: white; 
                border: none; 
                padding: 0.25rem 0.5rem; 
                border-radius: 0.25rem; 
                cursor: pointer;
            ">Dismiss</button>
        `;
        
        document.body.appendChild(errorContainer);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorContainer.parentNode) {
                errorContainer.parentNode.removeChild(errorContainer);
            }
        }, 10000);
    }

    setupDevelopmentDebugging() {
        // Only in development environments
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.PolicyToolDebug = {
                state: () => state.toJSON(),
                dataLoader,
                expertsManager,
                buttonSystem,
                app,
                howToUseGuide, // Add guide to debug tools
                clearData: () => {
                    dataLoader.clearCache();
                    state.reset();
                    console.log('Data and state cleared');
                },
                exportState: () => {
                    const stateData = state.toJSON();
                    const blob = new Blob([JSON.stringify(stateData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'policy-tool-state.json';
                    a.click();
                    URL.revokeObjectURL(url);
                },
                importState: (stateData) => {
                    try {
                        state.fromJSON(stateData);
                        console.log('State imported successfully');
                    } catch (error) {
                        console.error('Failed to import state:', error);
                    }
                },
                startGuide: () => howToUseGuide.startGuide(), // Add guide control
                restartGuide: () => howToUseGuide.restartGuide()
            };
            
            console.log('Development debugging enabled. Access via window.PolicyToolDebug');
            console.log('Use Ctrl+H to start the how-to-use guide');
        }
    }

    showLoadingState() {
        document.body.classList.add('loading');
        
        // Create loading overlay if it doesn't exist
        if (!document.getElementById('app-loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'app-loading-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(2px);
            `;
            
            overlay.innerHTML = `
                <div style="text-align: center;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border: 3px solid #e5e7eb;
                        border-top: 3px solid #3b82f6;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 1rem;
                    "></div>
                    <div style="color: #374151; font-size: 0.875rem;">
                        Loading AI Policy Tool...
                    </div>
                    <div id="loading-progress" style="color: #6b7280; font-size: 0.75rem; margin-top: 0.5rem;">
                        Initializing...
                    </div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            document.body.appendChild(overlay);
        }
    }

    updateLoadingProgress() {
        const progressElement = document.getElementById('loading-progress');
        if (progressElement && this.currentStep < this.initializationSteps.length) {
            const step = this.initializationSteps[this.currentStep];
            progressElement.textContent = `${step.name}... (${this.currentStep + 1}/${this.initializationSteps.length})`;
        }
    }

    hideLoadingState() {
        document.body.classList.remove('loading');
        
        const overlay = document.getElementById('app-loading-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }

    showInitializationError(error) {
        this.hideLoadingState();
        
        document.body.innerHTML = `
            <div style="
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
                background: #f9fafb;
            ">
                <div style="
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.5rem;
                    padding: 2rem;
                    max-width: 600px;
                    text-align: center;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                ">
                    <div style="
                        width: 64px;
                        height: 64px;
                        background: #fee2e2;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 1.5rem;
                        font-size: 24px;
                    ">⚠️</div>
                    
                    <h1 style="
                        font-size: 1.5rem;
                        font-weight: 600;
                        color: #111827;
                        margin: 0 0 1rem 0;
                    ">Failed to Initialize</h1>
                    
                    <p style="
                        color: #6b7280;
                        margin: 0 0 2rem 0;
                        line-height: 1.6;
                    ">
                        The AI Policy Tool encountered an error during startup. 
                        This is usually caused by missing data files or network connectivity issues.
                    </p>
                    
                    <div style="
                        background: #f9fafb;
                        border: 1px solid #e5e7eb;
                        border-radius: 0.375rem;
                        padding: 1rem;
                        margin: 1.5rem 0;
                        text-align: left;
                    ">
                        <div style="font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                            Error Details:
                        </div>
                        <code style="
                            font-size: 0.875rem;
                            color: #dc2626;
                            word-break: break-word;
                        ">${error.message}</code>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button onclick="window.location.reload()" style="
                            background: #3b82f6;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 0.375rem;
                            font-weight: 500;
                            cursor: pointer;
                        ">Refresh Page</button>
                        
                        <button onclick="console.log('Error details:', ${JSON.stringify(error.message)})" style="
                            background: white;
                            color: #374151;
                            border: 1px solid #d1d5db;
                            padding: 0.75rem 1.5rem;
                            border-radius: 0.375rem;
                            font-weight: 500;
                            cursor: pointer;
                        ">View Console</button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize when DOM is ready
async function startApplication() {
    const bootstrap = new ApplicationBootstrap();
    await bootstrap.initialize();
}

// Start the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApplication);
} else {
    startApplication();
}

// Export for external access if needed
export { ApplicationBootstrap };