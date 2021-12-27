const axios = require("axios");

const express = require("express");
const app = express();

require("../startups/routes")(app);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));


const testPwd = async () => {
    try {
      return await axios.get('http://localhost:3000/api/v1/pwd/keren/')
    } catch (error) {
      console.error(error)
    }
  }
testPwd().then((a) => console.log(a.data));