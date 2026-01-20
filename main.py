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

if __name__ == '__main__':
    api = Api()
    html_path = get_resource_path('index.html')
    window = webview.create_window('mnemo - Markdown editor', html_path, js_api=api, width=800, height=600)
    api.window = window
    webview.start()