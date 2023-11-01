/** @param {NS} ns */

class Target {
  constructor(ns, server, delay) {

    Object.assign(this, server);

    this.hackTime = ns.getHackTime(this.hostname);
    this.counterHackTime = ns.getWeakenTime(this.hostname);
    this.growTime = ns.getGrowTime(this.hostname);
    this.counterGrowTime = ns.getWeakenTime(this.hostname);

    this.delay = delay;
    this.maxBatches = Math.floor(this.counterHackTime / (5 * this.delay));
    if (this.maxBatches % 2 === 0) {
      this.maxBatches -= 1;
    }

    const adjustFactor = (this.counterHackTime % this.maxBatches) / this.maxBatches;
    this.delay += adjustFactor;

    this.hackScriptDelay = this.counterHackTime - this.hackTime - this.delay;
    this.counterHackScriptDelay = 0;
    this.growScriptDelay = this.counterGrowTime - this.growTime + this.delay;
    this.counterGrowScriptDelay = 2 * this.delay;

    this.chanceToHack = ns.hackAnalyzeChance(this.hostname);

  }


  // For an acurate calculation of weakenAnalyse and growAnalize the number of cores of the excuting server needs to be taken into account.
  calculateThreads(ns, percentage) {
    let hackThreads = Math.ceil(ns.hackAnalyzeThreads(this.hostname, this.moneyMax * (percentage / 100)));
    let counterHackThreads = (Math.ceil(ns.hackAnalyzeSecurity(hackThreads) / ns.weakenAnalyze(1))) + Math.ceil(0.1 * (Math.ceil(ns.hackAnalyzeSecurity(hackThreads) / ns.weakenAnalyze(1))));
    const growPercentage = (percentage / (100 - percentage));
    let growThreads = (Math.ceil(ns.growthAnalyze(this.hostname, (1 + growPercentage)))) + Math.ceil(0.1 * (Math.ceil(ns.growthAnalyze(this.hostname, (1 + growPercentage)))));
    let counterGrowThreads = (Math.ceil(ns.growthAnalyzeSecurity(growThreads) / ns.weakenAnalyze(1))) + Math.ceil(0.1 * (Math.ceil(ns.growthAnalyzeSecurity(growThreads) / ns.weakenAnalyze(1))));

    return {
      hackThreads,
      counterHackThreads,
      growThreads,
      counterGrowThreads
    };
  }

  findOptimalPercentage(ns, scripts) {
    let bestPercentage = null;
    let bestDollarPerRam = 0;

    for (let percentage = 1; percentage <= 99; percentage++) {
      const threads = this.calculateThreads(ns, percentage);

      this.hackThreads = threads.hackThreads;
      this.counterHackThreads = threads.counterHackThreads;
      this.growThreads = threads.growThreads;
      this.counterGrowThreads = threads.counterGrowThreads;

      const hackScript = scripts.find(script => script.operation === 'hack');
      const counterHackScript = scripts.find(script => script.operation === 'counterHack');
      const growScript = scripts.find(script => script.operation === 'grow');
      const counterGrowScript = scripts.find(script => script.operation === 'counterGrow');

      const moneyStolenPerAttack = (this.moneyMax * (percentage / 100)) * this.chanceToHack;
      const totalRamUsed = (this.hackThreads * hackScript.ram) + (this.counterHackThreads * counterHackScript.ram) + (this.growThreads * growScript.ram) + (this.counterGrowThreads * counterGrowScript.ram);
      const dollarPerRAM = moneyStolenPerAttack / totalRamUsed;

      if (dollarPerRAM > bestDollarPerRam) {
        bestDollarPerRam = dollarPerRAM;
        bestPercentage = percentage;
      }
    }

    this.bestPercentage = bestPercentage;
    this.bestDollarPerRam = bestDollarPerRam;

    const threads = this.calculateThreads(ns, this.bestPercentage);

    this.hackThreads = threads.hackThreads;
    this.counterHackThreads = threads.counterHackThreads;
    this.growThreads = threads.growThreads;
    this.counterGrowThreads = threads.counterGrowThreads;
  }
}

export async function main(ns) {

  // Read config from .txt file
  const configFile = ns.read('/Files/config.txt');
  const config = JSON.parse(configFile);

  // Read servers and scripts from .txt files
  const serversFile = ns.read('/Files/servers.txt');
  const servers = JSON.parse(serversFile);
  const scriptsFile = ns.read('/Files/scripts.txt');
  const scripts = JSON.parse(scriptsFile);

  let targets = [];

  for (const server of servers) {
    if (server.moneyMax === 0 || server.hasAdminRights === false) continue;
    const target = new Target(ns, server, config.delay);
    target.findOptimalPercentage(ns, scripts);
    targets.push(target);
  }

  targets = targets.filter(target => target.hostname === "ecorp" || "megacorp");

  targets.sort((a, b) => b.bestDollarPerRam - a.bestDollarPerRam);

  ns.tprint(`    Targets organized for the Attack Scripts:     `);
  ns.tprint(`----------------------------------------------------------------------------`);
  ns.tprint(`|       Hostname       |   Best %   |  $ / RAM   |  Security  |     $      |`);
  ns.tprint(`----------------------------------------------------------------------------`);

  for (const target of targets) {
    const hostnamePad = 20;
    const valuePad = 10;

    const paddedHostname = target.hostname.padEnd(hostnamePad);
    const paddedPercentage = (`${target.bestPercentage}%`).padStart(valuePad);
    const paddedDollarPerRam = ("$" + `${ns.formatNumber(target.bestDollarPerRam, 2)}`).padStart(valuePad);
    const paddedHackDifficulty = (`${ns.formatNumber(target.hackDifficulty / target.minDifficulty * 100, 0)}%`).padStart(valuePad);
    const paddedMoneyAvailable = (`${ns.formatNumber(target.moneyAvailable / target.moneyMax * 100, 0)}%`).padStart(valuePad);

    ns.tprint(`| ${paddedHostname} | ${paddedPercentage} | ${paddedDollarPerRam} | ${paddedHackDifficulty} | ${paddedMoneyAvailable} |`);
  }

  ns.tprint(`----------------------------------------------------------------------------`);

    // Convert targets to string format
    const targetsString = JSON.stringify(targets);
  
    // Write servers and scripts to .txt files
    ns.write('/Files/targets.txt', targetsString, 'w');

}