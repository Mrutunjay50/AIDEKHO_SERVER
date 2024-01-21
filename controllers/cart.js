const Cart = require('../models/SavedTools');
const User = require('../models/User'); // Assuming you have a User model
const Tool = require('../models/ToolsAI');
const ToolsGPT = require('../models/ToolsGPT');
const ToolsPlugin = require('../models/ToolsPlugins');
const { getSignedUrlFromS3 } = require('../utils/s3Utils');

exports.addToCart = async (req, res) => {
  try {
    const { userId, toolId, toolType } = req.body;

    // Check if the user exists
    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the tool exists based on the type
    let toolModel;
    switch (toolType) {
      case 'aiTool':
        toolModel = Tool;
        break;
      case 'gptTool':
        toolModel = ToolsGPT;
        break;
      case 'pluginTool':
        toolModel = ToolsPlugin;
        break;
      default:
        return res.status(400).json({ error: 'Invalid tool type' });
    }

    const toolExists = await toolModel.exists({ _id: toolId });

    if (!toolExists) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    // Find the user's cart or create one if it doesn't exist
    let userCart = await Cart.findOne({ user: userId });

    if (!userCart) {
      userCart = await Cart.create({ user: userId });
    }

    // Add the tool to the user's cart if not already present
    if (!userCart[toolType].includes(toolId)) {
      userCart[toolType].push(toolId);
      await userCart.save();
       // Increment the savedcount of the tool by one
       await toolModel.findByIdAndUpdate(toolId, { $inc: { savedcount: 1 } });
    }

    res.json({ success: true, message: 'Tool added to cart successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getCart = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user exists
    const userExists = await User.exists({ _id: id });

    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the user's cart and populate each tool array
    const userCart = await Cart.findOne({ user: id })
      .populate('aiTool')
      .populate('gptTool')
      .populate('pluginTool');

      // Add signed URLs to each aiTool's imageUrl
    const signedAITools = await Promise.all(userCart.toObject().aiTool.map(async (tool) => {
      if (tool.image) {
        tool.imageUrl = await getSignedUrlFromS3(tool.image);
      }
      return tool;
    }));

    // Add signed URLs to each pluginTool's imageUrl
    const signedPluginTools = await Promise.all(userCart.toObject().pluginTool.map(async (tool) => {
      if (tool.image) {
        tool.imageUrl = await getSignedUrlFromS3(tool.image);
      }
      return tool;
    }));

    res.json({ success: true, cart: { ...userCart.toObject(), aiTool: signedAITools, pluginTool: signedPluginTools } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Add this controller to delete the entire cart
exports.deleteCart = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user exists
    const userExists = await User.exists({ _id: id });

    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the user's cart
    await Cart.deleteOne({ user: id });

    res.json({ success: true, message: 'Cart deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Add this controller to delete a specific item from the cart
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, toolId, toolType } = req.body;

    // Check if the user exists
    console.log(req.body);
    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the tool exists based on the type
    let toolModel;
    switch (toolType) {
      case 'aiTool':
        toolModel = Tool;
        break;
      case 'gptTool':
        toolModel = ToolsGPT;
        break;
      case 'pluginTool':
        toolModel = ToolsPlugin;
        break;
      default:
        return res.status(400).json({ error: 'Invalid tool type' });
    }

    const toolExists = await toolModel.exists({ _id: toolId });

    if (!toolExists) {
      return res.status(404).json({ error: 'Tool not found' });
    }

    // Find the user's cart
    const userCart = await Cart.findOne({ user: userId });

    if (!userCart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Remove the tool from the user's cart
    const index = userCart[toolType].indexOf(toolId);
    if (index !== -1) {
      userCart[toolType].splice(index, 1);
      await userCart.save();

      // Decrement the savedcount of the tool by one
      await toolModel.findByIdAndUpdate(toolId, { $inc: { savedcount: -1 } });
    }

    const updatedCart = await Cart.findOne({ user: userId }).populate('aiTool gptTool pluginTool');
    // Add signed URLs to each aiTool's imageUrl
    const signedAITools = await Promise.all(updatedCart.toObject().aiTool.map(async (tool) => {
      if (tool.image) {
        tool.imageUrl = await getSignedUrlFromS3(tool.image);
      }
      return tool;
    }));

    // Add signed URLs to each pluginTool's imageUrl
    const signedPluginTools = await Promise.all(updatedCart.toObject().pluginTool.map(async (tool) => {
      if (tool.image) {
        tool.imageUrl = await getSignedUrlFromS3(tool.image);
      }
      return tool;
    }));

    res.status(200).json({ success: true, message: 'Tool removed from cart successfully', updatedCart: { ...userCart.toObject(), aiTool: signedAITools, pluginTool: signedPluginTools }  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};