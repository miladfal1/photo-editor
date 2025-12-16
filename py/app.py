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
    print("request recevied from api/resize")
    
    data = await image.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    img_resized = cv2.resize(
        img,
        (width, height),
        interpolation=cv2.INTER_NEAREST
    )

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

@app.post("/line")
async def draw_line(
    image: UploadFile = File(...),
    x1: int = Form(...),
    y1: int = Form(...),
    x2: int = Form(...),
    y2: int = Form(...)
):
    data = await image.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    cv2.line(
        img,
        (x1, y1),
        (x2, y2),
        color=(0, 0, 255),
        thickness=2
    )

    _, buf = cv2.imencode(".png", img)
    return Response(content=buf.tobytes(), media_type="image/png")

@app.post("/rectangle")
async def draw_rectangle(
    image: UploadFile = File(...),
    x1: int = Form(...),
    y1: int = Form(...),
    x2: int = Form(...),
    y2: int = Form(...)
):
    data = await image.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    cv2.rectangle(
        img,
        (x1, y1),
        (x2, y2),
        color=(0, 255, 0),
        thickness=2
    )

    _, buf = cv2.imencode(".png", img)
    return Response(content=buf.tobytes(), media_type="image/png")


@app.post("/circle")
async def draw_circle(
    image: UploadFile = File(...),
    cx: int = Form(...),
    cy: int = Form(...),
    radius: int = Form(...)
):
    data = await image.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    cv2.circle(
        img,
        center=(cx, cy),
        radius=radius,
        color=(255, 0, 0),  # آبی (BGR)
        thickness=2
    )

    _, buf = cv2.imencode(".png", img)
    return Response(content=buf.tobytes(), media_type="image/png")

@app.post("/text")
async def put_text(
    image: UploadFile = File(...),
    text: str = Form(...),
    x: int = Form(...),
    y: int = Form(...)
):
    data = await image.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    cv2.putText(
        img,
        text,
        (x, y),
        fontFace=cv2.FONT_HERSHEY_SIMPLEX,
        fontScale=1,
        color=(255, 255, 255),
        thickness=2,
        lineType=cv2.LINE_AA
    )

    _, buf = cv2.imencode(".png", img)
    return Response(content=buf.tobytes(), media_type="image/png")


@app.post("/rotate")
async def rotate(
    image: UploadFile = File(...),
    angle: int = Form(...)
):
    data = await image.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    if angle == 90:
        rotated = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
    elif angle == -90:
        rotated = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
    elif angle == 180:
        rotated = cv2.rotate(img, cv2.ROTATE_180)
    else:
        return Response(
            content=b"Invalid angle. Use 90, -90, or 180.",
            status_code=400
        )

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

    alpha = contrast  
    beta = brightness
    
    print(alpha , beta)

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

