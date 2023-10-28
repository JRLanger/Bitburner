// Server purchase
export async function main(ns) {
    const ramFactor = ns.args[0]
  
    ns.getPurchasedServerCost
    const ram = 2 ** ramFactor;
    const cost = ns.getPurchasedServerCost(ram);
  
    const query = `Purchase server with ${ns.formatRam(ram)} costs ${ns.formatNumber(cost)}?`;
    if (await ns.prompt(query)) {
      const serverName = await ns.prompt("Please enter new server name.", { type: "text" });
      ns.purchaseServer(serverName, ram)
    }
  }