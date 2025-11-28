/**
 * WebRTC Signaling Server for Watch Parties
 * Handles:
 * - Peer connection management
 * - ICE candidate exchange
 * - SDP offer/answer exchange
 * - Room management
 */

class WebRTCSignalingServer {
  constructor(socketIO) {
    this.io = socketIO;
    this.rooms = new Map();
    this.peers = new Map();
    this.setupSignalingEvents();
  }

  /**
   * Setup all WebRTC signaling event handlers
   */
  setupSignalingEvents() {
    this.io.on('connection', (socket) => {
      // Only set up WebRTC events if socket is authenticated
      if (!socket.userId) {
        return;
      }

      // Store peer connection info
      this.peers.set(socket.id, {
        userId: socket.userId,
        roomId: null,
        connections: [],
      });

      // Room management events
      this.setupRoomEvents(socket);

      // SDP exchange events
      this.setupSDPEvents(socket);

      // ICE candidate exchange events
      this.setupICEEvents(socket);

      // Cleanup on disconnect
      socket.on('disconnect', () => {
        this.handlePeerDisconnect(socket);
      });
    });
  }

  /**
   * Room Management Events
   */
  setupRoomEvents(socket) {
    /**
     * Create or join a WebRTC room
     * Typically used for watch parties
     */
    socket.on('webrtc-join-room', (data) => {
      const { roomId } = data;

      // Get or create room
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, {
          id: roomId,
          peers: new Map(),
          createdAt: new Date(),
        });
      }

      const room = this.rooms.get(roomId);

      // Get existing peer IDs in the room
      const existingPeerIds = Array.from(room.peers.keys());

      // Add new peer to room
      room.peers.set(socket.id, {
        socketId: socket.id,
        userId: socket.userId,
        joinedAt: new Date(),
      });

      // Update peer info
      const peerInfo = this.peers.get(socket.id);
      peerInfo.roomId = roomId;

      // Send existing peers to the new peer
      socket.emit('webrtc-peers-in-room', {
        roomId,
        peers: existingPeerIds,
      });

      // Notify existing peers about the new peer
      existingPeerIds.forEach((peerId) => {
        const peerSocket = this.io.sockets.sockets.get(peerId);
        if (peerSocket) {
          peerSocket.emit('webrtc-new-peer', {
            peerId: socket.id,
            userId: socket.userId,
          });
        }
      });

      console.log(`Peer ${socket.userId} joined WebRTC room ${roomId}`);
      console.log(`Room ${roomId} now has ${room.peers.size} peers`);
    });

    /**
     * Leave WebRTC room
     */
    socket.on('webrtc-leave-room', (data) => {
      const { roomId } = data;
      this.handlePeerLeaveRoom(socket, roomId);
    });

    /**
     * Get peers in room
     */
    socket.on('webrtc-get-peers', (data) => {
      const { roomId } = data;

      const room = this.rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const peerIds = Array.from(room.peers.keys()).filter(
        (id) => id !== socket.id
      );

      socket.emit('webrtc-peers-list', {
        roomId,
        peers: peerIds,
      });
    });
  }

  /**
   * SDP Offer/Answer Exchange Events
   */
  setupSDPEvents(socket) {
    /**
     * Handle SDP offer
     * Sent from initiating peer to target peer
     */
    socket.on('webrtc-offer', (data) => {
      const { to, offer, from, roomId } = data;

      const targetSocket = this.io.sockets.sockets.get(to);
      if (!targetSocket) {
        socket.emit('error', { message: 'Peer not found' });
        return;
      }

      targetSocket.emit('webrtc-offer', {
        from,
        offer,
        roomId,
      });

      console.log(
        `SDP Offer sent from ${socket.userId} to peer ${to} in room ${roomId}`
      );
    });

    /**
     * Handle SDP answer
     * Sent from receiving peer back to initiating peer
     */
    socket.on('webrtc-answer', (data) => {
      const { to, answer, from, roomId } = data;

      const targetSocket = this.io.sockets.sockets.get(to);
      if (!targetSocket) {
        socket.emit('error', { message: 'Peer not found' });
        return;
      }

      targetSocket.emit('webrtc-answer', {
        from,
        answer,
        roomId,
      });

      console.log(
        `SDP Answer sent from ${socket.userId} to peer ${to} in room ${roomId}`
      );
    });

    /**
     * Notify peer about connection established
     */
    socket.on('webrtc-peer-connected', (data) => {
      const { to, from, roomId } = data;

      const targetSocket = this.io.sockets.sockets.get(to);
      if (!targetSocket) {
        return;
      }

      targetSocket.emit('webrtc-peer-connected', {
        from,
        roomId,
      });

      console.log(`Connection established between ${from} and ${to}`);
    });
  }

  /**
   * ICE Candidate Exchange Events
   */
  setupICEEvents(socket) {
    /**
     * Handle ICE candidate
     * Exchange ICE candidates for NAT traversal
     */
    socket.on('webrtc-ice-candidate', (data) => {
      const { to, candidate, from, roomId } = data;

      const targetSocket = this.io.sockets.sockets.get(to);
      if (!targetSocket) {
        return;
      }

      targetSocket.emit('webrtc-ice-candidate', {
        from,
        candidate,
        roomId,
      });
    });

    /**
     * Handle ICE connection state change
     */
    socket.on('webrtc-ice-connection-state', (data) => {
      const { to, state, from } = data;

      const targetSocket = this.io.sockets.sockets.get(to);
      if (!targetSocket) {
        return;
      }

      targetSocket.emit('webrtc-ice-connection-state', {
        from,
        state,
      });

      if (state === 'failed') {
        console.warn(
          `ICE connection failed between ${from} and ${to}. Retrying...`
        );
      }
    });

    /**
     * Handle peer restart ICE
     */
    socket.on('webrtc-restart-ice', (data) => {
      const { to, from, roomId } = data;

      const targetSocket = this.io.sockets.sockets.get(to);
      if (!targetSocket) {
        return;
      }

      targetSocket.emit('webrtc-restart-ice', {
        from,
        roomId,
      });

      console.log(`ICE restart requested by ${from} to ${to}`);
    });
  }

  /**
   * Handle peer leaving a room
   */
  handlePeerLeaveRoom(socket, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    room.peers.delete(socket.id);

    // Notify remaining peers
    const remainingPeerIds = Array.from(room.peers.keys());
    remainingPeerIds.forEach((peerId) => {
      const peerSocket = this.io.sockets.sockets.get(peerId);
      if (peerSocket) {
        peerSocket.emit('webrtc-peer-disconnected', {
          peerId: socket.id,
          userId: socket.userId,
        });
      }
    });

    // Clean up room if empty
    if (room.peers.size === 0) {
      this.rooms.delete(roomId);
      console.log(`WebRTC room ${roomId} deleted (no peers)`);
    }

    // Update peer info
    const peerInfo = this.peers.get(socket.id);
    if (peerInfo) {
      peerInfo.roomId = null;
    }

    console.log(`Peer ${socket.userId} left WebRTC room ${roomId}`);
  }

  /**
   * Handle peer disconnect
   */
  handlePeerDisconnect(socket) {
    const peerInfo = this.peers.get(socket.id);
    if (!peerInfo || !peerInfo.roomId) {
      this.peers.delete(socket.id);
      return;
    }

    this.handlePeerLeaveRoom(socket, peerInfo.roomId);
    this.peers.delete(socket.id);
  }

  /**
   * Get room info
   */
  getRoomInfo(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    return {
      id: roomId,
      peerCount: room.peers.size,
      peers: Array.from(room.peers.values()),
      createdAt: room.createdAt,
    };
  }

  /**
   * Get all active rooms
   */
  getAllRooms() {
    const rooms = [];
    for (const [roomId, room] of this.rooms) {
      rooms.push({
        id: roomId,
        peerCount: room.peers.size,
        createdAt: room.createdAt,
      });
    }
    return rooms;
  }

  /**
   * Get peer info
   */
  getPeerInfo(socketId) {
    return this.peers.get(socketId) || null;
  }

  /**
   * Clean up disconnected peers (periodic maintenance)
   */
  cleanupDisconnectedPeers() {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [roomId, room] of this.rooms) {
      const peersToRemove = [];

      for (const [peerId, peer] of room.peers) {
        const socket = this.io.sockets.sockets.get(peerId);
        if (!socket || !socket.connected) {
          peersToRemove.push(peerId);
        }
      }

      peersToRemove.forEach((peerId) => {
        room.peers.delete(peerId);
        console.log(`Cleaned up disconnected peer ${peerId} from room ${roomId}`);
      });

      // Delete room if empty
      if (room.peers.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }
}

export default WebRTCSignalingServer;
