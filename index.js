const express = require('express');
const axios = require('axios');
const app = express();

app.get('/live/max2', async (req, res) => {
    try {
        // رابط المدونة التمويهية اللي تجيب منها البث
        const targetPage = 'https://blog.sports-world.space/news/cte-brain-disease-athletes-insurance-ar'; 

        const response = await axios.get(targetPage, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://blog.sports-world.space/'
            }
        });

        const htmlContent = response.data;
        
        // تعديل ذكي: يبحث عن كورة بلس مهما كان رقم السيرفر (a5, a15, a20... إلخ)
        const regex = /(https:\/\/a[0-9]+\.kora-plus\.app\/live\/max2[^"\s>]+token=[^"\s>]+exp=[0-9]+)/;
        const match = htmlContent.match(regex);

        if (match && match[0]) {
            // تحويل المستخدم فوراً للرابط الجديد الشغال
            return res.redirect(match[0]);
        } else {
            return res.status(404).send('لم يتم العثور على بث شغال حالياً');
        }
    } catch (error) {
        return res.status(500).send('مشكلة في الاتصال بالمصدر الأصلي');
    }
});

module.exports = app;
