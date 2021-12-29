import { log } from "~/utils";
import { invoke as invokeExplorationTimer } from "../explorationTimer/invoke";
import { invoke as invokeDropNotification } from "../dropNotification/invoke";
import { invoke as invokeAutorunDetection } from "../autorunDetection/invoke";
import { invoke as invokeResourceFarmRecoder } from "../resourceFarmRecoder/invoke";
import { fakeEnemy, speedHack } from "../hacks/function";

const interceptor = (xhr: XMLHttpRequest): void => {
    if (!xhr.responseURL) return;

    const url = new URL(xhr.responseURL);
    if (url.host !== "gate.last-origin.com") {
        return;
    }
    // @ts-ignore
    const realresp = (xhr.response)?xhr._realresponse:xhr._realresponse;
    const responseText = new TextDecoder("utf-8").decode(realresp);
    // JSONが不正なことがあるのでtry-catch
    try {
        const res = JSON.parse(responseText);
        log.debug("Interceptor", url.pathname, res);

        const invokeProps = { xhr, res, url };

        // TODO: このような処理をここに書くのではなく、各種機能がここを購読しに来るように分離したい
        invokeExplorationTimer(invokeProps);
        invokeDropNotification(invokeProps);
        invokeAutorunDetection(invokeProps);
        invokeResourceFarmRecoder(invokeProps);
    } catch (error) {
        log.error("Interceptor", "Error", error);
    }
};

export const initInterceptor = () => {
    (function (open) {
        XMLHttpRequest.prototype.open = function () {
            this.addEventListener(
                "readystatechange",
                () => {
                    // 完了した通信のみ
                    if (this.readyState === 4) {
                        interceptor(this);
                    }
                },
                false
            );
            // @ts-ignore
            // eslint-disable-next-line prefer-rest-params
            open.apply(this, arguments);
        };
    })(XMLHttpRequest.prototype.open);
    const accessor = Object.getOwnPropertyDescriptor(
        XMLHttpRequest.prototype,
        "response"
    );
    if (accessor) {
        Object.defineProperty(XMLHttpRequest.prototype, "response", {
            get: function () {
                let response = accessor.get?.call(this);
                this._realresponse = response;
                try {
                    const url = new URL(this.responseURL);
                    if (url.host === "gate.last-origin.com") {                         
                        const responseText = new TextDecoder("utf-8").decode(response);
                        const res = JSON.parse(responseText);                       
                        switch (url.pathname) {
                            case "/wave_clear":
                                response = new TextEncoder().encode( JSON.stringify(speedHack(res)) );
                                break;
                            case "/battleserver_enter":
                                response = new TextEncoder().encode( JSON.stringify(fakeEnemy(res)) );
                                break;
                        }
                    }
                } catch (error) {
                    log.error("Interceptor", "Error", error);
                }
                return response;
            },
            set: function (str) {
                return accessor.set?.call(this, str);
            },
            configurable: true,
        });
    }
};
