const express = require('express');
const app = express();

// إعدادات الـ CORS للسماح للتطبيق بالاتصال
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
});

app.get('/live/max2', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl || !targetUrl.startsWith('http')) {
        return res.status(400).send('Error: Invalid URL');
    }

    try {
        // حركة ذكية: استخراج الدومين تلقائياً من الرابط لتمويه السيرفر (Spoofing)
        const urlObj = new URL(targetUrl);
        const targetOrigin = urlObj.origin;

        // جلب ملف الـ M3U8 مع هيدرات محاكاة متصفح كامل
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Referer': targetOrigin + '/',
                'Origin': targetOrigin,
                'Accept': '*/*'
            },
            signal: AbortSignal.timeout(8000)
        });

        if (!response.ok) {
            return res.status(response.status).send(`Error: Server returned ${response.status}`);
        }

        const data = await response.text();

        // التأكد من أن الرابط هو ملف M3U8 حقيقي
        if (!data.includes('#EXTM3U')) {
            return res.status(400).send('Error: Invalid stream format');
        }

        // معالجة الروابط الداخلية داخل ملف الـ M3U8 لضمان عملها داخل التطبيق
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
        
        const fixedM3u8 = data.split('\n').map(line => {
            const trimmed = line.trim();
            // تصحيح المسارات النسبية (التي لا تبدأ بـ http)
            if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('http')) {
                return baseUrl + trimmed;
            }
            return line;
        }).join('\n');

        return res.send(fixedM3u8);

    } catch (error) {
        console.error('Proxy Error:', error.message);
        return res.status(500).send('Error: Connection timed out or failed');
    }
});

module.exports = app;
