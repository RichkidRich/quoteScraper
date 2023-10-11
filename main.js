const puppeteer = require('puppeteer');
const URL_TO_SCRAPE = "https://www.animecharactersdatabase.com/quotesbycharacter.php?x=20&cid=1019";
const PAGE_COUNT = 66;

const buildURL = (currentPage) => {
  const URL_TO_SCRAPE = `https://www.animecharactersdatabase.com/quotesbycharacter.php?x=${currentPage*10}&cid=1019`;
  return URL_TO_SCRAPE;
}

(async () => {
  // Launch a headless browser
  const browser = await puppeteer.launch();

  // Open a new page
  const page = await browser.newPage();

  let tableData = [];

  for (let i = 0; i <= PAGE_COUNT ; i++) {
    // Navigate to the website you want to scrape
    await page.goto(buildURL(i));

    // Wait for the table with id "besttable" to appear
    await page.waitForSelector('#besttable');

    // Extract the data from the table
    const newTableData = await page.$$eval('#besttable tbody tr', (rows) => {
      return rows.map((row, index) => {
        const columns = Array.from(row.querySelectorAll('td'));
        if (index % 2 === 1) {
          // This is an odd-indexed row (every other row)
          const audioTag = row.querySelector('source');
          if (audioTag) {
            // Get the source link from the audio tag
            const sourceLink = audioTag.getAttribute('src');
            return sourceLink;
          }
        } else {
          // This is an even-indexed row (non-audio row)
          const qTag = row.querySelector('q');
          if (qTag) {
            // Get the content within the <q> tag
            return qTag.textContent;
          }
        }
      });
    });

    tableData.push(...newTableData);
    console.log(`FINISHED SCRAPING PAGE ${i}`)
  }

  // Now sort the table data into {text: "text", audioLink: "www.link.com"}
  let isText = true;
  const sortedTableData = [];

  tableData.forEach(data => {
    if (isText) {
      sortedTableData.push({
        text: data,
        audioLink: ""
      });
      isText = false;
    } else {
      sortedTableData[sortedTableData.length - 1].audioLink = data;
      isText = true;
    }
  });

  // Output the scraped data
  console.log('Scraped Article Titles:');
  console.log(sortedTableData);

  // Close the browser
  await browser.close();
})();
