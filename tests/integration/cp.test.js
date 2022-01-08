const request = require("supertest");
let server;

describe("/api/v1/cp/keren", () => {
    beforeEach(() => {
        server = require("../../index").server;
    });
    afterEach(async () => {
      server.close();
    });
    
    describe("POST /", () => {
      let filePaths = ['/root/file1.txt']
      const exec = async () => {
          return await request(server)
              .post("/api/v1/cp/keren")
              .send({ params: filePaths });
      }
  
      it("-fill-", async () => {

      });
    }) 
});