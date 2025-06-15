import { world, system } from "@minecraft/server";
import { ChestFormData } from "./extra/forms";
import { forceShow } from "./extra/force-show";
import QDPH from "./extra/database";
import { config } from './config';

const reportsDB = new QDPH("reports.db");

function showReportsPage(player, page = 0) {
  const entries = reportsDB.entries().map(([k, v]) => [k, JSON.parse(v)]);
  if (!entries.length) return player.sendMessage("§8>> §7No reports available.");
  player.sendMessage("§8>> §7Close chat to see reports.");

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
      reportsDB.delete(id);
      player.sendMessage(`§8>> §cDeleted report #§f${id} §con §e${r.target}`);
    }
  });
}

world.beforeEvents.chatSend.subscribe(({ sender, message, cancel }) => {
  if (!message.startsWith(config.prefix)) return;

  cancel = true;
  const [cmdRaw, target, ...reasonParts] = message.trim().split(" ");
  const cmd = cmdRaw.slice(1);
  const reason = reasonParts.join(" ");

  if (cmd === "report") {
    if (!target || !reason) return sender.sendMessage(`§8>> §8Usage:§f ${config.prefix}report §8<§7player§8> §8<§7reason§8>`);

    const matches = world.getPlayers().filter(p => p.name.toLowerCase().includes(target.toLowerCase()));
    if (!matches.length) return sender.sendMessage(`§8>> §cNo player matching §f"${target}" §cfound.`);
    if (matches.length > 1) return sender.sendMessage(`§8>> §cMultiple matches for §f"${target}". Be specific.`);

    const reportsBySender = reportsDB.entries().map(([_, v]) => JSON.parse(v)).filter(r => r.reporter === sender.name);
    if (reportsBySender.length >= config.maxReports) return sender.sendMessage(`§8>> §cYou can only submit ${config.maxReports} reports.`);

    const id = (reportsDB.size() + 1).toString();
    reportsDB.set(id, JSON.stringify({
      id,
      reporter: sender.name,
      target: matches[0].name,
      reason,
      timestamp: Date.now(),
    }));

    sender.sendMessage(`§8>> §fReport made on §e${matches[0].name}`);
  }

  if (cmd === "reports") {
    if (!sender.hasTag(config.staffTag)) return sender.sendMessage("§8>> §cIncorrect Permissions");
    showReportsPage(sender);
  }
});
