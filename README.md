# f-remotion

一个面向中文口播、教程和知识视频的 Remotion 画中动效 Skill。

它内置了一套已经过多轮实际视频迭代的视觉与运动规范：暗部渐变、中文信息层级、蓝绿红黄语义色、细描边深色卡片、柔和帧动画，以及严格跟随字幕且不交叠的时间轴。

## 特点

- 不需要额外提供参考视频，直接使用内置 V4 风格。
- 根据字幕语义选择中文钩子、条件分支、决策路径、步骤链、实例清单、能力边界或结论卡。
- 不为“科技感”机械添加大英文、扫描线、进度条、网格或假数据。
- 包含 SRT 到 Remotion 帧号的转换工具。
- 包含可直接复制到项目中的 Remotion 动效原语。
- 包含关键帧、连续预览和全片解码验收流程。

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
├── agents/openai.yaml
├── assets/
│   ├── SemanticMotionPrimitives.tsx
│   ├── style-board.svg
│   └── approved-v4-source/
├── references/
└── scripts/srt_to_timeline.py
```

`approved-v4-source` 是风格实现范例，其中的示例文案和固定时间点不应复制到新项目；新视频的场景数量、内容和时间必须由自身字幕决定。

## SRT 时间轴工具

```console
python skills/f-remotion/scripts/srt_to_timeline.py input.srt --fps 60 --format markdown
```

## License

[MIT](LICENSE)
