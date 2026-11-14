import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Home,
  Map,
  GitBranch,
  Layers,
  History,
  Database,
  Plus,
  X,
  ArrowUpRight,
  Download,
  Compass,
} from "lucide-react";
import {
  branches,
  statuses,
  types,
  entry,
  load,
  save,
  backup,
  previous,
  parseImport,
  merge,
  type Entry,
  type State,
} from "./data";
import "./style.css";
type Kind = "nodes" | "cards" | "activities";
const pages = [
  "我的世界",
  "成长地图",
  "技能树",
  "成就收藏馆",
  "成长时间线",
  "数据管理",
];
const icons = [Home, Map, GitBranch, Layers, History, Database];
function App() {
  const [s, setS] = useState<State>();
  const [page, setPage] = useState(0);
  const [branch, setBranch] = useState("career");
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<{ kind: Kind; value: Entry } | null>(
    null,
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState<ReturnType<typeof parseImport> | null>(
    null,
  );
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    load()
      .then(async (v) => {
        await save(v);
        setS(v);
      })
      .catch((e) => setError("本地数据库无法打开：" + e.message));
  }, []);
  async function commit(next: State) {
    setBusy(true);
    try {
      await save(next);
      setS(next);
      setNotice("已保存到本机");
      return true;
    } catch (e) {
      setError("保存失败，请先导出备份：" + String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  if (!s)
    return <div className="loading">{error || "正在打开你的成长世界…"}</div>;
  const state = s;
  const active = branches.find((b) => b.id === branch)!;
  const edit = (kind: Kind, value?: Entry) =>
    setEditing({
      kind,
      value: value ? structuredClone(value) : { ...entry(), branchId: branch },
    });
  function exportData(data: State, name = "my-growth-world") {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function remove(kind: Kind, id: string) {
    if (!confirm("确认删除这条记录？删除后可通过先前备份找回。")) return;
    const next = { ...state, [kind]: state[kind].filter((e) => e.id !== id) };
    if (kind === "cards")
      next.nodes = state.nodes.map((n) => ({
        ...n,
        achievementIds: n.achievementIds.filter((a) => a !== id),
      }));
    if (kind === "nodes")
      next.nodes = next.nodes.map((n) =>
        n.parentId === id ? { ...n, parentId: "" } : n,
      );
    if (await commit(next)) setEditing(null);
  }
  const openBranch = (id: string) => {
    setBranch(id);
    setPage(2);
  };
  const cards = (list: Entry[]) =>
    list.length ? (
      <div className="cards">
        {list.map((c, i) => {
          const b = branches.find((b) => b.id === c.branchId)!;
          return (
            <button
              className="achievement"
              key={c.id}
              style={{ "--accent": b.color } as React.CSSProperties}
              onClick={() => edit("cards", c)}
            >
              <div className="cardtop">
                <span>{c.status === "待确认" ? "待确认草稿" : c.type}</span>
                <span>NO. {String(i + 1).padStart(3, "0")}</span>
              </div>
              <div className="medal">{b.icon}</div>
              <small>{b.name}</small>
              <h3>{c.title}</h3>
              <p>{c.description || "每一段真实的经历，都值得被珍藏。"}</p>
              <footer>
                {c.date || c.timeLabel || "时间未填写"}{" "}
                <ArrowUpRight size={16} />
              </footer>
            </button>
          );
        })}
      </div>
    ) : (
      <div className="empty">
        <Layers />
        <h3>你的故事，值得一张收藏卡</h3>
        <p>把一次尝试、突破或坚持，留在这里。</p>
        <button className="primary" onClick={() => edit("cards")}>
          创建第一张成就卡
        </button>
      </div>
    );
  const timeline = [
    ...state.changes.map((e) => ({
      ...e,
      kind: "nodes" as Kind,
      label: "节点状态变化",
    })),
    ...state.cards.map((e) => ({
      ...e,
      kind: "cards" as Kind,
      label: "成就卡片",
    })),
    ...state.activities.map((e) => ({
      ...e,
      kind: "activities" as Kind,
      label: "日常行动",
    })),
    ...state.nodes.map((e) => ({
      ...e,
      kind: "nodes" as Kind,
      label: "成长节点",
    })),
  ]
    .filter((e) => !filter || e.branchId === filter)
    .sort((a, b) =>
      (b.date || b.updatedAt).localeCompare(a.date || a.updatedAt),
    );
  return (
    <div className="app">
      <aside>
        <a className="brand" onClick={() => setPage(0)}>
          <Compass size={34} />
          <span>
            MY GROWTH<em>WORLD</em>
          </span>
        </a>
        <div className="sideLabel">个人成长档案 · LOCAL FIRST</div>
        <nav>
          {pages.map((p, i) => {
            const Icon = icons[i];
            return (
              <button
                key={p}
                className={page === i ? "selected" : ""}
                onClick={() => setPage(i)}
              >
                <Icon size={19} />
                {p}
                {i === 3 && <small>{state.cards.length}</small>}
              </button>
            );
          })}
        </nav>
        <div className="sidebottom">
          <span className="online" /> 本地世界 · 数据只属于你
          <p>
            每一个微小的脚印
            <br />
            都会让世界更辽阔。
          </p>
          <small>MY GROWTH WORLD / v0.1</small>
        </div>
      </aside>
      <main>
        <header>
          <span>
            你的专属世界 <span className="crumb">/ {pages[page]}</span>
          </span>
          <span className="saved">
            {busy ? "保存中…" : "◉ IndexedDB 本地存储"}
          </span>
        </header>
        {error && (
          <div className="alert" role="alert">
            {error}
            <button onClick={() => setError("")}>关闭</button>
          </div>
        )}
        {notice && (
          <div className="toast" role="status" onClick={() => setNotice("")}>
            {notice} ×
          </div>
        )}
        {page === 0 && (
          <>
            <section className="hero">
              <div>
                <span className="eyebrow">A WORLD THAT GROWS WITH YOU</span>
                <h1>
                  我的成长世界<span>每一步，都让你成为自己。</span>
                </h1>
                <p>
                  探索属于你的六片大陆，把真实经历化为成长的星光。
                  <br />
                  这里不评判进度，只珍藏你的每一次出发。
                </p>
                <div className="actions">
                  <button className="primary" onClick={() => edit("cards")}>
                    <Plus size={17} />
                    记录一份成就
                  </button>
                  <button onClick={() => setPage(1)}>
                    探索成长地图 <ArrowUpRight size={17} />
                  </button>
                </div>
              </div>
              <div className="heroSeal">
                <div className="orbit" />
                <Compass size={100} strokeWidth={0.7} />
                <span>
                  YOUR JOURNEY
                  <br />
                  YOUR WORLD
                </span>
              </div>
            </section>
            <div className="sectionTitle">
              <div>
                <span className="eyebrow">EXPLORE YOUR PATH</span>
                <h2>六条路线，无限可能</h2>
              </div>
              <button className="text" onClick={() => setPage(1)}>
                展开世界地图 ↗
              </button>
            </div>
            <div className="routes">
              {branches.map((b) => {
                const nodes = state.nodes.filter((n) => n.branchId === b.id);
                const done = nodes.filter((n) => n.status === "已完成").length;
                return (
                  <button
                    key={b.id}
                    style={{ "--accent": b.color } as React.CSSProperties}
                    onClick={() => openBranch(b.id)}
                  >
                    <span className="routeIcon">{b.icon}</span>
                    <small>{b.land}</small>
                    <h3>{b.name}</h3>
                    <div className="progress">
                      <i
                        style={{
                          width: `${nodes.length ? (done / nodes.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <footer>
                      {done} / {nodes.length} 节点完成{" "}
                      <ArrowUpRight size={14} />
                    </footer>
                  </button>
                );
              })}
            </div>
            <div className="sectionTitle">
              <div>
                <span className="eyebrow">COLLECT YOUR MOMENTS</span>
                <h2>最近的成就收藏</h2>
              </div>
              <button className="text" onClick={() => setPage(3)}>
                进入收藏馆 ↗
              </button>
            </div>
            {cards(state.cards.slice(-3).reverse())}
            <div className="bottomgrid">
              <section className="panel">
                <h2>正在探索</h2>
                {state.nodes
                  .filter((n) => n.status === "进行中")
                  .map((n) => (
                    <button
                      className="row"
                      key={n.id}
                      onClick={() => edit("nodes", n)}
                    >
                      {n.title}
                      <ArrowUpRight size={16} />
                    </button>
                  ))}
                {!state.nodes.some((n) => n.status === "进行中") && (
                  <p className="muted">
                    还没有进行中的节点。前往技能树，选择你的下一步。
                  </p>
                )}
              </section>
              <section className="panel">
                <h2>最近成长记录</h2>
                {timeline.slice(0, 3).map((e) => (
                  <button
                    className="row"
                    key={e.id}
                    onClick={() => edit(e.kind, e)}
                  >
                    <span>
                      {e.title}
                      <small>
                        {e.status} · {e.date || e.timeLabel || "时间待补充"}
                      </small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              </section>
            </div>
          </>
        )}
        {page === 1 && (
          <>
            <PageTitle
              eyebrow="THE ATLAS OF YOU"
              title="成长世界地图"
              text="六片大陆，六种力量。选择一处，开始你的探索。"
            />
            <div className="mapTools">
              <button onClick={() => setZoom(Math.max(0.6, zoom - 0.2))}>
                −
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(2, zoom + 0.2))}>
                ＋
              </button>
              <button onClick={() => setZoom(1)}>重置</button>
              <small>放大后可滚动浏览地图 · 点击区域进入技能树</small>
            </div>
            <div className="mapviewport">
              <svg
                className="worldmap"
                viewBox="0 0 1000 660"
                style={{ width: `${zoom * 100}%`, minWidth: 600 }}
              >
                <defs>
                  <pattern
                    id="grid"
                    width="35"
                    height="35"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M35 0H0V35"
                      fill="none"
                      stroke="#b7c6b4"
                      strokeOpacity=".07"
                    />
                  </pattern>
                  <filter id="shadow">
                    <feDropShadow
                      dx="0"
                      dy="12"
                      stdDeviation="12"
                      floodOpacity=".5"
                    />
                  </filter>
                </defs>
                <rect width="1000" height="660" fill="#142b2b" />
                <rect width="1000" height="660" fill="url(#grid)" />
                <path
                  d="M170 230Q480 70 790 240T760 500Q460 660 170 430Z"
                  fill="none"
                  stroke="#bba473"
                  strokeDasharray="4 10"
                  opacity=".4"
                />
                {branches.map((b, i) => {
                  const x = [160, 470, 785, 210, 520, 805][i],
                    y = [180, 125, 210, 420, 440, 450][i];
                  const nodes = state.nodes.filter((n) => n.branchId === b.id);
                  return (
                    <g
                      key={b.id}
                      role="button"
                      aria-label={b.name}
                      tabIndex={0}
                      onClick={() => openBranch(b.id)}
                      onKeyDown={(e) => e.key === "Enter" && openBranch(b.id)}
                      className="island"
                      transform={`translate(${x},${y})`}
                    >
                      <path
                        d="M-125 18L-105-56-62-72-28-99 20-78 60-86 100-42 120 9 89 62 44 82-5 68-50 89-98 60Z"
                        fill={b.color}
                        fillOpacity=".22"
                        stroke={b.color}
                        strokeOpacity=".65"
                        filter="url(#shadow)"
                      />
                      <g
                        fill="none"
                        stroke={b.color}
                        opacity=".48"
                        strokeWidth="1.5"
                      >
                        {i === 0 ? (
                          <>
                            <path d="M-90 10V-35H-72V10M-68 0V-52H-43V-6M-37-25V-65H-17V-25M-95 17Q-60 30-28 17M-101 31Q-60 44-20 31" />
                            <path d="M51-48V-2H91L51-48M47-45L24-5H47M27 5L39 16H78L91 5Z" />
                          </>
                        ) : i === 1 ? (
                          <>
                            <path d="M-90 0L-52-67-14 0M-64-46L-52-31-42-47M13-20L49-81 91-20M34-55L49-41 62-61" />
                            <path d="M-10-38V-63Q0-72 10-63V-38M-14-34H14" />
                          </>
                        ) : i === 2 ? (
                          <>
                            <path d="M-83 12V-42H-68V-60H-54V-42H-38V12M-76-42V-25M-49-42V-25M-68 12V-7H-53V12M29-21L48-67 69-21Z" />
                            <circle cx="70" cy="-61" r="12" />
                            <path d="M21 7Q50-9 83 5M17 16Q53 0 90 15" />
                          </>
                        ) : i === 3 ? (
                          <>
                            {[-85, -57, -29, 40, 70].map((x, j) => (
                              <g
                                key={x}
                                transform={`translate(${x},${j % 2 ? -38 : -12})`}
                              >
                                <path d="M0-40L-16-10H-10L-21 4H21L10-10H16ZM0 4V15" />
                              </g>
                            ))}
                            <path d="M-45 30Q-10-15 36 28" />
                          </>
                        ) : i === 4 ? (
                          <>
                            <path
                              d="M-88 2Q-66-25-43 2M-88 2H-43M30-24Q54-50 81-24M30-24H81M-56-14Q-5-59 44-31"
                              strokeDasharray="4 3"
                            />
                            <path d="M-84-26V-55M-84-55Q-69-68-63-50M50-47V-73M50-73Q67-85 74-65" />
                            <circle cx="-20" cy="-67" r="9" />
                          </>
                        ) : (
                          <>
                            <path d="M-88 9V-34L-62-53-34-34V9M-96-34L-62-59-27-34M-71 9V-12H-52V9M-78-31H-48M-83-34V-63H-74V-43" />
                            <circle cx="55" cy="-45" r="23" />
                            <circle cx="55" cy="-45" r="10" />
                            <path d="M55-80V-68M55-22V-10M20-45H32M78-45H90M30-70L39-61M71-29L80-20M30-20L39-29M71-61L80-70" />
                          </>
                        )}
                      </g>
                      <circle cy="-12" r="27" fill="#182b2a" stroke={b.color} />
                      <text
                        y="0"
                        textAnchor="middle"
                        fontSize="30"
                        fill={b.color}
                      >
                        {b.icon}
                      </text>
                      <text
                        y="40"
                        textAnchor="middle"
                        fill="#f4ead6"
                        fontSize="18"
                      >
                        {b.name}
                      </text>
                      <text
                        y="63"
                        textAnchor="middle"
                        fill={b.color}
                        fontSize="11"
                      >
                        {b.land} ·{" "}
                        {nodes.filter((n) => n.status === "已完成").length}/
                        {nodes.length}
                      </text>
                    </g>
                  );
                })}
                <text
                  x="45"
                  y="615"
                  fill="#c0ab7d"
                  fontSize="13"
                  letterSpacing="4"
                >
                  MY GROWTH WORLD · 成长之境
                </text>
                <g transform="translate(930 575)" stroke="#bda674" fill="none">
                  <circle r="28" />
                  <path d="M0-40V40M-40 0H40M0-30L8 8-8 8Z" />
                </g>
              </svg>
            </div>
          </>
        )}
        {page === 2 && (
          <>
            <PageTitle
              eyebrow="YOUR SKILL CONSTELLATION"
              title="每一次成长，都有迹可循"
              text="能力由你自己确认。行动数量不会自动点亮技能。"
            />
            <div className="tabs">
              {branches.map((b) => (
                <button
                  className={branch === b.id ? "active" : ""}
                  key={b.id}
                  onClick={() => setBranch(b.id)}
                >
                  {b.icon} {b.name}
                </button>
              ))}
            </div>
            <section className="treehead">
              <div>
                <span style={{ color: active.color }}>{active.land}</span>
                <h2>{active.name}</h2>
                <p>虚线连接前置节点 · 点击节点编辑、确认或关联成就</p>
              </div>
              <button className="primary" onClick={() => edit("nodes")}>
                <Plus size={16} />
                创建成长节点
              </button>
            </section>
            <SkillGraph
              nodes={state.nodes.filter((n) => n.branchId === branch)}
              color={active.color}
              onSelect={(n) => edit("nodes", n)}
            />
            <div className="tree">
              {state.nodes
                .filter((n) => n.branchId === branch)
                .map((n, i) => (
                  <button
                    key={n.id}
                    className={`node ${n.status === "已完成" ? "complete" : ""}`}
                    onClick={() => edit("nodes", n)}
                  >
                    <span className="nodeOrb">
                      {n.status === "已完成"
                        ? "✓"
                        : String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <small>
                        {n.status}
                        {n.parentId &&
                          " · 前置：" +
                            (state.nodes.find((p) => p.id === n.parentId)
                              ?.title || "已移除")}
                      </small>
                      <h3>{n.title}</h3>
                      <p>
                        {n.achievementIds.length} 张关联成就 ·{" "}
                        {n.timeLabel || n.date || "时间待补充"}
                      </p>
                    </div>
                    <ArrowUpRight size={18} />
                  </button>
                ))}
            </div>
          </>
        )}
        {page === 3 && (
          <>
            <PageTitle
              eyebrow="THE COLLECTION"
              title="成就收藏馆"
              text="不只记住结果，也记住你如何走到了这里。"
              action={
                <button className="primary" onClick={() => edit("cards")}>
                  <Plus size={16} />
                  创建成就卡片
                </button>
              }
            />
            <div className="filter">
              <select
                aria-label="收藏路线筛选"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">全部成长路线</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <span>
                {
                  state.cards.filter((c) => !filter || c.branchId === filter)
                    .length
                }{" "}
                张收藏 · 待确认草稿不会计为正式成就
              </span>
            </div>
            {cards(state.cards.filter((c) => !filter || c.branchId === filter))}
          </>
        )}
        {page === 4 && (
          <>
            <PageTitle
              eyebrow="FOOTPRINTS IN TIME"
              title="成长时间线"
              text="过去的经历也值得记录。没有准确日期，可以填写人生阶段。"
              action={
                <button className="primary" onClick={() => edit("activities")}>
                  <Plus size={16} />
                  记录经历 / 行动
                </button>
              }
            />
            <div className="filter">
              <select
                aria-label="时间线路线筛选"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">全部成长路线</option>
                {branches.map((b) => (
                  <option value={b.id} key={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <span>明确日期按发生时间排序；未定日期按最近修改排序</span>
            </div>
            <div className="timeline">
              {timeline.map((e) => (
                <button
                  className="event"
                  key={e.kind + e.id}
                  onClick={() => {
                    if (e.label === "节点状态变化") {
                      const node = state.nodes.find((n) => n.id === e.parentId);
                      if (node) edit("nodes", node);
                      else setNotice("原节点已删除，此处保留历史变化记录");
                    } else edit(e.kind, e);
                  }}
                >
                  <span className="dot" />
                  <small>
                    {e.date || e.timeLabel || "时间待补充"} · {e.label} ·{" "}
                    {e.status}
                  </small>
                  <h3>{e.title}</h3>
                  <p>
                    {e.description ||
                      branches.find((b) => b.id === e.branchId)?.name}
                  </p>
                  <small>
                    最近更新：{new Date(e.updatedAt).toLocaleString("zh-CN")}
                  </small>
                </button>
              ))}
            </div>
          </>
        )}
        {page === 5 && (
          <>
            <PageTitle
              eyebrow="KEEP YOUR WORLD SAFE"
              title="数据管理"
              text="你的故事留在本机。定期导出，让珍贵的成长记录多一份保障。"
            />
            <div className="bottomgrid">
              <section className="panel">
                <Download className="gold" />
                <h2>备份你的整个世界</h2>
                <p>
                  包含路线、节点、成就、行动与设置的完整 JSON
                  档案。浏览器清理站点数据会删除本机档案，请定期备份。
                </p>
                <button className="primary" onClick={() => exportData(state)}>
                  导出完整 JSON 备份
                </button>
                <p>
                  {state.nodes.length} 节点 / {state.cards.length} 成就 /{" "}
                  {state.activities.length} 行动
                </p>
              </section>
              <section className="panel">
                <Database className="gold" />
                <h2>导入与合并恢复</h2>
                <p>
                  支持完整备份及桌宠日常事件格式 v1。按 ID / eventId
                  去重；保留本机已有记录，不覆盖同 ID 内容。
                </p>
                <label className="filebutton">
                  选择 JSON 文件
                  <input
                    type="file"
                    disabled={busy}
                    accept=".json,application/json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      setPending(null);
                      if (file)
                        try {
                          if (file.size > 20 * 1024 * 1024)
                            throw Error("文件不得超过20MB");
                          setPending(parseImport(await file.text()));
                          setError("");
                        } catch (err) {
                          setError("导入失败：" + String(err));
                        }
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  onClick={async () => {
                    const old = await previous();
                    if (old) exportData(old, "before-restore");
                    else setNotice("还没有恢复前备份");
                  }}
                >
                  下载上次恢复前备份
                </button>
              </section>
            </div>
            {pending && (
              <section className="panel preview">
                <h2>导入预览 · 尚未写入</h2>
                <p>
                  {pending.nodes.length} 节点、{pending.cards.length} 成就、
                  {pending.activities.length} 行动
                </p>
                <p>
                  将新增 {merge(state, pending).added} 条，跳过{" "}
                  {merge(state, pending).duplicates}{" "}
                  条重复记录（包括文件内重复）。
                </p>
                <ul>
                  {[...pending.nodes, ...pending.cards, ...pending.activities]
                    .slice(0, 8)
                    .map((e, i) => (
                      <li key={i}>
                        {e.title} · {e.status}
                      </li>
                    ))}
                </ul>
                <p>恢复前会自动保留当前档案，也会下载一份 JSON 备份。</p>
                <button
                  className="primary"
                  disabled={busy}
                  onClick={async () => {
                    if (
                      !confirm(
                        "确认合并恢复？已有同 ID 记录保持不变，当前档案将先备份。",
                      )
                    )
                      return;
                    setBusy(true);
                    try {
                      await backup(state);
                      exportData(state, "before-restore");
                      const result = merge(state, pending);
                      if (await commit(result.next)) {
                        setPending(null);
                        setNotice(
                          `已新增 ${result.added} 条，跳过 ${result.duplicates} 条重复记录`,
                        );
                      }
                    } catch (e) {
                      setError("备份失败，已停止恢复：" + String(e));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  确认备份并合并恢复
                </button>
                <button disabled={busy} onClick={() => setPending(null)}>
                  取消导入
                </button>
              </section>
            )}
          </>
        )}
        <footer className="mainfoot">
          以自己的节奏，探索自己的世界。{" "}
          <span>LOCAL FIRST · NO ACCOUNT NEEDED</span>
        </footer>
      </main>
      {editing && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <form
            className="modal"
            onSubmit={async (e) => {
              e.preventDefault();
              const { kind, value } = editing;
              const v = {
                ...value,
                title: value.title.trim(),
                updatedAt: new Date().toISOString(),
              };
              if (!v.title) return;
              const next = {
                ...state,
                [kind]: state[kind].some((x) => x.id === v.id)
                  ? state[kind].map((x) => (x.id === v.id ? v : x))
                  : [...state[kind], v],
              };
              if (kind === "nodes") {
                const old = state.nodes.find((n) => n.id === v.id);
                if (old && old.status !== v.status)
                  next.changes = [
                    ...state.changes,
                    {
                      ...entry(),
                      title: v.title,
                      branchId: v.branchId,
                      status: v.status,
                      parentId: v.id,
                      description: `状态由「${old.status}」变为「${v.status}」`,
                      date: new Date().toISOString().slice(0, 10),
                    },
                  ];
              }
              if (await commit(next)) setEditing(null);
            }}
          >
            <div className="modalhead">
              <div>
                <span className="eyebrow">YOUR STORY MATTERS</span>
                <h2>
                  {editing.kind === "cards"
                    ? "成就卡片"
                    : editing.kind === "nodes"
                      ? "成长节点"
                      : "经历与日常行动"}
                </h2>
              </div>
              <button
                type="button"
                aria-label="关闭"
                onClick={() => setEditing(null)}
              >
                <X />
              </button>
            </div>
            <p className="muted">草稿不代表完成。请亲自确认经历与状态。</p>
            {(() => {
              const v = editing.value;
              const field = (k: keyof Entry, label: string, area = false) => (
                <label key={k}>
                  {label}
                  {area ? (
                    <textarea
                      value={String(v[k])}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          value: { ...v, [k]: e.target.value },
                        })
                      }
                    />
                  ) : (
                    <input
                      required={k === "title"}
                      type={k === "date" ? "date" : "text"}
                      value={String(v[k])}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          value: { ...v, [k]: e.target.value },
                        })
                      }
                    />
                  )}
                </label>
              );
              return (
                <>
                  {field("title", "名称")}
                  <div className="formgrid">
                    <label>
                      成长路线
                      <select
                        value={v.branchId}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            value: {
                              ...v,
                              branchId: e.target.value,
                              parentId: "",
                            },
                          })
                        }
                      >
                        {branches.map((b) => (
                          <option value={b.id} key={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      状态（手动确认）
                      <select
                        value={v.status}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            value: { ...v, status: e.target.value },
                          })
                        }
                      >
                        {statuses.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                    {field("date", "准确日期（可选）")}
                    {field("timeLabel", "大致时间 / 人生阶段")}
                  </div>
                  {editing.kind === "cards" && (
                    <label>
                      成就类型
                      <select
                        value={v.type}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            value: { ...v, type: e.target.value },
                          })
                        }
                      >
                        {types.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  {field("description", "经历描述", true)}
                  {editing.kind === "cards" && (
                    <>
                      {field("difficulty", "遇到的困难", true)}
                      {field("action", "采取的行动", true)}
                      {field("result", "最终结果", true)}
                      {field("lesson", "获得的经验", true)}
                      {field("ability", "证明了自己具备什么能力", true)}
                    </>
                  )}
                  {editing.kind === "nodes" && (
                    <>
                      <label>
                        前置节点
                        <select
                          value={v.parentId}
                          onChange={(e) => {
                            let p = e.target.value;
                            const seen = new Set([v.id]);
                            while (p) {
                              if (seen.has(p)) {
                                setError("不能建立循环依赖");
                                return;
                              }
                              seen.add(p);
                              p =
                                state.nodes.find((n) => n.id === p)?.parentId ||
                                "";
                            }
                            setEditing({
                              ...editing,
                              value: { ...v, parentId: e.target.value },
                            });
                          }}
                        >
                          <option value="">无前置节点</option>
                          {state.nodes
                            .filter(
                              (n) => n.branchId === v.branchId && n.id !== v.id,
                            )
                            .map((n) => (
                              <option value={n.id} key={n.id}>
                                {n.title}
                              </option>
                            ))}
                        </select>
                      </label>
                      <fieldset>
                        <legend>关联成就卡片</legend>
                        {state.cards.length ? (
                          state.cards.map((c) => (
                            <label className="check" key={c.id}>
                              <input
                                type="checkbox"
                                checked={v.achievementIds.includes(c.id)}
                                onChange={(e) =>
                                  setEditing({
                                    ...editing,
                                    value: {
                                      ...v,
                                      achievementIds: e.target.checked
                                        ? [...v.achievementIds, c.id]
                                        : v.achievementIds.filter(
                                            (id) => id !== c.id,
                                          ),
                                    },
                                  })
                                }
                              />
                              {c.title}
                            </label>
                          ))
                        ) : (
                          <p className="muted">先去收藏馆创建成就卡片。</p>
                        )}
                      </fieldset>
                    </>
                  )}
                </>
              );
            })()}
            <div className="modalactions">
              {state[editing.kind].some((e) => e.id === editing.value.id) && (
                <button
                  className="danger"
                  type="button"
                  disabled={busy}
                  onClick={() => remove(editing.kind, editing.value.id)}
                >
                  删除记录
                </button>
              )}
              <button type="button" onClick={() => setEditing(null)}>
                取消
              </button>
              <button className="primary" disabled={busy}>
                保存记录
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
function PageTitle({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="pagetitle">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </section>
  );
}
function SkillGraph({
  nodes,
  color,
  onSelect,
}: {
  nodes: Entry[];
  color: string;
  onSelect: (n: Entry) => void;
}) {
  const point = (i: number) => ({
    x: 140 + (i % 3) * 260,
    y: 90 + Math.floor(i / 3) * 150,
  });
  return (
    <div className="constellation">
      <svg
        viewBox={`0 0 800 ${Math.max(220, Math.ceil(nodes.length / 3) * 150 + 30)}`}
        aria-label="技能节点连接图"
      >
        <defs>
          <pattern
            id="stars"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="12" cy="24" r="1" fill={color} opacity=".2" />
          </pattern>
        </defs>
        <rect width="800" height="100%" fill="url(#stars)" />
        {nodes.map((n, i) => {
          const parent = nodes.findIndex((p) => p.id === n.parentId);
          if (parent < 0) return null;
          const a = point(parent),
            b = point(i);
          return (
            <path
              key={n.id}
              d={`M${a.x} ${a.y} C${a.x} ${a.y + 65},${b.x} ${b.y - 65},${b.x} ${b.y}`}
              fill="none"
              stroke={color}
              strokeOpacity=".4"
              strokeDasharray="5 6"
            />
          );
        })}
        {nodes.map((n, i) => {
          const p = point(i);
          return (
            <g
              key={n.id}
              transform={`translate(${p.x},${p.y})`}
              role="button"
              tabIndex={0}
              aria-label={`查看节点：${n.title}`}
              onClick={() => onSelect(n)}
              onKeyDown={(e) => e.key === "Enter" && onSelect(n)}
              className="skillpoint"
            >
              <circle
                r="30"
                fill="#142822"
                stroke={color}
                strokeOpacity={n.status === "已完成" ? 1 : 0.4}
              />
              <circle
                r="23"
                fill={n.status === "已完成" ? color : "#20382d"}
                fillOpacity=".5"
              />
              <text textAnchor="middle" y="6" fill={color} fontSize="17">
                {n.status === "已完成" ? "✓" : String(i + 1).padStart(2, "0")}
              </text>
              <text textAnchor="middle" y="51" fill="#dce3ce" fontSize="11">
                {n.title.length > 16 ? n.title.slice(0, 16) + "…" : n.title}
              </text>
              <text textAnchor="middle" y="70" fill={color} fontSize="9">
                {n.status}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
