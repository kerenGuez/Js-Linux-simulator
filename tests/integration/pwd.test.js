const request = require("supertest");
const environmentVariables = require("../../configs/environmentVariables.json");

let server;

describe("/api/v1/pwd/keren", () => {
    beforeEach(() => {
        server = require("../../index").server;
    });
      afterEach(async () => {
        server.close();
      });
    
      describe("POST /", () => {
        const exec = async () => {
            return await request(server)
                .post("/api/v1/pwd/keren")
                .send({ params: [] });
        }
    
        it(`should return the pwd (current path of working directory) variable Default: '${environmentVariables.PWD}'`, async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.text).toBe(environmentVariables.PWD);
        });
    }) 
});