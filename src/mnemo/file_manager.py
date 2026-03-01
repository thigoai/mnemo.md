import logging
from pathlib import Path

class FileManager:
    @staticmethod
    def read_file(filepath):
        try:
            path = Path(filepath)
            if not path.exists():
                return {"success": False, "error": "File not found."}
            
            content = path.read_text(encoding='utf-8')
            return {"success": True, "content": content}
            
        except PermissionError:
            return {"success": False, "error": "Permission denied to read this file."}
        except Exception as e:
            logging.error(f"Error reading file: {e}")
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    @staticmethod
    def save_file(filepath, content):
        try:
            path = Path(filepath)
            path.write_text(content, encoding='utf-8')
            return {"success": True, "message": "File saved successfully!"}
            
        except PermissionError:
            return {"success": False, "error": "Permission denied to save to this directory."}
        except Exception as e:
            logging.error(f"Error saving file: {e}")
            return {"success": False, "error": f"Unexpected error:  {str(e)}"}