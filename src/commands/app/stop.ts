import axios from "axios";
import Command from "../../base";
import { flags } from "@oclif/command";
import { createDebugLogger } from "../../utils/output";

export default class AppStop extends Command {
  static description = "stop an app";

  static flags = {
    ...Command.flags,
    app: flags.string({
      char: "a",
      description: "app id",
      required: true,
    }),
  };

  static aliases = ["stop"];

  async run() {
    const { flags } = this.parse(AppStop);
    const debug = createDebugLogger(flags.debug);
    const app = flags.app;
    this.setAxiosConfig({
      ...this.readGlobalConfig(),
      ...flags,
    });

    try {
      await axios.post(
        `/v1/projects/${app}/actions/scale`,
        { scale: 0 },
        this.axiosConfig
      );

      this.log(`App ${app} stopped.`);
    } catch (error) {
      debug(error.message);

      if (error.response && error.response.data) {
        debug(JSON.stringify(error.response.data));
      }

      if (error.response && error.response.status === 404) {
        this.error(`Could not find the app.`);
      }

      if (error.response && error.response.status === 409) {
        this.error(`Another operation is already running. Please wait.`);
      }

      this.error(`Could not stop the app. Please try again.`);
    }
  }
}