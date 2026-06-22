const express = require('express');
const app = express();

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
        const proxyBaseUrl = `https://${req.headers.host}/live/max2?url=`;

        // [السحر هنا] تزوير كامل للهوية كأننا داخل موقع يلا شوت
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
            'Referer': 'https://yalla-shoot.com/',
            'Origin': 'https://yalla-shoot.com',
            'Accept': '*/*',
            'Connection': 'keep-alive'
        };

        // جلب قطع الفيديو الصغيرة .ts بنفس الهيدرات المزورة
        if (targetUrl.includes('.ts') || urlObj.pathname.endsWith('.ts')) {
            const response = await fetch(targetUrl, { headers, signal: AbortSignal.timeout(12000) });
            if (!response.ok) return res.status(response.status).send('Chunk Error');
            
            res.setHeader('Content-Type', 'video/MP2T');
            const buffer = await response.arrayBuffer();
            return res.send(Buffer.from(buffer));
        }

        // جلب ملف الـ m3u8 الرئيسي
        const response = await fetch(targetUrl, { headers, signal: AbortSignal.timeout(8000) });
        if (!response.ok) {
            return res.status(response.status).send(`Error: ${response.status}`);
        }

        const data = await response.text();
        if (!data.includes('#EXTM3U')) {
            return res.status(400).send('Error: Invalid Format');
        }

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        
        const baseEndpoint = targetUrl.split('?')[0];
        const baseUrl = baseEndpoint.substring(0, baseEndpoint.lastIndexOf('/') + 1);

        // تعديل الروابط الداخلية لتمر عبر البروكسي بالهوية الجديدة
        const fixedM3u8 = data.split('\n').map(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                let fullUrl = trimmed.startsWith('http') ? trimmed : baseUrl + trimmed;
                return proxyBaseUrl + encodeURIComponent(fullUrl);
            }
            return line;
        }).join('\n');

        return res.send(fixedM3u8);

    } catch (error) {
        console.error('Proxy Error:', error.message);
        return res.status(500).send('Error: Connection Failed');
    }
});

module.exports = app;
