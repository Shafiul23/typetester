## Setup

### Prerequisites

1. Python: Ensure you have Python 3.7 or later installed. Download Python
2. pip: The Python package installer. It comes with Python 3.x.
3. A PostgreSQL database such as [Neon](https://neon.tech/) with a connection URL available as the `DATABASE_URL` environment variable.
4. Flask CLI: Ensure flask is installed (included in dependencies below).
5. Virtual Environment: (Optional) Set up a virtual environment to avoid dependency conflicts.

### Installation

1. Setup Virtual environment (optional)
   python3 -m venv venv
   source venv/bin/activate # On Windows: venv\Scripts\activate

2. Install dependencies
   pip install -r requirements.txt

3. Set the `DATABASE_URL` environment variable to your PostgreSQL connection string and initialize the database tables:

   export DATABASE_URL=your_neon_database_url
   flask init-db

### Running the Backend

1. Start the Flask Server
   flask run

By default, the server runs at http://127.0.0.1:5000.
