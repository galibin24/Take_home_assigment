const express = require("express");
const mustacheExpress = require("mustache-express");
const showdown = require("showdown");
const path = require("path");
const fs = require("fs").promises;

const app = express();
const converter = new showdown.Converter();

// setting templating engine
app.engine("html", mustacheExpress());
app.set("view engine", "html");
app.set("views", __dirname + "/");
// include styles
app.use(express.static("./src/css"));

const getContentByUrlPath = async (UrlPath) => {
  const contentPath = path.join(__dirname, "content", UrlPath, "index.md");

  let content = await fs.readFile(contentPath);
  // convert md string to HTML to preserve the styles of md file
  let htmlContent = converter.makeHtml(content.toString());

  return htmlContent;
};

app.get("/*", (req, res) => {
  getContentByUrlPath(req.originalUrl)
    .then((content) => {
      res.render("template", { content: content });
    })
    .catch((err) => {
      // failed to find path error code
      if ((err.code = "ENOENT")) {
        console.error(err);
        res.status(404).send("This Path Doesn't Exist");
      } else {
        console.error(err);
        res.status(500).send("Something went wrong!");
      }
    });
});

module.exports = app;
