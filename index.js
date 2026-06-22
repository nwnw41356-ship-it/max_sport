const express = require('express');
const axios = require('axios');
const app = express();

app.get('/live/max2', async (req, res) => {
    try {
        // جلب البيانات من السيرفر السري للموقع
        const response = await axios.get('https://ws.kora-api.space/api/matche/30643/ar', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://blog.sports-world.space/'
            },
            timeout: 5000 // وقت مستقطع 5 ثواني
        });

        const data = response.data;

        // 1. إذا اكو مباراة لايف وقنواتها شغالة.. خذ الرابط فوراً
        if (data && data.channels && data.channels.length > 0) {
            const liveUrl = data.channels[0].link;
            if (liveUrl) {
                return res.redirect(liveUrl);
            }
        }
        
        // 2. إذا البث واقف بالموقع الأصلي (مثل وقت الفجر)، حوله على سيرفر احتياطي شغال حتى لا يعلق التطبيق
        return res.redirect('https://a15.kora-plus.app/live/max2/playlist.m3u8');

    } catch (error) {
        console.error('Error:', error.message);
        // 3. حتى لو صار خطأ بالسيرفر مالتهم، حول المستخدم للاحتياطي لضمان استقرار التطبيق
        return res.redirect('https://a15.kora-plus.app/live/max2/playlist.m3u8');
    }
});

module.exports = app;
