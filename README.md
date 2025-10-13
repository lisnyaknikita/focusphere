# Focusphere

## Tech stack

### Frontend

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

### Backend

- [Python](https://www.python.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://www.sqlalchemy.org/)
- [SQLite](https://sqlite.org/)

## How to launch

Clone the repository `git clone https://github.com/lisnyaknikita/focusphere.git`

### Lunch the frontend

1. Go to the frontend directory `cd front`
2. Install the dependencies `npm install`
3. Run the frontend `npm run dev`

### Lunch the backend

1. Go to the backend directory `cd back`
2. Create a virtual environment `python -m venv .venv`
3. Install the dependencies `pip install -r pyproject.toml`
4. Run the backend `uvicorn main:app --reload`
