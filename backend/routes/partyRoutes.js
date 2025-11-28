import express from 'express';
import {
  createWatchParty,
  getWatchParty,
  updateWatchParty,
  deleteWatchParty,
  getMyWatchParties,
  joinWatchParty,
  leaveWatchParty,
  inviteToWatchParty,
  getWatchPartyInvitations,
  acceptInvitation,
  declineInvitation,
  startWatchParty,
  pauseWatchParty,
  resumeWatchParty,
  endWatchParty,
  sync,
  sendChatMessage,
  getChatMessages,
  deleteChatMessage,
  getPartyMembers,
  removePartyMember,
  makePartyMemberModerator,
  setPartyPrivacy,
  generatePartyCode,
  joinWithPartyCode,
  getPartyStats,
  recordPartyEvent
} from '../controllers/partyController.js';
import { verifyToken } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();
const partyLimiter = rateLimiter({ windowMs: 60000, maxRequests: 200 });

/**
 * @route POST /api/party
 * @desc Create a new watch party
 * @access Private
 */
router.post('/', verifyToken, partyLimiter, createWatchParty);

/**
 * @route GET /api/party/:partyId
 * @desc Get watch party details
 * @access Private
 */
router.get('/:partyId', verifyToken, partyLimiter, getWatchParty);

/**
 * @route GET /api/party
 * @desc Get user's watch parties
 * @access Private
 */
router.get('/', verifyToken, partyLimiter, getMyWatchParties);

/**
 * @route PUT /api/party/:partyId
 * @desc Update watch party settings
 * @access Private
 */
router.put('/:partyId', verifyToken, partyLimiter, updateWatchParty);

/**
 * @route DELETE /api/party/:partyId
 * @desc Delete watch party
 * @access Private
 */
router.delete('/:partyId', verifyToken, partyLimiter, deleteWatchParty);

/**
 * @route POST /api/party/:partyId/join
 * @desc Join an existing watch party
 * @access Private
 */
router.post('/:partyId/join', verifyToken, partyLimiter, joinWatchParty);

/**
 * @route POST /api/party/:partyId/join-code
 * @desc Join watch party with party code
 * @access Private
 */
router.post('/:partyId/join-code', verifyToken, partyLimiter, joinWithPartyCode);

/**
 * @route POST /api/party/:partyId/leave
 * @desc Leave a watch party
 * @access Private
 */
router.post('/:partyId/leave', verifyToken, partyLimiter, leaveWatchParty);

/**
 * @route POST /api/party/:partyId/invite
 * @desc Invite user to watch party
 * @access Private
 */
router.post('/:partyId/invite', verifyToken, partyLimiter, inviteToWatchParty);

/**
 * @route GET /api/party/invitations
 * @desc Get watch party invitations
 * @access Private
 */
router.get('/invitations', verifyToken, partyLimiter, getWatchPartyInvitations);

/**
 * @route POST /api/party/invitations/:invitationId/accept
 * @desc Accept watch party invitation
 * @access Private
 */
router.post('/invitations/:invitationId/accept', verifyToken, partyLimiter, acceptInvitation);

/**
 * @route POST /api/party/invitations/:invitationId/decline
 * @desc Decline watch party invitation
 * @access Private
 */
router.post('/invitations/:invitationId/decline', verifyToken, partyLimiter, declineInvitation);

/**
 * @route POST /api/party/:partyId/start
 * @desc Start watch party playback
 * @access Private
 */
router.post('/:partyId/start', verifyToken, partyLimiter, startWatchParty);

/**
 * @route POST /api/party/:partyId/pause
 * @desc Pause watch party playback
 * @access Private
 */
router.post('/:partyId/pause', verifyToken, partyLimiter, pauseWatchParty);

/**
 * @route POST /api/party/:partyId/resume
 * @desc Resume watch party playback
 * @access Private
 */
router.post('/:partyId/resume', verifyToken, partyLimiter, resumeWatchParty);

/**
 * @route POST /api/party/:partyId/end
 * @desc End watch party
 * @access Private
 */
router.post('/:partyId/end', verifyToken, partyLimiter, endWatchParty);

/**
 * @route POST /api/party/:partyId/sync
 * @desc Sync playback with party members
 * @access Private
 */
router.post('/:partyId/sync', verifyToken, partyLimiter, sync);

/**
 * @route GET /api/party/:partyId/members
 * @desc Get watch party members
 * @access Private
 */
router.get('/:partyId/members', verifyToken, partyLimiter, getPartyMembers);

/**
 * @route DELETE /api/party/:partyId/members/:memberId
 * @desc Remove member from party
 * @access Private
 */
router.delete('/:partyId/members/:memberId', verifyToken, partyLimiter, removePartyMember);

/**
 * @route POST /api/party/:partyId/members/:memberId/moderator
 * @desc Make party member a moderator
 * @access Private
 */
router.post('/:partyId/members/:memberId/moderator', verifyToken, partyLimiter, makePartyMemberModerator);

/**
 * @route POST /api/party/:partyId/privacy
 * @desc Set party privacy settings
 * @access Private
 */
router.post('/:partyId/privacy', verifyToken, partyLimiter, setPartyPrivacy);

/**
 * @route POST /api/party/:partyId/code
 * @desc Generate party code for sharing
 * @access Private
 */
router.post('/:partyId/code', verifyToken, partyLimiter, generatePartyCode);

/**
 * @route GET /api/party/:partyId/chat
 * @desc Get party chat messages
 * @access Private
 */
router.get('/:partyId/chat', verifyToken, partyLimiter, getChatMessages);

/**
 * @route POST /api/party/:partyId/chat
 * @desc Send chat message in party
 * @access Private
 */
router.post('/:partyId/chat', verifyToken, partyLimiter, sendChatMessage);

/**
 * @route DELETE /api/party/:partyId/chat/:messageId
 * @desc Delete chat message
 * @access Private
 */
router.delete('/:partyId/chat/:messageId', verifyToken, partyLimiter, deleteChatMessage);

/**
 * @route GET /api/party/:partyId/stats
 * @desc Get watch party statistics
 * @access Private
 */
router.get('/:partyId/stats', verifyToken, partyLimiter, getPartyStats);

/**
 * @route POST /api/party/:partyId/event
 * @desc Record party event (for analytics)
 * @access Private
 */
router.post('/:partyId/event', verifyToken, partyLimiter, recordPartyEvent);

export default router;
