import { disassemblingTable, rankColor } from "~/constants";
import { BattleStats as TBattleStats } from "~/features/types";
import { defaultStatus } from "~/Status";
import { log } from "~/utils";
import { calcResourcesFromDrops } from "./calc";
import { Icon } from "./Icon";
import { MemorizedTimeStat } from "./TimeStat";
const cn = classNames;

function jsonEqual(a: unknown, b: unknown) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function resetRecoder() {
    const d = defaultStatus.battleStats;
    log.log("resetRecoder", "default", d);
    unsafeWindow.LAOPLUS.status.set({
        battleStats: { ...d },
    });
}

const ResourceCounter: React.VFC<{
    type: React.ComponentProps<typeof Icon>["type"] | "B" | "A" | "S" | "SS";
    amount: number;
}> = ({ type, amount }) => {
    return (
        <div className="flex gap-2 items-center">
            {type === "B" || type === "A" || type === "S" || type === "SS" ? (
                <div
                    className={cn(
                        "flex-shrink-0 px-2 rounded-md font-bold ring-1 ring-gray-900/5",
                        `bg-[${rankColor[type].hex()}]`,
                        type === "SS" ? "text-black" : "text-white"
                    )}
                >
                    {type}
                </div>
            ) : (
                <div className="flex-shrink-0 w-6 h-6">
                    <Icon type={type} />
                </div>
            )}

            <hr className="h-[2px] w-full bg-gray-200 border-0 rounded-full" />
            <span className="text-gray-900 font-bold">
                {amount.toLocaleString()}
            </span>
        </div>
    );
};

export const BattleStats: React.VFC = () => {
    const status = unsafeWindow.LAOPLUS.status;
    const [stats, setStats] = React.useState<TBattleStats>({
        ...status.status.battleStats,
    });
    status.events.on("changed", (e) => {
        setStats((old) => {
            if (!jsonEqual(old, e.battleStats)) return { ...e.battleStats };
            return old;
        });
    });

    const [showPanel, setShowPanel] = React.useState(false);
    const handleButtonClick = () => {
        setShowPanel((v) => !v);
    };

    const [displayType, setDisplayType] = React.useState<"perHour" | "sum">(
        "sum"
    );
    const toggleCheckState = () => {
        setDisplayType((v) => (v === "sum" ? "perHour" : "sum"));
    };

    const disassembledResource = (() => {
        const unitResorces = calcResourcesFromDrops({
            drops: stats.drops.units,
            table: disassemblingTable.units,
            type: "units",
        });
        log.log(
            "BattleStats",
            "disassembledResource",
            "unitResorces",
            unitResorces
        );

        const equipmentResources = calcResourcesFromDrops({
            drops: stats.drops.equipments,
            table: disassemblingTable.equipments,
            type: "equipments",
        });
        log.log(
            "BattleStats",
            "disassembledResource",
            "equipmentResources",
            equipmentResources
        );

        const total = [unitResorces, equipmentResources].reduce(
            (sum, resources) => {
                (Object.keys(resources) as (keyof typeof resources)[]).forEach(
                    (key) => {
                        sum[key] = sum[key] + resources[key];
                    }
                );
                return sum;
            },
            {
                parts: 0,
                nutrients: 0,
                power: 0,
                basic_module: 0,
                advanced_module: 0,
                special_module: 0,
            }
        );
        log.log("BattleStats", "disassembledResource", "total", total);

        return total;
    })();

    return (
        <div className="relative">
            <button
                onClick={handleButtonClick}
                title="周回情報パネルを表示する"
                className="h-6 text-white drop-shadow-featureIcon"
            >
                <i className="bi bi-recycle"></i>
            </button>
            {showPanel && (
                <div className="w-[420px] ring-gray-900/5 absolute bottom-6 left-0 mb-1 rounded-lg shadow-xl overflow-hidden ring-1">
                    <header className="from-slate-800 to-slate-700 flex items-center p-2 pl-3 text-white font-bold bg-gradient-to-r">
                        <h1 className="flex gap-2 items-center mr-auto">
                            <i className="bi bi-info-circle text-lg"></i>
                            周回情報
                        </h1>
                        <div className="flex gap-2 items-center">
                            <button
                                className="bg-amber-300 flex gap-1 items-center px-2 py-1 text-gray-900 font-bold rounded shadow"
                                onClick={resetRecoder}
                            >
                                <i className="bi bi-stopwatch-fill inline w-4"></i>
                                リセット
                            </button>
                        </div>
                    </header>

                    <main className="flex flex-col gap-4 px-4 py-5 bg-white">
                        <div className="grid gap-4 grid-cols-2">
                            <MemorizedTimeStat {...stats} />
                            <dl className="flex">
                                <dt className="mr-auto">完了した周回数</dt>
                                <dd>
                                    <p className="text-gray-900 font-bold">
                                        {stats.lapCount.toLocaleString()}
                                    </p>
                                </dd>
                            </dl>
                        </div>

                        <hr />

                        <div className="flex gap-3">
                            <h2 className="font-bold">取得資源</h2>
                            <div className="flex gap-1 items-center ml-auto cursor-pointer select-none">
                                <span
                                    onClick={() => {
                                        setDisplayType("perHour");
                                    }}
                                >
                                    時給
                                </span>
                                <div
                                    className="flex items-center px-1 w-10 h-5 bg-gray-300 rounded-full"
                                    onClick={toggleCheckState}
                                >
                                    <div
                                        className={cn(
                                            "w-4 h-4 bg-white rounded-full shadow-md transform transition-transform",
                                            displayType === "sum" &&
                                                "translate-x-4"
                                        )}
                                    ></div>
                                </div>
                                <span
                                    onClick={() => {
                                        setDisplayType("sum");
                                    }}
                                >
                                    合計
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-3 grid-cols-3">
                            <ResourceCounter
                                type="parts"
                                amount={disassembledResource.parts}
                            />
                            <ResourceCounter
                                type="nutrient"
                                amount={disassembledResource.nutrients}
                            />
                            <ResourceCounter
                                type="power"
                                amount={disassembledResource.power}
                            />
                        </div>
                        <div className="grid gap-3 grid-cols-3">
                            <ResourceCounter
                                type="basic_module"
                                amount={disassembledResource.basic_module}
                            />
                            <ResourceCounter
                                type="advanced_module"
                                amount={disassembledResource.advanced_module}
                            />
                            <ResourceCounter
                                type="special_module"
                                amount={disassembledResource.special_module}
                            />
                        </div>

                        <div className="flex gap-3">
                            <h2 className="font-bold">ドロップ詳細</h2>
                        </div>

                        <div className="flex gap-2">
                            <i
                                className="bi bi-person-fill text-xl"
                                title="戦闘員"
                            ></i>
                            <div className="grid flex-1 gap-3 grid-cols-4">
                                <ResourceCounter
                                    type="B"
                                    amount={stats.drops.units.B}
                                />
                                <ResourceCounter
                                    type="A"
                                    amount={stats.drops.units.A}
                                />
                                <ResourceCounter
                                    type="S"
                                    amount={stats.drops.units.S}
                                />
                                <ResourceCounter
                                    type="SS"
                                    amount={stats.drops.units.SS}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <i className="bi bi-cpu text-xl" title="装備"></i>
                            <div className="grid flex-1 gap-3 grid-cols-4">
                                <ResourceCounter
                                    type="B"
                                    amount={stats.drops.equipments.B}
                                />
                                <ResourceCounter
                                    type="A"
                                    amount={stats.drops.equipments.A}
                                />
                                <ResourceCounter
                                    type="S"
                                    amount={stats.drops.equipments.S}
                                />
                                <ResourceCounter
                                    type="SS"
                                    amount={stats.drops.equipments.SS}
                                />
                            </div>
                        </div>
                    </main>
                </div>
            )}
        </div>
    );
};