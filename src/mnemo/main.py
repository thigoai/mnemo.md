import webview
import os
import sys
import pdfkit
import markdown

os.environ['PYWEBVIEW_GUI'] = 'gtk'


def get_resource_path(relative_path):
    base_path = os.path.dirname(os.path.abspath(__file__))
    
    prod_path = os.path.join(base_path, "frontend", relative_path)
    dev_path = os.path.normpath(os.path.join(base_path, "..", "..", "frontend", relative_path))
    
    return dev_path if os.path.exists(dev_path) else prod_path
class Api:
    def __init__(self):
        self._window = None

    def set_window(self, window):
        self._window = window

    def render_markdown(self, text):
        return markdown.markdown(text, extensions=[
            'extra', 
            'codehilite', 
            'fenced_code',
            'pymdownx.arithmatex' 
        ], extension_configs={
            'pymdownx.arithmatex': {
                'generic': True,   
            }
        })

    def open_file(self):
        home_dir = os.path.expanduser("~")

        result = self._window.create_file_dialog(
            webview.OPEN_DIALOG,
            directory=home_dir
        )

        if result:
            path = result[0] if isinstance(result, (list, tuple)) else result
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()

        return None

    def save_file(self, content):
        home_dir = os.path.expanduser("~")

        result = self._window.create_file_dialog(
            webview.SAVE_DIALOG,
            directory=home_dir,
            save_filename='doc.md'
        )

        if result:
            path = result[0] if isinstance(result, (list, tuple)) else result
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            return "File saved successfully!"

        return None

    def export_pdf(self, markdown_content):
        html_body = self.render_markdown(markdown_content)
        home_dir = os.path.expanduser("~")
        result = self._window.create_file_dialog(webview.SAVE_DIALOG, directory=home_dir, save_filename='doc.pdf')

        if result:
            path = result[0] if isinstance(result, (list, tuple)) else result
            
            full_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{ padding: 40px; font-family: sans-serif; line-height: 1.6; color: #333; }}
                    pre {{ background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }}
                    code {{ font-family: 'Fira Code', monospace; background: #f4f4f4; padding: 2px 4px; }}
                    table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
                    th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
                    th {{ background-color: #f8f9fa; }}
                </style>
            </head>
            <body>{html_body}</body>
            </html>
            """
            try:
                pdfkit.from_string(full_html, path)
                return "PDF exportado!"
            except Exception as e:
                return f"Erro: {str(e)}"
        return None


def main():
    api = Api()
    html_path = get_resource_path('index.html')

    window = webview.create_window(
        title='mnemo - Markdown editor',
        url=html_path,
        js_api=api,
        width=900,
        height=600,
        min_size=(600, 450)
    )

    api.set_window(window)
    webview.start()

if __name__ == '__main__':
    main()
