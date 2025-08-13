let ioInstance;

export const initRealtime = (io) => {
  ioInstance = io;
  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
  });
};

export const emitScheduleUpdate = (post) => {
  if (ioInstance) {
    ioInstance.emit("schedule:update", post);
  }
};
