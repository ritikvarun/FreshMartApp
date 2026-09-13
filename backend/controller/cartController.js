import User from "../model/userModel.js";


export const addToCart = async (req,res) => {
    try {
    const {itemId, size } = req.body;

    if (!itemId || !size) {
      return res.status(400).json({ message: "Item ID and size are required" });
    }

    const userData = await User.findById(req.userId);

    // Check if user exists
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure cartData is initialized
    let cartData = userData.cartData || {};

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    await User.findByIdAndUpdate(req.userId, { cartData });

    return res.status(201).json({ message: "Added to cart", cartData });
  } catch (error) {
    console.log("addToCart error:", error);
    return res.status(500).json({ message: "Server error while adding to cart" });
  }


    
}


export const UpdateCart = async (req, res) => {
    try {
        const { itemId, size, quantity } = req.body;
        if (!itemId || !size) {
            return res.status(400).json({ message: "Item ID and size are required" });
        }

        const userData = await User.findById(req.userId);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        let cartData = userData.cartData ? { ...userData.cartData } : {};

        if (Number(quantity) <= 0) {
            if (cartData[itemId]) {
                delete cartData[itemId][size];
                if (Object.keys(cartData[itemId]).length === 0) {
                    delete cartData[itemId];
                }
            }
        } else {
            if (!cartData[itemId]) {
                cartData[itemId] = {};
            }
            cartData[itemId][size] = Number(quantity);
        }

        await User.findByIdAndUpdate(req.userId, { cartData });
        return res.status(200).json({ message: "Cart updated", cartData });

    } catch (error) {
        console.error("UpdateCart error:", error);
        return res.status(500).json({ message: "updateCart error: " + error.message });
    }
}

export const getUserCart = async (req, res) => {
    try {
        const userData = await User.findById(req.userId);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const cartData = userData.cartData || {};
        return res.status(200).json(cartData);

    } catch (error) {
        console.error("getUserCart error:", error);
        return res.status(500).json({ message: "getUserCart error: " + error.message });
    }
}