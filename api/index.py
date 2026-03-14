from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
import mediapipe as mp
from PIL import Image
import numpy as np
import io
import cv2

app = FastAPI(title="Lightweight BG Remover API (MediaPipe)")

mp_selfie = mp.solutions.selfie_segmentation
selfie_segmentation = mp_selfie.SelfieSegmentation(model_selection=1)  # 1 = better quality

@app.post("/remove-bg/")
async def remove_background(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:  # Safe limit for Vercel free
            raise HTTPException(status_code=413, detail="Image too large (max \~5MB)")

        # Image ko numpy array mein convert
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # MediaPipe segmentation
        results = selfie_segmentation.process(img_rgb)
        mask = results.segmentation_mask > 0.5  # Threshold for foreground

        # Transparent background banao
        h, w = img.shape[:2]
        mask_3d = np.dstack((mask, mask, mask))  # For RGB
        fg = img * mask_3d.astype(np.uint8)
        alpha = (mask * 255).astype(np.uint8)
        rgba = cv2.cvtColor(fg, cv2.COLOR_BGR2BGRA)
        rgba[:, :, 3] = alpha

        # PIL se PNG save karo
        pil_img = Image.fromarray(cv2.cvtColor(rgba, cv2.COLOR_BGRA2RGBA))
        output_io = io.BytesIO()
        pil_img.save(output_io, format="PNG")
        output_io.seek(0)

        return StreamingResponse(
            output_io,
            media_type="image/png",
            headers={"Content-Disposition": f"attachment; filename=no-bg-{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Lightweight BG Remover API running! POST to /remove-bg/ with image file."}
