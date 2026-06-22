const express = require('express');
const app = express();

app.get('/live/max2', async (req, res) => {
    // الرابط الجديد الشغال اللي دزيته إلي
    const targetUrl = "https://v1.360-sport.live/broadcast/99Wr9fyF0EN6NR2s5_GDAw/1782095988/1782095727/1/max2.m3u8";

    // إرسال هيدرات الـ CORS والمشغل لمنع تعليق التطبيق
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    try {
        // استخدام fetch المدمج بـ Node.js لحل مشكلة الكراش نهائياً
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://a1.koora24.sbs/'
            }
        });

        if (!response.ok) {
            // إذا السيرفر الأصلي رفض الاستجابة، نحول التطبيق للرابط مباشرة كخطة بديلة
            return res.redirect(302, targetUrl);
        }

        const data = await response.text();
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        
        // تصحيح مسارات البث الداخلية لـ 360-sport حتى يقرأها مشغل الأندرويد كبث مباشر صافي
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
        let fixedM3u8 = data.split('\n').map(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('http')) {
                return baseUrl + trimmed;
            }
            return line;
        }).join('\n');

        return res.send(fixedM3u8);

    } catch (error) {
        console.error('Error proxying stream:', error.message);
        // في حال حدوث أي خطأ بالسيرفر، يتم التحويل المباشر للرابط الشغال
        return res.redirect(302, targetUrl);
    }
});

module.exports = app;
