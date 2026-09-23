const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/', userController.createUser);
router.get('/profile', userController.getLoggedInUser);
router.get('/all', userController.getAllUsers);
router.get('/by-role/:role', userController.getAllRoleWise);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
