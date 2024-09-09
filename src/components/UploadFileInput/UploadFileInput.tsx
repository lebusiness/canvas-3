import { Input } from "@mui/material";
import { ChangeEvent, FC } from "react";

interface Props {
  setImg: (img: string) => void;
}

export const UploadFileInput: FC<Props> = ({ setImg }) => {
  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <label htmlFor="file">
        <b>Upload File</b>
      </label>

      <Input
        id="file"
        name="file"
        type="file"
        inputProps={{
          accept: "image/*",
        }}
        title=" "
        style={{ width: "220px" }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];

          if (file) {
            setImg(URL.createObjectURL(file));
          }
        }}
      />
    </div>
  );
};
