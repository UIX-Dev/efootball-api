const express = require("express");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/api/get-rendered-content", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "Missing URL in request body" });
    }

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle0" });

        const content = await page.$eval("body", (el) => el.innerHTML);
        const $ = cheerio.load(content);
        const firstImageSrc = $(".swiper-wrapper img").first().attr("src");

        await browser.close();

        res.status(200).json({ src: firstImageSrc || null });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: JSON.stringify(error) });
    }
});

// Chạy server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
