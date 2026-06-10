from fastapi import FastAPI

app = FastAPI(
    title="Silly Point API",
    description="Cricket news digest backend",
    version="0.1.0",
)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "silly-point-backend"
    }
