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
    const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
    
    toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded shadow-lg transition-opacity duration-300 z-50 flex items-center gap-2 text-sm font-medium`;
    toast.innerHTML = type === "success" 
        ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${message}`
        : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> ${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateTitle() {
    const titleEl = document.querySelector('header span');
    if (isDirty) {
        titleEl.innerHTML = `${currentFilename} ↓ *`;
        titleEl.classList.replace("text-gray-500", "text-blue-500");
    } else {
        titleEl.innerHTML = `${currentFilename} ↓`;
        titleEl.classList.replace("text-blue-500", "text-gray-500");
    }
}


editor.on("scroll", (instance) => {
    if (!previewVisivel || isSyncingEditor) {
        isSyncingEditor = false;
        return;
    }
    isSyncingPreview = true;
    
    const info = instance.getScrollInfo();
    const preview = document.getElementById('preview');
    const ratio = info.top / (info.height - info.clientHeight);
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
});

document.getElementById('preview').addEventListener('scroll', (e) => {
    if (!previewVisivel || isSyncingPreview) {
        isSyncingPreview = false;
        return;
    }
    isSyncingEditor = true;
    
    const preview = e.target;
    const info = editor.getScrollInfo();
    const ratio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
    editor.scrollTo(0, ratio * (info.height - info.clientHeight));
});



let renderTimeout;
editor.on("change", () => {

    if (!isDirty) {
        isDirty = true;
        updateTitle();
    }

    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(async () => {
        if (!apiReady) return;
        
        const preview = document.getElementById('preview');
        const content = editor.getValue();

        try {
            const html = await pywebview.api.render_markdown(content);
            preview.innerHTML = html;

            if (window.renderMathInElement) {
                renderMathInElement(preview, {
                    delimiters: [
                        {left: "$$", right: "$$", display: true},
                        {left: "$", right: "$", display: false},
                        {left: "\\(", right: "\\)", display: false},
                        {left: "\\[", right: "\\]", display: true}
                    ],
                    throwOnError: false
                });
            }
            
            if (window.Prism) Prism.highlightAllUnder(preview);
        } catch (error) {
            console.error("Error rendering Markdown:", error); // Traduzido
        }
    }, 300); 
});


window.addEventListener('pywebviewready', function() {
    apiReady = true;
    if(editor.getValue().trim() !== "") {
        CodeMirror.signal(editor, "change");
    }
});

async function save_file() {
    if (!apiReady) return;
    try {
        const response = await pywebview.api.save_file(editor.getValue());
        if (response.success) {
            isDirty = false;
            if (response.filename) currentFilename = response.filename;
            updateTitle();
            showToast(response.message, "success");
        } else if (!response.error.includes("cancelada")) {
            showToast(response.error, "error");
        }
    } catch (err) {
        showToast("System communication error.", "error"); // Traduzido
    }
}

async function new_file() {
    if (!apiReady) return;
        if (isDirty) {
        const confirmNew = confirm("You have unsaved changes. Do you want to discard them and create a new file?"); // Traduzido
        if (!confirmNew) return; 
    }

    try {
        const response = await pywebview.api.new_file();
        if (response.success) {
            editor.setValue(""); 
            editor.clearHistory(); 
            
            isDirty = false;
            currentFilename = response.filename; 
            updateTitle();
            showToast(response.message, "success");
        }
    } catch (err) {
        showToast("System communication error.", "error"); // Traduzido
    }
}

async function open_file() {
    if (!apiReady) return;
    try {
        const response = await pywebview.api.open_file();
        if (response.success) {
            editor.setValue(response.content);
            editor.refresh();
            isDirty = false;
            if (response.filename) currentFilename = response.filename;
            updateTitle();
        } else if (!response.error.includes("cancelada")) {
            showToast(response.error, "error");
        }
    } catch (err) {
        showToast("System communication error.", "error"); // Traduzido
    }
}

function print_pdf() {
    if (!apiReady) return;
    
    const htmlContent = document.getElementById('preview').innerHTML;
    
    pywebview.api.export_pdf(htmlContent).then(response => {
        if (response && response.success) {
            showToast(response.message, "success");
        } else if (response && response.error && !response.error.includes("cancelada")) {
            showToast(response.error, "error");
        }
    }).catch(() => {
        showToast("Error generating PDF.", "error"); // Traduzido
    });
}

function updatePreviewButton() {
    const iconContainer = document.getElementById('layout-icon');
    const textContainer = document.getElementById('layout-text');
    
    const svgBase = '<svg xmlns="http://www.w3.org/2000/svg" class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
    const svgEnd = '</svg>';

    if (previewState === 0) {
        iconContainer.innerHTML = svgBase + icons.editor + svgEnd;
        textContainer.innerText = "Editor";
    } else if (previewState === 1) {
        iconContainer.innerHTML = svgBase + icons.split + svgEnd;
        textContainer.innerText = "Split";
    } else if (previewState === 2) {
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


window.addEventListener('keydown', e => {
    if (e.ctrlKey && (e.key === 'n' || e.key === 'N')) { e.preventDefault(); new_file(); }
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); save_file(); }
    if (e.ctrlKey && (e.key === 'o' || e.key === 'O')) { e.preventDefault(); open_file(); }
    if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) { e.preventDefault(); print_pdf(); }

    if (e.ctrlKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (previewState === 0) showSplit();
        else if (previewState === 1) showPreviewFull();
    }

    if (e.ctrlKey && e.key === 'ArrowRight') {
        e.preventDefault();
        if (previewState === 2) showSplit();
        else if (previewState === 1) showEditorFull();
    }
});