import "server-only";

import axios from "axios";

export const apiClient = axios.create({
  adapter: "http",
  maxRedirects: 0,
});
