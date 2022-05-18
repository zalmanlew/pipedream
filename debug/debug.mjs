/* eslint-disable no-unused-vars */

/**
 * Local debugging for developing action and sources components
 * Supports running actions and sources
 *
 * Currently not supported:
 *  - running async options from props
 *  - source timer polling - not needed
 *  - source receiving http requests- you can configure an event to be sent to the source
 *  - running webhooks
 *
 * Be sure to configure everything!
 *
 * 1. The app and component imports
 * 2. appName - The app name
 * 3. configureApp() - Authentication ($auth)
 *
 * 4. configureComponent() - configure component props
 * 4.1. initializeProps() - (optional) set default prop values
 * 4.2. setupDB() - (no change needed) db for sources
 * 4.3. setupEmitter() - (no change needed) $emit for sources
 * 4.4. setupProps() - set the props values that will be used in the component
 *
 * 5. overrideRun() - (optional) change the run method
 * 6. runAction() - (no change needed) call action.run()
 * 7. runSource() - (optional) set event and call source.run(event)
 */

import app from "../components/zerotier/zerotier.app.mjs";
import component from "../components/zerotier/actions/update-network-member/update-network-member.mjs";

const appName = "zerotier";

main();

/**
 * Configure and run action or source
 */
async function main() {
  configureApp();
  const component = configureComponent();
  // overrideRun(component);

  const result = runAction(component);
  // const result = runSource(component);

  console.log("---------- result ----------");
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Configures app API_KEY or OAUTH_KEY from $AUTH_TOKEN environment variable
 * Injects app methods so they are accessible by `this`
 */
function configureApp() {
  app.$auth = {
    api_key: process.env.AUTH_TOKEN,
    oauth_access_token: process.env.AUTH_TOKEN,
  };

  component.props[appName] = {
    ...app,
    ...app.methods,
  };
}

/**
 * Configures component prop values
 * Injects component methods and props so they are accessible by `this`
 */
function configureComponent() {
  initializeProps();
  setupDB();
  setupEmitter();
  setupProps();

  return {
    ...component,
    ...component.methods,
    ...component.props,
  };
}

/**
 * Initializes props - thanks Zalman Lew for the idea!
 */
function initializeProps(propDefaultValue = undefined) {
  Object.keys(component.props)
    .filter((key) => key !== appName)
    .map((key) => component.props[key] = propDefaultValue);
}

/**
 * Adds DB prop
 */
function setupDB() {
  const db = {};
  component.props.db = {
    get(k) {
      return db[k];
    },
    set(k, v) {
      db[k] = v;
    },
  };
}

/**
 * Adds $emit method for sources
 */
function setupEmitter() {
  if (!component.methods) component.methods = {};
  component.methods.$emit = (event, meta) => {
    event = JSON.stringify(event);
    meta = JSON.stringify(meta);
    console.log(`Emitted event: ${event}, ${meta}`);
  };
}

/**
 * Define custom prop values
 */
function setupProps() {
  component.props.sheetId = "11s9s17G4WySY_lc0fb1tHFooqZ2B66poAxusq5ptUS8";
  component.props.sheetName = "Sheet1";
  component.props.hasHeaders = "No";
}

/**
 * Optionally override component's run method
 */
function overrideRun(component) {
  component.run = () => {
    console.log("Run was overriden!");
  };
}

/**
 * Runs Action Component
 * @param - $ export
*/
async function runAction(action) {
  return action.run({
    $: {
      export: (k, v) => console.log(`${k}: ${v}`),
    },
  });
}

/**
 * Runs Source Component
 * @param - event
 */
async function runSource(source) {
  return source.run({
    event: "to be sent",
  });
}
