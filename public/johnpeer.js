// client-side js, loaded by index.html
// run by the browser each time the page is loaded
console.log('loaded johnpeer.js')
let Peer = window.Peer;


let videoEl = document.querySelector('.remote-video');



let renderVideo = (stream) => {
  videoEl.srcObject = stream;
};


let peer = new Peer('john',{
  host: '/',
  path: '/peerjs/myapp',
  
});
peer.on('open', (id) => {
 
  console.log(id)

  const data = { john: id };


  
  
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
peer.on('call', (call) => {
  navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then((stream) => {
      call.answer(stream); // Answer the call with an A/V stream.
      // call.on('stream', renderVideo);
    })
    .catch((err) => {
      console.error('Failed to get local stream', err);
    });
});

