# Blog App Setup & Run Instructions

## 1. Install Python dependencies
In the backend folder:
    cd ~/blog-app/backend

Install the required packages:
    pip install fastapi uvicorn[standard] sqlalchemy pydantic python-multipart

## 2. Run the backend server
From the backend folder, start the FastAPI app:
    uvicorn main:app --reload

The backend will be running at:
    http://127.0.0.1:8000


## 3. Run the frontend
Open a new terminal, then go to the frontend folder:
    cd ~/blog-app/frontend

Start a local HTTP server:
    python3 -m http.server 5500

The frontend will be available at:
    http://127.0.0.1:5500
