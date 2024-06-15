import ora, { Ora } from 'ora';
import inquirer from 'inquirer';
import Command, {
  IGetProjectsResponse,
  IProjectDetailsResponse,
} from '../../base.js';
import { Flags } from '@oclif/core';
import { createDebugLogger } from '../../utils/output.js';
import { BundlePlanError } from '../../errors/bundle-plan.js';
import { c } from 'tar';

const testString = (str: string) => {
  const regex = /^[a-z0-9][a-z0-9\\-]+[a-z0-9]$/;
  return regex.test(str);
};
export default class DiskCreate extends Command {
  static description = 'create a disk';

  static flags = {
    ...Command.flags,
    app: Flags.string({
      char: 'a',
      description: 'app id',
    }),
    name: Flags.string({
      char: 'n',
      description: 'disk name',
    }),
    size: Flags.string({
      char: 's',
      description: 'disk size',
    }),
  };

  spinner!: Ora;

  async run() {
    this.spinner = ora();
    const { flags } = await this.parse(DiskCreate);
    const debug = createDebugLogger(flags.debug);

    await this.setGotConfig(flags);

    const app = flags.app || (await this.promptProject());
    const name = flags.name || (await this.promptDiskName());
    const size = flags.size || (await this.promptDiskSize());

    const {
      project: { bundlePlanID },
    } = await this.got(`v1/projects/${app}`).json<IProjectDetailsResponse>();

    try {
      await this.got.post(`v1/projects/${app}/disks`, {
        json: { name, size },
      });
      this.log(`Disk ${name} created.`);
    } catch (error) {
      debug(error.message);

      const err = JSON.parse(error.response.body);
      console.log(err);

      if (error.response && error.response.data) {
        debug(JSON.stringify(error.response.data));
      }

      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message === 'not_enough_storage_space'
      ) {
        this.error(`Not enough storage space.`);
      }

      if (
        error.response &&
        err.status === 400 &&
        err.message.includes('["size" must be a number]')
      ) {
        this.error('Invalid disk size. Size must be a number');
      }

      if (
        error.response &&
        err.statusCode === 428 &&
        err.message === 'max_disks_reached'
      ) {
        this.error(BundlePlanError.max_disks_limit(bundlePlanID));
      }

      this.error(`Could not create the disk. Please try again.`);
    }
  }

  async promptProject(): Promise<string> {
    this.spinner.start('Loading...');

    try {
      const { projects } =
        await this.got('v1/projects').json<IGetProjectsResponse>();
      this.spinner.stop();

      if (projects.length === 0) {
        this.warn(
          "Please create an app via 'liara app:create' command, first.",
        );
        this.exit(1);
      }

      const { project } = (await inquirer.prompt({
        name: 'project',
        type: 'list',
        message: 'Please select an app:',
        choices: [...projects.map((project) => project.project_id)],
      })) as { project: string };

      return project;
    } catch (error) {
      this.spinner.stop();
      throw error;
    }
  }

  async promptDiskName(): Promise<string> {
    const { name } = (await inquirer.prompt({
      name: 'name',
      type: 'input',
      message: 'Enter a disk name:',
      validate: (input) => input.length > 2,
    })) as { name: string };

    if (!testString(name)) {
      this.error('Please enter a valid bucket name.');
    }
    return name;
  }

  async promptDiskSize(): Promise<number> {
    const { size } = (await inquirer.prompt({
      name: 'size',
      type: 'input',
      message: 'Enter a disk size in GB:',
    })) as { size: number };

    return size;
  }
}
