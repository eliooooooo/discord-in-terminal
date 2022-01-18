// importations ////////////////////////////
import { Client, Intents, Guild, TextChannel, Message } from "discord.js";

// Discord /////////////////////////////////
export class Discord {
  private _client: Client;

  private _guilds: Guild[];
  private _textChannels: TextChannel[];
  private _messages: Message[];

  private _selectedGuild: Guild;
  private _selectedTextChannel: TextChannel;

  constructor() {
    const token = require("../config.json").token;
    this._client = new Client({ intents: Intents.FLAGS.GUILDS });
    this._client.login(token).then(() => {
      this.updateGuilds();
    });
  }

  public ready(): Promise<void> {
    return new Promise((resolve) => {
      this._client.on("ready", () => {
        resolve();
      });
    });
  }

  private updateGuilds(): void {
    this._guilds = this._client.guilds.cache.map((guild) => guild);
  }

  private updateTextChannels(): void {
    this._textChannels = this._selectedGuild.channels.cache
      .filter((channel) => channel.type === "GUILD_TEXT")
      .map((channel) => channel as TextChannel);
  }

  private updateMessages(amount?: number): Promise<void> {
    if (amount == null) amount = 100;
    return this._selectedTextChannel.messages.fetch({ limit: amount }).then((messages) => {
      this._messages = messages.map((message) => message);
    });
  }

  public get guilds(): Guild[] {
    return this._guilds;
  }

  public get textChannels(): TextChannel[] {
    return this._textChannels;
  }

  public get messages(): Message[] {
    return this._messages;
  }

  public get selectedGuild(): Guild {
    return this._selectedGuild;
  }

  public get selectedTextChannel(): TextChannel {
    return this._selectedTextChannel;
  }

  public get client(): Client {
    return this._client;
  }

  public selectGuild(guild: Guild | number | string): void {
    if (typeof guild === "number") this._selectedGuild = this._guilds[guild];
    else if (typeof guild === "string") this._selectedGuild = this._guilds.find((g) => g.name === guild);
    else this._selectedGuild = guild;
    this.updateTextChannels();
  }

  public selectTextChannel(textChannel: TextChannel | number | string): Promise<void> {
    if (typeof textChannel === "number") this._selectedTextChannel = this._textChannels[textChannel];
    else if (typeof textChannel === "string") this._selectedTextChannel = this._textChannels.find((t) => t.name === textChannel);
    else this._selectedTextChannel = textChannel;
    return this.updateMessages();
  }
}
