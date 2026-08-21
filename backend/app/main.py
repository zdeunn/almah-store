from fastapi import FastAPI
from .routers import admin, auth, orders, products, upload
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="E-commerce MVP",
    version="1.0.0"
    )

origins = [
    "http://localhost:3000",
    "http://192.168.100.3:3000",
    "https://almah-store.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(upload.router)

@app.get("/")
async def root():
    return {"message": "E-commerce MVP API is running"}