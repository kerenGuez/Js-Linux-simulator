const request = require("supertest");
let server;

describe("/api/v1/echo/keren", () => {
    beforeEach(() => {
        server = require("../../index").server;
    });
      afterEach(async () => {
        server.close();
      });
    
      describe("POST /", () => {
        let paramsToEcho = ["a", "b", "c"];
        const exec = async () => {
            return await request(server)
                .post("/api/v1/echo/keren")
                .send({ params: paramsToEcho });
        }
    
        it("should return the words given as params", async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.text).toBe(paramsToEcho.join(" "));

        });

        it("should handle empty input", async () => {
            paramsToEcho = [];
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.text).toBe("");
        });
    }) 
});