import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreLead } from '../lib/scoring.js';
import { LeadInput } from '../types/lead.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../leadmatrix.db');

export const db = new DatabaseSync(DB_PATH);

// Initialize schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      industry TEXT NOT NULL,
      company_size TEXT NOT NULL,
      budget REAL NOT NULL,
      urgency TEXT NOT NULL,
      engagement TEXT NOT NULL,
      source TEXT NOT NULL,
      score INTEGER NOT NULL,
      priority TEXT NOT NULL,
      confidence REAL NOT NULL,
      recommended_action TEXT NOT NULL,
      needs_review INTEGER NOT NULL DEFAULT 0,
      positive_factors TEXT NOT NULL,
      negative_factors TEXT NOT NULL,
      review_reason TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      rules_score INTEGER,
      ml_score INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scoring_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      priority TEXT NOT NULL,
      confidence REAL NOT NULL,
      model_version TEXT NOT NULL DEFAULT 'v1.2-gbm',
      key_factors TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      original_score INTEGER NOT NULL,
      original_priority TEXT NOT NULL,
      corrected_priority TEXT NOT NULL,
      feedback TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS review_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      reviewed_by TEXT,
      reviewed_at TEXT,
      FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
    );
  `);

  // Check if seeding is needed
  const countRow = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
  if (countRow.count === 0) {
    seedDatabase();
  }
}

// Generate realistic synthetic leads
export function seedDatabase() {
  console.log('Seeding initial synthetic leads for LeadMatrix...');

  const companies = [
    { name: 'Marcus Vance', email: 'm.vance@vanguardlogistics.com', company: 'Vanguard Logistics', ind: 'Manufacturing', size: '1000+ employees', b: 180000, u: 'Immediate (< 1 mo)', e: 'High (Demo / Webinar)', s: 'Inbound Demo' },
    { name: 'Elena Rostova', email: 'elena@novapharma.ch', company: 'Nova Pharmaceuticals', ind: 'Healthcare', size: '1000+ employees', b: 240000, u: 'Short-term (1-3 mos)', e: 'High (Demo / Webinar)', s: 'Direct Referral' },
    { name: 'David Chen', email: 'david.chen@cloudpulse.io', company: 'CloudPulse Networks', ind: 'Tech/SaaS', size: '201-1000 employees', b: 95000, u: 'Immediate (< 1 mo)', e: 'High (Demo / Webinar)', s: 'Inbound Demo' },
    { name: 'Sarah Jenkins', email: 'sjenkins@apexwealth.com', company: 'Apex Wealth Advisors', ind: 'Financial Services', size: '201-1000 employees', b: 120000, u: 'Short-term (1-3 mos)', e: 'Medium (3+ Content Downloads)', s: 'Organic Search' },
    { name: 'Liam O’Connor', email: 'liam@celticretail.ie', company: 'Celtic Retail Group', ind: 'Retail & E-commerce', size: '51-200 employees', b: 45000, u: 'Short-term (1-3 mos)', e: 'Medium (3+ Content Downloads)', s: 'Paid Campaign' },
    { name: 'Amira Patel', email: 'amira@synthbiotech.org', company: 'Synthetix Bio', ind: 'Healthcare', size: '51-200 employees', b: 65000, u: 'Immediate (< 1 mo)', e: 'High (Demo / Webinar)', s: 'Inbound Demo' },
    { name: 'Julian Morales', email: 'jmorales@strataarch.com', company: 'Strata Architects', ind: 'Professional Services', size: '11-50 employees', b: 18000, u: 'Medium-term (3-6 mos)', e: 'Low (Newsletter / Single Page)', s: 'Organic Search' },
    { name: 'Chloe Dubois', email: 'chloe@atelierlumiere.fr', company: 'Atelier Lumière', ind: 'Retail & E-commerce', size: '1-10 employees', b: 6000, u: 'Exploratory (6+ mos)', e: 'Low (Newsletter / Single Page)', s: 'Cold List / Event' },
    { name: 'Vikram Malhotra', email: 'vikram@induselectric.in', company: 'Indus Electric Vehicles', ind: 'Manufacturing', size: '1000+ employees', b: 350000, u: 'Immediate (< 1 mo)', e: 'High (Demo / Webinar)', s: 'Direct Referral' },
    { name: 'Jessica Miller', email: 'jmiller@beaconedtech.edu', company: 'Beacon Higher Ed', ind: 'Education', size: '201-1000 employees', b: 40000, u: 'Medium-term (3-6 mos)', e: 'Medium (3+ Content Downloads)', s: 'Organic Search' },
    { name: 'Tariq Al-Mansoor', email: 'tariq@gulfcrestcap.ae', company: 'Gulf Crest Capital', ind: 'Financial Services', size: '51-200 employees', b: 150000, u: 'Immediate (< 1 mo)', e: 'High (Demo / Webinar)', s: 'Inbound Demo' },
    { name: 'Hannah Wright', email: 'hwright@greenfieldsolar.co', company: 'Greenfield Renewables', ind: 'Manufacturing', size: '51-200 employees', b: 55000, u: 'Short-term (1-3 mos)', e: 'Medium (3+ Content Downloads)', s: 'Paid Campaign' },
    { name: 'Kenji Takahashi', email: 'kenji@omnisensor.jp', company: 'OmniSensor Corp', ind: 'Tech/SaaS', size: '1000+ employees', b: 210000, u: 'Immediate (< 1 mo)', e: 'High (Demo / Webinar)', s: 'Inbound Demo' },
    { name: 'Rachel Goldberg', email: 'rachel@goldberglaw.com', company: 'Goldberg & Partners', ind: 'Professional Services', size: '11-50 employees', b: 25000, u: 'Short-term (1-3 mos)', e: 'Medium (3+ Content Downloads)', s: 'Outbound SDR' },
    { name: 'Mateo Alvarez', email: 'mateo@solariscloud.mx', company: 'Solaris Cloud Systems', ind: 'Tech/SaaS', size: '51-200 employees', b: 70000, u: 'Immediate (< 1 mo)', e: 'High (Demo / Webinar)', s: 'Inbound Demo' },
    { name: 'Sophie Bernard', email: 'sophie@lyontextiles.fr', company: 'Lyon Fine Fabrics', ind: 'Retail & E-commerce', size: '11-50 employees', b: 12000, u: 'Exploratory (6+ mos)', e: 'Low (Newsletter / Single Page)', s: 'Cold List / Event' },
    { name: 'Robert Kowalski', email: 'r.kowalski@nordicsteel.pl', company: 'Nordic Steel Forge', ind: 'Manufacturing', size: '201-1000 employees', b: 85000, u: 'Medium-term (3-6 mos)', e: 'Low (Newsletter / Single Page)', s: 'Outbound SDR' },
    { name: 'Aaliyah Washington', email: 'awashington@primecare.org', company: 'PrimeCare Health System', ind: 'Healthcare', size: '1000+ employees', b: 300000, u: 'Short-term (1-3 mos)', e: 'High (Demo / Webinar)', s: 'Direct Referral' },
    { name: 'Felix Weber', email: 'felix@bavariaauto.de', company: 'Bavaria Automotive Tech', ind: 'Manufacturing', size: '201-1000 employees', b: 140000, u: 'Immediate (< 1 mo)', e: 'High (Demo / Webinar)', s: 'Inbound Demo' },
    { name: 'Nadia Hassan', email: 'nadia@orientalfintech.sg', company: 'Orient Payment Rail', ind: 'Financial Services', size: '51-200 employees', b: 110000, u: 'Short-term (1-3 mos)', e: 'High (Demo / Webinar)', s: 'Organic Search' },
    { name: 'Tyler Brooks', email: 'tbrooks@appalachiancoffee.com', company: 'Appalachian Roasters', ind: 'Retail & E-commerce', size: '1-10 employees', b: 5000, u: 'Exploratory (6+ mos)', e: 'Low (Newsletter / Single Page)', s: 'Paid Campaign' },
    { name: 'Sunil Rao', email: 'sunil@bangaloreanalytics.co', company: 'Bangalore Analytics', ind: 'Tech/SaaS', size: '51-200 employees', b: 60000, u: 'Short-term (1-3 mos)', e: 'Medium (3+ Content Downloads)', s: 'Inbound Demo' },
    { name: 'Olga Ivanova', email: 'olga@kyivcyber.ua', company: 'Kyiv Cyber Defense', ind: 'Tech/SaaS', size: '51-200 employees', b: 85000, u: 'Immediate (< 1 mo)', e: 'High (Demo / Webinar)', s: 'Inbound Demo' },
    { name: 'Gabriel Santos', email: 'gsantos@paulistalog.br', company: 'Paulista Cargo Express', ind: 'Manufacturing', size: '201-1000 employees', b: 90000, u: 'Medium-term (3-6 mos)', e: 'Medium (3+ Content Downloads)', s: 'Organic Search' },
    { name: 'Emily Thorn', email: 'emily@cambridgecurriculum.co.uk', company: 'Cambridge Curriculum Labs', ind: 'Education', size: '11-50 employees', b: 22000, u: 'Medium-term (3-6 mos)', e: 'Low (Newsletter / Single Page)', s: 'Outbound SDR' },
    { name: 'Arthur Pendelton', email: 'art@vermontcheese.com', company: 'Green Mountain Dairy', ind: 'Other', size: '1-10 employees', b: 4000, u: 'Exploratory (6+ mos)', e: 'Low (Newsletter / Single Page)', s: 'Cold List / Event' },
    { name: 'Zoe Katsaros', email: 'zoe@aegeanshipping.gr', company: 'Aegean Maritime Systems', ind: 'Manufacturing', size: '1000+ employees', b: 275000, u: 'Immediate (< 1 mo)', e: 'High (Demo / Webinar)', s: 'Direct Referral' },
    { name: 'Devon Hayes', email: 'dhayes@quanticwealth.com', company: 'Quantic Wealth Hedge', ind: 'Financial Services', size: '51-200 employees', b: 135000, u: 'Short-term (1-3 mos)', e: 'High (Demo / Webinar)', s: 'Inbound Demo' },
  ];

  // Variations to scale up to ~110 realistic synthetic leads
  const industries = ['Tech/SaaS', 'Healthcare', 'Financial Services', 'Manufacturing', 'Retail & E-commerce', 'Education', 'Professional Services'];
  const sizes = ['1-10 employees', '11-50 employees', '51-200 employees', '201-1000 employees', '1000+ employees'];
  const urgencies = ['Immediate (< 1 mo)', 'Short-term (1-3 mos)', 'Medium-term (3-6 mos)', 'Exploratory (6+ mos)'];
  const engagements = ['High (Demo / Webinar)', 'Medium (3+ Content Downloads)', 'Low (Newsletter / Single Page)'];
  const sources = ['Inbound Demo', 'Direct Referral', 'Organic Search', 'Paid Campaign', 'Outbound SDR', 'Cold List / Event'];

  const allLeads: LeadInput[] = [...companies.map(c => ({
    name: c.name,
    email: c.email,
    company: c.company,
    industry: c.ind,
    company_size: c.size,
    budget: c.b,
    urgency: c.u,
    engagement: c.e,
    source: c.s,
  }))];

  // Synthesize realistic additional records
  const firstNames = ['Alexander', 'Isabella', 'Benjamin', 'Mia', 'Lucas', 'Charlotte', 'Mason', 'Harper', 'Ethan', 'Evelyn', 'James', 'Abigail', 'Logan', 'Emily', 'Jackson', 'Ella', 'Sebastian', 'Avery', 'Henry', 'Sofia', 'Owen', 'Camila', 'Jack', 'Aria', 'Levi', 'Scarlett', 'Wyatt', 'Victoria', 'Julian', 'Madison'];
  const lastNames = ['Sterling', 'Vanderbilt', 'Sinclair', 'Thorne', 'Mercer', 'Montgomery', 'Kensington', 'Blackwood', 'Gallagher', 'Whitaker', 'Winslow', 'Cromwell', 'Fairchild', 'Prescott', 'Wellington', 'Kingsley', 'Stafford', 'Harrington', 'Pembroke', 'Ashford', 'Donovan', 'Lockwood', 'Carlisle', 'Bishop', 'Davenport'];
  const companyPrefixes = ['Apex', 'Nova', 'Vertex', 'Pinnacle', 'Summit', 'Nexus', 'Aegis', 'Crest', 'Hyperion', 'Vector', 'Quantum', 'Meridian', 'Prism', 'Stratum', 'Helios', 'Vanguard', 'Omni', 'Aura', 'Titan', 'Zenith'];
  const companySuffixes = ['Technologies', 'Labs', 'Dynamics', 'Solutions', 'Capital', 'Health', 'Analytics', 'Robotics', 'Systems', 'Global', 'Ventures', 'Networks', 'Industries'];

  for (let i = 0; i < 85; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3 + 7) % lastNames.length];
    const cp = companyPrefixes[(i * 2 + 5) % companyPrefixes.length];
    const cs = companySuffixes[(i * 4 + 11) % companySuffixes.length];
    const compName = `${cp} ${cs}`;
    const ind = industries[i % industries.length];
    const size = sizes[(i * 2 + 1) % sizes.length];
    const u = urgencies[(i * 3) % urgencies.length];
    const e = engagements[(i * 2) % engagements.length];
    const s = sources[(i * 5) % sources.length];
    
    // Budget correlated with size + realistic variation
    let baseBudget = 8000;
    if (i % 4 === 0) {
      // Enterprise tier (High Priority target)
      baseBudget = 90000 + ((i % 10) * 12000);
    } else if (i % 4 === 1 || i % 4 === 2) {
      // Mid-market tier (Medium Priority target)
      baseBudget = 25000 + ((i % 8) * 5000);
    } else {
      // Small business / exploratory (Low Priority target)
      baseBudget = 4000 + ((i % 5) * 1500);
    }

    allLeads.push({
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${cp.toLowerCase()}${cs.toLowerCase().slice(0, 4)}.com`,
      company: compName,
      industry: ind,
      company_size: size,
      budget: baseBudget,
      urgency: u,
      engagement: e,
      source: s,
    });
  }

  // Insert leads and score them
  const insertLeadStmt = db.prepare(`
    INSERT INTO leads (
      name, email, company, industry, company_size, budget, urgency,
      engagement, source, score, priority, confidence, recommended_action,
      needs_review, positive_factors, negative_factors, review_reason,
      status, rules_score, ml_score, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const insertScoringStmt = db.prepare(`
    INSERT INTO scoring_results (
      lead_id, score, priority, confidence, model_version, key_factors, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertReviewStmt = db.prepare(`
    INSERT INTO review_queue (lead_id, reason, status) VALUES (?, ?, ?)
  `);

  const now = new Date();

  db.exec('BEGIN TRANSACTION');
  try {
    allLeads.forEach((leadInput, index) => {
      const scoring = scoreLead(leadInput);
      
      // Spread created_at over the last 45 days
      const daysAgo = Math.floor((index / allLeads.length) * 45);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      const result = insertLeadStmt.run(
        leadInput.name,
        leadInput.email,
        leadInput.company,
        leadInput.industry,
        leadInput.company_size,
        leadInput.budget,
        leadInput.urgency,
        leadInput.engagement,
        leadInput.source,
        scoring.score,
        scoring.priority,
        scoring.confidence,
        scoring.recommended_action,
        scoring.needs_review ? 1 : 0,
        JSON.stringify(scoring.positive_factors),
        JSON.stringify(scoring.negative_factors),
        scoring.review_reason || null,
        scoring.needs_review ? 'Under Review' : 'Active',
        scoring.rules_score,
        scoring.ml_score,
        createdAt,
        createdAt
      );

      const leadId = Number(result.lastInsertRowid);

      insertScoringStmt.run(
        leadId,
        scoring.score,
        scoring.priority,
        scoring.confidence,
        'v1.2-gbm',
        JSON.stringify(scoring.key_factors),
        createdAt
      );

      if (scoring.needs_review) {
        insertReviewStmt.run(
          leadId,
          scoring.review_reason || 'Manual review threshold reached',
          'Pending'
        );
      }
    });

    db.exec('COMMIT');
    console.log(`Successfully seeded ${allLeads.length} synthetic leads with scoring and review queue.`);
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Failed to seed synthetic leads:', err);
  }
}
