const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const sinon = require("sinon");

const fs = require("fs");
const Credentials = require("../src/index");

describe("credentials", function() {
  beforeEach(function() {
    this.c = new Credentials("/path/to/.basic/credentials");
    this.sandbox = sinon.sandbox.create();
    this.mockFs = this.sandbox.mock(fs, "readFile");
  });

  afterEach(function() {
    this.mockFs.verify();
    this.sandbox.restore();
  });

  describe("#construct", function() {
    it("stores the passed in file path", function() {
      return expect(this.c.file).to.be.eql("/path/to/.basic/credentials");
    });

    it("replaces ~ with the home path on windows", function() {
      const originalPlatform = process.platform;
      const originalEnv = process.env;

      Object.defineProperty(process, "platform", {
        value: "win32"
      });
      process.env = { USERPROFILE: "c:/userprofile/someuser" };

      let c = new Credentials("~/test");

      Object.defineProperty(process, "platform", {
        value: originalPlatform
      });
      process.env = originalEnv;

      return expect(c.file).to.be.eql("c:/userprofile/someuser/test");
    });

    it("replaces ~ with the home path on linux", function() {
      const originalPlatform = process.platform;
      const originalEnv = process.env;

      Object.defineProperty(process, "platform", {
        value: "linux"
      });
      process.env = { HOME: "/home/someuser" };

      let c = new Credentials("~/test");

      Object.defineProperty(process, "platform", {
        value: originalPlatform
      });
      process.env = originalEnv;

      return expect(c.file).to.be.eql("/home/someuser/test");
    });
  });

  describe("#getCredentials()", function() {
    it.only("passes in the correct path", function() {
      this.mockFs
        .expects("readFile")
        .withArgs("/path/to/.basic/credentials")
        .once();
      return expect(this.c.get()).to.be.an.instanceof(Promise);
    });

    it("returns a promise", function() {
      this.mockFs
        .expects("readFile")
        .once()
        .yields(null, "[default]\none=two");
      return expect(this.c.get()).to.be.an.instanceof(Promise);
    });

    it("rejects the promise on error", function() {
      const expectedErr = new Error("Missing file");
      this.mockFs
        .expects("readFile")
        .once()
        .yields(expectedErr, null);
      return expect(this.c.get()).to.be.rejectedWith(expectedErr);
    });

    it("callback with error if provided", function(done) {
      const expectedErr = new Error("Missing file");
      this.mockFs
        .expects("readFile")
        .once()
        .yields(expectedErr, null);
      expect(
        this.c.get(null, function(err, data) {
          expect(err).to.eql(expectedErr);
          done();
        })
      );
    });

    it("callback on success if provided", function(done) {
      const expectedErr = new Error("Missing file");
      this.mockFs
        .expects("readFile")
        .once()
        .yields(null, "[default]\none=two\nthree=four");
      return this.c.get(null, function(err, data) {
        expect(data).to.eql({ one: "two", three: "four" });
        done();
      });
    });

    it("returns the default section", function() {
      const expectedErr = new Error("Missing file");
      this.mockFs
        .expects("readFile")
        .once()
        .yields(null, "[default]\none=two\nthree=four");
      return expect(this.c.get()).to.eventually.become({
        one: "two",
        three: "four"
      });
    });

    it("returns a non-default section", function() {
      const expectedErr = new Error("Missing file");
      this.mockFs
        .expects("readFile")
        .once()
        .yields(null, "[demo]\none=two\nthree=four");
      return expect(this.c.get("demo")).to.eventually.become({
        one: "two",
        three: "four"
      });
    });

    it("errors if the requested section does not exist", function() {
      this.mockFs
        .expects("readFile")
        .once()
        .yields(null, "[default]\none=two\nthree=four");
      return expect(this.c.get("missing")).to.be.rejectedWith(
        Error,
        "Unable to find the account 'missing'"
      );
    });
  });
});
