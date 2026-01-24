import webview
import os
import sys
import pdfkit

os.environ['PYWEBVIEW_GUI'] = 'gtk'


def get_resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)

    base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)


class Api:
    def __init__(self):
        self._window = None

    def set_window(self, window):
        self._window = window

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

    def export_pdf(self, html_content):
        home_dir = os.path.expanduser("~")

        result = self._window.create_file_dialog(
            webview.SAVE_DIALOG,
            directory=home_dir,
            save_filename='doc.pdf'
        )

        if result:
            path = result[0] if isinstance(result, (list, tuple)) else result

            options = {
                'encoding': 'UTF-8',
                'quiet': '',
                'no-outline': None
            }

            try:
                pdfkit.from_string(html_content, path, options=options)
                return "PDF saved successfully!"
            except Exception as e:
                return f"Error to export: {str(e)}"

        return None


if __name__ == '__main__':
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
