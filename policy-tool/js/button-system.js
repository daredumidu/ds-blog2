/**
 * Enhanced Button System with Toggle Functionality
 */

import { CONFIG } from './config.js';
import { state } from './state.js';

export class TPAFButtonSystem {
    constructor() {
        this.dimensionNames = {
            'Enabling Infrastructure': 'Enabling Infrastructure',
            'Legislation & Policy': 'Legislation & Policy',
            'Sustainability & Society': 'Sustainability & Society',
            'Economy & Innovation': 'Economy & Innovation',
            'Research & Education': 'Research, Education & Capacity'
        };
        
        this.phaseNames = {
            'Analysis': 'Analysis',
            'Design': 'Design',
            'Implementation': 'Implementation',
            'Monitoring & Evaluation': 'Monitoring & Evaluation'
        };

        // Bind methods to maintain context
        this.handleKeyboard = this.handleKeyboard.bind(this);
        this.selectPolicyArea = this.selectPolicyArea.bind(this);
        this.selectPhase = this.selectPhase.bind(this);
    }

    init() {
        this.setupKeyboardNavigation();
        return true;
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', this.handleKeyboard);
    }

    selectPolicyArea(dimension, options = {}) {
        const { skipAppUpdate = false } = options;

        // Toggle functionality: if same dimension is clicked, deselect it
        if (state.selectedPolicyArea === dimension) {
            this.deselectPolicyArea();
            return;
        }

        // Update active dimension button
        this.updateActiveDimensionButton(dimension);

        // Show phase dropdown for this dimension
        this.showPhaseDropdown(dimension);
        this.updatePhasesSectionDimension(dimension);
        
        // Clear active phases in ALL dropdowns
        this.clearActivePhases();

        // Update state
        state.setPolicyArea(dimension);

        // Trigger dimension selection in main app if not skipped
        if (!skipAppUpdate && window.app) {
            const dimConfig = CONFIG.DIMENSIONS.find(d => d.id === dimension);
            if (dimConfig) {
                window.app.selectPolicyArea(dimension, dimConfig.color);
            }
        }
        
        this.dispatchSelectionEvent();
    }

    deselectPolicyArea() {
        // Deselect dimension
        this.clearActiveDimensions();
        
        // Hide all phase dropdowns
        this.hideAllPhaseDropdowns();
        
        // Clear active phases
        this.clearActivePhases();
        
        // **ADD THIS: Clear phases section dimension**
        this.clearPhasesSectionDimension();
        
        // Trigger deselection in main app
        if (window.app) {
            window.app.deselectPolicyArea();
        }
        
        this.dispatchSelectionEvent();
    }

    selectPhase(phase, options = {}) {
        const { skipAppUpdate = false } = options;

        // Toggle functionality: if same phase is clicked, deselect it
        if (state.selectedPhase === phase) {
            this.deselectPhase();
            return;
        }

        // Update active phase button in the current dimension's dropdown
        this.updateActivePhaseButton(phase);

        // Update state
        state.setPhase(phase);

        // Trigger phase selection in main app if not skipped
        if (!skipAppUpdate && window.app) {
            window.app.selectPhase(phase);
        }
        
        this.dispatchSelectionEvent();
    }

    deselectPhase() {
        // Deselect phase
        this.clearActivePhases();
        
        // Update state
        state.clearPhase();
        
        // Trigger phase deselection in main app
        if (window.app) {
            window.app.deselectPhase();
        }
        
        this.dispatchSelectionEvent();
    }

    // UI Update Methods
    updateActiveDimensionButton(dimension) {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`.sidebar-item[data-dimension="${dimension}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }


    updatePhasesSectionDimension(dimension) {
        const phasesSection = document.querySelector('.phases-section');
        if (phasesSection) {
            // Remove any existing dimension attributes
            phasesSection.removeAttribute('data-dimension');
            // Set the new dimension
            phasesSection.setAttribute('data-dimension', dimension);
        }
    }
    clearActiveDimensions() {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
    }
    clearPhasesSectionDimension() {
        const phasesSection = document.querySelector('.phases-section');
        if (phasesSection) {
            phasesSection.removeAttribute('data-dimension');
        }
    }

    updateActivePhaseButton(phase) {
        // Clear all phase buttons first
        document.querySelectorAll('.phase-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Only activate phase button in the currently selected dimension's dropdown
        if (state.selectedPolicyArea) {
            const activeDropdown = document.querySelector(`.phase-dropdown[data-dimension="${state.selectedPolicyArea}"]`);
            if (activeDropdown) {
                const phaseBtn = activeDropdown.querySelector(`[data-phase="${phase}"]`);
                if (phaseBtn) {
                    phaseBtn.classList.add('active');
                }
            }
        }
    }

    clearActivePhases() {
        document.querySelectorAll('.phase-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    showPhaseDropdown(dimension) {
      // Hide all other dropdowns first
      this.hideAllPhaseDropdowns();
      
      // Show the dropdown for the selected dimension
      const dropdown = document.querySelector(`.phase-dropdown[data-dimension="${dimension}"]`);
      if (dropdown) {
          dropdown.classList.add('visible');
      }
    }

    hideAllPhaseDropdowns() {
        document.querySelectorAll('.phase-dropdown').forEach(dropdown => {
            dropdown.classList.remove('visible');
        });
    }


    showPhasesSection() {
        const phasesSection = document.getElementById('phasesSection');
        if (phasesSection) {
            phasesSection.classList.add('visible');
        }
    }

    hidePhasesSection() {
        const phasesSection = document.getElementById('phasesSection');
        if (phasesSection) {
            phasesSection.classList.remove('visible');
        }
    }

    // Event Dispatching
    dispatchSelectionEvent() {
        const event = new CustomEvent('tpafSelectionChange', {
            detail: {
                dimension: state.selectedPolicyArea,
                phase: state.selectedPhase,
                dimensionName: this.dimensionNames[state.selectedPolicyArea],
                phaseName: this.phaseNames[state.selectedPhase]
            }
        });
        document.dispatchEvent(event);
    }

    // Keyboard Navigation
    handleKeyboard(e) {
        const activeElement = document.activeElement;
        
        if (activeElement.classList.contains('dimension-btn')) {
            this.handlePolicyAreaKeyboard(e, activeElement);
        } else if (activeElement.classList.contains('phase-btn')) {
            this.handlePhaseKeyboard(e, activeElement);
        }
    }

    handlePolicyAreaKeyboard(e, activeBtn) {
        const dimensionBtns = Array.from(document.querySelectorAll('.dimension-btn'));
        const currentIndex = dimensionBtns.indexOf(activeBtn);
        let newIndex;

        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                newIndex = currentIndex > 0 ? currentIndex - 1 : dimensionBtns.length - 1;
                dimensionBtns[newIndex].focus();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                newIndex = currentIndex < dimensionBtns.length - 1 ? currentIndex + 1 : 0;
                dimensionBtns[newIndex].focus();
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.selectPolicyArea(activeBtn.dataset.dimension);
                break;
        }
    }

    handlePhaseKeyboard(e, activeBtn) {
        const phaseBtns = Array.from(document.querySelectorAll('.phase-btn'));
        const currentIndex = phaseBtns.indexOf(activeBtn);
        let newIndex;

        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                newIndex = currentIndex > 0 ? currentIndex - 1 : phaseBtns.length - 1;
                phaseBtns[newIndex].focus();
                break;
            case 'ArrowRight':
                e.preventDefault();
                newIndex = currentIndex < phaseBtns.length - 1 ? currentIndex + 1 : 0;
                phaseBtns[newIndex].focus();
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.selectPhase(activeBtn.dataset.phase);
                break;
        }
    }

    // State synchronization methods
    syncWithState() {
        // Sync dimension buttons
        if (state.selectedPolicyArea) {
            this.updateActiveDimensionButton(state.selectedPolicyArea);
            this.showPhaseDropdown(state.selectedPolicyArea);
        } else {
            this.clearActiveDimensions();
            this.hideAllPhaseDropdowns();
        }

        // Sync phase buttons
        if (state.selectedPhase) {
            this.updateActivePhaseButton(state.selectedPhase);
        } else {
            this.clearActivePhases();
        }
    }

    // Programmatic selection methods (for external control)
    programmaticallySelectDimension(dimension) {
        if (CONFIG.DIMENSIONS.some(d => d.id === dimension)) {
            this.selectPolicyArea(dimension, { skipAppUpdate: true });
        }
    }

    programmaticallySelectPhase(phase) {
        if (CONFIG.PHASES.some(p => p.id === phase)) {
            this.selectPhase(phase, { skipAppUpdate: true });
        }
    }

    // Reset all selections
    resetSelections() {
        this.clearActiveDimensions();
        this.clearActivePhases();
        this.hideAllPhaseDropdowns();
    }

    // Cleanup method
    destroy() {
        document.removeEventListener('keydown', this.handleKeyboard);
    }
}

// Create and export singleton instance
export const buttonSystem = new TPAFButtonSystem();

// Export the class for creating additional instances if needed
export default TPAFButtonSystem;