const express = require('express');
const app = express();

app.get('/live/max2', (req, res) => {
    // الرابط الشغال مالتك
    const streamUrl = "https://a15.kora-plus.app/live/max2.m3u8?token=V96UuDNyorhrMLvteaRm_RhJgFY&exp=17821662";

    // بدال التحويل، راح نطبع صفحة HTML بيها مشغل فيديو يشتغل بالمتصفح وبالتطبيق فوراً
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>MAX SPORT - LIVE</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/video.js/7.21.1/video-js.min.css" rel="stylesheet">
            <style>
                body, html { margin: 0; padding: 0; width: 100%; height: 100%; background-color: #000; overflow: hidden; }
                .video-js { width: 100% !important; height: 100% !important; }
            </style>
        </head>
        <body>
            <video id="max-player" class="video-js vjs-default-skin vjs-big-play-centered" controls autoplay preload="auto">
                <source src="${streamUrl}" type="application/x-mpegURL">
            </video>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/video.js/7.21.1/video.min.js"></script>
        </body>
        </html>
    `);
});

module.exports = app;
