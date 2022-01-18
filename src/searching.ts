import { Guild, TextChannel } from "discord.js";

type GuildOrTextChannel = Guild | TextChannel;

export function research(str: string, guildOrTextChannel: GuildOrTextChannel[]): GuildOrTextChannel[] {
  str = str.toLowerCase();

  let names = guildOrTextChannel.map((e) => {
    return {
      name: e.name.toLowerCase(),
      id: 0,
    };
  });
  for (let i = 0; i < names.length; i++) names[i].id = i;

  names = names.filter((e) => e.name.includes(str));

  const ordered: { name: string; id: number }[][] = [];
  for (const name of names) {
    const i = name.name.indexOf(str);
    if (ordered[i] == null) ordered[i] = [];
    ordered[i].push(name);
  }

  const flat: { name: string; id: number }[] = [];
  for (const arr of ordered) {
    if (arr == null) continue;
    for (const name of arr) flat.push(name);
  }

  const result: GuildOrTextChannel[] = [];

  for (const name of flat) result.push(guildOrTextChannel[name.id]);

  return result;
}

export function get(str: string, guildOrTextChannel: GuildOrTextChannel[]): GuildOrTextChannel | null {
  str = str.toLowerCase();
  for (const e of guildOrTextChannel) if (e.name.toLowerCase() === str) return e;
  return null;
}
