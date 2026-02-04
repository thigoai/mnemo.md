# 📄 mnemo.md

An elegant and functional **Markdown editor** built with **Python** and **Web Technologies**.

<p align="center">
  <img src="https://github.com/user-attachments/assets/af166793-78f5-47b5-85ee-04f4d65135ce" width="500">
</p>

Mnemo is a desktop application that uses Python with a modern frontend, using PyWebView. It offers a fluid writing experience with real-time preview and direct export to PDF.

## 🛠 Technologies Used

- **Manager**: [uv](https://docs.astral.sh/uv/) (Fast Python package & project manager).

- **Backend**: Python 3 with `pywebview` for the desktop interface.

- **Frontend**: HTML, CSS (Tailwind), and JavaScript.

- **JS Libraries**:

  * `CodeMirror` (Text editor).

  * `Prism.js` (Code highlighting in preview).

- **Utilities**: `pdfkit` (wkhtmltopdf) for generating PDF files.

## ⌨︎ Keyboard Shortcuts

- **Open File**: `Ctrl+O`.

- **Save File**: `Ctrl+S`.

- **Print PDF**: `Ctrl+P`.

- **Split Screen**:
	- `Ctrl + ←` — Enable/disable split view or move focus to the preview panel.
  	- `Ctrl + →` — Enable/disable split view or move focus to the editor panel.


# ⚙ Setup

### Prerequisites
1. Install the `uv` manager:
```
	curl -LsSf https://astral.sh/uv/install.sh | sh
```
2. To use the PDF export feature, ensure `wkhtmltopdf` is installed on your system:

```
	sudo apt install wkhtmltopdf
```
### Installation & Execution

1. Clone the repository:

```
	git clone https://github.com/your-username/mnemo.git
	cd mnemo
```
2. **Sync the project**: This will create a virtual environment and install all dependencies automatically.

```
	uv sync
```
3. Download frontend assets:

```
	chmod +x scripts/download_front_libs.sh
	./scripts/download_front_libs.sh
```
4. Launch the application:

```
	uv run mnemo
```
