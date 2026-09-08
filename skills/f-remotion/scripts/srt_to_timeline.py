#!/usr/bin/env python3
"""Convert SRT cues into a frame-accurate Markdown or JSON timeline."""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path


TIME_RE = re.compile(
    r"(?P<sh>\d{1,2}):(?P<sm>\d{2}):(?P<ss>\d{2})[,.](?P<sms>\d{3})"
    r"\s*-->\s*"
    r"(?P<eh>\d{1,2}):(?P<em>\d{2}):(?P<es>\d{2})[,.](?P<ems>\d{3})"
)


@dataclass(frozen=True)
class Cue:
    index: int
    start_time: str
    end_time: str
    start_ms: int
    end_ms: int
    duration_ms: int
    start_frame: int
    end_frame: int
    duration_frames: int
    text: str


def read_text(path: Path) -> str:
    raw = path.read_bytes()
    errors: list[str] = []
    for encoding in ("utf-8-sig", "utf-16", "gb18030"):
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError as error:
            errors.append(f"{encoding}: {error}")
    raise ValueError("Unable to decode subtitle file: " + "; ".join(errors))


def timestamp_to_ms(hours: str, minutes: str, seconds: str, millis: str) -> int:
    return (
        int(hours) * 3_600_000
        + int(minutes) * 60_000
        + int(seconds) * 1_000
        + int(millis)
    )


def ms_to_timestamp(value: int) -> str:
    hours, remainder = divmod(value, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    seconds, millis = divmod(remainder, 1_000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{millis:03d}"


def parse_srt(text: str, fps: float) -> list[Cue]:
    normalized = text.replace("\r\n", "\n").replace("\r", "\n").strip()
    if not normalized:
        return []

    cues: list[Cue] = []
    for fallback_index, block in enumerate(re.split(r"\n{2,}", normalized), start=1):
        lines = [line.strip() for line in block.split("\n") if line.strip()]
        if not lines:
            continue

        time_line_index = next((i for i, line in enumerate(lines) if "-->" in line), None)
        if time_line_index is None:
            continue

        match = TIME_RE.search(lines[time_line_index])
        if match is None:
            raise ValueError(f"Invalid SRT time line: {lines[time_line_index]}")

        index = fallback_index
        if time_line_index > 0 and lines[time_line_index - 1].isdigit():
            index = int(lines[time_line_index - 1])

        start_ms = timestamp_to_ms(
            match["sh"], match["sm"], match["ss"], match["sms"]
        )
        end_ms = timestamp_to_ms(
            match["eh"], match["em"], match["es"], match["ems"]
        )
        if end_ms < start_ms:
            raise ValueError(f"Cue {index} ends before it starts")

        start_frame = round(start_ms * fps / 1000)
        end_frame = round(end_ms * fps / 1000)
        cue_text = "\n".join(lines[time_line_index + 1 :]).strip()

        cues.append(
            Cue(
                index=index,
                start_time=ms_to_timestamp(start_ms),
                end_time=ms_to_timestamp(end_ms),
                start_ms=start_ms,
                end_ms=end_ms,
                duration_ms=end_ms - start_ms,
                start_frame=start_frame,
                end_frame=end_frame,
                duration_frames=max(0, end_frame - start_frame),
                text=cue_text,
            )
        )

    return cues


def to_markdown(cues: list[Cue], fps: float) -> str:
    rows = [
        f"# SRT timeline ({fps:g} fps)",
        "",
        "| # | Time | Frames | Duration | Text |",
        "| ---: | --- | ---: | ---: | --- |",
    ]
    for cue in cues:
        text = cue.text.replace("|", "\\|").replace("\n", "<br>")
        rows.append(
            f"| {cue.index} | {cue.start_time} → {cue.end_time} | "
            f"{cue.start_frame}–{cue.end_frame} | {cue.duration_frames}f | {text} |"
        )
    return "\n".join(rows) + "\n"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Convert an SRT file into a frame-accurate timeline."
    )
    parser.add_argument("input", type=Path, help="Path to the SRT file")
    parser.add_argument("--fps", type=float, default=30, help="Composition frame rate")
    parser.add_argument(
        "--format", choices=("markdown", "json"), default="markdown", help="Output format"
    )
    parser.add_argument("--output", type=Path, help="Optional output file; stdout by default")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    if not math.isfinite(args.fps) or args.fps <= 0:
        raise ValueError("--fps must be a positive finite number")
    if not args.input.is_file():
        raise FileNotFoundError(args.input)

    cues = parse_srt(read_text(args.input), args.fps)
    if not cues:
        raise ValueError("No subtitle cues found")

    if args.format == "json":
        result = json.dumps(
            {"fps": args.fps, "cue_count": len(cues), "cues": [asdict(cue) for cue in cues]},
            ensure_ascii=False,
            indent=2,
        ) + "\n"
    else:
        result = to_markdown(cues, args.fps)

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(result, encoding="utf-8")
    else:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
        sys.stdout.write(result)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (FileNotFoundError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(2)
