import { Discord } from "./discord";
import { Display } from "./display";
import { Menu } from "./menu";
import { Input } from "./input";
import { research } from "./searching";
import { Style } from "./style";

export namespace Interface {
  export const status: { [key: string]: any } = {};
  export const display = new Display();
  export const input = new Input();
  export const discord = new Discord();

  export function connecting(): void {
    display.append(Menu.connecting(status.version_name, status.version));
    display.print();

    input.on((event) => {
      if (event == "exit") exit();
    });

    discord.ready().then(() => {
      status.username = discord.client.user.username;
      main();
    });
  }

  export function main(): void {
    input.textInput((_) => {});

    display.append(Menu.main("ctrl+p", "ctrl+c"));
    display.append(Menu.header(status.username, status.version_name, status.version));
    display.print();

    input.on((event) => {
      if (event == "exit") exit();
      else if (event == "selectChannel") selectServer();
    });
  }

  export function selectServer(): void {
    input.clearText();
    if (status.savedServer != null) {
      input.setText(status.savedServer);
      status.savedServer = null;
    }
    const guilds = research(input.text, discord.guilds).map((guild) => guild.name);

    display.append(Menu.searching(input.text, guilds));
    display.append(Menu.header(status.username, status.version_name, status.version));
    display.print();

    status.selection = -1;

    input.on((event) => {
      if (event == "exit") exit();
      else if (event == "escape") {
        if (status.channel == null) main();
      } else if (event == "autocomplete") {
        const guilds = research(input.text, discord.guilds).map((guild) => guild.name);
        if (guilds.length > 0) {
          status.server = guilds[0];
          discord.selectGuild(status.server);
          selectChannel();
        }
      } else if (event == "enter") {
        if (status.selection >= 0) {
          const guilds = research(input.text, discord.guilds);
          status.server = guilds[status.selection].name;
          discord.selectGuild(status.server);
          selectChannel();
        } else {
          const guild = research(input.text, discord.guilds)[0];
          if (guild != null) {
            status.server = guild.name;
            discord.selectGuild(status.server);
            selectChannel();
          }
        }
      } else if (event == "up") {
        if (status.selection >= 0) status.selection--;
        const guilds = research(input.text, discord.guilds).map((guild) => guild.name);
        display.append(Menu.searching(input.text, guilds, status.selection));
        display.append(Menu.header(status.username, status.version_name, status.version));
        display.print();
      } else if (event == "down") {
        const guilds = research(input.text, discord.guilds).map((guild) => guild.name);
        if (status.selection < guilds.length - 1) status.selection++;
        display.append(Menu.searching(input.text, guilds, status.selection));
        display.append(Menu.header(status.username, status.version_name, status.version));
        display.print();
      }
    });

    input.textInput((text) => {
      status.selection = -1;
      const guilds = research(text, discord.guilds).map((guild) => guild.name);

      display.append(Menu.searching(text, guilds));
      display.append(Menu.header(status.username, status.version_name, status.version));
      display.print();
    });
  }

  export function selectChannel(): void {
    input.clearText();
    const channels = research("", discord.textChannels).map((channel) => channel.name);

    display.append(Menu.searching("", channels, -1, status.server));
    display.append(Menu.header(status.username, status.version_name, status.version));
    display.print();

    status.selection = -1;

    input.on((event) => {
      if (event == "exit") exit();
      else if (event == "escape") {
        if (status.channel == null) main();
      } else if (event == "autocomplete") {
        const channels = research(input.text, discord.textChannels).map((channel) => channel.name);
        if (channels.length > 0) {
          status.channel = channels[0];
          status.waitForMessage = discord.selectTextChannel(status.channel);
          waitMessages();
        }
      } else if (event == "enter") {
        if (status.selection >= 0) {
          const channels = research(input.text, discord.textChannels);
          status.channel = channels[status.selection].name;
          discord.selectTextChannel(status.channel);
          status.waitForMessage = discord.selectTextChannel(status.channel);
          waitMessages();
        } else {
          const channel = research(input.text, discord.textChannels)[0];
          if (channel != null) {
            status.channel = channel.name;
            discord.selectTextChannel(status.channel);
            status.waitForMessage = discord.selectTextChannel(status.channel);
            waitMessages();
          }
        }
      } else if (event == "backspace") {
        status.savedServer = status.server;
        selectServer();
      } else if (event == "up") {
        if (status.selection >= 0) status.selection--;
        const channels = research(input.text, discord.textChannels).map((channel) => channel.name);
        display.append(Menu.searching(input.text, channels, status.selection, status.server));
        display.append(Menu.header(status.username, status.version_name, status.version));
        display.print();
      } else if (event == "down") {
        const channels = research(input.text, discord.textChannels).map((channel) => channel.name);
        if (status.selection < channels.length - 1) status.selection++;
        display.append(Menu.searching(input.text, channels, status.selection, status.server));
        display.append(Menu.header(status.username, status.version_name, status.version));
        display.print();
      }
    });

    input.textInput((text) => {
      status.selection = -1;
      const channels = research(text, discord.textChannels).map((channel) => channel.name);

      display.append(Menu.searching(text, channels, -1, status.server));
      display.append(Menu.header(status.username, status.version_name, status.version));
      display.print();
    });
  }

  export function waitMessages(): void {
    input.textInput((_) => {});

    display.append(Menu.waiting("Loading messages..."));
    display.append(Menu.location(status.server, status.channel));
    display.append(Menu.header(status.username, status.version_name, status.version));
    display.print();

    input.on((event) => {
      if (event == "exit") exit();
      else if (event == "escape") main();
    });

    status.waitForMessage.then(() => {
      channel();
    });
  }

  export function channel(): void {
    input.textInput((_) => {});
    let scroll = 0;

    let messages = discord.messages.map((message) => {
      return {
        author: message.author.username,
        content: Style.neutralize(message.content),
        date: message.createdAt,
      };
    });

    display.append(Menu.messages(messages, scroll));
    display.append(Menu.location(status.server, status.channel));
    display.append(Menu.header(status.username, status.version_name, status.version));
    display.print();

    input.on((event) => {
      if (event == "exit") exit();
      else if (event == "escape") main();
      else if (event == "selectChannel") selectServer();
      else if (event == "up" || event == "down") {
        let d = event == "up" ? -1 : 1;
        scroll += d;
        if (scroll > 0) scroll = 0;
        display.append(Menu.messages(messages, scroll));
        display.append(Menu.location(status.server, status.channel));
        display.append(Menu.header(status.username, status.version_name, status.version));
        display.print();
      }
    });
  }

  function exit(): void {
    display.clear();
    process.exit(0);
  }
}
