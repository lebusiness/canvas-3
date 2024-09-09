export function getResizedNearestNeighborWayImageData(
  imageData: ImageData,
  newWidth: number,
  newHeight: number
) {
  const newData = new ImageData(newWidth, newHeight);
  const scaleX = imageData.width / newWidth;
  const scaleY = imageData.height / newHeight;

  for (let y = 0; y < newHeight; y++) {
    const nearestY = Math.floor(y * scaleY);

    for (let x = 0; x < newWidth; x++) {
      const nearestX = Math.floor(x * scaleX);

      const newPixelIndex = (y * newWidth + x) * 4;
      const oldPixelIndex = (nearestY * imageData.width + nearestX) * 4;

      newData.data[newPixelIndex] = imageData.data[oldPixelIndex]; // R
      newData.data[newPixelIndex + 1] = imageData.data[oldPixelIndex + 1]; // G
      newData.data[newPixelIndex + 2] = imageData.data[oldPixelIndex + 2]; // B
      newData.data[newPixelIndex + 3] = imageData.data[oldPixelIndex + 3]; // A
    }
  }

  return newData;
}
