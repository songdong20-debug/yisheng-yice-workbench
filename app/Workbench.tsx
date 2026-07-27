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
  priority: "高" | "中" | "低";
};

const STORAGE_KEY = "yisheng-yice-v3";
const today = new Date();
const dateOffset = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const initialStudents: Student[] = [
  { id: "s1", name: "林晓楠", studentNo: "20250202", grade: "大二", major: "软件工程2班", direction: "升学", score: 82, failed: 0, examTotal: 12, runCompleted: 7, runTarget: 10, attendanceIssues: 0, focus: true, wellbeing: "近期焦虑，持续跟进" },
  { id: "s2", name: "黄思齐", studentNo: "20250203", grade: "大二", major: "计算机科学1班", direction: "升学", score: 80, failed: 0, examTotal: 12, runCompleted: 10, runTarget: 10, attendanceIssues: 0, focus: false, wellbeing: "正常" },
  { id: "s3", name: "刘子涵", studentNo: "20250204", grade: "大二", major: "人工智能2班", direction: "就业", score: 84, failed: 0, examTotal: 12, runCompleted: 9, runTarget: 10, attendanceIssues: 0, focus: false, wellbeing: "正常" },
  { id: "s4", name: "陈志远", studentNo: "20230303", grade: "大三", major: "人工智能1班", direction: "升学", score: 90, failed: 0, examTotal: 18, runCompleted: 10, runTarget: 10, attendanceIssues: 1, focus: false, wellbeing: "正常" },
  { id: "s5", name: "赵明宇", studentNo: "20230304", grade: "大三", major: "软件工程1班", direction: "就业", score: 76, failed: 1, examTotal: 18, runCompleted: 6, runTarget: 10, attendanceIssues: 0, focus: true, wellbeing: "正常" },
  { id: "s6", name: "吴梦琪", studentNo: "20230305", grade: "大三", major: "计算机科学1班", direction: "升学", score: 87, failed: 0, examTotal: 18, runCompleted: 10, runTarget: 10, attendanceIssues: 0, focus: false, wellbeing: "正常" },
  { id: "s7", name: "王浩然", studentNo: "20240101", grade: "大四", major: "计算机科学1班", direction: "就业", score: 68, failed: 2, examTotal: 24, runCompleted: 5, runTarget: 10, attendanceIssues: 2, focus: true, wellbeing: "需约谈" },
  { id: "s8", name: "郑凯文", studentNo: "20240102", grade: "大四", major: "人工智能1班", direction: "升学", score: 83, failed: 0, examTotal: 24, runCompleted: 10, runTarget: 10, attendanceIssues: 0, focus: false, wellbeing: "正常" },
  { id: "s9", name: "孙佳怡", studentNo: "20240103", grade: "大四", major: "软件工程1班", direction: "就业", score: 86, failed: 0, examTotal: 24, runCompleted: 10, runTarget: 10, attendanceIssues: 0, focus: false, wellbeing: "正常" },
];

const initialTasks: Task[] = [
  { id: "t1", studentId: "s1", title: "确定科研方向", stage: "项目奠基", due: dateOffset(5), done: false, priority: "中" },
  { id: "t2", studentId: "s1", title: "申报大创项目", stage: "项目奠基", due: dateOffset(12), done: false, priority: "高" },
  { id: "t3", studentId: "s4", title: "参加算法竞赛", stage: "竞赛冲刺", due: dateOffset(20), done: false, priority: "高" },
  { id: "t4", studentId: "s5", title: "暑期实习准备", stage: "竞赛冲刺", due: dateOffset(8), done: false, priority: "中" },
  { id: "t5", studentId: "s7", title: "投递简历", stage: "毕业出口", due: dateOffset(0), done: false, priority: "高" },
  { id: "t6", studentId: "s7", title: "完成毕业设计", stage: "毕业出口", due: dateOffset(-2), done: true, priority: "高" },
  { id: "t7", studentId: "s8", title: "考研复试准备", stage: "毕业出口", due: dateOffset(9), done: false, priority: "高" },
  { id: "t8", studentId: "s9", title: "签约就业单位", stage: "毕业出口", due: dateOffset(-10), done: true, priority: "高" },
];

const navItems: { id: Tab; icon: string; label: string }[] = [
  { id: "overview", icon: "⌂", label: "总览" },
  { id: "students", icon: "◎", label: "学生档案" },
  { id: "tasks", icon: "✓", label: "成长任务" },
  { id: "reports", icon: "▥", label: "统计报表" },
  { id: "settings", icon: "⚙", label: "数据管理" },
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
  const [grade, setGrade] = useState("全部");
  const [selected, setSelected] = useState<Student | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState("");
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("正在连接云端");

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
        setCloudStatus("云端数据已同步");
      })
      .catch(() => {
        setCloudReady(true);
        setCloudStatus("首次使用，正在创建云端档案");
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
        setCloudStatus("云端数据已同步");
      }).catch(() => setCloudStatus("云端同步暂时失败"));
    }, 450);
    return () => window.clearTimeout(timer);
  }, [students, tasks, cloudReady]);

  const filtered = useMemo(
    () => students.filter((s) =>
      (grade === "全部" || s.grade === grade) &&
      `${s.name}${s.studentNo}${s.major}`.toLowerCase().includes(query.toLowerCase())),
    [students, query, grade],
  );
  const alerts = students.filter((s) => s.focus || s.failed > 0 || s.score < 70);
  const openTasks = tasks.filter((t) => !t.done);
  const completion = tasks.length ? Math.round(tasks.filter((t) => t.done).length / tasks.length * 100) : 0;
  const studentName = (id: string) => students.find((s) => s.id === id)?.name || "未知学生";
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
      grade: String(form.get("grade") || "大一"),
      major: String(form.get("major") || ""),
      direction: String(form.get("direction") || "未确定"),
      score: Number(form.get("score") || 0),
      failed: 0,
      examTotal: Number(form.get("examTotal") || 0),
      runCompleted: 0,
      runTarget: 10,
      attendanceIssues: 0,
      focus: false,
      wellbeing: "正常",
    }]);
    setShowAdd(false);
    toast("学生档案已添加");
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ students, tasks }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `一生一策数据备份_${dateOffset(0)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("数据备份已导出");
  };

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">策</span><span><b>一生一策</b><small>智慧工作台</small></span></div>
        <nav>
          {navItems.map((item) => (
            <button key={item.id} className={tab === item.id ? "navBtn active" : "navBtn"} onClick={() => setTab(item.id)}>
              <span className="navIcon">{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sideFoot"><span className="statusDot" />{cloudStatus}<small>{userName}</small><a href="/signout-with-chatgpt?return_to=/">退出登录</a></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">STUDENT GROWTH OS</p>
            <h1>{navItems.find((n) => n.id === tab)?.label}</h1>
          </div>
          <div className="topActions">
            <div className="dateChip"><span>今天</span><b>{today.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" })}</b></div>
            <button className="primaryBtn" onClick={() => setShowAdd(true)}>＋ 添加学生</button>
          </div>
        </header>

        {tab === "overview" && (
          <div className="page">
            <section className="hero">
              <div>
                <span className="heroTag">辅导员工作驾驶舱</span>
                <h2>看见每一位学生，<br />跟进每一个关键节点。</h2>
                <p>把学生档案、成长任务、风险预警和毕业去向放进同一张清晰的地图。</p>
              </div>
              <div className="heroProgress">
                <div className="ring" style={{ "--progress": `${completion * 3.6}deg` } as React.CSSProperties}><span><b>{completion}%</b><small>任务完成率</small></span></div>
              </div>
            </section>

            <section className="kpiGrid">
              <article className="kpiCard"><span className="kpiIcon mint">人</span><div><small>在管学生</small><strong>{students.length}</strong><em>覆盖 3 个年级</em></div></article>
              <article className="kpiCard"><span className="kpiIcon amber">!</span><div><small>重点关注</small><strong>{alerts.length}</strong><em className="warnText">建议本周跟进</em></div></article>
              <article className="kpiCard"><span className="kpiIcon blue">✓</span><div><small>进行中任务</small><strong>{openTasks.length}</strong><em>共 {tasks.length} 项任务</em></div></article>
              <article className="kpiCard"><span className="kpiIcon coral">⌁</span><div><small>毕业落实率</small><strong>67<sup>%</sup></strong><em>较上周 +8%</em></div></article>
            </section>

            <section className="contentGrid">
              <article className="panel">
                <div className="panelHead"><div><span className="sectionIndex">01</span><h3>重点关注</h3></div><button onClick={() => setTab("students")}>查看全部 →</button></div>
                <div className="alertList">
                  {alerts.slice(0, 4).map((s) => (
                    <button className="alertRow" key={s.id} onClick={() => setSelected(s)}>
                      <span className="avatar">{s.name.slice(-2)}</span>
                      <span className="alertMain"><b>{s.name}</b><small>{s.grade} · {s.major}</small></span>
                      <span className="alertReason">{s.failed > 0 ? `${s.failed} 门挂科` : s.wellbeing}</span>
                      <span className="chevron">›</span>
                    </button>
                  ))}
                </div>
              </article>
              <article className="panel">
                <div className="panelHead"><div><span className="sectionIndex">02</span><h3>近期节点</h3></div><button onClick={() => setTab("tasks")}>任务中心 →</button></div>
                <div className="timeline">
                  {openTasks.slice(0, 5).map((t) => {
                    const days = Math.ceil((new Date(t.due).getTime() - new Date(dateOffset(0)).getTime()) / 86400000);
                    return <div className="timeRow" key={t.id}><span className={days <= 3 ? "timeDot urgent" : "timeDot"} /><div><b>{t.title}</b><small>{studentName(t.studentId)} · {t.stage}</small></div><time>{days < 0 ? `逾期 ${-days} 天` : days === 0 ? "今天" : `${days} 天后`}</time></div>;
                  })}
                </div>
              </article>
            </section>
          </div>
        )}

        {tab === "students" && (
          <div className="page">
            <div className="toolbar">
              <label className="search">⌕<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索姓名、学号或班级" /></label>
              <div className="filterPills">{["全部", "大二", "大三", "大四"].map((g) => <button key={g} className={grade === g ? "active" : ""} onClick={() => setGrade(g)}>{g}</button>)}</div>
              <span className="resultCount">共 {filtered.length} 人</span>
            </div>
            <div className="studentGrid">
              {filtered.map((s) => (
                <button className="studentCard" key={s.id} onClick={() => setSelected(s)}>
                  <span className={s.focus || s.failed ? "riskFlag show" : "riskFlag"}>重点</span>
                  <span className="bigAvatar">{s.name.slice(-2)}</span>
                  <h3>{s.name}</h3><p>{s.studentNo}</p>
                  <div className="studentMeta"><span>{s.grade}</span><span>{s.major}</span></div>
                  <div className="studentChecks">
                    <span className={s.failed ? "checkBad" : "checkGood"}><b>考试</b>{s.failed ? `${s.failed}门未过` : "全部通过"}</span>
                    <span className={s.runCompleted < s.runTarget ? "checkWarn" : "checkGood"}><b>健康跑</b>{s.runCompleted}/{s.runTarget}次</span>
                    <span className={s.attendanceIssues ? "checkBad" : "checkGood"}><b>考勤</b>{s.attendanceIssues ? `${s.attendanceIssues}次异常` : "正常"}</span>
                    <span className="checkNeutral"><b>任务</b>{studentTaskProgress(s.id).done}/{studentTaskProgress(s.id).total}项</span>
                  </div>
                  <div className="scoreLine"><span>加权均分</span><b>{s.score}</b></div>
                  <div className="cardFoot"><span>{s.direction}</span><span>查看档案 →</span></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "tasks" && (
          <div className="page">
            <div className="taskSummary"><div><span>任务进度</span><b>{tasks.filter(t => t.done).length} / {tasks.length}</b></div><div className="progressTrack"><i style={{ width: `${completion}%` }} /></div><strong>{completion}%</strong></div>
            <div className="taskBoard">
              {["项目奠基", "竞赛冲刺", "毕业出口"].map((stage) => (
                <section className="taskColumn" key={stage}>
                  <header><h3>{stage}</h3><span>{tasks.filter(t => t.stage === stage).length}</span></header>
                  {tasks.filter(t => t.stage === stage).map((t) => (
                    <article className={t.done ? "taskCard done" : "taskCard"} key={t.id}>
                      <div><span className={`priority p${t.priority}`}>{t.priority}优先级</span><time>{t.due}</time></div>
                      <h4>{t.title}</h4><p>{studentName(t.studentId)}</p>
                      <button onClick={() => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}>
                        <span>{t.done ? "✓" : ""}</span>{t.done ? "已完成" : "标记完成"}
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
            <article className="panel reportWide"><div className="panelHead"><div><span className="sectionIndex">01</span><h3>年级分布</h3></div></div>
              {["大二", "大三", "大四"].map(g => { const n = students.filter(s => s.grade === g).length; return <div className="barRow" key={g}><span>{g}</span><div><i style={{ width: `${n / students.length * 100}%` }} /></div><b>{n} 人</b></div>; })}
            </article>
            <article className="panel"><div className="panelHead"><div><span className="sectionIndex">02</span><h3>发展方向</h3></div></div>
              <div className="donutWrap"><div className="directionDonut" /><div><p><i className="legend green" />升学 <b>{students.filter(s => s.direction === "升学").length}</b></p><p><i className="legend gold" />就业 <b>{students.filter(s => s.direction === "就业").length}</b></p></div></div>
            </article>
            <article className="panel reportWide"><div className="panelHead"><div><span className="sectionIndex">03</span><h3>风险概览</h3></div></div>
              <table><thead><tr><th>学生</th><th>考试通过</th><th>健康跑</th><th>考勤异常</th><th>任务进展</th><th>关注事项</th></tr></thead><tbody>{alerts.map(s => { const p=studentTaskProgress(s.id); return <tr key={s.id}><td><b>{s.name}</b><small className="tableSub">{s.grade} · {s.major}</small></td><td>{s.examTotal-s.failed}/{s.examTotal}</td><td>{s.runCompleted}/{s.runTarget}</td><td>{s.attendanceIssues} 次</td><td>{p.done}/{p.total}</td><td><span className="riskTag">{s.wellbeing}</span></td></tr>})}</tbody></table>
            </article>
          </div>
        )}

        {tab === "settings" && (
          <div className="page settingsGrid">
            <article className="panel dataCard"><span className="dataIcon">⇩</span><h3>导出数据备份</h3><p>将当前学生档案与任务下载为 JSON 文件，建议定期备份。</p><button className="primaryBtn" onClick={exportData}>导出备份</button></article>
            <article className="panel dataCard"><span className="dataIcon">↻</span><h3>恢复示例数据</h3><p>重新载入演示数据。此操作会覆盖当前浏览器内的数据。</p><button className="secondaryBtn" onClick={() => { if (confirm("确定覆盖当前数据吗？")) { setStudents(initialStudents); setTasks(initialTasks); toast("示例数据已恢复"); } }}>恢复示例</button></article>
            <article className="panel privacy"><h3>关于数据存储</h3><p>学生档案与任务数据会保存到当前登录账号的云端空间。手机和电脑使用同一账号登录，即可读取并更新同一份数据；本机仅保留临时缓存和导出备份。</p></article>
          </div>
        )}
      </section>

      <nav className="mobileNav">{navItems.slice(0, 4).map(item => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><span>{item.icon}</span>{item.label}</button>)}</nav>

      {selected && <div className="modalMask" onClick={() => setSelected(null)}><article className="modal" onClick={(e) => e.stopPropagation()}><button className="modalClose" onClick={() => setSelected(null)}>×</button>
        <div className="profileHead"><span className="bigAvatar">{selected.name.slice(-2)}</span><div><span className="heroTag">{selected.grade}</span><h2>{selected.name}</h2><p>{selected.studentNo} · {selected.major}</p></div></div>
        <div className="attentionTitle"><span className="sectionIndex">核心关注</span><h3>学生状态四维看板</h3></div>
        <div className="attentionGrid">
          <div className={selected.failed ? "attentionItem danger" : "attentionItem good"}><span>卷</span><small>考试通过情况</small><b>{selected.examTotal-selected.failed} / {selected.examTotal} 门</b><em>{selected.failed ? `${selected.failed} 门待处理` : "全部通过"}</em></div>
          <div className={selected.runCompleted < selected.runTarget ? "attentionItem warning" : "attentionItem good"}><span>跑</span><small>校园健康跑</small><b>{selected.runCompleted} / {selected.runTarget} 次</b><em>{selected.runCompleted < selected.runTarget ? `还差 ${selected.runTarget-selected.runCompleted} 次` : "已达标"}</em></div>
          <div className={selected.attendanceIssues ? "attentionItem danger" : "attentionItem good"}><span>勤</span><small>考勤异常情况</small><b>{selected.attendanceIssues} 次</b><em>{selected.attendanceIssues ? "需要跟进处理" : "本学期正常"}</em></div>
          <div className="attentionItem neutral"><span>项</span><small>项目 / 任务进展</small><b>{studentTaskProgress(selected.id).done} / {studentTaskProgress(selected.id).total} 项</b><em>{studentTaskProgress(selected.id).total ? `${Math.round(studentTaskProgress(selected.id).done/studentTaskProgress(selected.id).total*100)}% 已完成` : "尚未建任务"}</em></div>
        </div>
        <div className="profileGrid"><div><small>加权均分</small><b>{selected.score}</b></div><div><small>发展方向</small><b>{selected.direction}</b></div><div><small>身心状态</small><b>{selected.wellbeing}</b></div><div><small>关注状态</small><b>{selected.focus ? "重点关注" : "常规跟进"}</b></div></div>
        <div className="profileSection"><h3>身心状态</h3><p>{selected.wellbeing}</p></div>
        <div className="profileSection"><h3>成长任务</h3>{tasks.filter(t => t.studentId === selected.id).map(t => <p key={t.id} className="miniTask"><span>{t.done ? "✓" : "·"}</span>{t.title}<time>{t.due}</time></p>)}</div>
      </article></div>}

      {showAdd && <div className="modalMask" onClick={() => setShowAdd(false)}><form className="modal addForm" action={addStudent} onClick={(e) => e.stopPropagation()}><button type="button" className="modalClose" onClick={() => setShowAdd(false)}>×</button><p className="eyebrow">NEW PROFILE</p><h2>添加学生档案</h2>
        <div className="formGrid"><label>姓名<input name="name" required placeholder="请输入姓名" /></label><label>学号<input name="studentNo" placeholder="请输入学号" /></label><label>年级<select name="grade"><option>大一</option><option>大二</option><option>大三</option><option>大四</option></select></label><label>专业班级<input name="major" placeholder="如：软件工程1班" /></label><label>发展方向<select name="direction"><option>未确定</option><option>升学</option><option>就业</option><option>创业</option></select></label><label>加权均分<input name="score" type="number" min="0" max="100" /></label><label>本学期考试科目数<input name="examTotal" type="number" min="0" placeholder="如：12" /></label></div>
        <button className="primaryBtn submitBtn">保存档案</button></form></div>}
      <div className={notice ? "toast show" : "toast"}>{notice}</div>
    </main>
  );
}
