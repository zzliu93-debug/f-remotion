# f-remotion

一个面向中文口播、教程和知识视频的 Remotion 画中动效 Skill。

它内置一个编码前工作的“画面动效导演”：先通读完整视频与 SRT，提出多个构图和运动方向，再为本片确定独有的画面母题、调色、字体、材质、出场顺序、退场和 Remotion 可行性，最后生成可校验的 `motion-plan.json` 交给实现层。

默认采用两阶段交付：第一版和确认前的修改版统一输出 1K/30fps 审片视频，只做少量阻断性检查；用户确认画面后，再按指定分辨率和帧率渲染正式版。

旧 V4 现在只保留为透明合成、中文可读性、信息密度和完成度的历史基准，不再提供默认蓝绿红黄、暗色卡片或淡入上移模板。现有素材库只在导演方案确定后作为工程零件使用。

## 特点

- 不需要额外提供参考视频，导演从目标视频与完整台词建立本片视觉世界。
- 先完成语义编辑，再在不读取旧场景库的隔离状态下发散三个结构不同的方向。
- 每条片重新定义 palette、typography、compositionSystem、surfaceSystem、motionGrammar 和 exitLogic。
- 计划按 `native / dependency / preproduction` 标记 Remotion 可行性，高风险方案必须有等义回退。
- `validate_motion_plan.py` 会检查时间范围、禁区、场景交叠、编舞事件、关键帧和技术依赖。
- 第一版统一为 1080p 级 1K/30fps；计划帧经秒数换算适配最终帧率，不会因 30fps 切到 60fps 而改变同步与动画时长。
- 审片阶段直接渲染完整草稿，只在明确风险出现时补静帧或短片段；逐帧解码留到用户确认后的正式交付。
- 大动效按完整叙事任务而非字幕条数或“每两句”分组，同一主锚点可以跨多句驻留并局部更新。
- 按重点、定义、顺序、因果、对比、并列、边界、状态变化和数据等关系完成语义编辑，再由导演生成画面。
- 内置整词级联、状态替换、阶段轨道、实体标识行、一次性确认、真实数字增长、区间计数和证据图表等可选能力，但不会机械调用。
- 场景根节点不添加全屏暗部渐变或语义调色层；局部材质与表面必须贴合信息边界并来自本片计划。
- 现有组件不决定画面；只有与导演计划完全一致的底层能力才复用，否则直接编写新的 Remotion 场景。
- 能从后续参考片中提炼可迁移能力，并区分话题内容、作者素材和镜头氛围；不会为了模仿而硬加组件。
- 不为“科技感”机械添加大英文、扫描线、进度条、网格或假数据。
- SRT 默认只用于语义和帧时间轴；除非用户明确要求，否则不会生成字幕层。
- 自动识别用户已插入的截图、录屏、B-roll 和画中画，并将其完整区间设为禁加动效区。
- 包含 SRT 到 Remotion 帧号的转换工具。
- 包含可直接复制到项目中的 Remotion 动效原语。
- 包含面向快速审片与正式交付的分级验收流程。

![f-remotion style board](skills/f-remotion/assets/style-board.svg)

## 安装

将 [`skills/f-remotion`](skills/f-remotion) 目录复制到本机 Codex Skills 目录：

```text
~/.codex/skills/f-remotion
```

重新打开任务后即可使用：

```text
使用 $f-remotion。
```

正常项目只需要提供目标视频和对应字幕/SRT。

## 目录

```text
skills/f-remotion/
├── SKILL.md
├── HANDOFF.md
├── agents/openai.yaml
├── director/
│   ├── SKILL.md
│   └── remotion-capability-map.md
├── assets/
│   ├── SemanticMotionPrimitives.tsx
│   ├── style-board.svg
│   └── approved-v4-source/
├── references/
│   ├── semantic-matching.md
│   ├── motion-library.md
│   └── ...
└── scripts/
    ├── srt_to_timeline.py
    └── validate_motion_plan.py
```

`approved-v4-source` 是计划完成后才能查看的历史实现范例，其中的配色、卡片、示例文案、运动组合和固定时间点不应复制到新项目；新视频的画面由导演计划决定。

## SRT 时间轴工具

```console
python skills/f-remotion/scripts/srt_to_timeline.py input.srt --fps 30 --format markdown
```

## License

[MIT](LICENSE)
