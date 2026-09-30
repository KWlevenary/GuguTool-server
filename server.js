const express = require('express');
const multer = require('multer');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('os').tmpdir();

const app = express();
const upload = multer({
    dest: os.tmpdir(),
    limits: { fileSize: 100 * 1024 * 1024 }
});

// 健康检查 + 保活端点
app.get('/ping', (req, res) => {
    res.send('pong ' + new Date().toISOString());
});

// FSB5 → OGG 转换
app.post('/convert', upload.single('fsb'), (req, res) => {
    if (!req.file) return res.status(400).send('no file');
    
    const input = req.file.path;
    const output = input + '.ogg';
    
    execFile('vgmstream-cli',
        ['-o', output, input],
        { timeout: 60000 },
        (err) => {
            fs.unlink(input, () => {});
            if (err) {
                console.error('convert failed:', err);
                return res.status(500).send('convert failed: ' + err.message);
            }
            
            res.setHeader('Content-Type', 'audio/ogg');
            res.sendFile(output, () => {
                fs.unlink(output, () => {});
            });
        }
    );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server listening on port ' + PORT);
});
