import { Pixel } from "../ImgCanvas/ImgCanvas";

interface Xyz {
  x: number;
  y: number;
  z: number;
}

export function convertRgbToXyz({ r, g, b }: Pixel): Xyz {
  // Преобразование компонентов RGB из [0, 255] в [0, 1]
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;

  // Применяем линейное преобразование согласно предоставленной матрице:
  let x = 0.49 * red + 0.31 * green + 0.2 * blue;
  let y = 0.177 * red + 0.812 * green + 0.011 * blue;
  let z = 0.0 * red + 0.01 * green + 0.99 * blue;

  // Масштабируем результаты, поскольку результаты должны быть в пределах [0, 1]
  x = x * 100;
  y = y * 100;
  z = z * 100;

  return { x, y, z };
}

interface Lab {
  l: number;
  a: number;
  b: number;
}

function convertXyzToLab({ x, y, z }: Xyz): Lab {
  const xR = x / 95.047;
  const yR = y / 100.0;
  const zR = z / 108.883;

  const vX = xR > 0.008856 ? Math.cbrt(xR) : 7.787 * xR + 16 / 116;
  const vY = yR > 0.008856 ? Math.cbrt(yR) : 7.787 * yR + 16 / 116;
  const vZ = zR > 0.008856 ? Math.cbrt(zR) : 7.787 * zR + 16 / 116;

  return {
    l: 116 * vY - 16,
    a: 500 * (vX - vY),
    b: 200 * (vY - vZ),
  };
}

export function convertRgbToLab(rgb: Pixel): Lab {
  const xyz = convertRgbToXyz(rgb);
  return convertXyzToLab(xyz);
}
