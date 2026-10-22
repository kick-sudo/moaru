/* 모아루: 잠든 길의 노래 — data: types, moves, monsters, items, encounters, monster helpers */
'use strict';
(function () {
  const G = window.G || (window.G = {});
  const D = G.data = {};

  // ------------------------------------------------------------ types
  D.TYPES = ['노말', '불', '물', '풀', '전기', '땅', '비행', '벌레', '바위', '격투', '독', '에스퍼', '드래곤', '강철', '고스트'];
  D.TYPE_COL = { '노말': '#b3aa8c', '불': '#ee6a3c', '물': '#4a90e2', '풀': '#5cb85c', '전기': '#f2c230', '땅': '#c9955a', '비행': '#8fb0ee', '벌레': '#9bbf2f', '바위': '#b8a46a', '격투': '#d0563c', '독': '#a456c8', '에스퍼': '#ec6c9a', '드래곤': '#6a5ad8', '강철': '#a8b4c0', '고스트': '#7a68a8', '???': '#8a8a9a' };
  D.TYPE_DARK = { '노말': '#7a7258', '불': '#a8401e', '물': '#2c5ea8', '풀': '#367a36', '전기': '#a8801a', '땅': '#8a5e30', '비행': '#5a72b0', '벌레': '#64801a', '바위': '#7a6a3a', '격투': '#8a2e1e', '독': '#6a2a8a', '에스퍼': '#a8345c', '드래곤': '#3a2e9a', '강철': '#5e6a78', '고스트': '#4a3a78', '???': '#5a5a6a' };
  D.CHART = {
    '불': { '풀': 2, '벌레': 2, '강철': 2, '불': 0.5, '물': 0.5, '땅': 0.5, '바위': 0.5, '드래곤': 0.5 },
    '물': { '불': 2, '땅': 2, '바위': 2, '물': 0.5, '풀': 0.5, '드래곤': 0.5 },
    '풀': { '물': 2, '땅': 2, '바위': 2, '불': 0.5, '풀': 0.5, '비행': 0.5, '벌레': 0.5, '독': 0.5, '드래곤': 0.5, '강철': 0.5 },
    '전기': { '물': 2, '비행': 2, '풀': 0.5, '전기': 0.5, '땅': 0, '드래곤': 0.5 },
    '땅': { '불': 2, '전기': 2, '바위': 2, '독': 2, '강철': 2, '풀': 0.5, '벌레': 0.5, '비행': 0 },
    '비행': { '풀': 2, '벌레': 2, '격투': 2, '전기': 0.5, '바위': 0.5, '강철': 0.5 },
    '벌레': { '풀': 2, '에스퍼': 2, '불': 0.5, '비행': 0.5, '격투': 0.5, '독': 0.5, '강철': 0.5, '고스트': 0.5 },
    '바위': { '불': 2, '비행': 2, '벌레': 2, '땅': 0.5, '격투': 0.5, '강철': 0.5 },
    '격투': { '노말': 2, '바위': 2, '강철': 2, '비행': 0.5, '벌레': 0.5, '독': 0.5, '에스퍼': 0.5, '고스트': 0 },
    '독': { '풀': 2, '독': 0.5, '땅': 0.5, '바위': 0.5, '고스트': 0.5, '강철': 0 },
    '노말': { '바위': 0.5, '강철': 0.5, '고스트': 0 },
    '에스퍼': { '격투': 2, '독': 2, '에스퍼': 0.5, '강철': 0.5 },
    '드래곤': { '드래곤': 2, '강철': 0.5 },
    '강철': { '바위': 2, '불': 0.5, '물': 0.5, '전기': 0.5, '강철': 0.5 },
    '고스트': { '고스트': 2, '에스퍼': 2, '노말': 0 }
  };
  D.eff = (atk, defTypes) => defTypes.reduce((m, t) => m * ((D.CHART[atk] || {})[t] ?? 1), 1);
  D.SPECIAL = new Set(['불', '물', '풀', '전기', '에스퍼', '고스트']);   // 드래곤·강철 hit with the body (physical); mist spirits (고스트) are special
  D.STATUS = {
    psn: { n: '독', short: '독', verb: '독에 걸렸다!' },
    par: { n: '마비', short: '마비', verb: '몸이 저려 마비되었다!' },
    slp: { n: '잠듦', short: '잠', verb: '깊이 잠들었다!' }
  };

  // ------------------------------------------------------------ moves
  // p power, a accuracy (0 = never misses), pp, st stat change, status, sec secondary, pri priority
  D.MOVES = {
    butt: { n: '들이받기', t: '노말', p: 40, a: 100, pp: 35 },
    scratch: { n: '발톱긁기', t: '노말', p: 40, a: 100, pp: 35 },
    quick: { n: '재빠르게치기', t: '노말', p: 40, a: 100, pp: 30, pri: 1 },
    bite: { n: '앙물기', t: '노말', p: 60, a: 100, pp: 25 },
    rush: { n: '돌격', t: '노말', p: 80, a: 85, pp: 15 },
    growl: { n: '으르렁', t: '노말', a: 100, pp: 40, st: { who: 'foe', s: 'atk', d: -1 } },
    tailwag: { n: '꼬리살랑', t: '노말', a: 100, pp: 30, st: { who: 'foe', s: 'def', d: -1 } },
    focus: { n: '기모으기', t: '노말', a: 0, pp: 30, st: { who: 'self', s: 'atk', d: 1 } },
    curl: { n: '몸웅크리기', t: '노말', a: 0, pp: 30, st: { who: 'self', s: 'def', d: 1 } },
    lull: { n: '자장노래', t: '노말', a: 60, pp: 15, status: 'slp' },
    ember: { n: '불티날리기', t: '불', p: 40, a: 100, pp: 25 },
    flamewheel: { n: '불바퀴', t: '불', p: 60, a: 100, pp: 25 },
    blaze: { n: '불기둥', t: '불', p: 85, a: 90, pp: 10 },
    sunfire: { n: '태양불꽃', t: '불', p: 100, a: 90, pp: 5 },
    bubble: { n: '물방울쏘기', t: '물', p: 40, a: 100, pp: 30 },
    aqua: { n: '물줄기', t: '물', p: 60, a: 100, pp: 25 },
    wave: { n: '파도치기', t: '물', p: 85, a: 90, pp: 10 },
    leaf: { n: '잎날리기', t: '풀', p: 40, a: 100, pp: 25 },
    absorb: { n: '기운빨기', t: '풀', p: 30, a: 100, pp: 25, drain: 0.5 },
    vine: { n: '덩굴휘두르기', t: '풀', p: 55, a: 100, pp: 25 },
    leafstorm: { n: '잎폭풍', t: '풀', p: 85, a: 90, pp: 10 },
    sleeppow: { n: '졸음포자', t: '풀', a: 75, pp: 15, status: 'slp' },
    poisonpow: { n: '독포자', t: '풀', a: 75, pp: 30, status: 'psn' },
    zap: { n: '찌릿찌릿', t: '전기', p: 40, a: 100, pp: 30 },
    bolt: { n: '번개침', t: '전기', p: 65, a: 100, pp: 15, sec: { status: 'par', ch: 0.1 } },
    stun: { n: '저릿파동', t: '전기', a: 90, pp: 20, status: 'par' },
    mudslap: { n: '흙뿌리기', t: '땅', p: 20, a: 100, pp: 10, sec: { who: 'foe', s: 'acc', d: -1, ch: 1 } },
    dig: { n: '땅울림', t: '땅', p: 60, a: 100, pp: 20 },
    quake: { n: '대지흔들기', t: '땅', p: 90, a: 100, pp: 10 },
    peck: { n: '부리찌르기', t: '비행', p: 35, a: 100, pp: 35 },
    gust: { n: '돌풍', t: '비행', p: 40, a: 100, pp: 35 },
    wingcut: { n: '깃털베기', t: '비행', p: 60, a: 100, pp: 25 },
    dive: { n: '급강하', t: '비행', p: 80, a: 90, pp: 15 },
    string: { n: '끈끈실', t: '벌레', a: 95, pp: 40, st: { who: 'foe', s: 'spe', d: -1 } },
    bugbite: { n: '벌레물기', t: '벌레', p: 40, a: 100, pp: 30 },
    antenna: { n: '더듬이찌르기', t: '벌레', p: 60, a: 100, pp: 20 },
    glow: { n: '반짝빛', t: '벌레', a: 100, pp: 20, st: { who: 'foe', s: 'acc', d: -1 } },
    hornfire: { n: '불뿔박기', t: '불', p: 75, a: 95, pp: 15 },
    tailslap: { n: '꼬리철썩', t: '물', p: 65, a: 100, pp: 20 },
    crabhammer: { n: '집게망치', t: '물', p: 85, a: 90, pp: 10 },
    pinch: { n: '집게집기', t: '노말', p: 55, a: 100, pp: 30 },
    claw: { n: '앞발할퀴기', t: '노말', p: 70, a: 100, pp: 20 },
    judge: { n: '시비가리기', t: '노말', p: 90, a: 100, pp: 10 },
    rockthrow: { n: '돌던지기', t: '바위', p: 50, a: 90, pp: 15 },
    rockslide: { n: '바위떨구기', t: '바위', p: 75, a: 90, pp: 10 },
    harden: { n: '단단해지기', t: '바위', a: 0, pp: 30, st: { who: 'self', s: 'def', d: 1 } },
    jab: { n: '꿀밤', t: '격투', p: 40, a: 100, pp: 30 },
    smash: { n: '장단치기', t: '격투', p: 75, a: 100, pp: 15 },
    sting: { n: '독침', t: '독', p: 15, a: 100, pp: 35, sec: { status: 'psn', ch: 0.3 } },
    venomjab: { n: '독침찌르기', t: '독', p: 70, a: 100, pp: 20, sec: { status: 'psn', ch: 0.3 } },
    // ---- #025-#059 and chapter 1 additions
    // hits: strikes per use · heal: share of max HP · yawn: drowsy, falls asleep at the end of the next turn
    // escape: leaves a wild battle · splash: does nothing · dream: only hits a sleeping target · ring: heals 1/16 each turn
    dkick: { n: '연속차기', t: '격투', p: 30, a: 100, pp: 30, hits: 2 },
    screech: { n: '날카로운소리', t: '노말', a: 85, pp: 40, st: { who: 'foe', s: 'def', d: -2 } },
    bind: { n: '휘감기', t: '노말', p: 35, a: 90, pp: 20, sec: { who: 'foe', s: 'spe', d: -1, ch: 0.5 } },
    glare: { n: '굳히는눈빛', t: '노말', a: 90, pp: 30, status: 'par' },
    charm: { n: '애교눈빛', t: '노말', a: 100, pp: 20, st: { who: 'foe', s: 'atk', d: -2 } },
    moonlight: { n: '달빛모으기', t: '노말', a: 0, pp: 5, heal: 0.5 },
    bodyslam: { n: '덮쳐누르기', t: '노말', p: 85, a: 100, pp: 15, sec: { status: 'par', ch: 0.3 } },
    swift: { n: '별빛세례', t: '노말', p: 60, a: 0, pp: 20 },
    horn: { n: '뿔치기', t: '노말', p: 65, a: 100, pp: 25 },
    slash: { n: '발톱가르기', t: '노말', p: 70, a: 100, pp: 20 },
    echo: { n: '메아리치기', t: '노말', p: 60, a: 100, pp: 15 },
    hypervoice: { n: '울림소리', t: '노말', p: 90, a: 100, pp: 10 },
    ultrasonic: { n: '높은음파', t: '노말', a: 100, pp: 20, st: { who: 'foe', s: 'acc', d: -1 } },
    yawn: { n: '포근한노래', t: '노말', a: 0, pp: 10, yawn: true },
    splash: { n: '퐁당뛰기', t: '노말', a: 0, pp: 40, splash: true },
    teleport: { n: '꿈길이동', t: '에스퍼', a: 0, pp: 20, escape: true },
    growth: { n: '쑥쑥자라기', t: '풀', a: 0, pp: 40, st: { who: 'self', s: 'spa', d: 1 } },
    stunspore: { n: '저릿포자', t: '풀', a: 75, pp: 30, status: 'par' },
    spore: { n: '꿈포자', t: '풀', a: 100, pp: 15, status: 'slp' },
    megadrain: { n: '큰기운빨기', t: '풀', p: 45, a: 100, pp: 15, drain: 0.5 },
    petal: { n: '꽃잎회오리', t: '풀', p: 90, a: 100, pp: 10 },
    razor: { n: '잎새가르기', t: '풀', p: 60, a: 95, pp: 25 },
    acid: { n: '산성방울', t: '독', p: 40, a: 100, pp: 30, sec: { who: 'foe', s: 'def', d: -1, ch: 0.1 } },
    sludge: { n: '독물튀기기', t: '독', p: 65, a: 100, pp: 20, sec: { status: 'psn', ch: 0.3 } },
    poisongas: { n: '독안개', t: '독', a: 55, pp: 40, status: 'psn' },
    sandattack: { n: '모래흩뿌리기', t: '땅', a: 100, pp: 15, st: { who: 'foe', s: 'acc', d: -1 } },
    mudshot: { n: '진흙탄', t: '땅', p: 55, a: 95, pp: 15, sec: { who: 'foe', s: 'spe', d: -1, ch: 1 } },
    rockguard: { n: '암석수비', t: '바위', a: 0, pp: 20, st: { who: 'self', s: 'def', d: 2 } },
    confusion: { n: '염력파', t: '에스퍼', p: 50, a: 100, pp: 25 },
    psybeam: { n: '환상빛', t: '에스퍼', p: 65, a: 100, pp: 20, sec: { who: 'foe', s: 'acc', d: -1, ch: 0.1 } },
    psychic: { n: '정신파동', t: '에스퍼', p: 90, a: 100, pp: 10, sec: { who: 'foe', s: 'spd', d: -1, ch: 0.1 } },
    kinesis: { n: '마음흔들기', t: '에스퍼', a: 80, pp: 15, st: { who: 'foe', s: 'acc', d: -1 } },
    hypnosis: { n: '잠의손짓', t: '에스퍼', a: 60, pp: 20, status: 'slp' },
    recover: { n: '마음회복', t: '에스퍼', a: 0, pp: 10, heal: 0.5 },
    dreameat: { n: '꿈삼키기', t: '에스퍼', p: 100, a: 100, pp: 15, drain: 0.5, dream: true },
    calm: { n: '고요한생각', t: '에스퍼', a: 0, pp: 20, st: [{ who: 'self', s: 'spa', d: 1 }, { who: 'self', s: 'spd', d: 1 }] },
    agility: { n: '바람걸음', t: '에스퍼', a: 0, pp: 30, st: { who: 'self', s: 'spe', d: 2 } },
    twister: { n: '용회오리', t: '드래곤', p: 40, a: 100, pp: 20 },
    dragonbreath: { n: '용의입김', t: '드래곤', p: 60, a: 100, pp: 20, sec: { status: 'par', ch: 0.3 } },
    thunder: { n: '우레치기', t: '전기', p: 90, a: 100, pp: 15, sec: { status: 'par', ch: 0.1 } },
    pulse: { n: '물결탄', t: '물', p: 60, a: 0, pp: 20 },
    aquaring: { n: '물의고리', t: '물', a: 0, pp: 20, ring: true },
    // ---- #060-#090 lines and chapter 2 support moves
    submission: { n: '버팀던지기', t: '격투', p: 80, a: 80, pp: 20, recoil: 0.25 },
    crosschop: { n: '십자수도', t: '격투', p: 100, a: 80, pp: 5 },
    spark: { n: '스파크', t: '전기', p: 65, a: 100, pp: 20, sec: { status: 'par', ch: 0.3 } },
    ironbash: { n: '쇠박치기', t: '강철', p: 60, a: 100, pp: 25 },
    flashcannon: { n: '자철광선', t: '강철', p: 80, a: 100, pp: 10, sec: { who: 'foe', s: 'spd', d: -1, ch: 0.1 } },
    lick: { n: '안개핥기', t: '고스트', p: 30, a: 100, pp: 30, sec: { status: 'par', ch: 0.3 } },
    nightshade: { n: '밤그림자', t: '고스트', p: 60, a: 100, pp: 15 },
    shadowball: { n: '그림자구슬', t: '고스트', p: 80, a: 100, pp: 15, sec: { who: 'foe', s: 'spd', d: -1, ch: 0.2 } },
    mistveil: { n: '안개장막', t: '고스트', a: 100, pp: 20, st: { who: 'foe', s: 'acc', d: -1 } },
    aircut: { n: '바람베기', t: '비행', p: 75, a: 95, pp: 20 },   // the water line's answer to the 4th (grass) gym: power raised in the balance pass
    chargeguard: { n: '전류막', t: '전기', a: 0, pp: 20, st: { who: 'self', s: 'spd', d: 2 } },
    scentveil: { n: '향기장막', t: '풀', a: 0, pp: 20, st: [{ who: 'self', s: 'def', d: 1 }, { who: 'self', s: 'spd', d: 1 }] },
    refresh: { n: '맑은숨', t: '노말', a: 0, pp: 20, refresh: true },
    struggle: { n: '발버둥', t: '???', p: 50, a: 0, pp: 1, recoil: 0.25 }
  };
  D.STAT_NAME = { atk: '공격', def: '방어', spa: '특수공격', spd: '특수방어', spe: '스피드', acc: '명중률' };

  // ------------------------------------------------------------ monsters
  // b: base stats [hp, atk, def, spa, spd, spe]; cr catch rate; xp base exp; evo; learn [[lv, move]]
  D.MONS = {
    daram: { no: 1, n: '모스코', t: ['풀'], b: [45, 49, 52, 58, 62, 45], cr: 45, xp: 64, evo: { lv: 16, to: 'daramsup' }, hab: '이슬마을 연구소 (첫 동료)',
      learn: [[1, 'butt'], [1, 'growl'], [5, 'leaf'], [9, 'absorb'], [13, 'vine'], [16, 'sleeppow'], [20, 'rush'], [25, 'leafstorm']],
      dex: '잎사귀 앞머리를 가진 아기 맥 몬스터. 순하고 호기심이 많아서 처음 보는 것은 코로 킁킁 냄새부터 맡는다.' },
    daramsup: { no: 2, n: '잎맥', t: ['풀'], b: [62, 64, 70, 76, 80, 58], cr: 45, xp: 142, evo: { lv: 32, to: 'sumaek' },
      learn: [[1, 'butt'], [1, 'growl'], [5, 'leaf'], [9, 'absorb'], [13, 'vine'], [16, 'sleeppow'], [20, 'rush'], [25, 'leafstorm']],
      dex: '온몸이 잎사귀 갈기로 덮였다. 지나간 자리마다 새싹이 돋아 숲길이 생긴다고 한다.' },
    sumaek: { no: 3, n: '숲맥', t: ['풀', '땅'], b: [90, 92, 100, 86, 98, 62], cr: 45, xp: 236,
      learn: [[1, 'butt'], [1, 'growl'], [5, 'leaf'], [9, 'absorb'], [13, 'vine'], [16, 'sleeppow'], [20, 'rush'], [25, 'leafstorm'], [32, 'quake']],
      dex: '등에 오래된 나무를 기르는 거대한 맥. 숲이 다치면 천천히 걸어와 땅을 고르고 새 나무를 심는다.' },
    bulguri: { no: 4, n: '탄뿔', t: ['불'], b: [42, 58, 43, 58, 48, 64], cr: 45, xp: 64, evo: { lv: 16, to: 'hwaguri' }, hab: '이슬마을 연구소 (첫 동료)',
      learn: [[1, 'butt'], [1, 'growl'], [5, 'ember'], [8, 'focus'], [10, 'dkick'], [13, 'flamewheel'], [17, 'hornfire'], [22, 'blaze'], [28, 'rush']],
      dex: '숯빛 털과 불씨 뿔을 가진 아기 산양. 자신만만한 장난꾸러기라 일부러 바위 끝에서 아슬아슬하게 뛰논다.' },
    hwaguri: { no: 5, n: '불뿔', t: ['불'], b: [60, 80, 58, 76, 62, 82], cr: 45, xp: 142, evo: { lv: 36, to: 'hwasan' },
      learn: [[1, 'butt'], [1, 'growl'], [5, 'ember'], [8, 'focus'], [10, 'dkick'], [13, 'flamewheel'], [17, 'hornfire'], [22, 'blaze'], [28, 'rush']],
      dex: '뿔에 용암 같은 금이 갔다. 뿔이 달아오르면 앞만 보고 돌진해서 커다란 바위도 두 동강 낸다.' },
    hwasan: { no: 6, n: '화산양', t: ['불', '바위'], b: [80, 108, 84, 92, 76, 90], cr: 45, xp: 236,
      learn: [[1, 'butt'], [1, 'growl'], [5, 'ember'], [8, 'focus'], [10, 'dkick'], [13, 'flamewheel'], [17, 'hornfire'], [22, 'blaze'], [28, 'rush'], [32, 'rockslide'], [38, 'sunfire']],
      dex: '화산 꼭대기에 산다는 커다란 산양. 둥글게 말린 뿔 속에 용암이 흐르고, 수염은 꺼지지 않는 불꽃이다.' },
    muldal: { no: 7, n: '방울뚱', t: ['물'], b: [52, 54, 50, 52, 54, 48], cr: 45, xp: 64, evo: { lv: 16, to: 'padodal' }, hab: '이슬마을 연구소 (첫 동료)',
      learn: [[1, 'butt'], [1, 'growl'], [5, 'bubble'], [8, 'mudslap'], [12, 'aqua'], [17, 'tailslap'], [20, 'mudshot'], [22, 'bite'], [27, 'wave'], [28, 'aircut']],
      dex: '이마에 물방울을 얹고 다니는 짱뚱어 몬스터. 늘 살짝 뚱한 얼굴이지만 갯벌에서 뛰노는 걸 제일 좋아한다.' },
    padodal: { no: 8, n: '물결뚱', t: ['물'], b: [72, 72, 68, 68, 70, 60], cr: 45, xp: 142, evo: { lv: 36, to: 'neoul' },
      learn: [[1, 'butt'], [1, 'growl'], [5, 'bubble'], [8, 'mudslap'], [12, 'aqua'], [17, 'tailslap'], [20, 'mudshot'], [22, 'bite'], [27, 'wave'], [28, 'aircut']],
      dex: '등지느러미가 물결처럼 자랐다. 꼬리로 물살을 탁 치면 작은 파도가 일어난다.' },
    neoul: { no: 9, n: '너울뚱', t: ['물', '땅'], b: [100, 104, 92, 84, 90, 58], cr: 45, xp: 236,
      learn: [[1, 'butt'], [1, 'growl'], [5, 'bubble'], [8, 'mudslap'], [12, 'aqua'], [17, 'tailslap'], [20, 'mudshot'], [22, 'bite'], [27, 'wave'], [28, 'aircut'], [36, 'quake']],
      dex: '거대한 꼬리지느러미로 바다의 너울을 다스린다. 썰물이 되면 갯벌 한가운데서 느긋하게 낮잠을 잔다.' },
    // ---- designer's dex #010-#024 (dex_design_v1) ----
    jjaek: { no: 10, n: '살랑새', t: ['노말', '비행'], b: [40, 45, 40, 35, 35, 56], cr: 255, xp: 50, evo: { lv: 18, to: 'solgae' }, hab: '햇살들판',
      learn: [[1, 'peck'], [1, 'growl'], [5, 'gust'], [9, 'quick'], [14, 'wingcut'], [20, 'focus'], [26, 'dive'], [34, 'rush']],
      dex: '아침마다 밭 울타리에 앉아 서툰 노래를 연습한다. 날갯짓이 미숙해서 놀라면 날아오르기 전에 두 번 깡충 뛴다.' },
    solgae: { no: 11, n: '바람깃', t: ['노말', '비행'], b: [63, 60, 55, 50, 50, 71], cr: 120, xp: 113, evo: { lv: 36, to: 'neoulik' },
      learn: [[1, 'peck'], [1, 'growl'], [5, 'gust'], [9, 'quick'], [14, 'wingcut'], [20, 'focus'], [26, 'dive'], [34, 'rush']],
      dex: '머리 깃털로 바람 방향을 읽고 긴 꼬리로 균형을 잡는다. 아직 날지 못하는 살랑새 앞에서 낮게 날며 연습을 도와준다.' },
    neoulik: { no: 12, n: '너울익', t: ['노말', '비행'], b: [83, 80, 75, 70, 70, 101], cr: 45, xp: 172,
      learn: [[1, 'peck'], [1, 'growl'], [5, 'gust'], [9, 'quick'], [14, 'wingcut'], [20, 'focus'], [26, 'dive'], [34, 'rush']],
      dex: '상승기류를 타면 오랫동안 날갯짓 없이 활공한다. 폭풍이 오기 전 들판을 낮게 선회해 작은 몬스터들에게 피할 때를 알려 준다.' },
    jwi: { no: 13, n: '볼도리', t: ['노말'], b: [30, 56, 35, 25, 35, 72], cr: 255, xp: 51, evo: { lv: 20, to: 'dotoreu' }, hab: '햇살들판',
      learn: [[1, 'butt'], [1, 'tailwag'], [4, 'quick'], [8, 'bite'], [13, 'focus'], [18, 'dig'], [24, 'rush']],
      dex: '볼주머니에 씨앗을 한 알씩 모아 숨긴다. 숨긴 곳을 자주 잊어버려서 볼도리가 사는 길에는 뜻밖의 새싹이 많이 돋는다.' },
    dotoreu: { no: 14, n: '도토르', t: ['노말'], b: [55, 81, 60, 50, 70, 97], cr: 90, xp: 116,
      learn: [[1, 'butt'], [1, 'tailwag'], [4, 'quick'], [8, 'bite'], [13, 'focus'], [18, 'dig'], [24, 'rush']],
      dex: '땅속에 저장방을 여러 개 만들고 꼬리로 흙을 쓸어 입구를 감춘다. 따라다니는 볼도리에게 겨울을 날 씨앗을 나눠 준다.' },
    kongju: { no: 15, n: '콩주먹', t: ['격투'], b: [40, 80, 35, 35, 45, 70], cr: 190, xp: 61, evo: { lv: 28, to: 'dudeumong' }, hab: '서쪽 돌담길',
      learn: [[1, 'scratch'], [1, 'growl'], [1, 'jab'], [9, 'focus'], [13, 'quick'], [17, 'smash'], [22, 'bite'], [28, 'dig'], [34, 'quake']],
      dex: '돌과 나무뿌리를 두드리며 무리의 인사 리듬을 배운다. 결투를 신청하듯 다가오지만 사실은 함께 장단을 맞추자는 뜻이다.' },
    dudeumong: { no: 16, n: '두드몽', t: ['격투'], b: [65, 105, 60, 60, 70, 95], cr: 75, xp: 159,
      learn: [[1, 'scratch'], [1, 'growl'], [5, 'jab'], [9, 'focus'], [13, 'quick'], [17, 'smash'], [22, 'bite'], [28, 'dig'], [34, 'quake']],
      dex: '땅을 두드린 진동으로 멀리 있는 무리에게 신호를 보낸다. 어린 콩주먹이 길을 잃으면 같은 리듬을 되풀이해 돌아올 길을 알려 준다.' },
    jjoreu: { no: 17, n: '쪼르딱', t: ['노말', '비행'], b: [40, 60, 30, 31, 31, 70], cr: 255, xp: 52, evo: { lv: 20, to: 'gasibuli' }, hab: '서쪽 돌담길',
      learn: [[1, 'peck'], [1, 'growl'], [5, 'focus'], [9, 'quick'], [14, 'wingcut'], [19, 'bite'], [25, 'dive'], [31, 'rush']],
      dex: '자기보다 큰 상대에게도 먼저 큰 소리를 낸다. 소리에 놀라지 않는 상대를 만나면 가시덤불 뒤로 숨고 부리만 내민다.' },
    gasibuli: { no: 18, n: '가시부리', t: ['노말', '비행'], b: [65, 90, 65, 61, 61, 100], cr: 90, xp: 155,
      learn: [[1, 'peck'], [1, 'growl'], [5, 'focus'], [9, 'quick'], [14, 'wingcut'], [19, 'bite'], [25, 'dive'], [31, 'rush']],
      dex: '덤불 사이의 좁은 틈을 빠르게 지나며 먹이를 찾는다. 짧은 꼬리로 급회전해 둥지에 다가온 침입자의 앞길을 정확히 가로막는다.' },
    kkomul: { no: 19, n: '이슬콩', t: ['벌레'], b: [45, 30, 35, 20, 20, 45], cr: 255, xp: 39, evo: { lv: 7, to: 'gochi' }, hab: '잎그늘길·이슬숲',
      learn: [[1, 'butt'], [1, 'string']],
      dex: '해가 뜨기 전 잎 끝의 이슬을 마시고 잎 뒷면에서 잠든다. 놀라면 몸을 동그랗게 말아 작은 씨앗처럼 보이려 한다.' },
    gochi: { no: 20, n: '잎잠이', t: ['벌레'], b: [50, 20, 55, 25, 25, 30], cr: 120, xp: 72, evo: { lv: 10, to: 'napul' },
      learn: [[1, 'butt'], [1, 'string'], [7, 'curl']],
      dex: '잎맥을 닮은 고치 안에서 날개를 만든다. 아침 햇볕이 닿으면 몸을 조금씩 돌려 같은 자리만 뜨거워지지 않게 한다.' },
    napul: { no: 21, n: '새벽나비', t: ['벌레', '비행'], b: [60, 45, 50, 90, 80, 70], cr: 45, xp: 160,
      learn: [[1, 'gust'], [10, 'gust'], [11, 'sleeppow'], [13, 'bugbite'], [15, 'poisonpow'], [18, 'glow'], [21, 'antenna'], [25, 'wingcut']],
      dex: '새벽에만 날개를 활짝 펴서 말린다. 날개의 투명한 무늬가 아침 햇살에 반짝이면 숲의 작은 몬스터들이 잠에서 깬다.' },
    ttakkom: { no: 22, n: '따꼼이', t: ['벌레', '독'], b: [40, 35, 30, 20, 20, 50], cr: 255, xp: 39, evo: { lv: 7, to: 'gasijam' }, hab: '잎그늘길·이슬숲',
      learn: [[1, 'sting'], [1, 'string']],
      dex: '겁이 많아서 낯선 발소리가 들리면 가시부터 세운다. 독은 자신을 지키는 데만 쓰고, 친해진 상대 곁에서는 등을 낮추고 다가온다.' },
    gasijam: { no: 23, n: '가시잠', t: ['벌레', '독'], b: [45, 25, 50, 25, 25, 35], cr: 120, xp: 72, evo: { lv: 10, to: 'chimkkori' },
      learn: [[1, 'sting'], [1, 'string'], [7, 'harden']],
      dex: '단단한 고치 조각을 맞물려 몸을 지킨다. 겉은 잠잠하지만 가까운 발소리에는 눈을 움직여 반응한다.' },
    chimkkori: { no: 24, n: '침꼬리', t: ['벌레', '독'], b: [65, 90, 40, 45, 80, 75], cr: 45, xp: 159,
      learn: [[1, 'sting'], [10, 'quick'], [11, 'focus'], [14, 'venomjab'], [18, 'antenna'], [22, 'bite'], [27, 'rush']],
      dex: '덤불 위를 순찰하며 어린 따꼼이를 지킨다. 위험하면 꼬리부터 들어 경고하고, 침입자가 물러나면 더 쫓지 않는다.' },
    // ---- designer's dex #025-#059 (regional design v1) ----
    jjirikong: { no: 25, n: '찌리콩', t: ['전기'], b: [35, 55, 30, 50, 40, 90], cr: 190, xp: 82, evo: { item: 'chargestone', to: 'urekko' }, hab: '잎그늘길·이슬숲 (드묾)',
      learn: [[1, 'zap'], [1, 'growl'], [6, 'tailwag'], [9, 'stun'], [12, 'quick'], [16, 'bolt'], [21, 'agility'], [27, 'swift'], [33, 'thunder']],
      dex: '큰 귀 안쪽의 주름에 정전기를 모은다. 들뜨면 꼬리가 저절로 풀리며 풀잎 끝에 작은 불꽃을 튀긴다.' },
    urekko: { no: 26, n: '우레꼬', t: ['전기'], b: [60, 90, 55, 90, 80, 100], cr: 75, xp: 122,
      learn: [[1, 'zap'], [1, 'tailwag'], [1, 'quick'], [1, 'bolt'], [21, 'agility'], [27, 'swift'], [33, 'thunder'], [40, 'rush']],
      dex: '꼬리를 감았다 펴며 저장한 전기를 나눈다. 천둥이 치기 직전 귀를 활짝 펼쳐 무리에게 피하라는 신호를 보낸다.' },
    gasito: { no: 27, n: '가시토', t: ['독'], b: [55, 47, 52, 40, 40, 41], cr: 235, xp: 59, evo: { lv: 16, to: 'deombulto' }, hab: '노래초원',
      learn: [[1, 'growl'], [1, 'scratch'], [8, 'tailwag'], [12, 'sting'], [17, 'curl'], [21, 'bite'], [25, 'poisongas'], [30, 'venomjab']],
      dex: '긴 귀로 땅속의 발소리를 듣는다. 겁이 나면 등가시를 세우지만, 어린 동료가 다가오면 가시를 눕혀 길을 내준다.' },
    deombulto: { no: 28, n: '덤불토', t: ['독'], b: [70, 62, 67, 55, 55, 56], cr: 120, xp: 117, evo: { item: 'moonstone', to: 'gasiboru' },
      learn: [[1, 'growl'], [1, 'scratch'], [8, 'tailwag'], [12, 'sting'], [18, 'curl'], [23, 'bite'], [28, 'poisongas'], [34, 'venomjab'], [40, 'rush']],
      dex: '굴 입구를 넓히고 어린 가시토가 쉴 공간을 만든다. 어깨 비늘을 맞대어 상대의 돌진을 받아낸다.' },
    gasiboru: { no: 29, n: '가시보루', t: ['독', '땅'], b: [90, 82, 87, 75, 85, 76], cr: 45, xp: 194,
      learn: [[1, 'scratch'], [1, 'tailwag'], [1, 'sting'], [1, 'curl'], [22, 'bodyslam'], [28, 'dig'], [34, 'venomjab'], [40, 'quake']],
      dex: '몸을 낮추면 겹비늘이 맞물려 작은 보루 같은 방패가 된다. 위험이 지나갈 때까지 어린 몬스터들을 몸 뒤에 모아 지킨다.' },
    ppultori: { no: 30, n: '뿔토리', t: ['독'], b: [46, 57, 40, 40, 40, 50], cr: 235, xp: 60, evo: { lv: 16, to: 'ppuldajim' }, hab: '노래초원 바위 가장자리',
      learn: [[1, 'tailwag'], [1, 'butt'], [8, 'focus'], [12, 'sting'], [17, 'horn'], [21, 'dkick'], [26, 'poisongas'], [32, 'venomjab']],
      dex: '무엇이든 이마로 톡 건드려 확인한다. 아직 뿔이 무뎌서 단단한 돌을 건드리면 스스로 깜짝 놀란다.' },
    ppuldajim: { no: 31, n: '뿔다짐', t: ['독'], b: [61, 72, 57, 55, 55, 65], cr: 120, xp: 118, evo: { item: 'moonstone', to: 'sanppul' },
      learn: [[1, 'tailwag'], [1, 'butt'], [8, 'focus'], [12, 'sting'], [18, 'horn'], [23, 'dkick'], [28, 'poisongas'], [34, 'venomjab'], [40, 'rush']],
      dex: '돌에 뿔을 문질러 표면을 단단하게 다진다. 덤불을 밀어내는 일을 좋아해서 무리의 앞길을 연다.' },
    sanppul: { no: 32, n: '산뿔왕', t: ['독', '땅'], b: [81, 92, 77, 85, 75, 85], cr: 45, xp: 195,
      learn: [[1, 'butt'], [1, 'horn'], [1, 'sting'], [1, 'dkick'], [22, 'rush'], [28, 'dig'], [34, 'venomjab'], [40, 'quake']],
      dex: '두꺼운 뿔과 어깨로 무너진 굴의 흙을 밀어낸다. 힘이 세지만 가족이 가까이 있을 때는 뿔을 낮추고 천천히 걷는다.' },
    ttoari: { no: 33, n: '또아리', t: ['독'], b: [35, 60, 44, 40, 54, 55], cr: 255, xp: 62, evo: { lv: 22, to: 'dokbineul' }, hab: '모래바람길 마른 풀숲',
      learn: [[1, 'bind'], [1, 'tailwag'], [8, 'sting'], [13, 'bite'], [20, 'glare'], [25, 'screech'], [32, 'sludge'], [38, 'venomjab']],
      dex: '낮에는 몸을 동그랗게 말아 온기를 지킨다. 낯선 발소리가 들리면 꼬리 끝부터 풀어 달아날 준비를 한다.' },
    dokbineul: { no: 34, n: '독비늘', t: ['독'], b: [60, 85, 69, 65, 79, 80], cr: 90, xp: 147,
      learn: [[1, 'bind'], [1, 'tailwag'], [1, 'sting'], [1, 'bite'], [20, 'glare'], [28, 'screech'], [36, 'sludge'], [44, 'venomjab']],
      dex: '목비늘을 펼쳐 실제보다 크게 보이게 만든다. 비늘 끝에는 독성 가루가 묻어 있어, 스치기만 해도 상대가 쉽게 접근하지 못한다.' },
    moraekong: { no: 35, n: '모래콩', t: ['땅'], b: [50, 75, 85, 20, 30, 40], cr: 255, xp: 93, evo: { lv: 22, to: 'sagureu' }, hab: '모래바람길 모래턱 (첫 관장전에서 먼저 목격)',
      learn: [[1, 'scratch'], [1, 'curl'], [6, 'sandattack'], [11, 'mudslap'], [17, 'dig'], [23, 'slash'], [30, 'swift'], [37, 'mudshot'], [45, 'quake']],
      dex: '앞발로 모래를 긁어 낮잠 잘 구덩이를 만든다. 졸릴 때는 꼬리로 입구를 가볍게 덮는다.' },
    sagureu: { no: 36, n: '사구르', t: ['땅'], b: [75, 100, 110, 45, 55, 65], cr: 90, xp: 163,
      learn: [[1, 'scratch'], [1, 'curl'], [1, 'sandattack'], [1, 'mudslap'], [17, 'dig'], [24, 'slash'], [33, 'swift'], [42, 'mudshot'], [52, 'quake']],
      dex: '등판 사이로 모래를 흘려보내며 굴을 판다. 한 번 지나간 자리에 바람을 피할 작은 모래언덕이 생긴다.' },
    gwibami: { no: 37, n: '귀밤이', t: ['독', '비행'], b: [40, 45, 35, 30, 40, 55], cr: 255, xp: 54, evo: { lv: 22, to: 'mearung' }, hab: '달숨동굴 천장과 어두운 통로',
      learn: [[1, 'ultrasonic'], [1, 'gust'], [6, 'sting'], [11, 'echo'], [17, 'wingcut'], [23, 'screech'], [29, 'sludge'], [35, 'swift'], [41, 'dive']],
      dex: '날개를 이불처럼 접고 동굴 틈에서 잔다. 물방울 소리만으로도 벽까지의 거리를 가늠한다.' },
    mearung: { no: 38, n: '메아룽', t: ['독', '비행'], b: [75, 80, 70, 65, 75, 90], cr: 90, xp: 171,
      learn: [[1, 'ultrasonic'], [1, 'gust'], [1, 'sting'], [1, 'echo'], [17, 'wingcut'], [25, 'screech'], [32, 'sludge'], [39, 'swift'], [46, 'dive']],
      dex: '귀 주름의 각도를 바꿔 여러 방향의 메아리를 나눠 듣는다. 동료가 길을 잃으면 낮은 소리를 반복해 출구로 이끈다.' },
    jagalkong: { no: 39, n: '자갈콩', t: ['바위', '땅'], b: [40, 80, 100, 30, 30, 20], cr: 255, xp: 86, evo: { lv: 25, to: 'doldureum' }, hab: '달숨동굴 자갈밭 (첫 관장전에서 먼저 목격)',
      learn: [[1, 'butt'], [1, 'curl'], [6, 'mudslap'], [11, 'rockthrow'], [16, 'harden'], [21, 'dig'], [26, 'rockslide'], [31, 'rush'], [36, 'quake']],
      dex: '마음에 드는 돌을 등에 얹고 다닌다. 등에 얹은 돌이 몸과 붙으면 조금씩 무거워진다.' },
    doldureum: { no: 40, n: '돌두름', t: ['바위', '땅'], b: [55, 95, 115, 45, 45, 35], cr: 120, xp: 134, evo: { lv: 36, res: true, to: 'sandeung' },
      learn: [[1, 'butt'], [1, 'curl'], [1, 'mudslap'], [1, 'rockthrow'], [16, 'harden'], [22, 'dig'], [29, 'rockslide'], [36, 'rush'], [43, 'quake']],
      dex: '몸을 낮추고 자갈을 밀며 단단한 바위를 고른다. 오래 함께한 바위일수록 몸의 일부처럼 정교하게 움직인다.' },
    sandeung: { no: 41, n: '산등돌', t: ['바위', '땅'], b: [80, 110, 130, 55, 65, 45], cr: 45, xp: 177,
      learn: [[1, 'butt'], [1, 'curl'], [1, 'mudslap'], [1, 'rockthrow'], [16, 'harden'], [22, 'dig'], [29, 'rockslide'], [36, 'rush'], [43, 'quake']],
      dex: '오래 산 개체의 등판에는 동굴이 변해온 흔적이 층으로 남는다. 통로가 무너지면 넓은 등으로 바위를 받쳐 동료가 빠져나가게 한다.' },
    dalmojji: { no: 42, n: '달모찌', t: ['노말'], b: [70, 45, 48, 60, 65, 35], cr: 150, xp: 68, evo: { item: 'moonstone', to: 'dalpogeun' }, hab: '달숨동굴 반향층·달빛방 (드묾)',
      learn: [[1, 'butt'], [1, 'growl'], [5, 'charm'], [9, 'lull'], [13, 'curl'], [17, 'moonlight'], [22, 'swift'], [28, 'bodyslam'], [34, 'calm']],
      dex: '달빛이 비치는 동굴 틈에서 잠을 깬다. 길을 잃은 작은 생물 곁에 조용히 앉아 마음이 진정될 때까지 기다린다.' },
    dalpogeun: { no: 43, n: '달포근', t: ['노말'], b: [95, 70, 73, 85, 90, 60], cr: 25, xp: 129,
      learn: [[1, 'butt'], [1, 'charm'], [1, 'lull'], [1, 'moonlight'], [22, 'swift'], [28, 'bodyslam'], [34, 'calm'], [40, 'hypervoice']],
      dex: '넓은 막을 펼쳐 소리 없이 동굴 입구를 활공한다. 어린 동료가 추워하면 막으로 감싸 체온을 나눈다.' },
    dorekong: { no: 44, n: '도레콩', t: ['노말'], b: [115, 45, 20, 45, 25, 20], cr: 170, xp: 76, evo: { item: 'moonstone', to: 'ullimpong' }, hab: '노래초원 얕은 웅덩이',
      learn: [[1, 'lull'], [1, 'growl'], [4, 'curl'], [8, 'butt'], [12, 'bubble'], [16, 'echo'], [20, 'yawn'], [26, 'bodyslam'], [32, 'aquaring'], [38, 'hypervoice']],
      dex: '작은 목주머니를 부풀려 두 음만 번갈아 부른다. 여러 마리가 모이면 서로의 음을 따라 하다가 함께 잠든다.' },
    ullimpong: { no: 45, n: '울림퐁', t: ['노말'], b: [140, 70, 45, 75, 50, 45], cr: 50, xp: 109,
      learn: [[1, 'lull'], [1, 'growl'], [1, 'curl'], [1, 'butt'], [12, 'bubble'], [16, 'echo'], [18, 'yawn'], [22, 'aquaring'], [28, 'bodyslam'], [34, 'pulse'], [40, 'hypervoice']],
      dex: '목주머니의 크기를 바꿔 낮고 포근한 노래를 낸다. 비 오는 날 울림퐁이 노래하면 주변의 어린 몬스터들이 곁으로 모인다.' },
    kkumdochi: { no: 46, n: '꿈도치', t: ['에스퍼'], b: [25, 20, 15, 105, 55, 90], cr: 200, xp: 73, evo: { lv: 16, to: 'mongsil' }, hab: '물안개 산책길 (드묾)',
      learn: [[1, 'teleport']],
      dex: '하루 대부분을 자지만 꿈속에서는 주변 소리를 모두 듣는다. 낯선 기척이 가까워지면 잠든 채 조금 떨어진 곳으로 몸을 옮긴다.' },
    mongsil: { no: 47, n: '몽실각', t: ['에스퍼'], b: [40, 35, 30, 120, 70, 105], cr: 100, xp: 145, evo: { lv: 36, res: true, to: 'byeolkkum' },
      learn: [[1, 'teleport'], [16, 'confusion'], [18, 'kinesis'], [21, 'psybeam'], [25, 'hypnosis'], [28, 'recover'], [32, 'dreameat'], [36, 'psychic'], [42, 'calm']],
      dex: '꿈과 현실을 오가며 작은 물체를 움직이는 연습을 한다. 생각이 흐트러지면 가시가 접히고 잠들어버린다.' },
    byeolkkum: { no: 48, n: '별꿈현', t: ['에스퍼'], b: [55, 50, 45, 135, 85, 120], cr: 50, xp: 186,
      learn: [[1, 'teleport'], [16, 'confusion'], [18, 'kinesis'], [21, 'psybeam'], [25, 'hypnosis'], [28, 'recover'], [32, 'dreameat'], [36, 'psychic'], [42, 'calm']],
      dex: '여러 가시 끝으로 주변의 감정을 읽는다. 동료가 악몽에 시달리면 같은 꿈속으로 들어가 돌아올 길을 안내한다고 한다.' },
    ipppuri: { no: 49, n: '잎뿌리', t: ['풀', '독'], b: [45, 50, 55, 75, 65, 30], cr: 255, xp: 78, evo: { lv: 21, to: 'kkubeok' }, hab: '물안개 산책길 그늘 풀숲',
      learn: [[1, 'growth'], [1, 'absorb'], [8, 'poisonpow'], [12, 'stunspore'], [15, 'megadrain'], [18, 'sleeppow'], [22, 'acid'], [28, 'moonlight'], [34, 'petal']],
      dex: '밤에는 흙에서 나와 잎에 이슬을 받는다. 아침이 되면 발부터 땅에 묻고 잎만 내민 채 쉰다.' },
    kkubeok: { no: 50, n: '꾸벅초', t: ['풀', '독'], b: [60, 65, 70, 85, 75, 40], cr: 120, xp: 132, evo: { item: 'leafstone', to: 'bamhyang' },
      learn: [[1, 'growth'], [1, 'absorb'], [8, 'poisonpow'], [12, 'stunspore'], [15, 'megadrain'], [18, 'sleeppow'], [24, 'acid'], [31, 'moonlight'], [38, 'petal']],
      dex: '무거운 꽃봉오리를 받치다 보니 늘 졸린 듯 고개를 숙인다. 봉오리에서 새어 나오는 향은 다가온 생물을 나른하게 만든다.' },
    bamhyang: { no: 51, n: '밤향화', t: ['풀', '독'], b: [75, 80, 85, 100, 90, 50], cr: 45, xp: 184,
      learn: [[1, 'absorb'], [1, 'stunspore'], [1, 'megadrain'], [1, 'sleeppow'], [30, 'petal'], [40, 'leafstorm']],
      dex: '밤이 되면 세 꽃이 서로 다른 높이로 향기를 퍼뜨린다. 향이 너무 짙어지면 스스로 꽃잎을 접어 주변 생물들이 오래 잠들지 않게 한다.' },
    bangulssak: { no: 52, n: '방울싹', t: ['풀', '독'], b: [50, 75, 35, 70, 30, 40], cr: 255, xp: 84, evo: { lv: 21, to: 'deonggul' }, hab: '물안개 산책길 물가 풀숲',
      learn: [[1, 'growth'], [1, 'bind'], [6, 'poisonpow'], [10, 'sleeppow'], [13, 'vine'], [17, 'stunspore'], [21, 'acid'], [27, 'razor'], [33, 'leafstorm']],
      dex: '잎끝의 단 이슬로 작은 벌레를 유인한다. 아직 덮개가 없어 큰 먹이가 다가오면 당황해 입부터 닫는다.' },
    deonggul: { no: 53, n: '덩굴종', t: ['풀', '독'], b: [65, 90, 50, 85, 45, 55], cr: 120, xp: 151, evo: { item: 'leafstone', to: 'posik' },
      learn: [[1, 'growth'], [1, 'bind'], [6, 'poisonpow'], [10, 'sleeppow'], [13, 'vine'], [17, 'stunspore'], [23, 'acid'], [29, 'razor'], [35, 'leafstorm']],
      dex: '잎덮개의 각도로 안쪽의 향이 퍼지는 방향을 바꾼다. 덩굴팔로 주변 잎을 붙잡고 몸을 고정한다.' },
    posik: { no: 54, n: '포식종', t: ['풀', '독'], b: [80, 105, 65, 100, 60, 70], cr: 45, xp: 191,
      learn: [[1, 'vine'], [1, 'sleeppow'], [1, 'acid'], [1, 'razor'], [30, 'leafstorm'], [40, 'sludge']],
      dex: '네 잎다리로 몸을 낮춰 작은 덤불처럼 기다린다. 입테의 이슬 냄새에 이끌린 먹이가 가까워지면 덮개를 빠르게 닫는다.' },
    gyundeung: { no: 55, n: '균등이', t: ['벌레', '풀'], b: [35, 70, 55, 45, 55, 25], cr: 190, xp: 70, evo: { lv: 24, to: 'supdeung' }, hab: '달숨동굴 습한 바닥·버섯 군락',
      learn: [[1, 'scratch'], [7, 'stunspore'], [13, 'poisonpow'], [16, 'bugbite'], [19, 'absorb'], [25, 'spore'], [31, 'slash'], [37, 'growth'], [43, 'megadrain']],
      dex: '등의 버섯에 물을 나눠주고 버섯 아래에서 쉬며 살아간다. 버섯이 건강하면 갓 아래가 따뜻한 호박빛을 띤다.' },
    supdeung: { no: 56, n: '숲등짐', t: ['벌레', '풀'], b: [60, 95, 80, 60, 80, 30], cr: 75, xp: 128,
      learn: [[1, 'scratch'], [1, 'stunspore'], [1, 'poisonpow'], [1, 'bugbite'], [19, 'absorb'], [27, 'spore'], [35, 'slash'], [43, 'growth'], [51, 'megadrain']],
      dex: '커진 버섯으로 작은 생물에게 비를 피할 곳을 내준다. 버섯은 동굴의 은은한 빛을 모으고, 숲등짐은 포자를 새 흙으로 옮겨준다.' },
    muljjori: { no: 57, n: '물쫄이', t: ['물'], b: [20, 10, 55, 15, 20, 80], cr: 255, xp: 20, evo: { lv: 20, to: 'yongsot' }, hab: '산등 야영지 연못 (낚시·입양)',
      learn: [[1, 'splash'], [5, 'butt'], [10, 'bubble']],
      dex: '작은 물살에도 밀려나지만 매일 같은 여울을 거슬러 오른다. 지느러미가 작아 헤엄치다가 자주 제자리에서 빙글 돈다.' },
    yongsot: { no: 58, n: '용솟치', t: ['물', '드래곤'], b: [95, 125, 79, 60, 100, 81], cr: 45, xp: 214,
      learn: [[1, 'splash'], [1, 'butt'], [1, 'bubble'], [20, 'bite'], [25, 'twister'], [30, 'tailwag'], [35, 'dragonbreath'], [41, 'wave'], [47, 'rush']],
      dex: '오랜 여울 훈련 끝에 강의 흐름을 읽게 된다. 몸을 크게 굽이쳐 급류를 갈라 어린 물고기들이 지날 조용한 물길을 만든다.' },
    dolgubi: { no: 59, n: '돌굽이', t: ['바위', '땅'], b: [35, 45, 160, 30, 45, 70], cr: 45, xp: 108, hab: '깊은 동굴 (첫 관장전에서 먼저 목격)',
      learn: [[1, 'butt'], [1, 'screech'], [9, 'bind'], [13, 'harden'], [17, 'rockthrow'], [23, 'mudslap'], [29, 'rockslide'], [37, 'dig'], [45, 'quake']],
      dex: '겹친 판암 몸을 굽혔다 펴며 땅속에 긴 통로를 만든다. 동굴이 무너질 조짐이 보이면 몸을 가로로 세워 다른 생물이 빠져나갈 시간을 벌어준다.' },
    // ---- designer's dex #060-#090 (mid-region design v1): data first, sprites follow the sheets ----
    byeolbangul: { no: 60, n: '별방울', t: ['물'], b: [30, 45, 55, 70, 55, 85], cr: 225, xp: 68, evo: { item: 'wavestone', to: 'joryubyeol' }, hab: '조수만 관측 데크 웅덩이 (2장)',
      learn: [[1, 'butt'], [1, 'harden'], [6, 'bubble'], [10, 'swift'], [15, 'aqua'], [19, 'recover'], [24, 'pulse'], [30, 'psybeam'], [36, 'wave']],
      dex: '썰물에 남은 웅덩이에서 몸을 천천히 돌려 바다 쪽을 찾는다. 기분이 좋으면 지느러미 끝의 물결무늬가 차례로 흔들린다.' },
    joryubyeol: { no: 61, n: '조류별', t: ['물', '에스퍼'], b: [60, 75, 85, 100, 85, 115], cr: 60, xp: 182,
      learn: [[1, 'butt'], [1, 'swift'], [1, 'aqua'], [1, 'recover'], [24, 'pulse'], [30, 'psybeam'], [36, 'wave'], [42, 'psychic']],
      dex: '여러 방향의 물살을 동시에 읽는다. 안개 낀 항구에서는 배 곁을 돌며 안전하게 들어올 방향을 알려 준다.' },
    jumeonyang: { no: 62, n: '주머니냥', t: ['노말'], b: [40, 45, 35, 40, 40, 90], cr: 255, xp: 69, evo: { lv: 28, to: 'bidanbal' }, hab: '돛바람항 뒤 들길 (2장)',
      learn: [[1, 'scratch'], [1, 'growl'], [7, 'bite'], [12, 'screech'], [17, 'quick'], [22, 'swift'], [28, 'slash'], [34, 'agility'], [40, 'rush']],
      dex: '반짝이는 조개와 작은 나뭇조각을 가슴털에 숨긴다. 자랑하려고 꺼냈다가 어디에 넣었는지 잊고 한참 뒤적인다.' },
    bidanbal: { no: 63, n: '비단발', t: ['노말'], b: [65, 70, 60, 65, 65, 115], cr: 90, xp: 148,
      learn: [[1, 'scratch'], [1, 'growl'], [1, 'bite'], [1, 'screech'], [17, 'quick'], [22, 'swift'], [30, 'slash'], [37, 'agility'], [44, 'rush']],
      dex: '흔들리는 상자 위에서도 소리 없이 달린다. 항구의 심부름꾼들이 쪽지를 맡기면 익숙한 집 창가까지 정확히 가져간다.' },
    kkubeokyang: { no: 64, n: '꾸벅양', t: ['에스퍼'], b: [60, 48, 45, 43, 90, 42], cr: 190, xp: 66, evo: { lv: 26, to: 'mongyuram' }, hab: '갈대여울·항구 뒤 들길·울림당 회랑 (2장)',
      learn: [[1, 'butt'], [1, 'hypnosis'], [8, 'lull'], [12, 'confusion'], [17, 'yawn'], [21, 'kinesis'], [25, 'psybeam'], [30, 'dreameat'], [35, 'calm'], [40, 'psychic']],
      dex: '꼬리 끝을 일정한 빠르기로 흔들다가 자기부터 잠든다. 옆에 있던 동료도 그 리듬에 맞춰 천천히 숨을 고른다.' },
    mongyuram: { no: 65, n: '몽유램', t: ['에스퍼'], b: [85, 73, 70, 73, 115, 67], cr: 75, xp: 169,
      learn: [[1, 'butt'], [1, 'hypnosis'], [1, 'lull'], [1, 'confusion'], [17, 'yawn'], [21, 'kinesis'], [27, 'psybeam'], [33, 'dreameat'], [38, 'calm'], [44, 'psychic']],
      dex: '잠든 이의 불안한 감정을 읽고 꼬리의 리듬을 바꾼다. 악몽을 꾼 여행자가 쉬는 집 앞에 조용히 머무르는 일이 많다.' },
    heukkori: { no: 66, n: '흙코리', t: ['땅'], b: [20, 55, 25, 35, 45, 95], cr: 255, xp: 81, evo: { lv: 26, to: 'teoneolgup' }, hab: '옛 운송 갱도·바위울림터널 (2장)',
      learn: [[1, 'scratch'], [1, 'sandattack'], [5, 'mudslap'], [9, 'growl'], [15, 'dig'], [21, 'slash'], [26, 'mudshot'], [33, 'quake']],
      dex: '코로 흙의 습도를 확인하고 부드러운 쪽부터 판다. 흙 밖으로 나오면 낯선 냄새를 맡느라 한동안 고개를 두리번거린다.' },
    teoneolgup: { no: 67, n: '터널굽', t: ['땅'], b: [45, 85, 50, 50, 70, 120], cr: 50, xp: 153,
      learn: [[1, 'scratch'], [1, 'sandattack'], [1, 'mudslap'], [1, 'growl'], [15, 'dig'], [21, 'slash'], [28, 'mudshot'], [36, 'quake']],
      dex: '여러 굴 사이의 흙 두께를 짐작한다. 터널굽이 지나간 갱도는 벽이 단단하게 다져져 오래 무너지지 않는다고 한다.' },
    deuldori: { no: 68, n: '들돌이', t: ['격투'], b: [70, 80, 50, 35, 35, 35], cr: 180, xp: 75, evo: { lv: 28, to: 'beotimgom' }, hab: '옛 운송 갱도·바람등성이 (2장)',
      learn: [[1, 'jab'], [1, 'growl'], [7, 'focus'], [13, 'dkick'], [19, 'rockthrow'], [22, 'smash'], [28, 'submission'], [34, 'bodyslam'], [40, 'crosschop']],
      dex: '도움을 주고 싶어서 작은 돌부터 옮긴다. 자기보다 큰 짐을 보면 먼저 달려갔다가 동료를 불러 함께 들어 올린다.' },
    beotimgom: { no: 69, n: '버팀곰', t: ['격투'], b: [80, 100, 70, 50, 60, 45], cr: 90, xp: 146, evo: { lv: 36, res: true, to: 'sanbatgom' },
      learn: [[1, 'jab'], [1, 'growl'], [1, 'focus'], [1, 'dkick'], [19, 'rockthrow'], [22, 'smash'], [30, 'submission'], [37, 'bodyslam'], [44, 'crosschop']],
      dex: '흔들리는 수레를 몸으로 받치고 짐이 떨어지지 않게 지킨다. 힘을 주는 순간에도 주변 동료가 안전한지 먼저 살핀다.' },
    sanbatgom: { no: 70, n: '산받곰', t: ['격투'], b: [90, 130, 80, 65, 85, 55], cr: 45, xp: 227,
      learn: [[1, 'jab'], [1, 'focus'], [1, 'dkick'], [1, 'smash'], [30, 'submission'], [37, 'bodyslam'], [44, 'crosschop'], [52, 'quake']],
      dex: '여러 동료가 짐을 옮기는 동안 중심을 잡아 준다. 움직임은 느긋하지만 무게가 쏠리는 순간 정확하게 몸을 옮겨 버틴다.' },
    tokguri: { no: 71, n: '톡구리', t: ['전기'], b: [40, 30, 50, 55, 55, 100], cr: 190, xp: 66, evo: { lv: 30, to: 'ureureunggu' }, hab: '등대 동력실 (2장)',
      learn: [[1, 'butt'], [1, 'screech'], [6, 'zap'], [11, 'stun'], [16, 'spark'], [22, 'swift'], [28, 'agility'], [34, 'bolt'], [40, 'thunder']],
      dex: '전기가 흐르는 땅에서 껍질을 말고 데굴데굴 구른다. 너무 들뜨면 더듬이가 펴지며 작게 탁 소리가 난다.' },
    ureureunggu: { no: 72, n: '우르릉구', t: ['전기'], b: [60, 50, 70, 80, 80, 140], cr: 60, xp: 150,
      learn: [[1, 'butt'], [1, 'screech'], [1, 'zap'], [1, 'stun'], [16, 'spark'], [22, 'swift'], [29, 'agility'], [36, 'bolt'], [43, 'thunder']],
      dex: '껍질을 차례로 맞물려 전기를 모은다. 방전하기 전 껍질이 낮게 울려서, 항구 사람들은 그 소리로 충전 상태를 알아본다.' },
    nachimdol: { no: 73, n: '나침돌', t: ['전기', '강철'], b: [30, 45, 70, 90, 55, 45], cr: 190, xp: 65, evo: { lv: 30, to: 'jabukhwan' }, hab: '등대 동력실·자성 광물 절벽 (2장)',
      learn: [[1, 'butt'], [1, 'ultrasonic'], [6, 'zap'], [11, 'stun'], [16, 'ironbash'], [21, 'swift'], [26, 'bolt'], [32, 'screech'], [38, 'flashcannon'], [44, 'thunder']],
      dex: '몸이 늘 같은 방향을 향하려 한다. 배 위에서 빙글 돌려놓아도 잠시 뒤 바다의 자성 흐름 쪽으로 돌아선다.' },
    jabukhwan: { no: 74, n: '자북환', t: ['전기', '강철'], b: [55, 70, 95, 115, 70, 70], cr: 60, xp: 161,
      learn: [[1, 'butt'], [1, 'ultrasonic'], [1, 'zap'], [1, 'stun'], [16, 'ironbash'], [21, 'swift'], [27, 'bolt'], [34, 'screech'], [41, 'flashcannon'], [48, 'thunder']],
      dex: '날개의 각도로 주변 자기장을 읽는다. 등대의 회전축이 어긋나면 곁에 떠서 올바른 방향을 가리킨다.' },
    bulbari: { no: 75, n: '불발이', t: ['불'], b: [55, 70, 45, 70, 50, 60], cr: 190, xp: 70, evo: { item: 'firestone', to: 'hwarogyeon' }, hab: '항구 뒤 들길·바람등성이·햇꽃정원길 (2장)',
      learn: [[1, 'bite'], [1, 'growl'], [6, 'ember'], [11, 'focus'], [16, 'flamewheel'], [22, 'rush'], [28, 'agility'], [34, 'blaze']],
      dex: '따뜻한 곳을 좋아해서 식어 가는 화로 옆에 앉는다. 주인이 추워하면 먼저 다가와 발끝을 조심스럽게 댄다.' },
    hwarogyeon: { no: 76, n: '화로견', t: ['불'], b: [90, 110, 80, 100, 80, 95], cr: 75, xp: 194,
      learn: [[1, 'bite'], [1, 'growl'], [1, 'ember'], [1, 'flamewheel'], [22, 'rush'], [28, 'agility'], [34, 'blaze'], [44, 'sunfire']],
      dex: '갈기 안쪽에 모은 온기를 천천히 나눈다. 길 잃은 사람을 찾으면 곁에서 체온을 지키며 구조대를 기다린다.' },
    yeoubul: { no: 77, n: '여우불', t: ['불'], b: [38, 41, 40, 50, 65, 65], cr: 190, xp: 63, evo: { item: 'firestone', to: 'deungbullyeong' }, hab: '바람등성이·햇꽃정원길 (2장)',
      learn: [[1, 'ember'], [1, 'tailwag'], [7, 'quick'], [12, 'ultrasonic'], [17, 'flamewheel'], [22, 'swift'], [28, 'calm'], [34, 'blaze']],
      dex: '저녁이 되면 꼬리 끝이 따뜻하게 빛난다. 낯선 발자국을 따라가다가도 돌아오는 길은 냄새로 정확히 기억한다.' },
    deungbullyeong: { no: 78, n: '등불령', t: ['불'], b: [73, 76, 75, 81, 100, 100], cr: 75, xp: 178,
      learn: [[1, 'ember'], [1, 'quick'], [1, 'swift'], [1, 'calm'], [17, 'flamewheel'], [34, 'blaze'], [44, 'sunfire']],
      dex: '길게 흐르는 꼬리털로 열기를 조절한다. 안개 낀 정원길을 천천히 걸으며 뒤따르는 어린 동료의 속도를 맞춰 준다.' },
    mulkkori: { no: 79, n: '물꼬리', t: ['물'], b: [40, 50, 40, 40, 40, 90], cr: 255, xp: 60, evo: { lv: 25, to: 'muldolgae' }, hab: '갈대여울·물가 낚시 (2장)',
      learn: [[1, 'bubble'], [7, 'hypnosis'], [12, 'aqua'], [16, 'dkick'], [21, 'bodyslam'], [27, 'calm'], [33, 'wave']],
      dex: '꼬리를 크게 흔들며 둥근 물결을 만든다. 얕은 곳에서는 자기가 만든 물결에 밀려 제자리로 돌아오곤 한다.' },
    muldolgae: { no: 80, n: '물돌개', t: ['물'], b: [65, 65, 65, 50, 50, 90], cr: 120, xp: 135, evo: { item: 'wavestone', to: 'yeoulgwon' },
      learn: [[1, 'bubble'], [1, 'hypnosis'], [12, 'aqua'], [16, 'dkick'], [23, 'bodyslam'], [30, 'calm'], [37, 'wave']],
      dex: '물갈퀴를 번갈아 저어 빠른 물살 속에서도 중심을 잡는다. 꼬리로 방향을 바꾸던 버릇이 아직 남아 있다.' },
    yeoulgwon: { no: 81, n: '여울권', t: ['물', '격투'], b: [90, 95, 95, 70, 90, 70], cr: 45, xp: 230,
      learn: [[1, 'bubble'], [1, 'hypnosis'], [1, 'aqua'], [1, 'smash'], [30, 'submission'], [38, 'wave'], [44, 'crosschop']],
      dex: '여울의 힘을 흘려보내고 필요한 순간에만 몸을 밀어낸다. 앞발을 펼친 단단한 자세로 급류에서도 동료를 지킨다.' },
    deungbulhaepa: { no: 82, n: '등불해파', t: ['물', '독'], b: [40, 40, 35, 50, 100, 70], cr: 190, xp: 67, evo: { lv: 30, to: 'haeryudeung' }, hab: '조수만 관측 데크 웅덩이 (2장)',
      learn: [[1, 'sting'], [1, 'ultrasonic'], [7, 'bind'], [12, 'acid'], [17, 'bubble'], [22, 'aqua'], [28, 'screech'], [34, 'sludge'], [40, 'wave']],
      dex: '잔잔한 웅덩이에서 작은 등불처럼 떠다닌다. 따끔한 촉수는 몸 아래로 접어 작은 물고기가 지나갈 자리를 내준다.' },
    haeryudeung: { no: 83, n: '해류등', t: ['물', '독'], b: [80, 70, 65, 80, 120, 100], cr: 60, xp: 180,
      learn: [[1, 'sting'], [1, 'ultrasonic'], [1, 'bind'], [1, 'acid'], [17, 'bubble'], [22, 'aqua'], [30, 'screech'], [37, 'sludge'], [44, 'wave']],
      dex: '갓 아래 불빛을 차례로 밝히며 무리와 거리를 맞춘다. 무리가 모이면 밤바다의 안전한 물길을 따라 긴 빛줄기가 생긴다.' },
    dungjami: { no: 84, n: '둥잠이', t: ['물', '에스퍼'], b: [90, 65, 65, 40, 40, 15], cr: 190, xp: 63, evo: { lv: 37, to: 'neugeutduk' }, hab: '갈대여울 마른 둔덕 (2장)',
      learn: [[1, 'butt'], [1, 'yawn'], [6, 'growl'], [11, 'bubble'], [16, 'confusion'], [22, 'curl'], [28, 'aqua'], [33, 'aquaring'], [39, 'psychic'], [45, 'calm']],
      dex: '물에 발을 담그고 오래 쉬는 것을 좋아한다. 동료들이 다투면 사이에 조용히 앉아 분위기가 가라앉을 때까지 기다린다.' },
    neugeutduk: { no: 85, n: '느긋둑', t: ['물', '에스퍼'], b: [95, 75, 110, 100, 80, 30], cr: 75, xp: 172,
      learn: [[1, 'butt'], [1, 'yawn'], [1, 'growl'], [1, 'bubble'], [16, 'confusion'], [22, 'curl'], [28, 'aqua'], [33, 'aquaring'], [41, 'psychic'], [48, 'calm']],
      dex: '수염으로 작은 흐름의 변화까지 느낀다. 급한 상황에서도 허둥대지 않고 안전하게 건널 둔덕부터 찾아낸다.' },
    meongburi: { no: 86, n: '멍부리', t: ['물'], b: [50, 52, 48, 65, 50, 55], cr: 190, xp: 64, evo: { lv: 33, to: 'mulgyeolburi' }, hab: '갈대여울 물가·하류 산책길 (2장)',
      learn: [[1, 'scratch'], [1, 'tailwag'], [5, 'bubble'], [10, 'confusion'], [16, 'kinesis'], [22, 'aqua'], [28, 'slash'], [36, 'pulse'], [44, 'wave']],
      dex: '물소리를 들을 때마다 고개를 갸웃거린다. 멍해 보이지만 부리에 닿는 물의 떨림으로 작은 먹이의 위치를 찾는다.' },
    mulgyeolburi: { no: 87, n: '물결부리', t: ['물'], b: [80, 82, 78, 95, 80, 85], cr: 75, xp: 175,
      learn: [[1, 'scratch'], [1, 'tailwag'], [1, 'bubble'], [1, 'confusion'], [16, 'kinesis'], [22, 'aqua'], [28, 'slash'], [38, 'pulse'], [47, 'wave']],
      dex: '부리를 물속에 넣고 넓은 범위의 물살을 읽는다. 강을 건널 때 동료가 물결 뒤에 숨지 않았는지 자주 돌아본다.' },
    sumsom: { no: 88, n: '숨솜', t: ['고스트', '독'], b: [30, 35, 30, 100, 35, 80], cr: 190, xp: 62, evo: { lv: 25, to: 'geuneulsom' }, hab: '기억나루 울림당 회랑 (2장)',
      learn: [[1, 'lick'], [1, 'mistveil'], [8, 'hypnosis'], [13, 'poisongas'], [18, 'nightshade'], [23, 'dreameat'], [28, 'sludge'], [33, 'shadowball']],
      dex: '사람들이 오가던 옛길의 틈에서 태어나는 안개 생물이다. 혼자 걷는 발자국을 발견하면 궁금해서 조용히 뒤따른다.' },
    geuneulsom: { no: 89, n: '그늘솜', t: ['고스트', '독'], b: [45, 50, 45, 115, 55, 95], cr: 90, xp: 142, evo: { lv: 36, res: true, to: 'bamnuri' },
      learn: [[1, 'lick'], [1, 'mistveil'], [1, 'hypnosis'], [13, 'poisongas'], [18, 'nightshade'], [25, 'dreameat'], [31, 'sludge'], [37, 'shadowball']],
      dex: '그늘에 몸을 섞어 지친 여행자 곁에 머문다. 짙은 안개를 피우기도 하지만 익숙한 동료 앞에서는 얼굴을 또렷하게 드러낸다.' },
    bamnuri: { no: 90, n: '밤누리', t: ['고스트', '독'], b: [60, 65, 60, 130, 75, 110], cr: 45, xp: 225,
      learn: [[1, 'lick'], [1, 'mistveil'], [1, 'hypnosis'], [1, 'poisongas'], [18, 'nightshade'], [25, 'dreameat'], [31, 'sludge'], [37, 'shadowball'], [45, 'psychic']],
      dex: '사람이 끊긴 길의 흔적을 오래 기억한다. 잊힌 쉼터를 찾는 이가 다가오면 안개를 걷어 옛 표지석을 보여 준다.' },
    // ---- #091-#102 (chapter 3 design v1: docs/planning/chapter-03/monsters-091-102.json; stats and learnsets are a playtest draft)
    pomal: { no: 91, n: '포말이', t: ['물'], b: [70, 45, 55, 55, 70, 40], cr: 180, xp: 75, evo: { lv: 34, to: 'haepum' }, hab: '흰부표 해로 바다·해변 (3장)',
      learn: [[1, 'bubble'], [1, 'growl'], [10, 'aqua'], [16, 'refresh'], [22, 'aquaring'], [28, 'pulse'], [34, 'bodyslam'], [40, 'wave']],
      dex: '물거품처럼 둥근 아기 물범 몬스터. 파도에 떠밀린 조개를 코로 밀어 마른 곳에 옮겨 주고, 칭찬받으면 두 앞지느러미를 마주 친다.' },
    haepum: { no: 92, n: '해품범', t: ['물'], b: [105, 70, 85, 80, 105, 60], cr: 75, xp: 175,
      learn: [[1, 'bubble'], [1, 'growl'], [10, 'aqua'], [16, 'refresh'], [22, 'aquaring'], [28, 'pulse'], [34, 'bodyslam'], [40, 'wave']],
      dex: '길고 매끈한 몸의 물범 몬스터. 물결이 잠잠한 곳을 먼저 찾아 무리에게 알리고, 지친 동료 곁에서는 물살을 막는 쪽으로 몸을 눕힌다.' },
    moraekkom: { no: 93, n: '모래꼼', t: ['물', '바위'], b: [45, 45, 100, 55, 55, 20], cr: 180, xp: 75, evo: { item: 'wavestone', to: 'borupae' }, hab: '흰부표 해로 해변·너울잠굴 물웅덩이 (3장)',
      learn: [[1, 'bubble'], [1, 'harden'], [10, 'aqua'], [18, 'rockthrow'], [26, 'aquaring'], [32, 'pulse'], [38, 'rockguard'], [44, 'rockslide']],
      dex: '복숭아빛 동심원 껍데기를 가진 아기 조개 몬스터. 모래알을 꼭 맞게 쌓으려 하고, 물이 탁해지면 껍데기를 닫고 맑은 물을 천천히 내보낸다.' },
    borupae: { no: 94, n: '보루패', t: ['물', '바위'], b: [80, 70, 140, 80, 80, 30], cr: 75, xp: 175,
      learn: [[1, 'bubble'], [1, 'harden'], [10, 'aqua'], [18, 'rockthrow'], [26, 'aquaring'], [32, 'pulse'], [38, 'rockguard'], [44, 'rockslide']],
      dex: '두꺼운 사암색 껍데기를 비스듬히 세워 작은 파도를 흘려보낸다. 살아 있는 방파제라 불리지만 강한 흐름은 스스로 피한다.' },
    chalkakge: { no: 95, n: '찰칵게', t: ['물', '땅'], b: [50, 60, 80, 60, 45, 30], cr: 180, xp: 75, evo: { lv: 32, to: 'jebangjipge' }, hab: '흰부표 해로 해변·제방들길 (3장)',
      learn: [[1, 'bubble'], [1, 'harden'], [10, 'pinch'], [18, 'mudshot'], [26, 'aqua'], [32, 'dig'], [38, 'wave'], [44, 'quake']],
      dex: '젖은 모래를 집게로 눌러 작은 둑을 쌓는 아기 게 몬스터. 파도가 둑을 넘어도 성내지 않고 더 넓게 다시 쌓는다.' },
    jebangjipge: { no: 96, n: '제방집게', t: ['물', '땅'], b: [85, 85, 110, 85, 70, 45], cr: 75, xp: 175,
      learn: [[1, 'bubble'], [1, 'harden'], [10, 'pinch'], [18, 'mudshot'], [26, 'aqua'], [32, 'dig'], [38, 'wave'], [40, 'rockguard'], [44, 'quake']],
      dex: '넓은 육각 갑각과 둑다짐 삽 같은 큰 집게를 가졌다. 물이 새는 곳을 먼저 살펴 흙을 눌러 보강하고, 사람이 세운 둑과 자기 둑을 같은 길로 여긴다.' },
    silhaema: { no: 97, n: '실해마', t: ['물'], b: [45, 45, 50, 75, 55, 65], cr: 180, xp: 75, evo: { lv: 40, to: 'haeryonggyeol' }, hab: '흰부표 해로 바다·굽이강 (3장)',
      learn: [[1, 'bubble'], [1, 'growl'], [10, 'aqua'], [18, 'twister'], [26, 'agility'], [32, 'pulse'], [40, 'dragonbreath'], [44, 'wave']],
      dex: '해초에 꼬리를 걸고 쉬는 작은 해마 몬스터. 같은 물살을 따라 무리째 움직이고, 길을 잃으면 작은 방울 소리를 낸다.' },
    haeryonggyeol: { no: 98, n: '해룡결', t: ['물', '드래곤'], b: [75, 75, 75, 105, 80, 95], cr: 75, xp: 175,
      learn: [[1, 'bubble'], [1, 'growl'], [10, 'aqua'], [18, 'twister'], [26, 'agility'], [32, 'pulse'], [40, 'dragonbreath'], [44, 'wave']],
      dex: '살구빛 잎 지느러미가 등에서 물결처럼 이어지는 해룡 몬스터. 먼 바다로 나가는 새끼들이 따라오도록 같은 자리를 크게 돌아 준다.' },
    jindeugi: { no: 99, n: '진득이', t: ['독'], b: [65, 75, 55, 45, 65, 20], cr: 180, xp: 75, evo: { lv: 38, to: 'hoesureong' }, hab: '침전수로·옛 배차소 (3장)',
      learn: [[1, 'acid'], [1, 'harden'], [10, 'growl'], [18, 'sludge'], [26, 'venomjab'], [32, 'bodyslam'], [38, 'rockguard'], [44, 'screech']],
      dex: '물밑에 가라앉은 찌꺼기를 조금씩 모아 먹는 납작한 몬스터. 먹을 수 있는 양보다 찌꺼기가 많아지면 물 밖으로 나와 몸을 말리며 쉰다.' },
    hoesureong: { no: 100, n: '회수렁', t: ['독'], b: [100, 105, 80, 65, 95, 35], cr: 75, xp: 175,
      learn: [[1, 'acid'], [1, 'harden'], [10, 'growl'], [18, 'sludge'], [26, 'venomjab'], [32, 'bodyslam'], [38, 'rockguard'], [44, 'screech']],
      dex: '먹은 찌꺼기를 몸속에서 안정시켜 두는 커다란 몬스터. 한도를 넘기 전에 쉬러 나오기 때문에, 작업자들은 쉬는 무리를 보고 설비를 점검한다.' },
    huugi: { no: 101, n: '후욱이', t: ['독'], b: [45, 45, 80, 60, 55, 40], cr: 180, xp: 75, evo: { lv: 35, to: 'hwangidung' }, hab: '바닷솔길·침전수로 (3장)',
      learn: [[1, 'acid'], [1, 'harden'], [10, 'gust'], [18, 'poisongas'], [26, 'sludge'], [32, 'agility'], [35, 'aircut'], [42, 'chargeguard']],
      dex: '공기주머니 몸에 모은 기체를 아주 조금씩 내보내며 떠오른다. 막힌 바람길 근처에서는 같은 자리를 둥실둥실 맴돈다.' },
    hwangidung: { no: 102, n: '환기둥', t: ['독', '비행'], b: [75, 65, 115, 90, 80, 65], cr: 75, xp: 175,
      learn: [[1, 'acid'], [1, 'harden'], [10, 'gust'], [18, 'poisongas'], [26, 'sludge'], [32, 'agility'], [35, 'aircut'], [42, 'chargeguard']],
      dex: '라벤더색 막지느러미를 펼치고 여러 환기구 사이를 돌며 막힌 흐름을 감지한다. 흐름이 풀리면 몸이 가볍게 펴져 멀리서도 알아볼 수 있다.' },
    // ---- provisional drafts: kept only so older saves still load; not in the dex or the world ----
    banjjak: { no: 901, hidden: true, n: '반짝이', t: ['벌레', '전기'], b: [48, 38, 42, 68, 58, 78], cr: 150, xp: 90, night: true,
      learn: [[1, 'zap'], [1, 'glow'], [8, 'bugbite'], [12, 'stun'], [15, 'bolt'], [19, 'antenna']],
      dex: '밤이 되면 꽁무니에 불을 밝히고 연못가를 날아다닌다. 무리 지어 빛으로 이야기한다.' },
    jjireung: { no: 902, hidden: true, n: '찌르릉', t: ['전기'], b: [46, 50, 52, 64, 48, 62], cr: 120, xp: 88,
      learn: [[1, 'butt'], [1, 'growl'], [5, 'zap'], [9, 'curl'], [12, 'stun'], [15, 'bolt'], [20, 'rush']],
      dex: '가시마다 전기를 모아 둔 고슴도치 몬스터. 놀라면 몸을 말고 찌릿 전기를 튀긴다.' },
    dudeo: { no: 903, hidden: true, n: '두더콩', t: ['땅'], b: [40, 62, 45, 30, 40, 62], cr: 200, xp: 60, evo: { lv: 20, to: 'dudeowang' },
      learn: [[1, 'scratch'], [1, 'mudslap'], [10, 'dig'], [14, 'bite'], [22, 'quake']],
      dex: '분홍 코로 흙냄새를 맡으며 땅굴을 판다. 밭을 부드럽게 갈아 줘서 농부들이 좋아한다.' },
    dudeowang: { no: 904, hidden: true, n: '두더왕', t: ['땅'], b: [66, 92, 66, 45, 60, 86], cr: 60, xp: 150,
      learn: [[1, 'scratch'], [1, 'mudslap'], [10, 'dig'], [14, 'bite'], [22, 'quake']],
      dex: '바위를 깨는 커다란 발톱을 가졌다. 머리의 돌 왕관은 땅속에서 찾은 보물이라고 한다.' },
    gaegul: { no: 905, hidden: true, n: '개굴', t: ['물'], b: [50, 45, 45, 52, 46, 56], cr: 200, xp: 60, evo: { lv: 18, to: 'wanggaegul' },
      learn: [[1, 'bubble'], [1, 'growl'], [6, 'butt'], [10, 'aqua'], [15, 'bite'], [21, 'wave']],
      dex: '비가 오면 연못가에서 개굴개굴 합창한다. 등의 무늬로 날씨를 알아맞힌다고 한다.' },
    wanggaegul: { no: 906, hidden: true, n: '왕개굴', t: ['물'], b: [76, 66, 66, 72, 66, 70], cr: 70, xp: 140,
      learn: [[1, 'bubble'], [1, 'growl'], [6, 'butt'], [10, 'aqua'], [15, 'bite'], [21, 'wave']],
      dex: '연잎 왕관을 쓴 연못의 왕. 한 번 크게 울면 온 연못의 개굴이 모여든다.' },
    songsong: { no: 907, hidden: true, n: '송송이', t: ['풀'], b: [56, 40, 56, 56, 66, 30], cr: 190, xp: 70,
      learn: [[1, 'absorb'], [5, 'poisonpow'], [8, 'sleeppow'], [12, 'vine'], [20, 'leafstorm']],
      dex: '솔숲 그늘에 사는 버섯 몬스터. 갓을 흔들면 졸음이 쏟아지는 포자가 퍼진다.' },
    buong: { no: 908, hidden: true, n: '부엉콩', t: ['노말', '비행'], b: [60, 32, 42, 42, 56, 50], cr: 255, xp: 58, night: true,
      learn: [[1, 'peck'], [1, 'growl'], [4, 'lull'], [8, 'gust'], [12, 'focus'], [15, 'wingcut'], [21, 'rush']],
      dex: '밤에만 눈을 뜨는 동그란 부엉이 몬스터. 자장노래를 부르면 숲 전체가 조용해진다.' },
    geumo: { no: 909, hidden: true, n: '금오', t: ['불', '비행'], b: [80, 72, 70, 88, 78, 84], cr: 45, xp: 220, legend: true,
      learn: [[1, 'ember'], [1, 'gust'], [10, 'wingcut'], [15, 'flamewheel'], [20, 'sunfire'], [25, 'dive'], [30, 'blaze']],
      dex: '해 속에 산다는 세 발 달린 까마귀. 아침마다 해를 등에 지고 날아오른다고 전해진다.' }
  };
  D.DEX = Object.keys(D.MONS).filter(id => !D.MONS[id].hidden).sort((a, b) => D.MONS[a].no - D.MONS[b].no);
  // how a species is reached: 'wild' habitat text, or the line it grows from
  D.origin = id => {
    for (const k in D.MONS) { const e = D.MONS[k].evo; if (e && e.to === id) return { from: k, lv: e.lv, item: e.item, res: e.res }; }
    return null;
  };
  // the first form of a line
  D.baseOf = id => { let b = id, o = D.origin(b); while (o) { b = o.from; o = D.origin(b); } return b; };
  // evolution rules (evolution-rules v2): level, mineral, or 공명 조율 (Lv.36 + third badge + Q22 at the 잎향 공명연구소)
  D.evoText = e => !e ? '' : e.item ? D.ITEMS[e.item].n + ' 1개' : e.res ? 'Lv.' + e.lv + ' + 공명 조율' : 'Lv.' + e.lv;
  D.resonanceReady = () => !!(G.S && G.S.flags.badge3 && G.S.flags.q22);
  // a level evolution the monster has earned (used after battles, candies and the dex's evolution menu)
  D.levelEvoReady = m => { const e = D.MONS[m.id].evo; return !!(e && e.lv && !e.res && m.lv >= e.lv); };

  // ------------------------------------------------------------ items
  D.ITEMS = {
    potion: { n: '상처약', price: 300, cat: 'heal', icon: 'medicine', heal: 20, desc: '몬스터 한 마리의 체력을 20 회복한다.' },
    superpotion: { n: '좋은상처약', price: 700, cat: 'heal', icon: 'medicine', heal: 50, desc: '몬스터 한 마리의 체력을 50 회복한다.' },
    antidote: { n: '해독제', price: 100, cat: 'heal', icon: 'medicine', cure: 'psn', desc: '독 상태를 치료한다.' },
    parlyz: { n: '마비약', price: 200, cat: 'heal', icon: 'medicine', cure: 'par', desc: '마비 상태를 치료한다.' },
    awake: { n: '잠깨는약', price: 250, cat: 'heal', icon: 'medicine', cure: 'slp', desc: '잠든 몬스터를 깨운다.' },
    revive: { n: '기운환', price: 1500, cat: 'heal', icon: 'medicine', revive: 0.5, desc: '기절한 몬스터를 체력 절반으로 깨운다.' },
    cube: { n: '큐브', price: 200, cat: 'ball', ball: 1, icon: 'cube', desc: '야생 몬스터를 담아 데려갈 수 있는 작은 큐브.' },
    goldcube: { n: '금빛 큐브', price: 600, cat: 'ball', ball: 1.5, icon: 'goldcube', desc: '금빛으로 빛나는 큐브. 보통 큐브보다 잘 담긴다.' },
    mastercube: { n: '마스터 큐브', price: 0, cat: 'ball', ball: 255, master: true, owner: true, icon: 'mastercube', desc: '어떤 몬스터든 반드시 담기는 신비한 큐브. 주인이 아니면 꿈쩍도 하지 않는다.' },
    moonstone: { n: '달빛돌', price: 2000, cat: 'stone', stone: true, icon: 'moonstone', desc: '달빛을 머금은 공명 광물. 덤불토·뿔다짐·달모찌·도레콩이 이 울림에 반응한다.' },
    chargestone: { n: '충전돌', price: 2000, cat: 'stone', stone: true, icon: 'chargestone', desc: '찌릿한 울림이 맺힌 공명 광물. 전기를 모으는 찌리콩이 이 돌에 반응한다.' },
    leafstone: { n: '잎숨돌', price: 2000, cat: 'stone', stone: true, icon: 'leafstone', desc: '숨 쉬듯 초록빛이 일렁이는 공명 광물. 꾸벅초와 덩굴종의 꽃과 잎을 깨운다.' },
    firestone: { n: '불씨돌', price: 2000, cat: 'stone', stone: true, icon: 'firestone', desc: '속에서 작은 불씨가 꺼지지 않는 공명 광물. 불발이와 여우불이 이 온기에 반응한다.' },
    wavestone: { n: '물결돌', price: 2000, cat: 'stone', stone: true, icon: 'wavestone', desc: '쥐면 물결이 이는 듯 떨리는 공명 광물. 별방울·물돌개·모래꼼이 이 흐름에 반응한다.' },
    hyperpotion: { n: '특제상처약', price: 1200, cat: 'heal', icon: 'medicine', heal: 120, desc: '몬스터 한 마리의 체력을 120 회복한다. 항구 이후의 상점에서 판다.' },
    berry: { n: '회복열매', price: 0, cat: 'heal', icon: 'berry', heal: 25, desc: '과수원과 길가 나무에서 따는 열매. 몬스터 한 마리의 체력을 25 회복한다.' },
    rope: { n: '탈출줄', price: 550, cat: 'tool', icon: 'rope', rope: true, desc: '동굴 안에서 쓰면 마지막으로 지나온 동굴 입구로 돌아간다. 구조 요청과 같은 일을 한다.' },
    // ---- key items: never sold or thrown away
    notebook: { n: '연우 박사의 조사 수첩', price: 0, cat: 'key', icon: 'book', desc: () => G.S.flags.q01 ? '바람나루 기록까지 이어 쓴 조사 수첩. 돌마루시 연구소 분관에 전해야 한다.' : '이슬마을의 서식 기록이 담긴 수첩. 바람나루 길지기 초소의 하람에게 전해야 한다.' },
    map01: { n: '길지기 초원도', price: 0, cat: 'key', icon: 'mapItem', map: 'MAP01', desc: '하람에게 받은 첫 지도. 이슬마을부터 돌마루시까지의 큰 윤곽과, 직접 걸은 길이 기록된다.' },
    map02: { n: '달숨동굴 안전도', price: 0, cat: 'key', icon: 'mapItem', map: 'MAP02', desc: '석호에게 받은 동굴 개략도. 입구와 대피소, 층의 윤곽만 그려져 있고 세부 길은 걸으며 채운다.' },
    map03: { n: '물울림 수로 안내도', price: 0, cat: 'key', icon: 'mapItem', map: 'MAP03', desc: '소리에게 받은 수로 안내도. 공공 선착장과 연구소, 수문 구역이 표시되어 있다.' },
    lamp: { n: '동굴등', price: 0, cat: 'key', icon: 'lampItem', desc: '가방에 있으면 동굴에서 저절로 켜지는 등. 연료도 필요 없고, 어떤 동료와 다녀도 쓸 수 있다.' },
    rod: { n: '낚싯대', price: 0, cat: 'key', icon: 'rod', rod: true, desc: '나래에게 받은 여분 낚싯대. 낚시 둔덕에서 물을 바라보고 쓰면 물가 몬스터를 낚을 수 있다.' },
    board: { n: '접이식 물판', price: 0, cat: 'key', icon: 'boardItem', desc: '잔물타기를 익힌 동료와 함께 잔잔한 강과 연못을 건너는 판. 급류와 바다는 아직 무리다.' },
    recommend: { n: '바위 밀기 추천서', price: 0, cat: 'key', icon: 'letter', desc: '관장 토담의 추천서. 산등 야영지의 탐굴사 석호에게 보여 주면 바위 밀기를 배울 수 있다.' },
    fishbag: { n: '파란 낚시 가방', price: 0, cat: 'key', icon: 'boardItem', desc: '야영지 낚시꾼 나래가 잃어버린 가방. 나래에게 돌려주자.' },
    records: { n: '새길상회 작업 기록', price: 0, cat: 'key', icon: 'book', desc: '달숨동굴 작업장에서 받은 기록. 물울림 수문 장비 이야기가 적혀 있다. 수문연구소의 소리에게 전하자.' },
    part: { n: '공명 핵심 부품', price: 0, cat: 'key', icon: 'part', desc: '공명석 받침대에서 떼어 낸 부품. 달숨동굴 동쪽 받침대에 돌려놓아야 한다.' },
    valvepart: { n: '밸브 부품', price: 0, cat: 'key', icon: 'part', desc: '저수로 핵심 밸브에서 빠진 부품. 밸브실의 핵심 밸브에 끼우면 수문이 돌아온다.' },
    ticket: { n: '잔물타기 강습권', price: 0, cat: 'key', icon: 'letter', desc: '관장 리안의 강습권. 물울림 체육관 옆 안전 수조에서 잔물타기를 배울 수 있다.' },
    clue: { n: '다음 지역 지도 단서', price: 0, cat: 'key', icon: 'mapfrag', desc: '연꽃섬에 묻혀 있던 옛 기록. 동쪽 수문 너머 항구 쪽 길이 그려져 있다.' },
    memo: { n: '탐굴사의 옛 메모', price: 0, cat: 'key', icon: 'letter', desc: '반향방에 남은 메모. "공명석은 떼어 내지 말고 받침대에 두어라. 울림이 곧 길이다."' },
    quartz: { n: '울림 석영', price: 0, cat: 'key', icon: 'quartz', desc: '반향방에서 찾은 맑은 석영. 수문연구소 교환소에서 조사증표 1개로 바꿔 준다.' },
    mapfrag: { n: '옛길 지도 조각', price: 0, cat: 'key', icon: 'mapfrag', desc: '바람나루 옛 창고에서 찾은 낡은 지도 조각. 큰 바위 너머 옛 산길이 그려져 있다.' },
    token: { n: '조사증표', price: 0, cat: 'key', icon: 'token', desc: '현장점검 의뢰를 마치면 받는 증표. 3개를 모으면 연구소 교환소에서 진화석 1개로 바꿀 수 있다.' },
    tm_rock: { n: '교본: 암석수비', price: 0, cat: 'tm', icon: 'book', tm: 'rockguard', desc: '방어를 크게 올리는 바위 기술 [암석수비]를 가르치는 교본. 몇 번이고 다시 쓸 수 있다.' },
    tm_pulse: { n: '교본: 물결탄', price: 0, cat: 'tm', icon: 'book', tm: 'pulse', desc: '빗나가지 않는 물 공격 [물결탄]을 가르치는 교본. 몇 번이고 다시 쓸 수 있다.' },
    // ---- chapter 2
    tm_slam: { n: '교본: 덮쳐누르기', price: 0, cat: 'tm', icon: 'book', tm: 'bodyslam', desc: '항만 교본. 몸으로 덮쳐 누르는 [덮쳐누르기]를 가르친다. 마비시키기도 한다.' },
    tm_slide: { n: '교본: 바위떨구기', price: 0, cat: 'tm', icon: 'book', tm: 'rockslide', desc: '옛 갱도에서 찾은 바위 계열 교본. [바위떨구기]를 가르친다.' },
    tm_screen: { n: '교본: 전류막', price: 0, cat: 'tm', icon: 'book', tm: 'chargeguard', desc: '관장 단우의 교본. 몸에 전류막을 둘러 특수방어를 크게 올리는 [전류막]을 가르친다.' },
    tm_refresh: { n: '교본: 맑은숨', price: 0, cat: 'tm', icon: 'book', tm: 'refresh', desc: '기억나루의 수면 해제 보조 교본. 숨을 골라 자기 상태이상과 졸음을 푸는 [맑은숨]을 가르친다.' },
    tm_sludge: { n: '교본: 독물튀기기', price: 0, cat: 'tm', icon: 'book', tm: 'sludge', desc: '관장 하진의 교본. 독물을 튀겨 독에 걸리게 하기도 하는 [독물튀기기]를 가르친다.' },
    tm_quake: { n: '교본: 대지흔들기', price: 0, cat: 'tm', icon: 'book', tm: 'quake', desc: '관장 규호의 교본. 땅을 크게 흔드는 [대지흔들기]를 가르친다.' },
    tm_scent: { n: '교본: 향기장막', price: 0, cat: 'tm', icon: 'book', tm: 'scentveil', desc: '관장 윤슬의 교본. 향기로 몸을 감싸 방어와 특수방어를 올리는 [향기장막]을 가르친다.' },
    request: { n: '새 조사 의뢰서', price: 0, cat: 'key', icon: 'letter', desc: '물울림 수문연구소의 조사 의뢰서. 돛바람항 항만소에 전해야 한다.' },
    equipcopy: { n: '장비 표식 사본', price: 0, cat: 'key', icon: 'letter', desc: '동굴과 수문에 쓰인 새길상회 장비의 표식을 베낀 종이.' },
    fieldlog: { n: '소형 도감 관찰 기록', price: 0, cat: 'key', icon: 'book', desc: '갈대여울 부둣가에서 주운 관찰 수첩. 물가 몬스터의 서식 메모가 빼곡하다.' },
    slip: { n: '떨어진 운송표', price: 0, cat: 'key', icon: 'letter', desc: '항구 뒤 들길에 흩어진 새길상회 운송표. 세 장을 모아 항만소에 돌려주자.' },
    kit: { n: '절연 장비', price: 0, cat: 'key', icon: 'part', desc: '등대 정비사 세나가 빌려준 절연 장갑과 덧신. 전기 동료가 없어도 동력실을 점검할 수 있다.' },
    rod2: { n: '물가낚싯대', price: 0, cat: 'key', icon: 'rod', rod: true, desc: '항구 낚시 수업에서 받은 낚싯대. 물가의 여러 몬스터를 낚을 수 있다.' },
    matpack: { n: '공방 재료 꾸러미', price: 0, cat: 'key', icon: 'part', desc: '옛 운송 갱도에서 찾은 재료 꾸러미. 항구 공방에 가져가면 기뻐할 것 같다.' },
    ticket2: { n: '바위깨기 강습권', price: 0, cat: 'key', icon: 'letter', desc: '관장 단우의 강습권. 항구 공방에서 바위깨기를 배울 수 있다.' },
    oldcopy: { n: '훼손된 옛길 기록 사본', price: 0, cat: 'key', icon: 'mapfrag', desc: '바위울림터널에서 찾은, 상회가 쓰던 옛길 기록의 사본. 군데군데 지워져 있다.' },
    compass: { n: '길비나침반', price: 0, cat: 'key', icon: 'part', desc: '기억나루 관리인 해솔의 나침반. 흐릿해진 옛 표지가 있는 쪽을 가리킨다.' },
    bookmark: { n: '기억의 책갈피', price: 0, cat: 'key', icon: 'letter', desc: '울림당 기록 대조를 마친 길지기에게 주는 장식 책갈피.' },
    canalplan: { n: '상회의 옛 수로 도면', price: 0, cat: 'key', icon: 'mapfrag', desc: '잎향시 수로에 설치된 장비의 위치가 표시된 옛 도면.' },
    permit: { n: '온실 조사 허가증', price: 0, cat: 'key', icon: 'letter', desc: '약초사 미루가 내준 허가증. 유리온실 관개수로를 조사할 수 있다.' },
    scentlog: { n: '향기 측정 기록', price: 0, cat: 'key', icon: 'book', desc: '온실 감독이 숨겼던 향기 측정 기록. 양액 장비가 꽃을 지나치게 자극했다는 증거다.' },
    corepart: { n: '온실 핵심 부품', price: 0, cat: 'key', icon: 'part', desc: '유리온실 관개 장치의 핵심 부품. 제자리에 돌려놓으면 물이 정상으로 돈다.' },
    recommend2: { n: '파도타기 강습 추천서', price: 0, cat: 'key', icon: 'letter', desc: '관장 윤슬의 추천서. 돛바람항 해양학교에서 파도타기 강습을 받을 수 있다.' },
    seaboard: { n: '해상 안정판', price: 0, cat: 'key', icon: 'boardItem', desc: '해양학교의 해상 안정판. 파도타기를 익힌 동료와 함께 허용된 바다 항로를 건넌다.' },
    brazierpart: { n: '화로 부품', price: 0, cat: 'key', icon: 'part', desc: '공용 화로를 고치는 데 쓰는 고정 부품.' },
    map04: { n: '돛바람 항만 안내도', price: 0, cat: 'key', icon: 'mapItem', map: 'MAP04', desc: '항만소의 안내도. 공방·항만소·등대·관측 데크와 걸은 골목이 표시된다.' },
    map05: { n: '바람등성이 탐굴도', price: 0, cat: 'key', icon: 'mapItem', map: 'MAP05', desc: '공방 탐굴사의 개략도. 산길 방향과 터널 입구, 대피소만 그려져 있다.' },
    map06: { n: '복원한 옛길 지도', price: 0, cat: 'key', icon: 'mapItem', map: 'MAP06', desc: '울림당 기록과 표지를 대조해 되살린 옛길 지도. 북쪽 보행길과 큰 지형이 드러난다.' },
    map07: { n: '온실 수로 관리도', price: 0, cat: 'key', icon: 'mapItem', map: 'MAP07', desc: '약초사 미루의 관리도. 공공 입구와 화단 이름, 조사할 밸브 구역이 표시되어 있다.' },
    map08: { n: '외해 안전 항로도', price: 0, cat: 'key', icon: 'mapItem', map: 'MAP08', desc: '해양학교의 항로도. 안전 항로와 부표, 공공 선착장만 표시되어 있다.' },
    drainpart: { n: '배수 부품', price: 0, cat: 'key', icon: 'part', desc: '상회 작업자가 배수로를 메울 때 빼 둔 부품. 터널 지하의 배수 홈에 다시 끼우면 물이 빠진다.' },
    tidelog: { n: '조수 관측 기록', price: 0, cat: 'key', icon: 'book', desc: '관측 데크 세 곳의 물높이 표식을 옮겨 적은 기록. 조수연구소의 유라에게 전하자.' },
    // ---- chapter 3 (key items: never sold or thrown away)
    map09: { n: '해무군도 안내도', price: 0, cat: 'key', icon: 'mapItem', map: 'MAP09', desc: '구조대장 가온의 안내도. 공공 부두와 해무나루, 해안의 큰 윤곽만 그려져 있고 걸은 길이 더해진다.' },
    map10: { n: '너울잠굴 안전도', price: 0, cat: 'key', icon: 'mapItem', map: 'MAP10', desc: '가온이 동굴에 들어가기 전에 건넨 안전도. 입구와 안전 발판, 대피 지점의 개략만 그려져 있다.' },
    map11: { n: '푸른숨 정화 안내도', price: 0, cat: 'key', icon: 'mapItem', map: 'MAP11', desc: '정화사 은서의 안내도. 공공 시설과 취수구 구역 이름, 대피소가 표시되어 있다.' },
    map12: { n: '굽이강 운송도', price: 0, cat: 'key', icon: 'mapItem', map: 'MAP12', desc: '운송원 담소의 운송도. 허용 급류와 공공 하선점, 운송도시의 개략만 그려져 있다.' },
    protkit: { n: '정화소 보호 장비', price: 0, cat: 'key', icon: 'part', desc: '은서가 빌려준 장갑·덧신·마스크. 가방에 있으면 정화소에서 저절로 쓴다. 독 동료나 해독제가 없어도 괜찮다.' },
    permit10: { n: '정화소 작업 허가증', price: 0, cat: 'key', icon: 'letter', desc: '푸른숨 정화소 아래 침전수로에 들어갈 수 있는 작업 허가증.' },
    maint: { n: '누락된 정비표', price: 0, cat: 'key', icon: 'book', desc: '정화소 감독이 빼 두었던 정비표. 증폭 장비의 제조 번호와 줄어든 정비 주기가 적혀 있다.' },
    bridle: { n: '물판 고정끈', price: 0, cat: 'key', icon: 'boardItem', desc: '급류 강습에서 받은 고정끈. 물판에 걸면 표식이 있는 급류 띠를 건널 수 있다. 폭포는 아직 무리다.' },
    slip3: { n: '강 운송표', price: 0, cat: 'key', icon: 'letter', desc: '운송원 담소가 맡긴 운송표. 굽이강 위쪽 강굽이 쉼터에 전해 달라고 했다.' },
    permit11: { n: '배차소 열람 허가증', price: 0, cat: 'key', icon: 'letter', desc: '운송조합이 내준 허가증. 옛 배차소의 안전 통로와 기록을 열람할 수 있다.' },
    evid3: { n: '장부 대조 사본', price: 0, cat: 'key', icon: 'book', desc: '출하 장부·검사 도장·교체 이력을 대조한 사본. 원본은 조합이 보관하고, 본부 승인 번호가 적혀 있다.' },
    harness: { n: '적재 하네스', price: 0, cat: 'key', icon: 'part', desc: '괴력운반 수업에서 받은 하네스. 동료가 큰 운반석을 들 때 몸을 다치지 않게 받쳐 준다.' },
    letter3: { n: '짧은 편지', price: 0, cat: 'key', icon: 'letter', desc: '해무나루 우편 담당 누리가 맡긴 편지. 돌바퀴시 적재장에서 일하는 가족에게 전하자.' },
    reply3: { n: '답장', price: 0, cat: 'key', icon: 'letter', desc: '돌바퀴시 적재장에서 받은 답장. 해무나루의 누리에게 돌려주자.' },
    candy: { n: '도깨비 사탕', price: 0, cat: 'secret', lvup: true, icon: 'candy', desc: '도깨비가 몰래 숨겨 둔 알사탕. 먹은 몬스터의 레벨이 1 오른다.' }
  };
  D.CANDY_MAX = 99;

  // who can be taught a 교본 (TM): by type, plus a few hand-picked lines
  D.TM_FOR = {
    rockguard: id => { const t = D.MONS[id].t; return t.includes('바위') || t.includes('땅') || ['bulguri', 'hwaguri', 'hwasan', 'kongju', 'dudeumong', 'gasito', 'deombulto', 'gasiboru', 'ppultori', 'ppuldajim', 'sanppul', 'deuldori', 'beotimgom', 'sanbatgom', 'gasijam'].includes(id); },
    pulse: id => { const t = D.MONS[id].t; return t.includes('물') || ['dorekong', 'ullimpong', 'dalmojji', 'dalpogeun'].includes(id); },
    bodyslam: id => { const t = D.MONS[id].t; return t.includes('노말') || t.includes('격투') || ['daram', 'daramsup', 'sumaek', 'bulguri', 'hwaguri', 'hwasan', 'muldal', 'padodal', 'neoul', 'yongsot', 'dungjami', 'neugeutduk'].includes(id); },
    rockslide: id => { const t = D.MONS[id].t; return t.includes('바위') || t.includes('땅') || t.includes('격투') || ['bulguri', 'hwaguri', 'hwasan'].includes(id); },
    chargeguard: id => { const t = D.MONS[id].t; return t.includes('전기') || t.includes('강철'); },
    refresh: () => true,
    scentveil: id => D.MONS[id].t.includes('풀'),
    sludge: id => D.MONS[id].t.includes('독'),
    quake: id => { const t = D.MONS[id].t; return t.includes('땅') || t.includes('바위') || ['bulguri', 'hwaguri', 'hwasan', 'deuldori', 'beotimgom', 'sanbatgom', 'dudeumong'].includes(id); }
  };
  D.canTM = (mon, mv) => !!(D.TM_FOR[mv] && D.TM_FOR[mv](mon.id));

  // ------------------------------------------------------------ encounters: [species, minLv, maxLv, weight]
  D.ENC_RATE = 0.11;
  D.ENC_RATE_CAVE = 0.07;
  // one table per region, same by day and night (time of day changes the mood, never who you can meet)
  const tbl = (lv, slots) => { const l = slots.map(([id, w]) => [id, lv[0], lv[1], w]); return { day: l, night: l }; };
  const both = t => ({ 1: t, 2: t });
  const E01 = tbl([2, 4], [['jjaek', 60], ['jwi', 40]]);
  const E02 = tbl([3, 6], [['jwi', 45], ['kongju', 40], ['jjoreu', 15]]);
  const E03 = tbl([4, 7], [['kkomul', 40], ['ttakkom', 35], ['jjaek', 20], ['jjirikong', 5]]);
  const E04 = tbl([5, 8], [['kkomul', 30], ['ttakkom', 25], ['gochi', 15], ['gasijam', 15], ['jwi', 10], ['jjirikong', 5]]);
  const E05 = tbl([8, 11], [['jjaek', 25], ['jjoreu', 20], ['gasito', 20], ['ppultori', 20], ['dorekong', 15]]);
  const E06 = tbl([10, 13], [['gwibami', 55], ['jagalkong', 35], ['gyundeung', 10]]);
  const E07 = tbl([10, 14], [['gwibami', 40], ['jagalkong', 35], ['gyundeung', 20], ['dalmojji', 5]]);
  const E08 = tbl([12, 15], [['ttoari', 30], ['moraekong', 30], ['jjoreu', 25], ['ppultori', 15]]);
  const E09 = tbl([13, 17], [['ipppuri', 35], ['jjaek', 25], ['napul', 20], ['kkumdochi', 15], ['gochi', 5]]);
  const E10 = tbl([13, 17], [['bangulssak', 35], ['jjaek', 25], ['dorekong', 20], ['jwi', 15], ['kkumdochi', 5]]);
  const E12 = tbl([17, 21], [['meongburi', 30], ['mulkkori', 25], ['dungjami', 20], ['kkubeokyang', 15], ['dorekong', 10]]);
  const E13 = tbl([19, 23], [['jumeonyang', 40], ['bulbari', 25], ['jjoreu', 20], ['kkubeokyang', 15]]);
  const E14 = tbl([18, 22], [['byeolbangul', 55], ['deungbulhaepa', 45]]);
  const E15 = tbl([20, 24], [['heukkori', 45], ['deuldori', 25], ['jagalkong', 20], ['gwibami', 10]]);
  const E16 = tbl([22, 26], [['tokguri', 55], ['nachimdol', 35], ['jjirikong', 10]]);
  const E17 = tbl([25, 29], [['yeoubul', 35], ['bulbari', 25], ['deuldori', 20], ['jjoreu', 20]]);
  const E18 = tbl([26, 30], [['gwibami', 35], ['jagalkong', 30], ['heukkori', 20], ['deuldori', 10], ['dolgubi', 5]]);
  const E19 = tbl([27, 31], [['sumsom', 65], ['kkubeokyang', 20], ['gwibami', 15]]);
  const E20 = tbl([28, 32], [['yeoubul', 30], ['bulbari', 20], ['ipppuri', 25], ['bangulssak', 25]]);
  const E21 = tbl([29, 33], [['ipppuri', 30], ['bangulssak', 30], ['gyundeung', 25], ['napul', 15]]);
  const E23 = tbl([30, 35], [['deungbulhaepa', 45], ['byeolbangul', 30], ['meongburi', 15], ['muljjori', 10]]);
  // ---- chapter 3 (world-data C3E01-C3E12)
  const C301 = tbl([31, 34], [['pomal', 45], ['deungbulhaepa', 25], ['byeolbangul', 20], ['silhaema', 10]]);    // R13 sea
  const C302 = tbl([31, 34], [['chalkakge', 35], ['moraekkom', 35], ['pomal', 20], ['meongburi', 10]]);       // R13 shore
  const C303 = tbl([32, 35], [['moraekkom', 45], ['chalkakge', 25], ['byeolbangul', 20], ['pomal', 10]]);     // D09 pool
  const C304 = tbl([32, 35], [['gwibami', 35], ['jagalkong', 30], ['heukkori', 20], ['moraekkom', 15]]);      // D09 raised path
  const C305 = tbl([33, 36], [['moraekong', 30], ['yeoubul', 25], ['ipppuri', 25], ['huugi', 20]]);           // R14 grass
  const C306 = tbl([35, 38], [['jindeugi', 45], ['huugi', 30], ['heukkori', 15], ['nachimdol', 10]]);         // D10 inspection basin
  const C307 = tbl([33, 36], [['pomal', 30], ['silhaema', 25], ['deungbulhaepa', 25], ['chalkakge', 20]]);    // M08 quayside (look into the pool)
  const C308 = tbl([37, 40], [['silhaema', 40], ['pomal', 25], ['meongburi', 20], ['deungbulhaepa', 15]]);   // R15 current
  const C309 = tbl([37, 40], [['chalkakge', 40], ['heukkori', 25], ['deuldori', 20], ['huugi', 15]]);        // R16 grass
  const C310 = tbl([39, 42], [['nachimdol', 35], ['tokguri', 25], ['jagalkong', 25], ['jindeugi', 15]]);     // D11 yard
  const C311 = tbl([40, 43], [['moraekong', 30], ['deuldori', 25], ['bulbari', 25], ['jindeugi', 20]]);      // R17 grass
  D.ENC = {
    route1: both(E01),      // R01 햇살들판
    westpath: both(E02),    // R02 서쪽 돌담길
    leafshade: both(E03),   // R03 잎그늘길
    forest: both(E04),      // D01 이슬숲
    songfield: both(E05),   // R04 노래초원
    cave1: both(E06),       // D02 달숨동굴 입구층
    cave4: both(E06),
    cave2: both(E07),       // D02 반향층·달빛방
    moonroom: both(E07),
    echoroom: both(E07),
    cave3: both(E07),
    sandwind: both(E08),    // R05 모래바람길
    mistwalk: { 1: E09, 2: E10 },  // R06 물안개 산책길: 그늘 풀숲 / 양지 물가 풀숲
    // ---- chapter 2
    reedford: both(E12),    // R07 갈대여울
    backfield: both(E13),   // R08 항구 뒤 들길
    tidedeck: { pool: E14 },  // R09 조수만 웅덩이 (look into a pool)
    oldmine: both(E15),     // D04 옛 운송 갱도
    lh1: both(E16), lh2: both(E16), lh3: both(E16),   // D05 등대 동력실
    ridge: both(E17),       // R10 바람등성이
    tn1: both(E18), tn2: both(E18), tn3: both(E18),   // D06 바위울림터널
    echohall: both(E19),    // D08 울림당 회랑
    gardenroad: both(E20),  // R11 햇꽃정원길
    greenhouse: both(E21),  // D07 유리온실
    searoute: { sea: E23 },  // R12 다음 해안 항로
    // ---- chapter 3
    r13: { sea: C301, 2: C302 },          // R13 흰부표 해로: bay sea / beach grass
    nw1: { 1: C304, pool: C303 }, nw2: { 1: C304, pool: C303 },   // D09 너울잠굴: raised floor / look into a pool
    r14: { 1: C305 },                     // R14 바닷솔길
    d10a: { 1: C306, pool: C306 }, d10b: { 1: C306, pool: C306 },  // D10 침전수로
    m08: { pool: C307 },                  // M08 푸른숨시: only at the quayside observation pool, by choice
    r15: { current: C308 },               // R15 굽이강: while riding the river
    r16: { 1: C309 },                     // R16 제방들길
    d11b: { 1: C310 },                    // D11 옛 배차소 마당
    r17: { 1: C311 }                      // R17 돌바퀴 언덕
  };
  // fishing from the marked mounds: E11 with the first rod (물쫄이 only), E22 with the waterside rod (물가낚싯대)
  D.FISH = { camp: [['muljjori', 5, 10, 100]],
    reedford: [['muljjori', 14, 18, 60], ['mulkkori', 15, 18, 40]], harbor: [['muljjori', 15, 19, 55], ['meongburi', 16, 19, 45]],
    rod2: [['byeolbangul', 18, 24, 20], ['mulkkori', 18, 24, 25], ['meongburi', 18, 24, 25], ['dungjami', 18, 24, 20], ['muljjori', 18, 24, 10]] };
  // chapter 3 shores fish from their own lists with either rod (C3E12 for the bay)
  const C312 = [['moraekkom', 32, 36, 25], ['chalkakge', 32, 36, 25], ['silhaema', 32, 36, 30], ['pomal', 32, 36, 20]];
  D.FISH3 = { r13: C312, m07: C312, m08: C312, r16: [['silhaema', 37, 40, 40], ['meongburi', 37, 40, 30], ['chalkakge', 37, 40, 30]] };
  D.rollFishing = mapId => {
    const list = D.FISH3[mapId] || ((G.S.bag.rod2 && mapId !== 'camp') ? D.FISH.rod2 : (D.FISH[mapId] || D.FISH.camp));
    let r = G.rand() * list.reduce((t, e) => t + e[3], 0);
    for (const e of list) { r -= e[3]; if (r <= 0) return { id: e[0], lv: G.ri(e[1], e[2]) }; }
    return { id: list[0][0], lv: list[0][1] };
  };
  D.rollEncounter = (mapId, zone) => {
    const z = D.ENC[mapId] && D.ENC[mapId][zone];
    if (!z) return null;
    const list = G.isNight() ? z.night : z.day;
    let tot = list.reduce((s, e) => s + e[3], 0), r = G.rand() * tot;
    for (const e of list) { r -= e[3]; if (r <= 0) return { id: e[0], lv: G.ri(e[1], e[2]) }; }
    const e = list[0];
    return { id: e[0], lv: e[1] };
  };

  // ------------------------------------------------------------ monster helpers
  D.expFor = lv => lv <= 1 ? 0 : lv * lv * lv;
  D.stats = mon => {
    const s = D.MONS[mon.id], b = s.b, L = mon.lv, iv = mon.iv;
    const f = i => Math.floor((2 * b[i] + iv[i]) * L / 100) + 5;
    return { hp: Math.floor((2 * b[0] + iv[0]) * L / 100) + L + 10, atk: f(1), def: f(2), spa: f(3), spd: f(4), spe: f(5) };
  };
  D.movesAt = (id, lv) => {
    const list = [];
    for (const [l, m] of D.MONS[id].learn) {
      if (l > lv) break;
      if (!list.includes(m)) list.push(m);
    }
    return list.slice(-4);
  };
  let uidSeq = Date.now() % 100000;
  D.makeMon = (id, lv, o) => {
    o = o || {};
    const iv = o.iv || [0, 0, 0, 0, 0, 0].map(() => G.ri(o.ivMin || 0, 15));
    const m = { id, lv, exp: D.expFor(lv), iv, status: null, moves: [], uid: ++uidSeq };
    m.moves = (o.moves || D.movesAt(id, lv)).map(mid => ({ id: mid, pp: D.MOVES[mid].pp }));
    m.hp = D.stats(m).hp;
    return m;
  };
  D.nameOf = mon => mon.nick || D.MONS[mon.id].n;
  D.healMon = mon => { mon.hp = D.stats(mon).hp; mon.status = null; mon.moves.forEach(mv => mv.pp = D.MOVES[mv.id].pp); };
  D.healParty = () => G.S.party.forEach(D.healMon);
  D.partyAlive = () => G.S.party.some(m => m.hp > 0);
  D.addItem = (id, n) => { G.S.bag[id] = (G.S.bag[id] || 0) + (n || 1); };
  D.useItem = id => { if (G.S.bag[id] > 0) { G.S.bag[id]--; if (!G.S.bag[id]) delete G.S.bag[id]; return true; } return false; };
  D.seen = id => { G.S.dex.seen[id] = 1; };
  D.caught = id => { G.S.dex.seen[id] = 1; G.S.dex.caught[id] = 1; };
  D.dexCount = () => Object.keys(G.S.dex.caught).filter(k => D.MONS[k] && !D.MONS[k].hidden).length;
  // add a caught monster: party, else storage box
  D.receive = mon => {
    D.caught(mon.id);
    if (G.S.party.length < 6) { G.S.party.push(mon); return 'party'; }
    G.S.box.push(mon);
    return 'box';
  };
})();
