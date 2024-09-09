import { Button, Input } from "@mui/material";
import { FC, useRef } from "react";

interface Props {
  setImg: (img: string) => void;
}

export const UrlFileInput: FC<Props> = ({ setImg }) => {
  const value = useRef<HTMLInputElement>();

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <label htmlFor="file">
        <b>Enter image url</b>
      </label>
      <div style={{ display: "flex", gap: "10px" }}>
        <Input inputRef={value} id="file" name="file" />
        <Button
          variant={"contained"}
          onClick={() => {
            setImg(value.current?.value ?? "");
          }}
        >
          Set img
        </Button>
      </div>
    </div>
  );
};
