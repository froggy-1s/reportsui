import { world, system, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus } from "@minecraft/server";
import { ChestFormData } from "./extra/chestform/forms";
import { forceShow } from "./extra/force-show";
import QDPH from "./extra/database";
import { config } from './config';

const reportsDB = new QDPH("reports.db");

function showReportsPage(player, page = 0) {
  const entries = reportsDB.entries().map(([k, v]) => [k, JSON.parse(v)]);
  if (!entries.length) return player.sendMessage("§8>> §7No reports available.");

  const form = new ChestFormData("36").title(`Reports - Page ${page + 1}`);
  const slice = entries.slice(page * 35, page * 35 + 35);

  slice.forEach(([id, r], i) =>
    form.button(i, `§aReport #${id}`, [
      "§8Player Report",
      `\n§fReported By:§a ${r.reporter}`,
      `§fPlayer Reported:§a ${r.target}`,
      `§fReason:§a ${r.reason}`,
      `\n§8<§fClick to delete§8>`,
    ], "textures/items/book_normal.png")
  );

  if (page > 0) form.button(27, "§aBack", "textures/items/arrow.png");
  if (entries.length > (page + 1) * 35) form.button(35, "§aNext", "textures/items/arrow.png");

  system.run(async () => {
    const res = await forceShow(player, form);
    if (res.canceled) return;
    if (res.selection === 27) return showReportsPage(player, page - 1);
    if (res.selection === 35) return showReportsPage(player, page + 1);
    if (res.selection < slice.length) {
      const [id, r] = slice[res.selection];
      reportsDB.delete(id)
      player.sendMessage(`§8>> §cDeleted report #§f${id} §con §a${r.target}`);
    }
  });
}

function report(sender, target, reason) {
   if (!target || !reason)
      return sender.sendMessage(`§8>> §8Usage:§f ${config.prefix}:report §8<§7player§8> §8<§7reason§8>`);
   if (target.name === sender.name)
      return sender.sendMessage(`§8>> §cYou cannot report yourself`);
    const reportsBySender = reportsDB.entries().map(([_, v]) => JSON.parse(v)).filter(r => r.reporter === sender.name);
    if (reportsBySender.length >= config.maxReports)
      return sender.sendMessage(`§8>> §cYou can only submit ${config.maxReports} reports.`);

    const id = (reportsDB.size() + 1).toString();
    reportsDB.set(id, JSON.stringify({
      id,
      reporter: sender.name,
      target: target.name,
      reason,
      timestamp: Date.now(),
    }));

    sender.sendMessage(`§8>> §fReport made on §a${target.name}`);
};

function reports(sender) {
    if (!sender.hasTag(config.staffTag))
      return sender.sendMessage("§8>> §cIncorrect Permissions");
    showReportsPage(sender);
};

system.beforeEvents.startup.subscribe((init) => {
  const reportCmd = {
    name: `${config.prefix}:report`,
    description: "Allows you to report someone in-game",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: true,
    mandatoryParameters: [
      {
        type: CustomCommandParamType.PlayerSelector,
        name: "player"
      },
      {
        type: CustomCommandParamType.String,
        name: "reason"
      }
    ]
  };

  const reportsCmd = {
    name: `${config.prefix}:reports`,
    description: "Allows you to view all in-game reports [staff locked]",
    permissionLevel: CommandPermissionLevel.Any,
    cheatsRequired: true
  };

  init.customCommandRegistry.registerCommand(reportCmd, reportHandler);
  init.customCommandRegistry.registerCommand(reportsCmd, reportsHandler);
});

function reportHandler(origin, player, reason) {
  const sender = origin.sourceEntity
  const target = world.getEntity(player[0]?.id)
  report(sender, target, reason)
  return { status: CustomCommandStatus.Success };
}

function reportsHandler(origin) {
  const sender = origin.sourceEntity
  reports(sender)
  return { status: CustomCommandStatus.Success };
}