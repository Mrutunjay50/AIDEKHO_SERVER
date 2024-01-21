const router = require("express").Router();
const toolController = require("../controllers/tools");
const crudController = require("../controllers/crudTools");
const {isAdmin} = require('../middleware/is_auth');
const { body } = require('express-validator');

const { imageMulter } = require('../multer/multerImg'); 
// const { fileMulter } = require('../multer/multerFile');

// router.post('/csv',fileMulter, crudController.uploadcsv);
router.get('/api/export-csv/:toolType', crudController.downloadCsv);
router.post('/api/addaitools/aiTool', isAdmin, imageMulter, crudController.addAiTools);
router.post('/api/addaitools/gptTool', isAdmin, imageMulter, crudController.addGPTTools);
router.post('/api/addaitools/pluginTool', isAdmin, imageMulter, crudController.addPluginTools);
router.post('/api/updateMetadata',isAdmin, toolController.updateMetadata);


router.put('/api/aitools', isAdmin, imageMulter, crudController.editAiTools);
router.put('/api/updateCategory', isAdmin,  toolController.updateCategories);
router.put('/api/updateSponsorStatus', isAdmin,  toolController.updateSponsorStatus);
router.put('/api/addTag', isAdmin,  crudController.addTopTag);
router.put('/api/featured', isAdmin,  crudController.addFeatureTag);

router.put('/api/setsubscribers', [
    body('email').isEmail().withMessage('Invalid email format'),
  ], toolController.setSubscribers);


router.get('/api/getMetadata', toolController.getMetadata);
router.get('/api/aitools', toolController.getAiTools);
router.get('/api/gpttools', toolController.getGptTools);
router.get('/api/plugins', toolController.getPlugins);
router.get('/api/toppicks', toolController.topPicks);
router.get('/api/featuredPicks', toolController.featuredPicks);
router.get('/api/categories', toolController.getAllCategories);
router.get('/api/oneaitools', toolController.getOneAiTools);


router.delete('/api/aitools', isAdmin,  crudController.deleteAiTools);


module.exports = router;