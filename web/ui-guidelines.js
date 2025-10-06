/**
 * UI Guidelines für Todo Dashboard
 * 
 * DESIGN PRINZIPIEN:
 * - Minimalistische Farbpalette
 * - Linksbündige Texte (keine Zentrierung)
 * - Klare Hierarchie durch Typografie
 * - Konsistente Button-Styles
 */

const UI_GUIDELINES = {
    // FARBEN - Minimalistische Palette
    colors: {
        // Primärfarbe - Google Blau (behalten)
        primary: '#0B57D0',
        primaryHover: '#0a4bb8',
        primaryLight: '#e8f0fe',
        
        // Sekundärfarbe - Grau
        secondary: '#5f6368',
        secondaryHover: '#3c4043',
        secondaryLight: '#f1f3f4',
        
        // Highlight-Farbe - Nur Rot für Aufmerksamkeit
        highlight: '#d93025',
        highlightHover: '#b52d20',
        highlightLight: '#ffebee',
        
        // Neutrale Farben
        text: {
            primary: '#1f1f1f',
            secondary: '#444746',
            tertiary: '#747775',
            disabled: '#9aa0a6'
        },
        
        background: {
            primary: '#ffffff',
            secondary: '#f8f9fa',
            tertiary: '#e8f0fe'
        },
        
        border: {
            light: '#e8eaed',
            medium: '#dadce0',
            dark: '#bdc1c6'
        }
    },
    
    // TYPOGRAPHIE - Linksbündig, keine Zentrierung
    typography: {
        // Alle Texte sind linksbündig
        textAlign: 'left',
        
        // Schriftgrößen
        sizes: {
            h1: '32px',
            h2: '24px', 
            h3: '18px',
            h4: '16px',
            body: '14px',
            small: '12px',
            tiny: '10px'
        },
        
        // Schriftgewichte
        weights: {
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700'
        },
        
        // Zeilenhöhen
        lineHeights: {
            tight: '1.2',
            normal: '1.4',
            relaxed: '1.6',
            loose: '1.8'
        }
    },
    
    // BUTTONS - Nur Primary und Secondary
    buttons: {
        primary: {
            background: '#0B57D0',
            color: '#ffffff',
            hover: '#0a4bb8',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500'
        },
        
        secondary: {
            background: '#f1f3f4',
            color: '#5f6368',
            hover: '#e8eaed',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500'
        },
        
        small: {
            padding: '8px 12px',
            fontSize: '12px'
        },
        
        tiny: {
            padding: '4px 8px',
            fontSize: '10px'
        }
    },
    
    // BADGES - Nur für wichtige Status
    badges: {
        // Nur für kritische Status
        critical: {
            background: '#d93025',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: '500',
            padding: '4px 8px',
            borderRadius: '4px'
        },
        
        // Für normale Status
        normal: {
            background: '#f1f3f4',
            color: '#5f6368',
            fontSize: '10px',
            fontWeight: '500',
            padding: '4px 8px',
            borderRadius: '4px'
        }
    },
    
    // SPACING - 8px Grid System
    spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px'
    },
    
    // BORDER RADIUS
    borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px'
    },
    
    // SHADOWS - Subtile Schatten
    shadows: {
        sm: '0 1px 3px rgba(0,0,0,0.1)',
        md: '0 4px 12px rgba(0,0,0,0.15)',
        lg: '0 8px 24px rgba(0,0,0,0.2)'
    },
    
    // LAYOUT REGELN
    layout: {
        // Alle Container sind linksbündig
        containerAlign: 'left',
        
        // Keine Zentrierung von Text
        textAlign: 'left',
        
        // Konsistente Abstände
        useSpacing: true,
        
        // Maximal 2 Farben pro Komponente
        maxColors: 2
    }
};

// Export für Verwendung in anderen Dateien
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI_GUIDELINES;
}

// Globale Verfügbarkeit im Browser
if (typeof window !== 'undefined') {
    window.UI_GUIDELINES = UI_GUIDELINES;
}
