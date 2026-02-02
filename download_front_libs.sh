#!/bin/bash
mkdir -p libs
cd libs

echo "Downloading frontend libraries..."


urls=(
    "https://cdn.tailwindcss.com"
    "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.js"
    "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.css"
    "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/markdown/markdown.min.js"
    "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/theme/dracula.min.css"
    "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"
    "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css"
    "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css"
)

for url in "${urls[@]}"; do
    filename=$(basename $url)
    if [[ $url == *"tailwindcss"* ]]; then filename="tailwind.min.js"; fi
    
    curl -L "$url" -o "$filename"
    echo "Downloaded: $filename"
done

echo "Done!"