import api from "./api";

export const placeOrder = async (order: any) => {
  return await api.post("/orders", order);
};