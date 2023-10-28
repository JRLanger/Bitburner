/** @param {NS} ns */

import { main as networkUpdate } from "/networkUpdate.js";
import { main as targetEvaluation } from "/targetEvaluation.js";

export async function main(ns) {
  let delay = 250;

  while (true) {
    const initialHackingLevel = ns.getHackingLevel();

    let [servers, scripts] = networkUpdate(ns);

    const targets = await targetEvaluation(ns, servers, scripts, delay);

    for (const target of targets) {
      const targetLoopRam = (target.hackThreads * scripts.hack.ram) +
        (target.counterHackThreads * scripts.counterHack.ram) +
        (target.growThreads * scripts.grow.ram) +
        (target.counterGrowThreads * scripts.counterGrow.ram);

      if ((targetLoopRam * target.maxBatches) < (ns.getServerMaxRam("home") - ns.getServerUsedRam("home"))) {
        ns.getPortHandle(1);
        const serversAndScripts = { servers, scripts }
        ns.writePort(1, JSON.stringify(serversAndScripts));

        ns.getPortHandle(2);
        ns.writePort(2, JSON.stringify(target));
        await ns.exec("/hwgwBatchLauncher.js", "home", 1);
      }
    }

    while (ns.getHackingLevel() === initialHackingLevel) {
      await ns.sleep(4 * delay);
    }
  }
}