/**
 * Configuration constants for the AI Policy Tool
 */

export const CONFIG = {
    DIMENSIONS: [
        { 
            id: 'Enabling Infrastructure', 
            color: 'rgb(22, 102, 106)',
            short: 'Enabling Infrastructure',
            coloredIcon: 'assets/icons/new-icons/blue-infra-01.svg',
            whiteIcon: 'assets/icons/new-icons/blue-infra-01.svg'
        },
        { 
            id: 'Legislation & Policy', 
            color: '#cb9b3d',  
            short: 'Legislation & Policy',
            coloredIcon: 'assets/icons/new-icons/yellow-legislation-01.svg',
            whiteIcon: 'assets/icons/new-icons/yellow-legislation-01.svg'
        },
        { 
            id: 'Sustainability & Society', 
            color: '#5f0085',  
            short: 'Sustainability & Society',
            coloredIcon: 'assets/icons/new-icons/purple-sustainability-01.svg',
            whiteIcon: 'assets/icons/new-icons/purple-sustainability-01.svg'
        },
        { 
            id: 'Economy & Innovation', 
            color: '#8b2f30',
            short: 'Economic Measures and Innovation',
            coloredIcon: 'assets/icons/new-icons/red-economic-01.svg',
            whiteIcon: 'assets/icons/new-icons/red-economic-01.svg'
        },
        { 
            id: 'Research & Education', 
            color: '#005b3a', 
            short: 'Research, Education & Capacity Building',
            coloredIcon: 'assets/icons/new-icons/green-research-01.svg',
            whiteIcon: 'assets/icons/new-icons/green-research-01.svg'
        }
    ],
    
    PHASES: [
        { id: 'Analysis', short: 'Analysis' },
        { id: 'Design', short: 'Design' },
        { id: 'Implementation', short: 'Implementation' },
        { id: 'Monitoring and Evaluation', short: 'Monitoring & Evaluation' }
    ],

    UI: {
        MAX_VISIBLE_CHIPS: 3,
        ANIMATION_DURATION: 300,
        DEBOUNCE_DELAY: 300
    },

    DATA_FILES: {
        POLICY_DATA: 'policy-data.json',
        EXPERTS_DATA: 'expert-data.json',
        SPECIAL_CONSIDERATIONS: 'special-considerations.json'
    }
};

// Smart Templates for policy recommendations
export const SMART_TEMPLATES = {
    'privacy-first': {
        name: 'Privacy-First Approach',
        policies: ['P25', 'P29', 'P51', 'P52', 'P62', 'P41', 'P43'],
        triggers: ['privacy', 'data protection', 'rights', 'gdpr', 'personal data'],
        description: 'Comprehensive data protection and privacy framework',
        strategic_context: 'This approach prioritizes individual rights and data protection as the foundation for AI governance.'
    },
    'innovation-focused': {
        name: 'Innovation-First Strategy',
        policies: ['P9', 'P15', 'P16', 'P40', 'P69', 'P70', 'P89', 'P94'],
        triggers: ['innovation', 'startup', 'sandbox', 'research', 'economic', 'funding'],
        description: 'Promotes AI innovation through incentives and regulatory flexibility',
        strategic_context: 'This strategy balances oversight with economic growth, using sandboxes and incentives to drive innovation.'
    },
    'comprehensive-governance': {
        name: 'Comprehensive AI Governance',
        policies: ['P1', 'P25', 'P31', 'P36', 'P39', 'P22', 'P41', 'P73', 'P76', 'P82'],
        triggers: ['governance', 'regulation', 'compliance', 'oversight', 'framework'],
        description: 'Full-spectrum AI governance covering all implementation phases',
        strategic_context: 'This framework ensures systematic governance from analysis through monitoring and evaluation.'
    },
    'infrastructure-foundation': {
        name: 'AI Infrastructure Foundation',
        policies: ['P1', 'P4', 'P5', 'P8', 'P10', 'P17', 'P18', 'P22'],
        triggers: ['infrastructure', 'computing', 'data centers', 'cloud', 'networks'],
        description: 'Essential infrastructure for AI development and deployment',
        strategic_context: 'Strong infrastructure is the foundation that enables all other AI governance initiatives.'
    }
};

// Gap Analysis Patterns
export const GAP_ANALYSIS_PATTERNS = {
    'missing-implementation': {
        detect: (matrix) => {
            const hasPlanning = (matrix.Analysis + matrix.Design) >= 3;
            const hasImplementation = matrix.Implementation === 0;
            return hasPlanning && hasImplementation;
        },
        message: "Strong planning foundation detected",
        recommendation: "Consider adding implementation policies to operationalize your framework",
        suggestions: ['P17', 'P36', 'P73', 'P94'],
        priority: 'high'
    },
    'no-monitoring': {
        detect: (matrix) => matrix.Monitoring === 0 && matrix.total >= 4,
        message: "Comprehensive policy selection in progress",
        recommendation: "Add monitoring policies to measure effectiveness and ensure continuous improvement",
        suggestions: ['P22', 'P41', 'P82', 'P96'],
        priority: 'medium'
    },
    'single-dimension': {
        detect: (matrix) => {
            const activePolicyAreas = Object.keys(matrix.byPolicyArea).filter(dim => matrix.byPolicyArea[dim] > 0);
            return activePolicyAreas.length === 1 && matrix.total >= 3;
        },
        message: "Deep focus in one policy area established",
        recommendation: "Consider policies from other dimensions for comprehensive coverage and cross-sector synergies",
        suggestions: [], // Dynamic based on missing dimensions
        priority: 'medium'
    },
    'infrastructure-gap': {
        detect: (matrix) => {
            const hasRegulation = (matrix.byPolicyArea['Legislation & Policy'] || 0) >= 2;
            const hasInfrastructure = (matrix.byPolicyArea['Enabling Infrastructure'] || 0) === 0;
            return hasRegulation && hasInfrastructure;
        },
        message: "Regulatory framework development in progress",
        recommendation: "Infrastructure policies will help ensure your regulations can be effectively implemented",
        suggestions: ['P1', 'P8', 'P17', 'P22'],
        priority: 'high'
    }
};