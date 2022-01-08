const request = require("supertest");
let server;

describe("/api/v1/which/keren", () => {
    beforeEach(() => {
        server = require("../../index").server;
    });
    afterEach(async () => {
    server.close();
    });
    
    describe("POST /", () => {
        let commandsToSearch = ['ls']
        const exec = async () => {
            return await request(server)
                .post("/api/v1/which/keren")
                .send({ params: commandsToSearch });
        }
    
        it("should return the path of the given commands' binary", async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.text).toBe('/usr/bin/ls');
        });

        it("should return empty string if command isn't found", async () => {
            commandsToSearch = ['bla bla'];
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.text).toBe('');
        });

        it("should be able to handle multiple commands requests", async () => {
            commandsToSearch = ['ls', 'which', 'nonExisting', 'cp'];
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.text).toBe('/usr/bin/ls\n/usr/bin/which\n/usr/bin/cp');
        });
    }) 
});