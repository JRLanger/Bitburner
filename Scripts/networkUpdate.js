/** @param {NS} ns */

class Script {
  constructor(ns, operation, path) {
    this.operation = operation;
    this.path = path;
    this.ram = ns.getScriptRam(path);
  }
}

export function main(ns) {
  const scripts = [
    new Script(ns, 'hack', '/Scripts/Attack-Scripts/hack.js'),
    new Script(ns, 'counterHack', '/Scripts/Attack-Scripts/weaken.js'),
    new Script(ns, 'grow', '/Scripts/Attack-Scripts/grow.js'),
    new Script(ns, 'counterGrow', '/Scripts/Attack-Scripts/weaken.js')
  ];

  const homeServer = ns.getServer("home");
  let servers = [homeServer];
  const seenServers = new Set([homeServer.hostname]);
  let newServers = 0;

  for (const server of servers) {
    const newScan = ns.scan(server.hostname);
    for (const newServerHostname of newScan) {
      if (!seenServers.has(newServerHostname)) {
        seenServers.add(newServerHostname);
        servers.push(ns.getServer(newServerHostname));
      }
    }
  }

  const purchasedServers = ns.getPurchasedServers()
  for (const server of purchasedServers) {
    servers.push(ns.getServer(server));
  }

  const playerLevel = ns.getHackingLevel();
  const programToFunction = {
    'BruteSSH.exe': ns.brutessh,
    'FTPCrack.exe': ns.ftpcrack,
    'relaySMTP.exe': ns.relaysmtp,
    'HTTPWorm.exe': ns.httpworm,
    'SQLInject.exe': ns.sqlinject
  };

  const availablePrograms = Object.keys(programToFunction).filter(program => ns.fileExists(program));

  for (const server of servers) {
    const hasRequiredSkills = playerLevel >= server.requiredHackingSkill;
    const hasRequiredPorts = availablePrograms.length >= server.numOpenPortsRequired || server.numOpenPortsRequired === 0;
    const hasNoAdminRights = !server.hasAdminRights;

    if (hasRequiredSkills && hasRequiredPorts && hasNoAdminRights) {
      availablePrograms.forEach(program => programToFunction[program](server.hostname));
      ns.nuke(server.hostname);
      newServers++;
      const scriptPaths = scripts.map(script => script.path);
      ns.scp(scriptPaths, server.hostname, "home");
      ns.tprint(`Server ${server.hostname} successfully cracked, scripts injected`);
    }
  }

  // Convert servers and scripts to string format
  const serversString = JSON.stringify(servers);
  const scriptsString = JSON.stringify(scripts);

  // Write servers and scripts to .txt files
  ns.write('/Files/servers.txt', serversString, 'w');
  ns.write('/Files/scripts.txt', scriptsString, 'w');

  ns.tprint(`--------------------------------------------------`);
  ns.tprint(`      Network updated. ${newServers} new server(s) added`);
  ns.tprint(`--------------------------------------------------`);
}

/**
 * List of default server properties:
 * 
 * server.hostname
 * server.ip
 * server.sshPortOpen
 * server.ftpPortOpen
 * server.smtpPortOpen
 * server.httpPortOpen
 * server.sqlPortOpen
 * server.hasAdminRights
 * server.cpuCores
 * server.isConnectedTo
 * server.ramUsed
 * server.maxRam
 * server.organizationName
 * server.purchasedByPlayer
 * server.backdoorInstalled
 * server.baseDifficulty
 * server.hackDifficulty
 * server.minDifficulty
 * server.moneyAvailable
 * server.moneyMax
 * server.numOpenPortsRequired
 * server.openPortCount
 * server.requiredHackingSkill
 * server.serverGrowth
 */