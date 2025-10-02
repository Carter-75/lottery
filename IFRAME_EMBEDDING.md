# Iframe Embedding Guide for Lottery Winnings Calculator

This document explains how to embed the Professional Lottery Winnings Calculator in an iframe, specifically for integration with carter-portfolio.fyi and other authorized domains.

## Overview

The Lottery Winnings Calculator now supports iframe embedding with the following features:
- **Secure iframe headers** - Proper X-Frame-Options and CSP configuration
- **Responsive design** - Adapts to iframe container dimensions
- **Portfolio integration** - Special styling and behavior for carter-portfolio.fyi
- **Parent communication** - PostMessage API for interaction with parent page
- **Full functionality** - Complete lottery calculation features in embedded mode

## Authorized Domains

The Lottery Calculator can be embedded on the following domains:
- `https://carter-portfolio.fyi`
- `https://www.carter-portfolio.fyi`
- Local development: `http://localhost:4000`, `http://localhost:8080`, `http://localhost:3000`

## Basic Embedding

### HTML
```html
<iframe 
  src="https://your-lottery-calculator-domain.com" 
  width="100%" 
  height="700"
  frameborder="0"
  allowfullscreen
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  title="Professional Lottery Winnings Calculator">
</iframe>
```

### Recommended CSS
```css
.lottery-calculator-iframe {
  width: 100%;
  min-width: 320px;
  height: 700px;
  min-height: 600px;
  max-height: 900px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 20px 40px -12px rgba(239, 68, 68, 0.15);
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
}

/* Responsive behavior */
@media (max-width: 768px) {
  .lottery-calculator-iframe {
    height: 600px;
    border-radius: 8px;
  }
}
```

## Portfolio Integration Features

When embedded on carter-portfolio.fyi, the Lottery Calculator automatically:

### Visual Adjustments
- Applies `portfolio-iframe-mode` styling
- Hides footer and external links for clean display
- Reduces hero section padding for compact presentation
- Optimizes button and card sizes for iframe constraints

### Responsive Behavior
- Adapts layout for smaller iframe dimensions
- Maintains calculator functionality within constrained space
- Optimizes form layouts and button arrangements

### Parent Communication
The Calculator sends messages to the parent frame for:
- Load completion notifications
- Theme changes
- Calculation completion events

## PostMessage API

### Messages from Calculator to Parent
```javascript
// App loaded notification
{
  source: 'lottery-calculator',
  type: 'lottery-calculator-loaded',
  data: { 
    timestamp: Date.now(),
    theme: 'dark',
    embedMode: 'portfolio'
  }
}

// Theme change notification
{
  source: 'lottery-calculator',
  type: 'theme-changed',
  data: { theme: 'dark' | 'light' }
}

// Calculation completed
{
  source: 'lottery-calculator',
  type: 'calculation-completed',
  data: { 
    type: 'setup' | 'update',
    hasResults: true,
    timestamp: Date.now()
  }
}
```

### Messages from Parent to Calculator
```javascript
// Change theme
window.frames[0].postMessage({
  type: 'theme-change',
  data: { theme: 'dark' }
}, 'https://your-lottery-calculator-domain.com');

// Notify of resize
window.frames[0].postMessage({
  type: 'resize',
  data: { width: 800, height: 700 }
}, 'https://your-lottery-calculator-domain.com');
```

## Security Features

### Content Security Policy
The Calculator uses CSP headers that allow embedding on authorized domains:
```
frame-ancestors 'self' https://carter-portfolio.fyi https://www.carter-portfolio.fyi;
```

### Origin Validation
- Validates referrer headers for iframe requests
- Applies different styling based on parent domain
- Blocks unauthorized iframe embedding attempts

### Sandbox Attributes
Recommended iframe sandbox attributes:
- `allow-scripts` - Required for calculator functionality
- `allow-same-origin` - Required for local storage persistence
- `allow-forms` - Required for input interactions
- `allow-popups` - Required for certain features

## Implementation Example for Carter Portfolio

```html
<!DOCTYPE html>
<html>
<head>
  <title>Carter's Portfolio - Lottery Calculator Demo</title>
  <style>
    .demo-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .calculator-showcase {
      background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
      padding: 40px;
      border-radius: 16px;
      margin: 40px 0;
    }
    
    .lottery-calculator-iframe {
      width: 100%;
      height: 700px;
      border: none;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
  </style>
</head>
<body>
  <div class="demo-container">
    <h1>Professional Lottery Calculator Demo</h1>
    <p>Experience advanced financial planning tools:</p>
    
    <div class="calculator-showcase">
      <iframe 
        class="lottery-calculator-iframe"
        src="https://your-lottery-calculator-domain.com?embed=portfolio"
        allowfullscreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Lottery Calculator - Interactive Demo">
      </iframe>
    </div>
  </div>

  <script>
    // Listen for messages from Calculator iframe
    window.addEventListener('message', (event) => {
      if (event.data.source === 'lottery-calculator') {
        console.log('Calculator message:', event.data);
        
        if (event.data.type === 'lottery-calculator-loaded') {
          console.log('Lottery Calculator has loaded successfully');
        }
        
        if (event.data.type === 'calculation-completed') {
          console.log('Calculation completed:', event.data.data);
        }
      }
    });
  </script>
</body>
</html>
```

## Configuration Options

### Query Parameters
- `?embed=portfolio` - Enables portfolio-specific styling
- `?theme=dark` - Sets initial theme (dark/light)
- `?compact=true` - Enables compact mode for smaller spaces

### URL Examples
```
https://your-lottery-calculator-domain.com?embed=portfolio&theme=dark
https://your-lottery-calculator-domain.com?compact=true
```

## Calculator Features Available in Iframe

All core calculator features are available in iframe mode:

### Complete Financial Analysis
- **Lump Sum vs Annuity** - Comprehensive comparison
- **Tax Calculations** - Federal and state tax considerations
- **Investment Planning** - Portfolio allocation recommendations
- **Withdrawal Strategies** - Sustainable spending rates
- **Inflation Adjustments** - Real purchasing power analysis

### Professional Tools
- **Monte Carlo Simulations** - Risk analysis
- **Scenario Planning** - Multiple outcome modeling
- **Data Persistence** - Save and load calculations
- **Export Capabilities** - Professional reports

### Optimized for Embedding
- **Responsive Design** - Works on any screen size
- **Touch-Friendly** - Mobile and tablet optimized
- **Fast Loading** - Optimized for iframe performance
- **Professional Styling** - Clean, modern interface

## Troubleshooting

### Common Issues

1. **Iframe not loading**
   - Check that the domain is in the authorized list
   - Verify HTTPS is being used (required for secure contexts)

2. **Content appears cut off**
   - Ensure minimum height of 600px
   - Check responsive CSS rules for your viewport

3. **Calculator features not working**
   - Verify all required sandbox attributes are present
   - Check browser console for JavaScript errors

4. **Styling looks incorrect**
   - Confirm iframe has sufficient width (minimum 320px)
   - Verify parent page CSS isn't conflicting with Bulma styles

### Debug Information
The Calculator adds debug attributes to the body element when in iframe mode:
- `data-iframe="true"` - Indicates iframe mode
- `data-portfolio="true"` - Indicates portfolio embedding
- `data-theme="dark|light"` - Shows current theme

In development mode, a visual indicator appears in the top-right corner.

## Browser Support

Calculator iframe embedding is supported in:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Considerations

- First load may take 2-3 seconds for full initialization
- Calculation results are cached for faster repeated use
- Local storage works within iframe constraints
- Bulma CSS framework provides efficient styling

## Styling Framework

### Bulma CSS Integration
The Calculator uses Bulma CSS framework:
- Consistent component styling
- Responsive grid system
- Professional color scheme
- Dark/light theme support

### Custom Variables
```css
/* Professional Red-Orange Design System */
--primary-500: #ef4444;
--accent-500: #f97316;
--bg-primary: #0f0f0f;
--bg-secondary: #1a1a1a;
```

## Contact

For questions about iframe embedding or authorization requests for additional domains, please open an issue in the Lottery Calculator repository.

## Version History

- **v0.1.0+** - Full iframe embedding support added
- Comprehensive PostMessage API
- Portfolio integration features
- Enhanced security headers
- Bulma CSS compatibility