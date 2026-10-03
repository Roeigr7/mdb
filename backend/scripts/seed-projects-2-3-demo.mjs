/**
 * Demo seed: create "פרויקט 2" + "פרויקט 3" for roeigr7@gmail.com
 * with dozens of expenses, revenues, materials, and suppliers.
 *
 * Run from backend/: node ./scripts/seed-projects-2-3-demo.mjs
 */
import 'dotenv/config';
import pg from 'pg';

const USER_EMAIL = 'roeigr7@gmail.com';
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

function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PROJECTS = [
  {
    name: 'פרויקט 2',
    description: 'שיפוץ מלא לדירת גן בהרצליה — שלד, גמר, חצר ומיזוג',
    seed: 202602,
    expenseTemplates: [
      ['פירוק מטבח ישן', 'פירוקים', 4200],
      ['פירוק ריצוף ישן', 'פירוקים', 6800],
      ['פינוי פסולת בניין', 'שינוע', 3500],
      ['בלוקים לתוספת חדר', 'חומרים', 5200],
      ['ברזל מצולע לתוספת', 'חומרים', 8900],
      ['יציקת רצפה חדשה', 'שכר עבודה', 14500],
      ['טיח פנים דירה', 'שכר עבודה', 9800],
      ['טיח חוץ חזית', 'שכר עבודה', 7600],
      ['איטום מרפסת', 'חומרים', 4100],
      ['איטום חדר רחצה', 'חומרים', 2800],
      ['ריצוף גרניט פורצלן', 'חומרים', 18500],
      ['עבודת ריצוף', 'שכר עבודה', 12200],
      ['אריחי חיפוי חדר רחצה', 'חומרים', 6400],
      ['כלים סניטריים', 'אינסטלציה', 9200],
      ['צנרת מים חדשה', 'אינסטלציה', 7800],
      ['נקודות ביוב', 'אינסטלציה', 4500],
      ['לוח חשמל חדש', 'חשמל', 5600],
      ['פריסת כבלים דירה', 'חשמל', 8300],
      ['גופי תאורה', 'חשמל', 3900],
      ['דלתות פנים', 'נגרות', 11200],
      ['דלת כניסה משוריינת', 'נגרות', 6800],
      ['חלונות אלומיניום', 'אלומיניום', 16800],
      ['תריסים חשמליים', 'אלומיניום', 9400],
      ['מטבח בהתאמה אישית', 'נגרות', 42000],
      ['משטח קוורץ', 'נגרות', 8900],
      ['ארונות אמבטיה', 'נגרות', 5400],
      ['צבע פנים מלא', 'גמר', 7200],
      ['צבע חוץ', 'גמר', 4800],
      ['פרקט למינציה', 'גמר', 9800],
      ['התקנת פרקט', 'שכר עבודה', 4200],
      ['מיזוג VRF 5 יח׳', 'מיזוג', 28500],
      ['התקנת מיזוג', 'שכר עבודה', 6500],
      ['גינון חצר קדמית', 'חוץ', 12000],
      ['דשא סינתטי', 'חוץ', 7600],
      ['תאורת גינה', 'חוץ', 3200],
      ['גדר אלומיניום', 'חוץ', 9800],
      ['פיקוח הנדסי חודשי', 'ניהול', 3500],
      ['יועץ עיצוב פנים', 'ניהול', 8000],
      ['ביטוח עבודות', 'ביטוח', 4200],
      ['הובלות חומרים', 'שינוע', 2800],
      ['מנוף להרמת חלונות', 'שינוע', 3600],
      ['בטיחות אתר', 'בטיחות', 1900],
      ['ניקיון סופי', 'ניהול', 2400],
      ['תיקוני שפכטל', 'גמר', 1600],
      ['תוספת נקודות חשמל', 'חשמל', 2100],
    ],
    revenueTemplates: [
      ['מקדמה חוזה שיפוץ', 80000, 'PAID'],
      ['תשלום לאחר פירוקים', 45000, 'PAID'],
      ['תשלום שלב אינסטלציה וחשמל', 52000, 'PAID'],
      ['תשלום שלב ריצוף', 38000, 'PAID'],
      ['תשלום מטבח ונגרות', 55000, 'PENDING'],
      ['תשלום מיזוג', 22000, 'PENDING'],
      ['תשלום חצר וגינון', 18000, 'PENDING'],
      ['תוספת חדר רחצה משופר', 12000, 'PAID'],
      ['תוספת תריסים חשמליים', 8500, 'PAID'],
      ['תשלום ביניים חודש 1', 25000, 'PAID'],
      ['תשלום ביניים חודש 2', 25000, 'PAID'],
      ['תשלום ביניים חודש 3', 25000, 'PAID'],
      ['תשלום ביניים חודש 4', 25000, 'PENDING'],
      ['יתרה למסירה', 35000, 'PENDING'],
      ['בונוס עמידה בלו״ז', 6000, 'PAID'],
      ['החזר חומרים מצד לקוח', 2800, 'PAID'],
      ['תוספת פרקט בחדרים', 7400, 'PENDING'],
      ['תוספת גופי תאורה יוקרתיים', 5100, 'CANCELLED'],
      ['תשלום עיצוב פנים', 9000, 'PAID'],
      ['תשלום אחריות מורחבת', 4500, 'PENDING'],
      ['מקדמה נוספת לחוץ', 15000, 'PAID'],
      ['תשלום גדר ודשא', 11000, 'PENDING'],
      ['פיצוי עיכוב ספק חלונות', 3000, 'PAID'],
      ['תשלום סופי חלקי', 20000, 'PENDING'],
      ['תוספת נקודות רשת/TV', 2200, 'PAID'],
    ],
    materialTemplates: [
      ['אריח פורצלן 80×80', 140, 129, 'קרמיקה פלוס'],
      ['אריח חיפוי אמבטיה', 60, 78, 'קרמיקה פלוס'],
      ['דבק אריחים פלקס', 55, 62, 'שרשרת בניין בע״מ'],
      ['רובה אפוקסי', 20, 95, 'שרשרת בניין בע״מ'],
      ['פרקט אלון למינציה', 85, 68, 'עץ ומתכת י.כ.'],
      ['פנלים תואמים', 40, 28, 'עץ ומתכת י.כ.'],
      ['צבע אקרילי פרימיום', 30, 185, 'ספק צבעים ר.ל.'],
      ['שפכטל מוכן', 25, 48, 'ספק צבעים ר.ל.'],
      ['דלת פנים מודרנית', 8, 1250, 'נגרות הגליל'],
      ['דלת כניסה משוריינת', 1, 6800, 'נגרות הגליל'],
      ['חלון הזזה אלומיניום', 6, 3200, 'אלומיניום דרום'],
      ['תריס חשמלי', 6, 1450, 'אלומיניום דרום'],
      ['ברז מטבח נשלף', 1, 890, 'צנרת הצפון'],
      ['אסלה תלויה', 2, 1450, 'צנרת הצפון'],
      ['כיור אמבטיה', 2, 780, 'צנרת הצפון'],
      ['כבל 3×2.5', 400, 7.2, 'אלקטרו-פלוס'],
      ['לוח חשמל 36 מודול', 1, 2100, 'אלקטרו-פלוס'],
      ['שקע USB מובנה', 12, 95, 'אלקטרו-פלוס'],
      ['יחידת מיזוג פנימית', 5, 2800, 'מיזוג חכם'],
      ['מנוע חיצוני VRF', 1, 12500, 'מיזוג חכם'],
      ['דשא סינתטי 40 מ״מ', 70, 95, 'גינון פרימיום'],
      ['אדניות אלומיניום', 8, 420, 'גינון פרימיום'],
      ['גופי תאורת גינה', 14, 180, 'אלקטרו-פלוס'],
      ['יריעת איטום', 18, 135, 'איטום מקצועי'],
      ['פריימר איטום', 10, 88, 'איטום מקצועי'],
      ['לוחות גבס ירוק', 40, 52, 'שרשרת בניין בע״מ'],
      ['פרופיל גבס', 90, 18, 'שרשרת בניין בע״מ'],
      ['בידוד אקוסטי', 35, 65, 'איטום מקצועי'],
      ['משטח קוורץ מטר רץ', 6, 980, 'נגרות הגליל'],
      ['ברגים ודיבלים מארז', 45, 32, 'כלי עבודה פרו'],
    ],
    customers: [
      'משפחת אברהמי',
      'דירת גן הרצליה בע״מ',
      'לקוח פרטי - שרה ל.',
      'יזמות חוף',
    ],
  },
  {
    name: 'פרויקט 3',
    description: 'בניית מחסן תעשייתי וקומת משרדים בפארק תעשייה — שלד פלדה וגמר',
    seed: 202603,
    expenseTemplates: [
      ['תכנון קונסטרוקציית פלדה', 'ניהול', 18000],
      ['היתר בנייה ואגרות', 'ניהול', 12500],
      ['עבודות עפר וחפירה', 'שכר עבודה', 32000],
      ['יציקת יסודות', 'שכר עבודה', 45000],
      ['ברזל ליסודות', 'חומרים', 28000],
      ['בטון מוכן מ״ק', 'חומרים', 36000],
      ['עמודי פלדה', 'חומרים', 78000],
      ['קורות פלדה', 'חומרים', 64000],
      ['ריתוך והרכבת שלד', 'שכר עבודה', 52000],
      ['פחים לגג', 'חומרים', 29000],
      ['בידוד גג', 'חומרים', 14000],
      ['קירות סנדוויץ׳', 'חומרים', 48000],
      ['התקנת קירות', 'שכר עבודה', 22000],
      ['דלתות תעשייתיות', 'ציוד', 16500],
      ['שער הזזה חשמלי', 'ציוד', 24000],
      ['מערכת כיבוי אש', 'בטיחות', 31000],
      ['גלאי עשן ומערכת התראה', 'בטיחות', 9800],
      ['לוח חשמל ראשי', 'חשמל', 18500],
      ['תאורה תעשייתית LED', 'חשמל', 14200],
      ['כבלים תלת-פאזיים', 'חשמל', 11200],
      ['מיזוג משרדים', 'מיזוג', 26000],
      ['ריצוף אזור משרדים', 'גמר', 8700],
      ['תקרות אקוסטיות', 'גמר', 6400],
      ['חלונות משרד', 'אלומיניום', 9800],
      ['ריהוט משרדי בסיסי', 'ציוד', 12000],
      ['מערכת מצלמות', 'בטיחות', 7800],
      ['גידור מתחם', 'חוץ', 15000],
      ['אספלט חניה', 'חוץ', 28000],
      ['שילוט חוץ', 'חוץ', 4200],
      ['מנוף נייד שבועי', 'שינוע', 18500],
      ['הובלת פלדה', 'שינוע', 9600],
      ['פועלי יום - חודש 1', 'שכר עבודה', 24000],
      ['פועלי יום - חודש 2', 'שכר עבודה', 24000],
      ['פועלי יום - חודש 3', 'שכר עבודה', 26000],
      ['פיקוח בטיחות שבועי', 'בטיחות', 4800],
      ['בדיקות ריתוך NDT', 'ניהול', 6500],
      ['יועץ כיבוי אש', 'ניהול', 7200],
      ['ביטוח עבודות קבלן', 'ביטוח', 9800],
      ['שכירות משרד אתר', 'ניהול', 3600],
      ['חשמל זמני אתר', 'חשמל', 4200],
      ['מים וביוב זמני', 'אינסטלציה', 2800],
      ['ניקיון תעשייתי', 'ניהול', 3100],
      ['תיקוני צבע שלד', 'גמר', 5400],
      ['מערכת ניקוז גגות', 'אינסטלציה', 8900],
      ['מפריד שומן', 'אינסטלציה', 6200],
    ],
    revenueTemplates: [
      ['מקדמה חוזה מחסן', 150000, 'PAID'],
      ['תשלום לאחר יסודות', 120000, 'PAID'],
      ['תשלום הרכבת שלד', 180000, 'PAID'],
      ['תשלום קירות וגג', 140000, 'PAID'],
      ['תשלום מערכות חשמל', 65000, 'PENDING'],
      ['תשלום כיבוי אש ובטיחות', 48000, 'PENDING'],
      ['תשלום גמר משרדים', 42000, 'PENDING'],
      ['תשלום חניה וגידור', 38000, 'PENDING'],
      ['תוספת שער חשמלי משודרג', 12000, 'PAID'],
      ['תוספת מצלמות', 6500, 'PAID'],
      ['תשלום ביניים חודש 1', 40000, 'PAID'],
      ['תשלום ביניים חודש 2', 40000, 'PAID'],
      ['תשלום ביניים חודש 3', 40000, 'PAID'],
      ['תשלום ביניים חודש 4', 40000, 'PAID'],
      ['תשלום ביניים חודש 5', 40000, 'PENDING'],
      ['יתרה למסירה', 75000, 'PENDING'],
      ['בונוס מסירה מוקדמת', 15000, 'PENDING'],
      ['החזר על שינוי תכנון', 8000, 'PAID'],
      ['תוספת תאורת LED משודרגת', 9200, 'PAID'],
      ['תוספת מיזוג מחסן', 18000, 'CANCELLED'],
      ['תשלום יועץ חיצוני מצד לקוח', 5500, 'PAID'],
      ['מקדמה לתוספת רמפה', 22000, 'PAID'],
      ['תשלום אספלט', 16000, 'PENDING'],
      ['תשלום שילוט ומיתוג', 4800, 'PENDING'],
      ['פיצוי עיכוב ספק פלדה', 7000, 'PAID'],
    ],
    materialTemplates: [
      ['קורת פלדה IPE 300', 48, 1850, 'פלדת הצפון'],
      ['עמוד פלדה HEA 200', 32, 2100, 'פלדת הצפון'],
      ['פח גג טרפזי', 420, 95, 'פלדת הצפון'],
      ['בורג מבני M20', 800, 12, 'פלדת הצפון'],
      ['צבע אפוקסי לפלדה', 60, 145, 'ספק צבעים ר.ל.'],
      ['לוח סנדוויץ׳ 10 ס״מ', 220, 280, 'פאנלים תעשייתיים'],
      ['לוח סנדוויץ׳ 5 ס״מ', 80, 190, 'פאנלים תעשייתיים'],
      ['בידוד צמר סלעים גג', 180, 55, 'איטום מקצועי'],
      ['בטון B30 מ״ק', 160, 420, 'שרשרת בניין בע״מ'],
      ['ברזל מצולע 16 מ״מ', 8.5, 4100, 'עץ ומתכת י.כ.'],
      ['ברזל מצולע 12 מ״מ', 6.2, 3950, 'עץ ומתכת י.כ.'],
      ['כבל 5×10', 250, 28, 'אלקטרו-פלוס'],
      ['כבל 5×6', 180, 18, 'אלקטרו-פלוס'],
      ['גוף תאורה LED תעשייתי', 42, 320, 'אלקטרו-פלוס'],
      ['לוח חשמל תעשייתי', 2, 8500, 'אלקטרו-פלוס'],
      ['גלאי עשן כתובתי', 28, 210, 'בטיחות פלוס'],
      ['מטף 6 ק״ג', 16, 180, 'בטיחות פלוס'],
      ['צינור כיבוי אש', 90, 65, 'בטיחות פלוס'],
      ['דלת אש 90 דק׳', 4, 3200, 'בטיחות פלוס'],
      ['שער הזזה תעשייתי', 1, 18500, 'שערים ואוטומציה'],
      ['מנוע שער', 1, 4200, 'שערים ואוטומציה'],
      ['מצלמת אבטחה IP', 12, 650, 'בטיחות פלוס'],
      ['אריח משרד 60×60', 70, 72, 'קרמיקה פלוס'],
      ['תקרת אקוסטיקה פאנל', 95, 48, 'גמר תעשייתי'],
      ['חלון אלומיניום משרדי', 10, 980, 'אלומיניום דרום'],
      ['מרזב תעשייתי', 60, 85, 'צנרת הצפון'],
      ['מפריד שומן תעשייתי', 1, 6200, 'צנרת הצפון'],
      ['עפר למילוי מ״ק', 200, 45, 'שרשרת בניין בע״מ'],
      ['אספלט טון', 85, 520, 'כבישים ופיתוח'],
      ['עמוד תאורה חניה', 8, 2400, 'אלקטרו-פלוס'],
    ],
    customers: [
      'לוגיסטיקה מתקדמת בע״מ',
      'פארק תעשייה צפון',
      'אחסון ושינוע ישראל',
      'קבוצת השקעות תעשייה',
    ],
  },
];

const SHARED_SUPPLIERS = [
  {
    name: 'פלדת הצפון',
    email: 'sales@steel-north.example',
    phone: '04-8501122',
    notes: 'ספק שלד פלדה וקורות',
  },
  {
    name: 'פאנלים תעשייתיים',
    email: 'orders@panels.example',
    phone: '08-6612233',
    notes: 'קירות סנדוויץ׳ ופאנלים',
  },
  {
    name: 'קרמיקה פלוס',
    email: 'info@ceramic-plus.example',
    phone: '03-5409988',
    notes: 'אריחים לריצוף וחיפוי',
  },
  {
    name: 'נגרות הגליל',
    email: 'studio@galil-wood.example',
    phone: '04-9903344',
    notes: 'מטבחים ודלתות בהתאמה',
  },
  {
    name: 'מיזוג חכם',
    email: 'service@smart-hvac.example',
    phone: '03-7765544',
    notes: 'VRF ומיזוג תעשייתי',
  },
  {
    name: 'גינון פרימיום',
    email: 'hello@premium-garden.example',
    phone: '09-9551122',
    notes: 'דשא סינתטי ותאורת חוץ',
  },
  {
    name: 'בטיחות פלוס',
    email: 'safety@plus.example',
    phone: '03-6117788',
    notes: 'כיבוי אש ומצלמות',
  },
  {
    name: 'שערים ואוטומציה',
    email: 'gates@auto.example',
    phone: '08-9223344',
    notes: 'שערים חשמליים תעשייתיים',
  },
  {
    name: 'כבישים ופיתוח',
    email: 'asphalt@roads.example',
    phone: '08-6778899',
    notes: 'אספלט ופיתוח חניה',
  },
  {
    name: 'גמר תעשייתי',
    email: 'finish@ind.example',
    phone: '03-5002211',
    notes: 'תקרות אקוסטיות וגמר משרדים',
  },
];

const PAYMENT_METHODS = ['Credit Card', 'Bank Transfer', 'Cash', 'Check'];
const EXPENSE_SUPPLIERS = [
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
  'פלדת הצפון',
  'פאנלים תעשייתיים',
  'קרמיקה פלוס',
  'נגרות הגליל',
  'מיזוג חכם',
];
const EXTRA_CATEGORIES = [
  'חומרים',
  'שכר עבודה',
  'שינוע',
  'ציוד',
  'ניהול',
  'בטיחות',
  'חשמל',
];
const EXTRA_DESCS = [
  'דלק לכלים',
  'חניה אתר',
  'מים לאתר',
  'חשמל זמני',
  'כיבוד לעובדים',
  'תיקון כלי',
  'שלט אזהרה',
  'כפפות וקסדות',
];

async function ensureProject(client, userId, name, description) {
  const existing = await client.query(
    `SELECT id, name FROM "Project" WHERE "userId" = $1 AND name = $2 LIMIT 1`,
    [userId, name],
  );
  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const created = await client.query(
    `INSERT INTO "Project" (name, description, "userId", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING id, name`,
    [name, description, userId],
  );
  return created.rows[0];
}

async function seedProject(client, project, def) {
  const rand = mulberry32(def.seed);
  const prefix = project.id * 1000;

  // Clear previous demo rows for re-run safety on these projects only
  await client.query(`DELETE FROM "Expense" WHERE "projectId" = $1`, [
    project.id,
  ]);
  await client.query(`DELETE FROM "Revenue" WHERE "projectId" = $1`, [
    project.id,
  ]);
  await client.query(`DELETE FROM "Material" WHERE "projectId" = $1`, [
    project.id,
  ]);

  let expenseCount = 0;
  for (let i = 0; i < def.expenseTemplates.length; i++) {
    const [description, category, amount] = def.expenseTemplates[i];
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
        daysAgo(4 + i * 2),
        pick(EXPENSE_SUPPLIERS, i + project.id),
        `EXP-P${project.id}-${1000 + i}`,
        'ILS',
        pick(PAYMENT_METHODS, i),
        project.id,
      ],
    );
    expenseCount += 1;
  }

  for (let i = 0; i < 25; i++) {
    const amount = Math.round((250 + rand() * 5200) * 100) / 100;
    const source = i % 4 === 0 ? 'SCANNED' : i % 7 === 0 ? 'IMPORTED' : 'MANUAL';
    await client.query(
      `INSERT INTO "Expense"
        (description, category, amount, "vatAmount", date, supplier, "documentNumber",
         currency, "paymentMethod", source, "projectId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::"TransactionSource",$11,NOW(),NOW())`,
      [
        `הוצאה שוטפת #${i + 1} - ${pick(EXTRA_DESCS, i + prefix)}`,
        pick(EXTRA_CATEGORIES, i + 2),
        amount,
        vatOf(amount),
        daysAgo(1 + i),
        pick(EXPENSE_SUPPLIERS, i + 5),
        `EXP-P${project.id}-${2000 + i}`,
        'ILS',
        pick(PAYMENT_METHODS, i + 1),
        source,
        project.id,
      ],
    );
    expenseCount += 1;
  }

  let revenueCount = 0;
  for (let i = 0; i < def.revenueTemplates.length; i++) {
    const [description, amount, status] = def.revenueTemplates[i];
    await client.query(
      `INSERT INTO "Revenue"
        (description, customer, amount, "vatAmount", date, status, "documentNumber",
         currency, "paymentMethod", source, "projectId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6::"RevenueStatus",$7,$8,$9,'MANUAL'::"TransactionSource",$10,NOW(),NOW())`,
      [
        description,
        pick(def.customers, i),
        amount,
        vatOf(amount),
        daysAgo(6 + i * 3),
        status,
        `REV-P${project.id}-${500 + i}`,
        'ILS',
        pick(PAYMENT_METHODS, i),
        project.id,
      ],
    );
    revenueCount += 1;
  }

  for (let i = 0; i < 10; i++) {
    const amount = Math.round((5000 + rand() * 35000) * 100) / 100;
    const status = pick(['PAID', 'PENDING', 'PAID', 'PENDING', 'CANCELLED'], i);
    await client.query(
      `INSERT INTO "Revenue"
        (description, customer, amount, "vatAmount", date, status, "documentNumber",
         currency, "paymentMethod", source, "projectId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6::"RevenueStatus",$7,$8,$9,'MANUAL'::"TransactionSource",$10,NOW(),NOW())`,
      [
        `תשלום ביניים נוסף #${i + 1}`,
        pick(def.customers, i + 1),
        amount,
        vatOf(amount),
        daysAgo(2 + i * 4),
        status,
        `REV-P${project.id}-${800 + i}`,
        'ILS',
        pick(PAYMENT_METHODS, i + 2),
        project.id,
      ],
    );
    revenueCount += 1;
  }

  let materialCount = 0;
  for (const [name, quantity, unitPrice, supplier] of def.materialTemplates) {
    await client.query(
      `INSERT INTO "Material"
        (name, quantity, "unitPrice", supplier, "projectId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
      [name, quantity, unitPrice, supplier, project.id],
    );
    materialCount += 1;
  }

  return { expenseCount, revenueCount, materialCount };
}

async function seedSuppliers(client, userId) {
  let created = 0;
  for (const supplier of SHARED_SUPPLIERS) {
    const existing = await client.query(
      `SELECT id FROM "Supplier" WHERE "userId" = $1 AND name = $2 LIMIT 1`,
      [userId, supplier.name],
    );
    if (existing.rows[0]) continue;

    await client.query(
      `INSERT INTO "Supplier" (name, email, phone, notes, "userId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
      [
        supplier.name,
        supplier.email,
        supplier.phone,
        supplier.notes,
        userId,
      ],
    );
    created += 1;
  }
  return created;
}

async function main() {
  const { rows: users } = await pool.query(
    `SELECT id, email, name FROM "User" WHERE email ILIKE $1 LIMIT 1`,
    [USER_EMAIL],
  );
  const user = users[0];
  if (!user) {
    const all = await pool.query(
      `SELECT id, email FROM "User" ORDER BY id ASC LIMIT 20`,
    );
    console.error(`User ${USER_EMAIL} not found. Existing users:`, all.rows);
    process.exit(1);
  }

  console.log(`Seeding for user id=${user.id} email=${user.email}`);

  const client = await pool.connect();
  const summary = [];

  try {
    await client.query('BEGIN');

    const suppliersCreated = await seedSuppliers(client, user.id);

    for (const def of PROJECTS) {
      const project = await ensureProject(
        client,
        user.id,
        def.name,
        def.description,
      );
      const counts = await seedProject(client, project, def);

      const totals = await client.query(
        `SELECT
           (SELECT COUNT(*)::int FROM "Expense" WHERE "projectId" = $1) AS expenses,
           (SELECT COUNT(*)::int FROM "Revenue" WHERE "projectId" = $1) AS revenues,
           (SELECT COUNT(*)::int FROM "Material" WHERE "projectId" = $1) AS materials,
           (SELECT COALESCE(SUM(amount),0) FROM "Expense" WHERE "projectId" = $1) AS expenses_sum,
           (SELECT COALESCE(SUM(amount),0) FROM "Revenue" WHERE "projectId" = $1) AS revenues_sum`,
        [project.id],
      );

      summary.push({
        project: { id: project.id, name: project.name },
        created: counts,
        totals: totals.rows[0],
      });
    }

    await client.query('COMMIT');

    console.log(
      JSON.stringify(
        {
          user: { id: user.id, email: user.email },
          suppliersCreated,
          projects: summary,
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
