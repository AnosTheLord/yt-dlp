const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("yt-dlp API Running 🚀");
});

app.post("/download", (req, res) => {

  const videoUrl = req.body.url;

  if (!videoUrl) {
    return res.status(400).json({
      status: "error",
      error: "No URL provided"
    });
  }

  const ytDlp = spawn("yt-dlp", [
    "-j",
    "--no-playlist",
    videoUrl
  ]);

  let output = "";
  let errorOutput = "";

  ytDlp.stdout.on("data", (data) => {
    output += data.toString();
  });

  ytDlp.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  ytDlp.on("close", (code) => {

    if (code !== 0) {
      return res.status(500).json({
        status: "error",
        error: errorOutput || "yt-dlp failed"
      });
    }

    try {

      const data = JSON.parse(output);

      const media = [];

      // extract formats properly
      if (data.formats && Array.isArray(data.formats)) {

        data.formats.forEach((format) => {

          // skip broken formats
          if (!format.url) return;

          // skip thumbnails/images
          if (format.vcodec === "none" && format.acodec === "none") return;

          media.push({
            type: format.vcodec !== "none" ? "video" : "audio",

            quality:
              format.format_note ||
              (format.height ? `${format.height}p` : "default"),

            ext: format.ext || "mp4",

            filesize: format.filesize || null,

            url: format.url
          });

        });

      }

      res.json({
        status: "success",

        title: data.title || "",

        thumbnail: data.thumbnail || "",

        duration: data.duration || 0,

        uploader: data.uploader || "",

        media
      });

    } catch (err) {

      res.status(500).json({
        status: "error",
        error: "Failed to parse yt-dlp response"
      });

    }

  });

});

app.listen(process.env.PORT || 3000, () => {
  console.log(
    "Server running on port " + (process.env.PORT || 3000)
  );
});
