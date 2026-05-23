import sys
from pathlib import Path

sys.path.insert(0, str(Path('backend').resolve()))

from app.services.aptitude_service import _load_json_questions
from app.services.dsa_service import _load_json_dsa_questions

print('aptitude json count', len(_load_json_questions()))
print('dsa json count', len(_load_json_dsa_questions()))
