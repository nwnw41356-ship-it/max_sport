const express = require('express');
const axios = require('axios');
const app = express();

app.get('/live/max2', async (req, res) => {
    // هيدرات الـ CORS والمشغل الضرورية لضمان عدم تعليق التطبيق
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    try {
        // 1. جلب الرابط بالتوكين الجديد تلقائياً من الـ API السري مالتهم
        const apiResponse = await axios.get('https://ws.kora-api.space/api/matche/30643/ar', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://blog.sports-world.space/'
            },
            timeout: 5000
        });

        let streamUrl = '';
        if (apiResponse.data && apiResponse.data.channels && apiResponse.data.channels.length > 0) {
            streamUrl = apiResponse.data.channels[0].link;
        }

        // إذا الـ API فارغ نستخدم الرابط الشغال مالتك كاحتياط
        if (!streamUrl || !streamUrl.includes('http')) {
            streamUrl = "https://a15.kora-plus.app/live/max2.m3u8?token=V96UuDNyorhrMLvteaRm_RhJgFY&exp=17821662";
        }

        // استخراج الرابط الأساسي للسيرفر (Base URL) لتصحيح المسارات الداخلية
        const baseStreamUrl = streamUrl.substring(0, streamUrl.lastIndexOf('/') + 1);

        // 2. قراءة محتوى ملف الـ m3u8 بالخلفية من سيرفر البث الأصلي
        const m3u8Response = await axios.get(streamUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://blog.sports-world.space/'
            },
            timeout: 5000
        });

        let m3u8Content = m3u8Response.data;

        // 3. تحويل الروابط الداخلية من نسبية إلى روابط كاملة ومباشرة حتى يقرأها التطبيق فوراً
        if (typeof m3u8Content === 'string') {
            m3u8Content = m3u8Content.split('\n').map(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('http')) {
                    return baseStreamUrl + trimmed;
                }
                return line;
            }).join('\n');
        }

        // 4. إرسال الملف جاهز ومعدل للتطبيق مباشرة كأنه ملف محلي بدون (Redirect)
        return res.send(m3u8Content);

    } catch (error) {
        console.error('Error handling stream:', error.message);
        // في حال حدوث أي خطأ بالاتصال، نرسل هيكل ملف فارغ حتى لا يعلق التطبيق
        return res.send('#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-ENDLIST');
    }
});

module.exports = app;
