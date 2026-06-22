const express = require('express');
const axios = require('axios');
const app = express();

app.get('/live/max2', async (req, res) => {
    try {
        // الاتصال المباشر بالسيرفر السري مالتهم لجلب بيانات المباراة والقنوات
        const response = await axios.get('https://ws.kora-api.space/api/matche/30643/ar', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://blog.sports-world.space/'
            }
        });

        const data = response.data;

        // التأكد من أن المباراة نشطة وبها قنوات بث شغالة حالياً
        if (data && data.channels && data.channels.length > 0) {
            // أخذ رابط القناة الأولى المتوفرة في البث الشغال حالياً
            const liveUrl = data.channels[0].link;

            if (liveUrl) {
                // تحويل المشغل بتطبيقك فوراً للرابط الشغال أبو التوكين الطازة
                return res.redirect(liveUrl);
            }
        }
        
        return res.status(404).send('لم يتم العثور على بث شغال حالياً من المصدر السري');

    } catch (error) {
        console.error('Error fetching token:', error.message);
        return res.status(500).send('مشكلة في الاتصال بالسيرفر السري للمصدر');
    }
});

module.exports = app;
