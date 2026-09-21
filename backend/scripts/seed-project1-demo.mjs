/**
 * Demo seed: dozens of expenses, revenues, and materials for "פרויקט1".
 * Run from backend/: node ./scripts/seed-project1-demo.mjs
 */
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

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

async function main() {
  const { rows: projects } = await pool.query(
    `SELECT id, name FROM "Project"
     WHERE name ILIKE $1 OR name ILIKE $2 OR name ILIKE $3
     ORDER BY id ASC
     LIMIT 5`,
    ['פרויקט1', '%פרויקט1%', '%פרויקט%'],
  );

  let project = projects.find((p) => p.name === 'פרויקט1') ?? projects[0];

  if (!project) {
    const all = await pool.query(`SELECT id, name FROM "Project" ORDER BY id`);
    console.error('Project "פרויקט1" not found. Existing:', all.rows);
    process.exit(1);
  }

  console.log(`Seeding project id=${project.id} name="${project.name}"`);

  const expenseCategories = [
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
  ];
  const suppliers = [
    'שרשרת בניין בע״מ',
    'אלקטרו-פלוס',
    'צנרת הצפון',
    'עץ ומתכת י.כ.',
    'בטוח-ביטוחים',
    'הובלות דרום',
    'כלי עבודה פרו',
    'ספק צבעים ר.ל.',
    'איטום מקצועי',
    'חשמל ישיר',
  ];
  const paymentMethods = ['Credit Card', 'Bank Transfer', 'Cash', 'Check'];
  const customers = [
    'משפחת כהן',
    'חברת נכסים אור',
    'יזמות הגליל',
    'דירה להשקעה בע״מ',
    'לקוח פרטי - לוי',
    'קבוצת רכישה צפון',
    'משרד עו״ד ברק',
    'קרן השקעות בית',
  ];

  const expenseTemplates = [
    ['רכישת בלוקים ובטון', 'חומרים', 2450],
    ['ברזל לבניין 12 מ״מ', 'חומרים', 3890],
    ['מלט וחול', 'חומרים', 980],
    ['לוחות גבס', 'חומרים', 1560],
    ['צבע פנים ואקרילי', 'חומרים', 720],
    ['בידוד תרמי', 'חומרים', 2100],
    ['שכר קבלן שלד - שלב א׳', 'שכר עבודה', 18500],
    ['שכר קבלן גמר', 'שכר עבודה', 12400],
    ['פועלי יום - שבוע 12', 'שכר עבודה', 5600],
    ['הובלת חומרים לאתר', 'שינוע', 850],
    ['מנוף יומי', 'שינוע', 3200],
    ['השכרת מערבל בטון', 'ציוד', 1400],
    ['השכרת פיגומים', 'ציוד', 2750],
    ['מקדחה + דיסק', 'כלים', 640],
    ['ערכת כלי יד', 'כלים', 390],
    ['קסדות וכפפות', 'בטיחות', 480],
    ['גדר בטיחות זמנית', 'בטיחות', 1100],
    ['לוח חשמל זמני', 'חשמל', 2300],
    ['כבלים ותעלות', 'חשמל', 1750],
    ['צנרת PVC וחיבורים', 'אינסטלציה', 1980],
    ['ברזים ואביזרים', 'אינסטלציה', 860],
    ['יועץ בטיחות חודשי', 'ניהול', 2500],
    ['פיקוח הנדסי', 'ניהול', 4200],
    ['ביטוח עבודות קבלניות', 'ביטוח', 3100],
    ['דמי ניהול משרד', 'ניהול', 900],
    ['ניקיון אתר', 'ניהול', 650],
    ['תיקון כלי עבודה', 'כלים', 220],
    ['דלק למנוף', 'שינוע', 540],
    ['אריחי ריצוף', 'חומרים', 4200],
    ['דבק אריחים ורובה', 'חומרים', 780],
    ['דלתות פנים', 'חומרים', 5600],
    ['חלונות אלומיניום', 'חומרים', 9800],
    ['מערכת מיזוג - מקדמה', 'ציוד', 7500],
    ['איטום גג', 'חומרים', 3400],
    ['טיח חוץ', 'שכר עבודה', 6800],
    ['ריצוף עבודה', 'שכר עבודה', 9100],
    ['חשמל סופי - חוטים', 'חשמל', 2650],
    ['נקודות מים וביוב', 'אינסטלציה', 4100],
    ['שילוט אתר', 'בטיחות', 320],
    ['בדיקות מעבדה לבטון', 'ניהול', 1100],
  ];

  const revenueTemplates = [
    ['מקדמה על חוזה', 45000, 'PAID'],
    ['תשלום שלב שלד', 62000, 'PAID'],
    ['תשלום שלב גמר רטוב', 38000, 'PAID'],
    ['תשלום שלב חשמל ואינסטלציה', 27500, 'PAID'],
    ['תשלום שלב ריצוף', 22000, 'PENDING'],
    ['תשלום שלב נגרות', 18500, 'PENDING'],
    ['תוספת שינוי תכנון', 8500, 'PAID'],
    ['תוספת חדר נוסף', 15000, 'PENDING'],
    ['תשלום מסירה חלקית', 30000, 'PAID'],
    ['יתרת חוזה - סופי', 42000, 'PENDING'],
    ['בונוס עמידה בלוח זמנים', 5000, 'PAID'],
    ['החזר הוצאות מצד לקוח', 3200, 'PAID'],
    ['תשלום ביניים חודש 3', 28000, 'PAID'],
    ['תשלום ביניים חודש 4', 28000, 'PAID'],
    ['תשלום ביניים חודש 5', 28000, 'PENDING'],
    ['תוספת מערכת אזעקה', 6400, 'CANCELLED'],
    ['תוספת פרגולה', 12000, 'PENDING'],
    ['תשלום עבור חומרי גמר משודרגים', 9600, 'PAID'],
    ['פיצוי עיכוב ספק חיצוני', 4000, 'PAID'],
    ['תשלום אחריות מורחבת', 7500, 'PENDING'],
    ['מקדמה נוספת - שיפוץ חצר', 18000, 'PAID'],
    ['תשלום שלב צבע', 14000, 'PENDING'],
    ['תשלום שלב מטבח', 25000, 'PENDING'],
    ['תשלום שלב חדרי רחצה', 16500, 'PAID'],
    ['תשלום ציוד מיזוג', 11000, 'PAID'],
  ];

  const materialTemplates = [
    ['בלוק בטון 20', 1200, 4.8, 'שרשרת בניין בע״מ'],
    ['מלט שק 50 ק״ג', 180, 28.5, 'שרשרת בניין בע״מ'],
    ['חול בניין מ״ק', 45, 95, 'שרשרת בניין בע״מ'],
    ['ברזל מצולע 12 מ״מ', 2.5, 4200, 'עץ ומתכת י.כ.'],
    ['ברזל מצולע 8 מ״מ', 1.8, 3800, 'עץ ומתכת י.כ.'],
    ['לוח גבס רגיל', 85, 42, 'שרשרת בניין בע״מ'],
    ['פרופיל אלומיניום', 60, 78, 'עץ ומתכת י.כ.'],
    ['צבע אקרילי לבן 18 ל׳', 24, 165, 'ספק צבעים ר.ל.'],
    ['צבע חוץ', 12, 210, 'ספק צבעים ר.ל.'],
    ['אריח גרניט פורצלן 60×60', 95, 89, 'שרשרת בניין בע״מ'],
    ['דבק אריחים שק', 40, 55, 'שרשרת בניין בע״מ'],
    ['צינור PVC 110', 120, 32, 'צנרת הצפון'],
    ['צינור PVC 50', 80, 18, 'צנרת הצפון'],
    ['כבל חשמל 3×2.5', 350, 6.5, 'אלקטרו-פלוס'],
    ['כבל חשמל 3×1.5', 200, 4.2, 'אלקטרו-פלוס'],
    ['שקע חשמל כפול', 48, 28, 'אלקטרו-פלוס'],
    ['מפסק תאורה', 36, 22, 'אלקטרו-פלוס'],
    ['ברז כיור', 8, 145, 'צנרת הצפון'],
    ['אסלה תלויה', 3, 980, 'צנרת הצפון'],
    ['דלת פנים לבנה', 12, 780, 'עץ ומתכת י.כ.'],
    ['חלון אלומיניום סטנדרט', 9, 1450, 'עץ ומתכת י.כ.'],
    ['בידוד צמר סלעים', 70, 48, 'איטום מקצועי'],
    ['יריעת איטום ביטומנית', 25, 120, 'איטום מקצועי'],
    ['ברגים ודיבלים מארז', 30, 35, 'כלי עבודה פרו'],
    ['סיליקון שקוף', 40, 18, 'כלי עבודה פרו'],
    ['פריימר לקירות', 15, 95, 'ספק צבעים ר.ל.'],
    ['טיח מוכן שק', 90, 42, 'שרשרת בניין בע״מ'],
    ['רשת אינטרגלוס', 55, 28, 'שרשרת בניין בע״מ'],
    ['לוח OSB', 20, 110, 'עץ ומתכת י.כ.'],
    ['עץ קונסטרוקציה 2×4', 100, 24, 'עץ ומתכת י.כ.'],
  ];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let expenseCount = 0;
    for (let i = 0; i < expenseTemplates.length; i++) {
      const [description, category, amount] = expenseTemplates[i];
      await client.query(
        `INSERT INTO "Expense"
          (description, category, amount, "vatAmount", date, supplier, "documentNumber",
           currency, "paymentMethod", source, "projectId", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'MANUAL'::"TransactionSource",$10,NOW(),NOW())`,
        [
          description,
          category,
          amount,
          vatOf(amount),
          daysAgo(3 + i * 2),
          pick(suppliers, i),
          `EXP-2026-${1000 + i}`,
          'ILS',
          pick(paymentMethods, i),
          project.id,
        ],
      );
      expenseCount += 1;
    }

    for (let i = 0; i < 20; i++) {
      const amount = Math.round((300 + Math.random() * 4500) * 100) / 100;
      const source = i % 5 === 0 ? 'SCANNED' : 'MANUAL';
      await client.query(
        `INSERT INTO "Expense"
          (description, category, amount, "vatAmount", date, supplier, "documentNumber",
           currency, "paymentMethod", source, "projectId", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::"TransactionSource",$11,NOW(),NOW())`,
        [
          `הוצאה שוטפת #${i + 1} - ${pick(
            ['דלק', 'חניה', 'מים', 'חשמל אתר', 'קפה לעובדים', 'תיקונים קטנים'],
            i,
          )}`,
          pick(expenseCategories, i + 3),
          amount,
          vatOf(amount),
          daysAgo(1 + i),
          pick(suppliers, i + 2),
          `EXP-2026-${2000 + i}`,
          'ILS',
          pick(paymentMethods, i + 1),
          source,
          project.id,
        ],
      );
      expenseCount += 1;
    }

    let revenueCount = 0;
    for (let i = 0; i < revenueTemplates.length; i++) {
      const [description, amount, status] = revenueTemplates[i];
      await client.query(
        `INSERT INTO "Revenue"
          (description, customer, amount, "vatAmount", date, status, "documentNumber",
           currency, "paymentMethod", source, "projectId", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6::"RevenueStatus",$7,$8,$9,'MANUAL'::"TransactionSource",$10,NOW(),NOW())`,
        [
          description,
          pick(customers, i),
          amount,
          vatOf(amount),
          daysAgo(5 + i * 3),
          status,
          `REV-2026-${500 + i}`,
          'ILS',
          pick(paymentMethods, i),
          project.id,
        ],
      );
      revenueCount += 1;
    }

    let materialCount = 0;
    for (const [name, quantity, unitPrice, supplier] of materialTemplates) {
      await client.query(
        `INSERT INTO "Material"
          (name, quantity, "unitPrice", supplier, "projectId", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
        [name, quantity, unitPrice, supplier, project.id],
      );
      materialCount += 1;
    }

    await client.query('COMMIT');

    const totals = await pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM "Expense" WHERE "projectId" = $1) AS expenses,
         (SELECT COUNT(*)::int FROM "Revenue" WHERE "projectId" = $1) AS revenues,
         (SELECT COUNT(*)::int FROM "Material" WHERE "projectId" = $1) AS materials,
         (SELECT COALESCE(SUM(amount),0) FROM "Expense" WHERE "projectId" = $1) AS expenses_sum,
         (SELECT COALESCE(SUM(amount),0) FROM "Revenue" WHERE "projectId" = $1) AS revenues_sum`,
      [project.id],
    );

    console.log(
      JSON.stringify(
        {
          created: {
            expenses: expenseCount,
            revenues: revenueCount,
            materials: materialCount,
          },
          projectTotals: totals.rows[0],
        },
        null,
        2,
      ),
    );
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
