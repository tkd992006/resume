# Resume

지원용 포트폴리오를 폴더별로 관리하는 독립 저장소입니다. 루트 `index.html`은 빈 페이지이며, 지원본 목록이나 이동 링크를 표시하지 않습니다.

## GitHub Pages

저장소 Settings → Pages에서 **Deploy from a branch**, **main**, **/(root)**를 선택합니다.

- 루트: https://tkd992006.github.io/resume/
- 토스 스냅샷: https://tkd992006.github.io/resume/toss/

## 지원본 관리

`toss/`는 기존 `portfolio` 저장소의 루트 페이지(커밋 `c521665`)를 복사한 스냅샷입니다. HTML, CSS, JavaScript와 이미지를 같은 폴더 안에 두었으며, Open Graph URL만 새 주소로 변경했습니다.

기존 토스 제출 주소 `https://tkd992006.github.io/portfolio/`와 기존 저장소의 remote 설정은 그대로 유지합니다. 이 저장소의 변경 사항은 기존 `portfolio` 저장소에 반영하지 않습니다.

새 지원본은 별도 폴더에 복사한 뒤 수정합니다. 각 폴더의 이미지와 스타일도 함께 복사하고, 해당 HTML의 `og:url`과 `og:image`를 새 주소에 맞춥니다. 제출 후에는 해당 폴더를 유지하고, 새 버전은 다른 폴더로 추가합니다.
