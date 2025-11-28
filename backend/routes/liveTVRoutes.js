import express from 'express';
import LiveChannel from '../models/LiveChannel.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all live channels
router.get('/', optionalAuth, async (req, res) => {
  try {
    const channels = await LiveChannel.find({ status: 'active' })
      .sort({ category: 1, name: 1 })
      .select('-__v');

    res.json({
      success: true,
      data: channels,
      count: channels.length
    });
  } catch (error) {
    console.error('Error fetching live channels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live channels',
      error: error.message
    });
  }
});

// Get single live channel by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const channel = await LiveChannel.findById(req.params.id).select('-__v');

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    res.json({
      success: true,
      data: channel
    });
  } catch (error) {
    console.error('Error fetching channel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch channel',
      error: error.message
    });
  }
});

// Get channels by category
router.get('/category/:category', optionalAuth, async (req, res) => {
  try {
    const channels = await LiveChannel.find({
      category: req.params.category,
      status: 'active'
    })
      .sort({ name: 1 })
      .select('-__v');

    res.json({
      success: true,
      data: channels,
      count: channels.length
    });
  } catch (error) {
    console.error('Error fetching channels by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch channels',
      error: error.message
    });
  }
});

// Update viewer count
router.post('/:id/view', optionalAuth, async (req, res) => {
  try {
    const channel = await LiveChannel.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewerCount: 1, totalViews: 1 } },
      { new: true }
    );

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    res.json({
      success: true,
      data: channel
    });
  } catch (error) {
    console.error('Error updating view count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update view count',
      error: error.message
    });
  }
});

export default router;
