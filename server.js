const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("yt-dlp API Running");
});

app.post("/download", (req, res) => {

  const videoUrl = req.body.url;

  if (!videoUrl) {
    return res.status(400).json({
      error: "No URL provided"
    });
  }

  exec(
    `yt-dlp -j "${videoUrl}"`,
    (error, stdout, stderr) => {

      if (error) {
        return res.status(500).json({
          error: stderr
        });
      }

      try {

        const data = JSON.parse(stdout);

        res.json({
          title: data.title,
          thumbnail: data.thumbnail,
          download: data.url
        });

      } catch (err) {

        res.status(500).json({
          error: "Failed to parse yt-dlp response"
        });

      }

    }
  );

});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
