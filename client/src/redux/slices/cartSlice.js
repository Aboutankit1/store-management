import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/cart");
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to load cart");
  }
});

export const addToCartAsync = createAsyncThunk(
  "cart/add",
  async ({ productId, quantity = 1 }, { dispatch, rejectWithValue }) => {
    try {
      await api.post("/cart", { productId, quantity });
      dispatch(fetchCart());
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add item");
    }
  }
);

export const updateCartItemAsync = createAsyncThunk(
  "cart/update",
  async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      await api.put(`/cart/${productId}`, { quantity });
      dispatch(fetchCart());
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update item");
    }
  }
);

export const removeCartItemAsync = createAsyncThunk(
  "cart/remove",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/cart/${productId}`);
      dispatch(fetchCart());
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove item");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    itemsTotal: 0,
    status: "idle",
    error: null,
  },
  reducers: {
    clearCartLocal: (state) => {
      state.items = [];
      state.itemsTotal = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.itemsTotal = action.payload.itemsTotal || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
