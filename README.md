# 💰 Retirement Savings Playbook

An interactive guide to help people choose the right retirement accounts — HSA, 401k, and IRA — based on their income, age, and filing status.

## Features

- **Filing status toggle** (Single / Married Filing Jointly)
- **Income slider** ($20K–$350K) with real-time bracket calculation
- **Age slider** (18–65) with years-to-retirement
- **Dynamic advice cards** for HSA, 401k (Roth vs Traditional), and IRA
- **Compound growth projections** at 7% average return
- **Expandable "Learn more"** sections with educational detail
- All numbers based on **2025 IRS limits and tax brackets**

## Deploy to GitHub Pages

1. Create a new repo on GitHub called `retirement-guide`
2. Push this code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/retirement-guide.git
   git push -u origin main
   ```
3. In your repo settings → Pages → Source: select **GitHub Actions**
4. The workflow will auto-deploy. Your site will be at:
   `https://YOUR_USERNAME.github.io/retirement-guide/`

## Local Development

```bash
npm install
npm run dev
```

## Disclaimer

This is educational information, not financial advice. Consult a professional for your specific situation. Tax brackets and contribution limits reflect 2025 IRS guidelines.
