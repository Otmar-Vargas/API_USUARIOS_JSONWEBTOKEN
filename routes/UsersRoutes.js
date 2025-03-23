const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware').authenticateToken;
const { 
  createUser, 
  getAllUsers, 
  getUser, 
  updateUser, 
  deleteUser, 
  getUserRecommendations, 
  getUserReputation,
  addUserActivity,
  patchUser
} = require('../controllers/UsersController');

router.post('/', auth, createUser);
router.get('/', auth,  getAllUsers);
router.get('/:id', auth,  getUser);
router.put('/:id', auth,  updateUser);
router.patch('/:id', auth,  patchUser);
router.delete('/:id', auth,  deleteUser);
router.get('/recommend/:id', auth,  getUserRecommendations);
router.get('/reputation/:id', auth,  getUserReputation);
router.post('/:id/activity', auth,  addUserActivity); 

module.exports = router;