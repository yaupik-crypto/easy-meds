/**
 * Curated clash rules for well-known drug/supplement interactions.
 *
 * This is deliberately conservative and readable: each "agent" is a drug,
 * supplement or class matched by name/ingredient keywords, and each rule
 * describes a documented interaction between two agents. It is a safety net,
 * not a complete interaction database — the openFDA label check and a
 * pharmacist are the other two legs of the stool.
 */
import type { Medication } from "./types"

export type Severity = "avoid" | "caution" | "info"

export type Agent = {
  id: string
  label: string
  /** lower-case substrings matched against the product name and ingredients */
  keywords: string[]
  /** extra class words to look for inside FDA label text (never used for product matching) */
  labelTerms?: string[]
}

export type Rule = {
  a: string
  b: string
  severity: Severity
  summary: string
  advice: string
}

export const AGENTS: Agent[] = [
  { id: "anticoagulant", label: "blood thinners", keywords: ["warfarin", "coumadin", "apixaban", "eliquis", "rivaroxaban", "xarelto", "dabigatran", "pradaxa", "edoxaban", "heparin", "enoxaparin", "clexane"], labelTerms: ["anticoagulant", "blood thinn"] },
  { id: "antiplatelet", label: "antiplatelet drugs", keywords: ["clopidogrel", "plavix", "ticagrelor", "brilinta", "prasugrel", "dipyridamole"], labelTerms: ["antiplatelet"] },
  { id: "aspirin", label: "aspirin", keywords: ["aspirin", "acetylsalicylic", "asa "], labelTerms: ["salicylate"] },
  { id: "nsaid", label: "NSAID painkillers", keywords: ["ibuprofen", "advil", "nurofen", "naproxen", "aleve", "diclofenac", "voltaren", "celecoxib", "celebrex", "mefenamic", "ponstan", "meloxicam", "indomethacin", "ketorolac", "etoricoxib", "arcoxia"], labelTerms: ["nsaid", "nonsteroidal anti-inflammatory", "non-steroidal anti-inflammatory"] },
  { id: "ibuprofen", label: "ibuprofen", keywords: ["ibuprofen", "advil", "nurofen", "brufen", "motrin"], labelTerms: ["ibuprofen"] },
  { id: "paracetamol", label: "paracetamol / acetaminophen", keywords: ["paracetamol", "acetaminophen", "panadol", "tylenol"], labelTerms: ["acetaminophen"] },
  { id: "ssri", label: "SSRI / SNRI antidepressants", keywords: ["sertraline", "zoloft", "fluoxetine", "prozac", "escitalopram", "lexapro", "citalopram", "paroxetine", "fluvoxamine", "venlafaxine", "effexor", "duloxetine", "cymbalta", "desvenlafaxine", "vortioxetine"], labelTerms: ["ssri", "snri", "serotonin reuptake", "antidepressant"] },
  { id: "maoi", label: "MAOI antidepressants", keywords: ["phenelzine", "tranylcypromine", "moclobemide", "selegiline", "isocarboxazid", "linezolid"], labelTerms: ["monoamine oxidase", "mao inhibitor", "maoi"] },
  { id: "tramadol", label: "tramadol", keywords: ["tramadol", "ultram"] },
  { id: "triptan", label: "triptan migraine drugs", keywords: ["sumatriptan", "imigran", "rizatriptan", "zolmitriptan", "eletriptan", "naratriptan"] },
  { id: "statin", label: "statins", keywords: ["atorvastatin", "lipitor", "simvastatin", "zocor", "rosuvastatin", "crestor", "pravastatin", "lovastatin", "fluvastatin", "pitavastatin"], labelTerms: ["hmg-coa reductase", "statin"] },
  { id: "levothyroxine", label: "thyroid hormone", keywords: ["levothyroxine", "thyroxine", "euthyrox", "synthroid", "eltroxin", "liothyronine"], labelTerms: ["thyroid hormone"] },
  { id: "calcium", label: "calcium", keywords: ["calcium"] },
  { id: "iron", label: "iron", keywords: ["iron", "ferrous", "ferric"] },
  { id: "magnesium", label: "magnesium", keywords: ["magnesium"] },
  { id: "zinc", label: "zinc", keywords: ["zinc"] },
  { id: "antacid", label: "antacids", keywords: ["antacid", "gaviscon", "tums", "aluminium hydroxide", "aluminum hydroxide", "sucralfate"], labelTerms: ["antacid"] },
  { id: "penicillin", label: "penicillin antibiotics", keywords: ["penicillin", "amoxicillin", "amoxycillin", "augmentin", "co-amoxiclav", "ampicillin", "flucloxacillin", "piperacillin", "phenoxymethylpenicillin"], labelTerms: ["penicillin"] },
  { id: "cephalosporin", label: "cephalosporin antibiotics", keywords: ["cefalexin", "cephalexin", "cefuroxime", "cefaclor", "ceftriaxone", "cefixime", "cefpodoxime"], labelTerms: ["cephalosporin"] },
  { id: "sulfonamide", label: "sulfa antibiotics", keywords: ["sulfamethoxazole", "co-trimoxazole", "bactrim", "septrin", "sulfasalazine", "sulfadiazine"], labelTerms: ["sulfonamide", "sulfa"] },
  { id: "tetracycline", label: "tetracycline antibiotics", keywords: ["doxycycline", "minocycline", "tetracycline"], labelTerms: ["tetracycline"] },
  { id: "quinolone", label: "quinolone antibiotics", keywords: ["ciprofloxacin", "cipro", "levofloxacin", "moxifloxacin", "ofloxacin", "norfloxacin"], labelTerms: ["quinolone"] },
  { id: "bisphosphonate", label: "bone-density drugs", keywords: ["alendronate", "fosamax", "risedronate", "ibandronate"], labelTerms: ["bisphosphonate"] },
  { id: "ace_arb", label: "ACE inhibitors / ARBs", keywords: ["lisinopril", "enalapril", "ramipril", "perindopril", "captopril", "losartan", "valsartan", "irbesartan", "candesartan", "telmisartan", "olmesartan"], labelTerms: ["ace inhibitor", "angiotensin"] },
  { id: "k_sparing", label: "potassium-sparing diuretics", keywords: ["spironolactone", "aldactone", "eplerenone", "amiloride", "triamterene"], labelTerms: ["potassium-sparing"] },
  { id: "potassium", label: "potassium", keywords: ["potassium"] },
  { id: "diuretic", label: "diuretics (water tablets)", keywords: ["furosemide", "lasix", "hydrochlorothiazide", "hctz", "indapamide", "bendroflumethiazide", "chlorthalidone", "bumetanide"], labelTerms: ["diuretic", "water pill"] },
  { id: "ccb", label: "calcium-channel blockers", keywords: ["amlodipine", "norvasc", "nifedipine", "felodipine", "diltiazem", "verapamil"], labelTerms: ["calcium channel blocker"] },
  { id: "metformin", label: "metformin", keywords: ["metformin", "glucophage"], labelTerms: ["metformin"] },
  { id: "sulfonylurea", label: "sulfonylurea diabetes drugs", keywords: ["gliclazide", "glimepiride", "glipizide", "glibenclamide", "glyburide"], labelTerms: ["sulfonylurea"] },
  { id: "insulin", label: "insulin", keywords: ["insulin", "lantus", "novorapid", "humalog"], labelTerms: ["insulin"] },
  { id: "ppi", label: "acid reducers (PPIs)", keywords: ["omeprazole", "esomeprazole", "nexium", "pantoprazole", "lansoprazole", "rabeprazole"], labelTerms: ["proton pump inhibitor"] },
  { id: "benzo", label: "benzodiazepines / sleep tablets", keywords: ["diazepam", "valium", "lorazepam", "ativan", "alprazolam", "xanax", "clonazepam", "temazepam", "zolpidem", "stilnox", "ambien", "zopiclone"], labelTerms: ["benzodiazepine", "sedative", "tranquilizer"] },
  { id: "opioid", label: "opioid painkillers", keywords: ["codeine", "oxycodone", "oxycontin", "morphine", "hydrocodone", "fentanyl", "dihydrocodeine", "tapentadol"], labelTerms: ["opioid", "narcotic"] },
  { id: "antihistamine_sedating", label: "sedating antihistamines", keywords: ["diphenhydramine", "benadryl", "chlorpheniramine", "chlorphenamine", "promethazine", "phenergan", "doxylamine", "hydroxyzine"], labelTerms: ["antihistamine"] },
  { id: "contraceptive", label: "hormonal contraceptives", keywords: ["contraceptive", "ethinyl", "ethinylestradiol", "levonorgestrel", "desogestrel", "drospirenone", "yasmin", "yaz", "microgynon", "the pill"], labelTerms: ["oral contraceptive", "birth control"] },
  { id: "digoxin", label: "digoxin", keywords: ["digoxin", "lanoxin"] },
  { id: "lithium", label: "lithium", keywords: ["lithium"] },
  { id: "methotrexate", label: "methotrexate", keywords: ["methotrexate"] },
  { id: "immunosuppressant", label: "immunosuppressants", keywords: ["ciclosporin", "cyclosporine", "tacrolimus", "azathioprine", "mycophenolate", "sirolimus"], labelTerms: ["immunosuppressant"] },
  { id: "nitrate", label: "nitrates", keywords: ["nitroglycerin", "glyceryl trinitrate", "isosorbide"], labelTerms: ["nitrate"] },
  { id: "pde5", label: "erectile dysfunction drugs", keywords: ["sildenafil", "viagra", "tadalafil", "cialis", "vardenafil"], labelTerms: ["pde5", "phosphodiesterase"] },
  { id: "retinoid", label: "oral retinoids", keywords: ["isotretinoin", "roaccutane", "accutane", "acitretin"] },
  { id: "metronidazole", label: "metronidazole", keywords: ["metronidazole", "flagyl", "tinidazole"] },
  { id: "corticosteroid", label: "steroid tablets", keywords: ["prednisolone", "prednisone", "dexamethasone", "hydrocortisone tablet", "methylprednisolone"], labelTerms: ["corticosteroid", "steroid"] },
  { id: "cyp3a4_inhibitor_antifungal", label: "azole antifungals", keywords: ["ketoconazole", "itraconazole", "fluconazole", "voriconazole"], labelTerms: ["azole antifungal"] },
  { id: "macrolide", label: "macrolide antibiotics", keywords: ["clarithromycin", "erythromycin", "azithromycin"], labelTerms: ["macrolide"] },
  { id: "carbamazepine", label: "carbamazepine / phenytoin", keywords: ["carbamazepine", "tegretol", "phenytoin", "phenobarbital"], labelTerms: ["anticonvulsant", "antiepileptic"] },

  // Supplements & herbs
  { id: "st_johns_wort", label: "St John's Wort", keywords: ["st john", "st. john", "hypericum"], labelTerms: ["st. john", "hypericum"] },
  { id: "ginkgo", label: "ginkgo", keywords: ["ginkgo", "gingko"] },
  { id: "garlic_supp", label: "garlic supplements", keywords: ["garlic"] },
  { id: "ginger", label: "ginger", keywords: ["ginger"] },
  { id: "turmeric", label: "turmeric / curcumin", keywords: ["turmeric", "curcumin"] },
  { id: "fish_oil", label: "fish oil / omega-3", keywords: ["fish oil", "omega-3", "omega 3", "krill", "epa/dha", "dha"] },
  { id: "vitamin_e", label: "vitamin E", keywords: ["vitamin e", "tocopherol"] },
  { id: "vitamin_k", label: "vitamin K", keywords: ["vitamin k", "phytonadione", "menaquinone", "mk-7", "mk7"] },
  { id: "vitamin_a", label: "vitamin A", keywords: ["vitamin a", "retinol"] },
  { id: "vitamin_b12", label: "vitamin B12", keywords: ["b12", "cobalamin"] },
  { id: "vitamin_c", label: "vitamin C", keywords: ["vitamin c", "ascorbic acid", "ascorbate"] },
  { id: "vitamin_b6", label: "vitamin B6", keywords: ["vitamin b6", "pyridoxine"] },
  { id: "folic_acid", label: "folic acid", keywords: ["folic acid", "folate"], labelTerms: ["folic acid"] },
  { id: "niacin", label: "niacin (B3)", keywords: ["niacin", "nicotinamide", "niacinamide", "vitamin b3"] },
  { id: "ginseng", label: "ginseng", keywords: ["ginseng", "panax"] },
  { id: "dong_quai", label: "dong quai", keywords: ["dong quai", "angelica sinensis", "danggui"] },
  { id: "danshen", label: "danshen", keywords: ["danshen", "dan shen", "salvia miltiorrhiza"] },
  { id: "licorice", label: "licorice", keywords: ["licorice", "liquorice", "glycyrrh"] },
  { id: "kava", label: "kava", keywords: ["kava"] },
  { id: "valerian", label: "valerian", keywords: ["valerian"] },
  { id: "melatonin", label: "melatonin", keywords: ["melatonin"] },
  { id: "serotonergic_supp", label: "5-HTP / tryptophan / SAMe", keywords: ["5-htp", "5htp", "tryptophan", "same ", "s-adenosyl"] },
  { id: "echinacea", label: "echinacea", keywords: ["echinacea"] },
  { id: "ashwagandha", label: "ashwagandha", keywords: ["ashwagandha", "withania"] },
  { id: "cinnamon", label: "cinnamon (cassia)", keywords: ["cinnamon", "cassia", "cinnamomum"] },
  { id: "green_tea_extract", label: "green tea extract", keywords: ["green tea extract", "egcg"] },
  { id: "grapefruit", label: "grapefruit", keywords: ["grapefruit"], labelTerms: ["grapefruit"] },
  { id: "alcohol", label: "alcohol", keywords: ["alcohol", "wine", "beer", "spirits"], labelTerms: ["alcohol"] },
  { id: "caffeine", label: "caffeine", keywords: ["caffeine", "guarana"] },
  { id: "red_yeast_rice", label: "red yeast rice", keywords: ["red yeast rice", "monacolin"] },
  { id: "coq10", label: "CoQ10", keywords: ["coq10", "coenzyme q10", "ubiquinol"] },
  { id: "chromium_berberine", label: "blood-sugar-lowering herbs", keywords: ["berberine", "chromium", "bitter melon", "gymnema", "fenugreek"] },
  { id: "goldenseal", label: "goldenseal", keywords: ["goldenseal"] },
]

const BLEED = "Both can increase bleeding risk; together the effect adds up."
const BLEED_ADVICE = "Ask your doctor or pharmacist before combining. Watch for unusual bruising, nosebleeds or dark stools."
const ABSORB = (what: string, gap: string) =>
  `${what} can bind to it in the gut and stop it being absorbed properly. Keep doses ${gap} apart.`

export const RULES: Rule[] = [
  // Bleeding risk
  { a: "anticoagulant", b: "nsaid", severity: "avoid", summary: "NSAIDs with blood thinners raise the risk of serious bleeding, including stomach bleeds.", advice: "Avoid unless a doctor specifically approved it. Paracetamol is usually the safer painkiller." },
  { a: "anticoagulant", b: "aspirin", severity: "avoid", summary: "Aspirin plus a blood thinner strongly increases bleeding risk.", advice: "Only combine under specialist advice." },
  { a: "anticoagulant", b: "antiplatelet", severity: "caution", summary: "Two drugs that both stop clotting add up to a higher bleeding risk.", advice: "This is sometimes prescribed on purpose; confirm both are still meant to be taken together." },
  { a: "antiplatelet", b: "nsaid", severity: "caution", summary: BLEED, advice: BLEED_ADVICE },
  { a: "aspirin", b: "nsaid", severity: "caution", summary: "Ibuprofen and similar NSAIDs can blunt the heart-protective effect of low-dose aspirin and add stomach irritation.", advice: "If aspirin is for your heart, take it at least 30 minutes before, or 8 hours after, the NSAID. Ask a pharmacist." },
  { a: "anticoagulant", b: "ginkgo", severity: "caution", summary: BLEED, advice: BLEED_ADVICE },
  { a: "anticoagulant", b: "garlic_supp", severity: "caution", summary: "High-dose garlic supplements have a mild blood-thinning effect on top of the medication.", advice: BLEED_ADVICE },
  { a: "anticoagulant", b: "ginger", severity: "info", summary: "Ginger supplements may slightly increase bleeding tendency with blood thinners.", advice: "Culinary amounts are fine; check before taking concentrated ginger." },
  { a: "anticoagulant", b: "turmeric", severity: "caution", summary: "Curcumin may add to the anticoagulant effect and raise INR.", advice: BLEED_ADVICE },
  { a: "anticoagulant", b: "fish_oil", severity: "info", summary: "High-dose omega-3 has a mild antiplatelet effect.", advice: "Usually fine at normal doses; mention it to whoever monitors your INR." },
  { a: "anticoagulant", b: "vitamin_e", severity: "caution", summary: "High-dose vitamin E can increase bleeding with warfarin.", advice: "Keep vitamin E below 400 IU/day unless advised otherwise." },
  { a: "anticoagulant", b: "vitamin_k", severity: "caution", summary: "Vitamin K works against warfarin, so INR can drop and clots become more likely.", advice: "Keep vitamin K intake steady rather than starting or stopping suddenly; tell your INR clinic." },
  { a: "anticoagulant", b: "st_johns_wort", severity: "avoid", summary: "St John's Wort speeds up the breakdown of warfarin and some newer blood thinners, making them less effective.", advice: "Avoid the combination." },
  { a: "anticoagulant", b: "dong_quai", severity: "caution", summary: "Dong quai contains coumarin-like compounds that add to blood-thinning.", advice: BLEED_ADVICE },
  { a: "anticoagulant", b: "danshen", severity: "caution", summary: "Danshen increases the effect of warfarin.", advice: BLEED_ADVICE },
  { a: "anticoagulant", b: "ginseng", severity: "caution", summary: "Ginseng can unpredictably change how well warfarin works.", advice: "Check with the INR clinic before starting or stopping." },
  { a: "anticoagulant", b: "cinnamon", severity: "info", summary: "Cassia cinnamon contains coumarin; large supplement doses may add slightly to blood-thinning and stress the liver.", advice: "Food amounts are fine; be cautious with concentrated capsules." },
  { a: "anticoagulant", b: "melatonin", severity: "info", summary: "A few reports link melatonin with changes in warfarin effect.", advice: "Mention it at your next INR check." },
  { a: "antiplatelet", b: "ginkgo", severity: "caution", summary: BLEED, advice: BLEED_ADVICE },
  { a: "antiplatelet", b: "ppi", severity: "caution", summary: "Omeprazole and esomeprazole can reduce how well clopidogrel works.", advice: "Pantoprazole is usually preferred with clopidogrel; ask your doctor." },
  { a: "nsaid", b: "ginkgo", severity: "info", summary: BLEED, advice: BLEED_ADVICE },

  // Serotonin syndrome
  { a: "ssri", b: "maoi", severity: "avoid", summary: "Combining these can cause serotonin syndrome, a medical emergency.", advice: "Never combine; a washout period is needed when switching." },
  { a: "ssri", b: "tramadol", severity: "caution", summary: "Tramadol with an SSRI/SNRI raises the risk of serotonin syndrome and seizures.", advice: "Only under a doctor's supervision. Seek help for agitation, sweating, tremor or fast heartbeat." },
  { a: "ssri", b: "triptan", severity: "info", summary: "A small serotonin-syndrome risk when triptans are used with SSRIs/SNRIs.", advice: "Commonly co-prescribed; know the warning signs." },
  { a: "ssri", b: "st_johns_wort", severity: "avoid", summary: "St John's Wort acts like an antidepressant; together the serotonin effect can become dangerous.", advice: "Do not combine." },
  { a: "ssri", b: "serotonergic_supp", severity: "avoid", summary: "5-HTP, tryptophan and SAMe all raise serotonin and can trigger serotonin syndrome with antidepressants.", advice: "Avoid unless a doctor is managing both." },
  { a: "ssri", b: "nsaid", severity: "caution", summary: "SSRIs plus NSAIDs increase the chance of stomach bleeding.", advice: "Use paracetamol where possible, or ask about stomach protection." },
  { a: "ssri", b: "anticoagulant", severity: "caution", summary: "SSRIs reduce platelet function; with a blood thinner bleeding risk goes up.", advice: BLEED_ADVICE },
  { a: "maoi", b: "tramadol", severity: "avoid", summary: "Dangerous serotonin and blood-pressure reactions.", advice: "Never combine." },
  { a: "maoi", b: "serotonergic_supp", severity: "avoid", summary: "Serotonin syndrome risk.", advice: "Avoid." },
  { a: "tramadol", b: "st_johns_wort", severity: "caution", summary: "Additive serotonin effect.", advice: "Avoid the combination." },

  // St John's Wort induces many drugs
  { a: "st_johns_wort", b: "contraceptive", severity: "avoid", summary: "St John's Wort can make hormonal contraception fail.", advice: "Use extra contraception and ask a pharmacist about alternatives." },
  { a: "st_johns_wort", b: "digoxin", severity: "avoid", summary: "Lowers digoxin levels.", advice: "Avoid." },
  { a: "st_johns_wort", b: "immunosuppressant", severity: "avoid", summary: "Can cause transplant medication to fall to dangerous levels.", advice: "Never combine." },
  { a: "st_johns_wort", b: "statin", severity: "caution", summary: "Can reduce simvastatin and atorvastatin levels.", advice: "Tell your doctor." },
  { a: "st_johns_wort", b: "benzo", severity: "caution", summary: "Reduces the effect of some sedatives.", advice: "Tell your doctor." },
  { a: "st_johns_wort", b: "ccb", severity: "caution", summary: "May reduce blood-pressure control.", advice: "Monitor blood pressure; tell your doctor." },

  // Absorption clashes
  { a: "levothyroxine", b: "calcium", severity: "caution", summary: ABSORB("Calcium", "at least 4 hours"), advice: "Take thyroid medication alone on an empty stomach; calcium later in the day." },
  { a: "levothyroxine", b: "iron", severity: "caution", summary: ABSORB("Iron", "at least 4 hours"), advice: "Take thyroid medication first thing; iron with lunch or dinner." },
  { a: "levothyroxine", b: "magnesium", severity: "info", summary: ABSORB("Magnesium", "about 4 hours"), advice: "Separate the doses." },
  { a: "levothyroxine", b: "antacid", severity: "caution", summary: ABSORB("Antacids", "at least 4 hours"), advice: "Separate the doses." },
  { a: "levothyroxine", b: "ppi", severity: "info", summary: "Reduced stomach acid can lower thyroxine absorption over time.", advice: "Keep taking both consistently; thyroid levels may need re-checking." },
  { a: "levothyroxine", b: "ashwagandha", severity: "caution", summary: "Ashwagandha can raise thyroid hormone levels on top of medication.", advice: "Ask your doctor before combining." },
  { a: "tetracycline", b: "calcium", severity: "caution", summary: ABSORB("Calcium (including dairy)", "2–3 hours"), advice: "Take the antibiotic 2 hours before or after." },
  { a: "tetracycline", b: "iron", severity: "caution", summary: ABSORB("Iron", "2–3 hours"), advice: "Separate the doses." },
  { a: "tetracycline", b: "magnesium", severity: "caution", summary: ABSORB("Magnesium", "2–3 hours"), advice: "Separate the doses." },
  { a: "tetracycline", b: "zinc", severity: "caution", summary: ABSORB("Zinc", "2–3 hours"), advice: "Separate the doses." },
  { a: "tetracycline", b: "antacid", severity: "caution", summary: ABSORB("Antacids", "2–3 hours"), advice: "Separate the doses." },
  { a: "quinolone", b: "calcium", severity: "caution", summary: ABSORB("Calcium", "2 hours before or 6 hours after"), advice: "Separate the doses." },
  { a: "quinolone", b: "iron", severity: "caution", summary: ABSORB("Iron", "2 hours before or 6 hours after"), advice: "Separate the doses." },
  { a: "quinolone", b: "magnesium", severity: "caution", summary: ABSORB("Magnesium", "2 hours before or 6 hours after"), advice: "Separate the doses." },
  { a: "quinolone", b: "zinc", severity: "caution", summary: ABSORB("Zinc", "2 hours before or 6 hours after"), advice: "Separate the doses." },
  { a: "quinolone", b: "antacid", severity: "caution", summary: ABSORB("Antacids", "2 hours before or 6 hours after"), advice: "Separate the doses." },
  { a: "quinolone", b: "nsaid", severity: "info", summary: "NSAIDs with quinolones slightly raise seizure risk and tendon problems.", advice: "Mention it if you have epilepsy or tendon pain." },
  { a: "bisphosphonate", b: "calcium", severity: "caution", summary: ABSORB("Calcium", "at least 30 minutes (ideally take the bone drug alone first thing)"), advice: "Take alendronate with plain water on an empty stomach and stay upright." },
  { a: "bisphosphonate", b: "iron", severity: "caution", summary: ABSORB("Iron", "at least 30 minutes"), advice: "Separate the doses." },
  { a: "bisphosphonate", b: "magnesium", severity: "caution", summary: ABSORB("Magnesium", "at least 30 minutes"), advice: "Separate the doses." },
  { a: "bisphosphonate", b: "antacid", severity: "caution", summary: ABSORB("Antacids", "at least 30 minutes"), advice: "Separate the doses." },
  { a: "iron", b: "calcium", severity: "info", summary: "Calcium reduces iron absorption when taken at the same time.", advice: "Take iron and calcium at different meals." },
  { a: "iron", b: "zinc", severity: "info", summary: "Iron and zinc compete for absorption at high doses.", advice: "Take them at different times if either dose is high." },
  { a: "iron", b: "antacid", severity: "info", summary: "Antacids lower iron absorption.", advice: "Separate by 2 hours." },
  { a: "iron", b: "ppi", severity: "info", summary: "Less stomach acid means less iron absorbed.", advice: "Long-term users may need iron levels checked." },
  { a: "iron", b: "green_tea_extract", severity: "info", summary: "Tea polyphenols reduce iron absorption.", advice: "Take iron away from tea." },
  { a: "zinc", b: "calcium", severity: "info", summary: "Calcium can slightly reduce zinc absorption.", advice: "Minor; separate if convenient." },

  // Potassium & kidneys
  { a: "ace_arb", b: "potassium", severity: "caution", summary: "ACE inhibitors/ARBs keep potassium in the body; adding potassium can push levels too high.", advice: "Only take potassium supplements if a doctor has checked your blood levels." },
  { a: "ace_arb", b: "k_sparing", severity: "caution", summary: "Together they can cause high potassium.", advice: "Often prescribed together deliberately, with blood tests. Confirm it is intended." },
  { a: "k_sparing", b: "potassium", severity: "avoid", summary: "High risk of dangerous potassium levels.", advice: "Avoid unless a doctor is monitoring blood tests." },
  { a: "ace_arb", b: "nsaid", severity: "caution", summary: "NSAIDs can reduce blood-pressure control and strain the kidneys with ACE inhibitors/ARBs, especially with a diuretic too.", advice: "Short courses may be OK; avoid regular use without advice." },
  { a: "diuretic", b: "nsaid", severity: "caution", summary: "NSAIDs weaken diuretics and can stress the kidneys.", advice: "Ask before regular NSAID use." },
  { a: "lithium", b: "nsaid", severity: "avoid", summary: "NSAIDs raise lithium levels toward toxicity.", advice: "Avoid; use paracetamol." },
  { a: "lithium", b: "ace_arb", severity: "caution", summary: "Can raise lithium levels.", advice: "Needs level monitoring." },
  { a: "lithium", b: "diuretic", severity: "caution", summary: "Thiazide diuretics raise lithium levels.", advice: "Needs level monitoring." },
  { a: "methotrexate", b: "nsaid", severity: "caution", summary: "NSAIDs can raise methotrexate levels.", advice: "Usually acceptable at low weekly doses; check with the prescriber." },
  { a: "digoxin", b: "diuretic", severity: "caution", summary: "Diuretics can lower potassium, which makes digoxin more toxic.", advice: "Potassium levels need monitoring." },
  { a: "digoxin", b: "licorice", severity: "caution", summary: "Licorice lowers potassium and increases digoxin toxicity.", advice: "Avoid licorice supplements." },
  { a: "licorice", b: "diuretic", severity: "caution", summary: "Both lower potassium.", advice: "Avoid regular licorice supplements." },
  { a: "licorice", b: "ace_arb", severity: "info", summary: "Licorice raises blood pressure and works against BP medication.", advice: "Avoid large or regular amounts." },
  { a: "licorice", b: "ccb", severity: "info", summary: "Licorice raises blood pressure and works against BP medication.", advice: "Avoid large or regular amounts." },
  { a: "licorice", b: "corticosteroid", severity: "info", summary: "Licorice prolongs steroid effects.", advice: "Mention it to the prescriber." },

  // Statins
  { a: "statin", b: "grapefruit", severity: "caution", summary: "Grapefruit blocks the breakdown of simvastatin, atorvastatin and lovastatin, raising the risk of muscle damage.", advice: "Avoid grapefruit with these; rosuvastatin and pravastatin are unaffected." },
  { a: "statin", b: "red_yeast_rice", severity: "avoid", summary: "Red yeast rice contains a natural statin; taking both doubles up.", advice: "Do not combine." },
  { a: "statin", b: "macrolide", severity: "caution", summary: "Clarithromycin and erythromycin raise statin levels.", advice: "Statin may need pausing during the antibiotic course. Ask." },
  { a: "statin", b: "cyp3a4_inhibitor_antifungal", severity: "caution", summary: "Azole antifungals raise statin levels.", advice: "Ask about pausing the statin." },
  { a: "statin", b: "coq10", severity: "info", summary: "Statins lower CoQ10; some people take it for muscle aches.", advice: "No clash. Informational only." },
  { a: "ccb", b: "grapefruit", severity: "caution", summary: "Grapefruit increases levels of amlodipine, nifedipine and felodipine.", advice: "Avoid grapefruit juice." },

  // Blood sugar
  { a: "metformin", b: "chromium_berberine", severity: "caution", summary: "Blood-sugar-lowering herbs add to metformin and can cause low sugar.", advice: "Monitor glucose closely; tell your doctor." },
  { a: "sulfonylurea", b: "chromium_berberine", severity: "caution", summary: "Additive blood-sugar lowering; hypoglycaemia risk.", advice: "Monitor glucose closely." },
  { a: "insulin", b: "chromium_berberine", severity: "caution", summary: "Additive blood-sugar lowering; hypoglycaemia risk.", advice: "Monitor glucose closely." },
  { a: "sulfonylurea", b: "alcohol", severity: "caution", summary: "Alcohol can cause low blood sugar and flushing with sulfonylureas.", advice: "Limit alcohol; never drink on an empty stomach." },
  { a: "metformin", b: "alcohol", severity: "caution", summary: "Heavy drinking with metformin raises the risk of lactic acidosis.", advice: "Keep alcohol moderate." },
  { a: "metformin", b: "vitamin_b12", severity: "info", summary: "Metformin lowers B12 over time; supplementing is often sensible.", advice: "No clash. Informational only." },
  { a: "ppi", b: "vitamin_b12", severity: "info", summary: "Long-term acid reducers lower B12 absorption.", advice: "No clash. Informational only." },
  { a: "ppi", b: "magnesium", severity: "info", summary: "Long-term PPIs can deplete magnesium.", advice: "No clash. Informational only." },
  { a: "corticosteroid", b: "nsaid", severity: "caution", summary: "Both irritate the stomach; together ulcer risk rises.", advice: "Ask about stomach protection." },
  { a: "cinnamon", b: "metformin", severity: "info", summary: "Cinnamon may slightly lower blood sugar on top of diabetes medication.", advice: "Monitor glucose if taking capsules regularly." },
  { a: "cinnamon", b: "sulfonylurea", severity: "info", summary: "Cinnamon may slightly lower blood sugar on top of diabetes medication.", advice: "Monitor glucose." },
  { a: "cinnamon", b: "paracetamol", severity: "info", summary: "Cassia cinnamon in large amounts and paracetamol both put load on the liver.", advice: "Keep cinnamon to food amounts if paracetamol is regular." },

  // Sedation
  { a: "benzo", b: "opioid", severity: "avoid", summary: "Together they can slow breathing dangerously.", advice: "Only under close medical supervision." },
  { a: "benzo", b: "alcohol", severity: "avoid", summary: "Alcohol multiplies the sedation and breathing suppression.", advice: "Do not drink." },
  { a: "opioid", b: "alcohol", severity: "avoid", summary: "Alcohol multiplies the sedation and breathing suppression.", advice: "Do not drink." },
  { a: "benzo", b: "antihistamine_sedating", severity: "caution", summary: "Additive drowsiness.", advice: "Avoid driving; consider a non-sedating antihistamine." },
  { a: "opioid", b: "antihistamine_sedating", severity: "caution", summary: "Additive drowsiness and slowed breathing.", advice: "Use with care." },
  { a: "benzo", b: "kava", severity: "avoid", summary: "Kava adds to sedation and can harm the liver.", advice: "Avoid." },
  { a: "benzo", b: "valerian", severity: "caution", summary: "Additive sedation.", advice: "Avoid combining, or use the lowest dose." },
  { a: "benzo", b: "melatonin", severity: "info", summary: "Additive drowsiness.", advice: "Fine for many people; be careful driving." },
  { a: "antihistamine_sedating", b: "alcohol", severity: "caution", summary: "Additive drowsiness.", advice: "Avoid alcohol." },
  { a: "antihistamine_sedating", b: "valerian", severity: "info", summary: "Additive drowsiness.", advice: "Be careful with driving." },
  { a: "ashwagandha", b: "benzo", severity: "info", summary: "Ashwagandha may add to sedation.", advice: "Start low." },
  { a: "kava", b: "paracetamol", severity: "caution", summary: "Both can stress the liver.", advice: "Avoid regular combination." },
  { a: "kava", b: "alcohol", severity: "avoid", summary: "Liver toxicity and heavy sedation.", advice: "Avoid." },

  // Misc well-known
  { a: "paracetamol", b: "alcohol", severity: "caution", summary: "Regular heavy drinking with paracetamol increases liver damage risk.", advice: "Keep to the daily maximum and limit alcohol." },
  { a: "metronidazole", b: "alcohol", severity: "avoid", summary: "Causes flushing, vomiting and palpitations.", advice: "No alcohol during and for 48 hours after the course." },
  { a: "nitrate", b: "pde5", severity: "avoid", summary: "Can cause a life-threatening drop in blood pressure.", advice: "Never combine." },
  { a: "retinoid", b: "vitamin_a", severity: "avoid", summary: "Vitamin A toxicity when added to an oral retinoid.", advice: "Stop vitamin A supplements while on the retinoid." },
  { a: "retinoid", b: "tetracycline", severity: "avoid", summary: "Raised pressure in the brain has been reported.", advice: "Avoid." },
  { a: "penicillin", b: "cephalosporin", severity: "info", summary: "People allergic to penicillin occasionally react to cephalosporins too.", advice: "Only relevant if there is a penicillin allergy; tell the prescriber." },
  { a: "sulfonamide", b: "anticoagulant", severity: "caution", summary: "Co-trimoxazole strongly increases the effect of warfarin.", advice: "INR needs checking during the course." },
  { a: "sulfonamide", b: "methotrexate", severity: "avoid", summary: "Co-trimoxazole with methotrexate can cause severe bone-marrow suppression.", advice: "Avoid." },
  { a: "immunosuppressant", b: "echinacea", severity: "caution", summary: "Echinacea stimulates the immune system and may work against the medication.", advice: "Avoid." },
  { a: "corticosteroid", b: "echinacea", severity: "info", summary: "Echinacea may reduce the intended immune suppression.", advice: "Mention to the prescriber." },
  { a: "immunosuppressant", b: "grapefruit", severity: "avoid", summary: "Grapefruit raises ciclosporin and tacrolimus levels.", advice: "Avoid grapefruit." },
  { a: "immunosuppressant", b: "nsaid", severity: "caution", summary: "Added kidney strain.", advice: "Ask first." },
  { a: "carbamazepine", b: "contraceptive", severity: "avoid", summary: "These medicines make the pill unreliable.", advice: "Use additional contraception; discuss alternatives." },
  { a: "carbamazepine", b: "grapefruit", severity: "caution", summary: "Grapefruit raises carbamazepine levels.", advice: "Avoid grapefruit." },
  { a: "caffeine", b: "quinolone", severity: "info", summary: "Ciprofloxacin slows caffeine clearance; jitters more likely.", advice: "Cut back on coffee during the course." },
  { a: "goldenseal", b: "statin", severity: "caution", summary: "Goldenseal (berberine) blocks drug breakdown and raises statin levels.", advice: "Avoid combining." },
  { a: "goldenseal", b: "immunosuppressant", severity: "avoid", summary: "Raises drug levels.", advice: "Avoid." },
  { a: "green_tea_extract", b: "paracetamol", severity: "info", summary: "Concentrated green tea extract has been linked to liver injury; paracetamol adds load.", advice: "Keep to tea rather than high-dose extract." },
  { a: "ginseng", b: "maoi", severity: "caution", summary: "Reports of headache, tremor and mania.", advice: "Avoid." },
  { a: "ginseng", b: "sulfonylurea", severity: "info", summary: "Ginseng can lower blood sugar.", advice: "Monitor glucose." },
  { a: "melatonin", b: "contraceptive", severity: "info", summary: "The pill raises melatonin levels; drowsiness more likely.", advice: "Use a low dose." },
]

const AGENT_BY_ID = new Map(AGENTS.map((a) => [a.id, a]))

/** Which curated agents does this product match? */
export function matchAgents(med: Pick<Medication, "name" | "ingredients">): Agent[] {
  const hay = [med.name, ...(med.ingredients ?? []).map((i) => i.name)]
    .join(" | ")
    .toLowerCase()
  return AGENTS.filter((a) => a.keywords.some((k) => hay.includes(k)))
}

export type ClashFinding = {
  severity: Severity
  summary: string
  advice: string
  candidate: Pick<Medication, "id" | "name">
  other: Pick<Medication, "id" | "name">
  agentA: string
  agentB: string
  source: "curated"
}

export type OverlapFinding = {
  candidate: Pick<Medication, "id" | "name">
  other: Pick<Medication, "id" | "name">
  shared: string[]
}

const SEVERITY_ORDER: Record<Severity, number> = { avoid: 0, caution: 1, info: 2 }

/** Check a candidate against a list of existing medications using curated rules. */
export function findCuratedClashes(
  candidate: Pick<Medication, "id" | "name" | "ingredients">,
  existing: Pick<Medication, "id" | "name" | "ingredients">[],
): ClashFinding[] {
  const candAgents = matchAgents(candidate)
  const findings: ClashFinding[] = []
  for (const other of existing) {
    if (other.id === candidate.id) continue
    const otherAgents = matchAgents(other)
    for (const ca of candAgents) {
      for (const oa of otherAgents) {
        if (ca.id === oa.id) continue
        const rule = RULES.find(
          (r) => (r.a === ca.id && r.b === oa.id) || (r.a === oa.id && r.b === ca.id),
        )
        if (!rule) continue
        findings.push({
          severity: rule.severity,
          summary: rule.summary,
          advice: rule.advice,
          candidate: { id: candidate.id, name: candidate.name },
          other: { id: other.id, name: other.name },
          agentA: ca.label,
          agentB: oa.label,
          source: "curated",
        })
      }
    }
  }
  // De-duplicate identical pairs (e.g. one product matching two agents in the same rule).
  const seen = new Set<string>()
  return findings
    .filter((f) => {
      const key = `${f.other.id}|${f.summary}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
}

/** Same product or same active ingredient appearing twice: double-dosing risk. */
export function findOverlaps(
  candidate: Pick<Medication, "id" | "name" | "ingredients">,
  existing: Pick<Medication, "id" | "name" | "ingredients">[],
): OverlapFinding[] {
  const norm = (s: string) => s.trim().toLowerCase()
  const candTokens = new Set([norm(candidate.name), ...(candidate.ingredients ?? []).map((i) => norm(i.name))].filter(Boolean))
  // Curated agents count as overlap too (e.g. "Panadol" and "paracetamol").
  const candAgentIds = new Set(matchAgents(candidate).map((a) => a.id))
  const out: OverlapFinding[] = []
  for (const other of existing) {
    if (other.id === candidate.id) continue
    const otherTokens = [norm(other.name), ...(other.ingredients ?? []).map((i) => norm(i.name))].filter(Boolean)
    const shared = otherTokens.filter((t) => candTokens.has(t))
    const sharedAgents = matchAgents(other)
      .filter((a) => candAgentIds.has(a.id))
      // Only flag single-ingredient agents as duplicates, not broad classes.
      .filter((a) => ["paracetamol", "aspirin", "iron", "calcium", "magnesium", "zinc", "melatonin", "vitamin_a", "vitamin_e", "vitamin_k", "vitamin_b12", "fish_oil", "potassium", "caffeine", "metformin", "levothyroxine", "tramadol", "digoxin", "lithium", "methotrexate"].includes(a.id))
      .map((a) => a.label)
    const all = Array.from(new Set([...shared, ...sharedAgents]))
    if (all.length) {
      out.push({ candidate: { id: candidate.id, name: candidate.name }, other: { id: other.id, name: other.name }, shared: all })
    }
  }
  return out
}

/** All pairwise clashes within one person's list (for the dashboard). */
export function findAllClashes(
  meds: Pick<Medication, "id" | "name" | "ingredients">[],
): ClashFinding[] {
  const out: ClashFinding[] = []
  const seen = new Set<string>()
  for (let i = 0; i < meds.length; i++) {
    const findings = findCuratedClashes(meds[i], meds.slice(i + 1))
    for (const f of findings) {
      const key = [f.candidate.id, f.other.id].sort().join("|") + f.summary
      if (seen.has(key)) continue
      seen.add(key)
      out.push(f)
    }
  }
  return out.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  avoid: "Avoid",
  caution: "Caution",
  info: "Good to know",
}

/* ------------------------------------------------------------------ */
/* Single-ingredient cautions                                           */
/* ------------------------------------------------------------------ */

/**
 * Things worth knowing about one product on its own, regardless of what
 * else is on the list: well-documented allergy / skin-reaction risks,
 * liver load, and "natural but not harmless" cases.
 */
export type SoloCaution = {
  agent: string
  severity: Severity
  summary: string
  advice: string
}

export const SOLO_CAUTIONS: SoloCaution[] = [
  { agent: "cinnamon", severity: "caution", summary: "Cinnamon (especially cassia bark) is a well-known cause of skin rashes, mouth irritation and allergic reactions, and its coumarin content can stress the liver in supplement doses.", advice: "Stop and see a doctor if a rash, swelling or itching appears. Keep to food amounts unless a practitioner is monitoring you." },
  { agent: "kava", severity: "avoid", summary: "Kava has caused serious liver injury and is banned or restricted in several countries.", advice: "Avoid, especially with any other medication processed by the liver." },
  { agent: "green_tea_extract", severity: "caution", summary: "Concentrated green tea extract (EGCG) has been linked to liver injury, particularly on an empty stomach.", advice: "Take with food and avoid high doses; ordinary green tea is fine." },
  { agent: "vitamin_a", severity: "caution", summary: "Vitamin A builds up in the body; high doses cause toxicity and are dangerous in pregnancy.", advice: "Check the total from all products; avoid high doses if pregnant or planning pregnancy." },
  { agent: "st_johns_wort", severity: "caution", summary: "St John's Wort changes how the liver processes many medicines and causes sun sensitivity.", advice: "Tell every doctor and pharmacist you take it; use sun protection." },
  { agent: "licorice", severity: "caution", summary: "Regular licorice raises blood pressure and lowers potassium.", advice: "Avoid daily use if you have high blood pressure or heart problems." },
  { agent: "echinacea", severity: "info", summary: "Echinacea commonly triggers allergic reactions in people sensitive to ragweed, daisies or chrysanthemums.", advice: "Stop if you get a rash or wheeze." },
  { agent: "ginkgo", severity: "info", summary: "Ginkgo thins the blood slightly; stop before surgery.", advice: "Stop 2 weeks before any operation or dental surgery." },
  { agent: "fish_oil", severity: "info", summary: "High-dose fish oil thins the blood slightly.", advice: "Mention it before surgery." },
  { agent: "iron", severity: "info", summary: "Iron is the most common cause of accidental poisoning in young children.", advice: "Keep well out of reach of children." },
  { agent: "melatonin", severity: "info", summary: "Melatonin quality and dose vary a lot between brands and it can cause next-day drowsiness.", advice: "Start with the lowest dose." },
  { agent: "ashwagandha", severity: "info", summary: "Ashwagandha has been linked to rare liver injury and can affect thyroid hormone levels.", advice: "Stop if you notice yellowing skin, dark urine or unusual tiredness." },
  { agent: "red_yeast_rice", severity: "caution", summary: "Red yeast rice is effectively an unregulated statin, with the same muscle and liver side effects.", advice: "Treat it as a medicine, not a food supplement." },
  { agent: "goldenseal", severity: "caution", summary: "Goldenseal (berberine) blocks the breakdown of many drugs.", advice: "Avoid alongside prescription medicines unless a pharmacist has checked." },
  { agent: "caffeine", severity: "info", summary: "Caffeine supplements add up quickly with coffee, tea and energy drinks.", advice: "Count all sources; palpitations and anxiety are the usual warning signs." },
]

/** Cautions that apply to one product by itself. */
export function findSoloCautions(
  candidate: Pick<Medication, "name" | "ingredients">,
): (SoloCaution & { agentLabel: string })[] {
  const agents = matchAgents(candidate)
  return SOLO_CAUTIONS.filter((c) => agents.some((a) => a.id === c.agent)).map((c) => ({
    ...c,
    agentLabel: AGENT_BY_ID.get(c.agent)?.label ?? c.agent,
  }))
}

/** Does this product contain anything the person has listed as an allergy? */
export function findAllergyMatches(
  candidate: Pick<Medication, "name" | "ingredients">,
  allergies: string | undefined,
): string[] {
  if (!allergies) return []
  const phrases = allergies
    .split(/[,;\n/]+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length >= 3)
  if (!phrases.length) return []
  const hay = [candidate.name, ...(candidate.ingredients ?? []).map((i) => i.name)].join(" | ").toLowerCase()
  const agentIds = new Set(matchAgents(candidate).map((a) => a.id))
  const GENERIC = new Set(["drug", "drugs", "tablet", "tablets", "allergy", "allergic", "antibiotic", "antibiotics", "medicine", "medicines", "medication", "type", "based", "family", "group"])
  const termHits = (t: string) => {
    if (hay.includes(t)) return true
    const matching = AGENTS.filter(
      (a) => a.id.includes(t) || a.label.toLowerCase().includes(t) || a.keywords.some((k) => k.includes(t)),
    )
    return matching.some((a) => agentIds.has(a.id))
  }
  return phrases.filter((phrase) => {
    if (termHits(phrase)) return true
    // "sulfa drugs", "penicillin family": try the meaningful words on their own
    const words = phrase.split(/\s+/).filter((w) => w.length >= 4 && !GENERIC.has(w))
    return words.length > 1 || words[0] !== phrase ? words.some(termHits) : false
  })
}
