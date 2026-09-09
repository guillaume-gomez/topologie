
export async function loadImage(imagepath: string): Promise<Image> {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = imagepath;
  })
}

export function resizeImageAndConvertToGrey(image: HTMLImageElement): ImageData {
  const { width, height } = image;
  const offscreenCanvas = new OffscreenCanvas(width, height);

  const context = getContext(offscreenCanvas);
  context.drawImage(image, 0, 0);
  // convert to gray
  convertToGrayScale(context, width, height);
  
  // then resize
  const { expectedWidth, expectedHeight } = resizeImageSize(width, height);
  resizeImageCanvas(offscreenCanvas, offscreenCanvas, expectedWidth, expectedHeight);
  
  // return the data
  return context.getImageData(0, 0, expectedWidth, expectedHeight);
}

export function resizeImageSize(width, height): {expectedWidth: number, expectedHeight: number} {
  if(width > height) {
    return {expectedWidth: 256, expectedHeight: 256 * (height/width) }
  }

  return {expectedHeight: 256, expectedWidth: 256 * (width/height) }
}

function resizeImageCanvas(originCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement, expectedWidth: number, expectedHeight: number) {
  // resize image to 50%
  const canvasBuffer = new OffscreenCanvas(originCanvas.width * 0.5, originCanvas.height * 0.5);
  const contextBuffer = getContext(canvasBuffer);

  contextBuffer.drawImage(originCanvas, 0, 0, canvasBuffer.width * 0.5, canvasBuffer.height * 0.5);

  const contextTarget = getContext(targetCanvas);

  targetCanvas.width = expectedWidth;
  targetCanvas.height = expectedHeight;

  // clear react before drawing resized image
  contextTarget.clearRect(0,0, expectedWidth, expectedHeight);
  contextTarget.drawImage(
    canvasBuffer,
    0,
    0,
    canvasBuffer.width * 0.5,
    canvasBuffer.height * 0.5,
    0,
    0,
    expectedWidth,
    expectedHeight
  );
}


function convertToGrayScale(context: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = context.getImageData(0, 0, width, height);
  for (let i = 0; i < imageData.data.length; i += 4) {
   const red = imageData.data[i];
   const green = imageData.data[i + 1];
   const blue = imageData.data[i + 2];
   // use gimp algorithm to generate prosper grayscale
   const gray = (red * 0.3 + green * 0.59 + blue * 0.11);

   imageData.data[i] = gray;
   imageData.data[i + 1] = gray;
   imageData.data[i + 2] = gray;
   imageData.data[i + 3] = 255;
  }
  context.putImageData(imageData, 0, 0);
}

function getContext(canvas: HTMLCanvasElement) : CanvasRenderingContext2D {
  const context = canvas.getContext("2d");

  if(!context) {
    throw new Error("Cannot get the context");
  }

  return context;
}