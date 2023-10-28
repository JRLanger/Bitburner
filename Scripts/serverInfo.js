/** @param {NS} ns */

export async function main(ns) {
    let target = ns.args[0];
    let server = ns.getServer(target);
  
    let ramAvailable = server.maxRam - server.ramUsed;
    let ramPerThread = ns.getScriptRam('/scripts/hack.js');
    let maxThreads = Math.floor(ramAvailable / ramPerThread);
  
    let securityPercentAboveMin = ((server.hackDifficulty - server.minDifficulty) / server.minDifficulty) * 100;
    let moneyPercentBelowMax = ((server.moneyMax - server.moneyAvailable) / server.moneyMax) * 100;
  
    ns.tprint("-----------------------------------------------------");
    ns.tprint("Hostname: " + server.hostname);
    ns.tprint(" ");
    ns.tprint(`Min Security level: ${server.minDifficulty}`);
    ns.tprint(`Current security: ${ns.formatNumber(server.hackDifficulty)} (${securityPercentAboveMin.toFixed(2)}% above minimum)`);
    ns.tprint(" ");
    ns.tprint("Max Money: " + ns.formatNumber(server.moneyMax));
    ns.tprint(`Current Money: ${ns.formatNumber(server.moneyAvailable)} (${moneyPercentBelowMax.toFixed(2)}% below maximum)`);
    ns.tprint("-----------------------------------------------------");
  }