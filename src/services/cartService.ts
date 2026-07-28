import api from "./api";

export const getCart = async () => {
  return await api.get("/cart");
};

export const addToCart = async (productId: number) => {
  return await api.post("/cart", {
    productId,
  });
};

export const removeFromCart = async (id: number) => {
  return await api.delete(`/cart/${id}`);
};