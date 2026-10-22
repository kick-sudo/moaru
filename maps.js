/* 모아루: 잠든 길의 노래 — chapter 1 world, part 1: 이슬마을 → 햇살들판 → 바람나루 → 서쪽 돌담길 → 잎그늘길
   plus shared helpers, interiors and the chapter data used by the notebook and the map */
'use strict';
(function () {
  const G = window.G;
  const M = G.MAPS = {};
  const Wd = () => G.world;
  const D = () => G.data;
  const F = () => G.field;
  const flag = k => !!(G.S && G.S.flags[k]);
  const set = (k, v) => { G.S.flags[k] = v === undefined ? 1 : v; };
  const say = (t, name) => G.say(t, name ? { name } : undefined);
  const P = () => G.S.name;
  const give = async (id, n, quiet) => {
    // gear the skills spell already put in the bag (G.S.spellGear): the lesson hands over "that one", no second copy
    const sg = G.S.spellGear, pre = sg && sg.includes(id) && G.S.bag[id] > 0;
    if (pre) G.S.spellGear = sg.filter(k => k !== id); else D().addItem(id, n || 1);
    G.audio && G.audio.sfx('item');
    if (!quiet) await say(`${P()}${G.josa(P(), '은', '는')} ${D().ITEMS[id].n}${(n || 1) > 1 ? ' ' + n + '개' : ''}${G.josa(D().ITEMS[id].n, '을', '를')} 받았다!`);
  };
  const STARTERS = { daram: 'bulguri', bulguri: 'muldal', muldal: 'daram' };   // the rival takes the one strong against yours
  const H = G.mapHelpers = { flag, set, say, give, P, STARTERS };

  // ------------------------------------------------------------ shared interiors
  H.center = (id, town, exitMap, ex, ey) => {
    M[id] = {
      name: town + ' 몬스터센터', kind: 'in', floor: '_', bgm: 'town', heal: [6, 3],
      rows: ['#W########W#', 'p..HH......P', '...cccccc...', '____________', '____________', '____________', '_p________p_', '_____xx_____'],
      warps: [{ x: 5, y: 7, to: exitMap, tx: ex, ty: ey, dir: 'down' }, { x: 6, y: 7, to: exitMap, tx: ex + 1, ty: ey, dir: 'down' }],
      npcs: [
        { id: 'nurse', char: 'nurse', x: 6, y: 1, dir: 'down', name: '간호사', noTurn: true,
          talk: async () => {
            const ok = await G.ask('몬스터센터에 어서 오세요!\n몬스터를 쉬게 해 드릴까요?', ['쉬게 해 주세요', '괜찮아요'], { name: '간호사' });
            if (!ok) { await say('언제든 무료로 쉬어 가세요!', '간호사'); return; }
            await say('그럼 몬스터들을 잠시 맡을게요.', '간호사');
            await G.menus.heal();
            await say('기다리셨죠! 맡겨 주신 몬스터들은 모두 건강해졌어요.\n또 들러 주세요!', '간호사');
          } },
        { id: 'tutor', char: 'harang', x: 2, y: 1, dir: 'down', name: '길지기 상담원', noTurn: true,
          talk: async () => {
            await say('길지기 상담 창구예요. 잊어버린 기술 복습과,\n익힌 탐험 기술을 다른 동료에게 가르치는 일을 무료로 도와드려요.', '길지기 상담원');
            await F().centerService('길지기 상담원');
          } },
        { id: 'cn1', char: 'man', x: 9, y: 4, dir: 'left', move: 'wander', name: '여행자',
          text: '구석의 컴퓨터로 몬스터 보관함을 쓸 수 있어.\n보관함에 있는 동료도 탐험 기술을 익혔다면 불러서 도움을 받을 수 있대.' }]
    };
  };
  H.shop = (id, town, exitMap, ex, ey, stock) => {
    M[id] = {
      name: town + ' 상점', kind: 'in', floor: '_', bgm: 'town',
      rows: ['#W######W#', 'BB.....BBB', '.c........', '.c........', '.........p', 'p.........', '....x.....'],
      warps: [{ x: 4, y: 6, to: exitMap, tx: ex, ty: ey, dir: 'down' }],
      npcs: [{ id: 'clerk', char: 'clerk', x: 0, y: 2, dir: 'right', name: '점원', noTurn: true,
        talk: async () => { await say('어서 오세요! 무엇을 찾으세요?', '점원'); await G.menus.shop(stock()); await say('감사합니다! 또 오세요!', '점원'); } }]
    };
  };
  H.house = (id, town, exitMap, ex, ey, npcs) => {
    M[id] = {
      name: town, kind: 'in', bgm: 'town',
      rows: ['#W####W#', 'B.v..kkp', '........', '..tt....', '..tt....', '........', '...x....'],
      warps: [{ x: 3, y: 6, to: exitMap, tx: ex, ty: ey, dir: 'down' }],
      npcs
    };
  };
  const STOCK1 = () => ['potion', 'antidote', 'parlyz', 'awake', 'cube'].concat(flag('badge1') ? ['superpotion', 'goldcube', 'rope'] : []).concat(flag('badge2') ? ['revive'] : []);
  H.STOCK1 = STOCK1;

  // the three starters play in front of the lab; talking to one (after meeting the professor) picks it
  const STARTER_INFO = {
    daram: { act: 'sniff', line: '모스코가 꽃향기를 킁킁 맡고 있다.', desc: '풀 타입 모스코. 잎사귀 앞머리를 가진 아기 맥이야. 순하고 호기심이 많지.' },
    bulguri: { act: 'hop', line: '탄뿔이 바위 위에서 폴짝폴짝 뛰고 있다.', desc: '불 타입 탄뿔. 숯빛 털과 불씨 뿔을 가진 아기 산양이야. 자신만만한 장난꾸러기지.' },
    muldal: { act: 'splash', line: '방울뚱이 물가에서 첨벙거리고 있다.', desc: '물 타입 방울뚱. 이마에 물방울을 얹은 짱뚱어야. 뚱해 보여도 정이 많아.' }
  };
  async function pickStarter(id) {
    if (flag('starter')) return;
    const info = STARTER_INFO[id], sp = D().MONS[id];
    G.audio && G.audio.cry(id);
    if (!flag('prof_talk')) { await say(info.line + '\n(먼저 연구소의 연우 박사님께 인사하자)'); return; }
    const show = { modal: false, drawTop: T => {
      G.menus.topCard(T, '함께할 첫 동료');
      G.box(T, 66, 26, 124, 104, G.STYLE.white, 6);
      G.menus.drawCard(T, id, 66, 22, 124, 90);
      G.textC(T, sp.n, 128, 100, '#2c2f45', null);
      G.menus.typeBadge(T, sp.t[0], 128 - 12, 114);
    } };
    G.pushLayer(show);
    const ok = await G.ask(info.desc + `\n${G.wa(sp.n)} 함께 갈까?`, ['이 친구로 할래!', '다른 친구도 볼래']);
    G.popLayer(show);
    if (!ok) return;
    set('starter', id);
    const mon = D().makeMon(id, 5, { ivMin: 8 });
    D().receive(mon);
    G.audio && G.audio.jingle('catch');
    await say(`${G.iga(sp.n)} ${P()}의 곁으로 다가왔다!\n${P()}${G.josa(P(), '은', '는')} ${G.wa(sp.n)} 함께 가기로 했다!`);
    Wd().respawn();
    await rivalPractice();
  }
  async function rivalPractice() {
    const W = Wd();
    const rid = STARTERS[G.S.flags.starter];
    await G.wait(20);
    G.audio && G.audio.sfx('alert');
    await say(`잠깐, ${P()}! 나도 방금 박사님 허락 받았어!\n그럼 나는... 이 친구로 할게!`, '도윤');
    G.audio && G.audio.cry(rid);
    await say(`도윤은 ${G.eul(D().MONS[rid].n)} 데려왔다!`);
    await say('우리 둘 다 견습 길지기잖아. 첫 연습 승부, 어때?', '도윤');
    const won = await G.battle.trainer({ flag: 'rival0', title: '견습 길지기', name: '도윤', char: 'rival', team: [[rid, 5]], prize: 300, noBlackout: true,
      lose: '와, 첫 승부부터 지다니! 너희 둘 호흡이 좋은데?' });
    set('rival0');
    if (!won) await say('헤헤, 이번엔 내가 이겼다! 몬스터는 금방 기운을 차릴 거야.', '도윤');
    D().healParty();
    await say('박사님이 연구소에서 기다리셔. 같이 보고하러 가자!', '도윤');
    set('rival_wait');
    W.respawn();
  }

  // ------------------------------------------------------------ M00 이슬마을
  M.town1 = {
    name: '이슬마을', kind: 'out', bgm: 'town',
    rows: [
      'TTTTTTTTT==TTTTTTTTT',
      'TT.F.....==.....F.TT',
      'TT#####..==.######TT',
      'TT#####..==.######TT',
      'TT#####..==.######TT',
      'TT##D##..==.###D##TT',
      'TT..=....==....=..TT',
      'TT..===========...TT',
      'TTy.b....=.....S..TT',
      'TT.......=..#####.TT',
      'TTb.b....=..#####.TT',
      'TT.......=..#####.TT',
      'TTb.y....=..##D##.TT',
      'TT.......=....=...TT',
      'TT..F....======.F.TT',
      'TT.r.....dS.......TT',
      'TTwwwwwwwdwwwwwwwwTT',
      'TTwwwwwwwwwwww..wwTT',
      'TTwwwwwwwwwwww..wwTT',
      'TTwwwwwwwwwwwwwwwwTT',
      'TTTTTTTTTTTTTTTTTTTT'],
    buildings: [
      { k: 'house', x: 2, y: 2, w: 5, h: 4, roof: 'red' },
      { k: 'lab', x: 12, y: 2, w: 6, h: 4, roof: 'navy', wall: '#f8f6f0', label: '길지기 연구소' },
      { k: 'house', x: 12, y: 9, w: 5, h: 4, roof: 'green' }],
    warps: [
      { x: 4, y: 5, to: 'home', tx: 4, ty: 6, dir: 'up' },
      { x: 15, y: 5, to: 'lab', tx: 5, ty: 8, dir: 'up' },
      { x: 14, y: 12, to: 'house1', tx: 3, ty: 5, dir: 'up' }],
    links: { n: { to: 'route1', dx: -4 } },
    signNotes: { '10,15': 'town1:lake' },
    signs: {
      '15,8': '이슬마을\n이슬이 맺히는 과수원 마을',
      '10,15': '이슬 호수 선착장\n잔잔한 물을 건너는 법(잔물타기)을 익히면 호수 가운데 작은 섬에 가 볼 수 있다.'
    },
    items: [{ id: 'chargestone', x: 15, y: 17, flag: 'rv_island' }],
    npcs: [
      { id: 's_daram', mon: 'daram', act: 'sniff', x: 9, y: 8, dir: 'left', cond: () => !flag('starter') || (G.S.flags.starter !== 'daram' && STARTERS[G.S.flags.starter] !== 'daram' && !flag('rival_wait') && !flag('q00')), talk: () => pickStarter('daram') },
      { id: 's_bulguri', mon: 'bulguri', act: 'hop', x: 17, y: 7, dir: 'left', cond: () => !flag('starter') || (G.S.flags.starter !== 'bulguri' && STARTERS[G.S.flags.starter] !== 'bulguri' && !flag('rival_wait') && !flag('q00')), talk: () => pickStarter('bulguri') },
      { id: 's_muldal', mon: 'muldal', act: 'splash', x: 5, y: 15, dir: 'down', cond: () => !flag('starter') || (G.S.flags.starter !== 'muldal' && STARTERS[G.S.flags.starter] !== 'muldal' && !flag('rival_wait') && !flag('q00')), talk: () => pickStarter('muldal') },
      { id: 'rival', char: 'rival', x: 12, y: 7, dir: 'down', cond: () => flag('rival_wait') && !flag('q00'), name: '도윤',
        text: '박사님께 같이 보고하러 가자! 연구소는 바로 저기야.' },
      { id: 'guide', char: 'man', x: 11, y: 1, dir: 'down', name: '길목 안내원',
        text: () => !flag('q00') ? '첫 동료도 없이 풀숲에 들어가면 위험해.\n연구소의 연우 박사님께 먼저 가 보렴.' : !flag('q01') ? '조사 수첩을 바람나루로 가져간다고? 북쪽 햇살들판을 지나면 바로야.\n지치면 바람나루 몬스터센터에서 무료로 쉴 수 있단다.' : '길지기가 됐다며? 이슬마을 자랑이구나!' },
      { id: 'tlady', char: 'woman', x: 7, y: 11, dir: 'right', move: 'wander', name: '과수원 아주머니',
        text: () => flag('q10') ? '호수 섬에 다녀왔다고? 거기 반짝이는 돌이 있다는 소문이 진짜였구나!' : '이 과수원 나무에 회복열매가 열린단다. 하루에 한 번씩 따 가렴.\n저 호수 가운데 섬엔 반짝이는 돌이 있다던데... 건너갈 방법이 없네.' },
      { id: 'tkid', char: 'kidA', x: 16, y: 13, dir: 'left', move: 'wander', name: '꼬마',
        text: '야생 몬스터랑 싸우다가 위험하면 도망쳐도 돼!\n전투 화면에서 [도망]을 누르면 대부분 빠져나올 수 있어.' }],
    triggers: [
      { x: 9, y: 1, w: 2, h: 1, cond: () => !flag('q00'), run: async () => {
        await say('잠깐! 몬스터 없이 풀숲에 들어가면 위험해.\n연구소의 연우 박사님께 먼저 가 보렴.', '길목 안내원');
        await Wd().walk(Wd().player, 'down', 1);
      } },
    ],
    onEnter: async () => {
      G.S.visited = G.S.visited || {}; G.S.visited.iseul = 1;
      const p = Wd().player;
      if (!flag('bird_seen') && p.x === 4 && p.y === 6) {
        set('bird_seen');
        await G.wait(16);
        G.audio && G.audio.cry('jjaek');
        await G.field.play(70, (T, cx, cy, k) => {
          const mini = G.mons.mini('jjaek').right;
          const x = 4 * 16 + 20 + k * 120, y = 6 * 16 + 4 - k * 70 - Math.sin(k * 18) * 3;
          T.drawImage(mini, Math.round(x - cx), Math.round(y - cy));
        });
        await say('작은 새 한 마리가 집 앞에서 포르르 날아올랐다.\n오늘은 왠지 먼 곳까지 가 볼 수 있을 것 같은 날이다.');
      }
    }
  };
  M.home = {
    name: '우리 집', kind: 'in', bgm: 'town',
    rows: ['#W##W##W##', 'BB.v...kkp', '..........', '...tt.....', '...tt.....', 'rr........', '....x.....'],
    warps: [{ x: 4, y: 6, to: 'town1', tx: 4, ty: 6, dir: 'down' }],
    heal: [6, 4],
    npcs: [{ id: 'mom', char: 'mom', x: 6, y: 3, dir: 'left', name: '엄마',
      talk: async () => {
        if (!flag('starter')) { await say(`${P()}, 일어났구나! 연우 박사님이 찾으셨어.\n오늘부터 연구소 견습 조사원이잖니. 어서 가 보렴!`, '엄마'); return; }
        if (!flag('q01')) await say('바람나루까지 혼자 간다고? 기특하구나.\n힘들면 언제든 집에 와서 쉬렴.', '엄마');
        else await say('길지기가 됐다며! 엄마는 네가 정말 자랑스러워.', '엄마');
        await G.menus.heal();
        await say('자, 다들 기운을 차렸단다. 몸조심해!', '엄마');
      } }]
  };
  H.house('house1', '이슬마을', 'town1', 14, 13, [{ id: 'gran', char: 'elder', x: 5, y: 3, dir: 'down', name: '할머니',
    talk: async () => {
      if (!flag('starter')) { await say('옆집 아이구나. 오늘 연구소에 첫 출근한다지?', '할머니'); return; }
      if (!flag('gift_berry')) { set('gift_berry'); await say('길을 떠나는구나. 할미가 과수원 열매를 좀 챙겨 주마.', '할머니'); await give('berry', 3); return; }
      await say('옛날엔 사람과 몬스터가 같이 닦은 길이 대륙 끝까지 이어져 있었단다.\n요즘은 그 길이 하나둘 끊긴다니 걱정이구나.', '할머니');
    } }]);

  // ------------------------------------------------------------ 길지기 연구소 (연우 박사)
  M.lab = {
    name: '길지기 연구소', kind: 'in', bgm: 'town',
    rows: ['#W###W###W##', 'BBBB.PP.BBBB', '............', '............', '...tttt.....', '............', 'BB........BB', '............', '.....xx.....'],
    warps: [{ x: 5, y: 8, to: 'town1', tx: 15, ty: 6, dir: 'down' }, { x: 6, y: 8, to: 'town1', tx: 15, ty: 6, dir: 'down' }],
    objects: {
      '3,4': async () => say('대륙 지도가 펼쳐져 있다. 끊긴 길마다 빨간 표시가 붙어 있다.'),
      '4,4': async () => say('"사람과 몬스터가 함께 만든 길" — 연우 박사의 연구 노트다.'),
      '5,4': async () => say('서식 기록 카드가 가지런히 정리되어 있다.'),
      '6,4': async () => say(flag('q10') ? '"이슬 호수 섬: 충전돌 확인. 찌리콩들이 섬 근처에서 쉬어 간다." 새로 적힌 기록이다.' : '공명석 표본이 유리병 안에서 희미하게 빛나고 있다.')
    },
    npcs: [
      { id: 'prof', char: 'prof', x: 8, y: 3, dir: 'down', name: '연우 박사',
        talk: async () => {
          const N = '연우 박사';
          if (!flag('prof_talk')) {
            await say(`왔구나, ${P()}! 오늘부터 길지기 연구소의 견습 조사원이지.`, N);
            await say('우리 연구소는 사람과 몬스터가 함께 다니던 옛길을 다시 잇는 일을 한단다.\n그 길을 걷고, 돌보는 사람을 길지기라고 부르지.', N);
            await say('길지기에게는 함께 걸을 동료가 꼭 필요해.\n연구소 앞에서 세 아이가 놀고 있단다. 마음이 가는 친구에게 말을 걸어 보렴.', N);
            set('prof_talk');
            return;
          }
          if (!flag('starter')) { await say('연구소 앞에 모스코, 탄뿔, 방울뚱이 있단다.\n천천히 보고 마음이 가는 친구를 골라 보렴.', N); return; }
          if (!flag('q00')) {
            await say('둘 다 첫 승부를 했다고? 하하, 좋은 시작이구나!', N);
            await say('자, 길지기의 첫 장비란다. 몬스터 도감과 탐험 수첩.\n수첩에는 할 일과 배운 탐험 기술, 조사한 길이 차곡차곡 기록될 거야.', N);
            await give('cube', 10, true); await give('potion', 3, true);
            G.S.money = Math.max(G.S.money, 1500);
            await say(`${P()}${G.josa(P(), '은', '는')} 몬스터 도감, 탐험 수첩, 큐브 10개, 상처약 3개를 받았다!\n(메뉴에서 [수첩]을 볼 수 있다)`);
            await say('지도는 아직 없단다. 길지기는 먼저 걸으면서 길을 익히지.\n북쪽으로 큰 나무와 울타리, 표지판을 따라가면 바람나루가 나온단다.', N);
            await say('그리고 첫 임무! 이 조사 수첩을 바람나루의 길지기 하람에게 전해 주렴.\n이슬마을의 서식 기록이 적혀 있단다. 북쪽 햇살들판을 지나면 바람나루야.', N);
            await give('notebook', 1);
            await say('몬스터가 지치면 몬스터센터에서 무료로 쉴 수 있고,\n야생 몬스터와의 승부는 [도망]으로 피할 수도 있단다. 무리하지 말고!', N);
            set('q00');
            await say('나는 먼저 서쪽 돌담길 쪽을 둘러보고 올게! 다음에 또 붙자, ' + P() + '!', '도윤');
            Wd().respawn();
            return;
          }
          if (flag('rv_island') && !flag('rv_island_told')) {
            set('rv_island_told');
            await say('호수 섬의 충전돌을 찾았다고? 그 섬은 찌리콩들이 천둥을 피해 쉬어 가는 곳이란다.\n물길이 열리니 이렇게 생태 기록이 하나 더 늘었구나. 고맙다!', N);
            return;
          }
          const n = D().dexCount();
          await say(n >= 15 ? `벌써 ${n}종이나 기록했구나! 몬스터가 어떻게 사는지 보는 눈이 생겼어.` : `지금까지 ${n}종을 기록했구나. 서식지를 하나씩 둘러보며 몬스터가 어떻게 사는지 살펴보렴.`, N);
        } },
      { id: 'rival', char: 'rival', x: 6, y: 6, dir: 'up', cond: () => flag('rival_wait') && !flag('q00'), name: '도윤',
        text: '박사님, 저희 둘 다 첫 승부까지 마쳤어요!' },
      { id: 'aide', char: 'woman', x: 9, y: 6, dir: 'left', move: 'wander', name: '연구원',
        text: () => flag('q01') ? '막힌 길을 조사하면 필요한 기술과 함께 수첩에 남아요.\n지도에는 직접 걸은 길이 하나씩 채워질 거예요.' : flag('q00') ? '지역 지도는 길지기 초소에서 받을 수 있어요. 바람나루의 하람 님께 여쭤 봐요.\n그 전까진 표지판이 제일 좋은 길잡이예요!' : '박사님은 길과 몬스터의 생태를 함께 연구하세요.' }]
  };

  // ------------------------------------------------------------ R01 햇살들판
  M.route1 = {
    name: '햇살들판', kind: 'out', bgm: 'route',
    rows: [
      'TTTTT==TTTTTTT',
      'TT...==...,,TT',
      'T,,..==..,,,,T',
      'T,,,.==..,,,,T',
      'T,,,.==...,,.T',
      'T....==......T',
      'T.bb.==.f....T',
      'T....==.f....T',
      'TLLLL==.LLLLLT',
      'T....==.....KT',
      'T,,,,,,,,,,..T',
      'T,,,,,,,,,,,.T',
      'T.,,,,,,,,,,.T',
      'T....==......T',
      'T.r..==..bb..T',
      'TT...==......T',
      'T.,,.==.,,,..T',
      'T,,,.==.,,,,.T',
      'T,,,.==..,,,.T',
      'T....==......T',
      'TLLL.==.LLLLLT',
      'T....==....TTT',
      'T.F..==...f..T',
      'T....==...f..T',
      'T,,,,==,,,V..T',
      'T,,,,==,,,f..T',
      'T..,.==.,,f..T',
      'T.S..==...fTTT',
      'TT...==....TTT',
      'TTTTT==TTTTTTT'],
    links: { s: { to: 'town1', dx: 4 }, n: { to: 'city', dx: 7 } },
    signs: { '2,27': '햇살들판\n↑ 바람나루   ↓ 이슬마을' },
    items: [{ id: 'potion', x: 7, y: 21, flag: 'r1_potion' }, { id: 'berry', n: 2, x: 12, y: 23, flag: 'r1_berry' }, { id: 'cube', n: 2, x: 12, y: 3, flag: 'r1_cube' }],
    npcs: [
      { id: 'somi', char: 'woman', x: 2, y: 26, dir: 'right', name: '길지기 선배 소미', cond: () => flag('q00'),
        talk: async () => {
          if (!flag('r1_demo')) { await captureDemo(); return; }
          await say('풀숲을 피해서 흙길로만 걸어도 바람나루까지 갈 수 있어.\n동료를 늘리고 싶을 때만 풀숲에 들어가 보렴.', '길지기 선배 소미');
        } },
      { id: 'minho', char: 'kidA', x: 9, y: 5, dir: 'left', sight: 3,
        trainer: { flag: 'tr_minho', title: '반바지 소년', name: '민호', char: 'kidA', team: [['jwi', 4]], base: 16,
          before: '눈 마주쳤지? 그럼 승부다!', lose: '으앗, 졌다! 내 볼도리 엄청 빠른데...', after: '볼도리는 볼주머니에 씨앗을 모아 숨긴대. 근데 숨긴 데를 맨날 까먹는대!' } },
      { id: 'jiwoo', char: 'kidB', x: 2, y: 15, dir: 'right', sight: 3,
        trainer: { flag: 'tr_jiwoo', title: '새 관찰 소녀', name: '지우', char: 'kidB', team: [['jjaek', 3], ['jjaek', 4]], base: 14,
          before: '살랑새는 날아오르기 전에 두 번 깡충 뛴대. 봤어?', lose: '살랑새들이 놀랐나 봐...', after: '살랑새는 진화하면 바람깃이 돼. 머리 깃털로 바람을 읽는대!' } }],
    triggers: [
      { x: 5, y: 27, w: 2, h: 1, cond: () => flag('q00') && !flag('r1_demo'), run: async () => { await captureDemo(); } }],
    onEnter: async () => { G.S.visited = G.S.visited || {}; G.S.visited.sunfield = 1; }
  };
  // 포획 시범: the senior pathkeeper's own companion does the work, no cube of yours is used
  async function captureDemo() {
    set('r1_demo');
    const N = '길지기 선배 소미';
    const W = Wd(), s = W.npc('somi');
    if (s) { s.emote = 30; W.facePlayer(s); }
    await say(`네가 연구소의 새 견습생 ${P()}구나! 나는 길지기 소미.\n몬스터를 동료로 맞는 법, 한 번 보여 줄게.`, N);
    const gx = 3, gy = 24;
    G.audio && G.audio.cry('jjaek');
    await G.field.play(36, (T, cx, cy, k) => { const m = G.mons.mini('jjaek').left; T.drawImage(m, gx * 16 + 2 - cx, gy * 16 - 6 - cy - Math.abs(Math.sin(k * 9)) * 3); });
    await say('저기 풀숲에 살랑새가 있지? 먼저 내 볼도리가 살살 지치게 만들고...', N);
    G.audio && G.audio.sfx('throw');
    await G.field.play(30, (T, cx, cy, k) => {
      const m = G.mons.mini('jjaek').left; T.drawImage(m, gx * 16 + 2 - cx, gy * 16 - 6 - cy);
      const x = 3 * 16 + 8 + (gx * 16 + 8 - 3 * 16 - 8) * k, y = 26 * 16 - Math.sin(k * Math.PI) * 30 + (gy - 26) * 16 * k;
      T.drawImage(G.art.cube, Math.round(x - 8 - cx), Math.round(y - 8 - cy));
    });
    G.audio && G.audio.sfx('pop');
    await G.field.play(54, (T, cx, cy, k) => { const wob = Math.sin(k * 30) * (k < 0.8 ? 2 : 0); T.drawImage(G.art.cube, Math.round(gx * 16 + wob - cx), gy * 16 - cy); });
    G.audio && G.audio.sfx('caught');
    await say('...이렇게 큐브를 던지면 돼! 힘이 빠졌거나 잠들었을 때 더 잘 담기지.', N);
    await say('이번엔 시범이었으니까 다시 풀어 줄게. 잘 가, 살랑새!', N);
    await G.field.play(40, (T, cx, cy, k) => { const m = G.mons.mini('jjaek').right; T.drawImage(m, Math.round(gx * 16 + k * 60 - cx), Math.round(gy * 16 - k * 50 - cy)); });
    await say('억지로 잡을 필요는 없어. 마음이 맞는 친구를 만나면 그때 던져 보렴!', N);
  }

  // ------------------------------------------------------------ M01 바람나루
  M.city = {
    name: '바람나루', kind: 'out', bgm: 'town',
    rows: [
      'TTTTTTTTTTTT==TTTTTTTTwwwTTTTT',
      'T.F.....F...==...F...TwwwT...T',
      'T.#####.....==.######.wwwT...T',
      'T.#####.....==.######.www####T',
      'T.#####..l..==.######.www####T',
      'T.##D##.....==.###D##.www####T',
      'T...=.......==....=...www##D#T',
      'T...========pp=====...www..=.T',
      'T..........pppp.......www..=FT',
      'T.######...pppp..P....dww..=.T',
      'T.######...pSpp.......ddw....T',
      'T.######...pppp.#####.www.F..T',
      'T.##DD##...pppp.#####.wwwTTTTT',
      '====..=====pppp.#####.wwwTTTTT',
      'T...........pp..##D##.wwwTTTTT',
      'T.F.........pp....=...wwwTTTTT',
      'T.bb..ff....pp..ff....wwwTTTTT',
      'T...........pp......K.wwwTTTTT',
      'T.F.........pp.....F..wwwTTTTT',
      'TTTTTTTTTTTT==TTTTTTTTwwwTTTTT'],
    buildings: [
      { k: 'house', x: 2, y: 2, w: 5, h: 4, roof: 'blue' },
      { k: 'house', x: 15, y: 2, w: 6, h: 4, roof: 'green', wall: '#f2ead6', label: '길지기 초소' },
      { k: 'house', x: 25, y: 3, w: 4, h: 4, roof: 'grey', wall: '#cfc4ac', label: '옛 창고' },
      { k: 'center', x: 2, y: 9, w: 6, h: 4, roof: 'red', wall: '#fbf6ee' },
      { k: 'shop', x: 16, y: 11, w: 5, h: 4, roof: 'blue', wall: '#f4f6fa' }],
    warps: [
      { x: 4, y: 5, to: 'house2', tx: 3, ty: 5, dir: 'up' },
      { x: 18, y: 5, to: 'post', tx: 4, ty: 6, dir: 'up' },
      { x: 27, y: 6, to: 'warehouse', tx: 3, ty: 5, dir: 'up' },
      { x: 4, y: 12, to: 'center_b', tx: 5, ty: 6, dir: 'up' },
      { x: 5, y: 12, to: 'center_b', tx: 6, ty: 6, dir: 'up' },
      { x: 18, y: 14, to: 'shop_b', tx: 4, ty: 5, dir: 'up' }],
    links: { s: { to: 'route1', dx: -7 }, n: { to: 'leafshade', dx: -3 }, w: { to: 'westpath', dy: -5 } },
    signs: { '12,10': '바람나루\n숲과 강이 만나는 나루터 마을' },
    npcs: [
      { id: 'cman', char: 'man', x: 9, y: 14, dir: 'down', name: '아저씨',
        text: () => flag('q09') ? '물울림 쪽 수문이 다시 열렸다더군. 강물도 한결 잔잔해졌어.' : '저 주황 깃발 보이지? 새길상회라는 데서 새 도로를 낸다고 붙였어.\n요즘 숲 쪽 몬스터들이 자꾸 마을로 내려오는 것도 그거랑 상관있으려나.' },
      { id: 'fisher', char: 'elder', x: 21, y: 9, dir: 'right', name: '나루 할아버지',
        talk: async () => {
          if (flag('rv_warehouse')) { await say('창고에 남은 옛길 지도를 찾았다고? 허허, 그 창고 주인이 길지기였지.', '나루 할아버지'); return; }
          F().note('city:warehouse');
          await say('강 건너 옛 창고는 다리가 무너진 뒤로 아무도 못 가 봤지.\n잔잔한 물길을 타는 법(잔물타기)을 익히면 건너가 볼 수 있을 게다.', '나루 할아버지');
        } },
      { id: 'ckid', char: 'kidA', x: 14, y: 17, dir: 'left', move: 'wander', name: '꼬마',
        text: '서쪽 돌담길엔 주먹을 꼭 쥔 콩주먹이 살아!\n쪼르딱은 자기보다 큰 상대한테도 먼저 소리를 지른대.' },
      { id: 'jwi_saved', mon: 'jwi', act: 'hop', x: 19, y: 6, dir: 'down', cond: () => flag('q02'),
        talk: async () => { G.audio && G.audio.cry('jwi'); await say('잎그늘길에서 구해 준 볼도리다.\n볼주머니에서 씨앗 하나를 꺼내 내밀더니 쑥스러운 듯 숨겼다.'); } },
      { id: 'cguide', char: 'woman', x: 13, y: 8, dir: 'down', name: '마을 안내원',
        text: () => !flag('q01') ? '길지기 하람 님은 저기 초록 지붕의 길지기 초소에 계세요.' : !flag('q02') ? '하람 님은 북쪽 잎그늘길로 가셨어요. 다친 볼도리가 덩굴에 걸렸대요!' : '북쪽 이슬숲을 지나면 채석장 도시 돌마루가 나와요.' }],
    onEnter: async () => { G.S.visited = G.S.visited || {}; G.S.visited.baram = 1; }
  };
  H.center('center_b', '바람나루', 'city', 4, 13);
  H.shop('shop_b', '바람나루', 'city', 18, 15, STOCK1);
  H.house('house2', '바람나루', 'city', 4, 6, [
    { id: 'h2', char: 'man', x: 5, y: 3, dir: 'down', name: '아저씨',
      talk: async () => {
        if (!flag('gift_cube2')) { set('gift_cube2'); await say('여행 중이라고? 동료를 만나려면 큐브가 넉넉해야지. 이거 받아!', '아저씨'); await give('cube', 3); return; }
        await say('몬스터를 잠재우거나 마비시키면 큐브에 훨씬 잘 들어간다네.', '아저씨');
      } }]);
  // 길지기 초소: Q01 delivery and the start of Q02
  M.post = {
    name: '길지기 초소', kind: 'in', bgm: 'town',
    rows: ['#W####W#', 'BB..BBBp', '........', '..tt....', '..tt....', '........', '....x...'],
    warps: [{ x: 4, y: 6, to: 'city', tx: 18, ty: 6, dir: 'down' }],
    objects: { '0,1': async () => say('대륙 곳곳의 길 상태가 적힌 게시판이다.\n"이슬숲 다리 끊김 — 우회 필요" 라는 쪽지가 붙어 있다.') },
    npcs: [
      { id: 'harang', char: 'harang', x: 5, y: 2, dir: 'down', name: '하람', cond: () => !flag('q01') || flag('q03'),
        talk: async () => {
          const N = '하람';
          if (!flag('q01')) {
            if (!G.S.bag.notebook) { await say('어서 와요. 길지기 초소예요.', N); return; }
            await say(`이슬마을 연구소에서 왔군요! 나는 바람나루의 숲길지기 하람이에요.`, N);
            await say('연우 박사님의 조사 수첩이네요. 이슬마을 서식 기록이 꼼꼼하게 적혀 있어요.\n여기에 바람나루 기록을 이어 쓰고, 다음은 돌마루 연구소 분관으로 보내면 돼요.', N);
            await say(`그리고... ${P()}, 오늘부터 정식 견습 길지기로 등록할게요!\n길을 걷고, 길을 돌보는 사람. 환영해요.`, N);
            G.audio && G.audio.jingle('badge');
            await say(`${P()}${G.josa(P(), '은', '는')} 견습 길지기로 등록되었다!`);
            await give('cube', 5);
            await say('그리고 이건 길지기 초원도. 이슬마을부터 돌마루까지 큰 길과 숲의 윤곽만 그려진 지도예요.\n펼쳐 보면 지금까지 걸어온 길은 벌써 기록돼 있을 거예요.', N);
            await give('map01', 1);
            await say('(메뉴의 [지도]에서 볼 수 있다. 숲 안의 굽은 길과 샛길은 직접 걸어야 채워진다)');
            await say('여기, 마을 바로 북쪽이 잎그늘길. 이슬숲으로 들어가는 문턱이에요.\n서쪽 돌담길은 아직 다듬어지지 않은 길이고요.', N);
            set('q01');
            G.audio && G.audio.sfx('alert');
            await say('하람 님! 잎그늘길에서 볼도리 한 마리가 덩굴에 걸려 꼼짝을 못 해요!', '마을 아이');
            await say('저런, 바로 가 봐야겠어요. 마침 잘됐네요.\n동료의 힘을 안전하게 쓰는 법을 거기서 보여 줄게요. 북쪽 잎그늘길에서 만나요!', N);
            set('q02_start');
            Wd().respawn();
            return;
          }
          await say('이슬숲의 다리가 끊겨서 다들 고생이에요. 덩굴길로 우회하면 북쪽으로 갈 수 있어요.\n돌마루 분관에 조사 수첩 전하는 것, 잊지 말아요!', N);
        } },
      { id: 'pk2', char: 'kidB', x: 2, y: 5, dir: 'right', name: '견습생',
        text: '길지기는 지도에 막힌 길을 기록해요. 덩굴, 바위, 물길...\n기술을 익히면 다시 와서 열어 보는 거죠!' }]
  };
  // 옛 창고 across the river: reached on the water board
  M.warehouse = {
    name: '옛 창고', kind: 'in', bgm: 'town',
    rows: ['#W####W#', 'BB.kk.BB', '........', '..tt....', '........', '...x....'],
    warps: [{ x: 3, y: 5, to: 'city', tx: 27, ty: 7, dir: 'down' }],
    items: [{ id: 'leafstone', x: 6, y: 2, flag: 'rv_warehouse' }, { id: 'mapfrag', x: 1, y: 4, flag: 'rv_mapfrag' }],
    objects: { '2,3': async () => say('먼지 쌓인 장부다. "옛 산길 — 큰 바위 너머로 산등 고개와 이어짐" 이라고 적혀 있다.') }
  };

  // ------------------------------------------------------------ R02 서쪽 돌담길 (optional)
  M.westpath = {
    name: '서쪽 돌담길', kind: 'out', bgm: 'route',
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTT',
      'TTrrTT,,,,TTTkk,,,,rTT',
      'TrS.kk,,,,,,kk.,,,,.rT',
      'Tr...r,,,,,..K..,,...T',
      'TC....=========..r...T',
      'TCk...=.......=....kkT',
      'TC..r.=.;;;;..=...r..T',
      'TC....=.;;;;;.=......T',
      '=Q..===..;;;..========',
      'TC.S=..kk.....r......T',
      'TC^.=.,,,,,..;;;;k...T',
      'Tkr.=.,,,,,,.;;;;kk..T',
      'Tkk.===.y....;;;....rT',
      'TTTTTTTTTTTTTTTTTTTTTT'],
    links: { e: { to: 'city', dy: 5 } },
    signs: {
      '3,9': '서쪽 돌담길\n← 옛 산길 (큰 바위로 막힘)   → 바람나루',
      '2,2': '전망대\n돌담 너머로 바람나루의 지붕들과 굽이도는 강이 한눈에 내려다보인다.'
    },
    items: [{ id: 'potion', x: 3, y: 3, flag: 'wp_potion' }, { id: 'cube', n: 3, x: 19, y: 12, flag: 'wp_cube' }],
    npcs: [
      { id: 'junsu', char: 'kidA', x: 10, y: 4, dir: 'down', sight: 3,
        trainer: { flag: 'tr_junsu', title: '태권 소년', name: '준수', char: 'kidA', team: [['kongju', 6], ['jwi', 5]], base: 18,
          before: '얍! 내 콩주먹이랑 주먹 대결이다!', lose: '으윽... 장단이 안 맞았어!', after: '콩주먹이 다가오는 건 싸우자는 게 아니라 같이 장단 맞추자는 거래.\n격투 동료가 있으면 바위 타입 상대할 때 든든해!' } },
      { id: 'eunbi', char: 'kidB', x: 16, y: 10, dir: 'left', sight: 4,
        trainer: { flag: 'tr_eunbi', title: '새 관찰가', name: '은비', char: 'kidB', team: [['jjoreu', 6], ['jjaek', 6]], base: 18,
          before: '쉿! 쪼르딱이 놀라잖아... 아니다, 덤벼!', lose: '쪼르딱이 소리만 컸구나...', after: '쪼르딱은 진화하면 가시부리가 된대. 덤불 사이를 쌩쌩 날아다니지!' } },
      { id: 'rival', char: 'rival', x: 10, y: 9, dir: 'down', name: '도윤', cond: () => flag('q00') && !flag('rival1'),
        talk: async () => {
          const N = '도윤';
          await say(`어, ${P()}! 여기까지 와 봤어? 나는 콩주먹을 동료로 맞으려고 왔지.`, N);
          const ok = await G.ask('마침 잘 만났다. 둘 다 몬스터가 조금 자랐을 테니, 연습 승부 한 판 할래?', ['좋아!', '다음에']);
          if (!ok) { await say('그래, 언제든 말 걸어! 여기 있을게.', N); return; }
          const rid = STARTERS[G.S.flags.starter];
          const won = await G.battle.trainer({ flag: 'rival1', title: '견습 길지기', name: '도윤', char: 'rival', team: [['kongju', 6], [rid, 6]], prize: 400, noBlackout: true,
            lose: '크, 졌다! 너 진짜 길지기 체질인가 봐.' });
          set('rival1');
          if (!won) await say('이번엔 내가 이겼네! 그래도 이긴 사람이 다 맞는 건 아니래. 하람 님이 그랬어.', N);
          await say('이거 받아. 돌담 아래서 주운 회복열매야.\n난 숲 쪽으로 먼저 가 볼게!', N);
          await give('berry', 2);
          Wd().respawn();
        } }],
    onEnter: async () => { G.S.visited = G.S.visited || {}; G.S.visited.stonewall = 1; }
  };

  // ------------------------------------------------------------ R03 잎그늘길: 덩굴 정리 training
  M.leafshade = {
    name: '잎그늘길', kind: 'out', bgm: 'route',
    rows: [
      'YYYYYYYYYY=YYYYY',
      'YYYYYYYYYYVYYYYY',
      'YYYYMMMMMM=MMYYY',
      'YY,,,,MM==MM,,YY',
      'Y,,,,,,M=.M,,,,Y',
      'Y,,,,,.==.,,,,,Y',
      'Y..,,,.=..,,,..Y',
      'YT..MM.=.MM..TTY',
      'T...M..=.....TTT',
      'T.S....=..V.V..T',
      'T......=.......T',
      'T..;;;.=..;;;..T',
      'T.;;;;.=.;;;;..T',
      'T.;;;;.==.;;;..T',
      'T..;;...=......T',
      'TT......=...V..T',
      'T,,,,...=...,,,T',
      'T,,,,,..=..,,,,T',
      'T.,,,...=...,,.T',
      'TT..K...=.....TT',
      'TTT.....=....TTT',
      'TTTT....==...TTT',
      'TTTTTT...=..TTTT',
      'TTTTTTTTT==TTTTT'],
    links: { s: { to: 'city', dx: 3 }, n: { to: 'forest', dx: -1 } },
    signs: { '2,9': '잎그늘길\n↑ 이슬숲   ↓ 바람나루\n숲 문턱의 훈련터' },
    npcs: [
      { id: 'harang', char: 'harang', x: 8, y: 10, dir: 'down', name: '하람', cond: () => flag('q02_start') && !flag('q03'),
        talk: async () => {
          const N = '하람';
          if (!flag('f_vine')) {
            await say(`왔군요, ${P()}! 저기 덩굴에 걸린 볼도리가 보이죠?\n급하다고 억지로 당기면 덩굴도, 볼도리도 다쳐요.`, N);
            await say('동료의 힘은 이렇게 써요. 덩굴의 매듭을 찾아서, 살살 풀어 주는 거예요.\n이걸 [덩굴 정리]라고 불러요.', N);
            const st = G.S.party.find(m => m.id === G.S.flags.starter || D().origin(m.id)) || G.S.party[0];
            const lead = G.S.party.find(m => F().canLearn(m, 'vine')) || st;
            F().teach(lead, 'vine');
            set('f_vine');
            G.audio && G.audio.jingle('learn');
            await say(`${G.eun(D().nameOf(lead))} 탐험 기술 [덩굴 정리]를 익혔다!\n(전투 기술 4칸과는 따로 기억한다)`);
            await say('먼저 저 마른 훈련용 덩굴 두 곳으로 연습해 봐요.\n덩굴을 바라보고 A 버튼! 동료가 알아서 나서 줄 거예요.', N);
            return;
          }
          if (!(flag('q02_v1') && flag('q02_v2'))) { await say('훈련용 마른 덩굴 두 곳을 먼저 정리해 봐요. 오른쪽에 있어요!', N); return; }
          if (!flag('q02')) { await say('좋아요, 이제 실전이에요! 아래쪽 볼도리를 감은 덩굴을 풀어 주세요.', N); return; }
          await say('덩굴 정리는 이제 탐험 수첩에 기록됐어요. 숲 입구 덩굴도 풀 수 있을 거예요.\n이슬숲의 끊어진 다리는 동쪽 덩굴길로 돌아가면 돼요. 조심히 가요!', N);
        } },
      { id: 'jwi_trap', mon: 'jwi', act: 'struggle', x: 13, y: 15, dir: 'left', cond: () => flag('q02_start') && !flag('q02'),
        talk: async () => {
          G.audio && G.audio.cry('jwi');
          if (!flag('f_vine')) { await say('볼도리가 덩굴에 칭칭 감겨 낑낑대고 있다.\n먼저 하람의 이야기를 들어 보자.'); return; }
          if (!(flag('q02_v1') && flag('q02_v2'))) { await say('볼도리가 덩굴에 감겨 있다. 하람의 말대로 훈련용 덩굴부터 연습하자.'); return; }
          await say('볼도리를 감은 덩굴은 바로 옆 칸이다. 덩굴을 바라보고 풀어 주자!');
        } }],
    onVine: async (x, y) => {
      if (x === 10 && y === 9) set('q02_v1');
      if (x === 12 && y === 9) set('q02_v2');
      if ((x === 10 || x === 12) && y === 9 && flag('q02_v1') && flag('q02_v2') && !flag('q02')) await say('훌륭해요! 이제 볼도리를 도와줘요. 아래쪽이에요!', '하람');
      if (x === 12 && y === 15 && !flag('q02')) {
        const W = Wd(), j = W.npc('jwi_trap');
        G.audio && G.audio.cry('jwi');
        if (j) { j.act = 'hop'; j.emote = 40; j.heart = true; }
        await say('덩굴에서 풀려난 볼도리가 기쁜 듯 깡충 뛰었다!');
        await say(`잘했어요, ${P()}! 동료와 같이, 다치지 않게. 그게 길지기의 방식이에요.\n덩굴 정리가 탐험 수첩에 등록됐어요.`, '하람');
        await say('볼도리는 마을로 돌아가서 좀 쉬게 할게요. 억지로 데려갈 필요는 없어요.\n이제 숲 입구 덩굴도 정리할 수 있을 거예요!', '하람');
        if (j) { await W.walk(j, 'down', 3); j.hidden = true; }
        set('q02');
        W.respawn();
      }
    },
    onEnter: async () => { G.S.visited = G.S.visited || {}; G.S.visited.leafshade = 1; }
  };

  // ------------------------------------------------------------ chapter 1 data for the notebook and the map
  // The map follows the progressive-discovery rules: regions appear once a map you own covers them
  // (or once you have walked them yourself), and only barriers you investigated are marked.
  const tileOpen = (map, x, y) => !!(G.S.tiles && G.S.tiles[map] && G.S.tiles[map][x + ',' + y]);
  const explored = id => !!(G.S.explored && G.S.explored[id]);
  G.CH = G.CH1 = {
    title: '1장 지도',
    nodes: [
      { id: 'iseul', code: 'M00', n: '이슬마을', town: 1, x: 50, y: 170, maps: ['town1', 'home', 'house1', 'lab'], show: ['town1'] },
      { id: 'sunfield', code: 'R01', n: '햇살들판', x: 50, y: 144, maps: ['route1'] },
      { id: 'baram', code: 'M01', n: '바람나루', town: 1, x: 50, y: 118, maps: ['city', 'center_b', 'shop_b', 'house2', 'post', 'warehouse'], show: ['city'] },
      { id: 'stonewall', code: 'R02', n: '서쪽 돌담길', x: 20, y: 104, lx: 0, ly: 82, maps: ['westpath'] },
      { id: 'leafshade', code: 'R03', n: '잎그늘길', x: 50, y: 92, lx: 61, ly: 85, maps: ['leafshade'] },
      { id: 'forest', code: 'D01', n: '이슬숲', x: 50, y: 66, maps: ['forest', 'resthut'], show: ['forest'] },
      { id: 'dolmaru', code: 'M02', n: '돌마루시', town: 1, x: 84, y: 40, lx: 64, ly: 20, maps: ['dolmaru', 'center_d', 'shop_d', 'branch', 'gym1', 'house_d'], show: ['dolmaru'] },
      { id: 'songfield', code: 'R04', n: '노래초원', x: 122, y: 40, lx: 102, ly: 46, maps: ['songfield'] },
      { id: 'camp', code: 'H01', n: '산등 야영지', x: 150, y: 62, lx: 120, ly: 70, maps: ['camp', 'camptent'], show: ['camp'] },
      { id: 'cave', code: 'D02', n: '달숨동굴', x: 184, y: 44, lx: 166, ly: 22, maps: ['cave1', 'cave2', 'cave3', 'cave4', 'moonroom', 'echoroom'], show: ['cave1', 'cave2', 'moonroom', 'echoroom', 'cave3', 'cave4'] },
      { id: 'sandwind', code: 'R05', n: '모래바람길', x: 208, y: 80, lx: 146, ly: 74, maps: ['sandwind'] },
      { id: 'mulullim', code: 'M03', n: '물울림시', town: 1, x: 214, y: 130, lx: 168, ly: 140, maps: ['mulullim', 'center_m', 'shop_m', 'gym2', 'house_m1', 'house_m2', 'house_m3', 'sluicehouse'], show: ['mulullim'] },
      { id: 'mistwalk', code: 'R06', n: '물안개 산책길', x: 240, y: 104, lx: 182, ly: 90, maps: ['mistwalk', 'sluicelab'], show: ['mistwalk'] },
      { id: 'reservoir', code: 'D03', n: '저수로', x: 242, y: 152, lx: 210, ly: 160, maps: ['reservoir'] }],
    edges: [['iseul', 'sunfield'], ['sunfield', 'baram'], ['baram', 'stonewall'], ['baram', 'leafshade'], ['leafshade', 'forest'], ['forest', 'dolmaru'],
      ['dolmaru', 'songfield'], ['songfield', 'camp'], ['camp', 'cave'], ['cave', 'sandwind'], ['sandwind', 'mulullim'], ['mulullim', 'mistwalk'], ['mulullim', 'reservoir']],
    waters: [{ r: [26, 178, 50, 10], nodes: ['iseul'] }, { r: [64, 100, 6, 30], nodes: ['baram', 'leafshade'] }, { r: [192, 122, 64, 6], nodes: ['mulullim'] }],
    // which regions each map item covers (map-exploration-rules MAP01-MAP03)
    scopes: {
      MAP01: ['iseul', 'sunfield', 'baram', 'stonewall', 'leafshade', 'forest', 'dolmaru'],
      MAP02: ['camp', 'cave'],
      MAP03: ['mulullim', 'mistwalk', 'reservoir']
    },
    // 현장점검 표식 (field-check posts) for the repeatable token request
    posts: [
      { id: 'p_r1', map: 'route1', x: 12, y: 9, n: '울타리 옆 표식' },
      { id: 'p_ci', map: 'city', x: 20, y: 17, n: '강가 표식' },
      { id: 'p_wp', map: 'westpath', x: 13, y: 3, n: '돌담 위 표식' },
      { id: 'p_ls', map: 'leafshade', x: 4, y: 19, n: '훈련터 아래 표식' },
      { id: 'p_fo', map: 'forest', x: 16, y: 20, n: '개울가 표식' },
      { id: 'p_dm', map: 'dolmaru', x: 25, y: 18, n: '돌다리 남쪽 표식' },
      { id: 'p_sf', map: 'songfield', x: 10, y: 13, n: '웅덩이 옆 표식' },
      { id: 'p_cp', map: 'camp', x: 4, y: 8, n: '천막 옆 표식' },
      { id: 'p_sw', map: 'sandwind', x: 24, y: 6, n: '모래턱 표식' },
      { id: 'p_mw', map: 'mistwalk', x: 18, y: 24, n: '산책길 표식' }],
    objectives() {
      const out = [];
      const q = (done, t, d, opt, at) => out.push(Object.assign({ done, t, d, opt }, at || {}));
      q(flag('q00'), '첫 동료', '연구소 앞의 세 아이 중 한 마리를 첫 동료로 맞고, 도윤과 연습 승부를 하자.', 0, { node: 'iseul', map: 'town1', x: 15, y: 5 });
      if (flag('q00')) q(flag('q01'), '수첩을 다음 마을로', '바람나루 길지기 초소의 하람에게 연우 박사의 조사 수첩을 전하자. 북쪽 햇살들판을 지나면 바람나루다. 큰 나무와 울타리, 표지판을 따라가자.', 0, { node: 'baram', map: 'city', x: 18, y: 5 });
      if (flag('q01')) q(flag('q02'), '덩굴 속 작은 손님', '바람나루 바로 북쪽 잎그늘길에서 하람에게 덩굴 정리를 배우고, 덩굴에 걸린 볼도리를 구하자.', 0, { node: 'leafshade', map: 'leafshade', x: 8, y: 10 });
      if (flag('q00') && !flag('rival1') && flag('q01')) q(false, '도윤과 연습 승부 (선택)', '서쪽 돌담길에서 도윤이 기다리고 있다. 승패와 관계없이 이야기는 이어진다.', 1, { node: 'stonewall' });
      if (flag('q02')) q(flag('q03'), '숲길 다시 잇기', '이슬숲의 끊어진 다리를 동쪽 덩굴길로 우회하고, 북쪽에서 다리줄을 내려 길을 다시 잇자.', 0, { node: 'forest', map: 'forest', x: 11, y: 12 });
      if (flag('q03')) q(flag('badge1'), '산등의 증표', '돌마루 분관에 조사 수첩을 전하고, 돌마루 체육관 관장 토담에게 도전하자. 바위·땅 타입에는 물·풀·격투 기술이 잘 통한다.', 0, flag('q04_note') ? { node: 'dolmaru', map: 'dolmaru', x: 13, y: 6 } : { node: 'dolmaru', map: 'dolmaru', x: 21, y: 6 });
      if (flag('badge1')) q(flag('q05'), '굴 앞의 수레 (선택)', '노래초원에서 가시토의 굴 앞을 막은 새길상회 수레를 치우자.', 1, { node: 'songfield' });
      if (flag('badge1')) q(flag('q06'), '동굴 준비 수업', '동쪽 노래초원 너머 산등 야영지의 탐굴사 석호에게 배지와 추천서를 보여 주고, 바위 밀기를 배우자.', 0, { node: 'camp', map: 'camp', x: 15, y: 9 });
      if (flag('q06') && !flag('q07')) q(false, '나래의 낚시 가방 (선택)', '야영지의 낚시꾼 나래가 잃어버린 가방을 찾고 있다. 야영지 바로 옆 마른 둔덕을 살펴보자.', 1, { node: 'camp' });
      if (flag('q06')) q(flag('q08'), '사라진 반향', '달숨동굴의 반향이 흐트러진 원인을 조사하고, 공명석 받침대를 복구해 동쪽 출구를 열자.', 0, { node: 'cave', map: 'cave4', x: 11, y: 5 });
      if (flag('q08')) q(flag('q09_met'), '막힌 물의 목소리', '모래바람길을 지나 물울림시로 가서 동굴 작업 기록을 수문연구소의 소리에게 전하자.', 0, { node: 'mulullim' });
      if (flag('q09_met')) q(flag('q09'), '수문 되살리기', flag('q09_lab') ? '수문 관리소 계단으로 저수로에 내려가 밸브 부품을 찾고, 핵심 밸브를 복구하자. 덩굴 정리와 바위 밀기면 충분하다.' : '공용 나룻배로 수로를 건너 북쪽 물안개 산책길 끝 수문연구소에서 기록을 함께 확인하자.', 0,
        flag('q09_lab') ? { node: 'reservoir', map: 'mulullim', x: 27, y: 18 } : { node: 'mistwalk', map: 'mistwalk', x: 11, y: 9 });
      if (flag('q09')) q(flag('badge2'), '물울림의 증표', '다시 문을 연 물울림 체육관에서 관장 리안에게 도전하자. 졸음은 교체로 끊을 수 있다.', 0, { node: 'mulullim', map: 'mulullim', x: 26, y: 5 });
      if (flag('badge2')) q(flag('q10'), '작은 물길의 약속', '체육관 옆 안전 수조에서 리안에게 잔물타기 강습을 받자.', 0, { node: 'mulullim', map: 'mulullim', x: 22, y: 8 });
      if (flag('q10')) { const rv = G.CH1.revisits().filter(r => !r.later); q(rv.length > 0 && rv.every(r => r.done), '돌아가서 보이는 길 (선택)', '잔물타기와 새로 익힌 기술로 예전에 못 가던 곳을 둘러보자. [다시 가 볼 곳] 목록을 확인!', 1); }
      if (flag('q10')) q(flag('ch1_end'), '동쪽 수문 너머로', '물울림시 동쪽 수문이 열렸다. 2장으로 이어지는 길이다.', 0, { node: 'mulullim', map: 'mulullim', x: 30, y: 14 });
      return out;
    },
    // the first main goal still open: drawn on the map when the guide is on
    target() {
      const g = this.objectives().find(o => !o.done && !o.opt);
      return g && g.node ? g : null;
    },
    // places to come back to: listed only after you have looked at them (or someone told you)
    revisits() {
      const fv = F().unlocked('vine'), fp = F().unlocked('push'), fe = F().unlocked('echo'), fr = F().unlocked('ripple');
      const S = F().seenAt, K = F().seenKey;
      const out = [];
      const r = (seen, t, need, open, done, d, later) => { if (seen || done) out.push({ t, need, open, done, d, later }); };
      r(S('route1', 'vine'), '햇살들판 옆길', '덩굴 정리', fv, tileOpen('route1', 10, 24), '울타리 옆 좁은 길이 얇은 덩굴로 막혀 있다. 안쪽에 회복열매가 보인다.');
      r(S('westpath', 'bigrock'), '서쪽 돌담길 옛 산길', '괴력운반 (3장)', F().unlocked('haul'), F().hauled('westpath', 'oldpath'), '고리 문양이 새겨진 커다란 운반석이 옛 산길을 막고 있다. 바위 밀기로는 움직이지 않는다. 돌바퀴시의 괴력운반이면 옆 받침으로 옮길 수 있다.', !F().unlocked('haul'));
      r(K('forest:5,4'), '이슬숲 북쪽 덤불', '덩굴 정리', fv, tileOpen('forest', 5, 4), '빽빽한 덤불 사이로 덩굴이 얽혀 있다. 숨은 물건이 있을지도 모른다.');
      r(S('forest', 'water'), '이슬숲 개울 작은 섬', '잔물타기', fr, flag('rv_fisle'), '끊어진 다리 아래 개울에 작은 모래섬이 있다. 무언가 놓여 있다.');
      r(K('cave2:b:C') || explored('moonroom'), '달숨동굴 달빛방', '바위 밀기', fp, flag('rv_moon'), '반향층 서쪽, 둥근 돌 너머로 희미한 달빛이 새어 든다.');
      r(K('cave2:10,16') || K('cave2:11,16'), '달숨동굴 반향방', '메아리 탐색', fe, flag('rv_echo'), '물결 무늬가 새겨진 벽. 벽 너머에서 바람 소리가 들린다. 귀밤이 계열 동료가 메아리 탐색을 익히면 열 수 있다.');
      r(S('town1', 'water') || K('town1:lake'), '이슬 호수 작은 섬', '잔물타기', fr, flag('rv_island'), '이슬마을 남쪽 호수 한가운데 작은 섬. 반짝이는 돌이 보인다.');
      r(S('city', 'water') || K('city:warehouse'), '바람나루 강 건너 창고', '잔물타기', fr, flag('rv_warehouse'), '무너진 다리 너머 옛 창고. 오래전 길지기의 물건이 남아 있다고 한다.');
      r(S('sandwind', 'water'), '모래바람길 물웅덩이 건너', '잔물타기', fr, flag('rv_puddle'), '넓은 물웅덩이 건너편 모래턱에 무언가 반짝인다.');
      r(S('mistwalk', 'water') || K('mistwalk:lotus'), '수문연구소 뒤 연꽃섬', '잔물타기', fr, flag('rv_lotus'), '연구소 앞 연못의 연꽃섬. 다음 여정의 단서가 있다고 한다.');
      r(S('mulullim', 'rapids'), '물울림 동쪽 급류 갈래', '표식 없는 급류 (다음 장)', false, false, '하얗게 부서지는 급류. 표식이 없는 급류라 급류타기로도 건너지 않는다.', 1);
      return out;
    }
  };
})();
