/**
 * Demo users with full fake data: projects, expenses, revenues, materials, suppliers.
 * Run from backend/: node ./scripts/seed-demo-users.mjs
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const USERS = [
  {
    name: 'MBD בנייה',
    email: 'mbd@gmail.com',
    password: 'mbd12345',
    seed: 20261007,
    suppliers: [
      ['שרשרת בניין בע״מ', 'sales@sharsheret.example', '03-5550101', 'בלוקים, מלט וחול'],
      ['אלקטרו-פלוס', 'orders@electro-plus.example', '03-5550102', 'חשמל ותאורה'],
      ['צנרת הצפון', 'info@tzaneret.example', '04-5550103', 'אינסטלציה וכלים סניטריים'],
      ['עץ ומתכת י.כ.', 'studio@wood-metal.example', '04-5550104', 'נגרות, ברזל וחלונות'],
      ['בטוח-ביטוחים', 'policy@betuach.example', '03-5550105', 'ביטוח עבודות קבלניות'],
      ['הובלות דרום', 'dispatch@darom-haul.example', '08-5550106', 'הובלות ומנופים'],
      ['כלי עבודה פרו', 'shop@tools-pro.example', '03-5550107', 'כלי עבודה וציוד מגן'],
      ['ספק צבעים ר.ל.', 'paint@colors-rl.example', '09-5550108', 'צבע, טיח ופריימר'],
      ['איטום מקצועי', 'seal@itum.example', '03-5550109', 'יריעות איטום ובידוד'],
      ['מיזוג חכם', 'service@smart-hvac.example', '03-5550110', 'מערכות VRF'],
      ['קרמיקה פלוס', 'tiles@ceramic-plus.example', '03-5550111', 'ריצוף וחיפוי'],
      ['גינון פרימיום', 'garden@premium.example', '09-5550112', 'פיתוח חוץ וגינון'],
    ],
    projects: [
      {
        name: 'וילה בקיסריה',
        description: 'שיפוץ מלא לווילה: שלד, גמר, חצר, בריכה ומיזוג',
      },
      {
        name: 'מגדל משרדים רמת גן',
        description: 'גמר קומות 4–7, מערכות חשמל, מיזוג ותקרות אקוסטיות',
      },
      {
        name: 'פנטהאוז תל אביב',
        description: 'שיפוץ יוקרה: מטבח, חדרי רחצה, פרקט ומרפסת',
      },
    ],
  },
  {
    name: 'משתמש בדיקות',
    email: 'test@test.com',
    password: 'test1234',
    seed: 20261008,
    suppliers: [
      ['פלדת הצפון', 'sales@steel-north.example', '04-8501122', 'שלד פלדה וקורות'],
      ['פאנלים תעשייתיים', 'orders@panels.example', '08-6612233', 'קירות סנדוויץ׳'],
      ['נגרות הגליל', 'studio@galil-wood.example', '04-9903344', 'דלתות וארונות'],
      ['חשמל ישיר', 'power@yashir.example', '03-7002211', 'לוחות וכבלים'],
      ['בטיחות פלוס', 'safety@plus.example', '03-6117788', 'כיבוי אש ומצלמות'],
      ['כבישים ופיתוח', 'asphalt@roads.example', '08-6778899', 'אספלט וחניה'],
      ['גמר תעשייתי', 'finish@ind.example', '03-5002211', 'תקרות וגמר משרדים'],
      ['סניטריה הדרום', 'bath@south.example', '08-6334455', 'כלים סניטריים לבתי ספר'],
      ['זכוכית ואלומיניום', 'glass@alum.example', '04-8221199', 'חלונות ומעקות'],
      ['מכולות ושינוע', 'fleet@containers.example', '08-6447788', 'פינוי פסולת ושינוע'],
      ['תאורה חכמה', 'light@smart.example', '03-5889900', 'גופי תאורה ומפסקים'],
      ['איטום גגות בע״מ', 'roof@seal.example', '09-7665544', 'איטום גגות שטוחים'],
    ],
    projects: [
      {
        name: 'מחסן לוגיסטי אשדוד',
        description: 'הקמת מחסן: שלד פלדה, רצפת בטון, שערים ומערכות כיבוי',
      },
      {
        name: 'שיפוץ בית ספר חיפה',
        description: 'שיפוץ כיתות, שירותים, חשמל, מיזוג ומגרש',
      },
      {
        name: 'תוספת בנייה פתח תקווה',
        description: 'תוספת קומה לבית פרטי כולל גג, מדרגות וגמר',
      },
    ],
  },
];

const PAYMENT_METHODS = ['Credit Card', 'Bank Transfer', 'Cash', 'Check'];
const EXPENSE_CATEGORIES = [
  'חומרים',
  'שכר עבודה',
  'שינוע',
  'ציוד',
  'כלים',
  'בטיחות',
  'חשמל',
  'אינסטלציה',
  'ניהול',
  'ביטוח',
  'גמר',
  'מיזוג',
];
const EXPENSE_BASE = [
  ['רכישת בלוקים ובטון', 'חומרים', 4200],
  ['ברזל מצולע', 'חומרים', 8600],
  ['מלט וחול', 'חומרים', 1450],
  ['לוחות גבס', 'חומרים', 2300],
  ['צבע פנים', 'גמר', 980],
  ['בידוד תרמי', 'חומרים', 3100],
  ['שכר קבלן שלד', 'שכר עבודה', 28500],
  ['שכר קבלן גמר', 'שכר עבודה', 16400],
  ['פועלי יום', 'שכר עבודה', 6200],
  ['הובלת חומרים', 'שינוע', 1100],
  ['מנוף יומי', 'שינוע', 3800],
  ['השכרת פיגומים', 'ציוד', 2750],
  ['קסדות וכפפות', 'בטיחות', 540],
  ['לוח חשמל', 'חשמל', 4600],
  ['כבלים ותעלות', 'חשמל', 2150],
  ['צנרת וחיבורים', 'אינסטלציה', 3400],
  ['כלים סניטריים', 'אינסטלציה', 7800],
  ['פיקוח הנדסי', 'ניהול', 4500],
  ['ביטוח עבודות', 'ביטוח', 3200],
  ['אריחי ריצוף', 'חומרים', 9200],
  ['דלתות פנים', 'גמר', 6400],
  ['חלונות אלומיניום', 'גמר', 12800],
  ['מערכת מיזוג', 'מיזוג', 18500],
  ['איטום גג', 'חומרים', 4100],
  ['טיח וצבע חוץ', 'שכר עבודה', 7600],
  ['ריצוף — עבודה', 'שכר עבודה', 9800],
  ['נקודות מים וביוב', 'אינסטלציה', 5200],
  ['בדיקות מעבדה', 'ניהול', 1400],
  ['ניקיון אתר', 'ניהול', 750],
  ['דלק לכלים', 'שינוע', 620],
];
const REVENUE_BASE = [
  ['מקדמה על חוזה', 65000, 'PAID'],
  ['תשלום שלב שלד', 82000, 'PAID'],
  ['תשלום שלב גמר רטוב', 44000, 'PAID'],
  ['תשלום חשמל ואינסטלציה', 31500, 'PAID'],
  ['תשלום שלב ריצוף', 26000, 'PENDING'],
  ['תשלום שלב נגרות', 21000, 'PENDING'],
  ['תוספת שינוי תכנון', 9500, 'PAID'],
  ['תשלום מסירה חלקית', 38000, 'PAID'],
  ['יתרת חוזה', 54000, 'PENDING'],
  ['בונוס לוח זמנים', 6000, 'PAID'],
  ['החזר הוצאות לקוח', 4200, 'PAID'],
  ['תשלום ביניים חודש 3', 24000, 'PAID'],
  ['תשלום ביניים חודש 4', 24000, 'PAID'],
  ['תשלום ביניים חודש 5', 24000, 'PENDING'],
  ['תוספת שבוטלה', 7000, 'CANCELLED'],
  ['תוספת פרגולה', 13500, 'PENDING'],
  ['חומרי גמר משודרגים', 11200, 'PAID'],
  ['תשלום שלב צבע', 16000, 'PENDING'],
  ['תשלום שלב מטבח', 28000, 'PENDING'],
  ['תשלום חדרי רחצה', 19000, 'PAID'],
  ['תשלום ציוד מיזוג', 14500, 'PAID'],
  ['מקדמת פיתוח חוץ', 22000, 'PAID'],
];
const CUSTOMERS = [
  'משפחת כהן',
  'חברת נכסים אור',
  'יזמות הגליל',
  'דירה להשקעה בע״מ',
  'לקוח פרטי — לוי',
  'קבוצת רכישה צפון',
  'משרד עו״ד ברק',
  'קרן השקעות בית',
  'עיריית הדמו',
  'חברת ניהול נכסים',
];
const MATERIALS = [
  ['בלוק בטון 20', 1400, 4.8],
  ['מלט שק 50 ק״ג', 220, 28.5],
  ['חול בניין מ״ק', 60, 95],
  ['ברזל מצולע 12 מ״מ', 3.2, 4200],
  ['ברזל מצולע 8 מ״מ', 2.1, 3800],
  ['לוח גבס', 110, 42],
  ['צבע אקרילי 18 ל׳', 30, 165],
  ['אריח גרניט 60×60', 120, 89],
  ['דבק אריחים', 48, 55],
  ['צינור PVC 110', 140, 32],
  ['כבל חשמל 3×2.5', 400, 6.5],
  ['שקע חשמל כפול', 64, 28],
  ['ברז כיור', 10, 145],
  ['אסלה תלויה', 4, 980],
  ['דלת פנים', 14, 780],
  ['חלון אלומיניום', 11, 1450],
  ['בידוד צמר סלעים', 80, 48],
  ['יריעת איטום', 30, 120],
  ['טיח מוכן', 100, 42],
  ['לוח OSB', 24, 110],
  ['עץ קונסטרוקציה', 120, 24],
  ['פרופיל פלדה', 18, 260],
  ['פאנל סנדוויץ׳', 40, 310],
  ['סיליקון', 50, 18],
  ['פריימר', 18, 95],
];

function daysAgo(n) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function vatOf(amount, rate = 0.17) {
  return Math.round(amount * rate * 100) / 100;
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function ensureUser(client, def) {
  const passwordHash = await bcrypt.hash(def.password, 10);
  const existing = await client.query(
    `SELECT id, email FROM "User" WHERE email = $1 LIMIT 1`,
    [def.email],
  );
  if (existing.rows[0]) {
    const updated = await client.query(
      `UPDATE "User"
       SET name = $2, "passwordHash" = $3, "updatedAt" = NOW()
       WHERE id = $1
       RETURNING id, email, name`,
      [existing.rows[0].id, def.name, passwordHash],
    );
    return { user: updated.rows[0], created: false };
  }

  const created = await client.query(
    `INSERT INTO "User" (name, email, "passwordHash", role, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, 'USER'::"UserRole", NOW(), NOW())
     RETURNING id, email, name`,
    [def.name, def.email, passwordHash],
  );
  return { user: created.rows[0], created: true };
}

async function ensureSuppliers(client, userId, suppliers) {
  let created = 0;
  for (const [name, email, phone, notes] of suppliers) {
    const existing = await client.query(
      `SELECT id FROM "Supplier" WHERE "userId" = $1 AND name = $2 LIMIT 1`,
      [userId, name],
    );
    if (existing.rows[0]) continue;
    await client.query(
      `INSERT INTO "Supplier" (name, email, phone, notes, "userId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
      [name, email, phone, notes, userId],
    );
    created += 1;
  }
  return created;
}

async function ensureProject(client, userId, project) {
  const existing = await client.query(
    `SELECT id, name FROM "Project" WHERE "userId" = $1 AND name = $2 LIMIT 1`,
    [userId, project.name],
  );
  if (existing.rows[0]) return { project: existing.rows[0], created: false };

  const created = await client.query(
    `INSERT INTO "Project" (name, description, "userId", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING id, name`,
    [project.name, project.description, userId],
  );
  return { project: created.rows[0], created: true };
}

async function projectHasData(client, projectId) {
  const { rows } = await client.query(
    `SELECT
       (SELECT COUNT(*)::int FROM "Expense" WHERE "projectId" = $1) +
       (SELECT COUNT(*)::int FROM "Revenue" WHERE "projectId" = $1) +
       (SELECT COUNT(*)::int FROM "Material" WHERE "projectId" = $1) AS total`,
    [projectId],
  );
  return rows[0].total > 0;
}

async function seedProjectData(client, project, def, projectIndex) {
  const rand = mulberry32(def.seed + projectIndex * 97);
  const supplierNames = def.suppliers.map((s) => s[0]);
  const prefix = def.email.split('@')[0].toUpperCase();
  let expenses = 0;
  let revenues = 0;
  let materials = 0;

  for (let i = 0; i < EXPENSE_BASE.length; i++) {
    const [description, category, baseAmount] = EXPENSE_BASE[i];
    const amount = Math.round(baseAmount * (0.85 + rand() * 0.4));
    const source = i % 11 === 0 ? 'SCANNED' : i % 7 === 0 ? 'IMPORTED' : 'MANUAL';
    await client.query(
      `INSERT INTO "Expense"
        (description, category, amount, "vatAmount", date, supplier, "documentNumber",
         currency, "paymentMethod", source, "projectId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,'ILS',$8,$9::"TransactionSource",$10,NOW(),NOW())`,
      [
        `${description} — ${project.name}`,
        category,
        amount,
        vatOf(amount),
        daysAgo(2 + ((i * 11 + projectIndex * 17) % 340)),
        pick(supplierNames, i + projectIndex),
        `${prefix}-EXP-${projectIndex + 1}${String(1000 + i)}`,
        pick(PAYMENT_METHODS, i),
        source,
        project.id,
      ],
    );
    expenses += 1;
  }

  for (let i = 0; i < 18; i++) {
    const amount = Math.round((250 + rand() * 4800) * 100) / 100;
    await client.query(
      `INSERT INTO "Expense"
        (description, category, amount, "vatAmount", date, supplier, "documentNumber",
         currency, "paymentMethod", source, "projectId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,'ILS',$8,'MANUAL'::"TransactionSource",$9,NOW(),NOW())`,
      [
        `הוצאה שוטפת #${i + 1} — ${pick(
          ['דלק', 'חניה', 'מים', 'חשמל אתר', 'כיבוד', 'תיקונים', 'שילוט', 'כפפות'],
          i,
        )}`,
        pick(EXPENSE_CATEGORIES, i + projectIndex),
        amount,
        vatOf(amount),
        daysAgo(1 + i * 6 + projectIndex),
        pick(supplierNames, i + 3),
        `${prefix}-EXP-${projectIndex + 1}${String(3000 + i)}`,
        pick(PAYMENT_METHODS, i + 1),
        project.id,
      ],
    );
    expenses += 1;
  }

  for (let i = 0; i < REVENUE_BASE.length; i++) {
    const [description, baseAmount, status] = REVENUE_BASE[i];
    const amount = Math.round(baseAmount * (0.8 + rand() * 0.35));
    const source = i % 9 === 0 ? 'IMPORTED' : 'MANUAL';
    await client.query(
      `INSERT INTO "Revenue"
        (description, customer, amount, "vatAmount", date, status, "documentNumber",
         currency, "paymentMethod", source, "projectId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6::"RevenueStatus",$7,'ILS',$8,$9::"TransactionSource",$10,NOW(),NOW())`,
      [
        `${description} — ${project.name}`,
        pick(CUSTOMERS, i + projectIndex),
        amount,
        vatOf(amount),
        daysAgo(4 + ((i * 13 + projectIndex * 9) % 330)),
        status,
        `${prefix}-REV-${projectIndex + 1}${String(500 + i)}`,
        pick(PAYMENT_METHODS, i + 2),
        source,
        project.id,
      ],
    );
    revenues += 1;
  }

  for (let i = 0; i < MATERIALS.length; i++) {
    const [name, quantity, unitPrice] = MATERIALS[i];
    const qty = Math.round(quantity * (0.7 + rand() * 0.6) * 10) / 10;
    await client.query(
      `INSERT INTO "Material"
        (name, quantity, "unitPrice", supplier, "projectId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
      [name, qty, unitPrice, pick(supplierNames, i), project.id],
    );
    materials += 1;
  }

  return { expenses, revenues, materials };
}

async function main() {
  const client = await pool.connect();
  const summary = [];
  try {
    await client.query('BEGIN');

    for (const def of USERS) {
      const { user, created } = await ensureUser(client, def);
      const suppliersCreated = await ensureSuppliers(client, user.id, def.suppliers);
      const projects = [];

      for (let i = 0; i < def.projects.length; i++) {
        const { project, created: projectCreated } = await ensureProject(
          client,
          user.id,
          def.projects[i],
        );
        const already = await projectHasData(client, project.id);
        const seeded = already
          ? { expenses: 0, revenues: 0, materials: 0, skipped: true }
          : {
              ...(await seedProjectData(client, project, def, i)),
              skipped: false,
            };

        const totals = await client.query(
          `SELECT
             (SELECT COUNT(*)::int FROM "Expense" WHERE "projectId" = $1) AS expenses,
             (SELECT COUNT(*)::int FROM "Revenue" WHERE "projectId" = $1) AS revenues,
             (SELECT COUNT(*)::int FROM "Material" WHERE "projectId" = $1) AS materials`,
          [project.id],
        );

        projects.push({
          id: project.id,
          name: project.name,
          projectCreated,
          seeded,
          totals: totals.rows[0],
        });
      }

      const supplierCount = await client.query(
        `SELECT COUNT(*)::int AS count FROM "Supplier" WHERE "userId" = $1`,
        [user.id],
      );

      summary.push({
        userCreated: created,
        id: user.id,
        email: user.email,
        name: user.name,
        suppliersCreated,
        suppliersTotal: supplierCount.rows[0].count,
        projects,
      });
    }

    await client.query('COMMIT');
    console.log(JSON.stringify(summary, null, 2));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
