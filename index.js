const express = require('express');
const app = express();

app.get('/live/max2', (req, res) => {
    try {
        // الرابط الشغال والافضل اللي دزيته إلي
        const targetUrl = "https://a15.kora-plus.app/live/max2.m3u8?token=V96UuDNyorhrMLvteaRm_RhJgFY&exp=17821662";

        // إرسال رأس تحويل مباشر ومستقر 100% يمنع تعليق التطبيق أو المتصفح
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        return res.redirect(302, targetUrl);

    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).send('حدث خطأ في السيرفر الداخلي');
    }
});

module.exports = app;
