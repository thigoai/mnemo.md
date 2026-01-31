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
    const preview = document.getElementById('preview');
    const editor = document.getElementById('editor-container');
    const iconHidden = document.getElementById('icon-hidden');
    const iconShow = document.getElementById('icon-show');
    const btnText = document.getElementById('btnText');

    if (preview.classList.contains('hidden')) {
        preview.classList.remove('hidden');
        editor.style.width = "50%";
        preview.style.width = "50%";
        
        iconHidden.classList.add('hidden');
        iconShow.classList.remove('hidden');
        btnText.innerText = "Hide Preview";
    } else {
        preview.classList.add('hidden');
        editor.style.width = "100%";
        
        iconHidden.classList.remove('hidden');
        iconShow.classList.add('hidden');
        btnText.innerText = "Show Preview";
    }
}

async function callApi(funcName, ...args) {
    if (!window.pywebview || !window.pywebview.api) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
        if (window.pywebview && window.pywebview.api && window.pywebview.api[funcName]) {
            return await window.pywebview.api[funcName](...args);
        } else {
            throw new Error(`Funcion ${funcName} dont find in API.`);
        }
    } catch (err) {
        console.error("API call fail:", err);
    }
}

function save_file() { 
    callApi('save_file', editor.getValue()); 
}

function open_file() { 
    callApi('open_file').then(content => {
        if (content !== undefined && content !== null) {
            editor.setValue(content);
            editor.refresh();
        }
    }).catch(err => console.log(err));
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

window.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 's' || e.ctrlKey && e.key === 'S') { e.preventDefault(); save_file(); }
    if (e.ctrlKey && e.key === 'o' || e.ctrlKey && e.key === 'O') { e.preventDefault(); open_file(); }
    if (e.ctrlKey && e.key === 'p' || e.ctrlKey && e.key === 'P') { e.preventDefault(); print_pdf(); }
    if (e.ctrlKey && e.key === 'h' || e.ctrlKey && e.key === 'H') { e.preventDefault(); togglePreview(); }
});