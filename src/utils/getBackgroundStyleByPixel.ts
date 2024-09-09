import { Pixel } from "../components/ImgCanvas/ImgCanvas";

export function getBackgroundStyleByPixel(pixel: Pixel) {
  return `rgb(${Object.values(pixel).join(",")})`;
}
