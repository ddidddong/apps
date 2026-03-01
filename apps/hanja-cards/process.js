const fs = require('fs');

const raw = fs.readFileSync('raw_list.txt', 'utf-8');
const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

// 일본 신자체 등 흔한 오타 교정 매핑
const hanjaFixes = {
    '区': '區',
    '営': '營',
    '独': '獨',
    '焼': '燒',
    '為': '爲',
    '栄': '榮',
    '楽': '樂',
    '効': '效',
    '叙': '敍',
    '灯': '燈',
    '虫': '蟲',
    '画': '畵',
    '昼': '晝',
    '鉄': '鐵',
    '歴': '歷',
    '氷': '氷', // 얼음 빙은 氷가 맞음
    '万': '萬'
};

let finalArray = [];
let typos = [];

lines.forEach((line) => {
    const match = line.match(/^(\d+)\s+([^\s]+)\s+(.+)$/);
    if (match) {
        let [_, num, h, meaningSound] = match;
        let originalH = h;

        if (hanjaFixes[h]) {
            h = hanjaFixes[h];
            typos.push(`번호 ${num}: ${originalH} -> ${h} (정자체 변환)`);
        }

        const lastChar = meaningSound[meaningSound.length - 1];
        const meaning = meaningSound.slice(0, -1).trim();
        const sound = lastChar;

        finalArray.push({
            h: h,
            m: meaning,
            s: sound
        });
    }
});

fs.writeFileSync('hanja-data.json', JSON.stringify(finalArray, null, 2));
fs.writeFileSync('hanja-data.js', `const HANJA_4GRADE_1000 = \n${JSON.stringify(finalArray)};\n`);

console.log('Processing completed. Final count without removing duplicates:', finalArray.length);
