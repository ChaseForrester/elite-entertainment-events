const fs = require('fs');
const path = require('path');
const https = require('https');

const videosDir = path.join(__dirname, 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

const videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-concert-crowd-raising-hands-under-stage-lights-41764-large.mp4';
const dest = path.join(videosDir, 'hero-event-video.mp4');

console.log('Downloading Mixkit event video with User-Agent...');
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
};

https.get(videoUrl, options, (res) => {
  if (res.statusCode === 200) {
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => file.close(() => console.log('✓ SUCCESS: Saved high-end event video to videos/hero-event-video.mp4!')));
  } else {
    console.error('Download status:', res.statusCode);
  }
}).on('error', (err) => console.error(err));
