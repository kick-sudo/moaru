# dev — 개발용 원본과 도구

게임 실행에는 필요 없습니다. 맵을 고치거나 다시 검증할 때 쓰는 원본입니다.
스크립트들은 게임 파일과 **같은 폴더(저장소 최상위)**에서 실행하도록 만들어져 있어, 쓸 때는 최상위로 복사해서 실행하세요.

## maps/

| 파일 | 내용 |
|---|---|
| `_mapgen3.py` · `_maps3_rows.json` | 1장 후반 맵(달숨동굴~저수로)의 타일 배치 생성기와 결과 |
| `_maps3_tpl.js` · `_build_maps3.py` | 1장 후반 이벤트 템플릿 → `maps3.js` |
| `_mapgen4.py` · `_maps4_rows.json` | 2장 맵 18장의 타일 배치 생성기와 결과 |
| `_maps4_tpl.js` · `_maps5_tpl.js` · `_build_maps45.py` | 2장 이벤트 템플릿 → `maps4.js` · `maps5.js` |
| `_mapgen5.py` · `_maps6_rows.json` | 3장 야외·동굴 맵 17장의 타일 배치 생성기와 결과 |
| `_maps6_tpl.js` · `_maps7_tpl.js` · `_build_maps67.py` | 3장 이벤트 템플릿 → `maps6.js` · `maps7.js` (`_build_maps67.py`가 `_mapgen5.py`를 먼저 실행) |

## tests/

| 파일 | 내용 |
|---|---|
| `play.py` | Playwright로 게임을 띄워 스크립트 단계를 실행 (스크린샷·로그) |
| `bot.js` | 자동 플레이 봇 공통부 (대화 넘기기·전투 정책·이동) |
| `story.js` · `story2.js` · `story3.js` | 1장 · 2장 · 3장 전체 진행 봇 (3장은 실제 2장 완료 저장을 불러와 시작) |
| `units3.js` | 3장 단위 점검: 새 진화·도감, 물판 상태(메뉴·저장 코드·구조·전멸), 퍼즐 저장/초기화/전멸, 구버전 저장 |
| `mk_story3.py` · `mk_units3.py` · `mk_touch3.py` · `mk_trial3.py` | 위 봇들을 `play.py` 스크립트(JSON)로 묶는 생성기. 2장 완료 저장(`_saves/ch2_<스타팅>.json`)이 필요 |
| `gymtrial.js` | 관장전만 반복해 승률을 재는 도구 |
| `validate.js` | 맵 정적 검사 (워프·연결·막힘·NPC 위치·운반석·장별 지도 범위) |

2장 완료 저장은 `story2.js` 봇 끝에서 `["dump", "JSON.stringify(G.S)", "_saves/ch2_<스타팅>.json"]` 단계로 만든다.

예: `dev/tests/*`를 최상위 `_tests/`로, `dev/saves/*`를 최상위 `_saves/`로, `play.py`를 최상위로 복사한 뒤 `python3 _tests/mk_story3.py && python3 play.py _tests/t_story3_daram.json`.

## chars/

`chars.py` → `chars.json` — 사람 캐릭터 도트 원본. `chars.js`는 이 JSON을 `window.CHARDATA = …` 형태로 감싼 것

## sprites/

| 파일 | 내용 |
|---|---|
| `fix_096_legs.py` · `shadow_mask.py` | #096 제방집게 컨셉 시트 보정: 높이 솟은 다리 2개와 집게 뒤 다리 마디를 지우고 바닥 그림자를 걷어 "보행 다리 4개 + 집게 2개"로 맞춤. 도트 변환 전에 실행 |
| `096_before_after.png` | 보정 전 시트 · 보정 후 시트 · 변환된 도트(앞·뒤·아이콘·미니) 비교 |

#091~102 도트는 `docs/planning/chapter-03/assets/`의 컨셉 시트 2장에서 몬스터마다 따로 오려 앞모습·옆(뒤 시점)·아이콘·미니 크기로 변환해 `sprites.js`에 넣었다. 시트를 통째로 아틀라스로 쓰지 않는다.

## saves/

| 파일 | 내용 |
|---|---|
| `ch2_<스타팅>.json` | 2장 봇이 실제로 2장을 끝까지 진행해 만든 저장. 3장 봇의 시작점 |
| `ch3_<스타팅>.json` | 3장 봇이 3장 끝(선택 의뢰 8개 포함)까지 진행한 뒤의 저장 |

게임의 설정 > 저장 코드 불러오기는 JSON이 아니라 base64 코드를 받는다. 게임 콘솔에서 `btoa(unescape(encodeURIComponent(JSON.stringify(<저장 JSON>))))`로 코드를 만들면 불러올 수 있다(테스트용).
