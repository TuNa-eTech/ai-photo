/**
 * Jest mock for 'formidable' to avoid ESM import chain issues in superagent/supertest during e2e tests.
 * We don't use multipart/form parsing in these tests, so a minimal stub is sufficient.
 */
module.exports = {
  IncomingForm: function () {
    return {
      parse: function (_req, cb) {
        // No-op parse: return empty fields/files
        if (typeof cb === 'function') cb(null, {}, {});
      },
    };
  },
};
