let previewState = 0; // 0 = editor, 1 = split, 2 = preview
let previewVisivel = false;
let isDirty = false;
let apiReady = false;
let currentFilename = "mnemo";

let isSyncingEditor = false;
let isSyncingPreview = false;

const editor = CodeMirror(document.getElementById("editor-container"), {
    mode: "markdown",
    theme: "dracula",
    lineNumbers: true,
    lineWrapping: true 
});

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    const isSuccess = type === "success";
    
    toast.className = `fixed bottom-4 right-4 ${isSuccess ? "bg-green-600" : "bg-red-600"} text-white px-4 py-3 rounded shadow-lg transition-opacity duration-300 z-50 flex items-center gap-2 text-sm font-medium`;
    toast.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${isSuccess ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}"></path></svg> ${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateTitle() {
    const titleEl = document.querySelector('header span');
    const fileMarkup = (currentFilename && currentFilename !== "mnemo") 
        ? `<span class="text-sm md:text-base font-medium text-slate-400 ml-3 align-middle">— &nbsp;${currentFilename}</span>` : "";
    const dirtyMarkup = isDirty ? `<span class="text-gray-500"> * </span>` : "";
    titleEl.innerHTML = `mnemo ↓${fileMarkup}${dirtyMarkup}`;
}

editor.on("scroll", (instance) => {
    if (!previewVisivel || isSyncingEditor) return (isSyncingEditor = false);
    isSyncingPreview = true;
    const info = instance.getScrollInfo();
    const preview = document.getElementById('preview');
    preview.scrollTop = (info.top / (info.height - info.clientHeight)) * (preview.scrollHeight - preview.clientHeight);
});

document.getElementById('preview').addEventListener('scroll', (e) => {
    if (!previewVisivel || isSyncingPreview) return (isSyncingPreview = false);
    isSyncingEditor = true;
    const info = editor.getScrollInfo();
    editor.scrollTo(0, (e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight)) * (info.height - info.clientHeight));
});

let renderTimeout;
editor.on("change", () => {
    if (!isDirty) { isDirty = true; updateTitle(); }
    clearTimeout(renderTimeout);
    
    renderTimeout = setTimeout(async () => {
        if (!apiReady) return;
        const preview = document.getElementById('preview');
        
        try {
            preview.innerHTML = await pywebview.api.render_markdown(editor.getValue());
            if (window.renderMathInElement) {
                renderMathInElement(preview, {
                    delimiters: [
                        {left: "$$", right: "$$", display: true},
                        {left: "$", right: "$", display: false},
                        {left: "\\(", right: "\\)", display: false},
                        {left: "\\[", right: "\\]", display: true}
                    ], throwOnError: false
                });
            }
            if (window.Prism) Prism.highlightAllUnder(preview);
        } catch (error) { console.error("Error rendering Markdown:", error); }
    }, 300); 
});

window.addEventListener('pywebviewready', () => {
    apiReady = true;
    if(editor.getValue().trim() !== "") CodeMirror.signal(editor, "change");
});

const handleApiResponse = (response, onSuccess) => {
    if (response?.success) { onSuccess(); } 
    else if (response?.error && !response.error.includes("cancelada")) { showToast(response.error, "error"); }
};

async function save_file() {
    if (!apiReady) return;
    try {
        const res = await pywebview.api.save_file(editor.getValue());
        handleApiResponse(res, () => {
            isDirty = false;
            if (res.filename) currentFilename = res.filename;
            updateTitle();
            showToast(res.message, "success");
        });
    } catch { showToast("System communication error.", "error"); }
}

async function new_file() {
    if (!apiReady || (isDirty && !confirm("You have unsaved changes. Do you want to discard them and create a new file?"))) return;
    try {
        const res = await pywebview.api.new_file();
        handleApiResponse(res, () => {
            editor.setValue(""); editor.clearHistory();
            isDirty = false;
            currentFilename = res.filename;
            updateTitle();
            showToast(res.message, "success");
        });
    } catch { showToast("System communication error.", "error"); }
}

async function open_file() {
    if (!apiReady) return;
    try {
        const res = await pywebview.api.open_file();
        handleApiResponse(res, () => {
            editor.setValue(res.content); editor.refresh();
            isDirty = false;
            if (res.filename) currentFilename = res.filename;
            updateTitle();
        });
    } catch { showToast("System communication error.", "error"); }
}

function print_pdf() {
    if (!apiReady) return;
    pywebview.api.export_pdf(document.getElementById('preview').innerHTML)
        .then(res => handleApiResponse(res, () => showToast(res.message, "success")))
        .catch(() => showToast("Error generating PDF.", "error"));
}

const icons = {
    0: { text: "Editor", svg: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="8 12 16 12"></polyline>' },
    1: { text: "Split", svg: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line>' },
    2: { text: "Preview", svg: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>' }
};

function updatePreviewButton() {
    document.getElementById('layout-icon').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[previewState].svg}</svg>`;
    document.getElementById('layout-text').innerText = icons[previewState].text;
}

function setLayout(state) {
    const editorEl = document.getElementById('editor-container');
    const previewEl = document.getElementById('preview');
    
    previewState = state;
    previewVisivel = state !== 0;
    
    previewEl.classList.toggle('hidden', state === 0);
    editorEl.style.width = state === 0 ? "100%" : state === 1 ? "50%" : "0%";
    if (state !== 0) previewEl.style.width = state === 1 ? "50%" : "100%";
    
    updatePreviewButton();
}

function togglePreview() {
    setLayout((previewState + 1) % 3);
}

window.addEventListener('keydown', e => {
    if (e.ctrlKey) {
        const key = e.key.toLowerCase();
        if (['n', 's', 'o', 'p'].includes(key)) {
            e.preventDefault();
            if (key === 'n') new_file();
            if (key === 's') save_file();
            if (key === 'o') open_file();
            if (key === 'p') print_pdf();
        }
        if (e.key === 'ArrowLeft') { e.preventDefault(); setLayout(previewState === 0 ? 1 : 2); }
        if (e.key === 'ArrowRight') { e.preventDefault(); setLayout(previewState === 2 ? 1 : 0); }
    }
});
