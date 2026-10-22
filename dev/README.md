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
| `_mapgen8.py` · `_maps8_rows.json` · `_maps8_marks.json` | 전설 성역 2곳(햇귀절벽 `lg_suncliff` · 월은못 `lg_moonpool`)의 타일 배치 생성기와 결과 |
| `_maps8_tpl.js` · `_build_maps8.py` | 전설 성역 이벤트와 1~3장 맵에 거는 전설 장면·의뢰·입구 연결 → `maps8.js` (`_build_maps8.py`가 `_mapgen8.py`를 먼저 실행) |

전설(LGS-001)로 기존 맵에서 바뀐 타일은 생성기에서 고쳤다: 바람등성이 전망 돌판·운반석·받침·절벽 틈(`_mapgen4.py`), 달빛방 운반석·받침(`_build_maps3.py`), 높은물길 입구 울림돌(`_mapgen5.py`). 네 빌드 스크립트를 다시 돌리면 `maps3~8.js`가 바이트 단위로 같게 나온다.

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
| `legend.js` · `mk_legend.py` | 금오·월백 단위 점검 19묶음(새 게임·장면 보기/건너뛰기·회상·의뢰 두 순서·큐브 없이·도망·쓰러뜨림·전멸·포획·방생·저장 코드·이전 소유·도감/수첩/지도·물판/구조·퍼즐 도중 저장 코드·지원 동료). `python3 _tests/mk_legend.py ch3_daram` → `t_legend_daram.json` |
| `legend_trial.js` · `mk_legend_trial.py` | 실제 3장 완료 저장의 파티·가방 그대로 전설 전투 반복(포획 6번·쓰러뜨리기 3번) → 큐브·회복약·턴 기록 |
| `mk_legend_touch.py` | 휴대폰 화면 터치 점검(장면 건너뛰기·선택 버튼·전투 도망·도감·지도), 소리 끔/켬 두 벌 |
| `mk_legend_vis.py` | 전설 장면·성역·전투·도감·수첩·미니 화면 스크린샷 |
| `spell.js` · `mk_spell.py` · `mk_spell_vis.py` | 탐험 기술 비밀 주문 점검(새 게임·3장 완료 저장: 9가지 사용 가능, 강습·의뢰 단계 유지, 장비 중복 없음, 의뢰가 걸린 운반석은 그대로, 저장 코드 왕복, 사탕 주문 회귀)과 화면 캡처. 주문 문구는 저장소에 두지 않으므로 환경 변수 `MOARU_SPELL_SKILLS`·`MOARU_SPELL_CANDY`로 넘긴다 |
| `mk_regress.py` · `run_bg.sh` | 1~3장 회귀 묶음(1장 새 게임·2장·3장 5종·3장 단위 점검) 생성, 두 개씩 실행. 3장 끝 저장은 `_saves/rg3_*.json`으로 따로 남겨 `ch3_*.json`을 덮지 않음 |

2장 완료 저장은 `story2.js` 봇 끝에서 `["dump", "JSON.stringify(G.S)", "_saves/ch2_<스타팅>.json"]` 단계로 만든다.

예: `dev/tests/*`를 최상위 `_tests/`로, `dev/saves/*`를 최상위 `_saves/`로, `play.py`를 최상위로 복사한 뒤 `python3 _tests/mk_story3.py && python3 play.py _tests/t_story3_daram.json`.

전설 점검(`mk_legend*.py`)은 3장 완료 저장(`_saves/ch3_<스타팅>.json`)이 필요하다. 이 저장들은 전설 코드가 들어가기 전에 만든 것이라 “기존 3장 완료 저장” 이행 점검에 그대로 쓴다.

## chars/

`chars.py` → `chars.json` — 사람 캐릭터 도트 원본. `chars.js`는 이 JSON을 `window.CHARDATA = …` 형태로 감싼 것

## sprites/

| 파일 | 내용 |
|---|---|
| `fix_096_legs.py` · `shadow_mask.py` | #096 제방집게 컨셉 시트 보정: 높이 솟은 다리 2개와 집게 뒤 다리 마디를 지우고 바닥 그림자를 걷어 "보행 다리 4개 + 집게 2개"로 맞춤. 도트 변환 전에 실행 |
| `096_before_after.png` | 보정 전 시트 · 보정 후 시트 · 변환된 도트(앞·뒤·아이콘·미니) 비교 |
| `_legend_pix.py` · `_legend_touch.py` | 금오·월백 도트 변환: `docs/planning/legend-stories/assets/`의 최종 정면·뒷면 투명 PNG 4장만 읽어 앞·뒤(각각 변환, 넓은 캔버스, 알파 유지)·아이콘·미니(손으로 찍은 도트)와 피벗·효과 기준점(`G.SPRITE_META`)을 `sprites.js`에 넣는다. 다시 돌리면 `sprites.js`가 바이트 단위로 같다. `--dry`는 미리보기만. numpy·opencv-python·Pillow 필요. 다른 몬스터 도트는 최상위 `sprites.js`에서 그대로 읽어 합친다(예: 저장소 최상위에 복사해 `python3 _legend_pix.py`) |
| `legend_preview.png` | 변환 결과: 금오·월백 앞·뒤(3배), 아이콘·미니(풀밭·흰 바탕) |

#091~102 도트는 `docs/planning/chapter-03/assets/`의 컨셉 시트 2장에서 몬스터마다 따로 오려 앞모습·옆(뒤 시점)·아이콘·미니 크기로 변환해 `sprites.js`에 넣었다. 시트를 통째로 아틀라스로 쓰지 않는다.

## saves/

| 파일 | 내용 |
|---|---|
| `ch2_<스타팅>.json` | 2장 봇이 실제로 2장을 끝까지 진행해 만든 저장. 3장 봇의 시작점 |
| `ch3_<스타팅>.json` | 3장 봇이 3장 끝(선택 의뢰 8개 포함)까지 진행한 뒤의 저장. 전설 코드가 없던 때의 저장이라 전설 점검의 “기존 저장”으로 쓴다 |

게임의 설정 > 저장 코드 불러오기는 JSON이 아니라 base64 코드를 받는다. 게임 콘솔에서 `btoa(unescape(encodeURIComponent(JSON.stringify(<저장 JSON>))))`로 코드를 만들면 불러올 수 있다(테스트용).
