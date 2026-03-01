import webview
import markdown
import pdfkit
import os
from pathlib import Path

from .config_manager import ConfigManager
from .file_manager import FileManager

class Api:
    def __init__(self):
        self._window = None
        self._config = ConfigManager()
        self._file_manager = FileManager()
        self._current_filepath = None

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
        last_dir = self._config.get("last_directory")

        result = self._window.create_file_dialog(
            webview.FileDialog.OPEN,
            directory=last_dir
        )

        if result:
            path = result[0] if isinstance(result, (list, tuple)) else result
            self._config.set("last_directory", str(Path(path).parent))
            
            self._current_filepath = path
            
            response = self._file_manager.read_file(path)
            if response.get("success"):
                response["filename"] = Path(path).name
            return response

        return {"success": False, "error": "Operation canceled by the user"}

    def save_file(self, content):
        if self._current_filepath:
            return self._file_manager.save_file(self._current_filepath, content)
        
        last_dir = self._config.get("last_directory")

        result = self._window.create_file_dialog(
            webview.FileDialog.SAVE,
            directory=last_dir,
            save_filename='doc.md'
        )

        if result:
            path = result[0] if isinstance(result, (list, tuple)) else result
            self._config.set("last_directory", str(Path(path).parent))
            
            self._current_filepath = path
            
            response = self._file_manager.save_file(path, content)
            if response.get("success"):
                response["filename"] = Path(path).name
            return response

        return {"success": False, "error": "Operation canceled by the user."}

    def export_pdf(self, html_content):
        last_dir = self._config.get("last_directory")
        
        result = self._window.create_file_dialog(
            webview.FileDialog.SAVE, 
            directory=last_dir, 
            save_filename='doc.pdf'
        )

        if result:
            path = result[0] if isinstance(result, (list, tuple)) else result
            self._config.set("last_directory", str(Path(path).parent))
            
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
            <body>{html_content}</body>
            </html>
            """
            try:
                pdfkit.from_string(full_html, path)
                return {"success": True, "message": "PDF exported successfully!"}
            except Exception as e:
                return {"success": False, "error": f"Error exporting PDF: {str(e)}"}
        
        return {"success": False, "error": "Operation canceled."}