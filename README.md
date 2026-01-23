# 📄 mnemo.md

An elegant and functional **Markdown editor** built with **Python** and **Web Technologies**.

Mnemo is a desktop application that uses Python with a modern frontend, using PyWebView. It offers a fluid writing experience with real-time preview and direct export to PDF.

## 🛠 Technologies Used

- **Backend**: Python 3 with `pywebview` for the desktop interface.

- **Frontend**: HTML, CSS (Tailwind), and JavaScript.

- **JS Libraries**:

  * `CodeMirror` (Text editor).

  * `marked.js` (Markdown rendering).

  * `Prism.js` (Code highlighting in preview).

- **Utilities**: `pdfkit` (wkhtmltopdf) for generating PDF files.

## ⌨︎ Keyboard Shortcuts

- **Open File**: `Ctrl+O`.

- **Save File**: `Ctrl+S`.

- **Print PDF**: `Ctrl+P`.

- **Show/hidden Preview**: `Ctrl+o`.

# ⚙ Setup

### Prerequisites
To use the PDF export feature, ensure `wkhtmltopdf` is installed on your system:

```
	sudo apt install wkhtmltopdf
```
### Installation

1. Clone the repository:

```
	git clone https://github.com/your-username/mnemo.git
	cd mnemo
```
2. Install Python dependencies:

```
	pip install -r requirements.txt
```
3. Download frontend assets:

```
	chmod +x download_front_libs.sh
    ./download_front_libs.sh
```
4. Launch the application:

```
	python main.py
```



