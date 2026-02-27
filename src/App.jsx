import { useState, useEffect, useRef, useCallback } from "react";

// ─── COLOUR PALETTES ─────────────────────
const LIGHT = {
  bg:      "#F7F8FA", card:    "#FFFFFF",  border:  "#EAECF0", border2: "#F2F4F7",
  text:    "#0F1117", sub:     "#6B7280",  muted:   "#9CA3AF", faint:   "#D1D5DB",
  green:   "#00C896", greenBg: "#E6FAF4",  greenTx: "#00875F",
  red:     "#EF4444", redBg:   "#FEF2F2",  redTx:   "#B91C1C",
  amber:   "#F59E0B", amberBg: "#FFFBEB",  amberTx: "#92400E",
  blue:    "#3B82F6", blueBg:  "#EFF6FF",  blueTx:  "#1D4ED8",
  ws:      "#00C896", wsD:     "#009970",  pill:    "#F2F4F7",
  // insight tag colours (light)
  tagAmberBg:"#FFFBEB", tagAmberBr:"#FDE68A", tagAmberTx:"#92400E",
  tagBlueBg: "#EFF6FF", tagBlueBr: "#BFDBFE", tagBlueTx: "#1D4ED8",
  tagPurBg:  "#F5F3FF", tagPurBr:  "#DDD6FE", tagPurTx:  "#6D28D9",
  tagGreenBg:"#E6FAF4", tagGreenBr:"#BBF7D0", tagGreenTx:"#00875F",
  tagRedBg:  "#FEF2F2", tagRedBr:  "#FECACA", tagRedTx:  "#B91C1C",
  // compliance banner
  compBg:  "#FFF7ED", compBr:  "#FED7AA", compTx:  "#92400E",
};
const T = LIGHT;


// ─── SEED DATA ───────────────────────────
const ACCOUNTS = {
  tfsa: {
    id: "tfsa", label: "TFSA", type: "TFSA",
    totalValue: 0, // computed
    positions: [
      { ticker:"NVDA", name:"NVIDIA Corporation",        shares:3,   avgCost:480.00, currentPrice:875.40, sector:"Technology",    assetType:"EQUITY", lastPurchaseDate:"2024-09-10" },
      { ticker:"TSLA", name:"Tesla Inc.",                shares:5,   avgCost:210.50, currentPrice:178.20, sector:"Technology",    assetType:"EQUITY", lastPurchaseDate:"2025-01-28" },
      { ticker:"AMD",  name:"Advanced Micro Devices",    shares:8,   avgCost:142.00, currentPrice:162.80, sector:"Technology",    assetType:"EQUITY", lastPurchaseDate:"2024-08-15" },
      { ticker:"VRT",  name:"Vertiv Holdings",           shares:10,  avgCost:94.50,  currentPrice:105.20, sector:"Technology",    assetType:"EQUITY", lastPurchaseDate:"2024-11-15" },
      { ticker:"AMZN", name:"Amazon.com Inc.",           shares:4,   avgCost:178.00, currentPrice:205.60, sector:"Consumer",      assetType:"EQUITY", lastPurchaseDate:"2024-07-22" },
      { ticker:"COUR", name:"Coursera Inc.",             shares:50,  avgCost:18.40,  currentPrice:9.85,   sector:"Education",     assetType:"EQUITY", lastPurchaseDate:"2025-01-15" },
      { ticker:"NIO",  name:"NIO Inc.",                  shares:100, avgCost:8.20,   currentPrice:4.35,   sector:"Auto",          assetType:"EQUITY", lastPurchaseDate:"2024-10-05" },
      { ticker:"HIMX", name:"Himax Technologies",        shares:60,  avgCost:6.50,   currentPrice:7.90,   sector:"Technology",    assetType:"EQUITY", lastPurchaseDate:"2024-06-18" },
      { ticker:"SIDU", name:"Sidus Space Inc.",          shares:200, avgCost:1.20,   currentPrice:0.85,   sector:"Aerospace",     assetType:"EQUITY", lastPurchaseDate:"2024-11-30" },
      { ticker:"AMC",  name:"AMC Entertainment",         shares:25,  avgCost:6.80,   currentPrice:3.20,   sector:"Entertainment", assetType:"EQUITY", lastPurchaseDate:"2024-08-10" },
      { ticker:"URAN", name:"Global X Uranium ETF",      shares:20,  avgCost:28.50,  currentPrice:31.20,  sector:"Energy",        assetType:"ETF",    lastPurchaseDate:"2024-10-12" },
    ]
  },
  nonreg: {
    id: "nonreg", label: "Non-Registered", type: "NON_REG",
    positions: [
      { ticker:"AAPL", name:"Apple Inc.",            shares:10, avgCost:178.40, currentPrice:227.50, sector:"Technology", assetType:"EQUITY", lastPurchaseDate:"2024-06-01" },
      { ticker:"MSFT", name:"Microsoft Corporation", shares:5,  avgCost:380.20, currentPrice:415.20, sector:"Technology", assetType:"EQUITY", lastPurchaseDate:"2024-07-15" },
      { ticker:"RY",   name:"Royal Bank of Canada",  shares:15, avgCost:132.60, currentPrice:148.60, sector:"Financials", assetType:"EQUITY", lastPurchaseDate:"2024-05-20" },
      { ticker:"ENB",  name:"Enbridge Inc.",          shares:40, avgCost:52.10,  currentPrice:59.20,  sector:"Energy",     assetType:"EQUITY", lastPurchaseDate:"2024-03-10" },
      { ticker:"IMG",  name:"First Majestic Silver",  shares:30, avgCost:7.80,   currentPrice:6.20,   sector:"Materials",  assetType:"EQUITY", lastPurchaseDate:"2025-01-20" },
    ]
  },
  crypto: {
    id: "crypto", label: "Crypto", type: "CRYPTO",
    positions: [
      { ticker:"BTC",  name:"Bitcoin",      shares:0.12, avgCost:42000, currentPrice:68400, sector:"Crypto", assetType:"CRYPTO", lastPurchaseDate:"2024-08-01" },
      { ticker:"ETH",  name:"Ethereum",     shares:1.5,  avgCost:2200,  currentPrice:3840,  sector:"Crypto", assetType:"CRYPTO", lastPurchaseDate:"2024-09-15" },
      { ticker:"SOL",  name:"Solana",       shares:8,    avgCost:95,    currentPrice:185,   sector:"Crypto", assetType:"CRYPTO", lastPurchaseDate:"2024-11-01" },
    ]
  }
};
// compute totals
Object.values(ACCOUNTS).forEach(a => {
  a.totalValue = a.positions.reduce((s,p)=>s+p.currentPrice*p.shares,0);
  a.totalCost  = a.positions.reduce((s,p)=>s+p.avgCost*p.shares,0);
});

// ─── NEWS ────────────────────────────────
const NEWS = {
  NVDA: ["NVIDIA beats Q4 estimates, data center revenue +409% YoY","Blackwell GPU demand 'staggering' says CEO Jensen Huang","Morgan Stanley raises PT to $950 on AI tailwinds"],
  TSLA: ["Tesla misses Q4 delivery estimates for second consecutive quarter","Cybertruck production ramp faces bottlenecks","Analysts split on 2025 outlook amid EV demand softening"],
  AMD:  ["AMD gains server share as EPYC adoption accelerates","MI300X AI chip seeing strong hyperscaler demand","Q4 revenue guidance in line, data center outperforms"],
  VRT:  ["Vertiv wins $400M data center cooling contract","Power management surge drives margin expansion","Goldman initiates with Buy, $130 PT"],
  AMZN: ["AWS re-acceleration drives beat across all segments","Amazon advertising +27%, now third-largest ad platform","Prime membership hits record globally"],
  COUR: ["Coursera Q3 revenue misses consensus for third quarter","AI course completions +400% but monetization weak","CEO change announced; COO takes interim role"],
  NIO:  ["NIO deliveries fall short amid pricing war","Battery-as-a-service subscribers down QoQ","Chinese EV oversupply pressures margins industry-wide"],
  HIMX: ["Himax sees automotive display recovery in H2","AR/VR display orders from major OEM confirmed","Q2 guidance raised on DDIC demand uptick"],
  SIDU: ["Sidus Space secures small government contract extension","Revenue run-rate below analyst consensus","Liquidity concerns flagged in latest 10-Q"],
  AMC:  ["AMC refinances debt, extends maturity to 2029","Box office recovery slower than expected","Analyst consensus remains Sell — balance sheet concerns"],
  AAPL: ["Apple Intelligence features drive upgrade anticipation","Services revenue hits record $26.3B in Q1 2025","China revenue headwinds persist for fourth consecutive quarter"],
  MSFT: ["Azure growth re-accelerates to 31% on AI workloads","Copilot monetization ahead of targets","OpenAI partnership deepens with new model integrations"],
  RY:   ["Royal Bank HSBC Canada integration ahead of schedule","Wealth management AUM reaches record $1.2T CAD","Q4 provisions in line with consensus"],
  ENB:  ["Enbridge US natural gas acquisition fully integrated","Mainline tolling extended to 2028","6.1% dividend yield supported by inflation-linked contracts"],
  IMG:  ["First Majestic Q3 production beat on higher silver prices","Silver at multi-year high on industrial demand","San Dimas mine reaches record throughput"],
  BTC:  ["Bitcoin ETF inflows hit monthly record","Institutional adoption accelerates ahead of halving","Regulatory clarity improving in key markets"],
  ETH:  ["Ethereum staking yield stabilizes at 4.2%","Layer-2 activity reaches all-time high","ETF approval expands institutional access"],
  SOL:  ["Solana DeFi TVL surpasses $8B","Network uptime at 99.9% for six consecutive months","Institutional validators growing rapidly"],
  URAN: ["Uranium spot price at 15-year high","Nuclear energy capacity additions accelerating globally","Kazatomprom production guidance cut 17%"],
};

// ─── COVERAGE ────────────────────────────
const COV = {
  NVDA:{level:"HIGH",n:42,d:18},  TSLA:{level:"HIGH",n:38,d:12},
  AMD: {level:"HIGH",n:35,d:22},  VRT: {level:"HIGH",n:18,d:8},
  AMZN:{level:"HIGH",n:47,d:15},  AAPL:{level:"HIGH",n:52,d:10},
  MSFT:{level:"HIGH",n:48,d:14},  RY:  {level:"HIGH",n:18,d:20},
  ENB: {level:"MEDIUM",n:11,d:38},IMG: {level:"MEDIUM",n:6,d:28},
  COUR:{level:"MEDIUM",n:9,d:45}, NIO: {level:"MEDIUM",n:12,d:30},
  AMC: {level:"MEDIUM",n:8,d:35}, HIMX:{level:"LOW",n:4,d:62},
  SIDU:{level:"LOW",n:2,d:120},
};

// ─── MOCK RESEARCH ───────────────────────
const RESEARCH = {
  NVDA:{rating:"STRONG BUY",target:"$950",range:"$780–$1,150",earnings:"Q4 2024: Beat EPS by 19%, raised FY guidance.",bull:{firm:"Goldman Sachs",text:"Data center TAM expanding faster than supply — Blackwell cycle still early."},bear:{firm:"New Street",text:"Multiple pricing 3 years of perfection; any macro slowdown hits hard."}},
  TSLA:{rating:"HOLD",target:"$215",range:"$130–$310",earnings:"Q4 2024: Missed delivery consensus 6%, margin compressed 17.6%.",bull:{firm:"Wedbush",text:"FSD monetization and energy storage provide non-vehicle upside."},bear:{firm:"UBS",text:"Core auto losing share; valuation depends on robotaxi not yet real."}},
  AMD: {rating:"BUY",target:"$195",range:"$145–$250",earnings:"Q4 2024: Data center beat 12%, MI300X ahead of schedule.",bull:{firm:"BofA",text:"EPYC share gains taking from Intel across cloud providers."},bear:{firm:"Bernstein",text:"AI GPU still 80% NVDA — AMD is number two in winner-takes-most."}},
  VRT: {rating:"BUY",target:"$130",range:"$98–$165",earnings:"Q3 2024: Beat EPS 12%, raised full-year guidance.",bull:{firm:"Goldman Sachs",text:"Power and cooling are the AI build-out bottleneck — VRT is the pick."},bear:{firm:"Morgan Stanley",text:"35x forward multiple — execution must remain flawless."}},
  AMZN:{rating:"STRONG BUY",target:"$245",range:"$200–$285",earnings:"Q4 2024: AWS re-accelerated 19%, advertising +27%.",bull:{firm:"JPMorgan",text:"AWS margin expansion and ad flywheel create durable compounding."},bear:{firm:"Redburn",text:"Regulatory risk in EU and India creates overhang on e-commerce."}},
  COUR:{rating:"HOLD",target:"$11",range:"$7–$16",earnings:"Q3 2024: Revenue missed consensus for third straight quarter.",bull:{firm:"Needham",text:"AI catalog differentiated — monetization lag is temporary."},bear:{firm:"Piper Sandler",text:"Free alternatives multiplying; paying user growth stalled."}},
  NIO: {rating:"HOLD",target:"$5.50",range:"$3–$9",earnings:"Q4 2024: Deliveries below guidance; swap margins under pressure.",bull:{firm:"CICC",text:"ONVO sub-brand addresses mass market; volume leverage possible H2."},bear:{firm:"Nomura",text:"Cash burn requires dilutive capital raise before end of 2025."}},
  HIMX:{rating:"BUY",target:"$9.50",range:"$6.50–$13",earnings:"Q2 2024: Automotive display recovery ahead of schedule.",bull:{firm:"Daiwa",text:"AR/VR design win with major OEM provides multi-year visibility."},bear:{text:"Consumer display dependent on uncertain China demand."}},
  SIDU:{rating:"HOLD",target:"$1.10",range:"$0.60–$1.80",earnings:"Q2 2024: Revenue below guidance; liquidity tightened.",bull:{text:"Small government contracts provide near-term revenue floor."},bear:{text:"Going-concern risk flagged; sub-$1M quarterly revenue."}},
  AMC: {rating:"SELL",target:"$2.50",range:"$1.50–$5",earnings:"Q3 2024: Box office recovery slower; interest expense high.",bull:{text:"Debt refinancing removes near-term bankruptcy risk."},bear:{firm:"Citi",text:"Structural theatrical decline; debt load requires perfection."}},
  AAPL:{rating:"BUY",target:"$240",range:"$200–$270",earnings:"Q1 2025: Services record $26.3B, iPhone in-line.",bull:{firm:"Morgan Stanley",text:"Apple Intelligence driving upgrade supercycle in 2025–26."},bear:{firm:"Barclays",text:"China revenue declining fourth consecutive quarter."}},
  MSFT:{rating:"STRONG BUY",target:"$480",range:"$420–$530",earnings:"Q2 FY25: Azure grew 31%, Copilot monetization ahead.",bull:{firm:"JPMorgan",text:"Enterprise AI adoption multi-year; Azure is Fortune 500 default."},bear:{firm:"KeyBanc",text:"35x forward limits upside without sustained execution."}},
  RY:  {rating:"BUY",target:"$165",range:"$145–$180",earnings:"Q4 2024: Wealth management strong, provisions in line.",bull:{firm:"TD Securities",text:"HSBC Canada acquisition adds material revenue; ahead of schedule."},bear:{firm:"CIBC",text:"Canadian housing softening creates provision risk through 2025."}},
  ENB: {rating:"BUY",target:"$66",range:"$56–$74",earnings:"Q3 2024: Mainline volumes strong, US acquisition performing.",bull:{firm:"RBC Capital",text:"6% yield with CPI-linked contracts — inflation-protected income."},bear:{firm:"Raymond James",text:"Regulatory tightening; permitting delays threaten growth capex."}},
  IMG: {rating:"BUY",target:"$8.50",range:"$6–$12",earnings:"Q3 2024: Production beat on higher silver prices.",bull:{firm:"TD Securities",text:"Silver price tailwind from industrial and green energy demand."},bear:{firm:"Scotiabank",text:"Single-mine concentration at San Dimas; Mexico jurisdiction risk."}},
  URAN:{rating:"BUY",target:"$34",range:"$28–$42",earnings:"N/A — ETF vehicle, no earnings.",bull:{text:"Nuclear capacity additions globally driving multi-year uranium demand."},bear:{text:"Kazatomprom supply return could pressure spot prices."}},
};

const SEARCH_EXTRA = [
  {ticker:"GOOG",name:"Alphabet Inc.",currentPrice:194.30,sector:"Technology",assetType:"EQUITY",avgCost:0,shares:0,lastPurchaseDate:"2024-01-01"},
  {ticker:"META",name:"Meta Platforms",currentPrice:612.80,sector:"Technology",assetType:"EQUITY",avgCost:0,shares:0,lastPurchaseDate:"2024-01-01"},
  {ticker:"SHOP",name:"Shopify Inc.",currentPrice:118.40,sector:"Technology",assetType:"EQUITY",avgCost:0,shares:0,lastPurchaseDate:"2024-01-01"},
  {ticker:"TD",name:"Toronto-Dominion Bank",currentPrice:76.40,sector:"Financials",assetType:"EQUITY",avgCost:0,shares:0,lastPurchaseDate:"2024-01-01"},
  {ticker:"CNR",name:"Canadian National Railway",currentPrice:158.20,sector:"Industrials",assetType:"EQUITY",avgCost:0,shares:0,lastPurchaseDate:"2024-01-01"},
  {ticker:"SU",name:"Suncor Energy",currentPrice:56.80,sector:"Energy",assetType:"EQUITY",avgCost:0,shares:0,lastPurchaseDate:"2024-01-01"},
];

// all positions flat for search
const ALL_POSITIONS = [
  ...Object.values(ACCOUNTS).flatMap(a=>a.positions),
  ...SEARCH_EXTRA
].filter((p,i,arr)=>arr.findIndex(x=>x.ticker===p.ticker)===i);

// ─── PURE LOGIC ──────────────────────────
function calcTax(pos, type) {
  try {
    if (type==="TFSA") return {type:"TAX_FREE",msg:"Completely tax-free under ITA §146. No capital gains reporting required."};
    if (type==="CRYPTO") return {type:"CRYPTO_NOTE",msg:"Crypto dispositions are taxable events in Canada. 50% of gains are included in taxable income under CRA guidelines."};
    const gain = (pos.currentPrice - pos.avgCost)*pos.shares;
    const days  = Math.floor((new Date()-new Date(pos.lastPurchaseDate))/86400000);
    if (gain<0 && days<30) return {type:"SUPERFICIAL_LOSS",msg:`Superficial Loss Warning (ITA §54) — selling within 30 days of last purchase (${days} days ago) may result in the loss being denied by CRA.`,amount:Math.abs(gain)};
    if (gain>=0) return {type:"CAPITAL_GAIN",msg:`Estimated gain: $${gain.toFixed(2)}. Under CRA, 50% ($${(gain*.5).toFixed(2)}) is included in taxable income.`,amount:gain};
    return {type:"CAPITAL_LOSS",msg:`Estimated loss: $${Math.abs(gain).toFixed(2)}. Can offset gains this year, carry back 3 years, or carry forward indefinitely.`,amount:Math.abs(gain)};
  } catch { return {type:"UNAVAILABLE",msg:"Tax context unavailable."}; }
}

function calcSectors(positions) {
  try {
    const total=positions.reduce((s,p)=>s+p.currentPrice*p.shares,0);
    const map={};
    positions.forEach(p=>{map[p.sector]=(map[p.sector]||0)+p.currentPrice*p.shares;});
    const allocs=Object.entries(map).map(([s,v])=>({sector:s,pct:(v/total)*100})).sort((a,b)=>b.pct-a.pct);
    const warn=allocs.find(a=>a.pct>40);
    return {allocs,hasWarn:!!warn,warnSector:warn?.sector,warnPct:warn?.pct};
  } catch {return {allocs:[],hasWarn:false};}
}

function getMarketStatus() {
  const et=new Date(new Date().toLocaleString("en-US",{timeZone:"America/New_York"}));
  const day=et.getDay(),mins=et.getHours()*60+et.getMinutes();
  if(day===0||day===6) return {s:"CLOSED",next:"Monday 9:30 AM ET"};
  if(mins>=570&&mins<580) return {s:"OPEN_EARLY"};
  if(mins>=580&&mins<960) return {s:"OPEN_NORMAL"};
  const d=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return {s:"CLOSED",next:`${day===5?"Monday":d[day+1]} 9:30 AM ET`};
}

// ─── CHART DATA ──────────────────────────
function genChartData(ticker, range) {
  const seed = ticker.split("").reduce((s,c)=>s+c.charCodeAt(0),0);
  const rng = (i,amp)=>Math.sin(i*0.3+seed)*amp + Math.cos(i*0.7+seed*0.3)*amp*0.5;
  const pos = ALL_POSITIONS.find(p=>p.ticker===ticker);
  const base = pos?.currentPrice || 100;
  const pts = {
    "1D":24,"1W":7,"1M":30,"3M":90,"1Y":52,"5Y":60
  }[range]||30;
  const data=[];
  for(let i=0;i<pts;i++){
    const trend = (i/pts)*base*0.12;
    const noise = rng(i,base*0.04);
    const price = Math.max(base*0.5, base - base*0.15 + trend + noise);
    data.push({i,v:price});
  }
  // end at current price
  data[data.length-1].v=base;
  return data;
}

// ─── HELPERS ─────────────────────────────
const gfmt  = n=>n>=1000?`$${(n/1000).toFixed(1)}k`:`$${n.toFixed(2)}`;
const fmtL  = n=>`$${n.toLocaleString("en-CA",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const gp    = (c,a)=>(((c-a)/a)*100).toFixed(1);
const isPos = (c,a)=>c>=a;
const rCol  = r=>({"STRONG BUY":T.green,"BUY":"#22C55E","HOLD":T.sub,"SELL":T.red,"N/A":T.muted}[r]||T.muted);
const covSt = l=>({"HIGH":{dot:"#22C55E",tx:T.greenTx,bg:T.greenBg,lbl:"Well covered"},"MEDIUM":{dot:T.amber,tx:T.amberTx,bg:T.amberBg,lbl:"Moderate coverage"},"LOW":{dot:T.red,tx:T.redTx,bg:T.redBg,lbl:"Limited coverage"}}[l]||{dot:T.muted,tx:T.sub,bg:T.pill,lbl:"Unknown"});
const SC = ["#00C896","#6366F1","#F59E0B","#3B82F6","#EC4899","#8B5CF6","#14B8A6","#F97316"];

function inAccount(ticker) {
  for (const a of Object.values(ACCOUNTS)) {
    if (a.positions.find(p=>p.ticker===ticker)) return a;
  }
  return null;
}

function buildSysPrompt(pos, acctType, news, isOwned) {
  const nc = (news||[]).filter(Boolean);
  const newsCtx = nc.length ? `\n\nWealthsimple News:\n${nc.map(h=>`- ${h}`).join("\n")}` : "";
  const ctx = isOwned
    ? `${pos.ticker} | ${pos.name} | Acct: ${acctType} | ${pos.shares} shares | Avg $${pos.avgCost} | Now $${pos.currentPrice} | Last bought: ${pos.lastPurchaseDate}`
    : `${pos.ticker} | ${pos.name} | $${pos.currentPrice} | Not in portfolio`;
  return `ROLE: You are Simple Research, an AI assistant in Wealthsimple. Surface analyst data, Canadian tax context. NOT a financial advisor.
CONTEXT: ${ctx}${newsCtx}
FORMAT: Consensus rating, price target+range, analyst count, earnings (1 sentence), bull+bear with firm names. Source before data. "analysts say."
HARD REFUSALS: No buy/sell recommendations, no personalized tax advice.
ADVICE CREEP: "should I buy/sell" → research then: "I can surface context, but the decision is yours — by design. For personalized advice, Wealthsimple advisors are available."
CANADIAN TAX: TFSA tax-free (ITA 146). Non-reg 50% inclusion. Superficial loss 30d (ITA 54). Crypto dispositions taxable.
DISCLAIMER: End every response: "This is informational only and does not constitute financial, investment, or tax advice."`;
}

// ─── RESEARCH PANEL PROMPT ───────────────
function buildResearchPrompt(pos, acctType, news, isOwned) {
  const nc = (news||[]).filter(Boolean);
  const newsCtx = nc.length ? `\n\nPlatform news:\n${nc.map(h=>`- ${h}`).join("\n")}` : "";
  const posCtx = isOwned
    ? `${pos.ticker} (${pos.name}) | Account: ${acctType} | ${pos.shares} shares | Avg cost $${pos.avgCost} | Current $${pos.currentPrice} | Last bought: ${pos.lastPurchaseDate}`
    : `${pos.ticker} (${pos.name}) | Current $${pos.currentPrice} | Not in portfolio`;
  return `You are Simple Research, a financial research assistant inside Wealthsimple. NOT a financial advisor.

USER POSITION: ${posCtx}${newsCtx}

TASK: Fetch current analyst data for ${pos.ticker} using web search. Return a structured research summary with:
1. Consensus rating (STRONG BUY / BUY / HOLD / SELL)
2. Average price target with range (e.g. "$142.00 (Range: $110 – $175)")
3. Analyst count (e.g. "Based on 38 analysts")
4. Last earnings — one sentence (beat/miss, key metric)
5. Bull case — name the firm and their specific thesis (e.g. "Morgan Stanley (Buy, $175 PT): data centre demand accelerating...")
6. Bear case — name the firm and their specific risk (e.g. "Bernstein (Hold, $118 PT): margin compression risk...")

HARD RULES:
- Source attribution before the data, always
- No buy/sell recommendations
- End with: "This is informational only and does not constitute financial, investment, or tax advice."
- Then output CITATIONS block:
[CITATION: Firm | Claim | Date]
Include 3-4 citations. Always include consensus source and one each for bull/bear firm.`;
}

// ─── CITATION PARSER ─────────────────────
function parseCitations(text) {
  const lines = text.split('\n');
  const citations = [];
  lines.forEach(line => {
    const m = line.match(/\[CITATION:\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\]/);
    if (m) citations.push({ source: m[1].trim(), claim: m[2].trim(), date: m[3].trim() });
  });
  return citations;
}
function stripCitations(text) {
  return text.replace(/\[CITATION:[^\]]+\]/g, '').replace(/\nCITATIONS:\n?/g, '').trim();
}

// ─── PRICE CHART ─────────────────────────
function PriceChart({ ticker, color }) {
  const [range, setRange] = useState("1M");
  const data = genChartData(ticker, range);
  const W=360, H=140, PAD=8;
  const vals=data.map(d=>d.v);
  const minV=Math.min(...vals), maxV=Math.max(...vals);
  const span=maxV-minV||1;
  const px=(i)=>PAD+(i/(data.length-1))*(W-PAD*2);
  const py=(v)=>H-PAD-(((v-minV)/span)*(H-PAD*2));
  const pts=data.map(d=>`${px(d.i)},${py(d.v)}`).join(" ");
  const fillPts=`${px(0)},${H} ${pts} ${px(data.length-1)},${H}`;
  const startV=data[0].v, endV=data[data.length-1].v;
  const up = endV>=startV;
  const chgPct=(((endV-startV)/startV)*100).toFixed(2);
  const RANGES=["1D","1W","1M","3M","1Y","5Y"];
  return (
    <div>
      <div style={{fontSize:12,color:up?T.green:T.red,fontWeight:600,marginBottom:4,paddingLeft:2}}>
        {up?"+":""}{chgPct}% {range==="1D"?"today":range==="1W"?"past week":range==="1M"?"past month":range==="3M"?"past 3 months":range==="1Y"?"past year":"past 5 years"}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:120,display:"block"}}>
        <defs>
          <linearGradient id={`g_${ticker}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={fillPts} fill={`url(#g_${ticker})`}/>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
        <circle cx={px(data.length-1)} cy={py(endV)} r="3.5" fill={color}/>
      </svg>
      <div style={{display:"flex",gap:2,marginTop:4}}>
        {RANGES.map(r=>(
          <button key={r} onClick={()=>setRange(r)}
            style={{flex:1,padding:"5px 0",background:range===r?T.text:"transparent",border:`1px solid ${range===r?T.text:T.border}`,borderRadius:6,fontSize:11,fontWeight:range===r?700:500,color:range===r?"#fff":T.sub,cursor:"pointer",transition:"all 0.15s"}}>
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── TAX DISPLAY ─────────────────────────
function TaxPanel({ result }) {
  if (!result) return null;
  const S = {
    TAX_FREE:       {bg:T.greenBg,br:"#BBF7D0",col:T.greenTx,icon:"✓",lbl:"Tax-Free (TFSA — ITA §146)"},
    CRYPTO_NOTE:    {bg:T.amberBg,br:"#FDE68A",col:T.amberTx,icon:"ℹ",lbl:"Crypto Taxable Event"},
    CAPITAL_GAIN:   {bg:T.blueBg, br:"#BFDBFE",col:T.blueTx, icon:"ℹ",lbl:"Estimated Capital Gain"},
    CAPITAL_LOSS:   {bg:T.amberBg,br:"#FDE68A",col:T.amberTx,icon:"ℹ",lbl:"Estimated Capital Loss"},
    SUPERFICIAL_LOSS:{bg:T.redBg, br:"#FECACA",col:T.redTx,  icon:"⚠",lbl:"Superficial Loss Warning (ITA §54)"},
    UNAVAILABLE:    {bg:T.pill,   br:T.border, col:T.sub,    icon:"–",lbl:"Tax Context Unavailable"},
  };
  const s = S[result.type]||S.UNAVAILABLE;
  return (
    <div style={{padding:"12px 14px",background:s.bg,border:`1px solid ${s.br}`,borderRadius:10,marginTop:12}}>
      <div style={{fontSize:11,fontWeight:700,color:s.col,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>{s.icon} {s.lbl}</div>
      <div style={{fontSize:12,color:s.col,lineHeight:1.65}}>{result.msg}</div>
      <div style={{fontSize:11,color:T.muted,marginTop:6}}>Informational only — consult a tax professional.</div>
    </div>
  );
}

// ─── TIMING ──────────────────────────────
function TimingBadge() {
  const s = getMarketStatus();
  if (s.s==="OPEN_EARLY") return <div style={{padding:"7px 12px",background:T.amberBg,border:`1px solid #FDE68A`,borderRadius:8,fontSize:12,color:T.amberTx,lineHeight:1.5}}>⚡ <strong>Market just opened</strong> — spreads widest in first 10 min.</div>;
  if (s.s==="OPEN_NORMAL") return <div style={{padding:"7px 12px",background:T.greenBg,border:`1px solid #BBF7D0`,borderRadius:8,fontSize:12,color:T.greenTx,lineHeight:1.5}}>● <strong>Market open</strong></div>;
  return <div style={{padding:"7px 12px",background:T.pill,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,color:T.sub,lineHeight:1.5}}>○ <strong>Markets closed</strong> — Next: {s.next}</div>;
}

// ─── TICKER DETAIL SCREEN ────────────────
function TickerScreen({ ticker, acctType, onBack }) {
  const pos = ALL_POSITIONS.find(p=>p.ticker===ticker) || {ticker,name:ticker,currentPrice:0,avgCost:0,shares:0,assetType:"EQUITY",lastPurchaseDate:"2024-01-01",sector:"Unknown"};
  const acct = inAccount(ticker);
  const isOwned = !!acct;
  const news = NEWS[ticker]||[];
  const cov  = COV[ticker];
  const cs   = cov ? covSt(cov.level) : null;
  const res  = RESEARCH[ticker];
  const isCrypto = pos.assetType==="CRYPTO";
  const isETF    = pos.assetType==="ETF";
  const effectiveAcctType = acct?.type || acctType || "NON_REG";

  const [loadingRes,  setLoadingRes]  = useState(!isCrypto&&!isETF);
  const [showRes,     setShowRes]     = useState(false);
  const [liveRes,     setLiveRes]     = useState(null);   // live API response text
  const [resError,    setResError]    = useState(false);
  const [taxResult,   setTaxResult]   = useState(null);
  const [showTax,     setShowTax]     = useState(false);
  const [chatOpen,    setChatOpen]    = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState("");
  const [sending,     setSending]     = useState(false);
  const [showTrade,   setShowTrade]   = useState(false);
  const endRef = useRef(null);

  const pnl = isOwned ? (pos.currentPrice - pos.avgCost)*pos.shares : 0;
  const pct = isOwned ? gp(pos.currentPrice, pos.avgCost) : null;
  const up  = isOwned ? isPos(pos.currentPrice, pos.avgCost) : true;
  const chartColor = up ? T.green : T.red;

  // ── Live research fetch — real Claude API call with web search ──
  useEffect(()=>{
    if(isCrypto||isETF){setLoadingRes(false);return;}
    setLoadingRes(true);
    setLiveRes(null);
    setResError(false);

    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 12000);

    const sysPrompt = buildResearchPrompt(pos, effectiveAcctType, news, isOwned);

    // Prompt caching: system prompt is marked cache_control so Anthropic caches it
    // at 90% reduced cost on repeat calls for the same ticker in the same session
    fetch("/api/claude", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      signal: controller.signal,
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens:1200,
        system:[{
          type:"text",
          text: sysPrompt,
          cache_control:{ type:"ephemeral" }   // prompt caching — reduces input token cost ~90%
        }],
        tools:[{ type:"web_search_20250305", name:"web_search" }],
        messages:[{ role:"user", content:`Fetch current analyst research for ${ticker}. Use web search to find the latest consensus rating, price targets, bull case, and bear case. Be specific about which firms said what.` }]
      })
    })
    .then(r=>r.json())
    .then(d=>{
      clearTimeout(timeout);
      const raw = d.content?.filter(b=>b.type==="text").map(b=>b.text).join("") || "";
      if(raw) { setLiveRes(raw); setShowRes(true); }
      else setResError(true);
    })
    .catch(()=>{ clearTimeout(timeout); setResError(true); setShowRes(true); })
    .finally(()=>setLoadingRes(false));

    return ()=>{ controller.abort(); clearTimeout(timeout); };
  },[ticker]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  const sendChat = async () => {
    const text=input.trim();
    if(!text||sending) return;
    setInput("");
    const um={role:"user",content:text};
    const msgs=[...messages,um];
    setMessages(msgs);
    setSending(true);
    try {
      const sysPrompt = buildSysPrompt(pos, effectiveAcctType, news, isOwned);
      const r=await fetch("/api/claude",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          // Prompt caching: system prompt cached server-side — ~90% cheaper on repeat turns
          system:[{ type:"text", text:sysPrompt, cache_control:{ type:"ephemeral" } }],
          tools:[{ type:"web_search_20250305", name:"web_search" }],
          messages:msgs
        })
      });
      const d=await r.json();
      const raw=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"Research unavailable.";
      const citations=parseCitations(raw);
      const reply=stripCitations(raw);
      setMessages(prev=>[...prev,{role:"assistant",content:reply,citations}]);
    } catch { setMessages(prev=>[...prev,{role:"assistant",content:"Unable to connect. Please try again."}]); }
    setSending(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:T.bg,overflowY:"auto",zIndex:300,display:"flex",flexDirection:"column"}}>
      <style>{`@keyframes sUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      {/* Header */}
      <div style={{position:"sticky",top:0,background:T.card,borderBottom:`1px solid ${T.border}`,padding:"13px 16px",display:"flex",alignItems:"center",gap:10,zIndex:10,flexShrink:0}}>
        <button onClick={onBack} style={{background:"none",border:"none",padding:"6px 4px",cursor:"pointer",fontSize:18,color:T.text,lineHeight:1}}>←</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700,color:T.text,letterSpacing:"-0.01em"}}>{ticker}</div>
          <div style={{fontSize:11,color:T.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>{pos.name}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {!isOwned && <span style={{fontSize:10,padding:"2px 7px",background:T.pill,borderRadius:12,color:T.sub,fontWeight:600}}>NOT IN PORTFOLIO</span>}
          <button style={{background:"none",border:"none",padding:"4px",cursor:"pointer",fontSize:18,color:T.muted}}>☆</button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{flex:1,overflowY:"auto",paddingBottom:90}}>

        {/* Price hero */}
        <div style={{padding:"16px 16px 0",background:T.card,borderBottom:`1px solid ${T.border2}`}}>
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:2}}>
            <div>
              <div style={{fontSize:30,fontWeight:800,letterSpacing:"-0.03em",color:T.text}}>${pos.currentPrice.toFixed(2)}</div>
              <div style={{fontSize:12,color:T.sub,marginTop:1}}>USD{isCrypto?"":" · "+pos.sector}</div>
            </div>
            {isOwned && (
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:700,color:up?T.green:T.red}}>{up?"+":""}{pct}%</div>
                <div style={{fontSize:11,color:up?T.green:T.red,opacity:0.8}}>{up?"+":""}{gfmt(pnl)} total</div>
                <div style={{fontSize:10,color:T.muted}}>{pos.shares} shares · avg ${pos.avgCost.toFixed(2)}</div>
              </div>
            )}
          </div>
          <div style={{paddingBottom:14}}>
            <PriceChart ticker={ticker} color={chartColor}/>
          </div>
        </div>

        {/* Stats row */}
        {isOwned && (
          <div style={{padding:"12px 16px",background:T.card,borderBottom:`1px solid ${T.border2}`,display:"flex",gap:0}}>
            {[
              {lbl:"Market Value",val:fmtL(pos.currentPrice*pos.shares)},
              {lbl:"Book Value",val:fmtL(pos.avgCost*pos.shares)},
              {lbl:"Total Return",val:`${up?"+":""}${pct}%`,col:up?T.green:T.red},
            ].map((item,i)=>(
              <div key={i} style={{flex:1,borderRight:i<2?`1px solid ${T.border2}`:"none",paddingLeft:i>0?12:0}}>
                <div style={{fontSize:10,color:T.muted,marginBottom:2}}>{item.lbl}</div>
                <div style={{fontSize:13,fontWeight:600,color:item.col||T.text}}>{item.val}</div>
              </div>
            ))}
          </div>
        )}

        {/* News */}
        {news.filter(Boolean).length>0 && (
          <div style={{margin:"10px 16px 0",padding:"12px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:10}}>
            <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Wealthsimple News</div>
            {news.filter(Boolean).map((h,i)=>(
              <div key={i} style={{fontSize:12,color:T.sub,lineHeight:1.6,paddingLeft:10,borderLeft:`2px solid ${T.border}`,marginBottom:i<news.length-1?7:0}}>{h}</div>
            ))}
          </div>
        )}

        {/* Crypto coming soon */}
        {isCrypto && (
          <div style={{margin:"10px 16px 0",padding:"18px 16px",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:7}}>🔬</div>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:5}}>Crypto Research Coming Soon</div>
            <div style={{fontSize:12,color:T.sub,lineHeight:1.6}}>Analyst coverage, on-chain metrics, and staking yield data are in development for V2. Tax context still applies.</div>
          </div>
        )}

        {/* ETF coming soon */}
        {isETF && (
          <div style={{margin:"10px 16px 0",padding:"18px 16px",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:7}}>📊</div>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:5}}>ETF Research Coming Soon</div>
            <div style={{fontSize:12,color:T.sub,lineHeight:1.6}}>Expense ratio, benchmark tracking, and holdings breakdown are in development. Tax context still applies.</div>
          </div>
        )}

        {/* Research panel */}
        {!isCrypto && !isETF && (
          <div style={{margin:"10px 16px 0",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden"}}>
            {/* Coverage badge */}
            {cs && (
              <div style={{padding:"8px 14px",background:cs.bg,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:cs.dot}}/>
                  <span style={{fontSize:11,fontWeight:700,color:cs.tx}}>{cs.lbl}</span>
                </div>
                {cov&&<span style={{fontSize:11,color:cs.tx,opacity:0.7}}>{cov.n} analysts · {cov.d}d ago</span>}
              </div>
            )}
            <div style={{padding:"13px 14px"}}>
              {loadingRes ? (
                <>
                  <div style={{fontSize:10,color:T.muted,marginBottom:10}}>Fetching analyst data...</div>
                  {[70,50,85].map((w,i)=>(
                    <div key={i} style={{height:10,borderRadius:5,background:T.border,width:`${w}%`,marginBottom:8,animation:"pulse 1.3s ease infinite",animationDelay:`${i*0.15}s`}}/>
                  ))}
                  <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
                </>
              ) : resError ? (
                <div style={{fontSize:13,color:T.sub,textAlign:"center",padding:"10px 0",lineHeight:1.7}}>
                  Research unavailable right now — markets move fast and so do our servers.<br/>
                  <span style={{fontSize:11,color:T.muted}}>Try again in a moment.</span>
                </div>
              ) : liveRes ? (
                <>
                  {/* ── Live research: render parsed citations + clean text ── */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{fontSize:10,color:T.muted,display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:T.green}}/>
                      Live · {new Date().toLocaleDateString("en-CA")}
                    </div>
                    <div style={{fontSize:9,padding:"2px 7px",background:T.greenBg,borderRadius:8,color:T.greenTx,fontWeight:600,border:`1px solid #BBF7D0`}}>
                      Web search grounded
                    </div>
                  </div>
                  <div style={{fontSize:12,color:T.text,lineHeight:1.75,whiteSpace:"pre-wrap",marginBottom:12}}>
                    {stripCitations(liveRes)}
                  </div>
                  {/* Citations from live response */}
                  {parseCitations(liveRes).length>0&&(
                    <div style={{borderTop:`1px solid ${T.border2}`,paddingTop:10,marginTop:4}}>
                      <div style={{fontSize:9,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Sources</div>
                      <div style={{display:"flex",flexDirection:"column",gap:4}}>
                        {parseCitations(liveRes).map((c,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,padding:"6px 8px",background:T.bg,borderRadius:7,borderLeft:`2px solid ${T.ws}`}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:10,fontWeight:600,color:T.text}}>{c.source}</div>
                              <div style={{fontSize:10,color:T.sub,lineHeight:1.4,marginTop:1}}>{c.claim}</div>
                              <div style={{fontSize:9,color:T.muted,marginTop:2}}>{c.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{fontSize:13,color:T.sub,textAlign:"center",padding:"10px 0"}}>No analyst data found for {ticker}.</div>
              )}

              {/* ── Inline chat button — right below bull/bear ── */}
              {(res || (!loadingRes && !isCrypto && !isETF)) && (
                <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${T.border2}`}}>
                  <button onClick={()=>setChatOpen(o=>!o)}
                    style={{width:"100%",padding:"11px 14px",background:chatOpen?T.ws:T.greenBg,border:`1.5px solid ${chatOpen?T.ws:T.green+"44"}`,borderRadius:10,color:chatOpen?T.card:T.greenTx,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:9,transition:"all 0.18s"}}>
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H6l-4 2V3z" stroke={chatOpen?T.card:T.greenTx} strokeWidth="1.5" fill={chatOpen?"rgba(255,255,255,0.25)":"none"}/>
                    </svg>
                    <span style={{flex:1,textAlign:"left"}}>Ask Simple Research about {ticker}</span>
                    <span style={{fontSize:14,lineHeight:1,opacity:0.7}}>{chatOpen?"↓":"↑"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timing */}
        <div style={{margin:"10px 16px 0"}}><TimingBadge/></div>

        {/* Simulate Sell — now below timing, after chat */}
        {isOwned && (
          <div style={{margin:"10px 16px 0"}}>
            <button onClick={()=>{setTaxResult(calcTax(pos,effectiveAcctType));setShowTax(true);}}
              style={{width:"100%",padding:"13px",background:showTax?T.pill:T.bg,border:`1px solid ${T.border}`,borderRadius:10,color:showTax?T.sub:T.text,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all 0.2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:15}}>💸</span>
                <span>Simulate Sell — See Tax Impact</span>
              </div>
              <span style={{fontSize:13,color:T.muted}}>{showTax?"▲":"▼"}</span>
            </button>
            {showTax&&<TaxPanel result={taxResult}/>}
          </div>
        )}

        {/* Compliance notice — prominent */}
        <div style={{margin:"10px 16px 0",padding:"12px 14px",background:T.compBg,border:`1.5px solid ${T.compBr}`,borderRadius:10,display:"flex",alignItems:"flex-start",gap:8}}>
          <span style={{fontSize:14,flexShrink:0}}>⚠️</span>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:T.compTx,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:2}}>Not financial or investment advice</div>
            <div style={{fontSize:11,color:T.compTx,lineHeight:1.55,opacity:0.85}}>Analyst data is sourced from third parties and provided for informational purposes only. It does not constitute financial, investment, or tax advice. Consult a qualified advisor before acting.</div>
          </div>
        </div>

        <div style={{height:96}}/>
      </div>

      {/* Floating chat modal — slides up from bottom above Trade button */}
      {chatOpen && (
        <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,zIndex:30,padding:"0 0",animation:"sUp 0.22s ease"}}>
          <div style={{margin:"0 12px",background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden",boxShadow:"0 -4px 24px rgba(0,0,0,0.12)"}}>
            {/* Chat header */}
            <div style={{padding:"12px 14px 10px",borderBottom:`1px solid ${T.border2}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:T.card}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:T.ws}}/>
                <span style={{fontSize:13,fontWeight:700,color:T.text}}>Simple Research · {ticker}</span>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <button onClick={()=>setChatOpen(false)}
                  style={{background:"none",border:"none",fontSize:18,color:T.muted,cursor:"pointer",lineHeight:1,padding:"2px 4px"}}>−</button>
                <button onClick={()=>setChatOpen(false)}
                  style={{background:"none",border:"none",fontSize:16,color:T.muted,cursor:"pointer",lineHeight:1,padding:"2px 4px"}}>✕</button>
              </div>
            </div>
            {/* Messages */}
            <div style={{height:220,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:8,background:T.bg}}>
              {messages.length===0&&(
                <div style={{fontSize:12,color:T.muted,textAlign:"center",padding:"20px 0",lineHeight:1.7}}>
                  Ask about analyst views, tax impact, or portfolio context.<br/>
                  <span style={{fontSize:11,color:T.faint}}>Context only — you make the call.</span>
                </div>
              )}
              {messages.map((m,i)=>(
                <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"92%",display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{padding:"8px 11px",borderRadius:m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",background:m.role==="user"?T.ws:T.card,border:m.role==="assistant"?`1px solid ${T.border2}`:"none",color:m.role==="user"?T.card:T.text,fontSize:12,lineHeight:1.65,whiteSpace:"pre-wrap"}}>
                    {m.content}
                    {m.role==="assistant"&&m.content.includes("decision is yours")&&(
                      <button style={{display:"block",marginTop:7,padding:"5px 10px",background:T.greenBg,border:`1px solid #BBF7D0`,borderRadius:6,color:T.greenTx,fontSize:11,cursor:"pointer",fontWeight:600}}>Talk to a Wealthsimple advisor →</button>
                    )}
                  </div>
                  {/* Citation chips — only on assistant messages with citations */}
                  {m.role==="assistant"&&m.citations&&m.citations.length>0&&(
                    <div style={{display:"flex",flexDirection:"column",gap:3,paddingLeft:2}}>
                      <div style={{fontSize:9,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:1}}>Sources</div>
                      {m.citations.map((c,ci)=>(
                        <div key={ci} style={{display:"flex",alignItems:"flex-start",gap:5,padding:"5px 8px",background:T.card,border:`1px solid ${T.border}`,borderRadius:7,borderLeft:`2px solid ${T.ws}`}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:10,fontWeight:600,color:T.text,marginBottom:1}}>{c.source}</div>
                            <div style={{fontSize:10,color:T.sub,lineHeight:1.4}}>{c.claim}</div>
                            <div style={{fontSize:9,color:T.muted,marginTop:2}}>{c.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {sending&&<div style={{alignSelf:"flex-start",padding:"8px 12px",background:T.card,border:`1px solid ${T.border2}`,borderRadius:"12px 12px 12px 2px",fontSize:12,color:T.sub}}>Researching...</div>}
              <div ref={endRef}/>
            </div>
            {/* Input */}
            <div style={{borderTop:`1px solid ${T.border2}`,padding:"9px 11px",display:"flex",gap:7,background:T.card}}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Ask about analyst views or tax..."
                style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 11px",color:T.text,fontSize:12,outline:"none",fontFamily:"inherit"}}
                onFocus={e=>e.target.style.borderColor=T.ws} onBlur={e=>e.target.style.borderColor=T.border}/>
              <button onClick={sendChat} disabled={sending||!input.trim()}
                style={{padding:"8px 14px",background:input.trim()?T.ws:T.border,border:"none",borderRadius:8,color:input.trim()?T.card:T.sub,cursor:input.trim()?"pointer":"default",fontSize:15,fontWeight:700}}>↑</button>
            </div>
            {/* Compliance footer */}
            <div style={{padding:"7px 12px",borderTop:`1px solid ${T.border2}`,background:T.compBg}}>
              <div style={{fontSize:10,fontWeight:600,color:T.compTx}}>⚠️ Not financial advice — informational only. Consult a qualified advisor.</div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Trade button */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,padding:"12px 16px 20px",background:T.card,borderTop:`1px solid ${T.border}`,zIndex:20}}>
        <button onClick={()=>setShowTrade(true)}
          style={{width:"100%",padding:"14px",background:T.text,border:"none",borderRadius:14,color:T.card,fontSize:15,fontWeight:700,cursor:"pointer",letterSpacing:"-0.01em"}}>
          Trade
        </button>
      </div>

      {/* Trade modal stub */}
      {showTrade && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowTrade(false)}>
          <div style={{background:T.card,borderRadius:"16px 16px 0 0",padding:"20px 20px 40px",width:"100%",maxWidth:430,animation:"sUp 0.22s ease"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:36,height:4,background:T.border,borderRadius:2,margin:"0 auto 16px"}}/>
            <div style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:4}}>Trade {ticker}</div>
            <div style={{fontSize:13,color:T.sub,marginBottom:20,lineHeight:1.6}}>Trading is handled by Wealthsimple's execution layer. Simple Research provides research context only and does not execute trades.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <button style={{padding:"13px",background:T.greenBg,border:`1px solid #BBF7D0`,borderRadius:10,color:T.greenTx,fontSize:14,fontWeight:700,cursor:"pointer"}}>Buy</button>
              <button style={{padding:"13px",background:T.redBg,border:`1px solid #FECACA`,borderRadius:10,color:T.redTx,fontSize:14,fontWeight:700,cursor:"pointer"}}>Sell</button>
            </div>
            <div style={{marginTop:10,fontSize:11,color:T.muted,textAlign:"center"}}>Demo only — no trades are executed</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── INVEST SCREEN ───────────────────────────
function InvestCatHeader({ icon, label, count, arr }) {
  const val  = arr.reduce((s,p)=>s+p.currentPrice*p.shares,0);
  const cost = arr.reduce((s,p)=>s+p.avgCost*p.shares,0);
  const up   = val >= cost;
  const pct  = cost>0 ? ((val-cost)/cost*100).toFixed(1) : "0.0";
  return (
    <div style={{padding:"11px 16px 9px",background:T.bg,borderBottom:`1px solid ${T.border2}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <span style={{fontSize:14}}>{icon}</span>
        <span style={{fontSize:12,fontWeight:700,color:T.text}}>{label}</span>
        <span style={{fontSize:10,color:T.muted}}>{count} positions</span>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:12,fontWeight:700,color:T.text}}>{fmtL(val)}</div>
        <div style={{fontSize:10,fontWeight:600,color:up?T.green:T.red}}>{up?"+":""}{pct}%</div>
      </div>
    </div>
  );
}

function InvestPosRow({ p, acctBadge, onSelectTicker }) {
  const pnl = (p.currentPrice - p.avgCost) * p.shares;
  const pct = gp(p.currentPrice, p.avgCost);
  const up  = isPos(p.currentPrice, p.avgCost);
  const cov = COV[p.ticker];
  const cs  = cov ? covSt(cov.level) : null;
  return (
    <div onClick={()=>onSelectTicker(p.ticker)}
      style={{padding:"12px 16px",background:T.card,borderBottom:`1px solid ${T.border2}`,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
      <div style={{width:38,height:38,borderRadius:10,background:T.pill,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:12,fontWeight:800,color:T.text}}>{p.ticker[0]}</span>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
          <span style={{fontSize:13,fontWeight:700,color:T.text}}>{p.ticker}</span>
          {cs && <div style={{width:5,height:5,borderRadius:"50%",background:cs.dot}}/>}
          {acctBadge && (
            <span style={{fontSize:9,padding:"1px 5px",borderRadius:5,fontWeight:600,
              background:acctBadge==="TFSA"?T.greenBg:T.blueBg,
              color:acctBadge==="TFSA"?T.greenTx:T.blueTx,
              border:`1px solid ${acctBadge==="TFSA"?"#BBF7D0":"#BFDBFE"}`}}>
              {acctBadge}
            </span>
          )}
        </div>
        <div style={{fontSize:11,color:T.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
        <div style={{fontSize:10,color:T.muted,marginTop:1}}>{p.shares} shares · avg ${p.avgCost.toFixed(2)}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontSize:13,fontWeight:700,color:T.text}}>${p.currentPrice.toFixed(2)}</div>
        <div style={{fontSize:11,color:up?T.green:T.red,fontWeight:600}}>{up?"+":""}{pct}%</div>
        <div style={{fontSize:10,color:up?T.green:T.red,opacity:0.8}}>{up?"+":""}{gfmt(pnl)}</div>
      </div>
    </div>
  );
}

function InvestScreen({ onBack, onSelectTicker, tabs, activeTab, onTabChange }) {
  const tfsaPos   = ACCOUNTS.tfsa.positions   || [];
  const nonregPos = ACCOUNTS.nonreg.positions || [];
  const cryptoPos = ACCOUNTS.crypto.positions || [];

  // Tag each position with its account label for the badge
  const tfsaTagged   = tfsaPos.map(p=>({...p, _acct:"TFSA"}));
  const nonregTagged = nonregPos.map(p=>({...p, _acct:"Non-Reg"}));
  const allStockPos  = [...tfsaTagged, ...nonregTagged];

  const stocks = allStockPos.filter(p=>p.assetType==="EQUITY").sort((a,b)=>(b.currentPrice*b.shares)-(a.currentPrice*a.shares));
  const funds  = allStockPos.filter(p=>p.assetType==="ETF").sort((a,b)=>(b.currentPrice*b.shares)-(a.currentPrice*a.shares));

  const allPos    = [...allStockPos, ...cryptoPos];
  const totalVal  = allPos.reduce((s,p)=>s+p.currentPrice*p.shares, 0);
  const totalCost = allPos.reduce((s,p)=>s+p.avgCost*p.shares, 0);
  const totalPnl  = totalVal - totalCost;
  const totalUp   = totalPnl >= 0;
  const totalPct  = totalCost > 0 ? ((totalPnl/totalCost)*100).toFixed(1) : "0.0";

  return (
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:200,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{position:"sticky",top:0,background:T.card,borderBottom:`1px solid ${T.border}`,padding:"13px 16px",display:"flex",alignItems:"center",gap:10,zIndex:10,flexShrink:0}}>
        <button onClick={onBack} style={{background:"none",border:"none",padding:"6px 4px",cursor:"pointer",fontSize:18,color:T.text,lineHeight:1}}>←</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700,color:T.text}}>Invest</div>
          <div style={{fontSize:11,color:T.sub}}>{stocks.length+funds.length+cryptoPos.length} positions total</div>
        </div>
      </div>

      {/* Summary */}
      <div style={{padding:"16px",background:T.card,borderBottom:`1px solid ${T.border2}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:11,color:T.sub,marginBottom:3}}>Total value</div>
          <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.02em",color:T.text}}>{fmtL(totalVal)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:13,fontWeight:700,color:totalUp?T.green:T.red}}>{totalUp?"+":""}{fmtL(totalPnl)}</div>
          <div style={{fontSize:11,color:totalUp?T.green:T.red,opacity:0.8}}>{totalUp?"+":""}{totalPct}% all time</div>
        </div>
      </div>

      {/* Categories */}
      <div style={{flex:1,overflowY:"auto",paddingBottom:90}}>
        {stocks.length>0 && <>
          <InvestCatHeader icon="📈" label="Stocks" count={stocks.length} arr={stocks}/>
          {stocks.map(p=><InvestPosRow key={p.ticker} p={p} acctBadge={p._acct} onSelectTicker={onSelectTicker}/>)}
        </>}
        {funds.length>0 && <>
          <div style={{height:10}}/>
          <InvestCatHeader icon="🗂" label="ETFs" count={funds.length} arr={funds}/>
          {funds.map(p=><InvestPosRow key={p.ticker} p={p} acctBadge={p._acct} onSelectTicker={onSelectTicker}/>)}
        </>}
        {cryptoPos.length>0 && <>
          <div style={{height:10}}/>
          <InvestCatHeader icon="₿" label="Crypto" count={cryptoPos.length} arr={cryptoPos}/>
          {cryptoPos.map(p=><InvestPosRow key={p.ticker} p={p} acctBadge={null} onSelectTicker={onSelectTicker}/>)}
        </>}
      </div>

      {/* Bottom tabs */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:T.card,borderTop:`1px solid ${T.border}`,zIndex:20,display:"flex"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>{onBack();onTabChange(t.id);}}
            style={{flex:1,padding:"10px 4px 14px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <span style={{fontSize:18,lineHeight:1}}>{t.icon}</span>
            <span style={{fontSize:9,fontWeight:activeTab===t.id?700:500,color:activeTab===t.id?T.ws:T.muted}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── STOCKS & FUNDS SCREEN ───────────────────
function StocksScreen({ onBack, onSelectTicker, onSelectAccount, tabs, activeTab, onTabChange }) {
  // Flatten all positions from TFSA + Non-Reg, tagging each with its account
  const allPos = [ACCOUNTS.tfsa, ACCOUNTS.nonreg].flatMap(a =>
    a.positions.map(p => ({ ...p, acctId: a.id, acctLabel: a.label, acctType: a.type }))
  );

  // Split into Stocks (EQUITY) and Funds (ETF), sorted by market value desc
  const stocks = allPos.filter(p=>p.assetType==="EQUITY").sort((a,b)=>(b.currentPrice*b.shares)-(a.currentPrice*a.shares));
  const funds  = allPos.filter(p=>p.assetType==="ETF").sort((a,b)=>(b.currentPrice*b.shares)-(a.currentPrice*a.shares));

  const totalVal  = allPos.reduce((s,p)=>s+p.currentPrice*p.shares,0);
  const totalCost = allPos.reduce((s,p)=>s+p.avgCost*p.shares,0);
  const totalPnl  = totalVal - totalCost;
  const totalUp   = totalPnl >= 0;
  const totalPct  = ((totalPnl/totalCost)*100).toFixed(1);

  const acctBadge = (acctType) => (
    <span style={{fontSize:9,padding:"1px 5px",borderRadius:6,fontWeight:600,
      background: acctType==="TFSA" ? T.greenBg : T.blueBg,
      color:      acctType==="TFSA" ? T.greenTx : T.blueTx,
      border:`1px solid ${acctType==="TFSA"?"#BBF7D0":"#BFDBFE"}`}}>
      {acctType==="TFSA"?"TFSA":"Non-Reg"}
    </span>
  );

  const PositionRow = ({p}) => {
    const pnl=(p.currentPrice-p.avgCost)*p.shares;
    const pct=gp(p.currentPrice,p.avgCost);
    const up=isPos(p.currentPrice,p.avgCost);
    const cov=COV[p.ticker];
    const cs=cov?covSt(cov.level):null;
    return (
      <div onClick={()=>onSelectTicker(p.ticker)}
        style={{padding:"13px 16px",background:T.card,borderBottom:`1px solid ${T.border2}`,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
        <div style={{width:40,height:40,borderRadius:10,background:T.pill,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:12,fontWeight:800,color:T.text}}>{p.ticker[0]}</span>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <span style={{fontSize:13,fontWeight:700,color:T.text}}>{p.ticker}</span>
            {cs&&<div style={{width:6,height:6,borderRadius:"50%",background:cs.dot,flexShrink:0}}/>}
            {acctBadge(p.acctType)}
          </div>
          <div style={{fontSize:11,color:T.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
          <div style={{fontSize:10,color:T.muted,marginTop:1}}>{p.shares} shares · avg ${p.avgCost.toFixed(2)}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:13,fontWeight:700,color:T.text}}>${p.currentPrice.toFixed(2)}</div>
          <div style={{fontSize:11,color:up?T.green:T.red,fontWeight:600}}>{up?"+":""}{pct}%</div>
          <div style={{fontSize:10,color:up?T.green:T.red,opacity:0.8}}>{up?"+":""}{gfmt(pnl)}</div>
        </div>
      </div>
    );
  };

  const SectionHeader = ({label, count, val}) => (
    <div style={{padding:"10px 16px 8px",background:T.bg,borderBottom:`1px solid ${T.border2}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <span style={{fontSize:11,fontWeight:700,color:T.text,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</span>
        <span style={{fontSize:10,color:T.muted,fontWeight:500}}>{count} positions</span>
      </div>
      <span style={{fontSize:12,fontWeight:600,color:T.sub}}>{fmtL(val)}</span>
    </div>
  );

  const stocksVal = stocks.reduce((s,p)=>s+p.currentPrice*p.shares,0);
  const fundsVal  = funds.reduce((s,p)=>s+p.currentPrice*p.shares,0);

  return (
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:200,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{position:"sticky",top:0,background:T.card,borderBottom:`1px solid ${T.border}`,padding:"13px 16px",display:"flex",alignItems:"center",gap:10,zIndex:10,flexShrink:0}}>
        <button onClick={onBack} style={{background:"none",border:"none",padding:"6px 4px",cursor:"pointer",fontSize:18,color:T.text,lineHeight:1}}>←</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700,color:T.text}}>Stocks & Funds</div>
          <div style={{fontSize:11,color:T.sub}}>{allPos.length} positions across TFSA & Non-Reg</div>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{padding:"16px",background:T.card,borderBottom:`1px solid ${T.border2}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:11,color:T.sub,marginBottom:3}}>Total value</div>
          <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.02em",color:T.text}}>{fmtL(totalVal)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:13,fontWeight:700,color:totalUp?T.green:T.red}}>{totalUp?"+":""}{fmtL(totalPnl)}</div>
          <div style={{fontSize:11,color:totalUp?T.green:T.red,opacity:0.8}}>{totalUp?"+":""}{totalPct}% all time</div>
        </div>
      </div>

      {/* Asset type sections */}
      <div style={{flex:1,overflowY:"auto",paddingBottom:90}}>
        {stocks.length>0&&<>
          <SectionHeader label="Stocks" count={stocks.length} val={stocksVal}/>
          {stocks.map(p=><PositionRow key={p.ticker} p={p}/>)}
        </>}
        {funds.length>0&&<>
          <div style={{height:10}}/>
          <SectionHeader label="ETFs" count={funds.length} val={fundsVal}/>
          {funds.map(p=><PositionRow key={p.ticker} p={p}/>)}
        </>}
      </div>

      {/* Bottom tabs */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:T.card,borderTop:`1px solid ${T.border}`,zIndex:20,display:"flex"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>{onBack();onTabChange(t.id);}}
            style={{flex:1,padding:"10px 4px 14px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <span style={{fontSize:18,lineHeight:1}}>{t.icon}</span>
            <span style={{fontSize:9,fontWeight:activeTab===t.id?700:500,color:activeTab===t.id?T.ws:T.muted}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ALL ACCOUNTS SCREEN ────────────────────
function AllAccountsScreen({ onBack, onSelectTicker, onSelectAccount, tabs, activeTab, onTabChange }) {
  const allPositions = Object.values(ACCOUNTS).flatMap(a =>
    a.positions.map(p => ({ ...p, acctLabel: a.label, acctType: a.type, acctId: a.id }))
  );
  const totalVal  = Object.values(ACCOUNTS).reduce((s,a)=>s+a.totalValue,0);
  const totalCost = Object.values(ACCOUNTS).reduce((s,a)=>s+a.totalCost,0);
  const up = totalVal >= totalCost;
  const pnl = totalVal - totalCost;
  const pct = gp(totalVal, totalCost);

  // Group by account for section headers
  const grouped = Object.entries(ACCOUNTS).map(([id, acct]) => ({
    id, acct,
    positions: acct.positions.map(p=>({...p, acctId:id, acctType:acct.type}))
  }));

  return (
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:200,animation:"sUp 0.22s ease",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:T.card,borderBottom:`1px solid ${T.border}`,padding:"13px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <button onClick={onBack} style={{background:"none",border:"none",padding:"6px 4px",cursor:"pointer",fontSize:18,color:T.text,lineHeight:1}}>←</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700,color:T.text}}>All Holdings</div>
          <div style={{fontSize:11,color:T.sub}}>{allPositions.length} positions across 3 accounts</div>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{padding:"12px 16px",background:T.card,borderBottom:`1px solid ${T.border2}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div>
          <div style={{fontSize:10,color:T.muted,marginBottom:2}}>Total Portfolio</div>
          <div style={{fontSize:20,fontWeight:800,color:T.text,letterSpacing:"-0.02em"}}>{fmtL(totalVal)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:13,color:up?T.greenTx:T.redTx,fontWeight:700}}>{up?"+":""}{fmtL(pnl)}</div>
          <div style={{fontSize:12,color:up?T.greenTx:T.redTx,fontWeight:600}}>{up?"+":""}{pct}% all time</div>
        </div>
      </div>

      {/* Scrollable position list, grouped by account */}
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px 16px"}}>
        {grouped.map(({id, acct, positions})=>(
          <div key={id} style={{marginBottom:16}}>
            {/* Section header — tappable to open that account */}
            <div onClick={()=>{ onBack(); onSelectAccount(id); }}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7,cursor:"pointer",padding:"6px 2px"}}>
              <div style={{fontSize:11,fontWeight:700,color:T.sub,textTransform:"uppercase",letterSpacing:"0.1em"}}>{acct.label}</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:11,color:T.sub}}>{fmtL(acct.totalValue)}</span>
                <span style={{fontSize:11,color:T.muted}}>›</span>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>
              {positions.map((pos,i)=>{
                const p2=(pos.currentPrice-pos.avgCost)*pos.shares;
                const pc=gp(pos.currentPrice,pos.avgCost);
                const u2=isPos(pos.currentPrice,pos.avgCost);
                const cov=COV[pos.ticker]; const cs=cov?covSt(cov.level):null;
                return (
                  <div key={pos.ticker} onClick={()=>onSelectTicker(pos.ticker)}
                    style={{padding:"11px 13px",background:T.card,border:`1px solid ${T.border2}`,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",animation:`fadeIn 0.25s ease ${i*0.02}s both`}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=T.border}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=T.border2}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                        <span style={{fontSize:14,fontWeight:700,color:T.text}}>{pos.ticker}</span>
                        {pos.assetType==="ETF"&&<span style={{fontSize:9,padding:"1px 5px",background:T.pill,borderRadius:3,color:T.sub,fontWeight:600}}>ETF</span>}
                        {pos.assetType==="CRYPTO"&&<span style={{fontSize:9,padding:"1px 5px",background:T.blueBg,borderRadius:3,color:T.blueTx,fontWeight:600}}>CRYPTO</span>}
                        {cs&&<div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:5,height:5,borderRadius:"50%",background:cs.dot}}/><span style={{fontSize:9,color:cs.tx,fontWeight:600}}>{cs.lbl}</span></div>}
                      </div>
                      <div style={{fontSize:11,color:T.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:170}}>{pos.name}</div>
                      <div style={{fontSize:10,color:T.muted,marginTop:1}}>{pos.shares} {pos.assetType==="CRYPTO"?"units":"shares"}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                      <div style={{fontSize:13,fontWeight:600,color:T.text}}>${pos.currentPrice.toFixed(2)}</div>
                      <div style={{fontSize:12,color:u2?T.greenTx:T.redTx,fontWeight:600}}>{u2?"+":""}{pc}%</div>
                      <div style={{fontSize:10,color:u2?T.greenTx:T.redTx,opacity:0.8}}>{u2?"+":""}{gfmt(p2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed bottom tab bar */}
      <div style={{borderTop:`1px solid ${T.border}`,background:T.card,display:"flex",flexShrink:0,zIndex:50,height:62}}>
        {tabs.map(t=>{
          const active = activeTab===t.id;
          return (
            <button key={t.id} onClick={()=>{ onBack(); onTabChange(t.id); }}
              style={{flex:1,padding:"10px 8px 12px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}}>
              {t.icon(active)}
              <span style={{fontSize:9,fontWeight:active?700:400,color:active?T.ws:T.muted,letterSpacing:"0.04em",textTransform:"uppercase"}}>{t.label}</span>
              {active&&<div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:20,height:2,background:T.ws,borderRadius:1}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── ACCOUNT PORTFOLIO SCREEN ─────────────
function AccountScreen({ acctId, onBack, onSelectTicker, tabs, activeTab, onTabChange }) {
  const acct = ACCOUNTS[acctId];
  const {allocs,hasWarn,warnSector,warnPct} = calcSectors(acct.positions);
  const totalVal  = acct.totalValue;
  const totalCost = acct.totalCost;
  const up = totalVal >= totalCost;
  const pnl = totalVal - totalCost;
  const pct = gp(totalVal, totalCost);
  const isCrypto = acct.type === "CRYPTO";

  return (
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:200,animation:"sUp 0.22s ease",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:T.card,borderBottom:`1px solid ${T.border}`,padding:"13px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <button onClick={onBack} style={{background:"none",border:"none",padding:"6px 4px",cursor:"pointer",fontSize:18,color:T.text,lineHeight:1}}>←</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:700,color:T.text}}>{acct.label}</div>
          <div style={{fontSize:11,color:T.sub}}>{acct.type} Account</div>
        </div>
        <div style={{padding:"3px 10px",background:T.greenBg,border:`1px solid #BBF7D0`,borderRadius:20}}>
          <span style={{fontSize:10,fontWeight:700,color:T.greenTx}}>{acct.label} ✓</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px 16px"}}>
        {/* Summary */}
        <div style={{padding:"16px",background:T.card,border:`1px solid ${T.border}`,borderRadius:14,marginBottom:12}}>
          <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Total Value</div>
          <div style={{fontSize:28,fontWeight:800,letterSpacing:"-0.03em",color:T.text,lineHeight:1}}>{fmtL(totalVal)}</div>
          <div style={{fontSize:12,color:up?T.green:T.red,fontWeight:600,marginTop:4}}>
            {up?"+":""}{fmtL(pnl)} ({up?"+":""}{pct}%) all time
          </div>
          {!isCrypto && (
            <div style={{marginTop:12}}>
              <div style={{display:"flex",height:5,borderRadius:3,overflow:"hidden",gap:1}}>
                {allocs.map((a,i)=><div key={a.sector} style={{width:`${a.pct}%`,background:SC[i%SC.length]}} title={`${a.sector}: ${a.pct.toFixed(1)}%`}/>)}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"3px 10px",marginTop:5}}>
                {allocs.slice(0,4).map((a,i)=>(
                  <div key={a.sector} style={{display:"flex",alignItems:"center",gap:3}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:SC[i%SC.length]}}/>
                    <span style={{fontSize:10,color:T.muted}}>{a.sector} {a.pct.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {hasWarn && (
          <div style={{padding:"9px 13px",background:T.amberBg,border:`1px solid #FDE68A`,borderRadius:10,marginBottom:10,fontSize:12,color:T.amberTx,lineHeight:1.6}}>
            ⚠ <strong>{warnSector} is {warnPct?.toFixed(0)}%</strong> of this portfolio. Consider diversification before adding more.
          </div>
        )}
        {isCrypto && (
          <div style={{padding:"12px 14px",background:T.blueBg,border:`1px solid #BFDBFE`,borderRadius:10,marginBottom:12,fontSize:12,color:T.blueTx,lineHeight:1.6}}>
            ℹ Crypto dispositions are taxable events in Canada. Track cost basis carefully.
          </div>
        )}

        <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:7}}>
          {acct.positions.length} Positions — tap to research
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:2}}>
          {acct.positions.map((pos,i)=>{
            const p2=(pos.currentPrice-pos.avgCost)*pos.shares;
            const pc=gp(pos.currentPrice,pos.avgCost);
            const u2=isPos(pos.currentPrice,pos.avgCost);
            const cov=COV[pos.ticker]; const cs=cov?covSt(cov.level):null;
            return (
              <div key={pos.ticker} onClick={()=>onSelectTicker(pos.ticker)}
                style={{padding:"12px 13px",background:T.card,border:`1px solid ${T.border2}`,borderRadius:10,cursor:"pointer",transition:"border-color 0.12s",animation:`fadeIn 0.3s ease ${i*0.025}s both`}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=T.border}
                onMouseLeave={e=>e.currentTarget.style.borderColor=T.border2}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                      <span style={{fontSize:14,fontWeight:700,color:T.text}}>{pos.ticker}</span>
                      {pos.assetType==="ETF"&&<span style={{fontSize:9,padding:"1px 5px",background:T.pill,borderRadius:3,color:T.sub,fontWeight:600}}>ETF</span>}
                      {pos.assetType==="CRYPTO"&&<span style={{fontSize:9,padding:"1px 5px",background:T.blueBg,borderRadius:3,color:T.blueTx,fontWeight:600}}>CRYPTO</span>}
                      {cs&&<div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:5,height:5,borderRadius:"50%",background:cs.dot}}/><span style={{fontSize:9,color:cs.tx,fontWeight:600}}>{cs.lbl}</span></div>}
                    </div>
                    <div style={{fontSize:11,color:T.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:180,marginBottom:2}}>{pos.name}</div>
                    <div style={{fontSize:10,color:T.muted}}>{pos.shares} {pos.assetType==="CRYPTO"?"units":"shares"} · avg ${pos.avgCost<1000?pos.avgCost.toFixed(2):pos.avgCost.toLocaleString()}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                    <div style={{fontSize:13,fontWeight:600,color:T.text}}>${pos.currentPrice.toFixed(2)}</div>
                    <div style={{fontSize:12,color:u2?T.green:T.red,fontWeight:600}}>{u2?"+":""}{pc}%</div>
                    <div style={{fontSize:10,color:u2?T.green:T.red,opacity:0.7}}>{u2?"+":""}{gfmt(p2)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed bottom tab bar — light theme (account screens are always light) */}
      <div style={{borderTop:`1px solid ${T.border}`,background:T.card,display:"flex",flexShrink:0,zIndex:50,height:62}}>
        {tabs.map(t=>{
          const active = activeTab===t.id;
          return (
            <button key={t.id} onClick={()=>{ onBack(); onTabChange(t.id); }}
              style={{flex:1,padding:"10px 8px 12px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}}>
              {t.icon(active)}
              <span style={{fontSize:9,fontWeight:active?700:400,color:active?T.ws:T.muted,letterSpacing:"0.04em",textTransform:"uppercase"}}>{t.label}</span>
              {active&&<div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:20,height:2,background:T.ws,borderRadius:1}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── SEARCH TAB ──────────────────────────
function SearchTab({ onSelect }) {
  const [q,setQ]=useState(""), [results,setResults]=useState([]), [focused,setFocused]=useState(false);
  const TRENDING=["AAPL","MSFT","META","SHOP","RY","TD","CNR","SU"];
  useEffect(()=>{
    if(!q.trim()){setResults([]);return;}
    const qU=q.trim().toUpperCase();
    setResults(ALL_POSITIONS.filter(p=>p.ticker.includes(qU)||p.name.toUpperCase().includes(qU)).slice(0,8));
  },[q]);
  const trending=ALL_POSITIONS.filter(p=>TRENDING.includes(p.ticker));

  const Row=({pos})=>{
    const owned=!!inAccount(pos.ticker);
    const cov=COV[pos.ticker];const cs=cov?covSt(cov.level):null;
    return (
      <div onClick={()=>onSelect(pos.ticker)}
        style={{padding:"11px 13px",background:T.card,border:`1px solid ${T.border2}`,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"border-color 0.12s"}}
        onMouseEnter={e=>e.currentTarget.style.borderColor=T.border}
        onMouseLeave={e=>e.currentTarget.style.borderColor=T.border2}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
            <span style={{fontSize:14,fontWeight:700,color:T.text}}>{pos.ticker}</span>
            {pos.assetType==="ETF"&&<span style={{fontSize:9,padding:"1px 5px",background:T.pill,borderRadius:3,color:T.sub,fontWeight:600}}>ETF</span>}
            {owned&&<span style={{fontSize:9,padding:"1px 5px",background:T.greenBg,borderRadius:3,color:T.greenTx,fontWeight:600}}>IN PORTFOLIO</span>}
          </div>
          <div style={{fontSize:11,color:T.sub,marginBottom:1}}>{pos.name}</div>
          {cs&&<div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:5,height:5,borderRadius:"50%",background:cs.dot}}/><span style={{fontSize:10,color:cs.tx}}>{cs.lbl}{cov?` · ${cov.n} analysts`:""}</span></div>}
        </div>
        <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
          <div style={{fontSize:13,fontWeight:600,color:T.text}}>${pos.currentPrice.toFixed(2)}</div>
          <div style={{fontSize:11,color:T.sub}}>{pos.sector}</div>
        </div>
      </div>
    );
  };
  return (
    <div style={{padding:"14px 16px 20px"}}>
      <div style={{position:"relative",marginBottom:12}}>
        <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:14,color:T.muted,pointerEvents:"none"}}>🔍</span>
        <input value={q} onChange={e=>setQ(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setTimeout(()=>setFocused(false),150)} placeholder="Search ticker or company..."
          style={{width:"100%",padding:"12px 14px 12px 34px",background:T.card,border:`1px solid ${focused?T.text:T.border}`,borderRadius:12,color:T.text,fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box",transition:"border-color 0.15s"}}/>
        {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:17,lineHeight:1}}>×</button>}
      </div>
      {q&&results.length===0&&<div style={{padding:"24px",textAlign:"center"}}><div style={{fontSize:20,marginBottom:6}}>🔎</div><div style={{fontSize:14,color:T.sub}}>No results for "{q}"</div></div>}
      {results.length>0&&<><div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:7}}>Results</div><div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:14}}>{results.map(p=><Row key={p.ticker} pos={p}/>)}</div></>}
      {!q&&<><div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:7}}>Trending</div><div style={{display:"flex",flexDirection:"column",gap:2}}>{trending.map(p=><Row key={p.ticker} pos={p}/>)}</div></>}
    </div>
  );
}

// ─── GLOBAL CHAT ─────────────────────────
function ChatTab() {
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const endRef=useRef(null);
  const totalVal=Object.values(ACCOUNTS).reduce((s,a)=>s+a.totalValue,0);
  const summary=Object.values(ACCOUNTS).flatMap(a=>a.positions.map(p=>`${p.ticker}(${a.type})`)).join(", ");
  const sys=`ROLE: You are Simple Research, Wealthsimple AI assistant. NOT a financial advisor.
PORTFOLIO: TFSA + Non-Reg + Crypto accounts, total ~$${Math.round(totalVal).toLocaleString()} CAD. Positions: ${summary}
RULES: No buy/sell recommendations. "Decision is yours" when asked. End every response: "This is informational only and does not constitute financial, investment, or tax advice."`;
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  const send=async()=>{
    const text=input.trim();if(!text||loading)return;setInput("");
    const um={role:"user",content:text};const msgs=[...messages,um];setMessages(msgs);setLoading(true);
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages:msgs})});
      const d=await r.json();
      setMessages(prev=>[...prev,{role:"assistant",content:d.content?.map(b=>b.text||"").join("")||"Research unavailable."}]);
    }catch{setMessages(prev=>[...prev,{role:"assistant",content:"Unable to connect."}]);}
    setLoading(false);
  };
  const SUGG=["What's the analyst view on my TFSA holdings?","Which positions have the weakest analyst coverage?","How does concentration look across my accounts?","What are the tax implications if I sell my Apple shares?"];
  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 108px)"}}>
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:9}}>
        {messages.length===0&&(
          <div>
            <div style={{textAlign:"center",padding:"18px 0 14px"}}>
              <div style={{fontSize:22,marginBottom:7}}>💬</div>
              <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:3}}>Ask Simple Research</div>
              <div style={{fontSize:12,color:T.sub,lineHeight:1.65}}>Any stock, across all your accounts. Full context loaded.</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {SUGG.map((s,i)=>(
                <button key={i} onClick={()=>setInput(s)}
                  style={{padding:"9px 13px",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,color:T.sub,fontSize:12,cursor:"pointer",textAlign:"left",fontFamily:"inherit",lineHeight:1.5}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=T.text}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m,i)=>(
          <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"90%",padding:"10px 13px",borderRadius:m.role==="user"?"14px 14px 2px 14px":"14px 14px 14px 2px",background:m.role==="user"?T.ws:T.card,border:m.role==="assistant"?`1px solid ${T.border}`:"none",color:m.role==="user"?T.card:T.text,fontSize:13,lineHeight:1.65,whiteSpace:"pre-wrap"}}>
            {m.content}
            {m.role==="assistant"&&m.content.includes("decision is yours")&&(
              <button style={{display:"block",marginTop:7,padding:"5px 10px",background:T.greenBg,border:`1px solid #BBF7D0`,borderRadius:6,color:T.greenTx,fontSize:11,cursor:"pointer",fontWeight:600}}>Talk to a Wealthsimple advisor →</button>
            )}
          </div>
        ))}
        {loading&&<div style={{alignSelf:"flex-start",padding:"10px 13px",background:T.card,border:`1px solid ${T.border}`,borderRadius:"14px 14px 14px 2px",fontSize:13,color:T.sub}}>Researching...</div>}
        <div ref={endRef}/>
      </div>
      <div style={{borderTop:`1px solid ${T.border}`,padding:"10px 14px 12px",background:T.card,flexShrink:0}}>
        <div style={{display:"flex",gap:7}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about any stock or your portfolio..."
            style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 13px",color:T.text,fontSize:13,outline:"none",fontFamily:"inherit"}}
            onFocus={e=>e.target.style.borderColor=T.text} onBlur={e=>e.target.style.borderColor=T.border}/>
          <button onClick={send} disabled={loading||!input.trim()}
            style={{padding:"11px 15px",background:input.trim()?T.ws:T.border,border:"none",borderRadius:10,color:input.trim()?T.card:T.sub,cursor:input.trim()?"pointer":"default",fontSize:15,fontWeight:700}}>↑</button>
        </div>
        <div style={{marginTop:6,padding:"8px 10px",background:T.compBg,border:`1px solid ${T.compBr}`,borderRadius:8}}>
          <div style={{fontSize:10,fontWeight:600,color:T.compTx,marginBottom:1}}>⚠️ Not financial or investment advice</div>
          <div style={{fontSize:10,color:T.compTx,lineHeight:1.5,opacity:0.85}}>Informational only. Consult a qualified advisor before acting. Wealthsimple advisors are available for personalized guidance.</div>
        </div>
      </div>
    </div>
  );
}

// ─── HOME SCREEN ─────────────────────────
function HomeTab({ onSelectAccount, onSelectTicker }) {
  const [hideBalance, setHideBalance] = useState(false);
  const totalAll     = Object.values(ACCOUNTS).reduce((s,a)=>s+a.totalValue,0);
  const totalCostAll = Object.values(ACCOUNTS).reduce((s,a)=>s+a.totalCost,0);
  const allUp  = totalAll >= totalCostAll;
  const allPnl = totalAll - totalCostAll;
  const allPct = gp(totalAll, totalCostAll);
  const investVal  = ACCOUNTS.tfsa.totalValue + ACCOUNTS.nonreg.totalValue;
  const investCost = ACCOUNTS.tfsa.totalCost  + ACCOUNTS.nonreg.totalCost;
  const investUp   = investVal >= investCost;
  const investPct  = gp(investVal, investCost);
  const cryptoUp   = ACCOUNTS.crypto.totalValue >= ACCOUNTS.crypto.totalCost;
  const cryptoPct  = gp(ACCOUNTS.crypto.totalValue, ACCOUNTS.crypto.totalCost);

  // ── Derived insights ──
  const tfsaTech    = calcSectors(ACCOUNTS.tfsa.positions);
  const tfsaTechPct = tfsaTech.allocs.find(a=>a.sector==="Technology")?.pct || 0;
  const tfsaLosers  = [...ACCOUNTS.tfsa.positions]
    .filter(p=>p.currentPrice < p.avgCost)
    .sort((a,b)=>((a.currentPrice-a.avgCost)/a.avgCost)-((b.currentPrice-b.avgCost)/b.avgCost))
    .slice(0,2);
  const bestPos = [...ACCOUNTS.tfsa.positions,...ACCOUNTS.nonreg.positions]
    .sort((a,b)=>((b.currentPrice-b.avgCost)/b.avgCost)-((a.currentPrice-a.avgCost)/a.avgCost))[0];
  const superficialRisk = [...ACCOUNTS.tfsa.positions,...ACCOUNTS.nonreg.positions].filter(p=>{
    const days=Math.floor((new Date()-new Date(p.lastPurchaseDate))/86400000);
    return days<30 && p.currentPrice<p.avgCost;
  });
  const nonregGains = ACCOUNTS.nonreg.positions
    .filter(p=>p.currentPrice>p.avgCost)
    .reduce((s,p)=>s+(p.currentPrice-p.avgCost)*p.shares,0);

  const INSIGHTS = [
    {
      type:"concentration",icon:"⚠️",tag:"Concentration Risk",
      tagColor:"#F59E0B",tagBg:"#2A2000",tagBorder:"#3D2E00",
      title:`Tech is ${tfsaTechPct.toFixed(0)}% of your TFSA`,
      body:`NVDA (+82%), AMD (+15%), TSLA (−15%), VRT (+11%), and HIMX (+22%) are all in Technology. Adding more tech — even strong picks — increases single-sector exposure. Analysts rate NVDA Strong Buy (42 analysts) but concentration risk is independent of conviction.`,
      cta:"Review TFSA",acctId:"tfsa",
    },
    {
      type:"taxloss",icon:"💸",tag:"Tax Opportunity",
      tagColor:"#60A5FA",tagBg:"#0A1A2E",tagBorder:"#1A2E44",
      title:`${tfsaLosers.map(p=>p.ticker).join(" & ")} down — but it's a TFSA`,
      body:`${tfsaLosers.map(p=>`${p.ticker} is down ${Math.abs(gp(p.currentPrice,p.avgCost))}% (${gfmt(Math.abs((p.currentPrice-p.avgCost)*p.shares))} unrealized loss)`).join(", ")}. TFSA losses cannot offset capital gains — no tax-loss harvesting benefit here. Analyst consensus on ${tfsaLosers[0]?.ticker}: ${RESEARCH[tfsaLosers[0]?.ticker]?.rating||"HOLD"} — review the thesis before acting.`,
      cta:"View position",ticker:tfsaLosers[0]?.ticker,
    },
    {
      type:"nonregtax",icon:"🧾",tag:"Tax Exposure",
      tagColor:"#A78BFA",tagBg:"#1A0A2E",tagBorder:"#2E1A44",
      title:`$${nonregGains.toFixed(0)} unrealized gains in Non-Reg`,
      body:`AAPL (+$491), MSFT (+$175), RY (+$240), and ENB (+$284) are all showing gains in your Non-Registered account. If sold, 50% of each gain is included in taxable income under CRA rules. AAPL has Buy consensus at $240 PT — no urgent sell signal, but worth knowing your tax exposure before year-end.`,
      cta:"Review Non-Reg",acctId:"nonreg",
    },
    {
      type:"winner",icon:"🚀",tag:"Top Performer",
      tagColor:"winner",tagBg:"winner",tagBorder:"winner",
      title:`${bestPos?.ticker} is your biggest winner at +${gp(bestPos?.currentPrice,bestPos?.avgCost)}%`,
      body:`${bestPos?.name} is up ${gp(bestPos?.currentPrice,bestPos?.avgCost)}% since your avg cost of $${bestPos?.avgCost.toFixed(2)}. ${RESEARCH[bestPos?.ticker]?.rating||"BUY"} consensus with ${COV[bestPos?.ticker]?.n||"—"} analysts. ${RESEARCH[bestPos?.ticker]?.bull?.text||"Strong institutional coverage."} ${bestPos?.ticker==="NVDA"?"It's your largest unrealized gain — worth considering whether the position size still fits your risk appetite.":""}`,
      cta:"View research",ticker:bestPos?.ticker,
    },
    ...(superficialRisk.length>0?[{
      type:"superficial",icon:"⏱️",tag:"ITA §54 Warning",
      tagColor:"super",tagBg:"super",tagBorder:"super",
      title:`${superficialRisk.map(p=>p.ticker).join(", ")} — superficial loss window`,
      body:`${superficialRisk.map(p=>{const d=Math.floor((new Date()-new Date(p.lastPurchaseDate))/86400000);return `${p.ticker} purchased ${d} days ago, showing a loss of ${gfmt(Math.abs((p.currentPrice-p.avgCost)*p.shares))}`;}).join(". ")}. Under ITA §54, selling at a loss within 30 days of purchase and reacquiring the same security causes the loss to be denied by CRA.`,
      cta:"See tax details",ticker:superficialRisk[0]?.ticker,
    }]:[]),
  ];

  // All positions across every account for the holdings strip
  const allPositions = Object.values(ACCOUNTS).flatMap(a=>a.positions);
  const totalHoldings = allPositions.length;
  // Pick 4 representative tickers from across accounts
  const stripTickers = ["NVDA","AAPL","BTC","RY"];
  const stripColors  = ["#76B900","#555555","#F7931A","#002E5F"];

  // Insight tag colours resolved from theme
  const insightTheme = [
    { tagBg:T.tagAmberBg, tagBr:T.tagAmberBr, tagTx:T.tagAmberTx },
    { tagBg:T.tagBlueBg,  tagBr:T.tagBlueBr,  tagTx:T.tagBlueTx  },
    { tagBg:T.tagPurBg,   tagBr:T.tagPurBr,   tagTx:T.tagPurTx   },
    { tagBg:T.tagGreenBg, tagBr:T.tagGreenBr, tagTx:T.tagGreenTx },
    { tagBg:T.tagRedBg,   tagBr:T.tagRedBr,   tagTx:T.tagRedTx   },
  ];

  return (
    <div style={{background:T.bg,minHeight:"100%",paddingBottom:24}}>

      {/* ── Net worth hero ── */}
      <div style={{padding:"20px 20px 16px",textAlign:"center"}}>
        <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Total portfolio</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:4}}>
          <div style={{fontSize:36,fontWeight:800,letterSpacing:"-0.04em",color:T.text,lineHeight:1}}>
            {hideBalance ? "•••••••" : fmtL(totalAll)}
          </div>
          <button onClick={()=>setHideBalance(h=>!h)}
            style={{width:32,height:32,borderRadius:"50%",background:T.pill,border:`1px solid ${T.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              {hideBalance
                ? <><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke={T.sub} strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke={T.sub} strokeWidth="1.4"/><line x1="3" y1="3" x2="13" y2="13" stroke={T.sub} strokeWidth="1.4" strokeLinecap="round"/></>
                : <><path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke={T.sub} strokeWidth="1.4"/><circle cx="8" cy="8" r="2" stroke={T.sub} strokeWidth="1.4"/></>
              }
            </svg>
          </button>
        </div>
        <div style={{fontSize:13,color:allUp?T.green:T.red,fontWeight:600}}>
          {allUp?"+":""}{fmtL(allPnl)} ({allUp?"+":""}{allPct}%) all time
        </div>
      </div>

      {/* ── Spend / Invest top tiles ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 16px 10px"}}>
        {/* Spend — static placeholder */}
        <div style={{padding:"15px",background:T.card,border:`1px solid ${T.border2}`,borderRadius:14,cursor:"pointer"}}>
          <div style={{fontSize:12,color:T.sub,marginBottom:5}}>Spend</div>
          <div style={{fontSize:19,fontWeight:800,color:T.text,letterSpacing:"-0.02em",marginBottom:8}}>
            {hideBalance?"•••••••":"$0.00"}
          </div>
          <div style={{display:"inline-flex",padding:"3px 8px",background:T.pill,borderRadius:20,border:`1px solid ${T.border}`}}>
            <span style={{fontSize:11,fontWeight:600,color:T.muted}}>Chequing</span>
          </div>
        </div>
        {/* Invest — drills into InvestScreen */}
        <div onClick={()=>onSelectAccount("invest")}
          style={{padding:"15px",background:T.card,border:`1px solid ${T.border2}`,borderRadius:14,cursor:"pointer"}}>
          <div style={{fontSize:12,color:T.sub,marginBottom:5}}>Invest</div>
          <div style={{fontSize:19,fontWeight:800,color:T.text,letterSpacing:"-0.02em",marginBottom:8}}>
            {hideBalance?"•••••••":fmtL(totalAll)}
          </div>
          <div style={{display:"inline-flex",padding:"3px 8px",background:allUp?T.greenBg:T.redBg,borderRadius:20}}>
            <span style={{fontSize:11,fontWeight:600,color:allUp?T.greenTx:T.redTx}}>{allUp?"+":""}{allPct}% all time</span>
          </div>
        </div>
      </div>

      {/* ── Holdings strip — ALL accounts ── */}
      <div style={{margin:"0 16px 14px",padding:"12px 14px",background:T.card,border:`1px solid ${T.border2}`,borderRadius:14,display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}
        onClick={()=>onSelectAccount("all")}>
        <div style={{display:"flex",marginRight:2}}>
          {stripTickers.map((tk,i)=>(
            <div key={tk} style={{width:28,height:28,borderRadius:"50%",background:stripColors[i],border:`2px solid ${T.card}`,marginLeft:i>0?-10:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#fff",zIndex:4-i,flexShrink:0}}>
              {tk[0]}
            </div>
          ))}
          <div style={{width:28,height:28,borderRadius:"50%",background:T.pill,border:`2px solid ${T.card}`,marginLeft:-10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:T.sub,flexShrink:0}}>
            +{totalHoldings-4}
          </div>
        </div>
        <span style={{fontSize:13,color:T.text,fontWeight:500,flex:1}}>
          {totalHoldings} holdings across all accounts
        </span>
        <span style={{color:T.muted,fontSize:18}}>›</span>
      </div>

      {/* ── Accounts section ── */}
      <div style={{padding:"0 16px 16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:17,fontWeight:700,color:T.text}}>Accounts</div>
          <div style={{width:30,height:30,borderRadius:"50%",background:T.pill,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke={T.sub} strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <div style={{background:T.card,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden"}}>
          {Object.entries(ACCOUNTS).map(([id,acct],i,arr)=>{
            const up2 = acct.totalValue>=acct.totalCost;
            const pct2 = gp(acct.totalValue,acct.totalCost);
            return (
              <div key={id} onClick={()=>onSelectAccount(id)}
                style={{padding:"15px 16px",borderBottom:i<arr.length-1?`1px solid ${T.border2}`:"none",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",transition:"background 0.1s"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.bg}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:2}}>{acct.label}</div>
                  <div style={{fontSize:12,color:T.muted}}>{acct.type} · {acct.positions.length} positions</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:2}}>
                    {hideBalance?"•••••••":fmtL(acct.totalValue)}
                  </div>
                  <div style={{fontSize:12,fontWeight:600,color:up2?T.greenTx:T.redTx}}>
                    {up2?"+":""}{pct2}% all time
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── For you — Simple Research Insights ── */}
      <div style={{padding:"0 16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{fontSize:17,fontWeight:700,color:T.text}}>For you</div>
          <div style={{fontSize:11,color:T.ws,fontWeight:700,padding:"2px 8px",background:T.greenBg,borderRadius:12}}>{INSIGHTS.length} insights</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {INSIGHTS.map((ins,i)=>{
            const th = insightTheme[i % insightTheme.length];
            return (
              <div key={i}
                onClick={()=>{if(ins.ticker)onSelectTicker(ins.ticker);else if(ins.acctId)onSelectAccount(ins.acctId);}}
                style={{background:T.card,border:`1px solid ${T.border2}`,borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"border-color 0.15s,box-shadow 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.06)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border2;e.currentTarget.style.boxShadow="none";}}>
                <div style={{padding:"8px 14px",background:th.tagBg,borderBottom:`1px solid ${th.tagBr}`,display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:13}}>{ins.icon}</span>
                  <span style={{fontSize:10,fontWeight:700,color:th.tagTx,textTransform:"uppercase",letterSpacing:"0.08em"}}>{ins.tag}</span>
                </div>
                <div style={{padding:"13px 14px"}}>
                  <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:7,lineHeight:1.35}}>{ins.title}</div>
                  <div style={{fontSize:12,color:T.sub,lineHeight:1.7}}>{ins.body}</div>
                  <div style={{marginTop:11,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,fontWeight:600,color:T.ws}}>{ins.cta} →</span>
                    {ins.ticker&&COV[ins.ticker]&&(
                      <span style={{fontSize:10,color:T.muted}}>{COV[ins.ticker].n} analysts · {RESEARCH[ins.ticker]?.rating}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom compliance notice — prominent ── */}
      <div style={{margin:"16px 16px 0",padding:"13px 15px",background:T.compBg,border:`1.5px solid ${T.compBr}`,borderRadius:12}}>
        <div style={{fontSize:11,fontWeight:700,color:T.compTx,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>Important disclaimer</div>
        <div style={{fontSize:11,color:T.compTx,lineHeight:1.6,opacity:0.9}}>
          Simple Research is an informational tool only. Analyst data, price targets, and tax context are provided for research purposes and do not constitute financial, investment, or tax advice. Past performance is not indicative of future results. Always consult a qualified financial advisor or tax professional before making investment decisions. Wealthsimple is not responsible for the accuracy of third-party analyst data.
        </div>
      </div>
    </div>
  );
}

// ─── APP SHELL ───────────────────────────
export default function App() {
  const [tab,        setTab]        = useState("home");
  const [acctId,     setAcctId]     = useState(null);
  const [tickerInfo, setTickerInfo] = useState(null);



  const handleSelectAccount = (id) => setAcctId(id);
  const handleSelectTicker  = (ticker) => {
    const a = inAccount(ticker);
    setTickerInfo({ ticker, acctType: a?.type||"NON_REG" });
  };

  const tabActive   = T.ws;
  const tabInactive = T.muted;

  // Tab definitions — 4 tabs matching WS layout
  const TABS = [
    { id:"home",   label:"Home",
      icon:(a)=>(
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 10L11 3L19 10V19H15V14H7V19H3V10Z"
            stroke={a?tabActive:tabInactive} strokeWidth="1.7"
            fill={a?tabActive+"22":"none"} strokeLinejoin="round"/>
        </svg>
      )},
    { id:"search", label:"Search",
      icon:(a)=>(
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="9.5" cy="9.5" r="6" stroke={a?tabActive:tabInactive} strokeWidth="1.7"/>
          <path d="M14 14L19 19" stroke={a?tabActive:tabInactive} strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      )},
    { id:"transfer", label:"Transfer",
      icon:(a)=>(
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M5 8h12M14 5l3 3-3 3" stroke={a?tabActive:tabInactive} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 14H5M8 11l-3 3 3 3" stroke={a?tabActive:tabInactive} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )},
    { id:"chat",   label:"Research",
      icon:(a)=>(
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M4 5a1 1 0 011-1h12a1 1 0 011 1v9a1 1 0 01-1 1H9l-5 3V5z"
            stroke={a?tabActive:tabInactive} strokeWidth="1.7"
            fill={a?tabActive+"22":"none"}/>
        </svg>
      )},
  ];

  const TOP_H    = 54;
  const TAB_BAR_H= 62;

  return (
    <div style={{fontFamily:"'DM Sans','Helvetica Neue',sans-serif",maxWidth:430,margin:"0 auto",position:"relative",height:"100vh",overflow:"hidden",background:T.bg}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:2px}
        ::-webkit-scrollbar-thumb{background:${T.border}}
        @keyframes sUp{from{transform:translateY(22px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* ── Overlay screens — keyed on themeVer so they remount on theme change ── */}
      {tickerInfo && (
        <TickerScreen ticker={tickerInfo.ticker} acctType={tickerInfo.acctType} onBack={()=>setTickerInfo(null)}/>
      )}
      {!tickerInfo && acctId==="all" && (
        <AllAccountsScreen onBack={()=>setAcctId(null)} onSelectTicker={handleSelectTicker} onSelectAccount={handleSelectAccount} tabs={TABS} activeTab={tab} onTabChange={setTab}/>
      )}
      {!tickerInfo && acctId==="invest" && (
        <InvestScreen onBack={()=>setAcctId(null)} onSelectTicker={handleSelectTicker} onSelectAccount={handleSelectAccount} tabs={TABS} activeTab={tab} onTabChange={setTab}/>
      )}
      {!tickerInfo && acctId==="stocks" && (
        <StocksScreen onBack={()=>setAcctId(null)} onSelectTicker={handleSelectTicker} onSelectAccount={handleSelectAccount} tabs={TABS} activeTab={tab} onTabChange={setTab}/>
      )}
      {!tickerInfo && acctId && acctId!=="all" && acctId!=="stocks" && acctId!=="invest" && (
        <AccountScreen acctId={acctId} onBack={()=>setAcctId(null)} onSelectTicker={handleSelectTicker} tabs={TABS} activeTab={tab} onTabChange={setTab}/>
      )}

      {/* ── Fixed top bar — WS style ── */}
      <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:TOP_H,background:T.card,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px",zIndex:40}}>
        {/* Bell with red dot */}
        <div style={{position:"relative",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2a7 7 0 00-7 7v3l-2 3h18l-2-3V9a7 7 0 00-7-7z" stroke={T.text} strokeWidth="1.6" fill="none"/>
            <path d="M9 18a2 2 0 004 0" stroke={T.text} strokeWidth="1.6"/>
          </svg>
          <div style={{position:"absolute",top:4,right:4,width:7,height:7,borderRadius:"50%",background:"#EF4444",border:`1.5px solid ${T.card}`}}/>
        </div>

        {/* Centered Home pill with dots */}
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:T.muted,opacity:0.5}}/>
          <div style={{padding:"5px 18px",background:T.pill,borderRadius:20}}>
            <span style={{fontSize:14,fontWeight:600,color:T.text,letterSpacing:"-0.01em"}}>Home</span>
          </div>
          <div style={{width:6,height:6,borderRadius:"50%",background:T.muted,opacity:0.5}}/>
        </div>

        {/* Avatar */}
        <div style={{width:32,height:32,borderRadius:"50%",background:T.pill,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="6" r="3" stroke={T.sub} strokeWidth="1.5"/>
            <path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={T.sub} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{position:"absolute",top:TOP_H,bottom:TAB_BAR_H,left:0,right:0,overflowY:tab==="chat"?"hidden":"auto",background:T.bg}}>
        {tab==="home"     && <HomeTab     onSelectAccount={handleSelectAccount} onSelectTicker={handleSelectTicker}/>}
        {tab==="search"   && <SearchTab   onSelect={handleSelectTicker}/>}
        {tab==="transfer" && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:12}}>
            <div style={{fontSize:32}}>⇄</div>
            <div style={{fontSize:15,fontWeight:600,color:T.text}}>Transfer</div>
            <div style={{fontSize:13,color:T.sub}}>Move money between accounts</div>
            <div style={{fontSize:11,color:T.muted,marginTop:4}}>Out of scope for Simple Research prototype</div>
          </div>
        )}
        {tab==="chat"     && <ChatTab/>}
      </div>

      {/* ── Fixed bottom tab bar ── */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:TAB_BAR_H,background:T.card,borderTop:`1px solid ${T.border}`,display:"flex",zIndex:50}}>
        {TABS.map(t=>{
          const active = tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{flex:1,padding:"10px 8px 12px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}}>
              {t.icon(active)}
              <span style={{fontSize:9,fontWeight:active?700:400,color:active?tabActive:tabInactive,letterSpacing:"0.04em",textTransform:"uppercase",transition:"color 0.15s"}}>{t.label}</span>
              {active&&<div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:20,height:2,background:tabActive,borderRadius:1}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
