import { environment } from "@/core/environment";
import axios from "axios";

const baseUrl = environment.baseUrl + "/count";

export const getCount = async () => {
  const response = await axios.get(baseUrl);
  return response.data;
};
