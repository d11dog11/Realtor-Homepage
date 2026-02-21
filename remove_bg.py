from PIL import Image, ImageDraw
import numpy as np
import sys

def main():
    print("Opening image...")
    input_path = '/home/dave-r/Documents/Antigravity Files/Realtor Homepage/public/phone-dialer.png'
    img = Image.open(input_path).convert('RGBA')

    print("Flood filling corners...")
    key_color = (255, 0, 255, 255) # magenta

    ImageDraw.floodfill(img, (0, 0), key_color, thresh=60)
    ImageDraw.floodfill(img, (img.width - 1, 0), key_color, thresh=60)
    ImageDraw.floodfill(img, (0, img.height - 1), key_color, thresh=60)
    ImageDraw.floodfill(img, (img.width - 1, img.height - 1), key_color, thresh=60)

    print("Converting to numpy array...")
    data = np.array(img)
    r, g, b, a = data.T
    magenta_areas = (r == 255) & (g == 0) & (b == 255) & (a == 255)
    data[magenta_areas.T] = (255, 255, 255, 0)

    print("Saving image...")
    res = Image.fromarray(data)
    res.save(input_path)
    print("Done")

if __name__ == '__main__':
    main()
