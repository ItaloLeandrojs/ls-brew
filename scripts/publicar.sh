#!/usr/bin/env bash
# Gera o site e publica na branch gh-pages (GitHub Pages lê dela).
set -euo pipefail
cd "$(dirname "$0")/.."
# Não publica sem os 120 quadros da abertura no git (celular e computador).
for d in celular computador; do
  n=$(git ls-files "public/abertura/$d/*.webp" | wc -l)
  if [ "$n" -ne 120 ]; then
    echo "Quadros da abertura ($d) no git: $n de 120 — publicação bloqueada."
    exit 1
  fi
done
if [ ! -f public/og.jpg ]; then
  echo "Falta public/og.jpg (prévia de compartilhamento) — publicação bloqueada."
  exit 1
fi
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Há mudanças não commitadas — publicação bloqueada."
  exit 1
fi
npm test
MSYS_NO_PATHCONV=1 BASE=/ls-brew/ npm run build
grep -q 'canonical" href="https://italoleandrojs.github.io/ls-brew/' dist/index.html || { echo "Base errada no build"; exit 1; }
touch dist/.nojekyll
TMP=$(mktemp -d)
cp -r dist/. "$TMP/"
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="Italo Leandro" -c user.email="italols.js@gmail.com" commit -q -m "Publicação $(date +%Y-%m-%d\ %H:%M)"
git -c credential.helper= -c "credential.helper=!gh auth git-credential" push -q -f https://github.com/ItaloLeandrojs/ls-brew.git gh-pages
echo "Publicado em https://italoleandrojs.github.io/ls-brew/"
