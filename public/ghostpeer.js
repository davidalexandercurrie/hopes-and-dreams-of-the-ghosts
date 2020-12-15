// client-side js, loaded by index.html
// run by the browser each time the page is loaded

let Peer = window.Peer;


let videoEl = document.querySelector('.remote-video');

let renderVideo = (stream) => {
  videoEl.srcObject = stream;
};

// Register with the peer server
let peer = new Peer({
  host: '/',
  path: '/peerjs/myapp'
});
peer.on('open', (id) => {
  // logMessage('My peer ID is: ' + id);
  connectToPeer();
});
peer.on('error', (error) => {
  console.error(error);
});

// Handle incoming data connection
peer.on('connection', (conn) => {
  // logMessage('incoming peer connection!');
  conn.on('data', (data) => {
    // logMessage(`received: ${data}`);
  });
  conn.on('open', () => {
    conn.send('hello!');
  });
});

// Handle incoming voice/video connection
// peer.on('call', (call) => {
//   navigator.mediaDevices.getUserMedia({video: true, audio: true})
//     .then((stream) => {
//       call.answer(stream); // Answer the call with an A/V stream.
//       call.on('stream', renderVideo);
//     })
//     .catch((err) => {
//       console.error('Failed to get local stream', err);
//     });
// });
console.log('ghostpeer.js loaded.')
// Initiate outgoing connection
let connectToPeer = () => {
  let peerId = 'john';
  // logMessage(`Connecting to ${peerId}...`);
  
  let conn = peer.connect(peerId);
  conn.on('data', (data) => {
    // logMessage(`received: ${data}`);
  });
  conn.on('open', () => {
    conn.send('hi!');
  });
  
  navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then((stream) => {
      let call = peer.call(peerId, stream);
      call.on('stream', renderVideo);
    })
    .catch((err) => {
      // logMessage('Failed to get local stream', err);
    });
};

window.connectToPeer = connectToPeer;