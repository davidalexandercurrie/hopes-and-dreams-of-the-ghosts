const socket = io.connect();

const startGame = () => {
  socket.emit('startGame', true);
};
