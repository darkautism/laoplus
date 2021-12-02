import { injection } from "injection";
import { Config } from "config";
import { initUi } from "ui/index";
import { initInterceptor } from "features/interceptor";
import { initResizeObserver } from "features/resizeObserver";
import { initTacticsManual } from "tacticsManual";
import { TacticsManualUnit, ExplorationSquad } from "./types";
import { tailwindConfig } from "./ui/tailwind";

declare global {
    // 露出させるLAOPLUSオブジェクトのinterface
    interface Window {
        LAOPLUS: {
            config: Config;
            tacticsManual: {
                locale: { [key: string]: string };
                unit: TacticsManualUnit[];
            };
            exploration: ExplorationSquad[];
        };
    }
}

// 'return' outside of functionでビルドがコケるのを防ぐ即時実行関数
(function () {
    const isGameWindow = injection();
    if (!isGameWindow) return;

    const config = new Config();

    // LAOPLUSオブジェクトを露出させる
    unsafeWindow.LAOPLUS = {
        config: config,
        tacticsManual: {
            locale: {},
            unit: [],
        },
        exploration: [],
    };

    // @ts-ignore
    tailwind.config = tailwindConfig;

    dayjs.extend(dayjs_plugin_relativeTime);
    dayjs.extend(dayjs_plugin_isSameOrBefore);
    dayjs.extend(dayjs_plugin_duration);

    initUi();
    initInterceptor();
    initResizeObserver();
    initTacticsManual();
})();