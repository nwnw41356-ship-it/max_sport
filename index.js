const express = require('express');
const axios = require('axios');
const app = express();

app.get('/live/max2', async (req, res) => {
    try {
        // 1. الاتصال بالـ API السري للمدونة لجلب الرابط بالتوكين الجديد
        const response = await axios.get('https://ws.kora-api.space/api/matche/30643/ar', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://blog.sports-world.space/',
                'Origin': 'https://blog.sports-world.space'
            },
            timeout: 6000
        });

        const data = response.data;

        // 2. إذا لقك القنوات والرابط المحدث.. يحول التطبيق عليه فوراً
        if (data && data.channels && data.channels.length > 0) {
            // يبحث عن القناة اللي تحتوي على كلمة max2 أو ياخذ أول قناة متوفرة
            const liveUrl = data.channels[0].link; 
            
            if (liveUrl && liveUrl.includes('http')) {
                console.log('تم جلب الرابط بنجاح:', liveUrl);
                return res.redirect(liveUrl);
            }
        }
        
        // 3. إذا الـ API مالتهم ما رجع شي (مثلاً متوقف مؤقتاً)، يحول على الرابط اللي عطيته إلي كحالة احتياطية
        console.log('الـ API فارغ، التحويل للرابط الاحتياطي');
        return res.redirect('https://a15.kora-plus.app/live/max2.m3u8?token=V96UuDNyorhrMLvteaRm_RhJgFY&exp=17821662');

    } catch (error) {
        console.error('خطأ في جلب التوكين التلقائي:', error.message);
        // في حال حدوث أي خطأ بالاتصال، يحول للاحتياطي حتى لا يتوقف التطبيق
        return res.redirect('https://a15.kora-plus.app/live/max2.m3u8?token=V96UuDNyorhrMLvteaRm_RhJgFY&exp=17821662');
    }
});

module.exports = app;
