/** @param {NS} ns */

class Target {
    constructor(ns, server, delay, scripts) {
  
      Object.assign(this, server);
      this.baseHackTime = ns.getHackTime(this.hostname);
      this.hackTime = this.baseHackTime * scripts.hack.timeMultiplier;
      this.counterHackTime = this.baseHackTime * scripts.counterHack.timeMultiplier;
      this.growTime = this.baseHackTime * scripts.grow.timeMultiplier;
      this.counterGrowTime = this.baseHackTime * scripts.counterGrow.timeMultiplier;
  
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
  
    calculateThreads(ns, percentage) {
      let hackThreads = Math.floor(ns.hackAnalyzeThreads(this.hostname, this.moneyMax * (percentage / 100)));
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
  
        const moneyStolenPerAttack = (this.moneyMax * (percentage / 100)) * this.chanceToHack;
        const totalRamUsed = (this.hackThreads * scripts.hack.ram) + (this.counterHackThreads * scripts.counterHack.ram) + (this.growThreads * scripts.grow.ram) + (this.counterGrowThreads * scripts.counterGrow.ram);
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
  
  export async function main(ns, servers, scripts, delay) {
    let targets = [];

    for (const server of servers) {
      if (server.moneyMax === 0 || server.hasAdminRights === false) continue;
      const target = new Target(ns, server, delay, scripts);
      target.findOptimalPercentage(ns, scripts);
      targets.push(target);
    }

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

    return targets;
  }

//  if (target.hackDifficulty !== target.minDifficulty || target.moneyAvailable !== target.moneyMax) {
//  }