import { Box, Slider } from "@mui/material";
import { ChangeEvent, FC, useEffect, useState } from "react";
import {
  ResizeOptionsButton,
  ResizingAlgorithm,
} from "./ResizeOptionsButton/ResizeOptionsButton";
import { getResizedNearestNeighborWayImageData } from "./alghorithms";
import { PixelInfo } from "../ColorsInfo/ColorsInfo";
import { CurvesButton } from "./CurvesButton/CurvesButton";
import { FilterButton } from "./FilterButton/FilterButton";

const MAX_SCALE = 300;
const MIN_SCALE = 12;

const SCALE_BAR_HEIGHT = 30;
const RESIZE_BUTTON_HEIGHT = 36;

export interface Pixel {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface EasyImg {
  height: number;
  width: number;
}

interface Props {
  image: HTMLImageElement;
  onCanvasClick: (pixel: PixelInfo) => void;
  displacement: {
    x: number;
    y: number;
  };
  onMouseMove: (event: MouseEvent, scale: number) => void;
  onMouseUp: (event: MouseEvent) => void;
  onMouseDown: (event: MouseEvent) => void;
}

export const ImgCanvas: FC<Props> = ({
  image,
  onCanvasClick,
  displacement,
  onMouseMove,
  onMouseUp,
  onMouseDown,
}) => {
  // preview imageData
  const [previewImageData, setPreviewImageData] = useState<ImageData | null>(
    null
  );
  // --

  // canvas
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const canvasHeight = canvas?.clientHeight;
  const canvasWidth = canvas?.clientWidth;
  const [initialImageData, setInitialImageData] = useState<ImageData | null>(
    null
  );
  // --

  // container
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const containerHeight = container?.clientHeight;
  const containerWidth = container?.clientWidth;
  // --

  const [imgParams, setImgParams] = useState<EasyImg>();

  const [scale, setScale] = useState<number>();

  // on img load + set initial scale
  useEffect(() => {
    if (containerHeight && containerWidth) {
      image.onload = () => {
        const { height, width } = image;

        setImgParams({ height, width });

        const BORDER_SIZE = 50;
        const heightK = height / (containerHeight - BORDER_SIZE * 2);
        const widthK = width / (containerWidth - BORDER_SIZE * 2);

        const maxK = Math.max(heightK, widthK);

        setScale(Math.min(MAX_SCALE, Math.ceil((1 / maxK) * 100)));

        // получить initialImageData
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");

        const { height: imageHeight, width: imageWidth } = image;

        tempCanvas.width = imageWidth;
        tempCanvas.height = imageHeight;

        if (tempCtx) {
          tempCtx.drawImage(image, 0, 0, imageWidth, imageHeight);

          setInitialImageData(
            tempCtx.getImageData(0, 0, imageWidth, imageHeight)
          );
        }
        // --
      };
    }
  }, [containerHeight, containerWidth, image]);

  // eslint-disable-next-line
  const [_, setResizingAlghorithm] =
    useState<ResizingAlgorithm>("nearestNeighbor");

  // draw img. Initial + when scale changed + when sizes chaged
  useEffect(() => {
    const allAsyncDataLoaded =
      canvas !== null &&
      canvasHeight !== undefined &&
      canvasWidth !== undefined &&
      imgParams !== undefined &&
      scale !== undefined &&
      initialImageData !== null;

    if (allAsyncDataLoaded) {
      const { height: imageHeight, width: imageWidth } = imgParams;

      const context = canvas.getContext("2d");

      if (context) {
        context.save(); // запомнить состояние без масштабирования

        // CLEAR
        context.fillStyle = "#FFF";
        context.fillRect(0, 0, canvas.width, canvas.height);
        // -- CLEAR

        const scaleK = scale / 100;
        context.scale(scaleK, scaleK);

        const centeredX = (canvas.width / scaleK - imageWidth) / 2;
        const centeredY = (canvas.height / scaleK - imageHeight) / 2;

        // сохранение новой матрицы в временный канвас
        const tempCanvas = document.createElement("canvas");
        const tempContext = tempCanvas.getContext("2d");
        tempCanvas.width = imageWidth;
        tempCanvas.height = imageHeight;

        tempContext?.putImageData(
          getResizedNearestNeighborWayImageData(
            previewImageData ?? initialImageData,
            imageWidth,
            imageHeight
          ),
          0,
          0
        );
        // --

        context.drawImage(
          tempCanvas,
          centeredX + displacement.x,
          centeredY + displacement.y
        );

        context.restore(); // восстановить состояние без масштабирования
      }
    }
  }, [
    canvas,
    canvasHeight,
    canvasWidth,
    displacement.x,
    displacement.y,
    image,
    imgParams,
    initialImageData,
    previewImageData,
    scale,
  ]);

  return (
    <div style={{ height: "100%" }} ref={setContainer}>
      <Box
        style={{ height: `${RESIZE_BUTTON_HEIGHT}px` }}
        display={"flex"}
        justifyContent={"center"}
        flexDirection={"row"}
        gap={1}
      >
        {imgParams && canvasHeight && canvasWidth && (
          <ResizeOptionsButton
            initialHeight={image.height}
            initialWidth={image.width}
            newHeight={imgParams.height}
            newWidth={imgParams.width}
            maxHeight={image.height * 2}
            maxWidth={image.width * 2}
            setImgParams={({ height, width }) => {
              setImgParams((prev) => {
                return { ...prev, height, width };
              });
            }}
            setResizingAlgorithm={setResizingAlghorithm}
          />
        )}
        {initialImageData && (
          <CurvesButton
            imageData={initialImageData}
            setPreviewImageData={setPreviewImageData}
            setImageData={setInitialImageData}
          />
        )}
        {initialImageData && (
          <FilterButton
            imageData={initialImageData}
            setImageData={setInitialImageData}
            setPreviewImageData={setPreviewImageData}
          />
        )}
      </Box>
      <div style={{ height: `${SCALE_BAR_HEIGHT}px` }}>
        {scale && (
          <Slider
            onChange={(event) => {
              const inputEvent =
                event as unknown as ChangeEvent<HTMLInputElement>;

              setScale(Number(inputEvent.target.value));
            }}
            value={scale}
            min={MIN_SCALE}
            max={MAX_SCALE}
            valueLabelDisplay="on"
            style={{ width: "300px" }}
          />
        )}
      </div>

      {containerHeight && containerWidth && (
        <canvas
          style={{
            width: "100%",
            border: "4px solid rgb(25, 118, 210)",
            borderRadius: "10px",
          }}
          height={containerHeight - SCALE_BAR_HEIGHT - RESIZE_BUTTON_HEIGHT}
          width={containerWidth}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          onMouseDown={onMouseDown}
          onMouseMove={(event) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            onMouseMove(event, scale);
          }}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          onMouseUp={onMouseUp}
          onClick={(event) => {
            const eventCanvas = event.target as HTMLCanvasElement;

            const rect = eventCanvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const ctx = eventCanvas.getContext("2d");

            if (ctx === null) return;

            const pixelData = ctx.getImageData(x, y, 1, 1).data;

            const [r, g, b, a] = pixelData;

            onCanvasClick({
              rgb: { r, g, b, a },
              coordinates: {
                x,
                y,
              },
            });
          }}
          ref={setCanvas}
        ></canvas>
      )}
    </div>
  );
};
