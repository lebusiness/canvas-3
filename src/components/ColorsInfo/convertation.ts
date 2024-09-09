import { Pixel } from "../ImgCanvas/ImgCanvas";

interface Xyz {
  x: number;
  y: number;
  z: number;
}

export function convertRgbToXyz({ r, g, b }: Pixel): Xyz {
  // Перевод RGB компонентов из [0, 255] в [0, 1] и гамма-коррекция
  let red = r / 255.0;
  let green = g / 255.0;
  let blue = b / 255.0;

  red = red > 0.04045 ? Math.pow((red + 0.055) / 1.055, 2.4) : red / 12.92;
  green =
    green > 0.04045 ? Math.pow((green + 0.055) / 1.055, 2.4) : green / 12.92;
  blue = blue > 0.04045 ? Math.pow((blue + 0.055) / 1.055, 2.4) : blue / 12.92;

  // Корректное линейное преобразование из sRGB -> XYZ
  const x = 0.4124564 * red + 0.3575761 * green + 0.1804375 * blue;
  const y = 0.2126729 * red + 0.7151522 * green + 0.072175 * blue;
  const z = 0.0193339 * red + 0.119192 * green + 0.9503041 * blue;

  return { x: x * 100, y: y * 100, z: z * 100 };
}

interface Lab {
  l: number;
  a: number;
  b: number;
}

function convertXyzToLab({ x, y, z }: Xyz): Lab {
  // Нормализация XYZ относительно White Point D65
  const xR = x / 95.047;
  const yR = y / 100.0;
  const zR = z / 108.883;

  const vX = xR > 0.008856 ? Math.pow(xR, 1 / 3) : 7.787 * xR + 16 / 116;
  const vY = yR > 0.008856 ? Math.pow(yR, 1 / 3) : 7.787 * yR + 16 / 116;
  const vZ = zR > 0.008856 ? Math.pow(zR, 1 / 3) : 7.787 * zR + 16 / 116;

  const L = 116 * vY - 16;
  const a = 500 * (vX - vY);
  const b = 200 * (vY - vZ);

  return {
    l: L,
    a: a,
    b: b,
  };
}

export function convertRgbToLab(rgb: Pixel): Lab {
  const xyz = convertRgbToXyz(rgb);
  return convertXyzToLab(xyz);
}
