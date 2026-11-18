/* =====================================================================
   بخش افزودن  —  فقط برای صاحب سایت
   ---------------------------------------------------------------------
   برای اضافه کردن دانش‌آموز یا کار جدید، یک بلوک مثل نمونه‌ی زیر
   به لیست WORKS اضافه کن (بین بلوک‌ها کاما بگذار).

   name        : اسم دانش‌آموز
   file        : نام فایل (فایل را داخل پوشه‌ی files قرار بده)
                 الگوی نام‌گذاری:  درس.نام‌و‌فامیل.پویش.شماره‌ی‌کار.html
                 مثال:  arabi.amirhesamkhoshabi.1.1.html
   description : توضیحات کار
   pooyesh     : 1 یا 2 یا 3
   subject     : arabi (عربی) | riazi (ریاضی) | oloom (علوم) | english (انگلیسی)
   ===================================================================== */
const WORKS = [
  {
    name: "امیرحسام خوشابی",
    file: "arabi.amirhesamkhoshabi.1.1.html",
    description: "بازی افعال",
    pooyesh: 1,
    subject: "arabi"
  },
  {
    name: "حمیدرضا مهریزی",
    file: "arabi.hamidrezamehrizi.3.1.html",
    description: "بازی افعال عربی: ۲۰ سؤال چهارگزینه‌ای از امر، ماضی و مضارع، با نبرد زامبی‌ها",
    pooyesh: 3,
    subject: "arabi"
  },
  {
    name: "آرین جلالی مفرد",
    file: "arabi.aryanjalalimofrad.3.1.html",
    description: "آزمایشگاه فعل امر: ۲۸ چالش برای ساخت فعل، صیغه‌ها و تشخیص، به‌علاوه ۱۰ سؤال کاملاً عربی",
    pooyesh: 3,
    subject: "arabi"
  },
  {
    name: "امیرطاها رضایی نسب",
    file: "arabi.amirtaharezaeinasab.2.1.html",
    description: "افسانه کوروش و کلید دانش: بازی داستانی از درس‌های ۱ تا ۴ عربی نهم",
    pooyesh: 2,
    subject: "arabi"
  },
  /* امیرحسین رحیمی — سه کار (در سایت خودکار ۱ و ۲ و ۳ شماره‌گذاری می‌شوند) */
  {
    name: "امیرحسین رحیمی",
    file: "arabi.amirhosseinrahimi.2.1.html",
    description: "عملیات پل دوستی: واژگان، درک متن و فعل امر در ۱۵ پرسش (درس سوم)",
    pooyesh: 2,
    subject: "arabi"
  },
  {
    name: "امیرحسین رحیمی",
    file: "arabi.amirhosseinrahimi.2.2.html",
    description: "عملیات رمز امر: ۵ مرحله برای پیدا کردن شکل درست فعل امر مخاطب",
    pooyesh: 2,
    subject: "arabi"
  },
  {
    name: "امیرحسین رحیمی",
    file: "arabi.amirhosseinrahimi.2.3.html",
    description: "فرماندهی فعل امر با ضمیرها: بررسی ۱۴ صیغه و صرف فعل امر",
    pooyesh: 2,
    subject: "arabi"
  }
];
/* ================= پایان بخش افزودن ================================ */


/* تنظیمات کلی سایت — معمولاً نیازی به تغییر نیست */
window.SITE = {
  schoolName: "نمونه رشد",
  filesFolder: "files/",
  pooyesh: [
    { id: 1, title: "پویش ۱" },
    { id: 2, title: "پویش ۲" },
    { id: 3, title: "پویش ۳" }
  ],
  subjects: [
    { id: "arabi",   title: "عربی",    glyph: "ع" },
    { id: "riazi",   title: "ریاضی",   glyph: "π" },
    { id: "oloom",   title: "علوم",    glyph: "H₂O" },
    { id: "english", title: "انگلیسی", glyph: "Aa" }
  ],
  works: WORKS
};
