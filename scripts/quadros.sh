#!/usr/bin/env bash
# Gera os quadros da abertura (latte art do Pexels 6769791, trecho de 3,5 a 17,3 s) em public/abertura/.
# Precisa de ffmpeg e do vídeo original em _midia/v15-latte.mp4 (fora do git).
# 120 quadros em cada pasta. Celular: recorte aberto 3:4 com as bordas de cima e de baixo esfumando no escuro (#1A120D).
set -euo pipefail
cd "$(dirname "$0")/.."
ORIGEM=_midia/v15-latte.mp4
N=120
FPS=8.7 # 13,8 s × 8,7 ≈ 120 quadros; -frames:v garante o número exato
rm -rf public/abertura && mkdir -p public/abertura/celular public/abertura/computador
FADE="format=gbrp,geq=r='26+(r(X,Y)-26)*min(1,min(Y,H-Y)/(0.22*H))':g='18+(g(X,Y)-18)*min(1,min(Y,H-Y)/(0.22*H))':b='13+(b(X,Y)-13)*min(1,min(Y,H-Y)/(0.22*H))'"
ffmpeg -v error -ss 3.5 -to 17.3 -i "$ORIGEM" -an -vf "fps=$FPS,crop=1080:1440:740:0,$FADE,scale=960:1280:flags=lanczos" -frames:v $N -c:v libwebp -quality 78 -f image2 -start_number 1 public/abertura/celular/%03d.webp
ffmpeg -v error -ss 3.5 -to 17.3 -i "$ORIGEM" -an -vf "fps=$FPS,scale=1600:900:flags=lanczos" -frames:v $N -c:v libwebp -quality 76 -f image2 -start_number 1 public/abertura/computador/%03d.webp
for d in celular computador; do
  n=$(ls public/abertura/$d | wc -l)
  [ "$n" -eq $N ] || { echo "Esperava $N quadros em $d, saíram $n"; exit 1; }
  echo "$d: $n quadros, $(du -sh public/abertura/$d | cut -f1)"
done
