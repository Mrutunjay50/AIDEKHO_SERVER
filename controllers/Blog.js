const BlogModel = require('../models/Blog');
const { getSignedUrlFromS3 } = require('../utils/s3Utils');

const { resizeImage, uploadToS3, generateFileName,deleteFromS3 } = require('../utils/s3Utils');

const createBlog = async (req, res) => {
  try {
    const { buffer, originalname, mimetype } = req.file;
    // console.log(req.file);

    const resizedImageBuffer = await resizeImage(buffer);
    const fileName = generateFileName(originalname);

    await uploadToS3(resizedImageBuffer, fileName, mimetype);

    const savedBlog = await BlogModel.create({ ...req.body, image: fileName });

    res.status(201).json(savedBlog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const updateBlog = async (req, res) => {
    try {

        // Get the existing blog entry by ID
        const existingBlog = await BlogModel.findById(req.params.id);
        let updateBlog = {...req.body}
      if(req.file){
        const { buffer, originalname, mimetype } = req.file;
  
      const resizedImageBuffer = await resizeImage(buffer);
      const fileName = generateFileName(originalname);
  
      // Upload the resized image to S3
      await uploadToS3(resizedImageBuffer, fileName, mimetype);
  
  
      // If the existing blog has an image, delete it from S3
      if (existingBlog.image) {
        await deleteFromS3(existingBlog.image);
      }
      await uploadToS3(resizedImageBuffer, fileName, mimetype);
      updateBlog.image = fileName;
      }
  
      // Update the blog entry in the database with the new image information
        const updatedBlog = await BlogModel.findByIdAndUpdate(
        req.params.id,
        { ...updateBlog },
        { new: true } // Return the updated document
      );
  
      res.status(200).json(updatedBlog);
    } catch (error) {
      console.error('Error updating blog:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


  const getOneBlog = async (req, res) => {
    try {
      const blogId = req.params.id;
  
      // Find the blog entry by ID
      const blog = await BlogModel.findById(blogId);
  
      // Check if the blog entry exists
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }
      
      blog.coverUrl = await getSignedUrlFromS3(blog.image);
      
  
      res.status(200).json(blog);
    } catch (error) {
      console.error('Error getting blog:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  

  const getAllBlogs = async (req, res) => {
    try {
      const { page, limit, search } = req.query;
      let query = {};
      let result;
      let totalBlogsCount;
      let endIndex;

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
  
        totalBlogsCount = await BlogModel.countDocuments(query);
        if (endIndex < totalBlogsCount) {
          result = {
            nextPage: pageNumber + 1,
            data: await BlogModel.find(query).limit(pageSize).skip(startIndex),
          };
        } else {
          result = {
            data: await BlogModel.find(query).limit(pageSize).skip(startIndex),
          };
        }
      } else {
        result = {
          data: await BlogModel.find(query),
        };
      }
    
    if (result.data.length > 0) {
      for (const blog of result.data) {
        if (Array.isArray(blog.image)) {
          blog.imageUrl = await Promise.all(blog.image.map(async (image) => {
            return await getSignedUrlFromS3(image);
          }));
        } else if (blog.image) {
          blog.coverUrl = await getSignedUrlFromS3(blog.image);
        }
      }
    }

    res.status(200).json({result, currentPage : parseInt(page), hasLastPage : endIndex < totalBlogsCount, hasPreviousPage : parseInt(page) > 1, nextPage : parseInt(page) + 1, previousPage : parseInt(page) - 1, lastPage : Math.ceil(totalBlogsCount / parseInt(limit)), totalBlogsCount});
  } catch (error) {
      console.error('Error getting all blogs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };



  const deleteBlog = async (req, res) => {
    try {
      const id = req.params.id;
  
      // Find the blog entry by ID
      const blog = await BlogModel.findById(id);
  
      // Check if the blog entry exists
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }
  
      // If the blog has an image, delete it from S3
      if (blog.image) {
        await deleteFromS3(blog.image);
      }
  
      // Delete the blog entry from the database
      await BlogModel.findByIdAndDelete(id);
  
      res.status(204).send(); // 204 No Content: Successful deletion
    } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

module.exports = { createBlog, updateBlog, getOneBlog, getAllBlogs, deleteBlog };