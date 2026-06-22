const express = require('express');
const axios = require('axios');
const app = express();

app.get('/live/max2', async (req, res) => {
    try {
        const targetPage = 'https://blog.sports-world.space/news/cte-brain-disease-athletes-insurance-ar'; 

        // أرسلنا طلب بـ أعلى درجات المحاكاة للمتصفح الحقيقي
        const response = await axios.get(targetPage, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
                'Referer': 'https://blog.sports-world.space/',
                'Cache-Control': 'no-cache'
            }
        });

        const htmlContent = response.data;
        
        // فحص مرن جداً يبحث عن أي رابط بث يحتوي على kora-plus وبيه توكين
        const regex = /(https:\/\/[a-zA-Z0-9\.-]+\.kora-plus\.app\/live\/max2[^"\s>]+token=[^"\s>]+exp=[0-9]+)/;
        const match = htmlContent.match(regex);

        if (match && match[0]) {
            // إذا لقى الرابط يحولك فوراً
            return res.redirect(match[0]);
        } else {
            // إذا ما لقى الرابط، راح يطبعلك كود الصفحة عشان نشوف الموقع شغير بالكود ماله
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.send(`
                <h3>تنبيه: السيرفر شغال بس الموقع الأصلي مغير الكود ماله!</h3>
                <p>هذا هو الكود اللي لقطه سيرفرك من موقعهم حالياً، تفحص الكود أو انسخه ودزه إلي حتى أعدلك الـ Regex فوراً:</p>
                <textarea style="width:100%; height:400px;">${htmlContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
            `);
        }
    } catch (error) {
        return res.status(500).send('مشكلة في الاتصال بالمصدر الأصلي: ' + error.message);
    }
});

module.exports = app;
