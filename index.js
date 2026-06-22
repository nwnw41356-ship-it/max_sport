const express = require('express');
const app = express();

app.get('/live/max2', async (req, res) => {
    const targetUrl = req.query.url;

    // هيدرات الأمان والـ CORS لمنع تعليق مشغل التطبيق
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // إذا لم يتم إرسال رابط، يرجع خطأ 400 فوراً بدون أي بث بديل
    if (!targetUrl || !targetUrl.startsWith('http')) {
        return res.status(400).send('Error: URL parameter is required');
    }

    try {
        // جلب ملف البث مع محاكاة متصفح حقيقي لتخطي الحجب
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://a1.koora24.sbs/',
                'Origin': 'https://a1.koora24.sbs'
            },
            signal: AbortSignal.timeout(5000) // وقت انتظار 5 ثوانٍ كحد أقصى
        });

        // إذا الرابط ميت أو مشفر، يرجع خطأ 404 للمشغل مباشرة
        if (!response.ok) {
            return res.status(404).send('Error: Stream offline or forbidden');
        }

        const data = await response.text();
        
        // التأكد من أن البيانات المستلمة هي ملف بث حقيقي
        if (!data.includes('#EXTM3U')) {
            return res.status(400).send('Error: Not a valid M3U8 file');
        }

        // إرسال الهيدر الصحيح للمشغل وتعديل المسارات الداخلية للبث
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
        const fixedM3u8 = data.split('\n').map(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('http')) {
                return baseUrl + trimmed;
            }
            return line;
        }).join('\n');

        return res.send(fixedM3u8);

    } catch (error) {
        console.error('Proxy Error:', error.message);
        // في حال حدوث خطأ، يرسل خطأ 500 للتطبيق مباشرة
        return res.status(500).send('Error: Stream connection failed');
    }
});

module.exports = app;
