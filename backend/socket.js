import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getRedisClient } from './config/redis.js';

/**
 * Socket.IO Server Configuration
 * Handles:
 * - Live chat for Live TV
 * - Watch party synchronization
 * - Real-time notifications
 * - Viewer count updates
 */

class SocketManager {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingInterval: 25000,
      pingTimeout: 5000,
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup Socket.IO middleware for authentication
   */
  setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.email = decoded.email;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  /**
   * Setup all event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId} - Socket: ${socket.id}`);

      // Live Chat Events
      this.setupLiveChatEvents(socket);

      // Watch Party Events
      this.setupWatchPartyEvents(socket);

      // Notification Events
      this.setupNotificationEvents(socket);

      // Viewer Count Events
      this.setupViewerCountEvents(socket);

      // Connection cleanup
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.userId}:`, error);
      });
    });
  }

  /**
   * Live Chat for Live TV
   */
  setupLiveChatEvents(socket) {
    // Join a live TV channel chat
    socket.on('join-live-chat', async (data) => {
      const { liveChannelId } = data;
      const chatRoom = `live-chat:${liveChannelId}`;

      socket.join(chatRoom);

      try {
        const redis = getRedisClient();
        if (!redis) {
          socket.emit('error', { message: 'Redis connection unavailable' });
          return;
        }

        // Store user in Redis for active users
        await redis.hSet(
          `active-viewers:${liveChannelId}`,
          socket.userId,
          JSON.stringify({
            userId: socket.userId,
            socketId: socket.id,
            joinedAt: new Date(),
          })
        );

        // Set expiration for 24 hours
        await redis.expire(`active-viewers:${liveChannelId}`, 86400);

        // Notify others that user joined
        socket.to(chatRoom).emit('user-joined-chat', {
          userId: socket.userId,
          timestamp: new Date(),
        });

        // Get recent chat messages from Redis
        const recentMessages = await redis.lRange(
          `chat-messages:${liveChannelId}`,
          -50,
          -1
        );
        const messages = recentMessages.map((msg) => JSON.parse(msg));
        socket.emit('chat-history', messages);
      } catch (error) {
        console.error('Error joining live chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Send chat message
    socket.on('send-chat-message', async (data) => {
      const { liveChannelId, message } = data;
      const chatRoom = `live-chat:${liveChannelId}`;

      const messageData = {
        userId: socket.userId,
        message,
        timestamp: new Date(),
        socketId: socket.id,
      };

      try {
        const redis = getRedisClient();
        if (!redis) {
          socket.emit('error', { message: 'Redis connection unavailable' });
          return;
        }

        // Store message in Redis
        await redis.rPush(
          `chat-messages:${liveChannelId}`,
          JSON.stringify(messageData)
        );
        // Keep only last 500 messages
        await redis.lTrim(`chat-messages:${liveChannelId}`, -500, -1);
        // Set expiration for 24 hours
        await redis.expire(`chat-messages:${liveChannelId}`, 86400);

        // Broadcast to all users in the chat room
        this.io.to(chatRoom).emit('new-chat-message', messageData);
      } catch (error) {
        console.error('Error sending chat message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Leave live chat
    socket.on('leave-live-chat', async (data) => {
      const { liveChannelId } = data;
      const chatRoom = `live-chat:${liveChannelId}`;

      try {
        const redis = getRedisClient();
        if (!redis) {
          return;
        }

        // Remove user from active viewers
        await redis.hDel(`active-viewers:${liveChannelId}`, socket.userId);

        socket.leave(chatRoom);

        // Notify others that user left
        socket.to(chatRoom).emit('user-left-chat', {
          userId: socket.userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error leaving live chat:', error);
      }
    });
  }

  /**
   * Watch Party Synchronization
   */
  setupWatchPartyEvents(socket) {
    // Join a watch party
    socket.on('join-watch-party', async (data) => {
      const { partyId } = data;
      const partyRoom = `watch-party:${partyId}`;

      socket.join(partyRoom);

      try {
        const redis = getRedisClient();
        if (!redis) {
          socket.emit('error', { message: 'Redis connection unavailable' });
          return;
        }

        // Add user to watch party
        await redis.hSet(
          `party-users:${partyId}`,
          socket.userId,
          JSON.stringify({
            userId: socket.userId,
            socketId: socket.id,
            joinedAt: new Date(),
          })
        );

        // Get party state from Redis
        const partyState = await redis.get(`party-state:${partyId}`);
        if (partyState) {
          socket.emit('sync-party-state', JSON.parse(partyState));
        }

        // Notify others that user joined
        socket.to(partyRoom).emit('party-member-joined', {
          userId: socket.userId,
          totalMembers: await redis.hLen(`party-users:${partyId}`),
        });
      } catch (error) {
        console.error('Error joining watch party:', error);
        socket.emit('error', { message: 'Failed to join watch party' });
      }
    });

    // Sync playback state
    socket.on('sync-playback', async (data) => {
      const { partyId, currentTime, isPlaying, videoDuration } = data;
      const partyRoom = `watch-party:${partyId}`;

      const syncData = {
        currentTime,
        isPlaying,
        videoDuration,
        syncedBy: socket.userId,
        timestamp: new Date(),
      };

      try {
        const redis = getRedisClient();
        if (!redis) {
          return;
        }

        // Store in Redis for new members
        await redis.setEx(`party-state:${partyId}`, 3600, JSON.stringify(syncData));

        // Broadcast to all other users in the party
        socket.to(partyRoom).emit('playback-sync', syncData);
      } catch (error) {
        console.error('Error syncing playback:', error);
      }
    });

    // Send party chat message
    socket.on('send-party-message', async (data) => {
      const { partyId, message } = data;
      const partyRoom = `watch-party:${partyId}`;

      const messageData = {
        userId: socket.userId,
        message,
        timestamp: new Date(),
      };

      try {
        const redis = getRedisClient();
        if (!redis) {
          return;
        }

        // Store in Redis
        await redis.rPush(
          `party-chat:${partyId}`,
          JSON.stringify(messageData)
        );
        // Keep only last 100 messages
        await redis.lTrim(`party-chat:${partyId}`, -100, -1);
        // Set expiration for 24 hours
        await redis.expire(`party-chat:${partyId}`, 86400);

        // Broadcast to all users in the party
        this.io.to(partyRoom).emit('party-message', messageData);
      } catch (error) {
        console.error('Error sending party message:', error);
      }
    });

    // Leave watch party
    socket.on('leave-watch-party', async (data) => {
      const { partyId } = data;
      const partyRoom = `watch-party:${partyId}`;

      try {
        const redis = getRedisClient();
        if (!redis) {
          return;
        }

        // Remove user from party
        await redis.hDel(`party-users:${partyId}`, socket.userId);

        socket.leave(partyRoom);

        const remainingMembers = await redis.hLen(`party-users:${partyId}`);

        // Notify others
        socket.to(partyRoom).emit('party-member-left', {
          userId: socket.userId,
          totalMembers: remainingMembers,
        });

        // Clean up if no more members
        if (remainingMembers === 0) {
          await redis.del(`party-state:${partyId}`);
          await redis.del(`party-chat:${partyId}`);
          await redis.del(`party-users:${partyId}`);
        }
      } catch (error) {
        console.error('Error leaving watch party:', error);
      }
    });
  }

  /**
   * Real-time Notifications
   */
  setupNotificationEvents(socket) {
    // Subscribe to notifications for user
    socket.on('subscribe-notifications', () => {
      const notificationRoom = `notifications:${socket.userId}`;
      socket.join(notificationRoom);
      console.log(`User ${socket.userId} subscribed to notifications`);
    });

    // Unsubscribe from notifications
    socket.on('unsubscribe-notifications', () => {
      const notificationRoom = `notifications:${socket.userId}`;
      socket.leave(notificationRoom);
      console.log(`User ${socket.userId} unsubscribed from notifications`);
    });
  }

  /**
   * Viewer Count Updates
   */
  setupViewerCountEvents(socket) {
    // Join viewer tracking for a content
    socket.on('track-view', async (data) => {
      const { contentId, contentType } = data;
      const viewerRoom = `viewers:${contentType}:${contentId}`;

      socket.join(viewerRoom);

      try {
        const redis = getRedisClient();
        if (!redis) {
          return;
        }

        // Increment viewer count
        const count = await redis.incr(`viewer-count:${contentType}:${contentId}`);

        // Broadcast updated count
        this.io.to(viewerRoom).emit('viewer-count-update', {
          contentId,
          contentType,
          count,
        });

        // Set expiration to 1 hour (viewer is considered active)
        await redis.expire(`viewer-count:${contentType}:${contentId}`, 3600);
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    });

    // Stop tracking view
    socket.on('stop-tracking-view', async (data) => {
      const { contentId, contentType } = data;
      const viewerRoom = `viewers:${contentType}:${contentId}`;

      try {
        const redis = getRedisClient();
        if (!redis) {
          return;
        }

        // Decrement viewer count
        const count = await redis.decr(`viewer-count:${contentType}:${contentId}`);

        // Ensure count doesn't go below 0
        if (count < 0) {
          await redis.set(`viewer-count:${contentType}:${contentId}`, 0);
        }

        // Broadcast updated count
        this.io.to(viewerRoom).emit('viewer-count-update', {
          contentId,
          contentType,
          count: Math.max(0, count),
        });

        socket.leave(viewerRoom);
      } catch (error) {
        console.error('Error stopping view tracking:', error);
      }
    });
  }

  /**
   * Handle socket disconnect
   */
  async handleDisconnect(socket) {
    console.log(`User disconnected: ${socket.userId} - Socket: ${socket.id}`);

    try {
      const redis = getRedisClient();
      if (!redis) {
        return;
      }

      // Get all watch parties the user was in
      const parties = await redis.keys(`party-users:*`);
      for (const partyKey of parties) {
        const partyId = partyKey.replace('party-users:', '');
        const deleted = await redis.hDel(partyKey, socket.userId);

        if (deleted) {
          const remainingMembers = await redis.hLen(partyKey);
          const partyRoom = `watch-party:${partyId}`;

          this.io.to(partyRoom).emit('party-member-left', {
            userId: socket.userId,
            totalMembers: remainingMembers,
          });

          // Clean up if no more members
          if (remainingMembers === 0) {
            await redis.del(`party-state:${partyId}`);
            await redis.del(`party-chat:${partyId}`);
            await redis.del(partyKey);
          }
        }
      }

      // Get all live chats the user was in
      const liveChats = await redis.keys(`active-viewers:*`);
      for (const chatKey of liveChats) {
        const channelId = chatKey.replace('active-viewers:', '');
        const deleted = await redis.hDel(chatKey, socket.userId);

        if (deleted) {
          const chatRoom = `live-chat:${channelId}`;
          this.io.to(chatRoom).emit('user-left-chat', {
            userId: socket.userId,
            timestamp: new Date(),
          });
        }
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  /**
   * Send notification to user
   * Public method to send notifications from other parts of the app
   */
  sendNotification(userId, notification) {
    const notificationRoom = `notifications:${userId}`;
    this.io.to(notificationRoom).emit('notification', {
      ...notification,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast notification to multiple users
   */
  broadcastNotification(userIds, notification) {
    userIds.forEach((userId) => {
      this.sendNotification(userId, notification);
    });
  }

  /**
   * Get viewer count for content
   */
  async getViewerCount(contentId, contentType) {
    try {
      const redis = getRedisClient();
      if (!redis) {
        return 0;
      }

      const count = await redis.get(`viewer-count:${contentType}:${contentId}`);
      return parseInt(count) || 0;
    } catch (error) {
      console.error('Error getting viewer count:', error);
      return 0;
    }
  }

  /**
   * Get active members in watch party
   */
  async getPartyMembers(partyId) {
    try {
      const redis = getRedisClient();
      if (!redis) {
        return [];
      }

      const members = await redis.hGetAll(`party-users:${partyId}`);
      return Object.values(members).map((member) => JSON.parse(member));
    } catch (error) {
      console.error('Error getting party members:', error);
      return [];
    }
  }

  /**
   * Get Socket.IO instance
   */
  getIO() {
    return this.io;
  }
}

export default SocketManager;
