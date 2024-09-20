import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  IconButton,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Input,
} from "@mui/material";

const style = {
  position: "absolute",
  top: "0%",
  right: "0%",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  py: 1,
  px: 3,
};

export const FilterButton: React.FC<{
  imageData: ImageData;
  setPreviewImageData: React.Dispatch<React.SetStateAction<ImageData | null>>;
  setImageData: React.Dispatch<React.SetStateAction<ImageData | null>>;
}> = ({ imageData, setPreviewImageData, setImageData }) => {
  const [isPreview, setIsPreview] = useState(false);

  const [open, setOpen] = useState(false);
  const [kernel, setKernel] = useState([
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ]);
  const [preset, setPreset] = useState("default");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setIsPreview(false);
    setOpen(false);
  };
  const handleReset = () => {
    setKernel([
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ]);

    setPreset("default");
  };

  const handlePresetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const presetValue = event.target.value;
    setPreset(presetValue);

    if (presetValue === "default") {
      setKernel([
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ]);
    } else if (presetValue === "sharpening") {
      setKernel([
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0],
      ]);
    } else if (presetValue === "gaussian") {
      setKernel([
        [1, 2, 1],
        [2, 4, 2],
        [1, 2, 1],
      ]);
    } else if (presetValue === "blur") {
      setKernel([
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ]);
    }
  };

  interface FilterSettings {
    presetValue: string;
    kernel: number[][];
    imageData: ImageData;
  }

  const applyFilter = useCallback(
    ({ presetValue, kernel, imageData }: FilterSettings): ImageData => {
      const width = imageData.width;
      const height = imageData.height;
      const baseKernelCoeff = getBaseKernelCoeff(presetValue, kernel);

      const newImageData = new ImageData(width, height);
      const data = imageData.data;
      const newData = newImageData.data;

      // Помощник для нахождения индекса в массиве
      const getIndex = (x: number, y: number) => (y * width + x) * 4;

      // Создаем расширенную версию данных для обработки краев
      const extendedData = new Uint8ClampedArray(
        (width + 2) * (height + 2) * 4
      );
      for (let y = 0; y < height + 2; y++) {
        for (let x = 0; x < width + 2; x++) {
          const srcX = Math.min(width - 1, Math.max(0, x - 1));
          const srcY = Math.min(height - 1, Math.max(0, y - 1));
          const srcIndex = getIndex(srcX, srcY);
          const destIndex = (y * (width + 2) + x) * 4;
          for (let i = 0; i < 4; i++) {
            extendedData[destIndex + i] = data[srcIndex + i];
          }
        }
      }

      // Применение ядра свертки
      for (let y = 1; y < height + 1; y++) {
        for (let x = 1; x < width + 1; x++) {
          const newPixel = [0, 0, 0, 255];
          for (let ky = 0; ky < 3; ky++) {
            for (let kx = 0; kx < 3; kx++) {
              const pixelX = x + kx - 1;
              const pixelY = y + ky - 1;
              const pixelIndex = (pixelY * (width + 2) + pixelX) * 4;
              for (let channel = 0; channel < 3; channel++) {
                newPixel[channel] +=
                  extendedData[pixelIndex + channel] * kernel[ky][kx];
              }
            }
          }
          const newPixelIndex = getIndex(x - 1, y - 1);
          for (let channel = 0; channel < 3; channel++) {
            newData[newPixelIndex + channel] = Math.min(
              255,
              Math.max(0, newPixel[channel] * baseKernelCoeff)
            );
          }
          newData[newPixelIndex + 3] = 255; // Устанавливаем альфа-канал
        }
      }

      return newImageData;
    },
    []
  );

  // возвращает коэффициент ядра для каждого предустановленной матрицы или пользовательской матрицы
  const getBaseKernelCoeff = (
    presetValue: string,
    kernel: number[][]
  ): number => {
    switch (presetValue) {
      case "gaussian":
        return 1 / 16;
      case "blur":
        return 1 / 9;
      default:
        // eslint-disable-next-line no-case-declarations
        const kernelSum = kernel.flat().reduce((sum, value) => sum + value, 0);
        return kernelSum !== 0 ? 1 / kernelSum : 1;
    }
  };

  useEffect(() => {
    if (isPreview) {
      setPreviewImageData(
        applyFilter({ imageData, kernel, presetValue: preset })
      );
    } else {
      setPreviewImageData(imageData);
    }
  }, [isPreview, imageData, setPreviewImageData, applyFilter, kernel, preset]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    const newValue = parseFloat(event.target.value);
    const newKernel = kernel.map((row, rIndex) =>
      row.map((value, cIndex) =>
        rIndex === rowIndex && cIndex === colIndex ? newValue : value
      )
    );
    setKernel(newKernel);
  };

  return (
    <div>
      <Button variant={"outlined"} color="primary" onClick={handleOpen}>
        Open Filter Dialog
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: `rgba(0, 0, 0, ${isPreview ? 0.0 : 0.5})`, // фон backdrop с прозрачностью
          },
        }}
      >
        <Box sx={style}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6" component="h2">
              Image Filtering
            </Typography>
            <IconButton onClick={handleClose}>x</IconButton>
          </Box>
          <Grid container spacing={1}>
            {kernel.map((row, rowIndex) =>
              row.map((value, colIndex) => (
                <Grid item xs={4} key={`${rowIndex}-${colIndex}`}>
                  <Input
                    inputProps={{ step: 1 }}
                    value={value}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e: any) =>
                      handleInputChange(e, rowIndex, colIndex)
                    }
                    style={{ height: "20px", padding: 0 }}
                    type="number"
                    fullWidth
                  />
                </Grid>
              ))
            )}
          </Grid>

          <Box mt={1}>
            <Typography variant="subtitle1">Kernel preset:</Typography>
            <RadioGroup
              value={preset}
              onChange={handlePresetChange}
              style={{ flexDirection: "row" }}
            >
              <FormControlLabel
                style={{ display: "inline-block" }}
                value="default"
                control={<Radio />}
                label="Default"
              />
              <FormControlLabel
                value="sharpening"
                control={<Radio />}
                label="Sharpening"
              />
              <FormControlLabel
                value="gaussian"
                control={<Radio />}
                label="Gaussian filter"
              />
              <FormControlLabel
                value="blur"
                control={<Radio />}
                label="Rectangular blur"
              />
            </RadioGroup>
          </Box>

          <Box display="flex" justifyContent="space-between" mt={1}>
            <Box>
              Preview Mode
              <Checkbox
                onChange={() => {
                  setIsPreview((prev) => !prev);
                }}
              />
            </Box>
            <Box gap={1} display={"flex"}>
              <Button variant="outlined" onClick={handleReset}>
                Reset
              </Button>
              <Button
                onClick={() => {
                  setImageData(
                    applyFilter({ imageData, presetValue: preset, kernel })
                  );
                  handleClose();
                }}
                variant="contained"
                color="primary"
              >
                OK
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};
