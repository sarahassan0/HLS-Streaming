const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

// ----------------------Video Streaming Using HTTP Range Header ---------

app.get("/videoRange", (req, res) => {
  const videoPath = "./hls/test.mp4";
  const videoSize = fs.statSync(videoPath).size;
  const range = req.headers.range;

  if (range) {
    let [start, end] = range.replace(/bytes=/, "").split("-");
    start = parseInt(start, 10);
    end = end ? parseInt(end, 10) : videoSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": videoSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});
app.listen(4000, () => {
  console.log(`HLS server is running on http://localhost:${4000}`);
});
