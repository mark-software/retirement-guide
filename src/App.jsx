import { useState } from "react";

const BRACKETS_SINGLE = [
  { min: 0, max: 12400, rate: 10 },
  { min: 12400, max: 50400, rate: 12 },
  { min: 50400, max: 105700, rate: 22 },
  { min: 105700, max: 201775, rate: 24 },
  { min: 201775, max: 256225, rate: 32 },
  { min: 256225, max: 640600, rate: 35 },
  { min: 640600, max: Infinity, rate: 37 },
];

const BRACKETS_MFJ = [
  { min: 0, max: 24800, rate: 10 },
  { min: 24800, max: 100800, rate: 12 },
  { min: 100800, max: 211400, rate: 22 },
  { min: 211400, max: 403550, rate: 24 },
  { min: 403550, max: 512450, rate: 32 },
  { min: 512450, max: 768700, rate: 35 },
  { min: 768700, max: Infinity, rate: 37 },
];

function getMarginalBracket(income, filing) {
  const brackets = filing === "single" ? BRACKETS_SINGLE : BRACKETS_MFJ;
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (income > brackets[i].min) return brackets[i].rate;
  }
  return 10;
}

const HSA_LIMIT_SELF = 4400;
const HSA_LIMIT_FAMILY = 8750;
const HSA_CATCHUP = 1000;
const LIMIT_401K = 24500;
const LIMIT_401K_CATCHUP = 8000;
const LIMIT_401K_SUPER_CATCHUP = 11250;
const IRA_LIMIT = 7500;
const IRA_CATCHUP = 1100;

const ROTH_PHASEOUT_SINGLE = { start: 153000, end: 168000 };
const ROTH_PHASEOUT_MFJ = { start: 242000, end: 252000 };
const TRAD_PHASEOUT_SINGLE = { start: 81000, end: 91000 };
const TRAD_PHASEOUT_MFJ = { start: 129000, end: 149000 };

function getRothEligibility(income, filing) {
  const po = filing === "single" ? ROTH_PHASEOUT_SINGLE : ROTH_PHASEOUT_MFJ;
  if (income < po.start) return "full";
  if (income < po.end) return "partial";
  return "none";
}

function getTradDeductibility(income, filing) {
  const po = filing === "single" ? TRAD_PHASEOUT_SINGLE : TRAD_PHASEOUT_MFJ;
  if (income < po.start) return "full";
  if (income < po.end) return "partial";
  return "none";
}

function fmt(n) {
  return "$" + n.toLocaleString();
}

function compoundGrowth(annual, years, rate) {
  let total = 0;
  for (let i = 0; i < years; i++) {
    total = (total + annual) * (1 + rate);
  }
  return Math.round(total);
}

function LearnMore({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          color: "#6C63FF",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            display: "inline-block",
            transition: "transform 0.2s",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            fontSize: 10,
          }}
        >
          ▶
        </span>
        {open ? "Show less" : "Learn more"}
      </button>
      {open && (
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            lineHeight: 1.6,
            borderRadius: 12,
            padding: 16,
            backgroundColor: "#F0EFFF",
            color: "#3D3852",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function Badge({ type }) {
  const styles = {
    roth: { bg: "#E8F5E9", color: "#2E7D32", label: "→ Roth" },
    traditional: { bg: "#FFF3E0", color: "#E65100", label: "→ Traditional" },
    max: { bg: "#E8F5E9", color: "#2E7D32", label: "★ Priority #1" },
    partial: { bg: "#FFF8E1", color: "#F9A825", label: "~ Partial" },
    consider: { bg: "#E3F2FD", color: "#1565C0", label: "→ Consider both" },
    backdoor: { bg: "#F3E5F5", color: "#7B1FA2", label: "→ Backdoor Roth" },
  };
  const s = styles[type] || styles.roth;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
        backgroundColor: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

function Card({ icon, title, badge, children }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: 20,
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E6F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>{icon}</span>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#2D2A3E" }}>
            {title}
          </h3>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

function GrowthPill({ text }) {
  return (
    <p
      style={{
        fontSize: 12,
        marginTop: 8,
        padding: "6px 12px",
        borderRadius: 8,
        display: "inline-block",
        backgroundColor: "#F0FFF4",
        color: "#2E7D32",
        marginBottom: 0,
      }}
    >
      📈 {text}
    </p>
  );
}

export default function RetirementGuide() {
  const [filing, setFiling] = useState("mfj");
  const [income, setIncome] = useState(75000);
  const [age, setAge] = useState(30);

  const bracket = getMarginalBracket(income, filing);
  const yrs = Math.max(0, 65 - age);
  const rothElig = getRothEligibility(income, filing);
  const tradDeduct = getTradDeductibility(income, filing);

  const iraLimit = age >= 50 ? IRA_LIMIT + IRA_CATCHUP : IRA_LIMIT;
  const hsaLimit = filing === "mfj" ? HSA_LIMIT_FAMILY : HSA_LIMIT_SELF;
  const hsaTotal = age >= 55 ? hsaLimit + HSA_CATCHUP : hsaLimit;
  const k401 =
    age >= 60 && age <= 63
      ? LIMIT_401K + LIMIT_401K_SUPER_CATCHUP
      : age >= 50
      ? LIMIT_401K + LIMIT_401K_CATCHUP
      : LIMIT_401K;

  let rec401k = "roth";
  let text401k = "";
  if (bracket <= 12) {
    rec401k = "roth";
    text401k = `At the ${bracket}% bracket, your tax rate is low. Roth 401k lets you pay taxes now (cheap) and withdraw tax-free later.`;
  } else if (bracket === 22) {
    rec401k = "consider";
    text401k = `The 22% bracket is the crossover zone. Traditional saves you money now; Roth gives tax flexibility in retirement. Many people split or lean Traditional.`;
  } else {
    rec401k = "traditional";
    text401k = `At the ${bracket}% bracket, Traditional 401k's upfront deduction is valuable. You'll likely be in a lower bracket in retirement.`;
  }

  let recIRA, textIRA;
  if (rothElig === "none") {
    recIRA = "backdoor";
    textIRA = `Your income exceeds the Roth IRA limit. Look into a Backdoor Roth — contribute to a non-deductible Traditional IRA and convert to Roth.`;
  } else if (rothElig === "partial") {
    recIRA = "partial";
    textIRA = `You're in the Roth phase-out range. You can make a reduced contribution, or do a Backdoor Roth (contribute Traditional, then convert).`;
  } else if (bracket <= 12) {
    recIRA = "roth";
    textIRA = `Fully eligible for Roth IRA and in a low bracket — pay low taxes now, withdraw tax-free later. Clear winner.`;
  } else if (tradDeduct === "full" && bracket >= 24) {
    recIRA = "traditional";
    textIRA = `At the ${bracket}% bracket with a full Traditional IRA deduction available, the tax break now is very valuable.`;
  } else if (tradDeduct !== "full") {
    recIRA = "roth";
    textIRA = `Traditional IRA isn't fully deductible for you (employer plan + income), so Roth is better — at least withdrawals will be tax-free.`;
  } else {
    recIRA = "consider";
    textIRA = `You're eligible for both deductible Traditional and Roth IRA. At ${bracket}%, either is reasonable — Traditional for the deduction now, Roth for tax-free later.`;
  }

  const projHSA = compoundGrowth(hsaTotal, yrs, 0.07);
  const proj401k = compoundGrowth(k401, yrs, 0.07);
  const projIRA = compoundGrowth(iraLimit, yrs, 0.07);

  const sliderBg = (val, min, max) => {
    const pct = ((val - min) / (max - min)) * 100;
    return `linear-gradient(to right, #6C63FF ${pct}%, #E0DEF0 ${pct}%)`;
  };

  const poSingle = ROTH_PHASEOUT_SINGLE;
  const poMFJ = ROTH_PHASEOUT_MFJ;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(170deg, #F7F5FF 0%, #FFF9F0 50%, #F0F7FF 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "0 16px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: #6C63FF;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(108,99,255,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: #6C63FF;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(108,99,255,0.3);
        }
      `}</style>

      <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: 40, paddingBottom: 60 }}>
        <span style={{
          display: "inline-block",
          fontSize: 11,
          fontWeight: 600,
          color: "#6C63FF",
          backgroundColor: "#EEEDFF",
          borderRadius: 20,
          padding: "4px 12px",
          marginBottom: 12,
          letterSpacing: 0.3,
        }}>
          2026 IRS Limits & Brackets
        </span>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#2D2A3E", margin: "0 0 14px" }}>
          The Best Financial Move Nobody Taught Me
        </h1>
        <p style={{ fontSize: 16, color: "#433E56", lineHeight: 1.65, margin: "0 0 12px", maxWidth: 600, fontWeight: 450 }}>
          I wish someone had shown me this 10 years earlier. Three tax-advantaged accounts are
          the most powerful wealth-building tools available to regular people — and most of us
          aren't using them right.
        </p>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#E5574F", margin: "0 0 24px" }}>
          Every year you delay costs you tens of thousands in growth.
        </p>

        <div
          style={{
            borderRadius: 16,
            padding: 20,
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E6F0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            marginBottom: 24,
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#5A5670", display: "block", marginBottom: 6 }}>
              Filing Status
            </label>
            <div style={{ display: "flex", borderRadius: 12, padding: 4, gap: 4, backgroundColor: "#F0EFFF" }}>
              {[
                { id: "single", label: "Single" },
                { id: "mfj", label: "Married Filing Jointly" },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setFiling(o.id)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: filing === o.id ? "#6C63FF" : "transparent",
                    color: filing === o.id ? "#FFF" : "#6C63FF",
                    transition: "all 0.2s",
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#5A5670" }}>Annual Income</label>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#2D2A3E" }}>{fmt(income)}</span>
            </div>
            <input
              type="range" min={20000} max={350000} step={5000}
              value={income} onChange={(e) => setIncome(Number(e.target.value))}
              style={{ background: sliderBg(income, 20000, 350000) }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9994B0", marginTop: 4 }}>
              <span>$20K</span><span>$350K</span>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#5A5670" }}>Age</label>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#2D2A3E" }}>{age} yrs</span>
            </div>
            <input
              type="range" min={18} max={65} step={1}
              value={age} onChange={(e) => setAge(Number(e.target.value))}
              style={{ background: sliderBg(age, 18, 65) }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9994B0", marginTop: 4 }}>
              <span>18</span><span>65</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid #F0EFFF", fontSize: 13, color: "#5A5670" }}>
            <span>📊 Marginal bracket: <strong style={{ color: "#2D2A3E" }}>{bracket}%</strong></span>
            <span>⏳ Years to 65: <strong style={{ color: "#2D2A3E" }}>{yrs}</strong></span>
          </div>
        </div>

        <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "#9994B0", margin: "0 0 12px" }}>
          Recommended Priority Order
        </h2>

        <Card icon="🏥" title="1. Max Your HSA" badge={<Badge type="max" />}>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "#5A5670", margin: 0 }}>
            Contribute the full <strong style={{ color: "#2D2A3E" }}>{fmt(hsaTotal)}/yr</strong>{" "}
            ({filing === "mfj" ? "family" : "self-only"}{age >= 55 ? " + $1K catch-up" : ""}).{" "}
            <strong style={{ color: "#2D2A3E" }}>Invest it — don't spend it.</strong>{" "}
            Save medical receipts and reimburse yourself years later tax-free.
          </p>
          <p style={{ fontSize: 11, fontStyle: "italic", color: "#9994B0", margin: "6px 0 0" }}>Requires a High Deductible Health Plan (HDHP).</p>
          {yrs > 0 && <GrowthPill text={`Maxed at 7% for ${yrs} yrs → ~${fmt(projHSA)}`} />}
          <p style={{ fontSize: 11, fontStyle: "italic", color: "#9994B0", margin: "8px 0 0", lineHeight: 1.5 }}>
            No HDHP yet? Ask your employer about high-deductible plan options — it's worth it for the triple tax benefit. If your employer doesn't offer one, start with #2.
          </p>
          <LearnMore>
            <p style={{ margin: "0 0 8px" }}>The HSA has <strong>triple tax benefits</strong>:</p>
            <p style={{ margin: "0 0 4px" }}>✅ <strong>Tax-deductible contributions</strong> — reduces taxable income this year.</p>
            <p style={{ margin: "0 0 4px" }}>✅ <strong>Tax-free growth</strong> — no capital gains or dividend taxes.</p>
            <p style={{ margin: "0 0 4px" }}>✅ <strong>Tax-free withdrawals</strong> — for qualified medical expenses.</p>
            <p style={{ margin: "12px 0 0" }}><strong>Pro tip:</strong> Save receipts in Google Drive and reimburse yourself years later. After 65, withdraw for any purpose (just pay income tax like a Traditional IRA).</p>
          </LearnMore>
        </Card>

        <Card icon="🏢" title="2. Contribute to Your 401k" badge={<Badge type={rec401k} />}>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "#5A5670", margin: 0 }}>
            {text401k} Limit: <strong style={{ color: "#2D2A3E" }}>{fmt(k401)}/yr</strong>
            {age >= 50 ? " (includes catch-up)" : ""}. Always get your full employer match first — that's free money.
          </p>
          {yrs > 0 && <GrowthPill text={`Maxed at 7% for ${yrs} yrs → ~${fmt(proj401k)}${rec401k !== "roth" ? " (taxed on withdrawal if Traditional)" : " (tax-free if Roth)"}`} />}
          <LearnMore>
            <p style={{ margin: "0 0 8px" }}>The key choice is <strong>Roth vs. Traditional</strong>:</p>
            <p style={{ margin: "0 0 4px" }}>🔵 <strong>Roth 401k</strong> — pay taxes now, withdraw tax-free. Best when your rate is low.</p>
            <p style={{ margin: "0 0 4px" }}>🟠 <strong>Traditional 401k</strong> — deduct now, pay taxes on withdrawals. Best when your rate is high.</p>
            <p style={{ margin: "12px 0 0" }}><strong>Rule of thumb:</strong> 12% or below → Roth. 22% → toss-up. 24%+ → Traditional.</p>
            <p style={{ margin: "8px 0 0" }}><strong>Allocation tip:</strong> A target-date fund matching your retirement year is a solid default.</p>
            <p style={{ margin: "8px 0 0", fontSize: 11, fontStyle: "italic" }}>⚠️ A 1% annual fee can cost ~$200K+ over 30 years. Use low-cost index funds when available.</p>
          </LearnMore>
          <p style={{ fontSize: 11, fontStyle: "italic", color: "#9994B0", margin: "8px 0 0", lineHeight: 1.5 }}>
            No employer plan? Skip to #3 — an IRA is your best option.
          </p>
        </Card>

        <Card icon="📈" title="3. Fund an IRA" badge={<Badge type={recIRA} />}>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "#5A5670", margin: 0 }}>
            {textIRA} Limit: <strong style={{ color: "#2D2A3E" }}>{fmt(iraLimit)}/yr</strong>
            {age >= 50 ? " (includes $1K catch-up)" : ""}. Use Vanguard or Fidelity.
          </p>
          {rothElig !== "none" && (
            <p style={{ fontSize: 11, marginTop: 6, color: "#5A5670" }}>
              Roth phase-out ({filing === "single" ? "Single" : "MFJ"}): {filing === "single" ? `${fmt(poSingle.start)}–${fmt(poSingle.end)}` : `${fmt(poMFJ.start)}–${fmt(poMFJ.end)}`}
            </p>
          )}
          {yrs > 0 && <GrowthPill text={`${fmt(iraLimit)}/yr at 7% for ${yrs} yrs → ~${fmt(projIRA)}${recIRA === "roth" ? " tax-free" : ""}`} />}
          <LearnMore>
            <p style={{ margin: "0 0 8px" }}>An IRA is separate from your employer plan:</p>
            <p style={{ margin: "0 0 4px" }}>🔵 <strong>Roth IRA</strong> — tax-free withdrawals. Phase-out: {filing === "single" ? `${fmt(poSingle.start)}–${fmt(poSingle.end)}` : `${fmt(poMFJ.start)}–${fmt(poMFJ.end)} MFJ`}.</p>
            <p style={{ margin: "0 0 4px" }}>🟠 <strong>Traditional IRA</strong> — deduction phase-out (with employer plan): {filing === "single" ? `${fmt(TRAD_PHASEOUT_SINGLE.start)}–${fmt(TRAD_PHASEOUT_SINGLE.end)}` : `${fmt(TRAD_PHASEOUT_MFJ.start)}–${fmt(TRAD_PHASEOUT_MFJ.end)} MFJ`}.</p>
            <p style={{ margin: "12px 0 0" }}><strong>Backdoor Roth:</strong> If over the Roth limit, contribute to non-deductible Traditional IRA, then convert to Roth. Common and legal. Consult a tax advisor if you have existing Traditional IRA balances (pro-rata rule).</p>
            <p style={{ margin: "8px 0 0", fontSize: 11, fontStyle: "italic" }}>Contribution limit is across all IRAs combined, not per account.</p>
          </LearnMore>
          <p style={{ fontSize: 11, fontStyle: "italic", color: "#9994B0", margin: "8px 0 0", lineHeight: 1.5 }}>
            Available to everyone with earned income — no employer plan needed.
          </p>
        </Card>

        {yrs > 0 && (
          <div style={{ borderRadius: 16, padding: 20, border: "1px solid #E8E6F0", backgroundColor: "#FDFCFF", textAlign: "center", marginTop: 8, marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#9994B0", margin: "0 0 4px" }}>
              If you max all three for {yrs} years at 7% avg return
            </p>
            <p style={{ fontSize: 30, fontWeight: 700, color: "#2D2A3E", margin: "0 0 4px" }}>
              ~{fmt(projHSA + proj401k + projIRA)}
            </p>
            <p style={{ fontSize: 11, color: "#9994B0", margin: 0 }}>
              Combined HSA + 401k + IRA (before taxes on traditional withdrawals)
            </p>
          </div>
        )}

        <div style={{ textAlign: "center", paddingTop: 24, fontSize: 11, color: "#B0ADBD" }}>
          <p style={{ margin: 0 }}>
            Built with care to help people make better financial decisions.<br />
            Not financial advice — consult a professional for your situation.<br />
            Tax brackets & limits reflect 2026 IRS guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
