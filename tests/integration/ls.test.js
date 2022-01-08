const request = require("supertest");
let server;

describe("/api/v1/ls/keren", () => {
    beforeEach(() => {
        server = require("../../index").server;
    });

    afterEach(async () => {
    server.close();
    });
    
    describe("POST /", () => {
        let filePaths = ['/root']
        const filesInRoot = `name: file1.txt, type: file\nname: file2.txt, type: file\nname: file3.txt, type: file\n`;

        const exec = async () => {
            return await request(server)
                .post("/api/v1/ls/keren")
                .send({ params: filePaths });
        }

        it("should return all files that are in the given folder", async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.text).toBe(filesInRoot);
        });

        it("should return the given path if a file is given instead of a directory", async () => {
            const filePath = '/root/file1.txt';
            filePaths = [filePath]
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.text).toBe("\n" + filePath);
        });

        it("should return all files that are in the folders", async () => {
            filePaths = ['/root', '/bin', '/root/file1.txt'];
            const filesInRootAndBin = '/root:\n'+ filesInRoot + '/bin:\n\n\n' + '/root/file1.txt'
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.text).toBe(filesInRootAndBin);
        });

        it("should return 404 if the file doesn't exist", async () => {
            filePaths = ['noneExistingFolder'];
            const res = await exec();

            expect(res.status).toBe(404);
        });
    }) 
});