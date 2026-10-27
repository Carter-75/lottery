# 💰 Lottery Winnings Calculator

A sophisticated web application for planning and managing lottery winnings. Compare lump sum vs. annuity payment options, track spending over time, and calculate sustainable withdrawal limits to ensure your financial goals are met.

## ✨ Features

- **Dual Option Comparison**: Analyze both lump sum and annuity payment structures side-by-side
- **Sustainable Withdrawal Calculator**: Determine safe spending limits while reaching your legacy goals
- **Progress Indicators**: Life-progress bar and per-scenario balance views on the dashboard
- **Inflation & Tax Modeling**: Account for inflation, investment returns, and multiple tax rates
- **Data Export/Import**: Download calculations as CSV or JSON for backup, and import a previous JSON export to restore them
- **Accessible Design**: Semantic HTML, labelled form fields, and ARIA attributes on interactive elements
- **Real-time Validation**: Immediate feedback on form inputs, with a full validation pass (including cross-field rules such as combined tax over 100%) before a plan is created
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

**Account Summary** shows current balances for both lump sum and annuity options, plus your inflation-adjusted legacy goal. The two balances are alternative scenarios for the same winnings, tracked side by side for comparison: they are not two accounts held at once and should not be added together. When you record spending, it is deducted from the two scenarios in proportion to their balances.

**Balance Comparison** visualizes the proportion of wealth in each account type with interactive progress bars.

**Timeline Visualization** displays your progress through expected lifetime with clear indicators of years passed and remaining.

**Sustainable Withdrawal Limits** show safe spending amounts at different intervals (daily, weekly, monthly) in both future dollars (nominal) and today's purchasing power (real).

### Data Management

Export your calculations as CSV or JSON files for backup or transfer between devices, and import a previous JSON export from the Data Management section of the dashboard to restore it. All data is stored locally in your browser.

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
Both scenario balances grow at the entered APR using the stored compounding
frequency (365 by default, since the setup form does not expose it):
```
New Balance = Old Balance × (1 + APR / Frequency)^(Frequency × Days / 365)
```
Balance growth during an update is shown before tax on the gains. Tax on
interest is instead modeled inside the sustainable withdrawal calculation
below, using 2024 federal brackets for the chosen filing status plus the
entered state and local interest tax rates. Earlier versions of this README
showed a tax-on-gains deduction in the update formula that the code did not
actually apply (the stored investment tax rate is 0 since that migration).

### Sustainable Withdrawal
Uses the present value of an annuity formula adjusted for:
- Investment returns (after tax)
- Inflation
- Desired legacy amount
- Time remaining

The "nominal" figure is a level payment in future dollars. The "today's
dollars" (real) figure is a separate solve at the inflation-adjusted rate,
giving a payment whose purchasing power stays level. Earlier versions
computed the real figure by discounting the nominal payment over the full
remaining horizon, which understated it by roughly the whole inflation
factor.

### State Tax Presets
Picking a state in the setup form fills in that state's top state income tax
rate as a starting estimate for both the winnings tax and the interest tax.
These are NOT lottery withholding rates, and most states tax winnings as
ordinary income at graduated rates, so the actual bill depends on total
income. All rates remain editable. Two values in the original table were
plainly wrong and have been corrected: Delaware (winnings are taxable income
for residents, top rate 6.6%, not 0%) and Iowa (flat income tax 3.8%; the 5%
figure sometimes listed is only its withholding rate).

## 🎨 Technology

- Next.js 14 with TypeScript
- Bulma CSS with custom dark theme
- React 18 with modern hooks
- Turbopack for fast development
- react-confetti and react-use for enhanced UX

## 🔒 Privacy & Security

- **No Data Collection**: All calculation data stays in your browser
- **No Analytics**: Nothing about your inputs is tracked or sent anywhere
- **Local Storage Only**: Data persists locally, not on any server
- **Client-Side Only**: No backend, no database
- **One external request**: The page loads fonts from Google Fonts. An earlier version also sent the visitor's IP address to a third-party geolocation service (ipapi.co) to guess their state; that has been removed, and the state is now picked manually

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
