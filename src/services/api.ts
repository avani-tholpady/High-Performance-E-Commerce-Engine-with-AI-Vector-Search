import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Change after backend deployment
});

export default api;