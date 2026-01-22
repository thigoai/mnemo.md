let previewVisivel = true;
marked.setOptions({ breaks: true, gfm: true });

const editor = CodeMirror(document.getElementById("editor-container"), {
    mode: "markdown",
    theme: "dracula",
    lineNumbers: true,
    lineWrapping: true 
});

editor.on("scroll", (instance) => {
    if (!previewVisivel) return;
    const info = instance.getScrollInfo();
    const preview = document.getElementById('preview');
    const ratio = info.top / (info.height - info.clientHeight);
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
});

editor.on("change", () => {
    const preview = document.getElementById('preview');
    const content = editor.getValue();
    preview.innerHTML = marked.parse(content);
    if (window.Prism) Prism.highlightAllUnder(preview);
});


function togglePreview() {
    const editorDiv = document.getElementById('editor-container');
    const previewDiv = document.getElementById('preview');
    const btnText = document.getElementById('btnText');

    if (previewVisivel) {
        previewDiv.classList.add('hidden');
        editorDiv.style.width = "100%";
        btnText.innerText = "Show Preview";
    } else {
        previewDiv.classList.remove('hidden');
        editorDiv.style.width = "50%";
        btnText.innerText = "Hidden Preview";
    }
    previewVisivel = !previewVisivel;
    setTimeout(() => editor.refresh(), 10);
}


function save_file() { 
    pywebview.api.save_file(editor.getValue()); 
}

function open_file() { 
    pywebview.api.open_file().then(content => {
        if (content !== undefined && content !== null) {
            editor.setValue(content);
            editor.refresh();
        }
    });
}

function print_pdf() {
    const html = document.getElementById('preview').innerHTML;
        const fullHtml = `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8">
        <style>
            body{padding:40px; font-family:sans-serif; line-height:1.6;}
            table{border-collapse:collapse; width:100%; border:1px solid #ddd;}
            th, td{border:1px solid #ddd; padding:8px;}
            pre{background:#f4f4f4; padding:10px; border-radius:5px;}
        </style></head><body>${html}</body></html>`;
        pywebview.api.export_pdf(fullHtml);
}