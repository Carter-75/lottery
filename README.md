# 💰 Lottery Winnings Calculator

A sophisticated web application for planning and managing lottery winnings. Compare lump sum vs. annuity payment options, track spending over time, and calculate sustainable withdrawal limits to ensure your financial goals are met.

## ✨ Features

- **Dual Option Comparison**: Analyze both lump sum and annuity payment structures side-by-side
- **Sustainable Withdrawal Calculator**: Determine safe spending limits while reaching your legacy goals
- **Interactive Visualizations**: Balance comparison charts, timeline views, and progress indicators
- **Inflation & Tax Modeling**: Account for inflation, investment returns, and multiple tax rates
- **Data Export/Import**: Download calculations as JSON for backup or transfer between devices
- **Keyboard Shortcuts**: Quick navigation with `?` for help and `Ctrl+R` to reset
- **Accessible Design**: WCAG 2.2 compliant with full keyboard navigation and screen reader support
- **Real-time Validation**: Immediate feedback on all form inputs with contextual tooltips
- **Local Storage**: Your data is automatically saved in your browser, never sent to a server

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser

# Build for production
npm run build
npm start
```

**Prerequisites:** Node.js 18.x or higher

## 📖 How to Use

### Initial Setup

Enter your lottery details including total winnings, tax rates (lump sum and annuity), and investment parameters. Configure your personal details like current age, life expectancy, and legacy goals. The calculator provides contextual tooltips for each field to guide you through the process.

**Key Inputs:**
- Total winnings and tax percentages
- Investment APR (4-10% typical range)
- Current age and life expectancy
- Legacy goal amount (in today's dollars)
- Inflation and capital gains tax rates

### Tracking Over Time

After initial setup, track your spending by entering the amount spent since your last update. The calculator:
- Calculates accrued interest on both accounts
- Adds scheduled annuity payments
- Updates sustainable withdrawal limits
- Adjusts for inflation and taxes

### Understanding Results

**Account Summary** shows current balances for both lump sum and annuity options, plus your inflation-adjusted legacy goal.

**Balance Comparison** visualizes the proportion of wealth in each account type with interactive progress bars.

**Timeline Visualization** displays your progress through expected lifetime with clear indicators of years passed and remaining.

**Sustainable Withdrawal Limits** show safe spending amounts at different intervals (daily, weekly, monthly) in both future dollars (nominal) and today's purchasing power (real).

### Data Management

Export your calculations as JSON files for backup or transfer between devices. Import previously saved data to restore calculations. All data is stored locally in your browser.

### Keyboard Shortcuts

Press `?` to view all available keyboard shortcuts, including `Ctrl+R` to reset and `Esc` to close dialogs.

## 🏗️ Architecture

**Framework:** Next.js 14 with TypeScript and Bulma CSS

**Structure:**
- `src/app/` - Next.js pages and global styles
- `src/components/` - React components (forms, visualizations, utilities)
- `src/lib/` - Core logic (calculations, validation, storage, types)

**Key Components:**
- Financial calculation engine with compound interest and tax modeling
- Input validation system with real-time feedback
- Local storage management with export/import
- Accessible UI components with ARIA support
- Error boundaries for graceful failure handling

## 🧮 Financial Calculations

### Lump Sum Calculation
```
Net Lump Sum = Total Winnings × (1 - Lump Sum Tax Rate)
```

### Annuity Calculation
Annuity payments grow at 5% annually. The base payment is calculated using:
```
Base Payment = Net Annuity Value × (r) / ((1 + r)^n - 1)
where:
  r = growth rate (0.05)
  n = number of years
  Net Annuity Value = Total Winnings × (1 - Annuity Tax Rate)
```

### Investment Growth
Both balances grow based on:
```
Daily Rate = (1 + Monthly Rate)^(12/365) - 1
Monthly Rate = APR / 12
New Balance = Old Balance × (1 + Daily Rate)^Days - Tax on Gains
```

### Sustainable Withdrawal
Uses the present value of an annuity formula adjusted for:
- Investment returns (after tax)
- Inflation
- Desired legacy amount
- Time remaining

## 🎨 Technology

- Next.js 14 with TypeScript
- Bulma CSS with custom dark theme
- React 18 with modern hooks
- Turbopack for fast development
- react-confetti and react-use for enhanced UX

## 🔒 Privacy & Security

- **No Data Collection**: All data stays in your browser
- **No Analytics**: Your financial information never leaves your device
- **No Cookies**: Except for essential functionality
- **Local Storage Only**: Data persists locally, not on any server
- **Client-Side Only**: No backend, no database, no external calls

## ⚠️ Disclaimer

This calculator provides **estimates only** and should not be considered professional financial advice. Lottery winnings, tax rates, investment returns, and inflation are subject to many variables. 

**Always consult with:**
- Certified Financial Planners
- Tax Professionals
- Estate Planning Attorneys
- Investment Advisors

Before making major financial decisions.

## 📝 License

ISC License

---

**Remember**: Winning the lottery is rare, but planning for financial success is always wise! 💎
