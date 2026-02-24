const express = require("express");
const cors = require("cors");
const path = require("path");

const config = require("./src/config/config");
const router = require("./src/routes/router");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", router);

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});
