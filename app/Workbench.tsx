"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "overview" | "students" | "tasks" | "reports" | "settings";
type Student = {
  id: string;
  name: string;
  studentNo: string;
  grade: string;
  major: string;
  direction: string;
  score: number;
  failed: number;
  examTotal: number;
  runCompleted: number;
  runTarget: number;
  attendanceIssues: number;
  focus: boolean;
  wellbeing: string;
};
type Task = {
  id: string;
  studentId: string;
  title: string;
  stage: string;
  due: string;
  done: boolean;
  priority: "楂? | "涓? | "浣?;
};

const STORAGE_KEY = "yisheng-yice-v3";
const today = new Date();
const dateOffset = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const initialStudents: Student[] = [
  { id: "s1", name: "鏋楁檽妤?, studentNo: "20250202", grade: "澶т簩", major: "杞欢宸ョ▼2鐝?, direction: "鍗囧", score: 82, failed: 0, examTotal: 12, runCompleted: 7, runTarget: 10, attendanceIssues: 0, focus: true, wellbeing: "杩戞湡鐒﹁檻锛屾寔缁窡杩? },
  { id: "s2", name: "榛勬€濋綈", studentNo: "20250203", grade: "澶т簩", major: "璁＄畻鏈虹瀛?鐝?, direction: "鍗囧", score: 80, failed: 0, examTotal: 12, runCompleted: 10, runTarget: 10, attendanceIssues: 0, focus: false, wellbeing: "姝ｅ父" },
  { id: "s3", name: "鍒樺瓙娑?, studentNo: "20250204", grade: "澶т簩", major: "浜哄伐鏅鸿兘2鐝?, direction: "灏变笟", score: 84, failed: 0, examTotal: 12, runCompleted: 9, runTarget: 10, attendanceIssues: 0, focus: false, wellbeing: "姝ｅ父" },
  { id: "s4", name: "闄堝織杩?, studentNo: "20230303", grade: "澶т笁", major: "浜哄伐鏅鸿兘1鐝?, direction: "鍗囧", score: 90, failed: 0, examTotal: 18, runCompleted: 10, runTarget: 10, attendanceIssues: 1, focus: false, wellbeing: "姝ｅ父" },
  { id: "s5", name: "璧垫槑瀹?, studentNo: "20230304", grade: "澶т笁", major: "杞欢宸ョ▼1鐝?, direction: "灏变笟", score: 76, failed: 1, examTotal: 18, runCompleted: 6, runTarget: 10, attendanceIssues: 0, focus: true, wellbeing: "姝ｅ父" },
  { id: "s6", name: "鍚存ⅵ鐞?, studentNo: "20230305", grade: "澶т笁", major: "璁＄畻鏈虹瀛?鐝?, direction: "鍗囧", score: 87, failed: 0, examTotal: 18, runCompleted: 10, runTarget: 10, attendanceIssues: 0, focus: false, wellbeing: "姝ｅ父" },
  { id: "s7", name: "鐜嬫旦鐒?, studentNo: "20240101", grade: "澶у洓", major: "璁＄畻鏈虹瀛?鐝?, direction: "灏变笟", score: 68, failed: 2, examTotal: 24, runCompleted: 5, runTarget: 10, attendanceIssues: 2, focus: true, wellbeing: "闇€绾﹁皥" },
  { id: "s8", name: "閮戝嚡鏂?, studentNo: "20240102", grade: "澶у洓", major: "浜哄伐鏅鸿兘1鐝?, direction: "鍗囧", score: 83, failed: 0, examTotal: 24, runCompleted: 10, runTarget: 10, attendanceIssues: 0, focus: false, wellbeing: "姝ｅ父" },
  { id: "s9", name: "瀛欎匠鎬?, studentNo: "20240103", grade: "澶у洓", major: "杞欢宸ョ▼1鐝?, direction: "灏变笟", score: 86, failed: 0, examTotal: 24, runCompleted: 10, runTarget: 10, attendanceIssues: 0, focus: false, wellbeing: "姝ｅ父" },
];

const initialTasks: Task[] = [
  { id: "t1", studentId: "s1", title: "纭畾绉戠爺鏂瑰悜", stage: "椤圭洰濂犲熀", due: dateOffset(5), done: false, priority: "涓? },
  { id: "t2", studentId: "s1", title: "鐢虫姤澶у垱椤圭洰", stage: "椤圭洰濂犲熀", due: dateOffset(12), done: false, priority: "楂? },
  { id: "t3", studentId: "s4", title: "鍙傚姞绠楁硶绔炶禌", stage: "绔炶禌鍐插埡", due: dateOffset(20), done: false, priority: "楂? },
  { id: "t4", studentId: "s5", title: "鏆戞湡瀹炰範鍑嗗", stage: "绔炶禌鍐插埡", due: dateOffset(8), done: false, priority: "涓? },
  { id: "t5", studentId: "s7", title: "鎶曢€掔畝鍘?, stage: "姣曚笟鍑哄彛", due: dateOffset(0), done: false, priority: "楂? },
  { id: "t6", studentId: "s7", title: "瀹屾垚姣曚笟璁捐", stage: "姣曚笟鍑哄彛", due: dateOffset(-2), done: true, priority: "楂? },
  { id: "t7", studentId: "s8", title: "鑰冪爺澶嶈瘯鍑嗗", stage: "姣曚笟鍑哄彛", due: dateOffset(9), done: false, priority: "楂? },
  { id: "t8", studentId: "s9", title: "绛剧害灏变笟鍗曚綅", stage: "姣曚笟鍑哄彛", due: dateOffset(-10), done: true, priority: "楂? },
];

const navItems: { id: Tab; icon: string; label: string }[] = [
  { id: "overview", icon: "鈱?, label: "鎬昏" },
  { id: "students", icon: "鈼?, label: "瀛︾敓妗ｆ" },
  { id: "tasks", icon: "鉁?, label: "鎴愰暱浠诲姟" },
  { id: "reports", icon: "鈻?, label: "缁熻鎶ヨ〃" },
  { id: "settings", icon: "鈿?, label: "鏁版嵁绠＄悊" },
];

export default function Workbench({ userName }: { userName: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const readSaved = () => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  };
  const [students, setStudents] = useState<Student[]>(() => readSaved()?.students || initialStudents);
  const [tasks, setTasks] = useState<Task[]>(() => readSaved()?.tasks || initialTasks);
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("鍏ㄩ儴");
  const [selected, setSelected] = useState<Student | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState("");
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("姝ｅ湪杩炴帴浜戠");

  useEffect(() => {
    fetch("/api/workspace")
      .then(async (response) => {
        if (!response.ok) throw new Error("load failed");
        return response.json();
      })
      .then((data) => {
        if (data.students?.length) setStudents(data.students);
        if (data.tasks) setTasks(data.tasks);
        setCloudReady(true);
        setCloudStatus("浜戠鏁版嵁宸插悓姝?);
      })
      .catch(() => {
        setCloudReady(true);
        setCloudStatus("棣栨浣跨敤锛屾鍦ㄥ垱寤轰簯绔。妗?);
      });
  }, []);

  useEffect(() => {
    if (!cloudReady) return;
    const timer = window.setTimeout(() => {
      fetch("/api/workspace", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ students, tasks }),
      }).then((response) => {
        if (!response.ok) throw new Error("save failed");
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ students, tasks }));
        setCloudStatus("浜戠鏁版嵁宸插悓姝?);
      }).catch(() => setCloudStatus("浜戠鍚屾鏆傛椂澶辫触"));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [students, tasks, cloudReady]);

  const filtered = useMemo(
    () => students.filter((s) =>
      (grade === "鍏ㄩ儴" || s.grade === grade) &&
      `${s.name}${s.studentNo}${s.major}`.toLowerCase().includes(query.toLowerCase())),
    [students, query, grade],
  );
  const alerts = students.filter((s) => s.focus || s.failed > 0 || s.score < 70);
  const openTasks = tasks.filter((t) => !t.done);
  const completion = tasks.length ? Math.round(tasks.filter((t) => t.done).length / tasks.length * 100) : 0;
  const studentName = (id: string) => students.find((s) => s.id === id)?.name || "鏈煡瀛︾敓";
  const studentTaskProgress = (id: string) => {
    const own = tasks.filter((t) => t.studentId === id);
    return { done: own.filter((t) => t.done).length, total: own.length };
  };
  const toast = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const addStudent = (form: FormData) => {
    const name = String(form.get("name") || "").trim();
    if (!name) return;
    setStudents((prev) => [...prev, {
      id: crypto.randomUUID(),
      name,
      studentNo: String(form.get("studentNo") || ""),
      grade: String(form.get("grade") || "澶т竴"),
      major: String(form.get("major") || ""),
      direction: String(form.get("direction") || "鏈‘瀹?),
      score: Number(form.get("score") || 0),
      failed: 0,
      examTotal: Number(form.get("examTotal") || 0),
      runCompleted: 0,
      runTarget: 10,
      attendanceIssues: 0,
      focus: false,
      wellbeing: "姝ｅ父",
    }]);
    setShowAdd(false);
    toast("瀛︾敓妗ｆ宸叉坊鍔?);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ students, tasks }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `涓€鐢熶竴绛栨暟鎹浠絖${dateOffset(0)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("鏁版嵁澶囦唤宸插鍑?);
  };

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">绛?/span><span><b>涓€鐢熶竴绛?/b><small>鏅烘収宸ヤ綔鍙?/small></span></div>
        <nav>
          {navItems.map((item) => (
            <button key={item.id} className={tab === item.id ? "navBtn active" : "navBtn"} onClick={() => setTab(item.id)}>
              <span className="navIcon">{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sideFoot"><span className="statusDot" />{cloudStatus}<small>{userName}</small><a href="/signout-with-chatgpt?return_to=/">閫€鍑虹櫥褰?/a></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">STUDENT GROWTH OS</p>
            <h1>{navItems.find((n) => n.id === tab)?.label}</h1>
          </div>
          <div className="topActions">
            <div className="dateChip"><span>浠婂ぉ</span><b>{today.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" })}</b></div>
            <button className="primaryBtn" onClick={() => setShowAdd(true)}>锛?娣诲姞瀛︾敓</button>
          </div>
        </header>

        {tab === "overview" && (
          <div className="page">
            <section className="hero">
              <div>
                <span className="heroTag">杈呭鍛樺伐浣滈┚椹惰埍</span>
                <h2>鐪嬭姣忎竴浣嶅鐢燂紝<br />璺熻繘姣忎竴涓叧閿妭鐐广€?/h2>
                <p>鎶婂鐢熸。妗堛€佹垚闀夸换鍔°€侀闄╅璀﹀拰姣曚笟鍘诲悜鏀捐繘鍚屼竴寮犳竻鏅扮殑鍦板浘銆?/p>
              </div>
              <div className="heroProgress">
                <div className="ring" style={{ "--progress": `${completion * 3.6}deg` } as React.CSSProperties}><span><b>{completion}%</b><small>浠诲姟瀹屾垚鐜?/small></span></div>
              </div>
            </section>

            <section className="kpiGrid">
              <article className="kpiCard"><span className="kpiIcon mint">浜?/span><div><small>鍦ㄧ瀛︾敓</small><strong>{students.length}</strong><em>瑕嗙洊 3 涓勾绾?/em></div></article>
              <article className="kpiCard"><span className="kpiIcon amber">!</span><div><small>閲嶇偣鍏虫敞</small><strong>{alerts.length}</strong><em className="warnText">寤鸿鏈懆璺熻繘</em></div></article>
              <article className="kpiCard"><span className="kpiIcon blue">鉁?/span><div><small>杩涜涓换鍔?/small><strong>{openTasks.length}</strong><em>鍏?{tasks.length} 椤逛换鍔?/em></div></article>
              <article className="kpiCard"><span className="kpiIcon coral">鈱?/span><div><small>姣曚笟钀藉疄鐜?/small><strong>67<sup>%</sup></strong><em>杈冧笂鍛?+8%</em></div></article>
            </section>

            <section className="contentGrid">
              <article className="panel">
                <div className="panelHead"><div><span className="sectionIndex">01</span><h3>閲嶇偣鍏虫敞</h3></div><button onClick={() => setTab("students")}>鏌ョ湅鍏ㄩ儴 鈫?/button></div>
                <div className="alertList">
                  {alerts.slice(0, 4).map((s) => (
                    <button className="alertRow" key={s.id} onClick={() => setSelected(s)}>
                      <span className="avatar">{s.name.slice(-2)}</span>
                      <span className="alertMain"><b>{s.name}</b><small>{s.grade} 路 {s.major}</small></span>
                      <span className="alertReason">{s.failed > 0 ? `${s.failed} 闂ㄦ寕绉慲 : s.wellbeing}</span>
                      <span className="chevron">鈥?/span>
                    </button>
                  ))}
                </div>
              </article>
              <article className="panel">
                <div className="panelHead"><div><span className="sectionIndex">02</span><h3>杩戞湡鑺傜偣</h3></div><button onClick={() => setTab("tasks")}>浠诲姟涓績 鈫?/button></div>
                <div className="timeline">
                  {openTasks.slice(0, 5).map((t) => {
                    const days = Math.ceil((new Date(t.due).getTime() - new Date(dateOffset(0)).getTime()) / 86400000);
                    return <div className="timeRow" key={t.id}><span className={days <= 3 ? "timeDot urgent" : "timeDot"} /><div><b>{t.title}</b><small>{studentName(t.studentId)} 路 {t.stage}</small></div><time>{days < 0 ? `閫炬湡 ${-days} 澶ー : days === 0 ? "浠婂ぉ" : `${days} 澶╁悗`}</time></div>;
                  })}
                </div>
              </article>
            </section>
          </div>
        )}

        {tab === "students" && (
          <div className="page">
            <div className="toolbar">
              <label className="search">鈱?input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="鎼滅储濮撳悕銆佸鍙锋垨鐝骇" /></label>
              <div className="filterPills">{["鍏ㄩ儴", "澶т簩", "澶т笁", "澶у洓"].map((g) => <button key={g} className={grade === g ? "active" : ""} onClick={() => setGrade(g)}>{g}</button>)}</div>
              <span className="resultCount">鍏?{filtered.length} 浜?/span>
            </div>
            <div className="studentGrid">
              {filtered.map((s) => (
                <button className="studentCard" key={s.id} onClick={() => setSelected(s)}>
                  <span className={s.focus || s.failed ? "riskFlag show" : "riskFlag"}>閲嶇偣</span>
                  <span className="bigAvatar">{s.name.slice(-2)}</span>
                  <h3>{s.name}</h3><p>{s.studentNo}</p>
                  <div className="studentMeta"><span>{s.grade}</span><span>{s.major}</span></div>
                  <div className="studentChecks">
                    <span className={s.failed ? "checkBad" : "checkGood"}><b>鑰冭瘯</b>{s.failed ? `${s.failed}闂ㄦ湭杩嘸 : "鍏ㄩ儴閫氳繃"}</span>
                    <span className={s.runCompleted < s.runTarget ? "checkWarn" : "checkGood"}><b>鍋ュ悍璺?/b>{s.runCompleted}/{s.runTarget}娆?/span>
                    <span className={s.attendanceIssues ? "checkBad" : "checkGood"}><b>鑰冨嫟</b>{s.attendanceIssues ? `${s.attendanceIssues}娆″紓甯竊 : "姝ｅ父"}</span>
                    <span className="checkNeutral"><b>浠诲姟</b>{studentTaskProgress(s.id).done}/{studentTaskProgress(s.id).total}椤?/span>
                  </div>
                  <div className="scoreLine"><span>鍔犳潈鍧囧垎</span><b>{s.score}</b></div>
                  <div className="cardFoot"><span>{s.direction}</span><span>鏌ョ湅妗ｆ 鈫?/span></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "tasks" && (
          <div className="page">
            <div className="taskSummary"><div><span>浠诲姟杩涘害</span><b>{tasks.filter(t => t.done).length} / {tasks.length}</b></div><div className="progressTrack"><i style={{ width: `${completion}%` }} /></div><strong>{completion}%</strong></div>
            <div className="taskBoard">
              {["椤圭洰濂犲熀", "绔炶禌鍐插埡", "姣曚笟鍑哄彛"].map((stage) => (
                <section className="taskColumn" key={stage}>
                  <header><h3>{stage}</h3><span>{tasks.filter(t => t.stage === stage).length}</span></header>
                  {tasks.filter(t => t.stage === stage).map((t) => (
                    <article className={t.done ? "taskCard done" : "taskCard"} key={t.id}>
                      <div><span className={`priority p${t.priority}`}>{t.priority}浼樺厛绾?/span><time>{t.due}</time></div>
                      <h4>{t.title}</h4><p>{studentName(t.studentId)}</p>
                      <button onClick={() => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}>
                        <span>{t.done ? "鉁? : ""}</span>{t.done ? "宸插畬鎴? : "鏍囪瀹屾垚"}
                      </button>
                    </article>
                  ))}
                </section>
              ))}
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="page reportGrid">
            <article className="panel reportWide"><div className="panelHead"><div><span className="sectionIndex">01</span><h3>骞寸骇鍒嗗竷</h3></div></div>
              {["澶т簩", "澶т笁", "澶у洓"].map(g => { const n = students.filter(s => s.grade === g).length; return <div className="barRow" key={g}><span>{g}</span><div><i style={{ width: `${n / students.length * 100}%` }} /></div><b>{n} 浜?/b></div>; })}
            </article>
            <article className="panel"><div className="panelHead"><div><span className="sectionIndex">02</span><h3>鍙戝睍鏂瑰悜</h3></div></div>
              <div className="donutWrap"><div className="directionDonut" /><div><p><i className="legend green" />鍗囧 <b>{students.filter(s => s.direction === "鍗囧").length}</b></p><p><i className="legend gold" />灏变笟 <b>{students.filter(s => s.direction === "灏变笟").length}</b></p></div></div>
            </article>
            <article className="panel reportWide"><div className="panelHead"><div><span className="sectionIndex">03</span><h3>椋庨櫓姒傝</h3></div></div>
              <table><thead><tr><th>瀛︾敓</th><th>鑰冭瘯閫氳繃</th><th>鍋ュ悍璺?/th><th>鑰冨嫟寮傚父</th><th>浠诲姟杩涘睍</th><th>鍏虫敞浜嬮」</th></tr></thead><tbody>{alerts.map(s => { const p=studentTaskProgress(s.id); return <tr key={s.id}><td><b>{s.name}</b><small className="tableSub">{s.grade} 路 {s.major}</small></td><td>{s.examTotal-s.failed}/{s.examTotal}</td><td>{s.runCompleted}/{s.runTarget}</td><td>{s.attendanceIssues} 娆?/td><td>{p.done}/{p.total}</td><td><span className="riskTag">{s.wellbeing}</span></td></tr>})}</tbody></table>
            </article>
          </div>
        )}

        {tab === "settings" && (
          <div className="page settingsGrid">
            <article className="panel dataCard"><span className="dataIcon">鈬?/span><h3>瀵煎嚭鏁版嵁澶囦唤</h3><p>灏嗗綋鍓嶅鐢熸。妗堜笌浠诲姟涓嬭浇涓?JSON 鏂囦欢锛屽缓璁畾鏈熷浠姐€?/p><button className="primaryBtn" onClick={exportData}>瀵煎嚭澶囦唤</button></article>
            <article className="panel dataCard"><span className="dataIcon">鈫?/span><h3>鎭㈠绀轰緥鏁版嵁</h3><p>閲嶆柊杞藉叆婕旂ず鏁版嵁銆傛鎿嶄綔浼氳鐩栧綋鍓嶆祻瑙堝櫒鍐呯殑鏁版嵁銆?/p><button className="secondaryBtn" onClick={() => { if (confirm("纭畾瑕嗙洊褰撳墠鏁版嵁鍚楋紵")) { setStudents(initialStudents); setTasks(initialTasks); toast("绀轰緥鏁版嵁宸叉仮澶?); } }}>鎭㈠绀轰緥</button></article>
            <article className="panel privacy"><h3>鍏充簬鏁版嵁瀛樺偍</h3><p>褰撳墠鐗堟湰鐨勬暟鎹繚瀛樺湪璁惧娴忚鍣ㄤ腑锛屼笉浼氳嚜鍔ㄤ笂浼犳湇鍔″櫒銆傚洜姝ゅ湪鎵嬫満鍜岀數鑴戜笂鍒嗗埆鎵撳紑鏃讹紝鏁版嵁涓嶄細鑷姩鍚屾銆傝嫢瑕佸疄鐜板绔疄鏃跺叡鐢紝闇€瑕佸湪姝ｅ紡閮ㄧ讲闃舵鎺ュ叆璐﹀彿鐧诲綍鍜屼簯鏁版嵁搴撱€?/p></article>
          </div>
        )}
      </section>

      <nav className="mobileNav">{navItems.slice(0, 4).map(item => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><span>{item.icon}</span>{item.label}</button>)}</nav>

      {selected && <div className="modalMask" onClick={() => setSelected(null)}><article className="modal" onClick={(e) => e.stopPropagation()}><button className="modalClose" onClick={() => setSelected(null)}>脳</button>
        <div className="profileHead"><span className="bigAvatar">{selected.name.slice(-2)}</span><div><span className="heroTag">{selected.grade}</span><h2>{selected.name}</h2><p>{selected.studentNo} 路 {selected.major}</p></div></div>
        <div className="attentionTitle"><span className="sectionIndex">鏍稿績鍏虫敞</span><h3>瀛︾敓鐘舵€佸洓缁寸湅鏉?/h3></div>
        <div className="attentionGrid">
          <div className={selected.failed ? "attentionItem danger" : "attentionItem good"}><span>鍗?/span><small>鑰冭瘯閫氳繃鎯呭喌</small><b>{selected.examTotal-selected.failed} / {selected.examTotal} 闂?/b><em>{selected.failed ? `${selected.failed} 闂ㄥ緟澶勭悊` : "鍏ㄩ儴閫氳繃"}</em></div>
          <div className={selected.runCompleted < selected.runTarget ? "attentionItem warning" : "attentionItem good"}><span>璺?/span><small>鏍″洯鍋ュ悍璺?/small><b>{selected.runCompleted} / {selected.runTarget} 娆?/b><em>{selected.runCompleted < selected.runTarget ? `杩樺樊 ${selected.runTarget-selected.runCompleted} 娆 : "宸茶揪鏍?}</em></div>
          <div className={selected.attendanceIssues ? "attentionItem danger" : "attentionItem good"}><span>鍕?/span><small>鑰冨嫟寮傚父鎯呭喌</small><b>{selected.attendanceIssues} 娆?/b><em>{selected.attendanceIssues ? "闇€瑕佽窡杩涘鐞? : "鏈鏈熸甯?}</em></div>
          <div className="attentionItem neutral"><span>椤?/span><small>椤圭洰 / 浠诲姟杩涘睍</small><b>{studentTaskProgress(selected.id).done} / {studentTaskProgress(selected.id).total} 椤?/b><em>{studentTaskProgress(selected.id).total ? `${Math.round(studentTaskProgress(selected.id).done/studentTaskProgress(selected.id).total*100)}% 宸插畬鎴恅 : "灏氭湭寤轰换鍔?}</em></div>
        </div>
        <div className="profileGrid"><div><small>鍔犳潈鍧囧垎</small><b>{selected.score}</b></div><div><small>鍙戝睍鏂瑰悜</small><b>{selected.direction}</b></div><div><small>韬績鐘舵€?/small><b>{selected.wellbeing}</b></div><div><small>鍏虫敞鐘舵€?/small><b>{selected.focus ? "閲嶇偣鍏虫敞" : "甯歌璺熻繘"}</b></div></div>
        <div className="profileSection"><h3>韬績鐘舵€?/h3><p>{selected.wellbeing}</p></div>
        <div className="profileSection"><h3>鎴愰暱浠诲姟</h3>{tasks.filter(t => t.studentId === selected.id).map(t => <p key={t.id} className="miniTask"><span>{t.done ? "鉁? : "路"}</span>{t.title}<time>{t.due}</time></p>)}</div>
      </article></div>}

      {showAdd && <div className="modalMask" onClick={() => setShowAdd(false)}><form className="modal addForm" action={addStudent} onClick={(e) => e.stopPropagation()}><button type="button" className="modalClose" onClick={() => setShowAdd(false)}>脳</button><p className="eyebrow">NEW PROFILE</p><h2>娣诲姞瀛︾敓妗ｆ</h2>
        <div className="formGrid"><label>濮撳悕<input name="name" required placeholder="璇疯緭鍏ュ鍚? /></label><label>瀛﹀彿<input name="studentNo" placeholder="璇疯緭鍏ュ鍙? /></label><label>骞寸骇<select name="grade"><option>澶т竴</option><option>澶т簩</option><option>澶т笁</option><option>澶у洓</option></select></label><label>涓撲笟鐝骇<input name="major" placeholder="濡傦細杞欢宸ョ▼1鐝? /></label><label>鍙戝睍鏂瑰悜<select name="direction"><option>鏈‘瀹?/option><option>鍗囧</option><option>灏变笟</option><option>鍒涗笟</option></select></label><label>鍔犳潈鍧囧垎<input name="score" type="number" min="0" max="100" /></label><label>鏈鏈熻€冭瘯绉戠洰鏁?input name="examTotal" type="number" min="0" placeholder="濡傦細12" /></label></div>
        <button className="primaryBtn submitBtn">淇濆瓨妗ｆ</button></form></div>}
      <div className={notice ? "toast show" : "toast"}>{notice}</div>
    </main>
  );
}

