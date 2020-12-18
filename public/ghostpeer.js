// client-side js, loaded by index.html
// run by the browser each time the page is loaded


var canvas = document.querySelector('canvas');
// var video = document.querySelector('video');

// Optional frames per second argument.

// Set the source of the <video> element to be the stream from the <canvas>.
// video.srcObject = stream;

let Peer = window.Peer;


let videoEl = document.querySelector('.remote-video');

let renderVideo = (streamey) => {
  console.log(streamey)
  videoEl.srcObject = streamey;
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
  
  caller()
  //   .catch((err) => {
  //     // logMessage('Failed to get local stream', err);
  //   });;
  // // 

};
let call;
function caller(){
  console.log('calling')
  var streamz = canvas.captureStream(1)
  // navigator.mediaDevices.getUserMedia({video: true, audio: true}).
  then((stream) => {
       call = peer.call('john', streamz);
      call.on('stream', renderVideo);
    })
  
}

window.connectToPeer = connectToPeer;


