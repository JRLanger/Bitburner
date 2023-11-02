/** @param {NS} ns */

export async function main(ns) {

  // Read config from .txt file
  const configFile = ns.read('/Files/config.txt');
  const config = JSON.parse(configFile);

  if (config.verbose) ns.tprint("Config file read and parsed. Verbose mode ON.");
  if (config.verbose) ns.tprint(`Delay: ${config.delay}`);
  

  while (true) {
    const initialHackingLevel = ns.getHackingLevel();
    
    const networkUpdatePID = await ns.exec("/Scripts/networkUpdate.js", "home", 1);
    if (config.verbose) ns.tprint("Network update script started.");
    while (ns.isRunning(networkUpdatePID)) {
      await ns.sleep(5);
    }
    if (config.verbose) ns.tprint("Network update script finished running.");
    
    const serversFile = ns.read('/Files/servers.txt');
    const servers = JSON.parse(serversFile);
    const scriptsFile = ns.read('/Files/scripts.txt');
    const scripts = JSON.parse(scriptsFile);
    if (config.verbose) ns.tprint("Servers and scripts files read and parsed.");

    const targetEvaluationPID = await ns.exec("/Scripts/targetEvaluation.js", "home", 1);
    if (config.verbose) ns.tprint("Target Evaluation script started.");
    while (ns.isRunning(targetEvaluationPID)) {
      await ns.sleep(5);
    }
    if (config.verbose) ns.tprint("Target evaluation completed.");

    const targetsFile = ns.read('/Files/targets.txt');
    const targets = JSON.parse(targetsFile);
    if (config.verbose) ns.tprint("Targets file read and parsed.");
    
    for (const target of targets) {
      const hackScript = scripts.find(script => script.operation === 'hack');
      const counterHackScript = scripts.find(script => script.operation === 'counterHack');
      const growScript = scripts.find(script => script.operation === 'grow');
      const counterGrowScript = scripts.find(script => script.operation === 'counterGrow');

      const targetLoopRam = (target.hackThreads * hackScript.ram) +
        (target.counterHackThreads * counterHackScript.ram) +
        (target.growThreads * growScript.ram) +
        (target.counterGrowThreads * counterGrowScript.ram);

      if ((targetLoopRam * target.maxBatches) < (ns.getServerMaxRam("home") - ns.getServerUsedRam("home"))) {
        if (config.verbose) ns.tprint("Starting batch launcher script.");
        ns.getPortHandle(1);
        const serversAndScripts = { servers, scripts }
        ns.writePort(1, JSON.stringify(serversAndScripts));

        ns.getPortHandle(2);
        ns.writePort(2, JSON.stringify(target));
        await ns.exec("/Scripts/hwgwBatchLauncher.js", "home", 1);
        if (config.verbose) ns.tprint("Batch launcher script started.");
      }
    }

    while (ns.getHackingLevel() === initialHackingLevel) {
      await ns.sleep(4 * config.delay);
    }

  }

}