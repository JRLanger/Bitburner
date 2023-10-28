/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    const scriptDelay = ns.args[1]
  //  ns.tprint(`Weaken called on target ${target}, scriptDelay: ${scriptDelay}`)
  
    await ns.sleep(scriptDelay)
    await ns.weaken(target);
  //  ns.tprint(`Weaken succesfull on server ${target}`)
  }