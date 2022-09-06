const app = require("../app");
const supertest = require("supertest");
const fs = require("fs");
const path = require("path");
const showdown = require("showdown");

const converter = new showdown.Converter();

const testContent = `
# This is the Test Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec gravida tristique posuere. 
Praesent pellentesque lectus sit amet dolor dapibus, vitae interdum mauris bibendum. 
Nulla facilisi. 

Suspendisse pellentesque mi nulla, a luctus sem mollis at. 
Duis nec massa tincidunt, faucibus tortor ut, elementum sapien.

`;

let tmpDir;
// creates a unique temporary directory inside content folder for a test
beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(__dirname, "../content", "test"));
  fs.writeFileSync(path.join(tmpDir, "index.md"), testContent);
});

test("The valid URL returns 200", async () => {
  const validUrlPath = `/${path.parse(tmpDir).base}`;

  await supertest(app).get(validUrlPath).expect(200);
});

test("The content of valid URL contains content from relevant markdown", async () => {
  const htmlTestContent = converter.makeHtml(testContent);

  const validUrlPath = `/${path.parse(tmpDir).base}`;

  await supertest(app)
    .get(validUrlPath)
    .expect(200)
    .then((response) => {
      expect(response.text).toContain(htmlTestContent);
    });
});

test("The invalid URL returns 404", async () => {
  // adding 123 to valid path will make it invalid
  const inValidUrlPath = `/${path.parse(tmpDir).base}123`;

  await supertest(app).get(inValidUrlPath).expect(404);
});

// clean up by deleting temp folder
afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true });
});
