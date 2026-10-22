# 3장 기획 묶음 · 물결이 모이는 곳

**기획 완료 · 시안 구현** / 2026-10-22 / CH3-001 · 구현·검증 기록: [implementation-status.md](implementation-status.md)

해무나루 → 푸른숨시 → 돌바퀴시. 5·6관장, 급류타기·괴력운반, 새 몬스터 #091–102(6계열·12종), 서브 퀘스트 8개를 함께 설계했다.

| 파일 | 내용 |
|---|---|
| [world-plan.md](world-plan.md) | 이야기·마을·던전·관장·기술·지도·재방문 |
| [world-data.json](world-data.json) | 14개 지역 식별자·진행 이벤트 12개·지도 4개·출현표 12개 |
| [monsters-091-102.md](monsters-091-102.md) | 번호별 이름·외형·성격·진화·서식·전투·의뢰 역할 |
| [monsters-091-102.json](monsters-091-102.json) | 타입·능력치·학습표·진화·탐험 적성 초안 |
| [side-quests.md](side-quests.md) / [JSON](side-quests.json) | 선택 의뢰 8개의 조건·동선·보상·세계 변화 |
| [implementation-handoff.md](implementation-handoff.md) | 클로드 제작 범위·연결 지점·통과 기준 |
| [validation.md](validation.md) | 기획 자료의 정적 점검 결과와 검증하지 않은 사항 (구현 전 기획 점검) |
| [implementation-status.md](implementation-status.md) | 구현한 내용 · 실제로 실행한 테스트 결과 · 아직 확인하지 못한 것 (구현 후) |
| [art-prompts.txt](art-prompts.txt) | 이미지 생성 최종 지시문·생성 방식 |
| [assets/monsters-091-096.png](assets/monsters-091-096.png) | 해안 동료 컨셉 시트 |
| [assets/monsters-097-102.png](assets/monsters-097-102.png) | 해초숲·정화 동료 컨셉 시트 |

능력치·관장 팀은 이 초안 그대로 게임에 반영했다. 실제로 돌려 본 전투·진행 결과와 아직 확인하지 못한 것(사람의 플레이 시간 등)은 [implementation-status.md](implementation-status.md)에 있다. 기존 1·2장과 지역 개체 #901–909를 보존하고 추가한다.

다음 후속 기획 대상은 높은물길 이후·폭포·상회 본부·7~8관장·#103 이후다.
