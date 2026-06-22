const express = require('express');
const axios = require('axios');
const app = express();

app.get('/live/max2', async (req, res) => {
    // الرابط الشغال مالتك
    const targetStream = "https://a15.kora-plus.app/live/max2.m3u8?token=V96UuDNyorhrMLvteaRm_RhJgFY&exp=17821662";

    try {
        // الاتصال بالبث مع إرسال الـ Headers المطلوبة لكسر أي حماية
        const response = await axios({
            method: 'get',
            url: targetStream,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://blog.sports-world.space/',
                'Origin': 'https://blog.sports-world.space'
            }
        });

        // تمرير الـ Headers للتطبيق مباشرة
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

        // ضخ البث مباشرة للمشغل بدون تحويل (Redirect)
        response.data.pipe(res);

    } catch (error) {
        console.error('Proxy Error:', error.message);
        // إذا واجه مشكلة، يحول كخيار احتياطي أخير
        return res.redirect(302, targetStream);
    }
});

module.exports = app;
