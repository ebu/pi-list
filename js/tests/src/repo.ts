import { testUtils } from "@bisect/bisect-core-ts-be";

const repo = new testUtils.TestRepository();

export const addTest = (
  name: string,
  test: testUtils.TestFunction,
  requirements: testUtils.TestRequirements = []
) => repo.addTest(name, test, requirements);

export const run = (settings: testUtils.ITestSettings) => repo.run(settings);

export enum requirements {
  Basic = "Basic",
}
