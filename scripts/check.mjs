// scripts/check.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const targets = ['index.html', 'privacy.html', 'assets/styles.css'];

// 금지어 (이 파일 자체에 단어가 그대로 남지 않도록 조각으로 보관)
const wordParts = [
  ['가', '격'], ['구', '매'], ['판', '매'], ['예', '약'], ['주', '문'], ['결', '제'],
  ['무', '료'], ['할', '인'], ['배', '송'], ['품', '절'], ['출', '시'], ['예', '정'],
  ['준비', ' 중'], ['시', '안'],
];
const wordPatterns = wordParts.map((p) => {
  const word = p.join('');
  return { word, re: new RegExp(word.replace(/ /g, '\\s*')) };
});

const allowedColors = new Set(['#ffffff', '#18161f', '#1f4fe0', '#d7261e']);
const emojiRe = /\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\uFE0F\u200D\u20E3]/gu;
const emojiOk = new Set(['\u00A9', '\u00AE']); // 저작권, 등록 기호는 허용

const violations = [];
const report = (file, no, rule, line) => violations.push(`${file}:${no}: [${rule}] ${line.trim()}`);

function selectorOf(lines, i) {
  let j = i;
  while (j >= 0 && !lines[j].includes('{')) j--;
  if (j < 0) return '';
  let sel = lines[j].split('{')[0];
  let k = j - 1;
  while (k >= 0 && lines[k].trim().endsWith(',')) { sel = lines[k] + sel; k--; }
  return sel;
}

for (const file of targets) {
  let text;
  try {
    text = readFileSync(join(root, file), 'utf8');
  } catch (err) {
    console.error(`${file}: 파일을 읽지 못했어요 (${err.message})`);
    process.exit(1);
  }
  const lines = text.split(/\r?\n/);

  lines.forEach((line, i) => {
    const no = i + 1;

    // (1) 금지어
    for (const { word, re } of wordPatterns) {
      if (re.test(line)) report(file, no, `금지어 ${word}`, line);
    }

    // (2) 이모지
    const emojis = (line.match(emojiRe) || []).filter((m) => !emojiOk.has(m));
    if (emojis.length) report(file, no, '이모지', line);

    // (3) 4색 외의 hex, rgb
    for (const m of line.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      if (!allowedColors.has(m[0].toLowerCase())) report(file, no, `허용 외 색 ${m[0]}`, line);
    }
    if (/\b(?:rgba?|hsla?)\s*\(/i.test(line)) report(file, no, 'rgb, hsl 값', line);

    // (4) border, outline, box-shadow
    for (const m of line.matchAll(/(?:^|[\s;{])(border(?!-radius)[\w-]*)\s*:/gi)) {
      report(file, no, `선언 ${m[1]}`, line);
    }
    for (const m of line.matchAll(/(?:^|[\s;{])(box-shadow)\s*:/gi)) {
      report(file, no, `선언 ${m[1]}`, line);
    }
    for (const m of line.matchAll(/(?:^|[\s;{])(outline[\w-]*)\s*:\s*([^;}]*)/gi)) {
      const focusRule = /:focus-visible/.test(selectorOf(lines, i));
      const transparentRule = /transparent/i.test(m[2]); // 고대비 모드용 투명 윤곽
      if (!focusRule && !transparentRule) report(file, no, `포커스 밖 ${m[1]}`, line);
    }

    // (5) border-radius 값
    for (const m of line.matchAll(/(?:^|[\s;{])(border(?:-[a-z]+)*-radius)\s*:\s*([^;}]*)/gi)) {
      const value = m[2].replace(/!important/i, '').trim();
      if (value !== 'var(--radius)' && value !== '50%') {
        report(file, no, `반경 값 ${value}`, line);
      }
    }
  });
}

if (violations.length) {
  console.log(violations.join('\n'));
  console.log(`\n위반 ${violations.length}건`);
  process.exit(1);
}
console.log('통과');