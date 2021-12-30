const request = require("supertest");
const environmentVariables = require("../../configs/environmentVariables.json");

let server;

describe("/api/v1/cd/keren", () => {
    beforeEach(() => {
        server = require("../../index").server;
    });
      afterEach(async () => {
        server.close();
      });
    
      describe("POST /", () => {
        let filePath = ['/root'];
        const exec = async () => {
            return await request(server)
                .post("/api/v1/cd/keren")
                .send({ params: filePath });
        }
    
        it("should change current_file and pwd variable and return the given path", async () => {
            const res = await exec();
    
            expect(res.status).toBe(200);
            expect(environmentVariables.PWD).toBe(filePath[0]);
            // TODO : check current file
        });

        it("should return 400 if more than one file path was given", async () => {
            filePath = ['/root', '/bin'];
            const res = await exec();
    
            expect(res.status).toBe(400);
        });

        it("should return 404 if the type of the object is file and not directory", async () => {
            filePath = ['/root/file1.txt'];
            const res = await exec();
    
            expect(res.status).toBe(404);
        });

        it("should return 404 if directory doesn't exist", async () => {
            filePath = ['/nonExistingDirectory'];
            const res = await exec();
    
            expect(res.status).toBe(404);
        });
    }) 
});