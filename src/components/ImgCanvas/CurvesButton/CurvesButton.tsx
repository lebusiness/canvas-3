import { Box, Button, Checkbox, Input, Modal, Typography } from "@mui/material";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler,
} from "chart.js";

import { FC, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

const style = {
  position: "absolute",
  top: "0%",
  right: "0%",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  py: 1,
  px: 3,
};

interface Coord {
  x: number;
  y: number;
}

interface Props {
  imageData: ImageData;
  setPreviewImageData: React.Dispatch<React.SetStateAction<ImageData | null>>;
  setImageData: React.Dispatch<React.SetStateAction<ImageData | null>>;
}

export const CurvesButton: FC<Props> = ({
  imageData,
  setPreviewImageData,
  setImageData,
}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setIsPreview(false);
    setPreviewImageData(null);
  };
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div>
      <Button onClick={handleOpen}>Curves</Button>
      <Modal
        open={open}
        onClose={() => {
          handleClose();
        }}
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: `rgba(0, 0, 0, ${isPreview ? 0.0 : 0.5})`, // фон backdrop с прозрачностью
          },
        }}
      >
        <Box sx={{ ...style }}>
          <Box paddingBottom={1} display={"flex"} justifyContent={"flex-end"}>
            <b style={{ cursor: "pointer" }} onClick={handleClose}>
              x
            </b>
          </Box>

          <RGBHistogram
            handleClose={handleClose}
            imageData={imageData}
            isPreview={isPreview}
            setIsPreview={setIsPreview}
            setPreviewImageData={setPreviewImageData}
            setImageData={setImageData}
          />
        </Box>
      </Modal>
    </div>
  );
};

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler
);

const RGBHistogram = ({
  handleClose,
  imageData,
  isPreview,
  setIsPreview,
  setPreviewImageData,
  setImageData,
}: {
  handleClose: () => void;
  imageData: ImageData;
  isPreview: boolean;
  setIsPreview: React.Dispatch<React.SetStateAction<boolean>>;
  setPreviewImageData: React.Dispatch<React.SetStateAction<ImageData | null>>;
  setImageData: React.Dispatch<React.SetStateAction<ImageData | null>>;
}) => {
  const [point1, setPoint1] = useState({
    x: 0,
    y: 0,
  });

  const [point2, setPoint2] = useState({
    x: 255,
    y: 255,
  });

  const generateHistogramData = (imageData: ImageData) => {
    const red = new Array(256).fill(0);
    const green = new Array(256).fill(0);
    const blue = new Array(256).fill(0);

    for (let i = 0; i < imageData.data.length; i += 4) {
      red[imageData.data[i]]++;
      green[imageData.data[i + 1]]++;
      blue[imageData.data[i + 2]]++;
    }

    return { red, green, blue };
  };

  const normalizeData = (data: {
    red: number[];
    green: number[];
    blue: number[];
  }) => {
    const maxVal = Math.max(...data.red.concat(data.green, data.blue));
    return {
      red: data.red.map((value: number) => (value / maxVal) * 255),
      green: data.green.map((value: number) => (value / maxVal) * 255),
      blue: data.blue.map((value: number) => (value / maxVal) * 255),
    };
  };

  const applyTransformation = (
    imageData: ImageData,
    point1: Coord,
    point2: Coord
  ) => {
    const transform = (x: number) => {
      if (x <= point1.x) return point1.y;
      if (x >= point2.x) return point2.y;
      return (
        point1.y +
        ((x - point1.x) * (point2.y - point1.y)) / (point2.x - point1.x)
      );
    };

    const newImageData = new ImageData(imageData.width, imageData.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      newImageData.data[i] = transform(imageData.data[i]); // Red
      newImageData.data[i + 1] = transform(imageData.data[i + 1]); // Green
      newImageData.data[i + 2] = transform(imageData.data[i + 2]); // Blue
      newImageData.data[i + 3] = imageData.data[i + 3]; // Alpha
    }
    return newImageData;
  };

  useEffect(() => {
    if (isPreview) {
      const transformedImageData = applyTransformation(
        imageData,
        point1,
        point2
      );
      setPreviewImageData(transformedImageData);
    } else {
      setPreviewImageData(imageData);
    }
  }, [isPreview, point1, point2, imageData, setPreviewImageData]);

  const data = generateHistogramData(imageData);
  const normalizedData = normalizeData(data);

  const chartData = {
    labels: Array.from({ length: 256 }, (_, i) => i),
    datasets: [
      {
        label: "Red",
        data: normalizedData.red,
        borderColor: "red",
        borderWidth: 1,
        pointRadius: 1,
        fill: false,
      },
      {
        label: "Green",
        data: normalizedData.green,
        borderColor: "green",
        borderWidth: 1,
        pointRadius: 1,
        fill: false,
      },
      {
        label: "Blue",
        data: normalizedData.blue,
        borderColor: "blue",
        borderWidth: 1,
        pointRadius: 1,
        fill: false,
      },
      {
        label: "Custom Line",
        data: [
          { x: 0, y: point1.y }, // Соединение с левым краем графика
          point1,
          point2,
          { x: 255, y: point2.y }, // Соединение с правым краем графика
        ],
        borderColor: "black",
        borderWidth: 1,
        pointRadius: 1,
        fill: false,
        showLine: true,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: "linear" as const,
        beginAtZero: true,
        max: 255,
      },
      y: {
        beginAtZero: true,
        max: 255,
      },
    },
  };

  return (
    <>
      <Box
        bgcolor={"white"}
        paddingX={2}
        paddingY={0.5}
        style={{ border: "2px solid blue" }}
        flexDirection={"column"}
        display={"flex"}
        alignItems={"center"}
        gap={1}
      >
        <Box display={"flex"} gap={2}>
          <Box display={"flex"} gap={0.5} alignItems={"center"}>
            <Typography variant={"body1"}>Input:</Typography>
            <Box display={"flex"} alignItems={"center"} gap={1}>
              x1:
              <Input
                style={{ width: 40 }}
                type="number"
                value={point1.x}
                onChange={(e) => {
                  if (
                    +e.target.value >= 0 &&
                    +e.target.value <= 255 &&
                    +e.target.value < point2.x
                  )
                    setPoint1({ y: point1.y, x: +e.target.value });
                }}
              />
            </Box>
            <Box display={"flex"} alignItems={"center"} gap={1}>
              y1:
              <Input
                style={{ width: 40 }}
                type="number"
                value={point1.y}
                onChange={(e) => {
                  if (
                    +e.target.value >= 0 &&
                    +e.target.value <= 255 &&
                    +e.target.value < point2.y
                  )
                    setPoint1({ y: +e.target.value, x: point1.x });
                }}
              />
            </Box>
          </Box>
          <Box display={"flex"} gap={0.5} alignItems={"center"}>
            Output:
            <Box display={"flex"} alignItems={"center"} gap={1}>
              x2:
              <Input
                style={{ width: 40 }}
                type="number"
                value={point2.x}
                onChange={(e) => {
                  if (
                    +e.target.value >= 0 &&
                    +e.target.value <= 255 &&
                    +e.target.value > point1.x
                  )
                    setPoint2({ y: point2.y, x: +e.target.value });
                }}
              />
            </Box>
            <Box display={"flex"} alignItems={"center"} gap={1}>
              y2:
              <Input
                style={{ width: 40 }}
                type="number"
                value={point2.y}
                onChange={(e) => {
                  if (
                    +e.target.value >= 0 &&
                    +e.target.value <= 255 &&
                    +e.target.value > point1.y
                  )
                    setPoint2({ y: +e.target.value, x: point2.x });
                }}
              />
            </Box>
          </Box>
        </Box>
        <Box display={"flex"} alignItems={"center"}>
          <Box>
            Preview Mode
            <Checkbox
              onChange={() => {
                setIsPreview((prev) => !prev);
              }}
            />
          </Box>
          <Box display={"flex"} gap={1} height={25}>
            <Button
              variant={"contained"}
              onClick={() => {
                const transformedImageData = applyTransformation(
                  imageData,
                  point1,
                  point2
                );

                setImageData(transformedImageData);

                handleClose();
              }}
            >
              Accept
            </Button>
            <Button
              variant={"contained"}
              color={"warning"}
              onClick={() => {
                setPoint1({
                  x: 0,
                  y: 0,
                });
                setPoint2({
                  x: 255,
                  y: 255,
                });
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Box>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      {!isPreview && <Line data={chartData} options={options} />}
    </>
  );
};
