# 이광암님 환갑 모바일 초대장

2026년 11월 7일 토요일, 마키노차야 광교점에서 열리는 환갑 행사 모바일 초대장입니다.

## 기술

- React
- TypeScript
- Vite
- GitHub Actions + GitHub Pages

## 내용 수정

행사 정보와 문구는 `src/config.ts`에서 수정합니다.

사진을 추가할 때는 `public/photos/`에 이미지를 넣고 `src/config.ts`의 `heroPhoto`, `photos` 항목에 경로를 등록하면 됩니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

`main` 브랜치에 push하면 `.github/workflows/pages.yml`이 자동으로 GitHub Pages 배포를 수행합니다.

공개 URL: https://hokite.github.io/invitation/
