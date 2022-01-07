const request = require("supertest");
let server;

describe("/api/v1/tail/keren", () => {
    beforeEach(() => {
        server = require("../../index").server;
    });
      afterEach(async () => {
        server.close();
      });
    
      describe("POST /", () => {
        let filePaths = ['a']
        const exec = async () => {
            return await request(server)
                .post("/api/v1/tail/keren")
                .send({ params: filePaths });
        }
    
        it("should return the file content if the file exists", async () => {
            // TODO 
        });
    }) 
});