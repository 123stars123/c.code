import { useRef, useState } from "react";
import { branches, type Entry } from "./data";
import "./world.css";
const places = [
  { x: 235, y: 270 },
  { x: 605, y: 175 },
  { x: 950, y: 275 },
  { x: 235, y: 570 },
  { x: 610, y: 515 },
  { x: 965, y: 570 },
];
export function Landscape({ theme = 0 }: { theme?: number }) {
  const colors = [
    "#c38b53",
    "#85a9ae",
    "#bc7763",
    "#729679",
    "#9482a5",
    "#b19a67",
  ];
  const c = colors[theme];
  return (
    <g stroke="#405349" strokeWidth="2" strokeLinejoin="round">
      {theme === 0 ? (
        <>
          <path d="M-82 30V-30H-59V-59H-35V-19H-10V30Z" fill="#ddba82" />
          <path
            d="M-86-30L-70-47-54-30M-63-59L-47-78-31-59M-39-19L-22-37-6-19"
            fill="#697e75"
          />
          <path d="M-69 30V5H-53V30M-47-40V-30M-70-15V-5" />
          <path d="M35 32H94L80 44H48Z" fill="#8f5d43" />
          <path d="M62-30V31M65-27L90 18H65Z" fill="#fff0cb" />
          <path
            d="M-98 48Q-55 35-15 48M21 54Q65 43 104 54"
            fill="none"
            stroke="#98b5ac"
          />
        </>
      ) : theme === 1 ? (
        <>
          <path d="M-110 40L-54-65 4 40Z" fill="#8da9aa" />
          <path d="M-72-31L-54-65-35-31-48-36-58-24Z" fill="#e8efdc" />
          <path d="M-28 45L40-98 112 45Z" fill="#6f9095" />
          <path d="M15-46L40-98 65-46 49-54 38-38 28-55Z" fill="#f1edd6" />
          <path d="M-5 36V-12L9-27 23-12V36Z" fill="#dec49a" />
          <path d="M-12-12L9-34 30-12Z" fill="#b38c68" />
        </>
      ) : theme === 2 ? (
        <>
          <path d="M-82 40V-28H-60V-51H-35V-28H-10V40Z" fill="#c99b76" />
          <path
            d="M-88-28L-70-53-53-28M-65-51L-47-80-29-51M-40-28L-22-53-4-28"
            fill="#a36350"
          />
          <path d="M-58 40V7Q-47-7-35 7V40" fill="#554c42" />
          <path d="M57 42V-61M57-61L94-48 57-32" fill="#dba56c" />
          <path d="M26 43L43 8 61 43M65 45L83 15 101 45" fill={c} />
        </>
      ) : theme === 3 ? (
        <>
          {[-80, -39, 3, 47, 85].map((x, i) => (
            <g key={x} transform={`translate(${x},${i % 2 ? -15 : 15})`}>
              <path d="M0 30V-30" />
              <path
                d="M0-85L-24-38H-15L-32-7H32L15-38H24Z"
                fill={i % 2 ? "#769875" : "#567c65"}
              />
            </g>
          ))}
          <path
            d="M-95 48Q-30 8 16 48T100 49"
            fill="none"
            stroke="#a5c9b2"
            strokeWidth="8"
          />
        </>
      ) : theme === 4 ? (
        <>
          <path d="M-102 25Q-64-35-23 25Z" fill="#ac9baa" />
          <path d="M30 12Q66-45 108 12Z" fill="#9c91a1" />
          <path
            d="M-60 5Q-8-50 63-12M-60 12Q-8-43 63-5"
            fill="none"
            stroke="#d2bb91"
          />
          <path
            d="M-65-5V-55M-65-55Q-45-78-27-48M66-13V-70M66-70Q83-88 102-60"
            fill="none"
          />
          <circle cx="-4" cy="-75" r="17" fill="#efe0ac" />
          <path d="M-100 50Q-50 38 0 50T105 50" fill="none" stroke="#98b5ac" />
        </>
      ) : (
        <>
          <path d="M-84 37V-22L-46-55-7-22V37Z" fill="#d4ae7b" />
          <path d="M-94-22L-46-66 2-22Z" fill="#8a7164" />
          <path d="M-60 37V5H-34V37M-76-21H-56V-1H-76Z" fill="#f4d483" />
          <path d="M-20-40V-78H-7V-28" fill="#b3997a" />
          <circle cx="60" cy="-18" r="35" fill="#ac956b" />
          <circle cx="60" cy="-18" r="22" fill="#e1cb96" />
          <path d="M60-53V17M25-18H95M35-43L85 7M35 7L85-43" />
          <path d="M-10-89Q-30-104-7-112" fill="none" stroke="#c2bca4" />
        </>
      )}
    </g>
  );
}
export function WorldExplorer({
  nodes,
  cards,
  onBranch,
  onNode,
  onNew,
  onCollection,
}: {
  nodes: Entry[];
  cards: Entry[];
  onBranch: (id: string) => void;
  onNode: (n: Entry) => void;
  onNew: () => void;
  onCollection: () => void;
}) {
  const [hover, setHover] = useState(3);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(
    null,
  );
  const b = branches[hover];
  const list = nodes.filter((n) => n.branchId === b.id);
  const done = nodes.filter((n) => n.status === "已完成").length;
  return (
    <section className="world-experience">
      <div className="world-heading">
        <div>
          <span className="chapter-kicker">THE WORLD OF YOUR BECOMING</span>
          <h1>我的成长世界</h1>
          <p>不必成为别人眼中的英雄。你的故事，就从这里继续。</p>
        </div>
        <button className="primary" onClick={onNew}>
          ＋ 珍藏一段经历
        </button>
      </div>
      <div className="atlas-layout">
        <div
          className="atlas"
          onPointerDown={(e) => {
            if ((e.target as Element).closest("[data-map-action]")) return;
            drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (drag.current)
              setPan({
                x: drag.current.px + e.clientX - drag.current.x,
                y: drag.current.py + e.clientY - drag.current.y,
              });
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          <div className="map-corner">
            ✧ 成长之境 <span>每一次尝试，都留下足迹</span>
          </div>
          <svg
            viewBox="0 0 1200 800"
            className="illustrated-world"
            aria-label="六大成长地域"
            style={{
              transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
            }}
          >
            <defs>
              <pattern
                id="papergrain"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="2" r=".6" fill="#6b6846" opacity=".10" />
                <circle cx="5" cy="6" r=".5" fill="#fff8d9" opacity=".5" />
              </pattern>
              <filter id="landshadow">
                <feDropShadow
                  dx="0"
                  dy="10"
                  stdDeviation="8"
                  floodColor="#3d6661"
                  floodOpacity=".25"
                />
              </filter>
              <pattern
                id="waves"
                width="48"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 17Q12 9 24 17T48 17"
                  fill="none"
                  stroke="#fff5d2"
                  strokeOpacity=".2"
                />
              </pattern>
            </defs>
            <rect width="1200" height="800" fill="#8eafa6" />
            <rect width="1200" height="800" fill="url(#waves)" />
            <path
              d="M62 205Q77 128 204 141L335 167 411 104Q490 54 614 72L741 103 795 175 1015 145Q1120 181 1137 300L1090 384 1155 492Q1163 588 1063 667L950 713 822 649 731 705 609 669 469 735 362 671 244 715 125 660Q49 624 80 524L45 442 102 348Z"
              fill="#e1d5a9"
              stroke="#f4e6b9"
              strokeWidth="15"
              filter="url(#landshadow)"
            />
            <path
              d="M76 208Q145 141 266 176L392 228 365 372 238 407 111 349Z"
              fill="#ddc592"
            />
            <path
              d="M420 117L616 86 745 120 783 231 655 308 441 263Z"
              fill="#bdc9b3"
            />
            <path
              d="M815 197L1017 165 1118 285 1050 391 899 394 784 306Z"
              fill="#d1af8e"
            />
            <path
              d="M102 448L246 401 396 437 420 602 335 658 223 691 114 628Z"
              fill="#a7bc92"
            />
            <path
              d="M468 368L653 317 780 393 811 574 717 659 581 636 451 676 401 559Z"
              fill="#c1baa4"
            />
            <path
              d="M842 431L1021 420 1129 496 1052 641 948 688 820 618Z"
              fill="#d7c38c"
            />
            <rect
              width="1200"
              height="800"
              fill="url(#papergrain)"
              pointerEvents="none"
            />
            <path
              d="M399 126Q381 284 447 339T404 478Q416 577 476 680M744 158Q709 299 792 355T823 594"
              fill="none"
              stroke="#90b3a5"
              strokeWidth="13"
            />
            <path
              d="M399 126Q381 284 447 339T404 478Q416 577 476 680M744 158Q709 299 792 355T823 594"
              fill="none"
              stroke="#c8ddd0"
              strokeWidth="4"
            />
            <path
              d="M232 269C340 390 445 100 607 175S840 150 950 275S729 430 610 515S400 447 235 570S770 745 965 570"
              fill="none"
              stroke="#9d8b64"
              strokeWidth="6"
              opacity=".2"
            />
            <path
              d="M232 269C340 390 445 100 607 175S840 150 950 275S729 430 610 515S400 447 235 570S770 745 965 570"
              fill="none"
              stroke="#fff4cd"
              strokeWidth="3"
              strokeDasharray="3 10"
              strokeLinecap="round"
            />
            {Array.from({ length: 37 }, (_, i) => {
              const x = 90 + ((i * 137) % 1000),
                y = 140 + ((i * 73) % 520);
              return (
                <g
                  key={i}
                  transform={`translate(${x},${y})`}
                  opacity=".28"
                  pointerEvents="none"
                >
                  <path d="M0-12L-9 6H9Z" fill="#597b5d" />
                  <path d="M0 5V13" stroke="#64785a" />
                </g>
              );
            })}
            {branches.map((region, i) => {
              const { x, y } = places[i];
              const ns = nodes.filter((n) => n.branchId === region.id);
              return (
                <g
                  key={region.id}
                  transform={`translate(${x},${y})`}
                  className={`map-region ${hover === i ? "region-hover" : ""}`}
                >
                  <g
                    data-map-action="true"
                    role="button"
                    aria-label={region.name}
                    tabIndex={0}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onClick={() => onBranch(region.id)}
                    onKeyDown={(e) => e.key === "Enter" && onBranch(region.id)}
                  >
                    <ellipse
                      cy="5"
                      rx="113"
                      ry="63"
                      fill="#f1e4ba"
                      opacity=".45"
                    />
                    <Landscape theme={i} />
                    <rect
                      x="-103"
                      y="65"
                      width="206"
                      height="57"
                      rx="11"
                      fill="#f6e9c8"
                      stroke="#a58b62"
                    />
                    <text
                      textAnchor="middle"
                      y="88"
                      fill="#334d42"
                      fontSize="19"
                      fontWeight="700"
                    >
                      {region.name}
                    </text>
                    <text
                      textAnchor="middle"
                      y="108"
                      fill="#7a7759"
                      fontSize="11"
                    >
                      {region.land} ·{" "}
                      {ns.filter((n) => n.status === "已完成").length} /{" "}
                      {ns.length} 已确认完成
                    </text>
                  </g>
                  {ns.slice(0, 3).map((n, j) => (
                    <g
                      data-map-action="true"
                      key={n.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`探索经历：${n.title}`}
                      className="map-footstep"
                      transform={`translate(${-65 + j * 65},155)`}
                      onClick={() => onNode(n)}
                      onKeyDown={(e) => e.key === "Enter" && onNode(n)}
                    >
                      <circle
                        r="18"
                        fill={n.status === "已完成" ? "#7b9b65" : "#f3e8ca"}
                        stroke="#9a835c"
                        strokeWidth="2"
                      />
                      <text
                        textAnchor="middle"
                        y="5"
                        fontSize="12"
                        fill="#5b6049"
                      >
                        {n.status === "已完成"
                          ? "✓"
                          : n.status === "进行中"
                            ? "⚑"
                            : "✧"}
                      </text>
                      <title>{n.title}</title>
                    </g>
                  ))}
                </g>
              );
            })}
            <g transform="translate(1090 83)" fill="none" stroke="#f8edcb">
              <circle r="29" />
              <path d="M0-43V43M-43 0H43M0-30L8 11 0 6-8 11Z" />
              <text y="-50" textAnchor="middle" fill="#f8edcb" fontSize="12">
                N
              </text>
            </g>
            <text x="67" y="765" fill="#f7edd1" fontSize="13" letterSpacing="4">
              每一片大陆，都有属于你的故事
            </text>
          </svg>
          <div className="atlas-controls" data-map-action="true">
            <button
              aria-label="缩小地图"
              onClick={() => setZoom(Math.max(0.7, zoom - 0.15))}
            >
              −
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
            >
              归位
            </button>
            <button
              aria-label="放大地图"
              onClick={() => setZoom(Math.min(1.8, zoom + 0.15))}
            >
              ＋
            </button>
            <span>拖动探索 · 点击地标进入</span>
          </div>
        </div>
        <div className="travel-journal">
          <span className="chapter-kicker">EXPLORER'S JOURNAL</span>
          <h2>下一站，去哪里？</h2>
          <div className="journal-art">
            <svg viewBox="-130 -120 260 200">
              <Landscape theme={hover} />
            </svg>
          </div>
          <span className="journal-location">
            第 {String(hover + 1).padStart(2, "0")} 章 · {b.land}
          </span>
          <h3>{b.name}</h3>
          <p>这里保存你的真实经历。没有必须赶上的进度，也没有被锁住的道路。</p>
          <div className="journal-count">
            <strong>
              {list.filter((n) => n.status === "已完成").length}
              <small> / {list.length}</small>
            </strong>
            <span>亲自确认完成的节点</span>
          </div>
          <button className="primary" onClick={() => onBranch(b.id)}>
            踏上这条路线 ↗
          </button>
          <div className="journal-divider">✧</div>
          <button className="journal-collection" onClick={onCollection}>
            <span>▱ 我的卡牌图鉴</span>
            <strong>{cards.length} 张收藏 →</strong>
          </button>
          <p className="journal-note">
            全世界已确认 {done} 个节点
            <br />
            草稿只是故事的开头，不代表已经完成。
          </p>
        </div>
      </div>
      <div className="world-legend">
        <span>✧ 待确认的故事</span>
        <span>⚑ 正在探索</span>
        <span>✓ 由你确认完成</span>
        <em>你的成长，没有统一的通关方式。</em>
      </div>
    </section>
  );
}
