const fs = require('fs');
const { createCanvas } = require('canvas');

// Read the previously parsed json data to guarantee exact match
const rawData = fs.readFileSync('hanja-data.json', 'utf-8');
const hanjaList = JSON.parse(rawData);

const imgsDir = './imgs';
if (!fs.existsSync(imgsDir)) {
    fs.mkdirSync(imgsDir);
}

// A set of pleasing, muted pastel background colors
const bgColors = [
    '#f0f4f8', '#f8f0f4', '#f0f8f4', '#f4f0f8', '#f4f8f0',
    '#f8f4f0', '#eef2ff', '#f0fdfa', '#fffbeb', '#fef2f2'
];

hanjaList.forEach((item, index) => {
    const num = index + 1;
    const fileName = `${num}-${item.m}${item.s}.png`;
    const filePath = `${imgsDir}/${fileName}`;

    const width = 400;
    const height = 500;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Randomize background color based on index to give variety
    const bgColor = bgColors[index % bgColors.length];
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Subtle Border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Draw huge Hanja shadow/outline
    ctx.font = 'bold 220px sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.h, width / 2, height / 2);

    // Draw Meaning + Sound prominently
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`${item.m} ${item.s}`, width / 2, height / 2 + 50);

    // Draw Number Badge
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`No. ${num}`, width / 2, height - 40);

    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);
});

console.log(`Generated ${hanjaList.length} beautiful placeholder images in ${imgsDir}/`);
