/** @param {NS} ns */

export async function main(ns) {
    const serversAndScripts = JSON.parse(ns.peek(1));
    const servers = serversAndScripts.servers;
    const scripts = serversAndScripts.scripts;
    const target = JSON.parse(ns.readPort(2));

    let playerInitialLevel = ns.getHackingLevel();

    while (playerInitialLevel === ns.getHackingLevel()) {

        let serverWithEnoughRam = findServerWithEnoughRam(ns, servers, scripts, target);

        if (serverWithEnoughRam) {
            executeScriptsOnServer(ns, serverWithEnoughRam, scripts, target);
            await ns.sleep(5 * target.delay);
        } else {
            ns.tprint("No server with enough RAM found. Retrying in 15 seconds...");
            await ns.sleep(15000);
        }
    }
}

function findServerWithEnoughRam(ns, servers, scripts, target) {
    let totalRamRequired = 0;

    // Calculate total RAM required for all operations
    for (let scriptType of ['hack', 'counterHack', 'grow', 'counterGrow']) {
        totalRamRequired += scripts[scriptType].ram * target[`${scriptType}Threads`];
    }

    // Find a server with enough available RAM
    for (let server of servers) {
        let availableRam = ns.getServerMaxRam(server.hostname) - ns.getServerUsedRam(server.hostname);
        if (availableRam >= totalRamRequired) {
            return server;
        }
    }

    return null;
}

function executeScriptsOnServer(ns, server, scripts, target) {
    const delayMapping = {
        'hack': 'hackScriptDelay',
        'grow': 'growScriptDelay',
        'counterHack': 'counterHackScriptDelay',
        'counterGrow': 'counterGrowScriptDelay'
    };

    for (let scriptType of ['hack', 'counterHack', 'grow', 'counterGrow']) {
        let threads = target[`${scriptType}Threads`];
        if (threads <= 0) {
            continue;
        }
        
        let delayArgument = target[delayMapping[scriptType]];
        ns.exec(scripts[scriptType].path, server.hostname, threads, target.hostname, delayArgument);
    }
}