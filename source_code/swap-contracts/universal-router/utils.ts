import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHAIN = process.env.CHAIN as string;

const DEPLOYMENT_ADDRESSES_PATH = path.join(__dirname, 'deployment', CHAIN, 'addresses.json');
execSync(`mkdir -p ${path.dirname(DEPLOYMENT_ADDRESSES_PATH)}`);
const DEPLOYMENT_ARGS_FOLDER = path.join(__dirname, 'deployment', CHAIN, 'args');

export function readDeployment() {
  if (!process.env.CONTRACTS_PATH) {
    throw new Error('CONTRACTS_PATH must be set to the path containing deployment/addresses.json');
  }
  return JSON.parse(fs.readFileSync(process.env.CONTRACTS_PATH).toString());
}

export function writeDeployment(contents: Record<string, string>) {
  if (process.env.CONTRACTS_PATH) {
    fs.writeFileSync(process.env.CONTRACTS_PATH, JSON.stringify(contents, null, 2));
  }
  return fs.writeFileSync(DEPLOYMENT_ADDRESSES_PATH, JSON.stringify(contents, null, 2));
}

export function writeDeploymentArgs(component: string, contents: Record<string, any[]>) {
  const folders = [path.join(DEPLOYMENT_ARGS_FOLDER, component)];
  if (process.env.CONTRACTS_PATH) {
    folders.push(path.join(path.dirname(process.env.CONTRACTS_PATH), 'args', component));
  }
  for (const folder of folders) {
    execSync(`mkdir -p ${folder}`);
    for (const [contract, deploymentArgs] of Object.entries(contents)) {
      fs.writeFileSync(path.join(folder, `${contract}.json`), JSON.stringify(deploymentArgs, null, 2));
    }
  }

}
