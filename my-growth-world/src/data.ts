import { openDB } from "idb";
export const statuses = ["待确认", "计划中", "进行中", "已完成", "已归档"];
export const types = [
  "第一次尝试",
  "重要突破",
  "持续坚持",
  "独立创造",
  "克服困难",
];
export const branches = [
  ["career", "职业成长", "远航港湾", "⚑", "#d7ae63"],
  ["cognition", "认知成长", "智慧群峰", "◈", "#99b9ec"],
  ["courage", "勇气与自信", "勇气荒原", "♜", "#df997e"],
  ["health", "健康与生活", "生命森林", "❧", "#8cbda0"],
  ["social", "社交与沟通", "回声群岛", "✦", "#b7a3dc"],
  ["creation", "创造与探索", "星火工坊", "✧", "#dfba7d"],
].map(([id, name, land, icon, color]) => ({
  id,
  name,
  land,
  icon,
  color,
  createdAt: "2026-11-14T00:00:00Z",
  updatedAt: "2026-11-14T00:00:00Z",
}));
export type Entry = {
  id: string;
  title: string;
  branchId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  timeLabel: string;
  description: string;
  type: string;
  difficulty: string;
  action: string;
  result: string;
  lesson: string;
  ability: string;
  achievementIds: string[];
  parentId: string;
  attachments: unknown[];
  source?: string;
  eventId?: string;
  occurredAt?: string;
  task?: {
    id: string;
    title: string;
    category?: string;
    completedAt?: string;
    completionLevel?: string;
    growthBranchId?: string;
  };
};
export type GrowthBranch = (typeof branches)[number];
export type GrowthNode = Entry;
export type AchievementCard = Entry;
export type ActivityRecord = Entry;
export type AppSettings = { id: string; createdAt: string; updatedAt: string };
export type State = {
  format: "my-growth-world.backup";
  schemaVersion: 1;
  branches: typeof branches;
  nodes: Entry[];
  cards: Entry[];
  activities: Entry[];
  changes: Entry[];
  settings: AppSettings;
};
const seeds = [
  [
    "当前从事TikTok达人开发和运营相关工作",
    "已经制作达人筛选和合作跟进表",
    "已经制作视频脚本拆解模板",
    "已经开发调用Gemini API的达人视频分析工具",
    "正在探索达人邀约话术优化流程",
    "希望进一步学习跨境电商业务和商业分析",
  ],
  [
    "开始主动关注逻辑思维",
    "希望学习商业分析",
    "希望提高独立判断能力",
    "希望减少盲目接受他人观点的习惯",
    "希望能够独立分析企业竞争和商业决策",
  ],
  [
    "高三阶段开始意识到需要改变自己",
    "主动卸载游戏和短视频，尝试投入学习",
    "逐渐减少对游戏的依赖",
    "开始主动录制个人表达视频",
    "正在训练面对镜头表达",
    "希望未来能够公开发布原创内容",
  ],
  [
    "正在调整睡眠时间",
    "希望保持每周2—3次运动",
    "希望减少短视频使用",
    "希望建立长期可持续的生活习惯",
  ],
  [
    "希望提高主动沟通能力",
    "希望减少对他人评价的过度在意",
    "希望认识志同道合、共同学习的朋友",
    "希望提高英语口语表达能力",
  ],
  [
    "大学阶段曾主动进行自学",
    "曾经参加比赛",
    "曾经准备专升本考试，最终没有考上",
    "开始尝试使用Codex开发工具",
    "开始探索AI应用",
    "希望未来尝试AI自媒体和内容创作",
  ],
];
export function entry(): Entry {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "",
    branchId: "career",
    status: "待确认",
    createdAt: now,
    updatedAt: now,
    date: "",
    timeLabel: "",
    description: "",
    type: types[0],
    difficulty: "",
    action: "",
    result: "",
    lesson: "",
    ability: "",
    achievementIds: [],
    parentId: "",
    attachments: [],
  };
}
export function initial(): State {
  const now = new Date().toISOString();
  return {
    format: "my-growth-world.backup",
    schemaVersion: 1,
    branches,
    nodes: seeds.flatMap((list, i) =>
      list.map((title, j) => ({
        ...entry(),
        id: `seed-${branches[i].id}-${j}`,
        title,
        branchId: branches[i].id,
        timeLabel: title.startsWith("高三")
          ? "高三阶段"
          : title.startsWith("大学")
            ? "大学阶段"
            : "",
        parentId: j ? `seed-${branches[i].id}-${j - 1}` : "",
      })),
    ),
    cards: [],
    activities: [],
    changes: [],
    settings: { id: "settings", createdAt: now, updatedAt: now },
  };
}
const db = () =>
  openDB("my-growth-world", 1, {
    upgrade(db) {
      db.createObjectStore("archive");
    },
  });
export async function load(): Promise<State> {
  const value = (await (await db()).get("archive", "current")) || initial();
  return { ...value, changes: value.changes || [] };
}
export async function save(s: State) {
  await (await db()).put("archive", s, "current");
}
export async function backup(s: State) {
  await (await db()).put("archive", s, "before-restore");
}
export async function previous() {
  return (await db()).get("archive", "before-restore") as Promise<
    State | undefined
  >;
}
export function parseImport(raw: string): {
  nodes: Entry[];
  cards: Entry[];
  activities: Entry[];
  changes: Entry[];
} {
  const v = JSON.parse(raw);
  if (v.schemaVersion !== 1) throw Error("不支持的版本");
  if (v.format === "my-growth-world.activity-import") {
    if (!Array.isArray(v.events)) throw Error("事件格式错误");
    const activities = v.events.map((e: any) => {
      if (
        !e ||
        typeof e.eventId !== "string" ||
        !e.eventId ||
        e.eventType !== "task.completed" ||
        !e.task ||
        typeof e.task.title !== "string" ||
        !e.task.title.trim() ||
        typeof e.occurredAt !== "string" ||
        !Number.isFinite(Date.parse(e.occurredAt))
      )
        throw Error("日常事件缺少必要字段");
      return {
        ...entry(),
        id: `event-${e.eventId}`,
        eventId: e.eventId,
        source: typeof e.source === "string" ? e.source : "external",
        occurredAt: e.occurredAt,
        task: e.task,
        title: e.task.title,
        branchId: branches.some((b) => b.id === e.task.growthBranchId)
          ? e.task.growthBranchId
          : "cognition",
        date: e.occurredAt.slice(0, 10),
        status: "已完成",
        description: JSON.stringify(e.task),
      };
    });
    return { nodes: [], cards: [], activities, changes: [] };
  }
  if (v.format !== "my-growth-world.backup") throw Error("不是成长世界备份");
  v.changes ??= [];
  for (const key of ["nodes", "cards", "activities", "changes"]) {
    if (!Array.isArray(v[key])) throw Error("备份结构不完整");
    v[key] = v[key].map((e: any) => {
      if (
        typeof e.id !== "string" ||
        !e.id ||
        typeof e.title !== "string" ||
        !branches.some((b) => b.id === e.branchId) ||
        !statuses.includes(e.status)
      )
        throw Error("记录字段无效");
      const base = entry();
      for (const k of Object.keys(base)) {
        if (k === "achievementIds" || k === "attachments") {
          if (
            e[k] !== undefined &&
            (!Array.isArray(e[k]) ||
              (k === "achievementIds" &&
                e[k].some((id: unknown) => typeof id !== "string")))
          )
            throw Error("关联格式无效");
        } else if (e[k] !== undefined && typeof e[k] !== "string")
          throw Error("记录类型无效");
      }
      if (e.eventId !== undefined && typeof e.eventId !== "string")
        throw Error("事件 ID 格式无效");
      return { ...base, ...e };
    });
  }
  return v;
}
export function merge(s: State, incoming: ReturnType<typeof parseImport>) {
  const next = { ...s };
  let added = 0,
    duplicates = 0;
  for (const key of ["nodes", "cards", "activities", "changes"] as const) {
    const ids = new Set(s[key].map((e) => e.id));
    const events = new Set(s[key].map((e) => e.eventId).filter(Boolean));
    next[key] = [...s[key]];
    for (const e of incoming[key]) {
      if (ids.has(e.id) || (e.eventId && events.has(e.eventId))) {
        duplicates++;
        continue;
      }
      ids.add(e.id);
      if (e.eventId) events.add(e.eventId);
      next[key].push(e);
      added++;
    }
  }
  return { next, added, duplicates };
}
