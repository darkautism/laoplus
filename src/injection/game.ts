import { log } from "../utils/log";
declare var UnityLoader: any;

const sleep = async (ms:number) => {
    return new Promise((r) => setTimeout(r, ms));
};
export const initGamePage = () => {
    GM_addStyle(`
    html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        line-height: 0;
    }
    .webgl-content {
        position: unset;
        -webkit-transform: unset;
        transform: unset;
    }`);

    log.log("Injection", "Game Page", "Style injected.");

    if (UnityLoader) {
        // Remove annoying uinity logs
        let blob: { [index: string | symbol]: any } = {};
        var blobProxy = new Proxy(blob, {
            set: function (
                target: { [index: string | symbol]: any },
                key,
                value
            ) {
                if (value.Module) {
                    unsafeWindow.LAOPLUS.Module=value.Module;
                    value.Module.print = () => {};
                }
                target[key] = value;
                return true;
            },
        });
        console.log(UnityLoader);
        UnityLoader.Blobs = blobProxy;
    }
};
