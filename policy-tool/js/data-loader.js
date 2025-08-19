/**
 * Data loading and management module
 */

import { CONFIG } from './config.js';

export class DataLoader {
    constructor() {
        this.policyData = {};
        this.expertsData = [];
        this.loadingPromises = new Map();
        this.specialConsiderationsData = {};
    }

    // Load policy data from JSON file
    async loadPolicyData() {
        if (this.loadingPromises.has('policy')) {
            return this.loadingPromises.get('policy');
        }

        const promise = this._loadPolicyDataInternal();
        this.loadingPromises.set('policy', promise);
        return promise;
    }

    async loadSpecialConsiderations() {
        if (this.loadingPromises.has('considerations')) {
            return this.loadingPromises.get('considerations');
        }

        const promise = this._loadSpecialConsiderationsInternal();
        this.loadingPromises.set('considerations', promise);
        return promise;
    }

    async _loadSpecialConsiderationsInternal() {
        try {
            const response = await fetch(CONFIG.DATA_FILES.SPECIAL_CONSIDERATIONS);
            if (!response.ok) {
                throw new Error(`Failed to load special considerations: ${response.status}`);
            }
            const data = await response.json();
            this.specialConsiderationsData = data.specialConsiderations;
            console.log('Special considerations loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading special considerations:', error);
            return false;
        }
    }

    async _loadPolicyDataInternal() {
        try {
            const response = await fetch(CONFIG.DATA_FILES.POLICY_DATA);
            if (!response.ok) {
                throw new Error(`Failed to load policy data: ${response.status}`);
            }
            const data = await response.json();

            // Flatten the structure to match original code expectations
            const flattenedData = {};
            const sourceData = data.policyAreas || data;

            Object.entries(sourceData).forEach(([policyArea, areaData]) => {
                flattenedData[policyArea] = {};
                
                if (areaData.phases) {
                    // New structure with phases wrapper
                    Object.entries(areaData.phases).forEach(([phase, phaseData]) => {
                        flattenedData[policyArea][phase] = {};
                        
                        if (phaseData.policies && Array.isArray(phaseData.policies)) {
                            // Convert policies array to object keyed by policy ID
                            phaseData.policies.forEach(policy => {
                                if (policy.id) {
                                    flattenedData[policyArea][phase][policy.id] = {
                                        policy: policy.title || policy.policy,
                                        details: policy.description || policy.details,
                                        examples: policy.examples || '',
                                        keywords: policy.keywords || []
                                    };
                                }
                            });
                        } else {
                            // Direct object structure
                            flattenedData[policyArea][phase] = phaseData;
                        }
                    });
                } else {
                    // Old structure without phases wrapper
                    flattenedData[policyArea] = areaData;
                }
            });

            this.policyData = flattenedData;
            console.log('Policy data loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading policy data:', error);
            this._showDataError('policy data', CONFIG.DATA_FILES.POLICY_DATA);
            return false;
        }
    }

    // Load experts data from JSON file
    async loadExpertsData() {
        if (this.loadingPromises.has('experts')) {
            return this.loadingPromises.get('experts');
        }

        const promise = this._loadExpertsDataInternal();
        this.loadingPromises.set('experts', promise);
        return promise;
    }

    async _loadExpertsDataInternal() {
        try {
            const response = await fetch(CONFIG.DATA_FILES.EXPERTS_DATA);
            if (!response.ok) {
                throw new Error(`Failed to load experts data: ${response.status}`);
            }
            const data = await response.json();
            this.expertsData = data.experts || data;
            console.log('Experts data loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading experts data:', error);
            this._showExpertsError();
            return false;
        }
    }

    // Load both data sources
    async loadAllData() {
        const [policyLoaded, expertsLoaded, considerationsLoaded] = await Promise.all([
            this.loadPolicyData(),
            this.loadExpertsData(),
            this.loadSpecialConsiderations()
        ]);

        return {
            policyLoaded,
            expertsLoaded,
            considerationsLoaded,
            allLoaded: policyLoaded && expertsLoaded && considerationsLoaded
        };
    }

    // Show error message for policy data loading failure
    _showDataError(dataType, filename) {
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
                    <h3 style="margin: 0 0 1rem 0;">Failed to load ${dataType}</h3>
                    <p style="margin: 0;">Please ensure '${filename}' is available and try refreshing the page.</p>
                </div>
            </div>
        `;
    }

    // Show error message in experts section
    _showExpertsError() {
        const expertsGrid = document.getElementById('expertsGrid');
        if (expertsGrid) {
            expertsGrid.innerHTML = `
                <div class="error-message" style="
                    text-align: center;
                    color: #6b7280;
                    font-size: 0.875rem;
                    padding: 1rem;
                ">
                    Unable to load expert profiles. Please check that '${CONFIG.DATA_FILES.EXPERTS_DATA}' is available.
                </div>
            `;
        }
    }

    // Getters for accessing loaded data
    getPolicyData() {
        return this.policyData;
    }

    getExpertsData() {
        return this.expertsData;
    }

    // Validation methods
    isPolicyDataLoaded() {
        return Object.keys(this.policyData).length > 0;
    }

    isExpertsDataLoaded() {
        return this.expertsData.length > 0;
    }

    // Get policy by coordinates
    getPolicy(dimension, phase, policyId) {
        return this.policyData[dimension]?.[phase]?.[policyId] || null;
    }

    // Get all policies for a dimension
    getPoliciesForDimension(dimension) {
        return this.policyData[dimension] || {};
    }

    // Get all policies for a specific dimension-phase combination
    getPoliciesForDimensionPhase(dimension, phase) {
        return this.policyData[dimension]?.[phase] || {};
    }

    getSpecialConsiderationsData() {
        return this.specialConsiderationsData;
    }

    getConsiderationsForDimensionPhase(dimension, phase) {
        const mapping = this.specialConsiderationsData.dimensionPhaseMapping;
        if (!mapping || !mapping[dimension] || !mapping[dimension][phase]) {
            return { universal: [], contextDependent: [], sectorSpecific: [] };
        }
        
        const phaseMapping = mapping[dimension][phase];
        const result = {
            universal: [],
            contextDependent: [],
            sectorSpecific: []
        };
        
        // Get universal considerations - FIXED: Look for category IDs, not item IDs
        if (phaseMapping.universal) {
            phaseMapping.universal.forEach(categoryId => {
                // Find the category by its ID in the universal data structure
                const categoryKey = Object.keys(this.specialConsiderationsData.universal)
                    .find(key => this.specialConsiderationsData.universal[key].id === categoryId);
                
                if (categoryKey) {
                    const category = this.specialConsiderationsData.universal[categoryKey];
                    if (category && category.items) {
                        // Add all items from this category to the result
                        category.items.forEach(item => {
                            result.universal.push({ 
                                ...item, 
                                categoryTitle: category.title 
                            });
                        });
                    }
                }
            });
        }
        
        // Get context-dependent considerations
        if (phaseMapping.contextDependent) {
            phaseMapping.contextDependent.forEach(contextId => {
                const context = this.specialConsiderationsData.contextDependent[contextId];
                if (context) {
                    result.contextDependent.push({
                        id: context.id,
                        title: context.title,
                        icon: context.icon,
                        items: context.items
                    });
                }
            });
        }
        
        // // Get sector-specific considerations
        // if (phaseMapping.sectorSpecific) {
        //     phaseMapping.sectorSpecific.forEach(sectorId => {
        //         const sector = this.specialConsiderationsData.sectorSpecific[sectorId];
        //         if (sector) {
        //             result.sectorSpecific.push({
        //                 id: sector.id,
        //                 title: sector.title,
        //                 items: sector.items
        //             });
        //         }
        //     });
        // }
        
        return result;
    }

    // Get statistics about loaded data
    getDataStatistics() {
        const stats = {
            totalDimensions: Object.keys(this.policyData).length,
            totalExperts: this.expertsData.length,
            policiesPerDimension: {},
            totalPolicies: 0
        };

        Object.entries(this.policyData).forEach(([dimension, phaseData]) => {
            let dimensionTotal = 0;
            Object.values(phaseData).forEach(policies => {
                dimensionTotal += Object.keys(policies).length;
            });
            stats.policiesPerDimension[dimension] = dimensionTotal;
            stats.totalPolicies += dimensionTotal;
        });

        return stats;
    }

    // Clear cached data (useful for testing or reloading)
    clearCache() {
        this.policyData = {};
        this.expertsData = [];
        this.specialConsiderationsData = {};
        this.loadingPromises.clear();
    }
}

// Create and export singleton instance
export const dataLoader = new DataLoader();

// Export the class for creating additional instances if needed
export default DataLoader;