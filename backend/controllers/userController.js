const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

const User = require('../models/Users');

// Create User
exports.createUser = async (req, res) => {
  const { name, email, password, username, role, userStatus } = req.body;

  try {
    const newUser = await User.create({ name, email, password, username, role, userStatus });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error });
  }
};

// Get all Users
exports.getAllUsers = async (req, res) => {
  try {
    const {start, length, search, order, draw} = req.query;
    const regex = new RegExp(search?.value, 'i'); // 'i' for case-insensitive
    const searchQuery = search?.value ? {
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { username: { $regex: regex } },
      ]
    } : {};
    const query = {
      $or: [
        { deleted: { $exists: false } },
        { deleted: false }
      ],
    }
    const users = await User.find({...query, ...searchQuery}).select({password:0, token:0})
    .sort({ creationTime: -1 })
    .sort({ name: 1 })
    .skip(start)
    .limit(length);
    if(!users) 
      return res.json({ statusCode:404, statusMessage: 'users_not_found' ,message: 'Users Not Found' });
    const totalUsers = await User.countDocuments(query);
    const filteredUsers = await User.countDocuments({...query, ...searchQuery});
    return res.json({
      draw: draw,
      recordsTotal: totalUsers,
      recordsFiltered: filteredUsers,
      data:users,
      statusCode:200,
      statusMessage: 'users_found',
      message: 'Users Data Found', 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

exports.getAllRoleWise = async (req, res) => {
  console.log(req.body)
  try {
    const role = req.params.role;
    const users = await User.find({role},{email:1,name:1,_id:0});
    if (!users || users.length === 0) {
      return res.json({ statusCode: 404, statusMessage: 'users_not_found', message: 'No users found for the specified role' });
    }
    res.json({ statusCode: 200, statusMessage: 'fetching_'+role+'_data', data: users, message: 'Users found based on role' });
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching user', error });
  }
};

exports.getLoggedInUser = async (req, res) => {
  try {
    if (!req.userId) {
      return res.json({statusCode: 401, statusMessage: 'unauthorized', message: 'User ID not found'});
    }
    const user = await User.findOne({_id: req.userId});
    if (!user) {
      return res.json({statusCode: 404, statusMessage: 'user_not_found', message: 'User not found'});
    }
    return res.json({statusCode: 200, statusMessage: 'user_data_exist', data: user});
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching user', error });
  }
}

exports.updateUser = async (req, res) => {
  const { email, password, name, username, role, userStatus } = req.body;

  try {
    const data = { email, name, username, role, userStatus };
    if(data.email) data.email = data.email.toLowerCase();
    if(password) data.password = password;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...data },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user', error });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};
