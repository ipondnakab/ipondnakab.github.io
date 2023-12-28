import { environment } from "@/core/environment";
import { ContactForm } from "@/interfaces/contact";
import axios from "axios";

const baseURL = environment.baseUrl + "/contact";

export const createContact = async (contact: ContactForm) => {
  const response = await axios.post(baseURL, contact);
  return response.data;
};
