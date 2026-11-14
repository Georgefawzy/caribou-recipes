# Recipe Guide — Caribou Coffee Egypt

دليل تحضير المشروبات (82 مشروب): المكونات لكل مقاس، طريقة التحضير، الأخطاء الشائعة، والتقديم صالة/تيك أواي. عربي/إنجليزي، يشتغل أوفلاين كتطبيق (PWA).
الأسماء والصور مطابقة لـ Menu Guide.

## النشر على GitHub Pages
1. ريبو جديد (مثلاً `caribou-recipes`) وارفع كل محتويات الفولدر (مع فولدر `img`).
2. Settings > Pages > Deploy from a branch > main / root.

## التحديث
- **تعديل سريع:** عدّل `data.js` (كل مشروب object واحد) ثم غيّر `VERSION` في أول `sw.js`.
- **من غير كود (مُفضّل):** ارفع `Recipe_Guide_Data_Template.xlsx` على Google Sheets، انشر تابَي `Recipes_Data` و`Ingredients_Data` (Publish to web > CSV) وحط الرابطين في `config.js`. أي تعديل في الشيت يظهر في الموقع تلقائيًا.
- **مشروب جديد:** صف جديد في `Recipes_Data` + صفوف مكوناته في `Ingredients_Data`. لو على المنيو حط كود الصنف في `menu` (يستخدم صورة `img/<code>.webp`)، ولو صورة جديدة ارفعها في `img/`.
