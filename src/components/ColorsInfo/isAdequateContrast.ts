import { Pixel } from "../ImgCanvas/ImgCanvas";

function relativeLuminance(color: Pixel): number {
  const rgb = [color.r, color.g, color.b].map((c) => {
    // Привести к диапазону [0,1]
    c = c / 255.0;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  // Вычисление относительной яркости
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrastRatio(color1: Pixel, color2: Pixel): number {
  const lum1 = relativeLuminance(color1);
  const lum2 = relativeLuminance(color2);

  // Вычисление коэффициента контрастности
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}

export function isAdequateContrast(color1: Pixel, color2: Pixel): boolean {
  const ratio = contrastRatio(color1, color2);

  return ratio > 4.5;
}
