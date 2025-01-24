const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "Missing URL in request body" });
    }

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ],
        });

        const page = await browser.newPage();

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        );

        await page.goto(url, { waitUntil: "networkidle0" });

        const content = await page.$eval("body", (el) => el.innerHTML);
        const $ = cheerio.load(content);
        const firstImageSrc = $(".swiper-wrapper img").first().attr("src");

        await browser.close();

        res.status(200).json({ src: firstImageSrc || null });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to scrape content" });
    }
};
