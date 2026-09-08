# 지원본 변경사항 전체 대조

기준: 기존 toss/index.html 및 toss/script.js. 아래 원문 블록은 공백·줄바꿈·HTML 태그까지 보존하며 생략하지 않습니다. 화면에서 공백이 합쳐져 보이는 경우에도 HTML 원문과 JSON에는 그대로 남습니다.

초안은 로컬에서만 생성했습니다. 기업별 문구 변경과 순서 변경, 자동 파생된 제목·메타데이터, 전체 HTML·JS diff를 포함합니다. 기존 toss/와 빈 루트는 수정하지 않습니다.

## 모두닥

공고: https://modoodoc.career.greetinghr.com/ko/o/202796

### M01 · meta.title

위치: title

이유: 기존에 명시된 프론트엔드·백엔드 담당 범위를 제목에 함께 드러냅니다.

변경 전 원문:

`````html
이상화 · Frontend / Product Engineer
`````

변경 후 원문:

`````html
이상화 · Full-stack / Product Engineer
`````

### M02 · meta.description

위치: meta[name="description"] [content]

이유: 검색 설명에서 창업과 전체 제품 개발 경험을 먼저 보여줍니다.

변경 전 원문:

`````html
프론트엔드·프로덕트 엔지니어 이상화의 포트폴리오. iOS·Android·Web 멀티플랫폼 주문 앱, 결제 흐름, AI 상담 서비스를 설계부터 운영까지 만들었습니다.
`````

변경 후 원문:

`````html
풀스택·프로덕트 엔지니어 이상화의 포트폴리오. B2B 식자재 주문 제품의 개발·영업·운영을 맡고, 고객 요구를 화면·API·데이터 모델로 구체화해 납품했습니다.
`````

### M03 · meta.ogDescription

위치: meta[property="og:description"] [content]

이유: 링크 공유 설명을 본문 소개와 맞춥니다.

변경 전 원문:

`````html
iOS·Android·Web 멀티플랫폼 주문 앱, 결제 흐름, AI 상담 서비스를 설계부터 운영까지 만든 프론트엔드·프로덕트 엔지니어입니다.
`````

변경 후 원문:

`````html
B2B 식자재 주문 제품의 개발·영업·운영을 맡고, 고객 요구를 화면·API·데이터 모델로 구체화해 납품한 풀스택·프로덕트 엔지니어입니다.
`````

### M04 · profile.role

위치: .masthead-meta strong

이유: 기존 경력에 있는 풀스택 개발 범위를 헤더에 반영합니다.

변경 전 원문:

`````html
Frontend / Product Engineer
`````

변경 후 원문:

`````html
Full-stack / Product Engineer
`````

### M05 · profile.intro

위치: .intro-lead

이유: 제품 구현과 사업 현장을 함께 맡았던 기존 경험을 소개의 중심으로 둡니다.

변경 전 원문:

`````html

                      최근에는 <strong>iOS·Android·Web을 한 코드베이스로 다루는 식자재 주문 앱과 실결제 흐름</strong>을
                  설계부터 운영까지 직접 맡아봤습니다. 음식점 식자재 발주, AI 스킨케어 상담,
                  매장 비치용 iPad 웹앱처럼 사용 맥락이 다른 제품을 주로 웹 기반으로 개발하고 납품해왔습니다.
                
`````

변경 후 원문:

`````html

                      최근에는 <strong>B2B 식자재 주문 제품을 2인 팀으로 창업해 개발·점주 영업·운영</strong>까지 직접 맡았습니다.
                      음식점용 앱과 유통업체 웹사이트, API·DB·결제 흐름을 만들고, 점주가 가격을 먼저 확인할 수 있는 캠페인도 구현했습니다.
                      외주에서는 고객의 요구를 화면과 데이터 구조로 구체화해 제품을 개발하고 납품해왔습니다.
                
`````

### M06 · ama.work.title

위치: #ama-answer-work > h3

이유: 같은 사실을 창업 및 운영 경험부터 읽히도록 재배치합니다.

변경 전 원문:

`````html
고객 요구를 화면·API·데이터 모델로 구체화해 납품했습니다. 온더마켓에서는 2인 팀으로 개발뿐 아니라 점주 영업과 운영까지 맡았습니다.
`````

변경 후 원문:

`````html
온더마켓에서는 2인 팀으로 개발·점주 영업·운영을 맡았습니다. 외주에서는 고객 요구를 화면·API·데이터 모델로 구체화해 납품했습니다.
`````

### M07 · ama.work.body

위치: #ama-answer-work > p:not(.project-kicker)

이유: 창업에서 맡은 일과 외주 납품 경험을 구분하되 역할의 연속성을 보여줍니다.

변경 전 원문:

`````html

                                  외주개발에서는 고객이 설명한 요구사항을 화면, API, 데이터 구조로 정리해 납품했고,
                                  창업에서는 문제 발견부터 제품 구현, 영업, 운영까지 직접 부딪혔습니다.
                                  음식점 식자재 발주, AI 스킨케어 상담, 개발외주사 내부 운영 도구 등 다양한 사용 맥락이 있는 제품을 만들었습니다.
                                
`````

변경 후 원문:

`````html

                                  창업에서는 문제 발견부터 제품 구현, 영업, 운영까지 직접 부딪혔습니다.
                                  음식점 식자재 발주 제품을 만들면서 점주 영업을 하고, 주문 흐름과 가격을 보여주는 방식을 고쳤습니다.
                                  외주개발에서는 AI 스킨케어 상담, 개발외주사 내부 운영 도구 등 사용 맥락이 다른 제품의 요구사항을 화면, API, 데이터 구조로 정리해 납품했습니다.
                                
`````

### M08 · ama.work.requirements

위치: #ama-work-followup-2 p

이유: 기존 사례의 요청·판단·제안을 짧고 구체적인 순서로 정리합니다.

변경 전 원문:

`````html
먼저 사용자나 클라이언트의 요구사항을 긴밀히 파악하고, 그 안에서 가장 중요한 지점을 화면과 데이터 구조로 옮겼습니다. Akasys라는 개발사 외주 관리 툴을 맡았을 때에는, 단순한 고객사 CS관리 툴 요청을 내부 티켓, 고객 요구사항, 주간/월간 리포트가 연결되는 운영 도구로 확장 제안하여 좋은 반응을 이끌었습니다. 클라이언트의 실제 깊은 니즈는 고객사와의 관계 관리이지, 매끄러운 CS처리가 전부가 아니라는 것을 파악하여 제안했습니다.
`````

변경 후 원문:

`````html
먼저 고객이 요청한 기능과 그 기능으로 해결하려는 일을 함께 확인했습니다. Akasys에서는 고객사 CS 관리 툴 요청을 받고, 실제 필요가 고객사와의 관계 관리에 있다고 판단했습니다. 그래서 내부 티켓, 고객 요구사항, 주간·월간 리포트가 연결되는 운영 도구로 확장 제안했고 좋은 반응을 얻었습니다.
`````

### M09 · ama.founder.body

위치: #ama-answer-founder > p:not(.project-kicker)

이유: 가입 전환과 실패 원인을 함께 남겨 사업 경험을 과장하지 않고 판단의 교훈을 명확히 합니다.

변경 전 원문:

`````html

                                  음식점 식자재 주문 플랫폼 온더마켓을 운영하면서 점주가 가격을 빨리 알고 싶어한다는 문제는 명확했고, 가격 진단 캠페인으로 일부 가입 전환도 만들었습니다.
                                  다만 B2B 식자재 시장은 신뢰 확보, 공급가 경쟁력, 대면 영업, 공급 운영이 함께 돌아가야 했고, 심지어 시장 구조와 경쟁사를 잘못 파악하여
                                  작은 팀이 감당하기엔 사업 구조가 무겁다는 것을 알게되었습니다.
                                  그래서 제품의 완성도만큼 유통 구조와 영업 비용을 빨리 검증했어야 한다는 걸 배웠습니다.
                                
`````

변경 후 원문:

`````html

                                  온더마켓에서는 점주가 가격을 빨리 알고 싶어한다는 문제를 확인했고, 가격 진단 캠페인으로 일부 가입 전환도 만들었습니다.
                                  하지만 시장 구조와 경쟁사를 잘못 파악했습니다. 더 싼 공급가, 신뢰 확보, 대면 영업, 안정적인 공급 운영이 함께 필요했고,
                                  작은 팀이 제품 개발과 시장 운영을 동시에 감당하기에는 사업 구조가 무거웠습니다.
                                  제품 완성도를 높이기 전에 유통 구조와 영업 비용부터 더 빨리 검증했어야 한다는 걸 배웠습니다.
                                
`````

### M10 · experience.onthemarket.summary

위치: #work-onthemarket > div > p:not(.role)

이유: 개발 범위와 점주 영업·운영 경험을 연결해서 설명합니다.

변경 전 원문:

`````html

                      음식점과 유통업체 사이의 B2B 식자재 발주 제품을 2인 팀에서 만들었습니다.
                      음식점용 크로스 플랫폼 웹앱, 유통업체 웹사이트, 관리자 페이지, 서버, DB 스키마,
                      결제, 푸시, 분석 연동과 운영 개선까지 개발과 운영 전체를 맡았습니다. 전단지와 전화로 음식점 영업도 직접 했습니다.
                    
`````

변경 후 원문:

`````html

                      음식점과 유통업체 사이의 B2B 식자재 발주 제품을 2인 팀으로 창업해 개발과 운영을 맡았습니다.
                      음식점용 크로스 플랫폼 웹앱, 유통업체 웹사이트, 관리자 페이지, 서버·DB 스키마와 결제·푸시·분석 연동을 구현했습니다.
                      전단지와 전화로 음식점 영업을 직접 했고, 점주의 주문 흐름과 가격 확인 시점을 제품에 반영했습니다.
                    
`````

### M11 · experience.tingtingplanet.summary

위치: #work-tingtingplanet > div > p:not(.role)

이유: 상담에서 구현·납품으로 이어지는 담당 범위를 기존 AMA 근거와 맞춥니다.

변경 전 원문:

`````html

                      외주와 자체 서비스를 오가며 AI, 채팅, 내부 운영 도구, 모바일 웹앱 프로젝트를
                      개발 및 납품했습니다. 고객 상담에서 나온 기대 수준과 우선순위를 화면 순서와 기능 범위로 옮기는 일을 주로 했습니다.
                    
`````

변경 후 원문:

`````html

                      외주와 자체 서비스를 오가며 AI, 채팅, 내부 운영 도구, 모바일 웹앱 프로젝트를 개발하고 납품했습니다.
                      고객 상담에서 기대 수준과 우선순위를 확인하고, 화면·API·데이터 구조와 납품할 기능 범위로 구체화했습니다.
                    
`````

### M12 · projects.onthemarket.cardSubtitle

위치: [data-sheet-open="project-onthemarket"] .work-title small

이유: 대표 프로젝트 목록에서 담당 범위가 먼저 읽히도록 합니다. 같은 문구가 상세 부제에도 적용됩니다.

변경 전 원문:

`````html
음식점 점주가 유통업체에 식자재를 발주하는 모바일 중심 제품
`````

변경 후 원문:

`````html
2인 팀으로 개발·영업·운영을 맡은 B2B 식자재 발주 제품
`````

### M13 · projects.onthemarket.subtitle

위치: #project-onthemarket .project-subtitle

이유: 목록과 상세 부제의 표현을 일치시킵니다.

변경 전 원문:

`````html
음식점 점주가 유통업체에 식자재를 발주하는 모바일 중심 제품
`````

변경 후 원문:

`````html
2인 팀으로 개발·영업·운영을 맡은 B2B 식자재 발주 제품
`````

### M14 · projects.onthemarket.summary

위치: #project-onthemarket .sheet-body > p

이유: 제품 개발 범위를 사업 운영·신규 유입 캠페인과 함께 제시합니다. 전환 수치는 새로 만들지 않습니다.

변경 전 원문:

`````html

            상품 탐색, 식자재 추가, 빠른 주문, 주문 확인, 결제로 이어지는 주문 흐름을 구현했습니다.
            점주가 실제로 주문하는 순서에 맞춰 가격을 보여주는 시점과 확인 화면을 여러 번 고쳤습니다.
          
`````

변경 후 원문:

`````html

            음식점용 앱과 유통업체 웹사이트, 관리자 페이지, 서버·DB를 만들고 점주 영업과 운영도 직접 맡았습니다.
            상품 탐색부터 주문 확인·결제까지 구현하면서 가격을 보여주는 시점과 확인 화면을 여러 번 고쳤습니다.
            앱 설치 전에 가격을 비교할 수 있는 영수증 진단 캠페인을 만들었고, 일부 가입 전환으로 이어졌습니다.
          
`````

### M15 · projects.onthemarket.responsibility.client

위치: #project-onthemarket .project-grid > div:first-child li:nth-of-type(1)

이유: 기존 경력 본문에 있는 클라이언트별 담당 범위를 상세 목록에 반영합니다.

변경 전 원문:

`````html
React, Capacitor 기반 iOS / Android / Web 클라이언트 구현
`````

변경 후 원문:

`````html
음식점용 iOS / Android / Web 앱, 유통업체 웹사이트, 관리자 페이지 개발 및 운영
`````

### M16 · projects.onthemarket.responsibility.workflow

위치: #project-onthemarket .project-grid > div:first-child li:nth-of-type(4)

이유: 기존 UI 조정 사항이 어떤 사용 맥락에서 나온 것인지 드러냅니다.

변경 전 원문:

`````html
큰 글씨 설정, 기기별 레이아웃, 가격 표시 시점 조정
`````

변경 후 원문:

`````html
점주의 주문 흐름에 맞춰 가격 표시 시점, 큰 글씨 설정, 기기별 레이아웃 조정
`````

### M17 · projects.akasys.summary

위치: #project-akasys .sheet-body > p

이유: 기존 AMA에만 있던 고객 요구 해석 및 확장 제안 과정을 프로젝트 상세에도 연결합니다.

변경 전 원문:

`````html

            반복해서 확인하는 정보를 빠르게 읽을 수 있도록 프로젝트 클러스터, 티켓 상태, 리포트 화면의 정보 구조를 정리했습니다.
          
`````

변경 후 원문:

`````html

            고객사 CS 관리 툴 요청에서 고객 관계 관리의 필요를 파악해, 내부 티켓·고객 요구사항·주간·월간 리포트가 연결되는 운영 도구로 확장 제안했습니다.
            반복해서 확인하는 정보를 빠르게 읽을 수 있도록 프로젝트 클러스터, 티켓 상태, 리포트 화면의 정보 구조를 정리했습니다.
          
`````

### M18 · meta.og.url · 자동 파생

위치: html > head > meta:nth-of-type(7) [content]

이유: 각 지원본의 주소와 공유 이미지를 해당 폴더로 맞춥니다.

변경 전 원문:

`````html
https://tkd992006.github.io/resume/toss/
`````

변경 후 원문:

`````html
https://tkd992006.github.io/resume/modoodoc/
`````

### M19 · meta.og.image · 자동 파생

위치: html > head > meta:nth-of-type(8) [content]

이유: 각 지원본의 주소와 공유 이미지를 해당 폴더로 맞춥니다.

변경 전 원문:

`````html
https://tkd992006.github.io/resume/toss/assets/images/onthemarket-app-1.webp
`````

변경 후 원문:

`````html
https://tkd992006.github.io/resume/modoodoc/assets/images/onthemarket-app-1.webp
`````

### M20 · order.caseOrder.otm-receipt-case.class · 자동 파생

위치: [data-case-open="otm-receipt-case"] [class]

이유: 순서를 바꾸어도 원래 위치의 카드 크기와 강조 스타일을 유지합니다.

변경 전 원문:

`````html
case-study-trigger is-compact
`````

변경 후 원문:

`````html
case-study-trigger is-wide is-highlighted
`````

### M21 · order.case.otm-receipt-case.label · 자동 파생

위치: [data-case-open="otm-receipt-case"] .case-study-trigger-index

이유: 변경된 사례 순서에 맞춰 표시 번호를 맞춥니다.

변경 전 원문:

`````html
Solved issue 03
`````

변경 후 원문:

`````html
Solved issue 01
`````

### M22 · order.case.otm-ledger-cycle-case.label · 자동 파생

위치: [data-case-open="otm-ledger-cycle-case"] .case-study-trigger-index

이유: 변경된 사례 순서에 맞춰 표시 번호를 맞춥니다.

변경 전 원문:

`````html
Solved issue 04
`````

변경 후 원문:

`````html
Solved issue 03
`````

### M23 · order.caseOrder.otm-payment-webview-case.class · 자동 파생

위치: [data-case-open="otm-payment-webview-case"] [class]

이유: 순서를 바꾸어도 원래 위치의 카드 크기와 강조 스타일을 유지합니다.

변경 전 원문:

`````html
case-study-trigger is-wide is-highlighted
`````

변경 후 원문:

`````html
case-study-trigger is-compact
`````

### M24 · order.case.otm-payment-webview-case.label · 자동 파생

위치: [data-case-open="otm-payment-webview-case"] .case-study-trigger-index

이유: 변경된 사례 순서에 맞춰 표시 번호를 맞춥니다.

변경 전 원문:

`````html
Solved issue 01
`````

변경 후 원문:

`````html
Solved issue 04
`````

### M25 · order.case.otm-receipt-case.modalLabel · 자동 파생

위치: #otm-receipt-case .case-modal-kicker

이유: 사례 본문 번호를 카드 번호와 맞춥니다.

변경 전 원문:

`````html
OnTheMarket · Solved issue 03
`````

변경 후 원문:

`````html
OnTheMarket · Solved issue 01
`````

### M26 · order.case.otm-ledger-cycle-case.modalLabel · 자동 파생

위치: #otm-ledger-cycle-case .case-modal-kicker

이유: 사례 본문 번호를 카드 번호와 맞춥니다.

변경 전 원문:

`````html
OnTheMarket · Solved issue 04
`````

변경 후 원문:

`````html
OnTheMarket · Solved issue 03
`````

### M27 · order.case.otm-payment-webview-case.modalLabel · 자동 파생

위치: #otm-payment-webview-case .case-modal-kicker

이유: 사례 본문 번호를 카드 번호와 맞춥니다.

변경 전 원문:

`````html
OnTheMarket · Solved issue 01
`````

변경 후 원문:

`````html
OnTheMarket · Solved issue 04
`````

### M-O01 · projectOrder · #selected-work .work-list

변경 전:

```
OnTheMarket (project-onthemarket)
→ SYRS AI Lab (project-syrs)
→ Gagageul (project-gagageul)
→ Akasys (project-akasys)
→ Local Jobs (project-local-jobs)
```

변경 후:

```
OnTheMarket (project-onthemarket)
→ Akasys (project-akasys)
→ SYRS AI Lab (project-syrs)
→ Gagageul (project-gagageul)
→ Local Jobs (project-local-jobs)
```

### M-O02 · caseOrder · #project-onthemarket .case-study-list

변경 전:

```
PG 페이지를 다녀온 뒤 WebView 레이아웃 복원 (otm-payment-webview-case)
→ 주문 목록 관계 데이터 경량화 (otm-order-case)
→ 영수증 한 장으로 “온더마켓이었으면 얼마”를 보여주는 캠페인 (otm-receipt-case)
→ 장부·상품 서비스의 순환 의존 해소 (otm-ledger-cycle-case)
→ 타입 서버를 느리게 만든 nullable 인자 타입 폭발 추적 (otm-signal-types-case)
```

변경 후:

```
영수증 한 장으로 “온더마켓이었으면 얼마”를 보여주는 캠페인 (otm-receipt-case)
→ 주문 목록 관계 데이터 경량화 (otm-order-case)
→ 장부·상품 서비스의 순환 의존 해소 (otm-ledger-cycle-case)
→ PG 페이지를 다녀온 뒤 WebView 레이아웃 복원 (otm-payment-webview-case)
→ 타입 서버를 느리게 만든 nullable 인자 타입 폭발 추적 (otm-signal-types-case)
```

### M-O03 · skillOrder · #skills .skills

변경 전:

```
Frontend
→ Multi-platform / Build
→ Product Integration
→ Backend / Data / Ops
```

변경 후:

```
Backend / Data / Ops
→ Frontend
→ Product Integration
→ Multi-platform / Build
```

### M-R01 · 실행 코드 BASE_TITLE

문서 제목과 해시 이동 후 탭 제목을 일치시킵니다.

변경 전:

```
이상화 · Frontend / Product Engineer
```

변경 후:

```
이상화 · Full-stack / Product Engineer
```


## 당근

공고: https://careers.daangn.com/jobs/role/5823087003/

### D01 · meta.title

위치: title

이유: 프론트엔드 중심 직함을 전체 구현 경험에 맞는 소프트웨어 엔지니어로 조정합니다.

변경 전 원문:

`````html
이상화 · Frontend / Product Engineer
`````

변경 후 원문:

`````html
이상화 · Software Engineer
`````

### D02 · profile.role

위치: .masthead-meta strong

이유: 소개 직함을 문서 제목과 일치시킵니다.

변경 전 원문:

`````html
Frontend / Product Engineer
`````

변경 후 원문:

`````html
Software Engineer
`````

### D03 · intro.lead

위치: .intro-lead

이유: API·데이터 모델링·성능 개선·응답 검증을 먼저 소개하며, 기존 멀티플랫폼 구현 경험은 프로젝트에서 보존합니다.

변경 전 원문:

`````html

                      최근에는 <strong>iOS·Android·Web을 한 코드베이스로 다루는 식자재 주문 앱과 실결제 흐름</strong>을
                  설계부터 운영까지 직접 맡아봤습니다. 음식점 식자재 발주, AI 스킨케어 상담,
                  매장 비치용 iPad 웹앱처럼 사용 맥락이 다른 제품을 주로 웹 기반으로 개발하고 납품해왔습니다.
                
`````

변경 후 원문:

`````html

                      최근에는 <strong>식자재 주문 서비스의 API·DB 스키마를 설계하고, 느린 목록 조회와 기능 추가 중 생긴 서비스 의존성 문제</strong>를 해결했습니다. AI 상담 서비스에서는 LLM 응답을 검증해 저장과 화면으로 연결했고, 프론트엔드부터 서버, 운영까지 제품 전체를 다뤄왔습니다.
                
`````

### D04 · profile.stack

위치: #profile .fact:nth-child(2) strong

이유: 원문에 있는 백엔드 스택을 먼저 배치합니다. Node.js는 기존 기술 스택에 기재된 경험입니다.

변경 전 원문:

`````html
React · Next.js · TypeScript · Capacitor · NestJS · GraphQL · MongoDB
`````

변경 후 원문:

`````html
TypeScript · NestJS · GraphQL · MongoDB · Node.js · React · Next.js
`````

### D05 · profile.projects

위치: #profile .fact:nth-child(3) strong

이유: 성능·응답 안정성·알고리즘 문제 해결을 설명하는 기존 프로젝트를 요약합니다.

변경 전 원문:

`````html
식자재 주문 앱 · 화장품 매장 iPad 상담 · 외주·해커톤 8건
`````

변경 후 원문:

`````html
식자재 주문 서비스 · LLM 상담 응답 검증 · 끝말잇기 탐색 엔진 확장
`````

### D06 · ama.work.kicker

위치: #ama-answer-work > .project-kicker

이유: 제품 요구 구체화에서 서비스 구현 전반으로 강조점을 조정합니다.

변경 전 원문:

`````html
Product translation
`````

변경 후 원문:

`````html
Service implementation
`````

### D07 · ama.work.heading

위치: #ama-answer-work > h3

이유: 실제 백엔드 문제 해결 사례를 AMA 첫 답변에서 바로 확인할 수 있게 합니다.

변경 전 원문:

`````html
고객 요구를 화면·API·데이터 모델로 구체화해 납품했습니다. 온더마켓에서는 2인 팀으로 개발뿐 아니라 점주 영업과 운영까지 맡았습니다.
`````

변경 후 원문:

`````html
서비스의 화면·API·데이터 모델을 함께 만들고, 성능과 응답 안정성 문제를 해결했습니다.
`````

### D08 · ama.work.body

위치: #ama-answer-work > p:not(.project-kicker)

이유: 창업·운영 이력을 유지하면서 상세 사례에 근거한 기술적 기여를 연결합니다.

변경 전 원문:

`````html

                                  외주개발에서는 고객이 설명한 요구사항을 화면, API, 데이터 구조로 정리해 납품했고,
                                  창업에서는 문제 발견부터 제품 구현, 영업, 운영까지 직접 부딪혔습니다.
                                  음식점 식자재 발주, AI 스킨케어 상담, 개발외주사 내부 운영 도구 등 다양한 사용 맥락이 있는 제품을 만들었습니다.
                                
`````

변경 후 원문:

`````html

                                  외주개발에서는 고객 요구를 화면, API, 데이터 구조로 구체화해 납품했습니다. 온더마켓에서는 2인 팀으로 식자재 주문 서비스를 만들며 개발부터 점주 영업과 운영까지 맡았습니다. 주문 목록의 관계 데이터 경량화, NestJS 서비스의 순환 의존 해소, AI 상담의 LLM 응답 검증처럼 개발·운영 과정에서 드러난 문제를 코드와 데이터 흐름에서 추적해 해결했습니다.
                                
`````

### D09 · ama.work.scope

위치: #ama-work-followup-3 p

이유: 기존 풀스택 담당 범위를 백엔드에서 사용자 화면 순서로 설명합니다.

변경 전 원문:

`````html
React, Next.js 기반 화면 구현뿐 아니라 API 사용 방식, 상태 흐름, 모바일 레이아웃, 결제와 푸시 연동, 분석 이벤트, NestJS, GraphQL, MongoDB 등 백엔드 프론트엔드 전반을 다뤘습니다.
`````

변경 후 원문:

`````html
NestJS, GraphQL, MongoDB 기반 API와 데이터 모델부터 React, Next.js 화면까지 다뤘습니다. 주문·결제·푸시 연동과 분석 이벤트를 붙였고, 개발·운영 과정에서는 목록 조회의 관계 데이터와 서비스 간 의존 구조를 정리했습니다.
`````

### D10 · experience.onthemarket

위치: #work-onthemarket > div > p:not(.role)

이유: 경력 요약에서 기존 상세 사례의 서버·데이터 기여를 먼저 노출하고 영업 및 프론트엔드 담당 범위를 보존합니다.

변경 전 원문:

`````html

                      음식점과 유통업체 사이의 B2B 식자재 발주 제품을 2인 팀에서 만들었습니다.
                      음식점용 크로스 플랫폼 웹앱, 유통업체 웹사이트, 관리자 페이지, 서버, DB 스키마,
                      결제, 푸시, 분석 연동과 운영 개선까지 개발과 운영 전체를 맡았습니다. 전단지와 전화로 음식점 영업도 직접 했습니다.
                    
`````

변경 후 원문:

`````html

                      음식점과 유통업체 사이의 B2B 식자재 발주 제품을 2인 팀에서 만들었습니다. 서버와 DB 스키마, 상품·거래처·장바구니·주문 API를 설계하고, 주문 목록의 관계 데이터 경량화와 NestJS 서비스의 순환 의존 해소를 진행했습니다. 음식점용 크로스 플랫폼 웹앱, 유통업체 웹사이트, 관리자 페이지와 결제·푸시·분석 연동도 맡았으며, 전단지와 전화로 음식점 영업도 직접 했습니다.
                    
`````

### D11 · experience.tingtingplanet

위치: #work-tingtingplanet > div > p:not(.role)

이유: 기존 외주·자체 서비스 경력을 유지하면서 SYRS의 응답 검증 구현을 연결합니다. Watch Wise의 소속은 단정하지 않습니다.

변경 전 원문:

`````html

                      외주와 자체 서비스를 오가며 AI, 채팅, 내부 운영 도구, 모바일 웹앱 프로젝트를
                      개발 및 납품했습니다. 고객 상담에서 나온 기대 수준과 우선순위를 화면 순서와 기능 범위로 옮기는 일을 주로 했습니다.
                    
`````

변경 후 원문:

`````html

                      외주와 자체 서비스를 오가며 AI 상담, 채팅, 내부 운영 도구, 모바일 웹앱을 개발 및 납품했습니다. 고객 요구를 화면·API·데이터 구조로 정리했고, AI 상담 서비스에서는 LLM 응답의 필수 필드와 타입을 검증해 결과 저장과 화면으로 연결했습니다.
                    
`````

### D12 · selectedWork.lead

위치: #selected-work .block-lead

이유: 대표 프로젝트를 읽을 때 확인할 기술적 기여를 안내합니다.

변경 전 원문:

`````html
항목을 열면 문제 해결 사례, 담당 범위, 기술 스택, 실제 화면을 볼 수 있습니다.
`````

변경 후 원문:

`````html
데이터 모델링, 성능 개선, LLM 응답 검증 사례를 중심으로 담당 범위와 구현 과정을 정리했습니다.
`````

### D13 · projects.onthemarket.summary

위치: #project-onthemarket .sheet-body > p

이유: 주문 서비스 구현과 두 가지 백엔드 문제 해결을 프로젝트 첫 문단에 연결합니다.

변경 전 원문:

`````html

            상품 탐색, 식자재 추가, 빠른 주문, 주문 확인, 결제로 이어지는 주문 흐름을 구현했습니다.
            점주가 실제로 주문하는 순서에 맞춰 가격을 보여주는 시점과 확인 화면을 여러 번 고쳤습니다.
          
`````

변경 후 원문:

`````html

            상품 탐색부터 주문 확인·결제까지 이어지는 서비스의 API와 DB 스키마, 클라이언트를 구현했습니다. 운영 중 느려진 주문 목록은 관계 데이터의 경계를 정리해 개선했고, 견적 요청 기능을 추가하며 생긴 NestJS 서비스의 순환 의존도 해소했습니다.
          
`````

### D14 · projects.onthemarket.responsibilities

위치: #project-onthemarket .project-grid > div:nth-child(1) > ul

이유: 기존 상세 사례에서 확인되는 데이터·서비스 구조 개선을 담당 업무에 추가하고 API 설계를 먼저 배치합니다.

변경 전 원문:

`````html

                <li>React, Capacitor 기반 iOS / Android / Web 클라이언트 구현</li>
                <li>상품, 거래처, 장바구니, 주문 상태를 위한 API와 DB 스키마 설계</li>
                <li>TossPayments, Firebase Push, Google Analytics 연동</li>
                <li>큰 글씨 설정, 기기별 레이아웃, 가격 표시 시점 조정</li>
              
`````

변경 후 원문:

`````html

                <li>상품, 거래처, 장바구니, 주문 상태를 위한 API와 DB 스키마 설계</li>
                <li>GraphQL 목록·중첩 관계 데이터 경량화 및 NestJS 서비스 의존 구조 정리</li>
                <li>React, Capacitor 기반 iOS / Android / Web 클라이언트 구현</li>
                <li>TossPayments, Firebase Push, Google Analytics 연동</li>
              
`````

### D15 · projects.syrs.summary

위치: #project-syrs .sheet-body > p

이유: 원문의 LLM 응답 검증·저장 경계를 화면 소개보다 앞에 설명합니다.

변경 전 원문:

`````html

            피부 현미경 촬영 이미지를 바탕으로 AI 피부 진단 결과, 결과에 맞는 제품 추천, 사용 전후 비교를
            고객이 바로 이해할 수 있는 화면으로 정리했습니다.
          
`````

변경 후 원문:

`````html

            현미경 촬영 이미지로 피부 진단과 제품 추천을 제공하는 매장 상담 웹앱을 만들었습니다. LLM 응답의 필수 필드와 타입을 런타임에 검증하고, 검증을 통과한 결과만 저장해 고객이 보는 화면으로 연결했습니다.
          
`````

### D16 · projects.syrs.responsibilities

위치: #project-syrs .project-grid > div:nth-child(1) > ul

이유: 원문 상세 사례의 검증·재시도 구현을 담당 업무에 포함하고 기존 화면·다국어 업무를 보존합니다.

변경 전 원문:

`````html

                <li>AI 결과 화면과 추천 제품 카드 구현</li>
                <li>사용 전후 비교 흐름 구성</li>
                <li>4개국 locale 시스템 적용</li>
                <li>AI 코멘트가 길어져도 무너지지 않는 화면 밀도 조정</li>
              
`````

변경 후 원문:

`````html

                <li>LLM 응답의 JSON 추출·런타임 타입 검증과 실패 시 재시도(최대 5회 시도)</li>
                <li>AI 결과 화면, 추천 제품 카드와 사용 전후 비교 흐름 구현</li>
                <li>영·한·일·태 4개 언어 locale 시스템 적용</li>
                <li>AI 코멘트가 길어져도 무너지지 않는 화면 밀도 조정</li>
              
`````

### D17 · projects.syrs.learned

위치: #project-syrs .project-grid > div:nth-child(3) > p

이유: 단순한 UI 안정성보다 런타임 검증과 비용·대기시간 사이의 실제 절충을 요약합니다.

변경 전 원문:

`````html

                매장 iPad 한 기종에서만 쓰는 제품이라 반응형 대신 그 화면 하나의 안정성에 시간을 썼습니다.
                10초 안팎의 분석 대기는 스캔 애니메이션과 안내 문구로 채웠습니다.
              
`````

변경 후 원문:

`````html

                LLM 호출이 정상 종료돼도 제품이 사용할 수 있는 응답인지는 별도로 확인해야 했습니다. 응답 검증과 재시도로 포맷을 안정화했고, 늘어나는 대기시간·호출 비용을 고려해 로딩 화면과 오류 복구 동선도 함께 구성했습니다.
              
`````

### D18 · projects.gagageul.summary

위치: #project-gagageul .sheet-body > p

이유: 기존 코드 이해, 조건 구조 설계, 탐색 흐름 확장에 초점을 맞춥니다. 탐색 시간 수치와 그 범위는 원문 그대로 유지합니다.

변경 전 원문:

`````html

            기존 끝말잇기 탐색 서비스를 기반으로 사용자가 탐색 조건과 우선순위를 직접 바꿀 수 있게 확장했습니다.
            기존 코드 구조를 읽고 알고리즘 흐름에 조건 엔진을 연결한 프로젝트입니다.
          
`````

변경 후 원문:

`````html

            기존 끝말잇기 탐색 서비스의 코드와 알고리즘 흐름을 읽고, 사용자가 탐색 조건과 계산 우선순위를 직접 바꿀 수 있도록 확장했습니다. 여러 조건을 동시에 다루는 구조를 추가하고, 조건 엔진과 인터페이스를 기존 탐색에 연결했습니다.
          
`````

### D19 · meta.description

위치: meta[name="description"] [content]

이유: 검색·공유 설명을 당근용 본문의 소프트웨어 엔지니어 및 백엔드 문제 해결 경험과 맞춥니다.

변경 전 원문:

`````html
프론트엔드·프로덕트 엔지니어 이상화의 포트폴리오. iOS·Android·Web 멀티플랫폼 주문 앱, 결제 흐름, AI 상담 서비스를 설계부터 운영까지 만들었습니다.
`````

변경 후 원문:

`````html
소프트웨어 엔지니어 이상화의 포트폴리오. 주문 서비스의 API·DB 설계, 관계 데이터 경량화, 서비스 의존 구조 개선과 LLM 응답 검증 경험을 정리했습니다.
`````

### D20 · meta.ogDescription

위치: meta[property="og:description"] [content]

이유: 검색·공유 설명을 당근용 본문의 소프트웨어 엔지니어 및 백엔드 문제 해결 경험과 맞춥니다.

변경 전 원문:

`````html
iOS·Android·Web 멀티플랫폼 주문 앱, 결제 흐름, AI 상담 서비스를 설계부터 운영까지 만든 프론트엔드·프로덕트 엔지니어입니다.
`````

변경 후 원문:

`````html
주문 서비스의 API·DB를 설계하고 관계 데이터·서비스 의존 구조를 개선했습니다. LLM 응답 검증과 탐색 엔진 확장 경험을 함께 정리했습니다.
`````

### D21 · meta.og.url · 자동 파생

위치: html > head > meta:nth-of-type(7) [content]

이유: 각 지원본의 주소와 공유 이미지를 해당 폴더로 맞춥니다.

변경 전 원문:

`````html
https://tkd992006.github.io/resume/toss/
`````

변경 후 원문:

`````html
https://tkd992006.github.io/resume/daangn/
`````

### D22 · meta.og.image · 자동 파생

위치: html > head > meta:nth-of-type(8) [content]

이유: 각 지원본의 주소와 공유 이미지를 해당 폴더로 맞춥니다.

변경 전 원문:

`````html
https://tkd992006.github.io/resume/toss/assets/images/onthemarket-app-1.webp
`````

변경 후 원문:

`````html
https://tkd992006.github.io/resume/daangn/assets/images/onthemarket-app-1.webp
`````

### D23 · order.caseOrder.otm-order-case.class · 자동 파생

위치: [data-case-open="otm-order-case"] [class]

이유: 순서를 바꾸어도 원래 위치의 카드 크기와 강조 스타일을 유지합니다.

변경 전 원문:

`````html
case-study-trigger is-wide
`````

변경 후 원문:

`````html
case-study-trigger is-wide is-highlighted
`````

### D24 · order.case.otm-order-case.label · 자동 파생

위치: [data-case-open="otm-order-case"] .case-study-trigger-index

이유: 변경된 사례 순서에 맞춰 표시 번호를 맞춥니다.

변경 전 원문:

`````html
Solved issue 02
`````

변경 후 원문:

`````html
Solved issue 01
`````

### D25 · order.caseOrder.otm-ledger-cycle-case.class · 자동 파생

위치: [data-case-open="otm-ledger-cycle-case"] [class]

이유: 순서를 바꾸어도 원래 위치의 카드 크기와 강조 스타일을 유지합니다.

변경 전 원문:

`````html
case-study-trigger is-compact
`````

변경 후 원문:

`````html
case-study-trigger is-wide
`````

### D26 · order.case.otm-ledger-cycle-case.label · 자동 파생

위치: [data-case-open="otm-ledger-cycle-case"] .case-study-trigger-index

이유: 변경된 사례 순서에 맞춰 표시 번호를 맞춥니다.

변경 전 원문:

`````html
Solved issue 04
`````

변경 후 원문:

`````html
Solved issue 02
`````

### D27 · order.caseOrder.otm-signal-types-case.class · 자동 파생

위치: [data-case-open="otm-signal-types-case"] [class]

이유: 순서를 바꾸어도 원래 위치의 카드 크기와 강조 스타일을 유지합니다.

변경 전 원문:

`````html
case-study-trigger is-full
`````

변경 후 원문:

`````html
case-study-trigger is-compact
`````

### D28 · order.case.otm-signal-types-case.label · 자동 파생

위치: [data-case-open="otm-signal-types-case"] .case-study-trigger-index

이유: 변경된 사례 순서에 맞춰 표시 번호를 맞춥니다.

변경 전 원문:

`````html
Solved issue 05
`````

변경 후 원문:

`````html
Solved issue 03
`````

### D29 · order.caseOrder.otm-payment-webview-case.class · 자동 파생

위치: [data-case-open="otm-payment-webview-case"] [class]

이유: 순서를 바꾸어도 원래 위치의 카드 크기와 강조 스타일을 유지합니다.

변경 전 원문:

`````html
case-study-trigger is-wide is-highlighted
`````

변경 후 원문:

`````html
case-study-trigger is-compact
`````

### D30 · order.case.otm-payment-webview-case.label · 자동 파생

위치: [data-case-open="otm-payment-webview-case"] .case-study-trigger-index

이유: 변경된 사례 순서에 맞춰 표시 번호를 맞춥니다.

변경 전 원문:

`````html
Solved issue 01
`````

변경 후 원문:

`````html
Solved issue 04
`````

### D31 · order.caseOrder.otm-receipt-case.class · 자동 파생

위치: [data-case-open="otm-receipt-case"] [class]

이유: 순서를 바꾸어도 원래 위치의 카드 크기와 강조 스타일을 유지합니다.

변경 전 원문:

`````html
case-study-trigger is-compact
`````

변경 후 원문:

`````html
case-study-trigger is-full
`````

### D32 · order.case.otm-receipt-case.label · 자동 파생

위치: [data-case-open="otm-receipt-case"] .case-study-trigger-index

이유: 변경된 사례 순서에 맞춰 표시 번호를 맞춥니다.

변경 전 원문:

`````html
Solved issue 03
`````

변경 후 원문:

`````html
Solved issue 05
`````

### D33 · order.case.otm-order-case.modalLabel · 자동 파생

위치: #otm-order-case .case-modal-kicker

이유: 사례 본문 번호를 카드 번호와 맞춥니다.

변경 전 원문:

`````html
OnTheMarket · Solved issue 02
`````

변경 후 원문:

`````html
OnTheMarket · Solved issue 01
`````

### D34 · order.case.otm-ledger-cycle-case.modalLabel · 자동 파생

위치: #otm-ledger-cycle-case .case-modal-kicker

이유: 사례 본문 번호를 카드 번호와 맞춥니다.

변경 전 원문:

`````html
OnTheMarket · Solved issue 04
`````

변경 후 원문:

`````html
OnTheMarket · Solved issue 02
`````

### D35 · order.case.otm-signal-types-case.modalLabel · 자동 파생

위치: #otm-signal-types-case .case-modal-kicker

이유: 사례 본문 번호를 카드 번호와 맞춥니다.

변경 전 원문:

`````html
OnTheMarket · Solved issue 05
`````

변경 후 원문:

`````html
OnTheMarket · Solved issue 03
`````

### D36 · order.case.otm-payment-webview-case.modalLabel · 자동 파생

위치: #otm-payment-webview-case .case-modal-kicker

이유: 사례 본문 번호를 카드 번호와 맞춥니다.

변경 전 원문:

`````html
OnTheMarket · Solved issue 01
`````

변경 후 원문:

`````html
OnTheMarket · Solved issue 04
`````

### D37 · order.case.otm-receipt-case.modalLabel · 자동 파생

위치: #otm-receipt-case .case-modal-kicker

이유: 사례 본문 번호를 카드 번호와 맞춥니다.

변경 전 원문:

`````html
OnTheMarket · Solved issue 03
`````

변경 후 원문:

`````html
OnTheMarket · Solved issue 05
`````

### D-O01 · projectOrder · #selected-work .work-list

변경 전:

```
OnTheMarket (project-onthemarket)
→ SYRS AI Lab (project-syrs)
→ Gagageul (project-gagageul)
→ Akasys (project-akasys)
→ Local Jobs (project-local-jobs)
```

변경 후:

```
OnTheMarket (project-onthemarket)
→ Gagageul (project-gagageul)
→ SYRS AI Lab (project-syrs)
→ Akasys (project-akasys)
→ Local Jobs (project-local-jobs)
```

### D-O02 · portfolioOrder · #portfolio .folio-grid

변경 전:

```
ChapterTwo (portfolio-chaptertwo)
→ ClackClack Platform (portfolio-clackclack)
→ JoBonger (portfolio-jobonger)
→ Play AI SSO (portfolio-playai)
→ SLOTHS ON THE RUN (portfolio-sloths)
→ Hashmoss (portfolio-hashmoss)
→ Watch Wise (portfolio-watchwise)
→ Mounting (portfolio-mounting)
```

변경 후:

```
Watch Wise (portfolio-watchwise)
→ ChapterTwo (portfolio-chaptertwo)
→ ClackClack Platform (portfolio-clackclack)
→ JoBonger (portfolio-jobonger)
→ Play AI SSO (portfolio-playai)
→ SLOTHS ON THE RUN (portfolio-sloths)
→ Hashmoss (portfolio-hashmoss)
→ Mounting (portfolio-mounting)
```

### D-O03 · caseOrder · #project-onthemarket .case-study-list

변경 전:

```
PG 페이지를 다녀온 뒤 WebView 레이아웃 복원 (otm-payment-webview-case)
→ 주문 목록 관계 데이터 경량화 (otm-order-case)
→ 영수증 한 장으로 “온더마켓이었으면 얼마”를 보여주는 캠페인 (otm-receipt-case)
→ 장부·상품 서비스의 순환 의존 해소 (otm-ledger-cycle-case)
→ 타입 서버를 느리게 만든 nullable 인자 타입 폭발 추적 (otm-signal-types-case)
```

변경 후:

```
주문 목록 관계 데이터 경량화 (otm-order-case)
→ 장부·상품 서비스의 순환 의존 해소 (otm-ledger-cycle-case)
→ 타입 서버를 느리게 만든 nullable 인자 타입 폭발 추적 (otm-signal-types-case)
→ PG 페이지를 다녀온 뒤 WebView 레이아웃 복원 (otm-payment-webview-case)
→ 영수증 한 장으로 “온더마켓이었으면 얼마”를 보여주는 캠페인 (otm-receipt-case)
```

### D-O04 · skillOrder · #skills .skills

변경 전:

```
Frontend
→ Multi-platform / Build
→ Product Integration
→ Backend / Data / Ops
```

변경 후:

```
Backend / Data / Ops
→ Frontend
→ Product Integration
→ Multi-platform / Build
```

### D-R01 · 실행 코드 BASE_TITLE

문서 제목과 해시 이동 후 탭 제목을 일치시킵니다.

변경 전:

```
이상화 · Frontend / Product Engineer
```

변경 후:

```
이상화 · Software Engineer
```

