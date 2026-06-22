const express = require('express');
const app = express();

app.get('/live/max2', async (req, res) => {
    const targetUrl = req.query.url;
    const fallbackStream = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

    // 1. هيدرات الأمان والـ CORS لمنع تعليق مشغل التطبيق
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // إذا لم يتم إرسال رابط في الـ JSON، يتم التحويل فوراً للبث التجريبي بشكل صحيح
    if (!targetUrl || !targetUrl.startsWith('http')) {
        return res.redirect(302, fallbackStream);
    }

    try {
        // 2. جلب ملف البث مع محاكاة متصفح حقيقي لتخطي الحجب
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://a1.koora24.sbs/',
                'Origin': 'https://a1.koora24.sbs'
            },
            signal: AbortSignal.timeout(5000) // وقت انتظار 5 ثوانٍ كحد أقصى لمنع تعليق السيرفر
        });

        // إذا الرابط ميت أو الموقع الأصلي قفله، حول للتجريبي فوراً بـ 302 لمنع فرّة اللودينغ
        if (!response.ok) {
            console.log(`Target server responded with error: ${response.status}`);
            return res.redirect(302, fallbackStream);
        }

        const data = await response.text();
        
        // التأكد من أن البيانات المستلمة هي ملف بث حقيقي وليست صفحة خطأ HTML
        if (!data.includes('#EXTM3U')) {
            return res.redirect(302, fallbackStream);
        }

        // 3. إرسال الهيدر الصحيح للمشغل وتعديل المسارات الداخلية للبث
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
        // في حال حدوث أي خطأ بالاتصال، يتم التحويل المباشر للبث التجريبي ليعمل التطبيق فوراً
        return res.redirect(302, fallbackStream);
    }
});

module.exports = app;
