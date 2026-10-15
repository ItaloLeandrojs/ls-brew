#!/usr/bin/env bash
# Gera 120 quadros numerados para testar a abertura antes de o vídeo ser aprovado.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p _midia public/seq/v60 public/seq/v60-celular
ffmpeg -v error -y -f lavfi -i "testsrc2=size=1920x1080:rate=30:duration=4" -vf "drawtext=fontfile='C\:/Windows/Fonts/arial.ttf':text='%{frame_num}':fontsize=200:fontcolor=white:x=(w-tw)/2:y=(h-th)/2" -pix_fmt yuv420p _midia/teste.mp4
node ~/.claude/skills/ls-motion/scripts/extrair-quadros.mjs _midia/teste.mp4 public/seq/v60 --quadros 120 --largura 1920 --celular 720
echo "Quadros de teste prontos (troque pelo vídeo aprovado antes de publicar)."
