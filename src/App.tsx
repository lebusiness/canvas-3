import { useCallback, useEffect, useMemo, useState } from "react";

import "./App.css";
import { UploadFileInput } from "./components/UploadFileInput/UploadFileInput";
import { ImgCanvas, Pixel } from "./components/ImgCanvas/ImgCanvas";
import { UrlFileInput } from "./components/UrlFileInput/UrlFileInput";
import { Pipette } from "./Pipette";
import { Hand } from "./Hand";

import { ColorsInfo, PixelInfo } from "./components/ColorsInfo/ColorsInfo";
import { getBackgroundStyleByPixel } from "./utils/getBackgroundStyleByPixel";
import { isNull } from "./utils/isNull";

const DEFAULT_DISPLACEMENT_SIZE = 10;

function App() {
  const [imgSrc, setImg] = useState<string>();

  // instruments
  const [isPipetteActive, setIsPipetteActive] = useState(false);
  const [isPipetteInfoOpen, setIsPipetteInfoOpen] = useState(false);

  const [isHandActive, setIsHandActive] = useState(false);
  const [isHandBustActive, setIsHandBustActive] = useState(false);
  const [displacement, setDisplacement] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  // --

  // active colors
  const [color, setColor] = useState<Pixel | null>(null);

  const [isSecondColorSelectKeyPressed, setIsSecondColorSelectKeyPressed] =
    useState(false);

  const [colors, setColors] = useState<{
    primary: PixelInfo | null;
    secondary: PixelInfo | null;
  }>({ primary: null, secondary: null });

  // подписка на нажатия клавиш для пипетки
  useEffect(() => {
    // (windows = macOs): shift = shift, cntrl = control | command, alt = option

    const downHandler = (event: KeyboardEvent) => {
      setIsSecondColorSelectKeyPressed(
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
      );
    };

    const upHandler = (event: KeyboardEvent) => {
      if (isSecondColorSelectKeyPressed) {
        setIsSecondColorSelectKeyPressed(
          event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
        );
      }
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [isSecondColorSelectKeyPressed]);

  // подписка на нажатия клавиш для буста передвижения
  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      if (event.key === " " || event.code === "Space") {
        setIsHandBustActive(true);
      }
    };

    const upHandler = (event: KeyboardEvent) => {
      if (event.key === " " || event.code === "Space") {
        setIsHandBustActive(false);
      }
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);

  // подписка на стрелки
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isHandActive) return;

      switch (event.key) {
        case "ArrowLeft":
          setDisplacement((prev) => ({
            ...prev,
            x:
              prev.x -
              (isHandBustActive
                ? DEFAULT_DISPLACEMENT_SIZE * 5
                : DEFAULT_DISPLACEMENT_SIZE),
          }));
          break;
        case "ArrowRight":
          setDisplacement((prev) => ({
            ...prev,
            x:
              prev.x +
              (isHandBustActive
                ? DEFAULT_DISPLACEMENT_SIZE * 5
                : DEFAULT_DISPLACEMENT_SIZE),
          }));
          break;
        case "ArrowUp":
          setDisplacement((prev) => ({
            ...prev,
            y:
              prev.y -
              (isHandBustActive
                ? DEFAULT_DISPLACEMENT_SIZE * 5
                : DEFAULT_DISPLACEMENT_SIZE),
          }));
          break;
        case "ArrowDown":
          setDisplacement((prev) => ({
            ...prev,
            y:
              prev.y +
              (isHandBustActive
                ? DEFAULT_DISPLACEMENT_SIZE * 5
                : DEFAULT_DISPLACEMENT_SIZE),
          }));
          break;
        default:
          break;
      }
    };

    // Подписываемся на событие keydown
    window.addEventListener("keydown", handleKeyDown);

    // Функция для отписки от события
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHandActive, isHandBustActive]);

  const handleMouseMove = useCallback(
    (event: MouseEvent, scale: number) => {
      if (!isDragging || !isHandActive) return;

      const scaleK = scale / 100;

      const newX = displacement.x + (event.clientX - startPosition.x) / scaleK;
      const newY = displacement.y + (event.clientY - startPosition.y) / scaleK;

      setDisplacement({ x: newX, y: newY });
      setStartPosition({ x: event.clientX, y: event.clientY });
    },
    [
      displacement.x,
      displacement.y,
      isDragging,
      isHandActive,
      startPosition.x,
      startPosition.y,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback((event: MouseEvent) => {
    setIsDragging(true);
    setStartPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const changeColorHandler = useCallback(
    (pixelInfo: PixelInfo) => {
      const { rgb } = pixelInfo;
      setColor(rgb);

      if (isPipetteActive) {
        setColors((prev) => {
          if (isSecondColorSelectKeyPressed) {
            return {
              ...prev,
              secondary: pixelInfo,
            };
          } else {
            return {
              ...prev,
              primary: pixelInfo,
            };
          }
        });
      }
    },
    [isPipetteActive, isSecondColorSelectKeyPressed]
  );
  // --

  const [, rerender] = useState<object>();

  // every new src, new instance
  const image = useMemo(() => {
    const img = new Image();

    img.addEventListener("load", () => rerender({}));

    img.src = imgSrc ?? "";
    img.crossOrigin = "Anonymous";

    return img;
  }, [imgSrc]);

  return (
    <div className="App">
      {/* Load File */}
      <div
        style={{
          height: "105px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <UploadFileInput setImg={setImg} />
        or
        <UrlFileInput setImg={setImg} />
      </div>

      {/* Instruments Bar */}
      <div
        style={{
          height: "25px",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          marginBottom: "15px",
        }}
      >
        {/* Pipette */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              cursor: "pointer",
              padding: "1px",
              border: `1px solid ${isPipetteActive ? "green" : "white"}`,
            }}
            onClick={() => {
              setIsPipetteInfoOpen(!isPipetteActive);
              setIsPipetteActive((prev) => !prev);
            }}
          >
            <Pipette />
          </div>
          {isPipetteInfoOpen && (
            <ColorsInfo
              onClose={() => setIsPipetteInfoOpen(false)}
              primary={colors.primary}
              secondary={colors.secondary}
            />
          )}
        </div>

        {/* MoveHand */}
        <div
          style={{
            cursor: "pointer",
            padding: "1px",
            border: `1px solid ${isHandActive ? "green" : "white"}`,
          }}
          onClick={() => {
            setIsHandActive((prev) => !prev);
          }}
        >
          <Hand />
        </div>
      </div>

      {/* Canvas */}
      {imgSrc && (
        <>
          <div style={{ height: "calc(100vh - 105px - 25px - 15px - 120px)" }}>
            <ImgCanvas
              image={image}
              onCanvasClick={changeColorHandler}
              displacement={displacement}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            />
          </div>
          <div style={{ height: "120px", padding: "20px" }}>
            <div>
              natural size(HxW): {image.height}x{image.width}
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div>
                {Object.entries(color ?? {})
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ")}
              </div>
              {!isNull(color) &&
                !isNull(color.r) &&
                !isNull(color.g) &&
                !isNull(color.b) &&
                !isNull(color.a) && (
                  <div
                    style={{
                      border: "1px solid black",
                      height: "30px",
                      width: "30px",
                      background: getBackgroundStyleByPixel(color),
                      margin: "0 auto",
                    }}
                  ></div>
                )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
