const express = require('express');
const youtubedl = require('youtube-dl-exec');
const app = express();
const port = 3000;


app.get("/download/:id", (req, res) => {
    const videoId = req.params.id;
    const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
    youtubedl(ytUrl, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: ["referer:youtube.com", "user-agent:googlebot"]
    }).then((output) => {
        
        // Log the entire output for debugging
        // console.log("Download information: ", output);

        // Find the format with format_id '18'
        const format18 = output.formats.find(format => format.format_id === '18');

        if (format18) {
            res.json(format18);
        } else {
            res.status(404).send('Format 18 not available for this video');
        }
    }).catch((err) => {
        console.error("Error downloading video: ", err);
        res.status(500).send('Failed to download video');
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
