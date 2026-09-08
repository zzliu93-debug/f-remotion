---
name: f-remotion
description: 将目标视频和 SRT/字幕制作成内置 F Remotion 风格的 Remotion 画中动效。默认直接复用用户已确认的 V4 视觉与运动方案：左侧暗部渐变、中文信息层级、蓝绿红黄细描边暗卡、柔和帧动画、语义驱动的标题/流程/步骤/清单/边界/结论场景，以及严格无交叠的字幕同步时间轴；不需要用户再次提供参考视频。适用于新的口播、教程和知识视频，或继续调整采用该固定风格的 Remotion 项目。仅当用户明确要求更换风格时才分析其他参考片。
---

# F Remotion

默认应用已经确认满意的 V4 风格预设。不要询问参考视频；目标视频和字幕就是正常输入，Skill 内置的样板、参数和源码快照就是风格依据。

## 默认输入

优先接收：

- 一条目标视频。
- 与口播对应的 SRT、JSON 字幕或其他可换算时间轴。
- 用户希望强调或避免的内容（如果有）。

没有字幕但视频包含口播时，先生成时间轴或请求字幕。没有外部参考视频不是缺失条件，不得因此阻塞任务。

## 必须先加载的内置基准

开始设计前：

1. 读取 [style-preset.md](references/style-preset.md)。这是默认风格的权威规格。
2. 查看 [style-board.svg](assets/style-board.svg)，确认画面密度和场景差异。
3. 需要判断速度、入场或阶段切换时，对照风格参数并检查 [MotionScenes.tsx](assets/approved-v4-source/MotionScenes.tsx)。
4. 编码前参考 [MotionScenes.tsx](assets/approved-v4-source/MotionScenes.tsx) 和 [VideoWithMotion.tsx](assets/approved-v4-source/VideoWithMotion.tsx)。把它们作为确认版本的实现范例，不照抄其中的微信支付文案和固定六段时间。

## 硬性规则

1. 保留 V4 的视觉质感和运动语言，替换成新视频的真实语义、场景数量和时间点。
2. 先理解字幕，再从内置场景原型中选择版式；不得给每段机械套同一标题。
3. 中文承担主要信息。不把英文当装饰，只保留原话、官方名称或必要行业缩写。
4. 不添加扫描线、常驻进度条、技术网格、假数据、随机字符或无来源微文案。
5. 一次只显示一个语义组。相邻 `<Sequence>` 默认首尾相接且视觉不交叠。
6. 关键词、卡片和状态必须在相应台词说到时进入；不得提前演完，也不得完成后长时间无变化。
7. 长语义组用“阶段切换”更新画面，例如核心概念揭晓后切到定义和实例，不使用无意义循环动画。
8. 保护人物、字幕和重要物体。V4 默认左侧布局；若目标人物占左侧，可镜像到右侧，但不得改变组件质感。
9. 所有运动使用 `useCurrentFrame()`、`interpolate()` 和 Remotion easing；不得使用 CSS transition/animation。
10. 不覆盖用户已确认的旧版本；使用递增输出文件名。

## 制作流程

### 1. 检查目标视频

读取时长、分辨率、帧率和音轨。抽取若干帧，确认：

- 人物、产品和字幕的位置。
- 左右哪一侧适合作为动效安全区。
- 背景亮度是否需要调整预设渐变强度。

保持 V4 的 16:9 设计比例；其他比例按 [style-preset.md](references/style-preset.md) 的缩放与重排规则处理。

### 2. 建立字幕帧时间轴

运行：

```console
python scripts/srt_to_timeline.py input.srt --fps 60 --format markdown
```

按话题转折、因果、步骤、列举和结论合并字幕，不按相等时长切段。为每组先记录：

```text
起止帧 | 对应原话 | 本段任务 | 场景原型 | 元素进入帧 | 阶段切换帧 | 退出帧
```

### 3. 选择 V4 场景原型

读取 [scene-archetypes.md](references/scene-archetypes.md)，在以下已确认的表现中变通：

- 中文钩子：重大变化或开头核心卖点。
- 条件分支：前提、门槛和依赖关系。
- 决策路径：两难、成本前置和因果关系。
- 步骤状态链：过程、进度和阻断点。
- 概念揭晓 → 定义/实例阶段：真正的核心概念。
- 权益/例子清单：并列内容。
- 禁止边界：限制、不可用范围和例外。
- 结论确认卡：最终判断和条件成立。

场景数量由新视频决定，不固定为六段。只有真实核心概念才使用大中文标题。

### 4. 实现

读取 [implementation.md](references/implementation.md)。优先复制 [SemanticMotionPrimitives.tsx](assets/SemanticMotionPrimitives.tsx) 到项目中，再按目标 Composition 调整布局。

- 用 `<Sequence>` 标记每个语义组。
- 用 `Stage` 在同一组内进行内容阶段切换。
- 用 `FadeMove` 实现整词淡入、轻位移和轻缩放。
- 用 `InfoPanel` 表达状态、条件、例子和结论。
- 只有真实顺序、因果或依赖关系才使用 `GrowLine`。
- 使用预设蓝/绿/红/黄语义色，不随机改变配色。

### 5. 验证并渲染

读取 [validation.md](references/validation.md)，依次完成：

1. lint 和 TypeScript 检查。
2. 每段的入场中、稳定态、信息补充后、退场前关键帧。
3. 开头、场景边界与复杂阶段切换的低清连续预览。
4. 文字裁切、人物遮挡、字幕遮挡、节奏错位、长期静止和场景交叠检查。
5. 完整渲染并从头到尾解码，确认视频与音轨完整。

## 外部参考片的例外

只有用户明确说“换一种风格”“模仿这个新参考片”时，才读取 [reference-analysis.md](references/reference-analysis.md) 并分析外部参考。否则始终使用内置 V4 预设，不要求或搜索其他参考视频。

## 内置资源

- [style-preset.md](references/style-preset.md)：V4 风格参数与适配规则。
- [scene-archetypes.md](references/scene-archetypes.md)：字幕语义到版式的选择表。
- [implementation.md](references/implementation.md)：Remotion 时间、运动与布局规范。
- [validation.md](references/validation.md)：预览和最终验收。
- `scripts/srt_to_timeline.py`：SRT 到帧时间轴工具。
- `assets/style-board.svg`：不含真人素材的开源视觉样板。
- `assets/approved-v4-source/MotionScenes.tsx`：确认版本的场景实现快照。
- `assets/approved-v4-source/VideoWithMotion.tsx`：确认版本的无交叠时间轴快照。
- `assets/SemanticMotionPrimitives.tsx`：可复制的通用组件。
