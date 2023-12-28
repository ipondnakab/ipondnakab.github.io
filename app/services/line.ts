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
  return axios.post(
    "https://us-central1-kittipat-resume.cloudfunctions.net/app/line/send-notify",
    payload,
  );
};
