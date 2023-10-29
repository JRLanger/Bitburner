/** @param {NS} ns */

class Script {
  constructor(ns, path) {
    this.path = path;
    this.ram = ns.getScriptRam(path);
  }
}

export function main(ns) {

  const scripts = {
    hack: new Script(ns, '/Scripts/Attack-Scripts/hack.js'),
    counterHack: new Script(ns, '/Scripts/Attack-Scripts/weaken.js'),
    grow: new Script(ns, '/Scripts/Attack-Scripts/grow.js'),
    counterGrow: new Script(ns, '/Scripts/Attack-Scripts/weaken.js')
  };

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
      ns.scp([scripts.hack.path, scripts.counterHack.path, scripts.grow.path, scripts.counterGrow.path], server.hostname, "home");
      ns.tprint(`Server ${server.hostname} successfully cracked, scripts injected`);
    }
  }

  ns.tprint(`--------------------------------------------------`);
  ns.tprint(`      Network updated. ${newServers} new server(s) added`);
  ns.tprint(`--------------------------------------------------`);

  return [servers, scripts];
}

/*
server.hostname
server.ip
server.sshPortOpen
server.ftpPortOpen
server.smtpPortOpen
server.httpPortOpen
server.sqlPortOpen
server.hasAdminRights
server.cpuCores
server.isConnectedTo
server.ramUsed
server.maxRam
server.organizationName
server.purchasedByPlayer
server.backdoorInstalled
server.baseDifficulty
server.hackDifficulty
server.minDifficulty
server.moneyAvailable
server.moneyMax
server.numOpenPortsRequired
server.openPortCount
server.requiredHackingSkill
server.serverGrowth

When only rooted servers are needed:
servers = servers.filter(server => server.hasAdminRights);
*/