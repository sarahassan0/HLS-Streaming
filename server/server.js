const express = require("express");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "hls")));


const hlsPath = path.join(__dirname, "hls", "index.m3u8");

fs.access(hlsPath, fs.constants.F_OK, (err) => {
  if (err) {
    console.log("Index file not found. Running ffmpeg...");

    ffmpeg.setFfmpegPath(ffmpegInstaller.path);

    ffmpeg("hls/test.mp4")
      .addOptions([
        "-profile:v baseline",
        "-level 3.0",
        "-start_number 0",
        "-hls_time 10",
        "-hls_list_size 0",
        "-f hls",
      ])
      .output("hls/index.m3u8")
      .on("end", () => {
        console.log("HLS files generated");
      })
      .on("error", (err) => {
        console.error("Error generating HLS files:", err);
      })
      .run();
  } else {
    console.log("HLS files already exist");
  }
});


app.get("/server", (req, res) => {

  let file = req.query.file;
  segment = req.url.split("/").pop();

  file.split(".").pop() === "m3u8"
    ? (file = file)
    : (file = req.url.split("/").pop());
    const ext = file.split(".").pop();
  if (ext === "m3u8" || ext === "ts") {
    const filePath = path.join(__dirname, "hls", file);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send("File not found");
      }

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  } else {
    res.status(400).send("Invalid file type");
  }
});

app.listen(3000, () => {
  console.log(`HLS server is running on http://localhost:${3000}`);
});
