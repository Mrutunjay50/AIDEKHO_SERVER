const Tools = require("../models/ToolsAI");
const ToolsPlugins = require("../models/ToolsPlugins");
const { getSignedUrlFromS3 } = require('../utils/s3Utils');
const ToolsGPT = require("../models/ToolsGPT");
const {Categories, Metadata, Subscribers} = require("../models/Category");
const { validationResult } = require('express-validator');


exports.getAiTools = async (req, res) => {
  try {
    const { page, limit, sortBy, category, search } = req.query;
    let query = {name: { $ne: "" }};
    let result;
    let totalToolsCount;
    let endIndex;
    let sortOptions = {};

    if (sortBy === 'mostsaved') {
      sortOptions = { savedcount: -1 }; // Sort by savedcount in descending order
    } else if (sortBy === 'new') {
      sortOptions = { createdAt: -1 }; // Sort by createdAt in descending order
    } else if (sortBy === 'alphabeticalorder') {
      sortOptions = { name: 1 }; // Sort by name in alphabetical order
    } else if (sortBy === 'specialoffers'){
      sortOptions = {servicecost : 1};
    } else if (sortBy === 'all'){
      sortOptions; // Handle 'all' sorting case, if needed
    } else if (sortBy === "miner'spick"){
      query = {
        ...query,
        'tags.tag': 'top', // Find documents with the 'top' tag
      };
    }

    if (category) {
      const keywordsArray = category.split(',').map(keyword => keyword.replaceAll("%20" , " "));
      query = { ...query, category: { $regex: keywordsArray.join('|'), $options: 'i' } };
      // $regex is used to perform a regex match on the category field using the keywordsArray
      // $options: 'i' makes the regex case-insensitive
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = { ...query, $or: [{ category: searchRegex }] };
      // Add more fields to search in if needed, here we're searching in 'name' and 'description'
    }

    if (page && limit) {
      const pageNumber = parseInt(page);
      const pageSize = parseInt(limit);
      const startIndex = (pageNumber - 1) * pageSize;
      endIndex = pageNumber * pageSize;

      totalToolsCount = await Tools.countDocuments(query);
      if (endIndex < totalToolsCount) {
        result = {
          nextPage: pageNumber + 1,
          data: await Tools.find(query).sort(sortOptions).limit(pageSize).skip(startIndex),
        };
      } else {
        result = {
          data: await Tools.find(query).sort(sortOptions).limit(pageSize).skip(startIndex),
        };
      }
    } else {
      result = {
        data: await Tools.find(query).sort(sortOptions),
      };
    }

    if (result.data.length > 0) {
      for (const tool of result.data) {
        if (Array.isArray(tool.image)) {
          tool.imageUrl = await Promise.all(tool.image.map(async (image) => {
            return await getSignedUrlFromS3(image);
          }));
        } else if (tool.image) {
          tool.imageUrl = await getSignedUrlFromS3(tool.image);
        }
      }
    }


    res.status(200).json({result, currentPage : parseInt(page), hasLastPage : endIndex < totalToolsCount, hasPreviousPage : parseInt(page) > 1, nextPage : parseInt(page) + 1, previousPage : parseInt(page) - 1, lastPage : Math.ceil(totalToolsCount / parseInt(limit))});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
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

exports.getOneAiTools = async (req, res, next) => {
  try {
    const tool = await getToolModel(req.query.type).findById(req.query.id);
    if (!tool) {
      return res.status(404).json("Tool not found");
    }

    res.status(200).json(tool);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.topPicks = async (req, res) => {
  try {
    // Find documents with the 'top' tag and sort them based on the date in the tags field
    const topPicks = await Tools.find({
      'tags.tag': 'top', // Find documents with the 'top' tag
    })
      .sort({ 'tags.date': -1 }) // Sort by date in descending order
      .limit(50); // Limit the results to 50
      if (topPicks.length > 0) {
        for (const tool of topPicks) {
          if (Array.isArray(tool.image)) {
            tool.imageUrl = await Promise.all(tool.image.map(async (image) => {
              return await getSignedUrlFromS3(image);
            }));
          } else if (tool.image) {
            tool.imageUrl = await getSignedUrlFromS3(tool.image);
          }
        }
      }
    res.status(200).json(topPicks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.featuredPicks = async (req, res) => {
  try {
    // Find documents with the 'top' tag and sort them based on the date in the tags field
    const featuredPicks = await Tools.find({
      'featured.tag': 'featured', // Find documents with the 'top' tag
    })
      .sort({ 'featured.date': -1 }) // Sort by date in descending order
      .limit(8); // Limit the results to 50
      if (featuredPicks.length > 0) {
        for (const tool of featuredPicks) {
          if (Array.isArray(tool.image)) {
            tool.imageUrl = await Promise.all(tool.image.map(async (image) => {
              return await getSignedUrlFromS3(image);
            }));
          } else if (tool.image) {
            tool.imageUrl = await getSignedUrlFromS3(tool.image);
          }
        }
      }
    res.status(200).json(featuredPicks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.getPlugins = async (req, res) => {
  try {
    const { page, limit, sortBy, category, search } = req.query;
    let query = {name: { $ne: "" }};
    let result;
    let totalToolsCount;
    let endIndex;
    let sortOptions = {};

    if (sortBy === 'mostsaved') {
      sortOptions = { savedcount: -1 }; // Sort by savedcount in descending order
    } else if (sortBy === 'new') {
      sortOptions = { createdAt: -1 }; // Sort by createdAt in descending order
    } else if (sortBy === 'alphabeticalorder') {
      sortOptions = { name: 1 }; // Sort by name in alphabetical order
    } else if (sortBy === 'specialoffers'){
      sortOptions = {servicecost : 1};
    } else if (sortBy === 'all'){
      sortOptions; // Handle 'all' sorting case, if needed
    } else if (sortBy === 'minerspick'){
      sortOptions; 
    }

    if (category) {
      const keywordsArray = category.split(',').map(keyword => keyword.replaceAll("%20" , " "));
      query = { ...query, category: { $regex: keywordsArray.join('|'), $options: 'i' } };
      // $regex is used to perform a regex match on the category field using the keywordsArray
      // $options: 'i' makes the regex case-insensitive
    }
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = { ...query, $or: [{ category: searchRegex }] };
      // Add more fields to search in if needed, here we're searching in 'name' and 'description'
    }

    if (page && limit) {
      const pageNumber = parseInt(page);
      const pageSize = parseInt(limit);
      const startIndex = (pageNumber - 1) * pageSize;
      endIndex = pageNumber * pageSize;

      totalToolsCount = await ToolsPlugins.countDocuments(query);
      if (endIndex < totalToolsCount) {
        result = {
          nextPage: pageNumber + 1,
          data: await ToolsPlugins.find(query).sort(sortOptions).limit(pageSize).skip(startIndex),
        };
      } else {
        result = {
          data: await ToolsPlugins.find(query).sort(sortOptions).limit(pageSize).skip(startIndex),
        };
      }
    } else {
      result = {
        data: await ToolsPlugins.find(query).sort(sortOptions),
      };
    }
    if (result.data.length > 0) {
      for (const tool of result.data) {
        if (Array.isArray(tool.image)) {
          tool.imageUrl = await Promise.all(tool.image.map(async (image) => {
            return await getSignedUrlFromS3(image);
          }));
        } else if (tool.image) {
          tool.imageUrl = await getSignedUrlFromS3(tool.image);
        }
      }
    }
    res.status(200).json({result, currentPage : parseInt(page), hasLastPage : endIndex < totalToolsCount, hasPreviousPage : parseInt(page) > 1, nextPage : parseInt(page) + 1, previousPage : parseInt(page) - 1, lastPage : Math.ceil(totalToolsCount / parseInt(limit))});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};



exports.getGptTools = async (req, res) => {
  try {
    const { page, limit, sortBy, category, search } = req.query;
    let query = {name: { $ne: "" }};
    let result;
    let totalToolsCount;
    let endIndex;
    let sortOptions = {};

    if (sortBy === 'mostsaved') {
      sortOptions = { savedcount: -1 }; // Sort by savedcount in descending order
    } else if (sortBy === 'new') {
      sortOptions = { createdAt: -1 }; // Sort by createdAt in descending order
    } else if (sortBy === 'alphabeticalorder') {
      sortOptions = { name: 1 }; // Sort by name in alphabetical order
    } else if (sortBy === 'specialoffers'){
      sortOptions = {servicecost : 1};
    } else if (sortBy === 'all'){
      sortOptions; // Handle 'all' sorting case, if needed
    } else if (sortBy === 'minerspick'){
      sortOptions; 
    }

    if (category) {
      const keywordsArray = category.split(',').map(keyword => keyword.replaceAll("%20" , " "));
      query = { ...query, category: { $regex: keywordsArray.join('|'), $options: 'i' } };
      // $regex is used to perform a regex match on the category field using the keywordsArray
      // $options: 'i' makes the regex case-insensitive
    }
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = { ...query, $or: [{ category: searchRegex }] };
      // Add more fields to search in if needed, here we're searching in 'name' and 'description'
    }

    if (page && limit) {
      const pageNumber = parseInt(page);
      const pageSize = parseInt(limit);
      const startIndex = (pageNumber - 1) * pageSize;
      endIndex = pageNumber * pageSize;

      totalToolsCount = await ToolsGPT.countDocuments(query);
      if (endIndex < totalToolsCount) {
        result = {
          nextPage: pageNumber + 1,
          data: await ToolsGPT.find(query).sort(sortOptions).limit(pageSize).skip(startIndex),
        };
      } else {
        result = {
          data: await ToolsGPT.find(query).sort(sortOptions).limit(pageSize).skip(startIndex),
        };
      }
    } else {
      result = {
        data: await ToolsGPT.find(query).sort(sortOptions),
      };
    }

    res.status(200).json({result, currentPage : parseInt(page), hasLastPage : endIndex < totalToolsCount, hasPreviousPage : parseInt(page) > 1, nextPage : parseInt(page) + 1, previousPage : parseInt(page) - 1, lastPage : Math.ceil(totalToolsCount / parseInt(limit))});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.getAllCategories = async (req, res) => {
  try {
    // const topPicks = await Categories
    const category = await Categories.find({});
    // console.log('Categories founded successfully.');

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateCategories = async (req, res, next) => {
  try {
    // Fetch the existing categories document
    const existingCategories = await Categories.findOne();

    // Split the input string into an array of categories
    const newCategories = req.body.category.split(',').map((category) => category.trim());

    if (existingCategories) {
      // If the document already exists, update the names array
      for (const newCategory of newCategories) {
        if (!existingCategories.names.includes(newCategory)) {
          existingCategories.names.push(newCategory);
        }
      }

      // Save the updated document
      await existingCategories.save();
      res.status(201).json({existingCategories, message : "updated successfully"});
    } else {
      // If no document exists, create a new one with the provided categories
      await Categories.create({ names: newCategories });
    }

    console.log('Categories updated successfully.');
  } catch (error) {
    console.error('Error updating categories:', error);
  }
};


// Controller to update show status for a sponsoredBy entry
exports.updateSponsorStatus = async (req, res) => {
  try {
    const { sponsorName, sponsorLink, show } = req.body;

    // Find the category that contains the sponsor
    let category = await Categories.findOne();

    if (!category) {
      // If the category doesn't exist, create a new one
      category = new Categories();
    }

    // Find the sponsor within the category
  const existingSponsor = category.sponsoredBy.find(sponsor => sponsor.name === sponsorName);

  if (sponsorName.trim() !== '' && sponsorLink.trim() !== '') {
    // If both name and link provided, update normally
    if (existingSponsor) {
      existingSponsor.link = sponsorLink;
      existingSponsor.show = show;
    } else {
      // If the sponsor doesn't exist and both name and link are provided, create a new one
      category.sponsoredBy = ({ name: sponsorName, link: sponsorLink, show });
    }
  } else if (sponsorName.trim() !== '' && sponsorLink.trim() === '') {
    // If name is new and link is not given, update only the name and show
    if (existingSponsor) {
      existingSponsor.show = show;
    } else {
      category.sponsoredBy = ({ name: sponsorName, link: category.sponsoredBy[0].link, show });
    }
  } else if (sponsorName.trim() === '' && sponsorLink.trim() !== '') {
    // If name not given but link is provided, update the link and show
    if (!existingSponsor) {
      category.sponsoredBy[0].link = sponsorLink;
      category.sponsoredBy[0].show = show;
    }
  } else {
    // If both name and link are not given, update only the show
    if (!existingSponsor) {
      category.sponsoredBy[0].show = show;
    }
  }
    // Save the updated category
    const updatedCategory = await category.save();

    res.status(200).json({message : "sponsored",updatedCategory});
  } catch (error) {
    console.error('Error updating sponsor status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



exports.setSubscribers = async (req, res, next) => {
  try {
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
    // Fetch the existing subscribers document
    const existingSubscribers = await Subscribers.findOne();

    // Split the input string into an array of subscribers
    const newSubscribers = req.body.email.split(',').map((subscriber) => subscriber.trim());

    if (existingSubscribers) {
      const newSubscribersList = [];

      // Check if each new subscriber is already present
      for (const newSubscriber of newSubscribers) {
        if (!existingSubscribers.emails.includes(newSubscriber)) {
          existingSubscribers.emails.push(newSubscriber);
          newSubscribersList.push(newSubscriber);
        }
      }

      if (newSubscribersList.length > 0) {
        // Save the updated document
        const savedSubscribers = await existingSubscribers.save();
        res.status(201).json({ existingSubscribers: savedSubscribers, message: "Subscribed "});
      } else {
        res.status(201).json({ existingSubscribers, message: "Already Subscribed!!" });
      }
    } else {
      // If no document exists, create a new one with the provided emails
      const newSubscribersDocument = await Subscribers.create({ emails: newSubscribers });
      res.status(201).json({ existingSubscribers: newSubscribersDocument, message: "Subscribed " });
    }

  } catch (error) {
    console.error('Error updating subscribers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.updateMetadata = async (req, res) => {
  const { title, description, keywords } = req.body;

  try {
    // Check if metadata already exists
    let metadata = await Metadata.findOne();

    if (!metadata) {
      // If metadata doesn't exist, create a new one
      metadata = new Metadata({
        title,
        description,
        keywords,
      });
    } else {
      // If metadata exists, update it
      metadata.title = title;
      metadata.description = description;
      metadata.keywords = keywords;
    }

    // Save the metadata
    await metadata.save();

    res.json({ message: 'Metadata updated successfully' });
  } catch (error) {
    console.error('Error updating metadata:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getMetadata = async (req, res) => {
  try {
    // Check if metadata already exists
    let metadata = await Metadata.findOne();

    res.json({ message: 'Metadata fetched successfully', metadata });
  } catch (error) {
    console.error('Error updating metadata:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};