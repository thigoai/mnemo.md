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
        btnText.innerText = "Mostrar Preview";
    } else {
        previewDiv.classList.remove('hidden');
        editorDiv.style.width = "50%";
        btnText.innerText = "Esconder Preview";
    }
    previewVisivel = !previewVisivel;
    setTimeout(() => editor.refresh(), 10);
}
