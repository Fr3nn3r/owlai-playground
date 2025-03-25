import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent.parent))
