import webview
import os

# Importa a API que criamos no outro arquivo
from .api import Api

os.environ['PYWEBVIEW_GUI'] = 'gtk'

def get_resource_path(relative_path):
    base_path = os.path.dirname(os.path.abspath(__file__))
    
    prod_path = os.path.join(base_path, "frontend", relative_path)
    dev_path = os.path.normpath(os.path.join(base_path, "..", "..", "frontend", relative_path))
    
    return dev_path if os.path.exists(dev_path) else prod_path


def main():
    api = Api()
    html_path = get_resource_path('index.html')

    # Recupera as dimensões da janela salvas no ConfigManager
    # Assim o app abre do mesmo tamanho que o usuário deixou!
    width = api._config.get("window_width")
    height = api._config.get("window_height")

    window = webview.create_window(
        title='mnemo - Markdown editor',
        url=html_path,
        js_api=api,
        width=width,
        height=height,
        min_size=(600, 450)
    )

    api.set_window(window)
    webview.start()

if __name__ == '__main__':
    main()