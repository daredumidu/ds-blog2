/**
 * Application state management
 */

class ApplicationState {
    constructor() {
        this.reset();
        this.eventTarget = new EventTarget();
    }

    reset() {
        this.selectedPolicyArea = null;
        this.selectedPhase = null;
        this.selectedPolicy = null;
        this.selectedPolicies = new Set();
        this.relatedPolicies = new Set();
        this.isLoading = false;
        this.searchTerm = '';
        this.activeKeywords = new Set();
        this.filteredPolicies = null;
        this.suggestions = { templates: [], gaps: [], clusters: [] };
    }

    // Policy Area methods
    setPolicyArea(policyArea) {
        if (this.selectedPolicyArea !== policyArea) {
            this.selectedPolicyArea = policyArea;
            this.selectedPhase = null; // Reset phase when dimension changes
            this.selectedPolicy = null; // Reset policy when dimension changes
            this.relatedPolicies.clear();
            this.emit('policyAreaChanged', { policyArea });
        }
    }

    clearPolicyArea() {
        this.selectedPolicyArea = null;
        this.selectedPhase = null;
        this.selectedPolicy = null;
        this.relatedPolicies.clear();
        this.emit('policyAreaCleared');
    }

    // Phase methods
    setPhase(phase) {
        if (this.selectedPhase !== phase) {
            this.selectedPhase = phase;
            this.selectedPolicy = null; // Reset policy when phase changes
            this.relatedPolicies.clear();
            this.emit('phaseChanged', { phase });
        }
    }

    clearPhase() {
        this.selectedPhase = null;
        this.selectedPolicy = null;
        this.relatedPolicies.clear();
        this.emit('phaseCleared');
    }

    // Policy methods
    setPolicy(policy) {
        if (this.selectedPolicy !== policy) {
            this.selectedPolicy = policy;
            this.emit('policyChanged', { policy });
        }
    }

    clearPolicy() {
        this.selectedPolicy = null;
        this.relatedPolicies.clear();
        this.emit('policyCleared');
    }

    // Selected policies methods
    addSelectedPolicy(policyKey) {
        if (!this.selectedPolicies.has(policyKey)) {
            this.selectedPolicies.add(policyKey);
            this.emit('policyAdded', { policyKey });
        }
    }

    removeSelectedPolicy(policyKey) {
        if (this.selectedPolicies.has(policyKey)) {
            this.selectedPolicies.delete(policyKey);
            this.emit('policyRemoved', { policyKey });
        }
    }

    clearAllSelectedPolicies() {
        this.selectedPolicies.clear();
        this.emit('allPoliciesCleared');
    }

    // Related policies methods
    setRelatedPolicies(relatedPolicies) {
        this.relatedPolicies.clear();
        relatedPolicies.forEach(policy => this.relatedPolicies.add(policy));
        this.emit('relatedPoliciesChanged', { relatedPolicies });
    }

    // Search and filters
    setSearchTerm(searchTerm) {
        if (this.searchTerm !== searchTerm) {
            this.searchTerm = searchTerm;
            this.emit('searchChanged', { searchTerm });
        }
    }

    addKeyword(keyword) {
        if (!this.activeKeywords.has(keyword)) {
            this.activeKeywords.add(keyword);
            this.emit('keywordAdded', { keyword });
        }
    }

    removeKeyword(keyword) {
        if (this.activeKeywords.has(keyword)) {
            this.activeKeywords.delete(keyword);
            this.emit('keywordRemoved', { keyword });
        }
    }

    clearAllKeywords() {
        this.activeKeywords.clear();
        this.emit('allKeywordsCleared');
    }

    clearAllFilters() {
        this.searchTerm = '';
        this.activeKeywords.clear();
        this.emit('allFiltersCleared');
    }

    // Loading state
    setLoading(isLoading) {
        if (this.isLoading !== isLoading) {
            this.isLoading = isLoading;
            this.emit('loadingChanged', { isLoading });
        }
    }

    // Event system
    on(eventType, handler) {
        this.eventTarget.addEventListener(eventType, handler);
    }

    off(eventType, handler) {
        this.eventTarget.removeEventListener(eventType, handler);
    }

    emit(eventType, data = {}) {
        const event = new CustomEvent(eventType, { detail: data });
        this.eventTarget.dispatchEvent(event);
    }

    // Computed properties
    get hasSelection() {
        return this.selectedPolicyArea || this.selectedPhase || this.selectedPolicy;
    }

    get hasFilters() {
        return this.searchTerm || this.activeKeywords.size > 0;
    }

    get canShowPolicies() {
        return this.hasSelection || this.hasFilters;
    }

    get currentPolicyKey() {
        if (this.selectedPolicyArea && this.selectedPhase && this.selectedPolicy) {
            return `${this.selectedPolicyArea}|${this.selectedPhase}|${this.selectedPolicy}`;
        }
        return null;
    }

    get isCurrentPolicySelected() {
        const key = this.currentPolicyKey;
        return key ? this.selectedPolicies.has(key) : false;
    }

    // Serialization for debugging/persistence
    toJSON() {
        return {
            selectedPolicyArea: this.selectedPolicyArea,
            selectedPhase: this.selectedPhase,
            selectedPolicy: this.selectedPolicy,
            selectedPolicies: Array.from(this.selectedPolicies),
            searchTerm: this.searchTerm,
            activeKeywords: Array.from(this.activeKeywords),
            isLoading: this.isLoading
        };
    }

    fromJSON(data) {
        this.selectedPolicyArea = data.selectedPolicyArea || null;
        this.selectedPhase = data.selectedPhase || null;
        this.selectedPolicy = data.selectedPolicy || null;
        this.selectedPolicies = new Set(data.selectedPolicies || []);
        this.searchTerm = data.searchTerm || '';
        this.activeKeywords = new Set(data.activeKeywords || []);
        this.isLoading = data.isLoading || false;
        
        this.emit('stateRestored', data);
    }
}

// Create global state instance
export const state = new ApplicationState();

// Export for direct access if needed
export default state;