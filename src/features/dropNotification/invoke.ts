import { itemDropNotification, PcDropNotification } from "./functions";
import { InvokeProps } from "../types";

// TODO: 渡す前にキャストする
export const invoke = async ({ res, url }: InvokeProps) => {
    switch (url.pathname) {
        case "/wave_clear":
            PcDropNotification(res as any);
            itemDropNotification(res as any);
            return;
    }
};
