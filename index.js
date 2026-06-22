const express = require('express');
const app = express();

app.get('/live/max2', async (req, res) => {
    // استقبال الرابط الجديد المحدث مباشرة من ملف الـ JSON مالتك
    const targetUrl = req.query.url;

    // هيدرات الـ CORS والمشغل الضرورية لمنع تعليق تطبيق الأندرويد
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // إذا ما أرسلت رابط بالـ JSON، يحول تلقائياً على بث تجريبي حتى لا يفتر التطبيق
    if (!targetUrl || !targetUrl.startsWith('http')) {
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        return res.send('#EXTM3U\n#EXT-X-VERSION:3\n#EXTINF:-1,\nhttps://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
    }

    try {
        // محاكاة متصفح أندرويد حقيقي بالكامل لإقناع السيرفر الأصلي وتخطي حجب الـ 403
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://a1.koora24.sbs/',
                'Origin': 'https://a1.koora24.sbs',
                'Accept': '*/*',
                'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8'
            }
        });

        // إذا الرابط منتهي أو السيرفر ضرب 403، نشغل القناة الاحتياطية فوراً لمنع الفرة والتأخير
        if (!response.ok) {
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            return res.send('#EXTM3U\n#EXT-X-VERSION:3\n#EXTINF:-1,\nhttps://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
        }

        const data = await response.text();
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        
        // إعادة تصحيح مسارات ومفاتيح البث الداخلية حتى تفتح داخل مشغل التطبيق مباشرة
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
        console.error('Proxy Error:', error.message);
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        return res.send('#EXTM3U\n#EXT-X-VERSION:3\n#EXTINF:-1,\nhttps://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
    }
});

module.exports = app;
