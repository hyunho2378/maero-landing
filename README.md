# 마에로와 삐삐로 광고 도착 페이지

프레임워크 없이 정적 HTML, CSS, 소량의 JS로 만든 페이지예요.

## 파일 구성

| 파일 | 역할 |
| --- | --- |
| `index.html` | 도착 페이지 (섹션 8개) |
| `privacy.html` | 개인정보 처리방침 |
| `assets/styles.css` | 스타일. 색, 반경, 간격, 글자 크기 값은 맨 위 `:root`에만 있어요 |
| `assets/measure.js` | 이벤트 기록 |
| `scripts/check.mjs` | 금지어, 이모지, 색, 선, 반경 검사 (Node 18 이상) |

## 이미지 교체

1. 새 원화를 **같은 파일명**으로 덮어써요. 변환 단계는 없어요.
2. 가로세로 크기가 달라졌으면 `index.html`의 해당 `<img>`의 `width`, `height` 속성을 새 크기로 고쳐요. 레이아웃 밀림을 막는 값이에요.
3. 그림 내용이 바뀌었으면 같은 `<img>`의 `alt`를 고쳐요.
4. 첫 화면 원화(`maero-pipiro.png`)는 `fetchpriority="high"`를 유지하고, 나머지는 `loading="lazy"`를 유지해요.

| 파일 | 현재 크기 | 쓰이는 곳 |
| --- | --- | --- |
| `characters/maero-pipiro.png` | 1460x1060 | 첫 화면, 키링 함께 |
| `characters/maero-basic.png` | 980x1040 | 두 친구, 키링 마에로 |
| `characters/pipiro.png` | 520x520 | 두 친구, 키링 삐삐로 |
| `characters/maero-blue.png` | 400x480 | 물, 키링 파란 마에로 |
| `characters/maero-red.png` | 380x450 | 불, 키링 빨간 마에로 |
| `postcards/arrival.webp`, `water.webp`, `fire.webp`, `farewell.webp` | 각 1536x1024 | 엽서 (가로 3:2) |

- 현재 원화는 알파가 없어서 파랑, 빨강, 잉크 위에서는 흰 원형(키링은 35:40 타원) 안에 넣었어요. 투명 원화로 바꿔도 같은 모양으로 보여요.
- 파랑, 빨강 원화는 크기가 작아서 아주 넓은 화면에서는 확대돼요. 가능하면 더 큰 원본으로 바꿔 주세요.
- 엽서 가장자리가 흰색이면 흰 섹션에서 경계가 약해져요. 반경 16만으로 충분한지 직접 봐요.
- 용량 기준은 장당 200KB 이하, 첫 화면 원화는 150KB 이하를 권장해요.

## 주소 매개변수 규칙

- 영문 소문자와 밑줄만 써요. 한글은 쓰지 않아요.
- 페이지는 주소 매개변수를 지우지 않아요. `fbclid` 같은 플랫폼 값도 그대로 둬요.

| 매개변수 | 값 | 예 |
| --- | --- | --- |
| `utm_source` | `daangn`, `naver`, `instagram` (메타가 페이스북에 노출하면 `facebook`) | `instagram` |
| `utm_medium` | `paid_social` (당근, 메타), `cpc` (네이버 검색), `display` (네이버 배너) | `paid_social` |
| `utm_campaign` | `maero_pipiro_signup_연월` | `maero_pipiro_signup_2611` |
| `utm_content` | 원화_형식_버전 | `blue_img_v1` |
| `utm_term` | 네이버 검색광고 키워드만, 영문 표기 | |
| `lp_v` | 도착 페이지 버전 | `a`, `b` |

예: `https://[도메인]/?utm_source=instagram&utm_medium=paid_social&utm_campaign=maero_pipiro_signup_2611&utm_content=blue_img_v1`

## 측정

- 이벤트는 `window.maeroEvents` 배열에 쌓여요: `page_view`, `stay_3s`, `section_view`, `cta_click`.
- 전송은 `window.MAERO_ENDPOINT`에 문자열이 있을 때만 `navigator.sendBeacon`으로 해요. 쓰려면 `index.html`의 `measure.js` 앞에 아래 줄을 넣어요.

```html
<script>window.MAERO_ENDPOINT = "https://수집-주소";</script>
```

- 분석 도구나 전송 주소를 붙이면 `privacy.html`에도 그 내용을 적어요.
- 설문 제출은 다른 도메인이라 채널별로 구분할 수 없어요. 채널별 제출 수는 `cta_click` 비중으로 나눈 추정치로 읽어요.

## 설문지 설정

- 신청 링크(두 버튼, 같은 탭): `https://docs.google.com/forms/d/e/1FAIpQLSfvb1muERv7p1rQYxbgKd_Ix_nNKpZypfpezjFCmJYlV3FFFA/viewform`
- 문항은 이메일 한 칸과 동의 체크 하나예요.
- 동의 문구에는 개인정보 수집과 이용, 소식 메일 수신, 만 14세 이상이 들어가야 해요.
- 설정에서 **응답 1회로 제한**과 **확인된 이메일 수집**을 꺼 둬요. 로그인 요구 때문에 인앱 브라우저 이탈이 커져요.
- 수집 항목, 목적, 보유 기간(2026년 12월 31일까지)을 바꾸면 `privacy.html`도 같이 고쳐요.

## 확인 항목

1. `node scripts/check.mjs` 실행 후 "통과"인지 확인해요.
2. 폭 320, 360, 768, 1440, 2560, 3840에서 가로 스크롤과 깨진 이미지가 없는지 봐요.
3. 높이 480 화면에서 첫 화면에 신청 버튼 ①이 보이는지 봐요.
4. 당근, 네이버, 인스타그램 인앱 브라우저에서 버튼 → 설문지 열림 → 로그인 요구 없음 → 뒤로 가기를 확인해요.
5. 키보드만으로 건너뛰기 링크, 버튼 ①, 버튼 ②, 문의, 개인정보 처리방침에 순서대로 닿는지 봐요.
6. 운영체제의 움직임 줄이기 설정을 켜고 동작을 확인해요.
7. `window.maeroEvents`에 이벤트가 쌓이는지 개발자 도구 콘솔에서 확인해요.
