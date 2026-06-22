const express = require('express');
const app = express();

// إعدادات الـ CORS لضمان اتصال التطبيق بدون قيود
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
        const urlObj = new URL(targetUrl);
        const targetOrigin = urlObj.origin;
        
        // بناء رابط السيرفر مالتك ديناميكياً لتمرير كل شيء من خلاله
        const proxyBaseUrl = `https://${req.headers.host}/live/max2?url=`;

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Referer': targetOrigin + '/',
            'Origin': targetOrigin,
            'Accept': '*/*'
        };

        // [الحل السري] إذا كان الطلب لقطع الفيديو .ts، اسحبها كبيانات ثنائية (Binary) ومررها بهيدرات الحماية
        if (targetUrl.includes('.ts') || urlObj.pathname.endsWith('.ts')) {
            const response = await fetch(targetUrl, { headers, signal: AbortSignal.timeout(10000) });
            if (!response.ok) return res.status(response.status).send('Error fetching TS chunk');
            
            res.setHeader('Content-Type', 'video/MP2T');
            const arrayBuffer = await response.arrayBuffer();
            return res.send(Buffer.from(arrayBuffer));
        }

        // إذا كان الطلب لملف البث الرئيسي .m3u8
        const response = await fetch(targetUrl, { headers, signal: AbortSignal.timeout(8000) });
        if (!response.ok) {
            return res.status(response.status).send(`Error: Origin returned ${response.status}`);
        }

        const data = await response.text();

        if (!data.includes('#EXTM3U')) {
            return res.status(400).send('Error: Invalid M3U8 format');
        }

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);

        // إعادة كتابة وتوجيه كـل سطر داخل ملف البث ليمر غصباً عليه من خلال سيرفرك
        const fixedM3u8 = data.split('\n').map(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const fullUrl = trimmed.startsWith('http') ? trimmed : baseUrl + trimmed;
                return proxyBaseUrl + encodeURIComponent(fullUrl);
            }
            return line;
        }).join('\n');

        return res.send(fixedM3u8);

    } catch (error) {
        console.error('Proxy Error:', error.message);
        return res.status(500).send('Error: Connection failed');
    }
});

module.exports = app;
