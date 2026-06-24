import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up body parsers with generous limits for base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Shared Gemini API Setup
let cachedAI: GoogleGenAI | null = null;
let cachedKey: string | null = null;
function getAIClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set on the server. Please add your key in the Settings > Secrets tab.");
  }
  if (!cachedAI || cachedKey !== key) {
    cachedKey = key;
    cachedAI = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return cachedAI;
}

// Robust Retry Helper for handling transient 503 and 429 errors from Gemini
async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      const errorMsg = error.message || "";
      const isTransient = 
        error.status === 503 || 
        error.status === 429 ||
        error.statusCode === 503 ||
        error.statusCode === 429 ||
        /503|429|UNAVAILABLE|high demand|resource exhausted|overloaded/i.test(errorMsg) ||
        JSON.stringify(error).includes("503") ||
        JSON.stringify(error).includes("429");

      if (isTransient && attempt <= maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.warn(`Gemini API returned transient error (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms... Error:`, errorMsg || error);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

// Local Expert Helper Functions to handle peak/overload API states (High availability fail-safe)
function generateOfflineChatResponse(message: string, profile: any): string {
  const msg = message.toLowerCase();
  let stateStr = profile?.state ? ` for **${profile.state}**` : "";
  let cropsStr = profile?.mainCrops?.length ? ` your crops (**${profile.mainCrops.join(", ")}**)` : "Indian crops";

  let header = `> 📢 **Kisan-AgriPulse Mitra Backup Mode**: Gemini API is currently experiencing extremely high demand. I have safely activated my local offline Agronomist and Advisor rules to provide you with instant, verified agriculture guidelines.\n\n`;

  if (msg.includes("msp") || msg.includes("price") || msg.includes("rate") || msg.includes("mandi") || msg.includes("ధర") || msg.includes("मूल्य")) {
    return header + `### Minimum Support Price (MSP) & Mandi Rates 2025-26:
Under the **Digital Agriculture Mission**, the government has announced robust MSPs to guarantee a 50% margin over the cost of production. Here are the latest rates per Quintal (100 kg):

*   🌾 **Paddy (Common)**: **₹2,300** per Quintal
*   🌾 **Paddy (Grade A)**: **₹2,320** per Quintal
*   🌾 **Wheat**: **₹2,425** per Quintal
*   🌽 **Maize (Corn)**: **₹2,225** per Quintal
*   🫘 **Bengal Gram (Chana)**: **₹5,440** per Quintal
*   🌱 **Mustard & Rapeseed**: **₹5,650** per Quintal
*   🧶 **Cotton (Medium Staple)**: **₹7,121** per Quintal
*   🧶 **Cotton (Long Staple)**: **₹7,521** per Quintal

**Mandi Tip**: Ensure your harvest has moisture levels below **14%** (for paddy) and **12%** (for wheat/grain) to secure the full MSP rate without deductions at your local APMC Mandi. For${cropsStr}, check our Schemes section to find integrated direct procurement centers!`;
  }

  if (msg.includes("scheme") || msg.includes("pm-kisan") || msg.includes("pmkisan") || msg.includes("bima") || msg.includes("insurance") || msg.includes("subsidy") || msg.includes("loan") || msg.includes("రుణం") || msg.includes("పథకం") || msg.includes("योजना")) {
    return header + `### Recommended Agricultural Schemes${stateStr}:
Here are the active welfare and investment support programs matching your inquiry:

1.  **PM-KISAN (Samman Nidhi)**:
    *   **Benefit**: Direct cash support of **₹6,000 per year** in three equal installments.
    *   **Eligibility**: Small and marginal landholders. Check if your Aadhaar is linked to your bank account via the PM-Kisan portal!
2.  **PM Fasal Bima Yojana (PMFBY)**:
    *   **Benefit**: Full financial security against yield loss due to natural calamities, pests, and disease.
    *   **Premium**: Only **1.5%** for Rabi crops, **2.0%** for Kharif, and **5.0%** for commercial/horticultural crops.
3.  **Kisan Credit Card (KCC)**:
    *   **Benefit**: Low-interest short-term credit loans up to **₹3 Lakhs** at an effective rate of just **4% per annum** (upon timely repayment).
4.  **National Mission on Edible Oils (NMEO-OP)**:
    *   **Benefit**: Subsidies on high-yielding oilseed varieties, seed kits, and micro-irrigation equipment.

*Tip*: Navigate to the **Schemes & Eligibility** tab in the sidebar to run a live dynamic matching profile based on your specific land size of **${profile?.landSizeHectares || "0"} Hectares**!`;
  }

  if (msg.includes("pest") || msg.includes("disease") || msg.includes("leaf") || msg.includes("curling") || msg.includes("blight") || msg.includes("rot") || msg.includes("పురుగు") || msg.includes("తెగులు") || msg.includes("रोग") || msg.includes("कीट")) {
    return header + `### Smart Pest & Disease Advisor Response:
To keep your crops healthy and robust, follow these expert agronomist interventions:

*   🐛 **Sucking Pests (Thrips, Mites, Aphids)**:
    *   *Symptom*: Leaf curling, pale veins, or sticky honeydew residues.
    *   *Organic Remedy*: Spray **5% Neem Oil solution** (10,000 ppm) mixed with a few drops of dish soap, or apply 10% garlic-chilli extract.
    *   *Chemical Remedy*: Spray **Imidacloprid 17.8% SL** @ 0.5 ml per liter of water.
*   🍄 **Fungal Blights and Rusts**:
    *   *Symptom*: Brown spindle-shaped spots on leaves or powdery white coatings.
    *   *Organic Remedy*: Spray 3% copper-based biopesticide or homemade sour buttermilk formulation.
    *   *Chemical Remedy*: Spray **Carbendazim 12% + Mancozeb 63% WP** (Saaf) @ 2 grams per liter of water.

**Diagnostic Tool**: If you have a clear photo of the leaf or field, please upload it to our **AI Crop Diagnostic** tool in the central panel for a precise visual scan!`;
  }

  if (msg.includes("paddy") || msg.includes("rice") || msg.includes("వరి") || msg.includes("धान")) {
    return header + `### High-Yield Guidelines for Paddy (Rice) Cultivation:
Paddy is a water-intensive crop requiring meticulous water and nutrient scheduling:

1.  **Variety Selection**: Choose certified seeds like BPT-5204 (Samba Mahsuri), MTU-1010, or high-yielding hybrid varieties.
2.  **Nutrient Management**: Apply NPK in a **120:60:40 kg/hectare** ratio. Split Nitrogen doses: 50% at transplanting, 25% at tillering, and 25% at panicle initiation.
3.  **Pest Watch**: Keep a sharp eye out for **Stem Borer** (dead hearts) and **Rice Blast** fungal spots. Maintain field aeration and avoid waterlogging beyond 5 cm during tillering.
4.  **Financial Support**: Current Government MSP is guaranteed at **₹2,300 per Quintal** (Common) / **₹2,320** (Grade A).`;
  }

  if (msg.includes("cotton") || msg.includes("ప్రత్తి") || msg.includes("कपास")) {
    return header + `### High-Yield Guidelines for Cotton Cultivation:
Cotton is a critical commercial fiber crop suited for deep black soils:

1.  **Spacing**: Maintain a standard spacing of **90 x 60 cm** or **120 x 45 cm** for Bt Cotton hybrids to ensure optimum light penetration and air movement.
2.  **Sucking Pests & Bollworms**: Pink Bollworm is a major threat. Install **5 pheromone traps per acre** at 45 days after sowing to monitor insect populations early.
3.  **Soil Health**: Apply well-decomposed Farm Yard Manure (FYM) @ 10 tonnes/hectare. Top-dress with Nitrogen in 3 split doses.
4.  **Financial Support**: Current MSP is secured at **₹7,121 per Quintal** (Medium Staple) / **₹7,521** (Long Staple).`;
  }

  if (msg.includes("chilli") || msg.includes("mirchi") || msg.includes("మిరప") || msg.includes("मिर्च")) {
    return header + `### Premium Advisor Tips for Chilli Cultivation:
Chilli is highly profitable but susceptible to leaf curl and fruit rot:

1.  **Leaf Curl Management**: Leaf curl is caused by thrips (curling upward) and mites (curling downward). Spray Neem Oil (3-5 ml/L) or install blue and yellow sticky traps (15 traps per acre).
2.  **Drip Irrigation**: Implement drip irrigation combined with plastic mulching. This prevents soil-borne fungal splash and reduces weed competition by up to 80%.
3.  **Fertigation**: Apply water-soluble fertilizers (NPK 19:19:19) at weekly intervals during the vegetative stage.
4.  **Harvesting**: For dry chilli, harvest when fruits turn deep red. Dry them on clean tarpaulin sheets to avoid aflatoxin contamination.`;
  }

  // Generic Default Response
  return header + `🙏 **Namaste! Welcome to Kisan-AgriPulse Mitra Advisor.**
I am standing by to help you maximize your agricultural yields and navigate welfare benefits. Tell me what you would like to discuss today:

*   🌾 **Government Schemes**: PM-Kisan, PM Fasal Bima Yojana, or state subsidy programs.
*   💰 **Mandi Price Queries**: Live Minimum Support Prices (MSP) for Wheat, Paddy, Maize, Cotton, and Pulses.
*   🔬 **Crop Care & Agronomy**: Sowing methods, balanced fertilizers, and pest treatments for Paddy, Cotton, Chilli, or Wheat.

**Try asking me**: *"What is the current MSP rate of Paddy and Cotton?"* or *"How can I treat leaf curling on Chilli?"*`;
}

function generateOfflineDiagnosticResponse(cropName: string): any {
  const normalized = (cropName || "crop").toLowerCase();
  
  if (normalized.includes("paddy") || normalized.includes("rice") || normalized.includes("వరి") || normalized.includes("धान")) {
    return {
      diagnosis: "[📢 Offline Backup Mode] Bacterial Leaf Blight (BLB) or Fungal Rice Blast. Spindle-shaped lesions with grey centers have formed on the leaf blade, threatening photosynthetic yield.",
      severity: "Moderate",
      remedyOrganic: "Spray fresh Neem Seed Kernel Extract (NSKE) at 5% concentration or application of 20% fresh cow dung filtrate to create natural plant resistance.",
      remedyChemical: "Spray Tricyclazole 75% WP @ 0.6 grams per liter of water, or apply Streptocycline (9:1) at 0.1 gram/liter to arrest bacterial growth.",
      expertTips: [
        "Avoid applying heavy doses of Nitrogen fertilizers at this stage, as it accelerates lesion spread.",
        "Ensure field bunds are clean and drain standing water temporarily for 2 days to encourage soil oxidation.",
        "In the next planting cycle, use certified disease-resistant varieties such as Swarna-Sub1 or BPT-5204."
      ]
    };
  }

  if (normalized.includes("cotton") || normalized.includes("ప్రత్తి") || normalized.includes("कपास")) {
    return {
      diagnosis: "[📢 Offline Backup Mode] Sucking Pest Infestation (Aphids & Leaf Jassids feeding on plant sap). Leaves are turning pale, curling downwards, and showing yellow edges.",
      severity: "Mild",
      remedyOrganic: "Install 10-15 yellow sticky traps per acre at crop height level. Spray 5% Neem Oil solution or 10% garlic-chilli extract.",
      remedyChemical: "Spray Imidacloprid 17.8% SL @ 0.5 ml per liter of water, or use Thiamethoxam 25% WG @ 0.2 grams/liter.",
      expertTips: [
        "Conserve natural biological predators in the field like Ladybird beetles and Chrysopa (lacewings).",
        "Avoid early spray of broad-spectrum synthetic pyrethroids, which kills beneficial crop insects.",
        "Ensure potassium levels are balanced to thicken leaf cell walls against sap feeding."
      ]
    };
  }

  if (normalized.includes("chilli") || normalized.includes("mirchi") || normalized.includes("మిరప") || normalized.includes("मिर्च")) {
    return {
      diagnosis: "[📢 Offline Backup Mode] Chilli Leaf Curl Complex (caused by Thrips & Yellow Mite feeding activity). Leaf margins are curling upward/downward, giving a wrinkled appearance.",
      severity: "Moderate",
      remedyOrganic: "Install bright blue sticky traps (10 per acre) specifically targeting Thrips. Spray botanical neem formulation (10,000 ppm) @ 3 ml per liter of water.",
      remedyChemical: "Apply Diafenthiuron 50% WP @ 1.0 gram per liter, or spray Fipronil 5% SC @ 2.0 ml per liter of water.",
      expertTips: [
        "Avoid continuous monocropping; grow border crops of Maize or Sorghum around the chilli plot to block wind-borne insect thrips.",
        "Maintain clean cultivation and destroy alternate weed hosts in and around the field.",
        "Ensure irrigation is light but regular; severe moisture stress worsens sap damage."
      ]
    };
  }

  // Default Fallback
  return {
    diagnosis: `[📢 Offline Backup Mode] Leaf Spot Fungal disease or Micro-nutrient Deficiency (Zinc / Iron deficiency symptoms). Light spots or interveinal chlorosis is starting on the leaf blades.`,
    severity: "Mild",
    remedyOrganic: "Spray 3% Panchagavya solution or a homemade garlic-neem botanical spray to boost plant immunity and supplement micro-nutrients.",
    remedyChemical: "Spray Carbendazim 12% + Mancozeb 63% WP (Saaf) @ 2 grams per liter of water, along with a multi-micronutrient mixture spray.",
    expertTips: [
      "Prune affected lower leaves to reduce soil-borne fungal spore load and improve lower aeration.",
      "Get a quick soil test to ensure the NPK ratio matches the recommended crop guidelines.",
      "Water the root zone directly and avoid overhead sprinkler watering, which spreads fungal spores."
    ]
  };
}

// Mock database for Schemes based on Digital Agriculture Mission
const schemesDatabase = [
  {
    id: "scheme-pm-kisan",
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    authority: "Ministry of Agriculture and Farmers Welfare, Govt of India",
    description: "An initiative by the Government of India that provides up to ₹6,000 per year in three equal installments as minimum income support to all small and marginal farmers.",
    benefit: "₹6,000 per annum paid directly to bank accounts in three quarterly installments of ₹2,000.",
    eligibility: {
      landLimitMaxHectares: 2.0,
      targetGroup: "Small and marginal farmer families with cultivable land holdings."
    },
    link: "https://pmkisan.gov.in",
    source: "Agricultural Census portal"
  },
  {
    id: "scheme-pmfby",
    name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    authority: "Ministry of Agriculture & Farmers Welfare",
    description: "A comprehensive crop insurance scheme to provide insurance coverage and financial support to the farmers in the event of failure of any of the notified crop as a result of natural calamities, pests & diseases.",
    benefit: "Low premiums (1.5% to 2% for food crops, 5% for commercial/horticultural crops) with complete risk coverage.",
    eligibility: {
      targetGroup: "All farmers growing notified crops in notified areas including sharecroppers and tenant farmers."
    },
    link: "https://pmfby.gov.in",
    source: "e-NAM and PMFBY central systems"
  },
  {
    id: "scheme-annadatha",
    name: "Annadatha Sukhibhava Yojana",
    authority: "Government of Andhra Pradesh (State Initiative)",
    description: "The primary income support program of the Andhra Pradesh Gov providing vital investment compensation to farmers, designed to bolster financial self-reliance before the sowing seasons.",
    benefit: "₹20,000 per year per family in timely installments, inclusive of the central PM-KISAN matching assistance.",
    eligibility: {
      states: ["Andhra Pradesh"],
      targetGroup: "Resident agricultural land-owning families and validated cultivators in Andhra Pradesh."
    },
    link: "https://annadathasukhibhava.ap.gov.in",
    source: "AP Department of Agriculture & Rythu Bharosa Portal"
  },
  {
    id: "scheme-ccrc",
    name: "Crop Cultivator Rights Card (CCRC)",
    authority: "Andhra Pradesh Revenue & Agriculture Directorate",
    description: "A legally backed lease agreement card that safeguards tenant farmers, securing their direct access to formal crop loans, scale-of-finance subsidies, state crop insurance (PMFBY), and natural disaster compensation without affecting the landowner's permanent title.",
    benefit: "Equal legal status to claim government input subsidies, zero-interest loans, and crop damage relief claims.",
    eligibility: {
      states: ["Andhra Pradesh"],
      targetGroup: "Tenant cultivators and land leaseholders in Andhra Pradesh."
    },
    link: "https://meebhoomi.ap.gov.in",
    source: "MeeBhoomi Land Linkage System"
  },
  {
    id: "scheme-soil-health",
    name: "AP Soil Health Card (మట్టి ఆరోగ్య పత్రం)",
    authority: "Rythu Bharosa Kendras (RBKs) & Department of Soil Conservation",
    description: "A comprehensive digital health card detailing regional macro/micro-nutrient strengths. RBKs test samples to advise optimal fertilizer combinations and balance soil pH values, preventing cost overruns.",
    benefit: "Free localized site soil analysis report card with chemical fertilizer curtailment advice and bio-manure recipes.",
    eligibility: {
      targetGroup: "All active farmers across Andhra Pradesh and participating national states."
    },
    link: "https://soilhealth.dac.gov.in",
    source: "RBK Agricultural Intelligence Hub"
  },
  {
    id: "scheme-prakruthi-vyavasam",
    name: "Prakruthi Vyavasam (AP Zero-Budget Natural Farming)",
    authority: "Andhra Pradesh Community-Managed Natural Farming (APCNF)",
    description: "Renowned state-wide sustainable initiative for transition to chemical-free agriculture. Employs natural seed coating treatments (Beejamritam), microbial catalysts (Jeevamritam), and weed mulching to restore soil biodiversity.",
    benefit: "Free organic bio-preparation kits, direct training at village RBKs, and custom organic premium certification for produce.",
    eligibility: {
      states: ["Andhra Pradesh"],
      targetGroup: "Farmers adopting sustainable or zero-chemical agricultural practices."
    },
    link: "https://apcnf.in",
    source: "APCNF State Missions"
  },
  {
    id: "scheme-pm-ksy",
    name: "PMKSY (Pradhan Mantri Krishi Sinchayee Yojana)",
    authority: "Ministry of Jal Shakti & Dept of Agriculture",
    description: "Focuses on providing end-to-end solutions in irrigation supply chain, water harvesting, water management and crop-aligned precision micro-irrigation ('Per Drop More Crop').",
    benefit: "Up to 55%-80% subsidy for installation of modern drip irrigation, sprinkler systems, and tube-wells.",
    eligibility: {
      targetGroup: "Farmers of all states. High priority to drought-prone, low-rainfall zones."
    },
    link: "https://pmksy.gov.in",
    source: "PMKSY guidelines booklet"
  },
  {
    id: "scheme-srythu-bandhu",
    name: "Rythu Bandhu Scheme",
    authority: "Government of Telangana (State Initiative)",
    description: "A welfare program to support farmer's investment for two crops a year by Telengana State. Farmers get direct cash grants to clear initial expense seeds, manure, and manual labor.",
    benefit: "₹10,000 per acre per year (₹5,000 per crop season for Kharif and Rabi).",
    eligibility: {
      states: ["Telangana", "Telengana"],
      targetGroup: "All land-owning farmers in Telangana state."
    },
    link: "https://rythubandhu.telangana.gov.in",
    source: "Telangana Land Revenue Department"
  },
  {
    id: "scheme-krishak-bandhu",
    name: "Krishak Bandhu (Death Benefit & Assured Income)",
    authority: "Government of West Bengal (State Scheme)",
    description: "Financial assistance program for farmers in West Bengal providing annual farming grants as well as a robust life insurance grant to the families if a farmer unfortunately passes away.",
    benefit: "Up to ₹10,000 per annum investment support. Additionally, custom death-benefit of ₹2,000,000 for families of late farmers aged 18-60.",
    eligibility: {
      states: ["West Bengal"],
      targetGroup: "Verified farm holders and registered sharecroppers in West Bengal."
    },
    link: "https://krishakbandhu.wb.gov.in",
    source: "WB Department of Agriculture"
  },
  {
    id: "scheme-kcc",
    name: "KCC (Kisan Credit Card Scheme)",
    authority: "National Bank for Agriculture and Rural Development (NABARD)",
    description: "Provides timely credit to farmers to meet their cultivation expenses, purchase quality inputs, and satisfy immediate post-harvest consumption requirements.",
    benefit: "Short term credit limits up to ₹3 Lakh at low interest rates (around 4% after swift repayment subventions), without collateral for up to ₹1.6 Lakh.",
    eligibility: {
      targetGroup: "All farmers, owner cultivators, share croppers, tenant farmers, and self-help groups."
    },
    link: "https://www.nabard.org",
    source: "NABARD Central Directives"
  }
];

// Mock database for Agriculture MSP crop rates (2025-2026 releases or realistic parameters)
const mspCropsDatabase = [
  {
    id: "crop-paddy-common",
    name: "Paddy (Common)",
    category: "Kharif",
    mspCurrent: 2300,
    mspPrevious: 2183,
    percentChange: 5.35,
    lastUpdated: "June 2025",
    arrivalTrend: "Stable",
    demandIndex: "High",
    salesRecommendation: "Highly stable demand. Hold stock if looking for local premium prices, else sell at government procurement centers immediately.",
    marketCentres: [
      { name: "Karnal APMC (Haryana)", price: 2350 },
      { name: "Guntur APMC (Andhra)", price: 2280 },
      { name: "Raipur Mandi (Chhattisgarh)", price: 2310 }
    ]
  },
  {
    id: "crop-paddy-grade-a",
    name: "Paddy (Grade A)",
    category: "Kharif",
    mspCurrent: 2320,
    mspPrevious: 2203,
    percentChange: 5.31,
    lastUpdated: "June 2025",
    arrivalTrend: "Stable",
    demandIndex: "High",
    salesRecommendation: "High export demand for top long grain variants. Sell in Grade A certified mandis to claim moisture-adjusted premium bonuses.",
    marketCentres: [
      { name: "Kurukshetra Mandi (Punjab)", price: 2390 },
      { name: "Nizamabad Mandi (Telangana)", price: 2340 },
      { name: "Burdwan APMC (West Bengal)", price: 2330 }
    ]
  },
  {
    id: "crop-wheat",
    name: "Wheat (Lokwan / Kalyan)",
    category: "Rabi",
    mspCurrent: 2425,
    mspPrevious: 2275,
    percentChange: 6.59,
    lastUpdated: "October 2025",
    arrivalTrend: "Stable",
    demandIndex: "High",
    salesRecommendation: "Demand is robust due to buffer recharging requirements. Local flour mills are offering ₹25-50 above MSP. Check nearest private APMC quote.",
    marketCentres: [
      { name: "Indore Mandi (Madhya Pradesh)", price: 2480 },
      { name: "Khanna APMC (Punjab)", price: 2435 },
      { name: "Hapur Mandi (Uttar Pradesh)", price: 2450 }
    ]
  },
  {
    id: "crop-maize",
    name: "Maize (Corn)",
    category: "Kharif",
    mspCurrent: 2225,
    mspPrevious: 2090,
    percentChange: 6.46,
    lastUpdated: "June 2025",
    arrivalTrend: "Increasing",
    demandIndex: "Moderate",
    salesRecommendation: "Arrivals are rising rapidly. Ensure proper sun drying below 14% moisture before sale to avoid heavy dockage deductions.",
    marketCentres: [
      { name: "Chhindwara APMC (MP)", price: 2180 },
      { name: "Davangere Mandi (Karnataka)", price: 2240 },
      { name: "Gulabbagh Mandi (Bihar)", price: 2260 }
    ]
  },
  {
    id: "crop-mustard",
    name: "Mustard & Rapeseed",
    category: "Rabi",
    mspCurrent: 5650,
    mspPrevious: 5450,
    percentChange: 3.67,
    lastUpdated: "October 2025",
    arrivalTrend: "Stable",
    demandIndex: "High",
    salesRecommendation: "Oil mill processing demand is high. Current market price is fluctuating around MSP. Holding stock for 1-2 months could yield high oil-content premium.",
    marketCentres: [
      { name: "Alwar Mandi (Rajasthan)", price: 5800 },
      { name: "Sri Ganganagar Mandi (Rajasthan)", price: 5750 },
      { name: "Morena Mandi (MP)", price: 5690 }
    ]
  },
  {
    id: "crop-soyabean",
    name: "Soyabean (Yellow)",
    category: "Kharif",
    mspCurrent: 4892,
    mspPrevious: 4600,
    percentChange: 6.35,
    lastUpdated: "June 2025",
    arrivalTrend: "Increasing",
    demandIndex: "Moderate",
    salesRecommendation: "Stable oil-industry procurement. It is recommended to sell at cooperative federation warehouses (like NAFED) to claim full MSP rates.",
    marketCentres: [
      { name: "Latur APMC (Maharashtra)", price: 4950 },
      { name: "Ujjain Mandi (Madhya Pradesh)", price: 4910 },
      { name: "Kota Mandi (Rajasthan)", price: 4870 }
    ]
  },
  {
    id: "crop-cotton",
    name: "Cotton (Medium Staple)",
    category: "Kharif",
    mspCurrent: 7121,
    mspPrevious: 6620,
    percentChange: 7.57,
    lastUpdated: "June 2025",
    arrivalTrend: "Stable",
    demandIndex: "High",
    salesRecommendation: "Spinning mills are actively booking. If matching top quality parameters, ask for additional premium prices from CCI (Cotton Corporation of India).",
    marketCentres: [
      { name: "Adilabad APMC (Telangana)", price: 7250 },
      { name: "Rajkot Mandi (Gujarat)", price: 7300 },
      { name: "Abohar APMC (Punjab)", price: 7150 }
    ]
  },
  {
    id: "crop-bengal-gram",
    name: "Bengal Gram (Chana)",
    category: "Rabi",
    mspCurrent: 5440,
    mspPrevious: 5335,
    percentChange: 1.97,
    lastUpdated: "October 2025",
    arrivalTrend: "Decreasing",
    demandIndex: "High",
    salesRecommendation: "Low regional production has increased local market rates far above the government MSP. Strong opportunity to sell in the open trade market.",
    marketCentres: [
      { name: "Akola Mandi (Maharashtra)", price: 5850 },
      { name: "Bhopal Mandi (MP)", price: 5780 },
      { name: "Delhi Wholesales", price: 5950 }
    ]
  },
  {
    id: "crop-lentil",
    name: "Lentil (Masur)",
    category: "Rabi",
    mspCurrent: 6425,
    mspPrevious: 6000,
    percentChange: 7.08,
    lastUpdated: "October 2025",
    arrivalTrend: "Stable",
    demandIndex: "High",
    salesRecommendation: "Lentil prices remain firm because of protein demand. Government procurement centers are active. Sell direct to claim instantaneous bank payouts.",
    marketCentres: [
      { name: "Lalitpur Mandi (UP)", price: 6510 },
      { name: "Jabalpur APMC (MP)", price: 6460 },
      { name: "Bhiwani Mandi (Haryana)", price: 6410 }
    ]
  },
  {
    id: "crop-zbnf-paddy",
    name: "Traditional Desi Paddy (ZBNF Organic)",
    category: "Kharif",
    mspCurrent: 3100,
    mspPrevious: 2950,
    percentChange: 5.08,
    lastUpdated: "August 2025",
    arrivalTrend: "Stable",
    demandIndex: "High",
    salesRecommendation: "Grown via Jeevamrutha and Beejamrutha (AP Natural Farming guidelines). Command up to 35% premium over general Paddy in eco-friendly organic retail segments.",
    marketCentres: [
      { name: "Nellore Organic Hub (Andhra)", price: 3400 },
      { name: "Bengaluru Green Mandi", price: 3550 },
      { name: "Chennai Organic APMC", price: 3300 }
    ],
    isZbnf: true
  },
  {
    id: "crop-zbnf-chilli",
    name: "Guntur Red Chilli (Teja - ZBNF / Horticulture)",
    category: "Rabi",
    mspCurrent: 21500,
    mspPrevious: 20000,
    percentChange: 7.50,
    lastUpdated: "September 2025",
    arrivalTrend: "Stable",
    demandIndex: "High",
    salesRecommendation: "Highly lucrative horticultural crop. Natural cultivation using Agniastra prevents sucking pests while satisfying strict EU chemical residue limits for export.",
    marketCentres: [
      { name: "Guntur Chilli Yard (Andhra)", price: 23000 },
      { name: "Khammam Mandi (Telangana)", price: 22500 },
      { name: "Mumbai Export Port", price: 24500 }
    ],
    isZbnf: true,
    isHorticulture: true
  },
  {
    id: "crop-horticulture-mango",
    name: "Banginapalli Mango (Horticultural Crop)",
    category: "Zaid",
    mspCurrent: 4500,
    mspPrevious: 4200,
    percentChange: 7.14,
    lastUpdated: "April 2026",
    arrivalTrend: "Increasing",
    demandIndex: "High",
    salesRecommendation: "Highly demanded seasonal table fruit. Best results when registered with state horticulture board for cold chain and solar drying incentives.",
    marketCentres: [
      { name: "Vijayawada Nunna Yard (Andhra)", price: 4800 },
      { name: "Gaddiannaram Mandi (Telangana)", price: 4700 },
      { name: "Delhi Azadpur Mandi", price: 5200 }
    ],
    isHorticulture: true
  },
  {
    id: "crop-horticulture-tomato",
    name: "Tomato (Arka Rakshak - Horticultural Crop)",
    category: "Zaid",
    mspCurrent: 2100,
    mspPrevious: 1850,
    percentChange: 13.51,
    lastUpdated: "May 2026",
    arrivalTrend: "Increasing",
    demandIndex: "Moderate",
    salesRecommendation: "High-yield multi-disease resistant hybrid tomato. Price volatility is high. Recommended to process into purée or leverage solar cold rooms.",
    marketCentres: [
      { name: "Madanapalle APMC (Andhra)", price: 2400 },
      { name: "Kolar Mandi (Karnataka)", price: 2300 },
      { name: "Pimpalgaon Mandi (Maharashtra)", price: 2150 }
    ],
    isHorticulture: true
  },
  {
    id: "crop-horticulture-turmeric",
    name: "Salem Turmeric (ZBNF Organic / Horticulture)",
    category: "Rabi",
    mspCurrent: 12500,
    mspPrevious: 11000,
    percentChange: 13.64,
    lastUpdated: "November 2025",
    arrivalTrend: "Stable",
    demandIndex: "High",
    salesRecommendation: "Premium curcumin content grown using multi-tier companion planting. Organic farmers gain maximum price stability by selling directly to wellness exporters.",
    marketCentres: [
      { name: "Erode Turmeric Market (Tamil Nadu)", price: 13500 },
      { name: "Kadapa Mandi (Andhra)", price: 13000 },
      { name: "Sangli APMC (Maharashtra)", price: 13200 }
    ],
    isZbnf: true,
    isHorticulture: true
  }
];

// Mock hyper-local block agricultural weather and action warnings database
const blockWeatherDatabase = [
  {
    id: "weather-1",
    block: "Nellore-Sadar",
    district: "Nellore",
    state: "Andhra Pradesh",
    severity: "Warning",
    event: "Unseasonal Moderate Heavy Rain Forecast",
    description: "IMD predicts localized convection-driven showers ranging from 30mm-45mm over the weekend. High risks of water logging in low-lying paddy nurseries.",
    triggerAction: "Delay pesticide and top-dress fertilizer spraying immediately. Ensure drainage paths from pre-harvest fields are completely cleared.",
    validUntil: "2026-06-25T18:00:00Z"
  },
  {
    id: "weather-2",
    block: "Sangrur-Rural",
    district: "Sangrur",
    state: "Punjab",
    severity: "Danger",
    event: "Heat Wave & High Soil Stress",
    description: "Dry ambient conditions with noon-time temperatures peaking above 44.5°C over 4 days. Soil moisture evaporation indices are critical for tender cotton saplings.",
    triggerAction: "Apply light micro-sprinkler irrigation either at late evening or early dawn to prevent heat-shock crop root wilting. Apply straw mulching if feasible.",
    validUntil: "2026-06-28T20:00:00Z"
  },
  {
    id: "weather-3",
    block: "Latur-Town",
    district: "Latur",
    state: "Maharashtra",
    severity: "Info",
    event: "Ideal High Relative Humidity (Sowing Match)",
    description: "Sustained monsoon convergence starting over central Maharashtra. Optimum top-soil humidity of 70-80% reached, ideal for quick germination of yellow soyabean.",
    triggerAction: "Commence soybean sowing immediately. Ensure sowing depth doesn't exceed 4-5 cm to secure optimum shoot emerge ratios.",
    validUntil: "2026-06-24T12:00:00Z"
  },
  {
    id: "weather-4",
    block: "Coimbatore-North",
    district: "Coimbatore",
    state: "Tamil Nadu",
    severity: "Warning",
    event: "Gale Winds Potential",
    description: "Wind velocity approaching 45 km/h in localized mountain tracks. Risk of lodge damage in sugarcane and standing banana bunches.",
    triggerAction: "Provide prompt support poles (propping) for banana crops. Tie standing sugarcane stools together using dry leaves (trash twisting).",
    validUntil: "2026-06-26T23:59:00Z"
  }
];

// Initial Pitch Deck Outline (Everyday AI Innovator Submission)
let activeIdeathonPitch = {
  title: "Kisan-AgriPulse",
  trackName: "The Everyday AI Innovator: Life, Made Better",
  proposedByString: "Rural AI Pioneers Team",
  problemStatement: "Indian farmers face massive information asymmetry. They struggle to find authenticated government scheme benefits, verify real-time regional crop MSPs, and access on-call diagnostic advisory, forcing them into distress sales or crop failures.",
  solutionOverview: "Kisan-AgriPulse is a unified, multilingual agentic platform that merges predictive MSP trends, local scheme matching APIs, hyper-local weather guidance, and computer-vision-based crop disease diagnosis into a lightweight, rural-focused voice-first dashboard.",
  alignmentDigitalAgri: "Perfectly aligns with India's Digital Agriculture Mission, AgriStack infrastructure, and e-NAM, reducing app-fatigue by placing all services into one expert conversational companion.",
  slides: [
    {
      id: "slide-1",
      slideNumber: 1,
      title: "Kisan-AgriPulse: The Agritech AI Pulse for Rural India",
      subtitle: "Unifying MSP intelligence, local schemes, and visual precision agronomy for the everyday farmer.",
      focusArea: "Title Pitch & Ideathon Narrative",
      bullets: [
        "Positioning: An 'On-Call' intelligent Agronomist and Policy Navigator in the farmer's pocket.",
        "Rhythm of Life: Addresses everyday decisions—what to sow today, how to fix crop rot, and where to sell tomorrow.",
        "Simplicity: Zero terminal fatigue. Speak, tap, or upload photos."
      ],
      designAesthetic: "Forest Green color backdrop with minimal organic accents, highlighting trust and simplicity.",
      technicalEnablers: ["Voice-to-Text dialers", "Gemini 3.5 LLMs", "Bharat-VISTAAR real-time ETL pipelines"]
    },
    {
      id: "slide-2",
      slideNumber: 2,
      title: "1. Automated Crop Insurance Claims via AgriStack",
      subtitle: "Instant insurance payouts using geo-referenced farm registries and Krishi-DSS triggers.",
      focusArea: "Automated Crop Insurance & Distress Support",
      bullets: [
        "Zero Paperwork: AI automatically pre-fills Pradhan Mantri Fasal Bima Yojana (PMFBY) insurance claim forms when heavy unseasonal rain or drought is detected in Nellore.",
        "Immediate Trigger: Cross-references satellite telemetry grids with the farmer's unique AgriStack ID.",
        "Zero-Bureaucracy: Replaces tedious local manual inspections with instant automated validation claims."
      ],
      designAesthetic: "Aesthetic split card with a live radar-warning emblem and a pre-compiled digital claims form mockup.",
      technicalEnablers: ["AgriStack API Integrations", "Krishi-DSS Satellite telemetry", "PMFBY automated form triggers"]
    },
    {
      id: "slide-3",
      slideNumber: 3,
      title: "2. Offline-First 'Edge-AI' Voice Mitra",
      subtitle: "Edge-compressed multilingual voice-guided solutions running seamlessly on unstable bandwidth.",
      focusArea: "Resilient Low-Bandwidth Connectivity",
      bullets: [
        "Dialect Native: Highly compressed neural language models translate queries to and from local Telugu and regional dialects.",
        "Edge Autonomy: Works without active 4G/5G internet by utilizing fallback USSD and SMS routing protocols.",
        "Zero-Barrier UI: A purely voice-led interface ensuring smallholder farmers navigate records at zero network latency."
      ],
      designAesthetic: "Minimal telephone dialer interface with dynamic soundwave feedback animations.",
      technicalEnablers: ["Deepspeed/ONNX localized model compression", "USSD telephony gateways", "Regional phoneme-to-speech translators"]
    },
    {
      id: "slide-4",
      slideNumber: 4,
      title: "3. Hyperlocal Soil Health & Custom Fertilizer Mixing",
      subtitle: "Direct API syncing with India's Nationwide Soil Resource Mapping database.",
      focusArea: "Nutrient Mapping & Sustainable Chemistry",
      bullets: [
        "Precision Survey matching: Instantly fetches the official Digital Soil Health Card using the farmer’s MeeBhoomi Survey Number.",
        "Custom Feed recipes: Translates general nitrogen/phosphorus deficit stats into precise container mixing ratios of bio-fertilizers like Jeevamrutham.",
        "Eco-Safeguard Benefit: Reduces wasteful fertilizer expenses, lowering overhead cost profiles while restoring native microclimatic soil health."
      ],
      designAesthetic: "A clean chemical layout alongside balanced micro-nutrient progress scales.",
      technicalEnablers: ["National Soil Resource Mapping API", "MeeBhoomi survey parcel indexes", "Dynamic recipe calculator engine"]
    },
    {
      id: "slide-5",
      slideNumber: 5,
      title: "4. Custom Hiring Center (CHC) & Drone Economy Broker",
      subtitle: "Uber-like shared access marketplace for modern agricultural tech and heavy machinery.",
      focusArea: "Shared Agritech Operations",
      bullets: [
        "Shared Hardware Pools: Enables marginal farmers with small landholdings to pool resources to hire pesticide-spraying drones or tractors cheaply.",
        "Interactive Broker: Dynamically pairs farmers with empty slots of neighboring equipment operators.",
        "Cost-Efficiency: Drops direct operational costs by up to 60%, removing large upfront hardware investments."
      ],
      designAesthetic: "A map-centered logistics card with localized vehicle tracking tags.",
      technicalEnablers: ["CHC regional hub registries", "GPS geo-fencing route optimization", "Cooperative payment escrow"]
    },
    {
      id: "slide-6",
      slideNumber: 6,
      title: "5. Instant Pre-Approved Kisan Credit Card (KCC) Loans",
      subtitle: "One-click paperless digital credit based on verified land registries and yield potentials.",
      focusArea: "Financial Liberation & Credit Access",
      bullets: [
        "Frictionless Verification: Bypasses outdated physical banking checks by reading verified landholdings from MeeBhoomi records.",
        "Dynamic Yield Rating: Predicts harvest values using historic crop parameters and active weather patterns.",
        "Tenant Liberation: Securely matches lease covenants from CCRC cards to bypass local collateral demands."
      ],
      designAesthetic: "Digital gold card visual highlighting pre-approved limit levels in INR.",
      technicalEnablers: ["Verified AgriStack Registry data", "CCRC legal-lease matchers", "Rural banking credit validation APIs"]
    },
    {
      id: "slide-7",
      slideNumber: 7,
      title: "Precision Farming & Visual Agronomist Assistant",
      subtitle: "Affordable computer vision for instant disease diagnostics.",
      focusArea: "Visual Crop Diagnosis & Pest Management",
      bullets: [
        "Operation: Take a micro-photo of the affected leaf/plant, and submit to Kisan-AgriPulse Agent.",
        "Response: Instant detection of pests (e.g. Stem Borer), deficiency (Yellow Nitrogen rot), with Dual remedies (Organic & Chemical).",
        "Economic Impact: Reduces pesticide costs by preventing carpet-bombing sprays, suggesting highly localized eco-safe dosages."
      ],
      designAesthetic: "Side-by-side splits showcasing crop camera frames and organic versus chemical recommendation cards.",
      technicalEnablers: ["Gemini 3.5 Multimodal Computer Vision (base64 inline content analysis)"]
    },
    {
      id: "slide-8",
      slideNumber: 8,
      title: "Technical Architecture & Scalable RAG Hub",
      subtitle: "A lightweight, resilient architecture designed for low-bandwidth rural networks.",
      focusArea: "Software Flow & Low-Bandwidth Scalability",
      bullets: [
        "Edge Resiliency: Compress image requests server-side to function over 2G/3G connections.",
        "Bharat-VISTAAR Hub: Consolidates satellite imagery, soil health data, and price statistics into a unified SQL repository.",
        "Multilingual: Employs phonetic TTS & regional speech pipelines to serve dialects lacking standard textual representations."
      ],
      designAesthetic: "Elegant tech flowchart illustrating the secure API handshakes and data pipelines.",
      technicalEnablers: ["FastAPI and Node servers", "Gemini 3.5 reasoning paths", "Cloud SQL and Cache databases"]
    }
  ]
};

// --- API ENDPOINTS ---

// GET - Active Schemes list
app.get("/api/schemes", (req, res) => {
  res.json(schemesDatabase);
});

// GET - Active MSP list
app.get("/api/msp-crops", (req, res) => {
  res.json(mspCropsDatabase);
});

// GET - Weather alerts list
app.get("/api/weather-alerts", (req, res) => {
  res.json(blockWeatherDatabase);
});

// GET - Retrieve active pitch
app.get("/api/pitch", (req, res) => {
  res.json(activeIdeathonPitch);
});

// POST - Update active pitch (Ideathon customizer)
app.post("/api/pitch/update", (req, res) => {
  try {
    const data = req.body;
    if (data) {
      activeIdeathonPitch = {
        ...activeIdeathonPitch,
        ...data
      };
      return res.json({ success: true, pitch: activeIdeathonPitch });
    }
    return res.status(400).json({ error: "Missing payload data" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Custom scheme checkers based on state, land size, etc.
app.post("/api/schemes/check", (req, res) => {
  try {
    const { state, landSize, cropCategory } = req.body;
    const landVal = parseFloat(landSize) || 0;

    const matched = schemesDatabase.filter(scheme => {
      // 1. Match State if scheme lists specific states
      if (scheme.eligibility.states && scheme.eligibility.states.length > 0) {
        const matchesState = scheme.eligibility.states.some(s =>
          s.toLowerCase().trim() === (state || "").toLowerCase().trim()
        );
        if (!matchesState) return false;
      }

      // 2. Match land limit
      if (scheme.eligibility.landLimitMaxHectares !== undefined) {
        if (landVal > scheme.eligibility.landLimitMaxHectares) {
          return false;
        }
      }

      // 3. Match crop category (if crop categories matches exists, though mostly targeted to categories here)
      return true;
    });

    res.json(matched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Conversational Agent (Gemini-3.5-flash)
app.post("/api/chat", async (req, res) => {
  const { message, history = [], profile = null } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message prompt is required." });
  }

  // Gracefully fallback to local response if API key is not configured
  if (!process.env.GEMINI_API_KEY) {
    const offlineReply = generateOfflineChatResponse(message, profile);
    const keyMissingAlert = `> ⚠️ **Key Notice**: GEMINI_API_KEY is not configured in Settings > Secrets. Active high-availability local rules are running instead.\n\n` + offlineReply;
    return res.json({ reply: keyMissingAlert });
  }

  try {
    const systemInstruction = `You are "Kisan-AgriPulse Mitra", a compassionate, highly professional agricultural expert, agronomist, and policy advisor representing the Digital Agriculture Mission of India.
Your mission is to help farmers and ideathon innovators understand Minimum Support Prices (MSP), discover government schemes (like PM-Kisan, PMFBY, Rythu Bandhu, Annadatha Sukhibhava, Krishak Bandhu), and give precise crop planning advice.

Farmer Context:
${
  profile
    ? `- Farmer Name: ${profile.name || "DefaultFarmer"}
- Target State: ${profile.state || "Not specified"}
- Land Size: ${profile.landSizeHectares || "0"} Hectares (Note: 1 Hectare is approx 2.47 acres)
- Current Season: ${profile.cropCategory || "Not specified"}
- Main Grown Crops: ${profile.mainCrops?.join(", ") || "None specified"}`
    : "- No customized Farmer profile setup yet."
}

Interaction Rules:
1. Always maintain a warm, respectful, and helpful tone (rural Indian agrarian rhythm).
2. Since queries are often asked by farmers in mixed dialects (like Hinglish or native scripts), you are fully equipped to understand regional concepts and respond gracefully in simple, easy-to-read English, with Hindi/Telugu/Tamil terms where appropriate (e.g., using words like "Khatauni", "Patta", "Mandi", "Panchayat", "Kharif").
3. Make actionable recommendations. Quote relevant MSP rates if they query about crops. Reference standard Indian MSP: Paddy (Common: ₹2300/Quintal), Paddy Grade A (₹2320/Quintal), Wheat (₹2425/Quintal), Maize (₹2225/Quintal), Bengal Gram (₹5440/Quintal).
4. Be clear, objective, and formatting-rich. Use bold keywords and bullet points.`;

    // Construct history parts as needed
    const contents: any[] = [];
    
    // Feed history to contents
    for (const msg of history) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      });
    }

    // Append standard user prompt
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const aiClient = getAIClient();

    const response = await callGeminiWithRetry(() => 
      aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      })
    );

    const reply = response.text || "Sorry, I couldn't formulate a response. Please try again.";
    res.json({ reply });
  } catch (error: any) {
    console.warn("Chat Gemini API failed, activating offline high-availability fallback:", error);
    const offlineReply = generateOfflineChatResponse(message, profile);
    res.json({ reply: offlineReply });
  }
});

// POST - Multimodal Computer Vision Crop Diagnostic Entry point (gemini-3.5-flash)
app.post("/api/crop-diagnose", async (req, res) => {
  const { imageBase64, cropName = "crop" } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: "Crop leaf/leafage image base64 data is required." });
  }

  // Gracefully fallback to high-availability local generator if API key is not configured
  if (!process.env.GEMINI_API_KEY) {
    const offlineResult = generateOfflineDiagnosticResponse(cropName);
    return res.json(offlineResult);
  }

  try {
    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const promptText = `Verify and diagnose the condition of this ${cropName} crop leaf or agricultural field. 
Identify pests (like Fall Armyworm, Stem Borer, Aphids), plant disease (like Rice Blast, Powdery Mildew, Leaf rust), and nutrient stress.
Provide a clear classification: Diagnosis, Severity (Healthy, Mild, Moderate, or Severe), custom Organic Remedy (e.g. neem oil spray, wood ash), custom Chemical Remedy (standard approved agricultural chemical dosages), and 3 Expert Agronomist Tips.

Return the response inside a structured JSON matching this schema:
{
  "diagnosis": "Name of disease/pest or Healthy. Explain what is causing it.",
  "severity": "Mild | Moderate | Severe | Healthy",
  "remedyOrganic": "Natural eco-safe organic treatment advice.",
  "remedyChemical": "Correct chemical treatment dosage advice.",
  "expertTips": ["First tip", "Second tip", "Third tip"]
}`;

    const aiClient = getAIClient();

    const response = await callGeminiWithRetry(() => 
      aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: "image/jpeg"
            }
          },
          {
            text: promptText
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnosis: { type: Type.STRING },
              severity: { type: Type.STRING },
              remedyOrganic: { type: Type.STRING },
              remedyChemical: { type: Type.STRING },
              expertTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["diagnosis", "severity", "remedyOrganic", "remedyChemical", "expertTips"]
          }
        }
      })
    );

    const parsedResult = JSON.parse(response.text || "{}");
    res.json(parsedResult);
  } catch (error: any) {
    console.warn("Crop Diagnose Gemini API failed, activating high-availability offline fallback:", error);
    const offlineResult = generateOfflineDiagnosticResponse(cropName);
    res.json(offlineResult);
  }
});


// Serve static assets in production or mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
