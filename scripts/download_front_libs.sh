#!/bin/bash

LIBS_DIR="frontend/libs"

mkdir -p "$LIBS_DIR"
cd "$LIBS_DIR"

echo "📂 Preparing libs directory..."

declare -A files
files=(
    ["tailwind.min.js"]="https://cdn.tailwindcss.com"
    ["codemirror.min.js"]="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.js"
    ["codemirror.min.css"]="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.css"
    ["markdown.min.js"]="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/markdown/markdown.min.js"
    ["dracula.min.css"]="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/theme/dracula.min.css"
    ["prism.min.js"]="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"
    ["prism-tomorrow.min.css"]="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css"
    ["github-markdown.min.css"]="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css"
)

echo "⬇️  Downloading basic libraries..."

for name in "${!files[@]}"; do
    url="${files[$name]}"
    echo "   - Downloading $name..."
    curl -L -s "$url" -o "$name"
done

echo "⬇️  Downloading KaTeX (full release for offline support)..."

# Check if 'unzip' is installed
if ! command -v unzip &> /dev/null; then
    echo "❌ Error: 'unzip' command not found. Please install it (e.g., sudo apt install unzip)"
    exit 1
fi

KATEX_ZIP_URL="https://github.com/KaTeX/KaTeX/releases/download/v0.16.9/katex.zip"

curl -L -s "$KATEX_ZIP_URL" -o "katex.zip"
rm -rf katex

echo "📦 Extracting KaTeX..."
unzip -q katex.zip

rm katex.zip

# Verify extraction
if [ -d "katex" ]; then
    echo "✅ KaTeX installed successfully in $LIBS_DIR/katex"
else
    echo "❌ Failed to extract KaTeX."
    exit 1
fi

echo "✅ Done! All libraries are located in $LIBS_DIR"