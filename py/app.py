from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import Response
import cv2
import numpy as np

app = FastAPI()

@app.post("/resize")
async def resize(
    image: UploadFile = File(...),
    width: int = Form(...),
    height: int = Form(...)
):
    
    # عکس روی به جای کامپیوتر خودمون از سرور که پاس داده میخونیم
    data = await image.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)


    # همون متدای استاده فقط عرض ئ ارتفاع رو دستی وارد نکردیم
    img_resized = cv2.resize(
        img,
        (width, height),
        interpolation=cv2.INTER_NEAREST
    )

    #پاس دادیم به سرور دوباره تو کلاس اینجا نشون میدادیم 
    _, buf = cv2.imencode(".png", img_resized)
    return Response(content=buf.tobytes(), media_type="image/png")


@app.post("/crop")
async def crop(
    image: UploadFile = File(...),
    x: int = Form(...),
    y: int = Form(...),
    w: int = Form(...),
    h: int = Form(...)
):
    data = await image.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    cropped = img[y:y+h, x:x+w]

    _, buf = cv2.imencode(".png", cropped)
    return Response(content=buf.tobytes(), media_type="image/png")


@app.post("/rotate")
async def rotate(
    image: UploadFile = File(...),
    angle: float = Form(...)
):
    data = await image.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    h, w = img.shape[:2]
    M = cv2.getRotationMatrix2D((w/2, h/2), angle, 1)
    rotated = cv2.warpAffine(img, M, (w, h))

    _, buf = cv2.imencode(".png", rotated)
    return Response(content=buf.tobytes(), media_type="image/png")

@app.post("/brightness-contrast")
async def brightness_contrast(
    image: UploadFile = File(...),
    brightness: int = Form(...),
    contrast: float = Form(...)
):
    data = await image.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    alpha = contrast       # کنتراست
    beta = brightness      # روشنایی

    out = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)

    _, buf = cv2.imencode(".png", out)
    return Response(content=buf.tobytes(), media_type="image/png")


@app.post("/blur")
async def blur(
    image: UploadFile = File(...),
    k: int = Form(...)
):
    data = await image.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    if k % 2 == 0:
        k += 1
    if k < 1:
        k = 1

    out = cv2.GaussianBlur(img, (k, k), 0)

    _, buf = cv2.imencode(".png", out)
    return Response(content=buf.tobytes(), media_type="image/png")


@app.post("/edge")
async def edge(image: UploadFile = File(...)):
    data = await image.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)

    _, buf = cv2.imencode(".png", edges)
    return Response(content=buf.tobytes(), media_type="image/png")

@app.post("/corner")
async def corner(image: UploadFile = File(...)):
    data = await image.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    corners = cv2.goodFeaturesToTrack(
        gray,
        maxCorners=100,
        qualityLevel=0.01,
        minDistance=10
    )

    if corners is not None:
        for c in corners:
            x, y = c.ravel()
            cv2.circle(img, (int(x), int(y)), 3, (0, 0, 255), -1)

    _, buf = cv2.imencode(".png", img)
    return Response(content=buf.tobytes(), media_type="image/png")

@app.post("/channel")
async def channel_remove(
    image: UploadFile = File(...),
    channel: str = Form(...)
):
    data = await image.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    if channel == "r":
        img[:, :, 2] = 0
    elif channel == "g":
        img[:, :, 1] = 0
    elif channel == "b":
        img[:, :, 0] = 0

    _, buf = cv2.imencode(".png", img)
    return Response(content=buf.tobytes(), media_type="image/png")

