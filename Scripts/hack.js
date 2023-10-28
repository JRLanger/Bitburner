/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    const scriptDelay = ns.args[1]
  //  ns.tprint(`Hack called on target ${target}, scriptDelay: ${scriptDelay}`)
  
    await ns.sleep(scriptDelay)
    await ns.hack(target);
  //  ns.tprint(`Hack succesfull on server ${target}`)
  }