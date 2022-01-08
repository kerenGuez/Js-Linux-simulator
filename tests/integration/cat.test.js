const request = require("supertest");
let server;

describe("/api/v1/cat/keren", () => {
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
                .post("/api/v1/cat/keren")
                .send({ params: filePaths });
        }

        it("should return the file content if the file exists", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.text).toBe('File content\n    \n      with lines\n  \n      ');
        });

        it("should return 404 if the file doesn't exist", async () => {
            filePaths = ['/root/noneExistingFile'];
            const res = await exec();

            expect(res.status).toBe(404);
        });
    }) 
});