const request = require("supertest");
let server;

describe("/api/v1/head/keren", () => {
  beforeEach(() => {
    server = require("../../index").server;
  });
  afterEach(async () => {
    server.close();
  });

  describe("POST /", () => {
    const DEFAULT_NUM_OF_LINES = 10;

    let flags;
    let params = ["file3.txt"];
    const file3Content = `1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n11\n12\n13\n14\n15`;
    let file3ContentPattern = "([0-9]\\n)+";

    const exec = async () => {
      return await request(server)
        .post("/api/v1/head/keren")
        .send({ params, flags });
    };

    it(`should return the default amount of lines of the file's content (${DEFAULT_NUM_OF_LINES} lines)`, async () => {
      flags = "";
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.text).toBe(
        file3Content.match(
          new RegExp(file3ContentPattern + `${DEFAULT_NUM_OF_LINES}\\n`, "g")
        )[0]
      );
    });

    it("should return 2 lines of the file's content", async () => {
      flags = { n: 2 };
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.text).toBe(
        file3Content.match(new RegExp(file3ContentPattern + `2\\n`, "g"))[0]
      );
    });

    it("should return 2 lines of each of the files' content", async () => {
      flags = { n: 2 };
      params = ["file3.txt", "file2.txt"];
      const file2Content = `Some Different Content`;
      const expectedContent =
        `==> /root/file3.txt <==\n` +
        file3Content.match(new RegExp(file3ContentPattern + `2\\n`, "g"))[0] +
        `==> /root/file2.txt <==\n` +
        file2Content +
        `\n`;
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.text).toBe(expectedContent);
    });

    it("should return error message if parameter is a directory instead of a file", async () => {
      params = ["/root/nonExistingFile"];
      const dir = "/root";
      flags = { n: 2 };
      params = [dir];
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.text).toBe(`head: error reading '${dir}': Is a directory`);
    });

    it("should return 404 if file doesn't exist", async () => {
      params = ["/root/nonExistingFile"];
      const res = await exec();

      expect(res.status).toBe(404);
    });
  });
});
