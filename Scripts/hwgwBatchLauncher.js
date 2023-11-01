/** @param {NS} ns */

export async function main(ns) {
  // Read servers and scripts from .txt files
  const serversFile = ns.read('/Files/servers.txt');
  const servers = JSON.parse(serversFile);
  const scriptsFile = ns.read('/Files/scripts.txt');
  const scripts = JSON.parse(scriptsFile);
  
    const target = JSON.parse(ns.readPort(2));

    let playerInitialLevel = ns.getHackingLevel();

    while (playerInitialLevel === ns.getHackingLevel()) {

        let serverWithEnoughRam = findServerWithEnoughRam(ns, servers, scripts, target);

        if (serverWithEnoughRam) {
            await executeScriptsOnServer(ns, serverWithEnoughRam, scripts, target);
            await ns.sleep(5 * target.delay);
        } else {
            ns.tprint("No server with enough RAM found. Retrying in 15 seconds...");
            await ns.sleep(15000);
        }
    }
}

function findServerWithEnoughRam(ns, servers, scripts, target) {
    let totalRamRequired = 0;
  
    // Calculate total RAM required for all operations
    for (let scriptType of ['hack', 'counterHack', 'grow', 'counterGrow']) {
      const script = scripts.find(script => script.operation === scriptType);
      totalRamRequired += script.ram * target[`${scriptType}Threads`];
    }
  
    // Find a server with enough available RAM
    for (let server of servers) {
      let availableRam = ns.getServerMaxRam(server.hostname) - ns.getServerUsedRam(server.hostname);
      if (server.hostname === 'home') {
        availableRam -= 1000; // Reserve 1TB for home server
      }
      if (availableRam >= totalRamRequired) {
        return server;
      }
    }
  
    return null;
  }
  
  async function executeScriptsOnServer(ns, server, scripts, target) {
    const delayMapping = {
      'hack': 'hackScriptDelay',
      'grow': 'growScriptDelay',
      'counterHack': 'counterHackScriptDelay',
      'counterGrow': 'counterGrowScriptDelay'
    };
  
    const promises = [];
  
    for (let scriptType of ['hack', 'counterHack', 'grow', 'counterGrow']) {
      let threads = target[`${scriptType}Threads`];
      if (threads <= 0) {
        continue;
      }
  
      const script = scripts.find(script => script.operation === scriptType);
      let delayArgument = target[delayMapping[scriptType]];
      promises.push(ns.exec(script.path, server.hostname, threads, target.hostname, delayArgument));
    }
  
    await Promise.all(promises);
  }