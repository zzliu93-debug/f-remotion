# Remotion 实现规范

实现必须以已通过 `scripts/validate_motion_plan.py` 的 `analysis/motion-plan.json` 为契约。时间、颜色、字体、构图、图层顺序、编舞、退场和技术分级均从计划读取；发现不可行时先更新计划，不得临场回退到旧 V4 外观。

## 两阶段输出

- 审片阶段固定输出 1K/30fps，常见横版 `1920×1080`、竖版 `1080×1920`、方形 `1080×1080`；其他比例保留原纵横比，以 1080 像素为基准边。
- 用户确认前的所有修改继续使用 1K/30fps。用户确认画面后，才按其指定的最终分辨率和帧率渲染正式版。
- 只改变同纵横比分辨率或 fps 时，不重新设计、不重排事件；改变纵横比时先重排，并重新输出一版 1K/30fps 审片版。
- 审片版与正式版使用不同且递增的文件名，任何阶段都不覆盖用户已确认版本。

## 时间轴

- `motion-plan.json` 的 `video.fps` 固定为 `30`，所有 `startFrame`、`endFrame`、`choreography.frame`、`proofFrames` 和 `excludedRanges` 都使用这个审片时间基准。
- 先把字幕毫秒换算成 30fps 审片帧，再定义 `<Sequence>`；时间语义的唯一来源是秒数，不是最终输出的绝对帧号。
- 实现时先把计划帧除以 `plan.video.fps` 得到秒，再乘当前 `useVideoConfig().fps` 得到运行帧。不得把计划帧直接用于 50/60fps Composition。

```tsx
const {fps} = useVideoConfig();
const fromPlanFrame = (draftFrame: number) =>
  Math.round((draftFrame / motionPlan.video.fps) * fps);
```

- 动画时长同样以秒或 30fps 计划帧保存，再经 `fromPlanFrame()` 转换。这样 30fps 审片版和高帧率正式版拥有相同的真实时间与口播落点。
- 先为同一叙事任务分配 `visualGroupId`，再定义 `<Sequence>`；不得按字幕条数或“每两句”自动切组。
- 语义组不使用负间隔制造无依据的重叠。组间允许 0.15–0.5 秒或更长的有意留白；人物表演、停顿或已有素材需要空间时，不必首尾填满。
- 元素进入帧以对应关键词为锚点；是否提前建立注意、提前多少和何时完整出现均写入 choreography，不得提前泄露结论。
- 退出时长与方式由 exitLogic 决定；下一组在上一组视觉上不可见后再开始。
- 运动秒数先由导演计划确定，再按 Composition fps 换算成帧，不从旧文字/卡片范围取默认值。
- 先维护用户已插入画面的 `excludedRanges`。任何动效 `<Sequence>` 及其场景根背景、前置入场和退场残影都不得与这些区间相交；跨区间语义组应拆分、延后或留白。
- SRT 默认只用于换算帧和语义同步。除非用户明确要求显示字幕，否则不要导入或渲染 Caption 组件。

## 组内节奏

严格执行计划中排序后的 `choreography`。栏目头、主标题、卡片、连接线和逐项出现都不是默认顺序；每个元素的建立、更新和退出应与本片 motionGrammar 及对应关键词一致。

不要让所有元素在同一帧争抢注意力。时长不是阶段切换条件：同一概念或论证仍在继续时，主锚点可以长期驻留；只有新增台词带来值得可视化的新属性、证据、层级或转折时，才局部更新。没有新增视觉任务时保持稳定，不添加循环动画。

## 透明合成

- `OverlayShell`/场景根节点必须是透明画布，只承载动效元素和整组元素的进退场。
- 不要在场景根节点加入全屏 `background`、`linear-gradient`、`mixBlendMode: color`、蒙版、模糊或随语义色变化的调色层。
- 深色卡片、标识行和数据面板可有局部表面，但其边界必须贴合内容；直排文字优先用字重、描边或轻微阴影提升可读性。
- 场景退出只改变动效元素透明度。抽查没有动效覆盖的画面区域，切组前后像素亮度与色相应保持来自原视频的连续变化。

## 运动语言

使用 `useCurrentFrame()` 与 `interpolate()`，显式设置 `extrapolateLeft/Right: "clamp"`。

下面只是一种可用于计划指定“柔和进入”的实现示例，不是默认运动：

```tsx
opacity: interpolate(frame, [start, start + 24], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.bezier(0.16, 1, 0.3, 1),
}),
translate: interpolate(frame, [start, start + 34], ["-24px 10px", "0px 0px"], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.bezier(0.16, 1, 0.3, 1),
})
```

- 动作类型、距离、缩放、旋转、spring/bezier 和持续帧数来自 motionGrammar 与逐场 choreography。
- 中文按整词/整行运动；若计划使用遮罩、路径或字形运动，必须检查所有中间帧不出现半字。
- 连接、替换和确认动作必须在关系成立帧完成。
- 退场执行 `exitLogic`；只有计划明确选择时才整体淡出并回撤。

## 布局与层级

- 计划中的 `video.width`/`height` 是 1K 审片设计坐标。正式输出保持同纵横比时，按 `width / plan.video.width` 等比缩放位置、字号、间距、线宽和局部表面；不要只放大画布而保留 1K 像素常量。
- 改变纵横比不能只做非等比拉伸；重新计算动态安全区和构图落点，并先走一轮 1K/30fps 审片确认。
- 根据人物位置选择左侧或右侧安全区，不固定使用左侧。
- 画中动效不要覆盖原字幕；至少保留字幕背景框以上一段安全距离。
- 同屏优先保持 1 个主层级、1 个解释层级、最多 3–4 个并列项。
- 主标题、定义面板和卡片组不必同时存在；用阶段切换控制密度。
- 根画布保持透明；局部卡片只服务于其内部信息的可读性，不要遮黑或调色整幅视频。
- 局部表面的圆角、描边、阴影、纹理和色彩来自本片 surfaceSystem 与 palette；全片一致不等于每段同一轮廓。

## 组件结构

先按计划中的场景、层级和技术拆分组件。通常保留一个透明根合成层、按 `visualGroupId` 划分的业务场景，以及少量真正复用的逐帧原语；不要为了沿用旧 API 强迫新设计变成 `SectionHeader + InfoPanel + GrowLine`。

`SemanticMotionPrimitives.tsx` 中的 `Stage`、`FadeMove`、`GrowLine`、数字与数据原语等只能在行为与计划完全一致时按需复制。默认颜色、尺寸、圆角、阴影、位移和 easing 必须改为本片 token 或显式参数，未使用的原语不要复制。

当场景变多时，每个场景单独建文件；业务文案、设计 token、编舞时间和底层运动计算分离。

新创组件时：

- 先写清它表达的语义关系和关键词完成帧。
- 把视觉常量与业务文案分开，允许同一关系在不同镜头中重排。
- 优先组合 1–3 个简单运动，不堆叠位移、缩放、旋转、模糊和发光。
- 为 `start`、`end`、方向、palette token、布局和 easing 留出参数；不要把某条视频的时间和文案写入通用原语。
- 使用 `useCurrentFrame()`、`interpolate()` 和 Remotion easing；不得回退到 CSS 动画。

## 文本与素材

- 中文字体必须确认机器和渲染环境可用；必要时随项目放入本地字体。
- 对长中文做真实尺寸检查，避免只凭字符数估宽。
- 图标先从台词识别实体，再使用用户提供、项目已有或来源与使用权明确的官方资产。不要临摹或生成近似品牌 Logo；没有可靠资产时退回文字标签或中性几何符号。
- 图表只使用台词、用户资料或可核验画面中的真实数字。先记录单位、上下界、比较对象和共同尺度，再选择 `MetricBar`、比较柱或 `VerifiedRangeCountUp`。
- 保留原视频音轨时使用 `<Video>`，确认最终输出仍包含音频流。

## 版本策略

审片输出使用递增文件名，如 `video-draft-1k30-v1.mp4`、`video-draft-1k30-v2.mp4`；用户确认后使用 `video-final-4k60-v1.mp4` 一类能看出交付规格的名称。不要覆盖用户已确认版本；代码修改前检查工作区已有变更并保留无关内容。

实验性新动效使用独立 Composition 或递增版本。用户确认前不得覆盖旧确认版本，也不得把单片方案写成全局默认资产。
