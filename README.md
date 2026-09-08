# Resume

지원용 포트폴리오를 같은 디자인으로 관리하는 정적 사이트입니다. 루트 `index.html`은 빈 페이지이며 지원본 목록이나 이동 링크를 표시하지 않습니다.

## 구조

```text
index.html                    빈 루트 페이지 — 변경하지 않음
toss/                         기존 제출본 스냅샷 — 변경하지 않음
src/template.html             공통 HTML 구조와 필드 자리표시자
src/styles.css                공통 디자인 원본
src/script.js                 공통 동작 원본과 연표/제목 자리표시자
src/assets/                   공통 이미지 원본
src/content/common.json       공통 문구와 연표 데이터
src/content/locators.json     필드 이름 ↔ 원본 요소/속성 위치
src/content/modoodoc.json      모두닥 문구와 표시 순서
src/content/daangn.json         당근 문구와 표시 순서
src/cases/*.html               긴 문제 해결 사례 6개
modoodoc/                     생성된 검토용 정적 페이지
daangn/                       생성된 검토용 정적 페이지
```

`src/content/common.json`의 `fields`에는 소개, AMA, 학력·경력·스킬, 프로젝트 카드와 짧은 프로젝트 설명을 보관합니다. 값은 원래 줄바꿈과 `<strong>` 등 인라인 HTML을 유지한 문자열입니다. 긴 사례의 코드와 도식은 `src/cases/`에 HTML로 보관합니다.

`runtime.CHRONO`, `runtime.CHRONO_TRACKS`, `runtime.BASE_TITLE`은 기존 JavaScript의 연표와 제목 데이터입니다. `runtime-format.json`은 추출 당시 표현과 서식을 기록하여 데이터가 같으면 원본 JavaScript를 바이트 단위로 재현합니다. 지원본의 `BASE_TITLE`은 최종 `meta.title`에서 자동으로 맞춥니다.

## 로컬 빌드와 검토

Node.js 20 이상이 필요합니다. 외부 패키지가 없어 `npm install`은 필요하지 않습니다.

```sh
npm run build
npm run check
npm run verify
npm run review
npm run package:site
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000/modoodoc/`, `http://localhost:8000/daangn/`을 엽니다. 결과물은 실행 시 JSON을 가져오지 않는 완성된 HTML·CSS·JavaScript이며, 각 폴더에 이미지도 복사됩니다.

`npm run check`는 파일을 쓰지 않고 렌더링과 참조를 검사합니다. 빌드는 지원본을 모두 검사한 뒤 `modoodoc/`, `daangn/`만 갱신합니다. 알 수 없는 콘텐츠 필드, 맞지 않는 원문, 빠진 프로젝트·사례·스킬, 중복 ID와 끊긴 내부 참조를 거부합니다. `src/frozen-manifest.json`으로 루트와 `toss/`의 원본 파일도 확인합니다.

`npm run verify`는 생성된 두 페이지의 참조, 원본 CSS·이미지, 표시 번호를 제외한 상세 사례 본문, 기존 `toss/`와 빈 루트의 보존을 검사합니다.

## 변경 보고서와 피드백

`npm run review`는 현재 JSON으로 페이지를 다시 생성하고 다음 보고서를 갱신합니다.

- `reports/index.html`: 변경 전·후 문구, 순서, 메타데이터와 번호 변경을 모두 비교하는 화면. `M01`, `D03`, `D-O01`처럼 번호로 피드백할 수 있습니다.
- `reports/changes.md`, `reports/changes.json`: 공백·줄바꿈·HTML 태그를 보존한 정확한 원문 대조와 수정 이유.
- `reports/modoodoc-vs-toss.patch`, `reports/daangn-vs-toss.patch`: 기존 토스본 대비 생성된 HTML·JS의 모든 변경.
- `reports/implementation.patch`: 공통 템플릿·JSON·빌드 스크립트·문서의 전체 소스 변경.
- `reports/file-manifest.json`: 보고서, Git 메타데이터, `.pages-dist/`를 제외한 모든 파일의 크기·SHA-256 목록.

로컬 서버에서 `/reports/`를 열면 됩니다. 보고서의 화면 문구는 연속 공백을 합쳐 읽기 쉽게 표시하지만, 펼쳐 보는 HTML 원문과 JSON에는 실제 문자열을 생략 없이 유지합니다. 상세 사례의 표시 번호는 순서에 맞게 변경하며 본문·코드·표는 그대로 둡니다.

## 문구 편집

공통 수정은 `common.json`의 필드를 고칩니다. 기업별 수정은 해당 프로필의 `overrides`에 공통 필드 이름과 새 값을 지정할 수 있습니다.

```json
{
  "slug": "modoodoc",
  "overrides": {
    "intro.lead": "<strong>강조할 경험</strong>과 소개 문구"
  }
}
```

검토 가능한 편집 기록은 프로필의 `changes`를 사용합니다.

```json
{
  "key": "intro.lead",
  "selector": ".intro-lead",
  "before": "원문의 정확한 innerHTML — 줄바꿈과 공백 포함",
  "after": "바뀐 innerHTML",
  "reason": "해당 직무와 연결되는 경험을 먼저 설명합니다."
}
```

`selector`는 `locators.json`에 기록된 필드 또는 그 안의 텍스트 요소를 가리켜야 합니다. 메타데이터는 `attribute: "content"`를 추가합니다. `overrides`와 `changes`가 같은 범위를 중복 수정하면 빌드를 중단합니다. 공통 원문이 바뀌어 기존 `before`와 달라졌다면 해당 편집 기록도 다시 검토해야 합니다.

`projectOrder`, `portfolioOrder`, `caseOrder`, `skillOrder`는 각 목록의 모든 ID 또는 제목을 한 번씩 나열합니다. 항목을 숨기거나 제거하지 않습니다. 카드 크기와 강조 스타일은 화면상의 원래 위치에 유지하며, 사례 번호는 카드와 상세 본문에서 함께 다시 매깁니다. 공유 URL과 이미지 URL은 각 지원본 폴더에 맞게 자동 생성됩니다.

회사별 데이터는 `main`에서 함께 관리하고, 작업 브랜치는 수정 중에만 사용합니다. 생성된 HTML을 직접 고치면 다음 빌드에서 덮어쓰므로 원본 데이터와 템플릿을 수정합니다.

## 제출본과 배포

`toss/`는 기존 `portfolio` 저장소 루트(커밋 `c521665`)의 스냅샷입니다. 기존 토스 제출 주소 `https://tkd992006.github.io/portfolio/`와 해당 저장소의 remote 설정은 그대로 유지합니다. 이 빌드는 기존 저장소를 읽거나 쓰지 않습니다.

GitHub Pages는 **Deploy from a branch → codex/pages → /(root)**를 사용합니다. `main`은 공통 템플릿·JSON·검토 보고서를 관리하는 소스 브랜치이고, `codex/pages`는 게시할 정적 파일만 담는 배포 브랜치입니다.

`npm run package:site`는 공통 소스로 페이지를 생성하고 `.pages-dist/`에 빈 루트 `index.html`, `.nojekyll`, `toss/`, `modoodoc/`, `daangn/`의 HTML·CSS·JS·이미지만 모읍니다. `src/`, `reports/`, JSON, README는 배포 산출물에 포함하지 않습니다. `.pages-dist/`는 Git에 추적하지 않습니다.

게시할 때는 `.pages-dist/`의 파일을 배포 브랜치 작업 폴더에 반영하고 `codex/pages`를 push합니다. 이후 GitHub Pages가 해당 브랜치를 자동 게시합니다. 소스 `main`에만 push하면 게시 사이트는 바뀌지 않습니다. 공개 GitHub 레포의 소스 자체는 공개이며, 여기서 제외하는 대상은 Pages 웹사이트의 파일입니다.

- 모두닥: https://tkd992006.github.io/resume/modoodoc/
- 당근: https://tkd992006.github.io/resume/daangn/
- 기존 스냅샷: https://tkd992006.github.io/resume/toss/

CLI에서 설정과 배포 상태를 확인할 수 있습니다.

```sh
gh api repos/tkd992006/resume/pages
gh api repos/tkd992006/resume/pages/builds/latest
gh run list --repo tkd992006/resume
```

제출한 지원본을 보존하려면 이후 빌드 대상에서 제외하고 스냅샷으로 관리합니다. 현재 자동 생성 대상은 `scripts/build.mjs`의 `ACTIVE_PROFILES`에 명시된 두 초안뿐이며, `toss`는 허용하지 않습니다.
