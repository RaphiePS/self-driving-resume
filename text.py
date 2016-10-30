import numpy as np
import json
import argparse
from PIL import Image, ImageFont, ImageDraw

def get_pixels(text, config):
	text = text.strip()

	image = Image.new("RGB", (5000, 5000), (255,255,255))
	font = ImageFont.truetype(config["font"], size=config["size"])
	draw = ImageDraw.Draw(image)

	width, height = draw.textsize(text, font=font)
	draw.text((0, 0), text, (0,0,0), font=font)
	
	loaded = image.load()

	pixels = list()

	for y in range(height):
		for x in range(width):
			r, g, b = loaded[x, y]
			avg = sum([r, g, b]) / 3
			if avg < config["cutoff"]:
				pixels.append(dict(x=x, y=height - y))

	return pixels

def to_js(rendered):
	js = "var categories = {};\n"
	for name, pixels in rendered.items():
		js += "categories.%s = %s;\n" % (name, json.dumps(pixels))
	return js

def main():
	input_data = json.load(open("input.json"))
	config = input_data["config"]
	categories = input_data["categories"]

	rendered = dict()

	for name, lines in categories.items():
		text = "\n".join(lines)
		rendered[name] = get_pixels(text, config)

	js = to_js(rendered)
	open("public/pixels.js", "w").write(js)

if __name__ == '__main__':
	main()
