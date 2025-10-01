#!/usr/bin/env node

/**
 * COMPREHENSIVE CSS STYLING VERIFICATION for DJ Nuff Jamz Website
 * 
 * This script ensures that ALL critical styling remains intact:
 * - Oswald fonts for all headings
 * - Glassmorphism effects for service cards  
 * - Mobile responsive layouts
 * - Custom component styling
 * 
 * Run this before builds to catch ANY styling reversions early.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../tailwind.config.js');
const SOURCE_CSS = path.join(__dirname, '../src/styles/main.css');
const COMPILED_CSS = path.join(__dirname, '../public/css/style.css');

function checkTailwindConfig() {
    console.log('🔍 Checking Tailwind configuration...');
    
    const config = fs.readFileSync(CONFIG_FILE, 'utf8');
    
    // Check that HEADINGS use Oswald (display font)
    if (config.includes("'display': ['Inter'")) {
        console.error('❌ ERROR: tailwind.config.js still uses Inter for display font!');
        console.error('   Expected: \'display\': [\'Oswald\', \'system-ui\', \'sans-serif\']');
        return false;
    }
    
    if (config.includes("'display': ['Oswald'")) {
        console.log('✅ Tailwind config correctly uses Oswald for headings (display font)');
        
        // Verify body text stays Inter (this is correct)
        if (config.includes("'body': ['Inter'")) {
            console.log('✅ Body text correctly remains Inter font');
        }
        
        return true;
    }
    
    console.error('❌ ERROR: Could not verify display font in tailwind.config.js');
    return false;
}

function checkGlassmorphismEffects() {
    console.log('🔍 Checking glassmorphism effects...');
    
    const css = fs.readFileSync(SOURCE_CSS, 'utf8');
    
    const requiredStyles = [
        'background: rgba(255, 255, 255, 0.1)',
        'backdrop-filter: blur(10px)',
        '-webkit-backdrop-filter: blur(10px)',
        'border: 1px solid rgba(255, 255, 255, 0.2)'
    ];
    
    let allPresent = true;
    requiredStyles.forEach(style => {
        if (!css.includes(style)) {
            console.error(`❌ ERROR: Missing glassmorphism style: ${style}`);
            allPresent = false;
        }
    });
    
    if (allPresent) {
        console.log('✅ Glassmorphism effects present in source CSS');
        return true;
    }
    
    return false;
}

function checkMobileResponsive() {
    console.log('🔍 Checking mobile responsive styles...');
    
    const css = fs.readFileSync(SOURCE_CSS, 'utf8');
    
    const requiredMobileStyles = [
        '@media (max-width: 768px)',
        'gap: 2.5rem !important',
        'margin-bottom: 2.5rem !important',
        'position: static !important',
        'opacity: 1 !important',
        'visibility: visible !important'
    ];
    
    let allPresent = true;
    requiredMobileStyles.forEach(style => {
        if (!css.includes(style)) {
            console.error(`❌ ERROR: Missing mobile style: ${style}`);
            allPresent = false;
        }
    });
    
    if (allPresent) {
        console.log('✅ Mobile responsive styles present');
        return true;
    }
    
    return false;
}

function checkServiceCardStyles() {
    console.log('🔍 Checking service card styles...');
    
    const css = fs.readFileSync(SOURCE_CSS, 'utf8');
    
    const requiredServiceStyles = [
        '.service-card .card',
        '.service-card .dropdown-content',
        'display: flex !important',
        'visibility: visible !important'
    ];
    
    let allPresent = true;
    requiredServiceStyles.forEach(style => {
        if (!css.includes(style)) {
            console.error(`❌ ERROR: Missing service card style: ${style}`);
            allPresent = false;
        }
    });
    
    if (allPresent) {
        console.log('✅ Service card styles present');
        return true;
    }
    
    return false;
}

function checkSourceCSS() {
    console.log('🔍 Checking source CSS...');
    
    const css = fs.readFileSync(SOURCE_CSS, 'utf8');
    
    // Check that body correctly uses font-body (not font-display)
    const bodyRegex = /body\s*{[^}]*font-body[^}]*}/;
    const bodyDisplayRegex = /body\s*{[^}]*font-display[^}]*}/;
    
    if (bodyDisplayRegex.test(css)) {
        console.error('❌ ERROR: Body element incorrectly uses font-display (Oswald)!');
        console.error('   Body should use font-body (Inter) for paragraph text');
        return false;
    }
    
    if (bodyRegex.test(css)) {
        console.log('✅ Body correctly uses font-body (Inter) for paragraph text');
    } else {
        console.error('❌ ERROR: Body element missing font-body declaration');
        return false;
    }
    
    // Check headings use font-display and uppercase
    if (css.includes('uppercase') && css.includes('font-display')) {
        console.log('✅ Headings correctly use font-display (Oswald) with uppercase');
        return true;
    }
    
    console.error('❌ ERROR: Source CSS missing uppercase styling for headings');
    return false;
}

function checkCompiledCSS() {
    console.log('🔍 Checking compiled CSS...');
    
    if (!fs.existsSync(COMPILED_CSS)) {
        console.warn('⚠️  WARNING: Compiled CSS does not exist, run npm run build first');
        return true; // Not an error, just needs building
    }
    
    const css = fs.readFileSync(COMPILED_CSS, 'utf8');
    
    if (css.includes("font-family: 'Oswald'")) {
        console.log('✅ Compiled CSS includes Oswald font overrides');
        return true;
    }
    
    console.warn('⚠️  WARNING: Compiled CSS missing Oswald font overrides');
    console.log('   This is normal if CSS needs rebuilding');
    return true; // Not a hard error
}

function checkHTMLIntegrity() {
    console.log('🔍 Checking HTML integrity...');
    
    const HTML_FILE = path.join(__dirname, '../public/index.html');
    if (!fs.existsSync(HTML_FILE)) {
        console.error('❌ ERROR: index.html not found!');
        return false;
    }
    
    const html = fs.readFileSync(HTML_FILE, 'utf8');
    
    // Check for specific corrupted CSS classes (like text-opdsx0c=-bghv2xl)
    const corruptedClassPatterns = [
        /text-opdsx0c=-bghv2xl/g,
        /class="[^"]*=[^"]*"/g  // Classes with = signs (corrupted)
    ];
    
    let foundCorruption = false;
    corruptedClassPatterns.forEach(pattern => {
        const matches = html.match(pattern);
        if (matches) {
            console.error('❌ ERROR: Found corrupted CSS classes in HTML:');
            matches.forEach(match => {
                console.error(`   ${match}`);
            });
            foundCorruption = true;
        }
    });
    
    if (foundCorruption) {
        return false;
    }
    
    // Check for glassmorphism on "Ready to Elevate" sections
    const readyElevatePattern = /Ready to Elevate Your Event\?/g;
    const readyElevateMatches = html.match(readyElevatePattern);
    if (readyElevateMatches) {
        const glassmorphismPattern = /backdrop-filter:\s*blur\(10px\)/g;
        const glassmorphismMatches = html.match(glassmorphismPattern);
        
        if (!glassmorphismMatches || glassmorphismMatches.length < readyElevateMatches.length) {
            console.error('❌ ERROR: "Ready to Elevate" sections missing glassmorphism effects!');
            console.error(`   Found ${readyElevateMatches.length} sections but only ${glassmorphismMatches ? glassmorphismMatches.length : 0} with glassmorphism`);
            return false;
        }
        
        console.log('✅ "Ready to Elevate" sections have glassmorphism effects');
    }
    
    console.log('✅ HTML integrity verified');
    return true;
}

function checkGalleryCentering() {
    console.log('🎯 Checking gallery centering styles...');
    
    const css = fs.readFileSync(SOURCE_CSS, 'utf8');
    
    const requiredStyles = [
        '#gallery {',
        'align-items: center !important',
        '#gallery .container-custom',
        'flex-direction: column !important',
        '#gallery-grid'
    ];
    
    let allPresent = true;
    requiredStyles.forEach(style => {
        if (!css.includes(style)) {
            console.error(`❌ ERROR: Missing gallery centering style: ${style}`);
            allPresent = false;
        }
    });
    
    if (allPresent) {
        console.log('✅ Gallery centering styles present in source CSS');
        return true;
    }
    
    return false;
}

function checkButtonStyling() {
    console.log('🔘 Checking button styling...');
    
    const css = fs.readFileSync(SOURCE_CSS, 'utf8');
    
    const requiredStyles = [
        '.btn-secondary {',
        'background: linear-gradient(to right, #4b5563, #374151)',
        'color: white !important'
    ];
    
    let allPresent = true;
    requiredStyles.forEach(style => {
        if (!css.includes(style)) {
            console.error(`❌ ERROR: Missing button style: ${style}`);
            allPresent = false;
        }
    });
    
    if (allPresent) {
        console.log('✅ Button styling (gradient + white text) present in source CSS');
        return true;
    }
    
    return false;
}

function checkBookingFormHeadings() {
    console.log('📋 Checking booking form heading styles...');
    
    const css = fs.readFileSync(SOURCE_CSS, 'utf8');
    
    const requiredStyles = [
        '#booking h2,',
        '#booking h3,',
        "font-family: 'Oswald', system-ui, sans-serif !important",
        'text-transform: uppercase !important',
        'font-weight: 700 !important',
        'font-size: 2.25rem !important'
    ];
    
    let allPresent = true;
    requiredStyles.forEach(style => {
        if (!css.includes(style)) {
            console.error(`❌ ERROR: Missing booking form heading style: ${style}`);
            allPresent = false;
        }
    });
    
    if (allPresent) {
        console.log('✅ Booking form heading styles (Oswald + prominent sizing) present in source CSS');
        return true;
    }
    
    return false;
}

function main() {
    console.log('🎨 DJ Nuff Jamz COMPLETE STYLING Verification');
    console.log('==============================================\n');
    
    let allGood = true;
    
    // Core Configuration
    allGood &= checkTailwindConfig();
    allGood &= checkSourceCSS();
    
    // Critical Styling Components  
    allGood &= checkGlassmorphismEffects();
    allGood &= checkMobileResponsive();
    allGood &= checkServiceCardStyles();
    allGood &= checkGalleryCentering();
    allGood &= checkButtonStyling();
    allGood &= checkBookingFormHeadings();
    
    // HTML Integrity (NEW)
    allGood &= checkHTMLIntegrity();
    
    // Compiled Output (warning only)
    checkCompiledCSS();
    
    console.log('\n' + '='.repeat(60));
    
    if (allGood) {
        console.log('🎉 ALL STYLING CONFIGURATIONS VERIFIED!');
        console.log('✅ Fonts: Oswald headings (uppercase) + Inter body text');
        console.log('✅ Glassmorphism: Service card effects present');
        console.log('✅ Mobile: Responsive layout protection active');
        console.log('✅ Service Cards: Component styling intact');
        console.log('✅ Gallery: Centering styles properly configured');
        console.log('✅ Buttons: Gradient styling with white text');
        console.log('✅ Booking Form: Prominent headings with Oswald font + proper sizing');
        console.log('✅ HTML: No corrupted classes, glassmorphism intact');
        console.log('📝 Remember to run "npm run build" to compile changes');
        process.exit(0);
    } else {
        console.error('💥 CRITICAL STYLING ISSUES DETECTED!');
        console.error('🚨 DO NOT DEPLOY - Fix all issues above first');
        console.error('🔧 Check src/styles/main.css, tailwind.config.js, and public/index.html');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { checkTailwindConfig, checkSourceCSS, checkCompiledCSS };
