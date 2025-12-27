// maneki fetch

import { skip } from "node:test";

// cmd mfetch
type UserAtHostname = {
    name: string;
    hostname: string;
};

let showErrs = false;

const parseArgs = () => {
    const args = Deno.args;

    if (args.includes("-e")) {
        console.log("showing errors");
        showErrs = true;
    }
};

const getUserAtHostname = async (): Promise<UserAtHostname> => {
    let cmd = new Deno.Command("id", { args: ["-un"] });

    let { code, stdout } = await cmd.output();

    if (code !== 0 && showErrs) {
        throw new Error("an error occured while retrieving username");
    }

    const name = new TextDecoder().decode(stdout);

    cmd = new Deno.Command("hostname");
    ({ code, stdout } = await cmd.output());
    if (code !== 0 && showErrs) {
        throw new Error("an error occured while retrieving hostname");
    }
    const hostname = new TextDecoder().decode(stdout);
    return {
        name: name.trim() || "unknown",
        hostname: hostname.trim() || "unknown",
    };
};

const getKernel = async (): Promise<string> => {
    let cmd = new Deno.Command("uname", { args: ["-r"] });

    let { code, stdout } = await cmd.output();

    if (code !== 0 && showErrs) {
        throw new Error("an error occured while retrieving kernel version");
    }
    const kernel = new TextDecoder().decode(stdout);

    return kernel.trim() || "unknown";
};

const getOs = async (): Promise<string> => {
    let cmd = new Deno.Command("cat", { "args": ["/etc/os-release"] });
    let { code, stdout } = await cmd.output();

    if (code !== 0 && showErrs) {
        throw new Error("an error occured while retrieving os type");
    }
    const raw_out = new TextDecoder().decode(stdout);

    const lines = raw_out.split("\n");
    let os = lines.filter((l) => l.startsWith("PRETTY"))[0]?.split("=")[1].replaceAll('"', '');

    return os.trim() || "unknown";
};

const getUptime = async (): Promise<string> => {
    let cmd = new Deno.Command("uptime", { "args": ["-p"] });

    let { code, stdout } = await cmd.output();

    // TODO add /proc/uptime read as a fallback
    if (code !== 0 && showErrs) {
        throw new Error("an error occured while retrieving uptime");
    }
    const time = new TextDecoder().decode(stdout);

    return time.split("up")[1].trim() || "unknown";
};

const getShell = (): string => {
    return Deno.env.get("SHELL") || "unknown";
};

parseArgs();
const fetch = async () => {
    const [user, kernel, os, uptime] = await Promise.all([
        getUserAtHostname(),
        getKernel(),
        getOs(),
        getUptime(),
    ]);

    const shell = getShell();

    const infoByLine: Record<number, string> = {
        0: `${user.name}@${user.hostname}`,
        2: `on: ${os}`, // 1 idx will be skipped
        3: `kl: ${kernel}`,
        4: `sh: ${shell}`,
        5: `up: ${uptime}`,
    };

    // at least 6 lines tall 
    const kit = String.raw`     ^___^
    /^   ^\  ~
    \__l__/ /
    /  O  \J
    |\    |
    m (  )m
    `;

    kit.split("\n").forEach((l, idx) => {
        const text = infoByLine[idx] ?? "";
        console.log(`${l.padEnd(20)} ${text}`);

    });
    
    // console.log(kit);
};

await fetch();
// let primary = 'red';
// console.log("%cdiego", "color: "+ primary)
