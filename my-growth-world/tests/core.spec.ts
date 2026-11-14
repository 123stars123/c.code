import { test, expect } from "@playwright/test";
test("草稿、节点、收藏增删改、持久化与备份恢复", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "我的成长世界" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "技能树", exact: true }).click();
  await expect(page.locator(".node")).toHaveCount(6);
  await expect(page.locator(".node.complete")).toHaveCount(0);
  await page.getByRole("button", { name: "创建成长节点" }).click();
  await page.getByLabel("名称", { exact: true }).fill("测试成长节点");
  await page.getByLabel("状态（手动确认）").selectOption("进行中");
  await page.getByRole("button", { name: "保存记录" }).click();
  await expect(page.locator(".node")).toHaveCount(7);
  await page.getByRole("button", { name: /成就收藏馆/ }).click();
  await page.getByRole("button", { name: "创建成就卡片", exact: true }).click();
  await page.getByLabel("名称", { exact: true }).fill("第一次独立创造");
  await page.getByLabel("经历描述").fill("真实经历内容");
  await page.getByRole("button", { name: "保存记录" }).click();
  await expect(page.locator(".achievement")).toHaveCount(1);
  await page.reload();
  await page.getByRole("button", { name: /成就收藏馆/ }).click();
  await expect(page.locator(".achievement")).toContainText("第一次独立创造");
  await page.locator(".achievement").click();
  await page.getByLabel("名称", { exact: true }).fill("编辑后的成就");
  await page.getByLabel("状态（手动确认）").selectOption("已完成");
  await page.getByRole("button", { name: "保存记录" }).click();
  await expect(page.locator(".achievement")).toContainText("编辑后的成就");
  await page.getByRole("button", { name: "成长地图", exact: true }).click();
  for (const name of [
    "职业成长",
    "认知成长",
    "勇气与自信",
    "健康与生活",
    "社交与沟通",
    "创造与探索",
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator(".treehead h2")).toHaveText(name);
    await page.getByRole("button", { name: "成长地图", exact: true }).click();
  }
  await page.getByRole("button", { name: "数据管理", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出完整 JSON 备份" }).click();
  const download = await downloadPromise;
  const file = await download.path();
  expect(file).toBeTruthy();
  await page.locator("input[type=file]").setInputFiles(file!);
  await expect(page.locator(".preview")).toContainText("将新增 0 条");
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "确认备份并合并恢复" }).click();
  await expect(page.locator(".preview")).toHaveCount(0);
  await page.locator("input[type=file]").setInputFiles({
    name: "events.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        format: "my-growth-world.activity-import",
        schemaVersion: 1,
        events: [
          {
            eventId: "event-one",
            eventType: "task.completed",
            source: "desktop-pet",
            occurredAt: "2026-11-14T08:00:00Z",
            task: {
              id: "t1",
              title: "AI学习20分钟",
              growthBranchId: "cognition",
            },
          },
        ],
      }),
    ),
  });
  await expect(page.locator(".preview")).toContainText("将新增 1 条");
  await page.getByRole("button", { name: "确认备份并合并恢复" }).click();
  await page.getByRole("button", { name: "成长时间线", exact: true }).click();
  await expect(
    page.locator(".event").filter({ hasText: "AI学习20分钟" }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: /成就收藏馆/ }).click();
  await page.locator(".achievement").click();
  await page.getByRole("button", { name: "删除记录" }).click();
  await expect(page.locator(".achievement")).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: /成就收藏馆/ }).click();
  await expect(page.locator(".achievement")).toHaveCount(0);
});
test("非法导入不会改写档案", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "数据管理", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schemaVersion":99}'),
  });
  await expect(page.getByRole("alert")).toContainText("不支持的版本");
  await expect(page.locator(".preview")).toHaveCount(0);
});
test("节点确认、状态日志、删除与重新打开", async ({ page, context }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "技能树", exact: true }).click();
  await page.locator(".node").first().click();
  await page.getByLabel("状态（手动确认）").selectOption("已完成");
  await page.getByRole("button", { name: "保存记录" }).click();
  await expect(page.locator(".node.complete")).toHaveCount(1);
  await page.getByRole("button", { name: "成长时间线", exact: true }).click();
  await expect(
    page
      .locator(".event")
      .filter({ hasText: "状态由「待确认」变为「已完成」" }),
  ).toHaveCount(1);
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto("/");
  await reopened.getByRole("button", { name: "技能树", exact: true }).click();
  await expect(reopened.locator(".node.complete")).toHaveCount(1);
  reopened.on("dialog", (d) => d.accept());
  await reopened.locator(".node").first().click();
  await reopened.getByRole("button", { name: "删除记录" }).click();
  await expect(reopened.locator(".node")).toHaveCount(5);
});

test("关联成就、真正恢复丢失记录以及事件重复导入", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /成就收藏馆/ }).click();
  await page.getByRole("button", { name: "创建成就卡片", exact: true }).click();
  await page.getByLabel("名称", { exact: true }).fill("备份恢复验证");
  await page.getByRole("button", { name: "保存记录" }).click();
  await page.getByRole("button", { name: "技能树", exact: true }).click();
  await page.locator(".node").first().click();
  await page.getByLabel("备份恢复验证", { exact: true }).check();
  await page.getByRole("button", { name: "保存记录" }).click();
  await expect(page.locator(".node").first()).toContainText("1 张关联成就");
  await page.getByRole("button", { name: "数据管理", exact: true }).click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出完整 JSON 备份" }).click();
  const backupPath = await (await downloaded).path();
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: /成就收藏馆/ }).click();
  await page.locator(".achievement").click();
  await page.getByRole("button", { name: "删除记录" }).click();
  await page.getByRole("button", { name: "数据管理", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles(backupPath!);
  await expect(page.locator(".preview")).toContainText("将新增 1 条");
  await page.getByRole("button", { name: "确认备份并合并恢复" }).click();
  await page.getByRole("button", { name: /成就收藏馆/ }).click();
  await expect(page.locator(".achievement")).toContainText("备份恢复验证");
  await page.getByRole("button", { name: "数据管理", exact: true }).click();
  const file = {
    name: "events.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        format: "my-growth-world.activity-import",
        schemaVersion: 1,
        events: [
          {
            eventId: "repeated-event",
            eventType: "task.completed",
            source: "desktop-pet",
            occurredAt: "2026-11-14T08:00:00Z",
            task: { id: "t", title: "日常学习" },
          },
        ],
      }),
    ),
  };
  await page.locator("input[type=file]").setInputFiles(file);
  await page.getByRole("button", { name: "确认备份并合并恢复" }).click();
  await expect(page.locator(".preview")).toHaveCount(0);
  await page.locator("input[type=file]").setInputFiles(file);
  await expect(page.locator(".preview")).toContainText("将新增 0 条");
  await expect(page.locator(".preview")).toContainText("跳过 1 条");
});

test("探索地图缩放拖动、直达故事以及手动点亮", async ({ page }) => {
  await page.goto("/");
  const world = page.locator(".illustrated-world");
  await expect(world).toBeVisible();
  await expect(page.locator(".map-footstep")).toHaveCount(18);
  await page.getByRole("button", { name: "放大地图", exact: true }).click();
  await expect(world).toHaveAttribute("style", /scale\(1\.15\)/);
  const box = await page.locator(".atlas").boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + 35);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 60, box!.y + 70);
  await page.mouse.up();
  await expect(world).not.toHaveAttribute("style", /translate\(0px, 0px\)/);
  await page.getByRole("button", { name: "归位", exact: true }).click();
  await expect(world).toHaveAttribute(
    "style",
    /translate\(0px, 0px\) scale\(1\)/,
  );
  await page
    .getByRole("button", {
      name: "探索经历：当前从事TikTok达人开发和运营相关工作",
      exact: true,
    })
    .click();
  await expect(page.locator(".story-opening")).toContainText("待确认的故事");
  await page.getByLabel("状态（手动确认）").selectOption("已完成");
  await page.getByRole("button", { name: "保存记录" }).click();
  await expect(
    page.getByRole("button", { name: "职业成长", exact: true }),
  ).toContainText("1 / 6 已确认完成");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "职业成长", exact: true }),
  ).toContainText("1 / 6 已确认完成");
});
