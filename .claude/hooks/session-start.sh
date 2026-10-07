#!/bin/bash
# SessionStart hook: installs the tools needed to build story slides and videos
# (Pillow for images, ffmpeg for MP4, ruff for linting) in Claude Code on the web.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

python3 -m pip install --quiet --disable-pip-version-check --root-user-action=ignore \
  pillow imageio-ffmpeg ruff

# Expose a plain `ffmpeg` command (static binary from imageio-ffmpeg)
if ! command -v ffmpeg >/dev/null 2>&1; then
  FFMPEG_BIN="$(python3 -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')"
  ln -sf "$FFMPEG_BIN" /usr/local/bin/ffmpeg
fi
