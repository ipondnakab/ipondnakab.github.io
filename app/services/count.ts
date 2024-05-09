import { environment } from "@/core/environment";
import axios from "axios";

const baseUrl = environment.baseUrl + "/count";

export const getCount = async (encryptName?: string) => {
  const response = await axios.get<{ count: number; savedName: boolean }>(
    baseUrl,
    {
      params: {
        n: encryptName,
      },
    },
  );
  return response.data;
};
