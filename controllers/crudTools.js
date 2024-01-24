const Tools = require("../models/ToolsAI");
const ToolsGPT = require("../models/ToolsGPT");
const ToolsPlugins = require("../models/ToolsPlugins");
const { Subscribers } = require("../models/Category");
const User = require("../models/User");
const csv = require("csvtojson");
const json2csv = require("json2csv").parse;
const fs = require("fs");
const {
  resizeImage,
  uploadToS3,
  generateFileName,
  deleteFromS3,
} = require("../utils/s3Utils");

const addTool = async (req, res, next, model) => {
  try {
    if (model !== ToolsGPT) {
      if (req.file) {
        const { buffer, originalname, mimetype } = req.file;

        const resizedImageBuffer = await resizeImage(buffer);
        const fileName = generateFileName(originalname);

        await uploadToS3(resizedImageBuffer, fileName, mimetype);

        await model.create({ ...req.body, image: fileName });
      } else {
        await model.create({ ...req.body });
      }
    } else {
      await model.create({ ...req.body });
    }
    res.status(201).json("adding succesful");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addAiTools = async (req, res, next) => {
  await addTool(req, res, next, Tools);
};

exports.addGPTTools = async (req, res, next) => {
  await addTool(req, res, next, ToolsGPT);
};

exports.addPluginTools = async (req, res, next) => {
  await addTool(req, res, next, ToolsPlugins);
};

const getToolModel = (tooltype) => {
  switch (tooltype) {
    case "aiTool":
      return Tools;
    case "pluginTool":
      return ToolsPlugins;
    case "gptTool":
      return ToolsGPT;
    default:
      throw new Error("Invalid tooltype");
  }
};

exports.editAiTools = async (req, res, next) => {
  console.log(req.query);
  try {
    const tool = await getToolModel(req.query.type).findById(req.query.id);

    console.log(tool);

    if (!tool) {
      return res.status(404).json("Tool not found");
    }

    let updateFields = { ...req.body };

    if (req.file) {
      const { buffer, originalname, mimetype } = req.file;

      const resizedImageBuffer = await resizeImage(buffer);
      const fileName = generateFileName(originalname);

      await deleteFromS3(tool.image);

      await uploadToS3(resizedImageBuffer, fileName, mimetype);
      updateFields.image = fileName;
    }

    await getToolModel(req.query.type).findByIdAndUpdate(
      req.query.id,
      { $set: updateFields },
      { new: true }
    );

    res.status(201).json("Update successful");
  } catch (e) {
    console.log(e);
    res.status(500).json(e.message);
  }
};

// exports.uploadcsv = async (req, res) => {
//   let toolData = [];
//   try {
//     const response = await csv().fromFile(req.file.path);

//     for (var i = 0; i < response.length; i++) {
//       // console.log(response[i]?.category);
//       toolData.push({
//         name: response[i]?.name,
//         category: response[i]?.category1.replaceAll("#","") + "," + response[i]?.category2.replaceAll("#","").replaceAll("/"," "),
//         // category: response[i]?.category1 + " ," + response[i]?.category2,
//         // category: response[i]?.category.replaceAll("&", ",").replaceAll("and", ","),
//         description: response[i]?.description || "",
//         savedcount: response[i]?.savedcount || 0,
//         image: response[i]?.image + ".png" || "",
//         weburl: response[i]?.weburl,
//         tooltype: response[i]?.tooltype,
//         service: response[i]?.service || "",
//         servicecost: response[i]?.servicecost,
//       });
//     }

//     await Tools.insertMany(toolData);
//     res.status(201).json({ message: "uploaded" });
//     res.status(201).json({ toolData });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: err.message });
//   }
// };

exports.downloadCsv = async (req, res) => {
  try {
    const { toolType } = req.params;
    let data; // Fetch all data from MongoDB, adjust the query as needed
    let csvData;
    if (toolType === "subscribers") {
      data = await Subscribers.find({});
      csvData = json2csv(data, { fields: ["emails"] });
    } else {
      data = await getToolModel(toolType).find({});
      csvData = json2csv(data, {
        fields: [
          "name",
          "image",
          "category",
          "service",
          "servicecost",
          "savedcount",
          "description",
          "top",
        ],
      }); // Specify the fields you want in the CSV
    }

    // Save the CSV data to a file
    fs.writeFileSync("exportedData.csv", csvData);

    // Send the CSV file as a response
    res.download("exportedData.csv", "exportedData.csv", (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.downloadCsvUser = async (req, res) => {
  try {
    let data; // Fetch all data from MongoDB, adjust the query as needed
    let csvData;

    data = await User.find({});
    csvData = json2csv(data, { fields: ["name", "email"] }); // Specify the fields you want in the CSV

    // Save the CSV data to a file
    fs.writeFileSync("exportedData.csv", csvData);

    // Send the CSV file as a response
    res.download("exportedData.csv", "exportedData.csv", (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

exports.deleteAiTools = async (req, res, next) => {
  try {
    const tool = await getToolModel(req.query.type).findById(req.query.id);
    console.log(tool);
    if (tool.image) {
      await deleteFromS3(tool.image);
    }
    console.log(tool);
    await getToolModel(req.query.type).findByIdAndDelete(req.query.id);
    res.status(201).send("deleted");
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};

exports.addTopTag = async (req, res) => {
  try {
    const { toolId } = req.body; // Assuming you send the toolId from the frontend
    const tool = await Tools.findById(toolId);

    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }

    // Check if the "top" tag is already present in the featured array
    const hasTopTag = tool.tags.some((tag) => tag.tag === "top");

    if (hasTopTag) {
      return res.json({ success: true, message: "Top tag already present" });
    }

    const currentDate = new Date().toISOString();
    const newTag = { date: currentDate, tag: "top" };

    // Add the new tag to the tool's featured array
    tool.tags.push(newTag);

    // Get all tools with the "top" tag, sorted by date (oldest first)
    const topTools = await Tools.find({ "tags.tag": "top" }).sort(
      "featured.date"
    );

    // If there are more than 50 tools with the "top" tag, remove the oldest one
    if (topTools.length > 50) {
      const oldestTopTool = topTools[0];
      // Remove the oldest top tag
      oldestTopTool.tags = oldestTopTool.tags.filter((t) => t.tag !== "top");
      // Save the updated tool document
      await oldestTopTool.save();
    }

    // Save the updated tool document
    await tool.save();

    res.json({ success: true, message: "Tag added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.addFeatureTag = async (req, res) => {
  try {
    const { toolId } = req.body; // Assuming you send the toolId from the frontend
    const tool = await Tools.findById(toolId);

    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }

    // Check if the "featured" tag is already present in the featured array
    const hasFeaturedTag = tool.featured.some((tag) => tag.tag === "featured");

    if (hasFeaturedTag) {
      // Remove the entire "featured" field from the tool document
      tool.featured = undefined;
    } else {
      const currentDate = new Date().toISOString();
      const newTag = { date: currentDate, tag: "featured" };

      // Add the new tag to the tool's featured array
      tool.featured.push(newTag);

      // Get all tools with the "featured" tag, sorted by date (oldest first)
      const topTools = await Tools.find({ "featured.tag": "featured" }).sort(
        "featured.date"
      );

      // If there are more than 8 tools with the "featured" tag, remove the oldest one
      if (topTools.length > 8) {
        const oldestTopTool = topTools[0];
        // Remove the oldest "featured" tag
        oldestTopTool.featured = oldestTopTool.featured.filter(
          (t) => t.tag !== "featured"
        );
        // Save the updated tool document
        await oldestTopTool.save();
      }
    }

    // Save the updated tool document
    await tool.save();

    res.json({ success: true, message: "Featured tag processed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
