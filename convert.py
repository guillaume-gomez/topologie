import json
import sys
import rasterio
import numpy as np

if len(sys.argv) < 2:
    print("Usage: python convert.py <path_to_tif>")
    sys.exit(1)

input_path = sys.argv[1]

with rasterio.open(input_path) as src:
    arr = src.read(1)

values = arr.flatten().tolist()

print(f"min: {min(values)}, max: {max(values)}")

data = {
    "width": arr.shape[1],
    "height": arr.shape[0],
    "min": min(values),
    "max": max(values),
    "values": values
}

with open("output.json", "w") as f:
    json.dump(data, f)
