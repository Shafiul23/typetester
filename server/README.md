## Setup

### Prerequisites

1. Python: Ensure you have Python 3.7 or later installed. Download Python
2. pip: The Python package installer. It comes with Python 3.x.
3. SQLite: Install SQLite if not included with your Python installation.
4. Flask CLI: Ensure flask is installed (included in dependencies below).
5. Virtual Environment: (Optional) Set up a virtual environment to avoid dependency conflicts.

### Installation

1. Setup Virtual environment (optional)
   python3 -m venv venv
   source venv/bin/activate # On Windows: venv\Scripts\activate

2. Install dependencies
   pip install -r requirements.txt

3. Setup database
   flask init-db

### Running the Backend

1. Start the Flask Server
   flask run

By default, the server runs at http://127.0.0.1:5000.
