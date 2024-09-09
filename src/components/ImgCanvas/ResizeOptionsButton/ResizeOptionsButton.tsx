import {
  Box,
  Button,
  Checkbox,
  Input,
  MenuItem,
  Modal,
  Select,
  Tooltip,
} from "@mui/material";
import { FC, useCallback, useState } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

export type ResizingAlgorithm = "nearestNeighbor" | "bilinear";

interface Props {
  initialHeight: number;
  initialWidth: number;
  newHeight: number;
  newWidth: number;
  maxHeight: number;
  maxWidth: number;
  setImgParams: ({ height, width }: { height: number; width: number }) => void;
  setResizingAlgorithm: (algorithm: ResizingAlgorithm) => void;
}

export const ResizeOptionsButton: FC<Props> = ({
  initialHeight,
  initialWidth,
  newHeight,
  newWidth,
  maxHeight,
  maxWidth,
  setImgParams,
  setResizingAlgorithm,
}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [measuringUnits, setMeasuringUnits] = useState<"px" | "percent">("px");

  const [newResizingAlgorithm, setNewResizingAlgorithm] =
    useState<ResizingAlgorithm>("nearestNeighbor");

  const [keepProportions, setKeepProportions] = useState(false);

  const [changedImgHeight, setChangedImgHeight] = useState(newHeight);

  const [changedImgWidth, setChangedImgWidth] = useState(newWidth);

  const getSizeByMeasuringUnits = useCallback(
    (side: "height" | "width") => {
      if (side === "height") {
        if (measuringUnits === "px") {
          return changedImgHeight.toFixed(3);
        } else {
          return ((changedImgHeight / initialHeight) * 100).toFixed(3);
        }
      } else {
        if (measuringUnits === "px") {
          return changedImgWidth.toFixed(3);
        } else {
          return ((changedImgWidth / initialWidth) * 100).toFixed(3);
        }
      }
    },
    [
      changedImgHeight,
      changedImgWidth,
      initialHeight,
      initialWidth,
      measuringUnits,
    ]
  );

  const changeSideSizeByMeasuringUnits = useCallback(
    (side: "height" | "width", sizeValue: number) => {
      if (side === "height") {
        if (measuringUnits === "px") {
          if (keepProportions) {
            setChangedImgWidth(initialWidth * (sizeValue / initialHeight));
          }

          setChangedImgHeight(sizeValue);
        } else {
          const heightPixelValue = (initialHeight * sizeValue) / 100;

          if (keepProportions) {
            setChangedImgWidth(
              initialWidth * (heightPixelValue / initialHeight)
            );
          }

          setChangedImgHeight(heightPixelValue);
        }
      } else if (side === "width") {
        if (measuringUnits === "px") {
          if (keepProportions) {
            setChangedImgHeight(initialHeight * (sizeValue / initialWidth));
          }

          setChangedImgWidth(sizeValue);
        } else {
          const widthPixelValue = (initialWidth * sizeValue) / 100;

          if (keepProportions) {
            setChangedImgHeight(
              initialHeight * (widthPixelValue / initialWidth)
            );
          }

          setChangedImgWidth((initialWidth * sizeValue) / 100);
        }
      }
    },
    [initialHeight, initialWidth, keepProportions, measuringUnits]
  );

  return (
    <div>
      <Button onClick={handleOpen}>Change size</Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <div>Initial(H*W): {Math.round(initialHeight * initialWidth)}</div>
          <div>New(H*W): {Math.round(newHeight * newWidth)}</div>

          <Box display={"flex"} gap={1} alignItems={"center"}>
            Units of calculation
            <Select
              value={measuringUnits}
              onChange={(event) => {
                const measuringUnit = event.target.value as "px" | "percent";

                setMeasuringUnits(measuringUnit);
              }}
            >
              <MenuItem value={"px"}>px</MenuItem>
              <MenuItem value={"percent"}>percent</MenuItem>
            </Select>
          </Box>

          <Box display={"flex"} gap={1} alignItems={"center"}>
            Resizing alghoritm
            <Select<ResizingAlgorithm>
              value={newResizingAlgorithm}
              onChange={(event) => {
                const value = event.target.value as ResizingAlgorithm;
                if (value === "nearestNeighbor") {
                  setNewResizingAlgorithm(
                    event.target.value as ResizingAlgorithm
                  );
                }
              }}
            >
              <MenuItem value={"nearestNeighbor"}>
                <Box display={"flex"} gap={0.5}>
                  nearest neighborbilinear
                  <Tooltip
                    title={`Интерполяция по ближайшему соседу - чтобы определить значение тона пикселя масшабированного изображения необходимо найти ближайший к нему пиксель исходного изображения и задать уровень его тона.`}
                  >
                    <div>?</div>
                  </Tooltip>
                </Box>
              </MenuItem>
              <MenuItem value={"bilinear"}>
                <Box display={"flex"} gap={0.5}>
                  bilinear (soon)
                  <Tooltip
                    title={`Билинейная интерполяция присваивает среднее значение четырех соседних пикселей исходного изображения пикселю масштабированного`}
                  >
                    <div>?</div>
                  </Tooltip>
                </Box>
              </MenuItem>
            </Select>
          </Box>

          <Box display={"flex"} gap={1} alignItems={"center"}>
            Keep the proportions
            <Checkbox
              value={keepProportions}
              onChange={(event) => {
                setKeepProportions(event.target.checked);
              }}
            />
          </Box>

          <Box display={"flex"} gap={1} flexDirection={"column"}>
            <Box display={"flex"} gap={1} alignItems={"center"}>
              height:
              <Input
                value={getSizeByMeasuringUnits("height")}
                onChange={(event) => {
                  changeSideSizeByMeasuringUnits("height", +event.target.value);
                }}
                style={{ flex: 1 }}
                type="number"
              />
            </Box>
            <Box display={"flex"} gap={1} alignItems={"center"}>
              width:
              <Input
                value={getSizeByMeasuringUnits("width")}
                onChange={(event) => {
                  changeSideSizeByMeasuringUnits("width", +event.target.value);
                }}
                style={{ flex: 1 }}
                type="number"
              />
            </Box>
          </Box>
          <Button
            style={{ width: "100%" }}
            onClick={() => {
              const validWidth =
                changedImgWidth > 0 && changedImgWidth < maxWidth;

              const validHeight =
                changedImgHeight > 0 && changedImgHeight < maxHeight;

              if (validWidth && validHeight) {
                setImgParams({
                  width: Math.round(changedImgWidth),
                  height: Math.round(changedImgHeight),
                });

                setResizingAlgorithm(newResizingAlgorithm);
              } else {
                alert("not corrent img size");
              }
            }}
            variant={"contained"}
            type={"submit"}
          >
            Apply
          </Button>
        </Box>
      </Modal>
    </div>
  );
};
