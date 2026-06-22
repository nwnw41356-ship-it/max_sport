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
        const targetOrigin = urlObj.origin;

        // هيدرات متطابقة تماماً مع المتصفح اللي فتح البث بنجاح عندك
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
            'Referer': 'https://m.defr.online/',
            'Origin': 'https://m.defr.online',
            'Accept': '*/*',
            'Connection': 'keep-alive'
        };

        // إذا كان الطلب قطعة فيديو .ts، نمررها بسرعة وبدون تأخير برمي البيانات مباشرة
        if (targetUrl.includes('.ts')) {
            const response = await fetch(targetUrl, { headers, signal: AbortSignal.timeout(6000) });
            if (!response.ok) return res.status(response.status).send('Chunk Error');
            
            res.setHeader('Content-Type', 'video/MP2T');
            const buffer = await response.arrayBuffer();
            return res.send(Buffer.from(buffer));
        }

        // جلب ملف الـ m3u8 الرئيسي
        const response = await fetch(targetUrl, { headers, signal: AbortSignal.timeout(6000) });
        if (!response.ok) {
            return res.status(response.status).send(`Error: ${response.status}`);
        }

        const data = await response.text();
        if (!data.includes('#EXTM3U')) {
            return res.status(400).send('Error: Invalid Format');
        }

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
        const proxyBaseUrl = `https://${req.headers.host}/live/max2?url=`;

        // إعادة توجيه المسارات لتمريرها بذكاء من السيرفر
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
        return res.status(500).send('Error: Timeout or Connection Failed');
    }
});

module.exports = app;
