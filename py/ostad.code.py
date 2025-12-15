import cv2
img = cv2.imread(r'c:/users/milad/Desktop/sample.jfif')

cv2.imshow("image" , img)

print(img.shape)

img_resized = cv2.resize(img , (300 ,300), interpolation= cv2.INTER_NEAREST)

cv2.imshow("image" , img)
cv2.imshow("resized" , img_resized)
cv2.waitKey(0)
cv2.destroyAllWindows()