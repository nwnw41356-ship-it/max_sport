const express = require('express');
const app = express();

app.get('/live/max2', (req, res) => {
    // استقبال التوكين والوقت الجديد تلقائياً من رابط الـ JSON الخاص بتطبيقك
    const token = req.query.token;
    const exp = req.query.exp;

    // إذا لم يتم إرسال توكين جديد بالرابط، يتم استخدام هذا كاحتياط
    const activeToken = token || "V96UuDNyorhrMLvteaRm_RhJgFY";
    const activeExp = exp || "17821662";

    // دمج البيانات لتوليد الرابط الشغال فوراً
    const targetStream = `https://a15.kora-plus.app/live/max2.m3u8?token=${activeToken}&exp=${activeExp}`;

    // هيدرات الأمان والـ CORS لضمان استجابة مشغل التطبيق بدون تعليق
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // توجيه ذكي ومستقر متوافق مع مشغلات الأندرويد
    return res.redirect(307, targetStream);
});

module.exports = app;
