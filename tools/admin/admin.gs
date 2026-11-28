/**
 * 카스쿼드 관리실 — Apps Script 추가 파일 (admin.gs)
 *
 * 붙여 넣는 곳: 구글 시트 「카롱도르 방문통계」 → 확장 프로그램 → Apps Script → 파일 + → 스크립트 → 이름 admin
 * 기존 코드에 두 줄 추가 (자세한 순서는 tools/admin/README.md):
 *   function doGet(e)  {  var adm = admGet(e);  if (adm) return adm;   ...기존 코드...
 *   function doPost(e) {  var adm = admPost(e); if (adm) return adm;   ...기존 코드...
 *
 * 관리자 열쇠는 이 파일에 적지 않습니다. 프로젝트 설정 → 스크립트 속성 → ADMIN_KEY 에 넣어 주세요.
 * 함수·변수 이름은 모두 adm / ADM_ 으로 시작해서 기존 코드와 겹치지 않게 했습니다.
 */

var ADM_TAB_REVIEW = '한줄평';
var ADM_TAB_REPORT = '제보';
var ADM_TAB_LOG = 'log';
var ADM_TAB_CONFIG = '설정';
var ADM_CONFIG_KEYS = ['notice_on', 'notice_text', 'pick_on', 'pick_id', 'kkang_on', 'review_on', 'maint_on', 'maint_text'];
var ADM_CONFIG_DEFAULT = { notice_on: false, notice_text: '', pick_on: false, pick_id: '', kkang_on: true, review_on: true, maint_on: false, maint_text: '' };

// ---------------------------------------------------------------- 입구
function admGet(e) {
  var q = e && e.parameter && e.parameter.q;
  if (q === 'config') return admJson(admConfigPublic());
  if (q === 'duo') return admJson(duoRead(e.parameter.room));
  return null; // 나머지는 기존 doGet이 처리
}

function admPost(e) {
  var body;
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return null; }
  if (body && body.t === 'duo') return admJson(duoWrite(body));
  if (body && body.t === 'review' && body.ig === 'Y') { try { rvIgSave(body); } catch (err) {} } // 인스타 소개 동의만 따로 적고, 한줄평 저장은 기존 doPost가 그대로
  if (!body || body.t !== 'admin') return null; // 관리실 요청이 아니면 기존 doPost가 처리
  var gate = admCheckKey(body.key);
  if (gate) return admJson({ ok: false, error: gate });
  try {
    var out = admRun(body);
    out.ok = true;
    return admJson(out);
  } catch (err) {
    return admJson({ ok: false, error: String(err && err.message || err) });
  }
}

function admRun(b) {
  switch (b.op) {
    case 'dash': return admDash();
    case 'reviews': return { items: admReviews() };
    case 'review_set': return admReviewSet(b.row, b.stamp, b.val);
    case 'inbox': return { items: admInbox() };
    case 'inbox_set': return admInboxSet(b.row, b.stamp, b.val);
    case 'config_get': return { config: admConfigRead() };
    case 'config_set': return { config: admConfigWrite(b.config || {}) };
    default: throw new Error('모르는 요청: ' + b.op);
  }
}

// ---------------------------------------------------------------- 잠금
function admCheckKey(key) {
  var real = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!real || real.length < 8) return 'ADMIN_KEY가 아직 설정되지 않았어요 (8자 이상)';
  var cache = CacheService.getScriptCache();
  var fails = Number(cache.get('adm_fail') || 0);
  if (fails >= 10) return '여러 번 틀려서 10분 동안 잠겼어요';
  var a = String(key || ''), same = a.length === real.length;
  for (var i = 0; i < real.length; i++) if (a.charCodeAt(i) !== real.charCodeAt(i)) same = false;
  if (!same) { cache.put('adm_fail', String(fails + 1), 600); return '열쇠가 맞지 않아요'; }
  return '';
}

// ---------------------------------------------------------------- 공통
function admJson(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function admSheet(name) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); }
function admTz() { return Session.getScriptTimeZone() || 'Asia/Seoul'; }
function admDay(d) { return Utilities.formatDate(d, admTz(), 'yyyy-MM-dd'); }

// 시트 시간 칸: 날짜 값이거나 "2026. 11. 2 오전 9:12:25" 같은 글자
function admDate(v) {
  if (v instanceof Date) return v;
  var m = String(v || '').match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?\s*(오전|오후)?\s*(\d{1,2})?:?(\d{2})?:?(\d{2})?/);
  if (!m) return null;
  var h = Number(m[5] || 0);
  if (m[4] === '오후' && h < 12) h += 12;
  if (m[4] === '오전' && h === 12) h = 0;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), h, Number(m[6] || 0), Number(m[7] || 0));
}
function admStamp(v) { var d = admDate(v); return d ? String(d.getTime()) : String(v); }
function admWhen(v) { var d = admDate(v); return d ? Utilities.formatDate(d, admTz(), 'MM/dd HH:mm') : String(v || ''); }

// 헤더 이름으로 열 번호 찾기 (없으면 맨 끝에 새로 만들기)
function admCol(sh, title, create) {
  var lastC = Math.max(sh.getLastColumn(), 1);
  var head = sh.getRange(1, 1, 1, lastC).getValues()[0];
  for (var i = 0; i < head.length; i++) if (String(head[i]).trim() === title) return i + 1;
  if (!create) return 0;
  sh.getRange(1, lastC + 1).setValue(title);
  return lastC + 1;
}

// ---------------------------------------------------------------- 현황
function admDash() {
  var sh = admSheet(ADM_TAB_LOG), rows = sh && sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues() : [];
  var now = new Date(), today = admDay(now), yest = admDay(new Date(now.getTime() - 864e5));
  var days = {}, devices = {}, carsToday = {};
  for (var i = 0; i < rows.length; i++) {
    var d = admDate(rows[i][0]); if (!d) continue;
    var key = admDay(d), kind = String(rows[i][1]), vid = String(rows[i][3] || '');
    if (kind === 'visit') {
      days[key] = days[key] || {};
      days[key][vid || ('row' + i)] = 1;
      if (vid) devices[vid] = 1;
    } else if (kind === 'car' && key === today && rows[i][2]) {
      carsToday[rows[i][2]] = (carsToday[rows[i][2]] || 0) + 1;
    }
  }
  var cnt = function (k) { return days[k] ? Object.keys(days[k]).length : 0; };
  var total = 0; Object.keys(days).forEach(function (k) { total += cnt(k); });
  var last7 = [];
  for (var j = 6; j >= 0; j--) { var dk = admDay(new Date(now.getTime() - j * 864e5)); last7.push([dk, cnt(dk)]); }
  var first = Object.keys(days).sort()[0] || today;
  var top = Object.keys(carsToday).map(function (k) { return [k, carsToday[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);
  var rv = admReviews(), ib = admInbox();
  return {
    today: cnt(today), yesterday: cnt(yest), total: total, devices: Object.keys(devices).length, since: first,
    last7: last7, top: top,
    pending: rv.filter(function (x) { return x.st === ''; }).length,
    newReviewsToday: rv.filter(function (x) { return x.day === today; }).length,
    inbox: ib.filter(function (x) { return !x.done; }).length,
    reportsToday: ib.filter(function (x) { return x.day === today && x.kind === 'report'; }).length,
    questionsToday: ib.filter(function (x) { return x.day === today && x.kind === 'question'; }).length,
    at: Utilities.formatDate(now, admTz(), 'MM/dd HH:mm')
  };
}

// ---------------------------------------------------------------- 한줄평
function admReviews() {
  var sh = admSheet(ADM_TAB_REVIEW); if (!sh || sh.getLastRow() < 2) return [];
  var okCol = admCol(sh, '승인(Y)', true);
  var lastC = Math.max(sh.getLastColumn(), okCol);
  var v = sh.getRange(2, 1, sh.getLastRow() - 1, lastC).getValues();
  var out = [];
  for (var i = 0; i < v.length; i++) {
    var r = v[i]; if (!r[0] && !r[1]) continue;
    var d = admDate(r[0]);
    var st = String(r[okCol - 1] || '').trim().toUpperCase();
    out.push({
      row: i + 2, stamp: admStamp(r[0]), when: admWhen(r[0]), day: d ? admDay(d) : '',
      id: String(r[1] || ''), car: String(r[2] || ''), star: Number(r[3]) || 0, own: String(r[4] || ''),
      good: String(r[5] || ''), bad: String(r[6] || ''), msg: String(r[7] || ''), auto: String(r[8] || ''),
      st: st === 'Y' ? 'Y' : st === 'N' ? 'N' : '', dev: String(r[10] || '')
    });
  }
  return out.reverse(); // 최신 먼저
}

function admReviewSet(row, stamp, val) {
  if (['Y', 'N', ''].indexOf(val) < 0) throw new Error('값은 Y / N / 빈칸만');
  var sh = admSheet(ADM_TAB_REVIEW), lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    row = Number(row);
    if (!(row >= 2 && row <= sh.getLastRow())) throw new Error('없는 줄');
    if (admStamp(sh.getRange(row, 1).getValue()) !== String(stamp)) throw new Error('시트가 바뀌었어요. 새로고침해 주세요');
    sh.getRange(row, admCol(sh, '승인(Y)', true)).setValue(val);
  } finally { lock.releaseLock(); }
  return { row: row, st: val };
}

// ---------------------------------------------------------------- 제보·질문·신고
function admInbox() {
  var sh = admSheet(ADM_TAB_REPORT); if (!sh || sh.getLastRow() < 2) return [];
  var doneCol = admCol(sh, '처리', true);
  var lastC = Math.max(sh.getLastColumn(), doneCol);
  var v = sh.getRange(2, 1, sh.getLastRow() - 1, lastC).getValues();
  var out = [];
  for (var i = 0; i < v.length; i++) {
    var r = v[i]; if (!r[0]) continue;
    var kinds = String(r[2] || '');
    if (kinds.indexOf('차생 별점') >= 0) continue; // 차생 그래프 별점은 통계용이라 제외
    var kind = kinds.indexOf('깡통봇 질문') >= 0 ? 'question' : kinds.indexOf('한줄평 신고') >= 0 ? 'flag' : 'report';
    var d = admDate(r[0]);
    out.push({
      row: i + 2, stamp: admStamp(r[0]), when: admWhen(r[0]), day: d ? admDay(d) : '',
      kind: kind, name: String(r[1] || ''), kinds: kinds, msg: String(r[3] || ''), src: String(r[4] || ''),
      contact: String(r[5] || '') ? '있음' : '', page: String(r[6] || ''), done: String(r[doneCol - 1] || '')
    });
  }
  return out.reverse();
}

function admInboxSet(row, stamp, val) {
  if (['처리', '답변 목록', '지움', ''].indexOf(val) < 0) throw new Error('모르는 처리 값');
  var sh = admSheet(ADM_TAB_REPORT), lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    row = Number(row);
    if (!(row >= 2 && row <= sh.getLastRow())) throw new Error('없는 줄');
    if (admStamp(sh.getRange(row, 1).getValue()) !== String(stamp)) throw new Error('시트가 바뀌었어요. 새로고침해 주세요');
    sh.getRange(row, admCol(sh, '처리', true)).setValue(val);
  } finally { lock.releaseLock(); }
  return { row: row, done: val };
}

// ---------------------------------------------------------------- 바로 수정 (설정 탭)
function admConfigSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(ADM_TAB_CONFIG);
  if (!sh) {
    sh = ss.insertSheet(ADM_TAB_CONFIG);
    sh.getRange(1, 1, 1, 3).setValues([['항목', '값', '바꾼 시간']]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function admConfigRead() {
  var sh = admConfigSheet(), cfg = JSON.parse(JSON.stringify(ADM_CONFIG_DEFAULT));
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) {
      var k = String(r[0]); if (ADM_CONFIG_KEYS.indexOf(k) < 0) return;
      cfg[k] = typeof ADM_CONFIG_DEFAULT[k] === 'boolean' ? (r[1] === true || String(r[1]).toUpperCase() === 'TRUE') : String(r[1]);
    });
  }
  return cfg;
}

function admConfigWrite(next) {
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var sh = admConfigSheet(), cur = admConfigRead(), now = new Date();
    var rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
    ADM_CONFIG_KEYS.forEach(function (k) {
      if (!(k in next)) return;
      var v = typeof ADM_CONFIG_DEFAULT[k] === 'boolean' ? !!next[k] : String(next[k] || '').slice(0, 120);
      if (v === cur[k]) return;
      var at = rows.indexOf(k);
      if (at < 0) { sh.appendRow([k, v, now]); rows.push(k); }
      else sh.getRange(at + 2, 2, 1, 2).setValues([[v, now]]);
    });
    CacheService.getScriptCache().remove('adm_cfg');
    return admConfigRead();
  } finally { lock.releaseLock(); }
}

// 사이트가 읽는 공개 설정 (60초 캐시)
function admConfigPublic() {
  var cache = CacheService.getScriptCache(), hit = cache.get('adm_cfg');
  if (hit) return JSON.parse(hit);
  var c = admConfigRead(), pub = {
    notice: c.notice_on && c.notice_text ? c.notice_text : '',
    pick: c.pick_on ? c.pick_id : '',
    kkang: c.kkang_on, review: c.review_on,
    maint: c.maint_on ? (c.maint_text || '잠시 점검 중이에요. 금방 돌아올게요!') : ''
  };
  cache.put('adm_cfg', JSON.stringify(pub), 60);
  return pub;
}


// ---------------------------------------------------------------- 차 MBTI '둘이 같이' 결과 우편함 (11/24)
// 링크로 같이 할 때 상대의 결과(유형·축 %)만 잠깐 맡아 둡니다. 이름은 받지 않고, 7일 지나면 지웁니다.
var DUO_TAB = 'duo';
var DUO_TYPES = /^[EI][SN][TF][JP]$/;
function duoSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(); var sh = ss.getSheetByName(DUO_TAB);
  if (!sh) { sh = ss.insertSheet(DUO_TAB); sh.appendRow(['time', 'room', 'tb', 'pb']); }
  return sh;
}
function duoRoomOk(room) { return typeof room === 'string' && /^[a-z0-9]{6,10}$/.test(room); }
function duoRead(room) {
  if (!duoRoomOk(room)) return { ok: false };
  var v = duoSheet().getDataRange().getValues();
  for (var i = v.length - 1; i >= 1; i--) if (String(v[i][1]) === room) return { ok: true, tb: String(v[i][2]), pb: String(v[i][3]).split('.').map(Number) };
  return { ok: true, tb: '' };
}
function duoWrite(b) {
  if (!duoRoomOk(b.room) || !DUO_TYPES.test(String(b.tb || '')) || !Array.isArray(b.pb) || b.pb.length !== 4) return { ok: false };
  var pb = b.pb.map(function (x) { x = Math.round(Number(x)); return isNaN(x) ? 50 : Math.max(0, Math.min(100, x)); });
  var lock = LockService.getScriptLock(); lock.waitLock(5000);
  try {
    var sh = duoSheet(), v = sh.getDataRange().getValues(), cut = Date.now() - 7 * 864e5;
    for (var i = v.length - 1; i >= 1; i--) { var t = v[i][0] instanceof Date ? v[i][0].getTime() : Number(v[i][0]); if (String(v[i][1]) === b.room) return { ok: true, dup: true }; if (t && t < cut) sh.deleteRow(i + 1); }
    sh.appendRow([new Date(), b.room, b.tb, pb.join('.')]);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

// ---------------------------------------------------------------- 한줄평 인스타 소개 동의 (11/28)
// 앱 작성 창의 "인스타 '오너 한줄평'에 소개해도 좋아요" 체크. 체크한 평만 이 탭에 한 줄씩 쌓임
var RV_IG_TAB = '인스타동의';
function rvIgSave(b) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(RV_IG_TAB);
  if (!sh) { sh = ss.insertSheet(RV_IG_TAB); sh.appendRow(['time', 'id', 'car', 'star', 'own', 'good', 'bad', 'msg']); }
  var cut = function (v, n) { return String(v == null ? '' : v).slice(0, n); };
  sh.appendRow([new Date(), cut(b.id, 20), cut(b.name, 60), Number(b.star) || 0, cut(b.own, 20), cut(b.good, 80), cut(b.bad, 80), cut(b.msg, 100)]);
}
