// Tests for the dotenv bootstrap module.

describe("dotenv config loader", () => {
  afterEach(() => {
    jest.dontMock("dotenv");
    jest.resetModules();
  });

  test("invokes dotenv.config() when the module is imported", () => {
    const configMock = jest.fn();

    jest.doMock("dotenv", () => ({
      __esModule: true,
      default: { config: configMock },
    }));

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("../../../shared/config/dotenv");
    });

    expect(configMock).toHaveBeenCalledTimes(1);
  });
});
