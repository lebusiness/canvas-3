import { Box, Button, Tooltip } from "@mui/material";
import { FC } from "react";
import { Pixel } from "../ImgCanvas/ImgCanvas";
import { getBackgroundStyleByPixel } from "../../utils/getBackgroundStyleByPixel";
import { convertRgbToLab, convertRgbToXyz } from "./convertation";
import { isAdequateContrast } from "./isAdequateContrast";

export interface PixelInfo {
  rgb: Pixel;
  coordinates: {
    x: number;
    y: number;
  };
}

interface Props {
  onClose: () => void;
  primary: PixelInfo | null;
  secondary: PixelInfo | null;
}

export const ColorsInfo: FC<Props> = ({ onClose, primary, secondary }) => {
  return (
    <div
      style={{
        width: "500px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        zIndex: 1,
        background: "white",
        position: "absolute",
        top: 30,
        border: "1px solid black",
        padding: "5px",
      }}
    >
      <Button onClick={onClose} size={"small"}>
        close
      </Button>

      <div style={{ display: "flex", gap: "10px" }}>
        {primary && <ColorInfo pixelInfo={primary} name="primary" />}
        {secondary && <ColorInfo pixelInfo={secondary} name={"second"} />}
      </div>
      {primary &&
        secondary &&
        (isAdequateContrast(primary.rgb, secondary.rgb)
          ? "Цвета контрастны"
          : "Цвета не контрастны")}
    </div>
  );
};

function ColorInfo({
  pixelInfo,
  name,
}: {
  pixelInfo: PixelInfo;
  name: string;
}) {
  const { coordinates, rgb } = pixelInfo;
  const { r, g, b } = rgb;
  const { x: xCoord, y: yCoord } = coordinates;

  const { x, y, z } = convertRgbToXyz(rgb);
  const { l, a, b: _b } = convertRgbToLab(rgb);

  return (
    <div style={{ flex: "1" }}>
      {pixelInfo && (
        <Box
          display={"flex"}
          flexDirection={"column"}
          gap={1}
          alignItems={"center"}
        >
          <div>{name}</div>
          <div
            style={{
              width: "20px",
              height: "20px",
              background: getBackgroundStyleByPixel(rgb),
              border: "1px solid black",
            }}
          ></div>
          <div>x: {xCoord}</div>
          <div>y: {yCoord}</div>
          <div>
            rgb
            <Tooltip
              title={
                "RGB (Красный, Зелёный, Синий) - аддитивное цветовое пространство, где цвета формируются путём смешения трёх основных цветовых компонентов: красного, зелёного и синего. Диапазон значений каждого компонента обычно от 0 до 255. Широко используется в цифровых устройствах для отображения изображений."
              }
            >
              <span>?</span>
            </Tooltip>
            : {r}, {g}, {b}
          </div>
          <div>
            xyz
            <Tooltip
              title={
                "XYZ - это цветовое пространство, разработанное CIE в 1931 году. Значения X, Y и Z представляют собой взвешенные суммы цветовых стимулов, которые могут быть восприняты средним человеком. Ось Y соответствует яркости (луминансу), в то время как X и Z связаны с цветностью. Диапазон значений зависит от конкретного приложения, но часто используются нормализованные значения."
              }
            >
              <span>?</span>
            </Tooltip>
            : {x.toFixed(2)}, {y.toFixed(2)}, {z.toFixed(2)}
          </div>
          <div>
            lab
            <Tooltip
              title={
                "Lab - цветовое пространство, представляющее глобальные воспринимаемые цвета, где L означает яркость, а a и b - цветовые компоненты, где a соответствует позиции между красным и зелёным, а b между синим и желтым. Диапазоны: L от 0 до 100, a и b могут варьироваться примерно от -128 до 128. Используется в условиях, где важно точно передать цвет."
              }
            >
              <span>?</span>
            </Tooltip>
            : {l.toFixed(2)}, {a.toFixed(2)}, {_b.toFixed(2)}
          </div>
        </Box>
      )}
    </div>
  );
}
