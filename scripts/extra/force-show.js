import { world, system, Player } from "@minecraft/server";
import { ModalFormData, ActionFormData, MessageFormData, FormCancelationReason  } from "@minecraft/server-ui";

export async function forceShow(player, form, timeout = Infinity) {
    const startTick = system.currentTick;
    while ((system.currentTick - startTick) < timeout) {
        const response = await form.show(player);
        if (response.cancelationReason !== FormCancelationReason.UserBusy) {
            return response;
        }
        ;
    }
    ;
    throw new Error(`Timed out after ${timeout} ticks`);
}
;