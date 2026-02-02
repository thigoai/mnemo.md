// 0 = editor 100%
// 1 = split 50/50
// 2 = preview 100%
let previewState = 0;

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

function updatePreviewButton() {
    const iconContainer = document.getElementById('layout-icon');
    const textContainer = document.getElementById('layout-text');
    
    const svgBase = '<svg xmlns="http://www.w3.org/2000/svg" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
    const svgEnd = '</svg>';

    if (previewState === 0) {
        iconContainer.innerHTML = svgBase + icons.editor + svgEnd;
        textContainer.innerText = "Editor";
    } 
    else if (previewState === 1) {
        iconContainer.innerHTML = svgBase + icons.split + svgEnd;
        textContainer.innerText = "Split";
    } 
    else if (previewState === 2) {
        iconContainer.innerHTML = svgBase + icons.preview + svgEnd;
        textContainer.innerText = "Preview";
    }
}

function showEditorFull() {
    const editor = document.getElementById('editor-container');
    const preview = document.getElementById('preview');

    preview.classList.add('hidden');
    editor.style.width = "100%";

    previewState = 0;
    previewVisivel = false;

    updatePreviewButton();
}

function showSplit() {
    const editor = document.getElementById('editor-container');
    const preview = document.getElementById('preview');

    preview.classList.remove('hidden');
    editor.style.width = "50%";
    preview.style.width = "50%";

    previewState = 1;
    previewVisivel = true;

    updatePreviewButton();
}

function showPreviewFull() {
    const editor = document.getElementById('editor-container');
    const preview = document.getElementById('preview');

    preview.classList.remove('hidden');
    editor.style.width = "0%";
    preview.style.width = "100%";

    previewState = 2;
    previewVisivel = true;

    updatePreviewButton();
}

const icons = {
    editor: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="8 12 16 12"></polyline>',
    split:  '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line>',
    preview: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>'
};

function togglePreview() {
    let nextState = (previewState + 1) % 3;

    if (nextState === 0) showEditorFull();
    else if (nextState === 1) showSplit();
    else if (nextState === 2) showPreviewFull();
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

    if (e.ctrlKey && e.key === 'ArrowLeft') {
        e.preventDefault();

        if (previewState === 0) {
            showSplit();
        } else if (previewState === 1) {
            showPreviewFull();
        }
    }

    if (e.ctrlKey && e.key === 'ArrowRight') {
        e.preventDefault();

        if (previewState === 2) {
            showSplit();
        } else if (previewState === 1) {
            showEditorFull();
        }
    }
});