/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    const scriptDelay = ns.args[1]
  //  ns.tprint(`Grow called on target ${target}, scriptDelay: ${scriptDelay}`)
  
    await ns.sleep(scriptDelay)
    await ns.grow(target);
  //  ns.tprint(`Grow succesfull on server ${target}`)
  }