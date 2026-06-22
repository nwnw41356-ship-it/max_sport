const express = require('express');
const app = express();

app.get('/live/max2', (req, res) => {
    // الرابط الصافي والشغال اللي دزيته إلي
    const targetStream = "https://a15.kora-plus.app/live/max2.m3u8?token=V96UuDNyorhrMLvteaRm_RhJgFY&exp=17821662";

    // إرسال هيدرات تمنع الكاش وتجبر التطبيق ياخذ الرابط فوراً
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl'); // لإعلام التطبيق أنه رابط m3u8

    // تحويل مباشر (302) وهو أفضل نوع للتطبيقات ومصادر الـ IPTV
    return res.redirect(302, targetStream);
});

module.exports = app;
