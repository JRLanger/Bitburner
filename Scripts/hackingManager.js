/** @param {NS} ns */

import { main as networkUpdate } from "/Scripts/networkUpdate.js";
import { main as targetEvaluation } from "/Scripts/targetEvaluation.js";

export async function main(ns) {
  let delay = 50;
  
  while (true) {
    const initialHackingLevel = ns.getHackingLevel();
    let [servers, scripts] = networkUpdate(ns);

    const targets = await targetEvaluation(ns, servers, scripts, delay);

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
        ns.getPortHandle(1);
        const serversAndScripts = { servers, scripts }
        ns.writePort(1, JSON.stringify(serversAndScripts));

        ns.getPortHandle(2);
        ns.writePort(2, JSON.stringify(target));
        await ns.exec("/Scripts/hwgwBatchLauncher.js", "home", 1);
      }
    }

    while (ns.getHackingLevel() === initialHackingLevel) {
      await ns.sleep(4 * delay);
    }
  }
}

/*
  function getPrograms(ns, player) {
    // Check if the tor router is already purchased
    if (!ns.hasTorRouter()) {
      ns.print("Buying tor router...");
      ns.purchaseTorRouter();
  
      if (ns.hasTorRouter()) {
        ns.toast("Successfully purchased tor router!");
      } else {
        ns.toast("Failed to purchase tor router. Maybe you don't have enough money?");
      }
    } else {
      ns.toast("You already have the tor router.");
    }
    
    ns.purchaseProgram("BruteSSH.exe");
    ns.print("BruteSSH.exe");
    ns.toast("BruteSSH.exe");
    ns.purchaseProgram("FTPCrack.exe");
    ns.print("FTPCrack.exe");
    ns.toast("FTPCrack.exe");
    ns.purchaseProgram("relaySMTP.exe");
    ns.print("relaySMTP.exe");
    ns.toast("relaySMTP.exe");
    ns.purchaseProgram("HTTPWorm.exe");
    ns.print("HTTPWorm.exe");
    ns.toast("HTTPWorm.exe");
    ns.purchaseProgram("SQLInject.exe");
    ns.print("SQLInject.exe");
    ns.toast("SQLInject.exe");
  }
*/
