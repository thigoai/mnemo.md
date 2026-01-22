import webview
import os
import sys
import pdfkit

def get_resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

class Api:
    def __init__(self):
        self.window = None

    def open_file(self):
        home_dir = os.path.expanduser("~")

        result = self.window.create_file_dialog(
            webview.FileDialog.OPEN,
            directory=home_dir
        )
        
        if result:
            file_path = result[0] if isinstance(result, (tuple, list)) else result
            
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        return None

    def save_file(self, content):
        home_dir = os.path.expanduser("~")

        result = self.window.create_file_dialog(
            webview.FileDialog.SAVE,
            directory=home_dir,
            save_filename='doc.md'
        )

        if result: 
            file_path = result[0] if isinstance(result, tuple) else result

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return "File saved successfully!"
        
        return None
    
    def export_pdf(self, html_content):

        home_dir = os.path.expanduser("~")

        result = self.window.create_file_dialog(
            webview.FileDialog.SAVE,
            directory=home_dir,
            save_filename='doc.pdf'
        )

        if result: 
            file_path = result[0] if isinstance(result, tuple) else result

            options = {
                'encoding': "UTF-8",
                'custom-header': [
                    ('Content-Encoding', 'utf-8')
                ],
                'no-outline': None,
                'quiet': ''
            }
            
            try:
                pdfkit.from_string(html_content, file_path, options=options)
                return "PDF saved successfully!"
            except Exception as e:
                print(f"Error description: {e}")
                return f"Error to export: {str(e)}"
        
        return None

if __name__ == '__main__':
    api = Api()
    html_path = get_resource_path('index.html')
    window = webview.create_window('mnemo - Markdown editor', html_path, js_api=api, width=800, height=600)
    api.window = window
    webview.start()