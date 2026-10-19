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

## tests/

| 파일 | 내용 |
|---|---|
| `play.py` | Playwright로 게임을 띄워 스크립트 단계를 실행 (스크린샷·로그) |
| `bot.js` | 자동 플레이 봇 공통부 (대화 넘기기·전투 정책·이동) |
| `story.js` · `story2.js` | 1장 · 2장 전체 진행 봇 |
| `gymtrial.js` | 관장전만 반복해 승률을 재는 도구 |
| `validate.js` | 맵 정적 검사 (워프·연결·막힘·NPC 위치) |

## chars/

`chars.py` → `chars.json` — 사람 캐릭터 도트 원본. `chars.js`는 이 JSON을 `window.CHARDATA = …` 형태로 감싼 것
