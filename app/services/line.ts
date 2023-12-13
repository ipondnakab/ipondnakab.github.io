import axios from "axios";

export interface LineNotifyPayload {
  message: string;
  imageThumbnail?: string;
  imageFullsize?: string;
  imageFile?: File;
  stickerPackageId?: number;
  stickerId?: number;
  notificationDisabled?: boolean;
}

export const lineNotify = (payload: LineNotifyPayload) => {
  return axios.post("https://notify-api.line.me/api/notify", payload, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_LINE_NOTIFY_TOKEN}`,
    },
  });
};
