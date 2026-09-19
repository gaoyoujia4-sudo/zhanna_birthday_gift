import QRCode from 'qrcode';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const url = process.argv[2];

if (!url) {
  console.log('用法:  npm run qr -- <网址>');
  console.log('示例:  npm run qr -- https://your-project.vercel.app');
  process.exit(1);
}

const outPath = path.join(ROOT, 'qrcode.png');

try {
  await QRCode.toFile(outPath, url, {
    type: 'png',
    width: 480,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#14142f', light: '#ffffff' },
  });
  console.log(`✅ 二维码已生成: ${outPath}`);
  console.log(`   指向: ${url}`);
  console.log('   （部署拿到正式网址后，用新网址重新运行本命令覆盖即可）');
} catch (e) {
  console.error('生成失败:', e.message);
  process.exit(1);
}
