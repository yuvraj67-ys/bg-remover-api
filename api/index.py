from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from rembg import remove
from io import BytesIO
import logging

app = FastAPI(title="Background Remover API")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/remove-bg/")
async def remove_background(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:  # \~5MB limit Vercel ke liye safe
            raise HTTPException(status_code=413, detail="Image too large (max \~5MB)")

        logger.info(f"Processing image: {file.filename}")
        output = remove(contents)  # rembg magic

        return StreamingResponse(
            BytesIO(output),
            media_type="image/png",
            headers={"Content-Disposition": f"attachment; filename=no-bg-{file.filename}"}
        )
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Background removal failed")

@app.get("/")
async def root():
    return {"message": "Background Remover API is running! Use POST /remove-bg/ with image file."}
