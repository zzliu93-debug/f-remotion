#!/usr/bin/env python3
"""Validate the executable invariants of an F Remotion motion plan."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


EVENTS = {"enter", "update", "hold", "exit"}
TIERS = {"native", "dependency", "preproduction"}
DRAFT_TIMEBASE_FPS = 30
DRAFT_BASE_EDGE = 1080


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate analysis/motion-plan.json before Remotion implementation."
    )
    parser.add_argument("plan", help="Path to motion-plan.json, or - to read stdin")
    return parser.parse_args()


def read_plan(source: str) -> Any:
    if source == "-":
        return json.load(sys.stdin)
    with Path(source).open("r", encoding="utf-8-sig") as handle:
        return json.load(handle)


def is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


class Validator:
    def __init__(self) -> None:
        self.errors: list[str] = []

    def error(self, path: str, message: str) -> None:
        self.errors.append(f"{path}: {message}")

    def obj(self, value: Any, path: str) -> dict[str, Any] | None:
        if not isinstance(value, dict):
            self.error(path, "must be an object")
            return None
        return value

    def items(self, value: Any, path: str) -> list[Any] | None:
        if not isinstance(value, list):
            self.error(path, "must be an array")
            return None
        return value

    def text(self, obj: dict[str, Any], key: str, path: str) -> str | None:
        value = obj.get(key)
        if not isinstance(value, str) or not value.strip():
            self.error(f"{path}.{key}", "must be a non-empty string")
            return None
        return value.strip()

    def integer(
        self,
        obj: dict[str, Any],
        key: str,
        path: str,
        *,
        minimum: int | None = None,
    ) -> int | None:
        value = obj.get(key)
        if not isinstance(value, int) or isinstance(value, bool):
            self.error(f"{path}.{key}", "must be an integer")
            return None
        if minimum is not None and value < minimum:
            self.error(f"{path}.{key}", f"must be >= {minimum}")
            return None
        return value

    def string_array(
        self,
        obj: dict[str, Any],
        key: str,
        path: str,
        *,
        allow_empty: bool,
    ) -> list[str] | None:
        value = self.items(obj.get(key), f"{path}.{key}")
        if value is None:
            return None
        if not allow_empty and not value:
            self.error(f"{path}.{key}", "must not be empty")
        for index, item in enumerate(value):
            if not isinstance(item, str) or not item.strip():
                self.error(f"{path}.{key}[{index}]", "must be a non-empty string")
        return value if all(isinstance(item, str) for item in value) else None

    def validate(self, plan: Any) -> None:
        root = self.obj(plan, "$")
        if root is None:
            return

        version = root.get("version")
        if version != 1:
            self.error("$.version", "must be integer 1")

        video = self.obj(root.get("video"), "$.video")
        duration = None
        if video is not None:
            fps = video.get("fps")
            if not is_number(fps) or fps <= 0:
                self.error("$.video.fps", "must be a positive number")
            elif fps != DRAFT_TIMEBASE_FPS:
                self.error(
                    "$.video.fps",
                    f"must be {DRAFT_TIMEBASE_FPS}; motion-plan frames use the fixed draft timebase",
                )
            width = self.integer(video, "width", "$.video", minimum=1)
            height = self.integer(video, "height", "$.video", minimum=1)
            if width is not None and height is not None and min(width, height) != DRAFT_BASE_EDGE:
                self.error(
                    "$.video",
                    f"draft dimensions must preserve aspect ratio with a {DRAFT_BASE_EDGE}px base edge",
                )
            duration = self.integer(video, "durationFrames", "$.video", minimum=1)

        direction = self.obj(root.get("creativeDirection"), "$.creativeDirection")
        if direction is not None:
            selected_direction = self.text(
                direction, "selectedDirection", "$.creativeDirection"
            )
            for key in (
                "thesis",
                "audienceFeeling",
                "governingMetaphor",
                "typography",
                "compositionSystem",
                "surfaceSystem",
                "continuityDevice",
                "blankStrategy",
            ):
                self.text(direction, key, "$.creativeDirection")
            self.string_array(
                direction, "avoid", "$.creativeDirection", allow_empty=True
            )
            self.validate_palette(direction.get("palette"))
            self.validate_motion_grammar(direction.get("motionGrammar"))
            explored_names = self.validate_direction_exploration(
                direction.get("directionExploration")
            )
            if selected_direction and selected_direction not in explored_names:
                self.error(
                    "$.creativeDirection.selectedDirection",
                    "must match a name in directionExploration",
                )

        excluded = self.validate_ranges(root.get("excludedRanges"), duration)
        scenes = self.items(root.get("scenes"), "$.scenes")
        if scenes is not None:
            self.validate_scenes(scenes, duration, excluded)

    def validate_palette(self, value: Any) -> None:
        palette = self.items(value, "$.creativeDirection.palette")
        if palette is None:
            return
        if len(palette) < 2:
            self.error(
                "$.creativeDirection.palette",
                "must define at least two explicit color roles",
            )
        names: set[str] = set()
        for index, item in enumerate(palette):
            path = f"$.creativeDirection.palette[{index}]"
            token = self.obj(item, path)
            if token is None:
                continue
            name = self.text(token, "name", path)
            self.text(token, "value", path)
            self.text(token, "role", path)
            self.text(token, "source", path)
            if name:
                if name in names:
                    self.error(f"{path}.name", f"duplicate palette name {name!r}")
                names.add(name)

    def validate_motion_grammar(self, value: Any) -> None:
        grammar = self.obj(value, "$.creativeDirection.motionGrammar")
        if grammar is None:
            return
        self.string_array(
            grammar, "primaryVerbs", "$.creativeDirection.motionGrammar", allow_empty=False
        )
        for key in ("enterRule", "updateRule", "exitRule", "tempo", "easing"):
            self.text(grammar, key, "$.creativeDirection.motionGrammar")

    def validate_direction_exploration(self, value: Any) -> set[str]:
        path = "$.creativeDirection.directionExploration"
        directions = self.items(value, path)
        if directions is None:
            return set()
        if len(directions) < 3:
            self.error(path, "must contain at least three genuinely different directions")
        names: set[str] = set()
        for index, item in enumerate(directions):
            item_path = f"{path}[{index}]"
            direction = self.obj(item, item_path)
            if direction is None:
                continue
            name = self.text(direction, "name", item_path)
            for key in (
                "coreImage",
                "paletteLogic",
                "compositionSilhouette",
                "motionLaw",
                "footageConnection",
                "strength",
                "risk",
                "feasibility",
                "decision",
            ):
                self.text(direction, key, item_path)
            if name:
                if name in names:
                    self.error(f"{item_path}.name", f"duplicate direction name {name!r}")
                names.add(name)
        return names

    def validate_ranges(
        self, value: Any, duration: int | None
    ) -> list[tuple[int, int, str]]:
        raw_ranges = self.items(value, "$.excludedRanges")
        if raw_ranges is None:
            return []
        result: list[tuple[int, int, str]] = []
        previous_start = -1
        for index, item in enumerate(raw_ranges):
            path = f"$.excludedRanges[{index}]"
            block = self.obj(item, path)
            if block is None:
                continue
            start = self.integer(block, "startFrame", path, minimum=0)
            end = self.integer(block, "endFrame", path, minimum=1)
            reason = self.text(block, "reason", path)
            if start is None or end is None:
                continue
            if start >= end:
                self.error(path, "startFrame must be smaller than endFrame")
            if duration is not None and end > duration:
                self.error(f"{path}.endFrame", "must not exceed video durationFrames")
            if start < previous_start:
                self.error(path, "ranges must be sorted by startFrame")
            previous_start = start
            result.append((start, end, reason or "excluded range"))
        return result

    def validate_scenes(
        self,
        scenes: list[Any],
        duration: int | None,
        excluded: list[tuple[int, int, str]],
    ) -> None:
        seen_ids: set[str] = set()
        previous_start = -1
        previous_end = -1
        for index, item in enumerate(scenes):
            path = f"$.scenes[{index}]"
            scene = self.obj(item, path)
            if scene is None:
                continue

            scene_id = self.text(scene, "id", path)
            if scene_id:
                if scene_id in seen_ids:
                    self.error(f"{path}.id", f"duplicate scene id {scene_id!r}")
                seen_ids.add(scene_id)

            start = self.integer(scene, "startFrame", path, minimum=0)
            end = self.integer(scene, "endFrame", path, minimum=1)
            for key in (
                "spokenAnchor",
                "semanticJob",
                "visualMetaphor",
                "reasonToVisualize",
                "composition",
                "exitLogic",
                "contrastWithPrevious",
                "noMotionAlternative",
            ):
                self.text(scene, key, path)
            self.string_array(scene, "layers", path, allow_empty=False)

            if start is not None and end is not None:
                if start >= end:
                    self.error(path, "startFrame must be smaller than endFrame")
                if duration is not None and end > duration:
                    self.error(f"{path}.endFrame", "must not exceed video durationFrames")
                if start < previous_start:
                    self.error(path, "scenes must be sorted by startFrame")
                if previous_end > start:
                    self.error(path, "scene overlaps the previous scene")
                previous_start, previous_end = start, end
                for excluded_start, excluded_end, reason in excluded:
                    if start < excluded_end and excluded_start < end:
                        self.error(
                            path,
                            f"scene overlaps excluded range {excluded_start}-{excluded_end} ({reason})",
                        )

            self.validate_choreography(scene.get("choreography"), path, start, end)
            self.validate_implementation(scene.get("implementation"), path)
            self.validate_proof_frames(scene.get("proofFrames"), path, start, end)

    def validate_choreography(
        self,
        value: Any,
        scene_path: str,
        start: int | None,
        end: int | None,
    ) -> None:
        path = f"{scene_path}.choreography"
        events = self.items(value, path)
        if events is None:
            return
        if len(events) < 2:
            self.error(path, "must define at least an entrance and an exit")
        kinds: set[str] = set()
        previous_frame = -1
        for index, item in enumerate(events):
            event_path = f"{path}[{index}]"
            event = self.obj(item, event_path)
            if event is None:
                continue
            frame = self.integer(event, "frame", event_path, minimum=0)
            kind = self.text(event, "event", event_path)
            self.text(event, "target", event_path)
            self.text(event, "action", event_path)
            self.text(event, "purpose", event_path)
            if kind and kind not in EVENTS:
                self.error(f"{event_path}.event", f"must be one of {sorted(EVENTS)}")
            if kind:
                kinds.add(kind)
            if frame is not None:
                if frame < previous_frame:
                    self.error(event_path, "events must be sorted by frame")
                previous_frame = frame
                if start is not None and frame < start:
                    self.error(f"{event_path}.frame", "must be inside the scene")
                if end is not None and frame >= end:
                    self.error(f"{event_path}.frame", "must be smaller than scene endFrame")
        if "enter" not in kinds:
            self.error(path, "must include an enter event")
        if "exit" not in kinds:
            self.error(path, "must include an exit event")

    def validate_implementation(self, value: Any, scene_path: str) -> None:
        path = f"{scene_path}.implementation"
        implementation = self.obj(value, path)
        if implementation is None:
            return
        tier = self.text(implementation, "tier", path)
        techniques = self.string_array(
            implementation, "techniques", path, allow_empty=False
        )
        dependencies = self.string_array(
            implementation, "dependencies", path, allow_empty=True
        )
        fallback = self.text(implementation, "fallback", path)
        if tier and tier not in TIERS:
            self.error(f"{path}.tier", f"must be one of {sorted(TIERS)}")
        if tier == "dependency" and dependencies is not None and not dependencies:
            self.error(f"{path}.dependencies", "must list the required dependency")
        if tier in {"dependency", "preproduction"} and not fallback:
            self.error(f"{path}.fallback", "must define a native fallback")
        if techniques is not None and not techniques:
            self.error(f"{path}.techniques", "must not be empty")

    def validate_proof_frames(
        self,
        value: Any,
        scene_path: str,
        start: int | None,
        end: int | None,
    ) -> None:
        path = f"{scene_path}.proofFrames"
        frames = self.items(value, path)
        if frames is None:
            return
        if len(set(frame for frame in frames if isinstance(frame, int))) < 3:
            self.error(path, "must contain at least three distinct proof frames")
        for index, frame in enumerate(frames):
            frame_path = f"{path}[{index}]"
            if not isinstance(frame, int) or isinstance(frame, bool):
                self.error(frame_path, "must be an integer")
                continue
            if start is not None and frame < start:
                self.error(frame_path, "must be inside the scene")
            if end is not None and frame >= end:
                self.error(frame_path, "must be smaller than scene endFrame")


def main() -> int:
    args = parse_args()
    try:
        plan = read_plan(args.plan)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"motion plan could not be read: {exc}", file=sys.stderr)
        return 2

    validator = Validator()
    validator.validate(plan)
    if validator.errors:
        print(f"motion plan failed with {len(validator.errors)} error(s):", file=sys.stderr)
        for message in validator.errors:
            print(f"- {message}", file=sys.stderr)
        return 1

    scene_count = len(plan.get("scenes", []))
    print(f"motion plan is structurally valid ({scene_count} scene(s))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
