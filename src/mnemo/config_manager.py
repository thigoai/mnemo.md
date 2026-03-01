import json
from pathlib import Path

class ConfigManager:
    def __init__(self):
        self.config_dir = Path.home() / ".config" / "mnemo"
        self.config_file = self.config_dir / "settings.json"
        
        self.default_config = {
            "last_directory": str(Path.home()),
            "preview_state": 1,
            "window_width": 900,
            "window_height": 600
        }
        self.config = self._load_config()

    def _load_config(self):
        if not self.config_file.exists():
            self._save_config(self.default_config)
            return self.default_config
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return self.default_config

    def _save_config(self, config_data):
        self.config_dir.mkdir(parents=True, exist_ok=True)
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, indent=4)

    def get(self, key):
        return self.config.get(key, self.default_config.get(key))

    def set(self, key, value):
        self.config[key] = value
        self._save_config(self.config)