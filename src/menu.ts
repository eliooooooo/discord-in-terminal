import { Display, Element } from "./display";
import { Style } from "./style";

export namespace Menu {
  export function connecting(versionName: string, version: string): Element[] {
    const elements: Element[] = [];

    elements.push({ text: "$bg$", margin: 0, line: 0, front: true });
    elements.push({ text: "$B+k$Discord-In-Terminal$CB+C$", line: 0 });
    elements.push({ text: `$D+k$(connecting to discord...)`, line: 0 });

    elements.push({ text: `${versionName} ${version}$CD+C$`, line: 0, align: "right" });
    elements.push({ text: "$BC$", line: 0, margin: 0, align: "right" });

    elements.push({ text: "$w$connecting...$C$", align: "center", line: 0, from: "middle" });

    return elements;
  }

  export function header(username: string, versionName: string, version: string): Element[] {
    const elements: Element[] = [];

    elements.push({ text: "$bg$", margin: 0, line: 0, front: true });
    elements.push({ text: "$B+k$Discord-In-Terminal$CB+C$", line: 0 });
    elements.push({ text: `$D+k$(connected as ${username})`, line: 0 });

    elements.push({ text: `${versionName} ${version}$CD+C$`, line: 0, align: "right" });
    elements.push({ text: "$BC$", line: 0, margin: 0, align: "right" });

    return elements;
  }

  export function main(selectChannel: string, exit: string): Element[] {
    const elements: Element[] = [];

    let l1 = "Welcome to Discord-In-Terminal !";
    let l2 = `- ${selectChannel} to select a text channel.`;
    let l3 = `- ${exit} to exit discord.`;

    const l = Style.len(l2);

    elements.push({ text: "$w$" + "~".repeat(l + 6), line: -2, align: "center", from: "middle" });
    elements.push({ text: "~".repeat(l + 6) + "$C$", line: 2, align: "center", from: "middle" });

    elements.push({ text: "|", line: -1, align: "center", from: "middle" });
    elements.push({ text: "|", line: 0, align: "center", from: "middle" });
    elements.push({ text: "|", line: 1, align: "center", from: "middle" });

    elements.push({ text: l1, line: -1, align: "center", width: l, from: "middle" });
    elements.push({ text: l2, line: 0, align: "center", width: l, from: "middle" });
    elements.push({ text: l3, line: 1, align: "center", width: l, from: "middle" });

    elements.push({ text: "|", line: -1, align: "center", from: "middle" });
    elements.push({ text: "|", line: 0, align: "center", from: "middle" });
    elements.push({ text: "|", line: 1, align: "center", from: "middle" });

    return elements;
  }

  export function location(server: string, channel?: string): Element[] {
    const elements: Element[] = [];

    if (channel == null) elements.push({ text: `$B+g$↪ $U$${server}$CU+CB+C$`, line: 1 });
    else elements.push({ text: `$B+g$↪ $U$${server}$CU$ ➞ $U$${channel}$CU+CB+C$`, line: 1 });

    return elements;
  }

  export function searching(input: string, results: string[], selection?: number, server?: string): Element[] {
    let elements: Element[] = [];
    let margin_left = 1;

    if (selection == null) selection = -1;
    if (server == null) elements = location(input);
    else {
      margin_left = Style.len(server) + 4;
      elements = location(server, input);
    }

    for (let i = 0; i < results.length; i++) {
      if (selection == i) elements.push({ text: `> $U$${results[i]}$CU$`, line: i + 2, margin: margin_left });
      else elements.push({ text: `| ${results[i]}`, line: i + 2, margin: margin_left });
    }

    return elements;
  }

  export function waiting(text: string): Element[] {
    const elements: Element[] = [];

    elements.push({ text: `$w$${text}$C$`, align: "center", line: 0, from: "middle" });

    return elements;
  }

  export function messages(msg: { author: string; content: string; date: Date }[], scroll: number): Element[] {
    const elements: Element[] = [];
    let l = scroll;

    for (let i = 0; i < msg.length; i++) {
      const date = msg[i].date.toLocaleString();
      const author = msg[i].author;
      const content = msg[i].content;
      const width = Display.cols() < 50 ? Display.cols() : 50;

      let head: string;
      if (author.length + 1 >= width) head = author.substring(0, width - 4) + "...-";
      else if (author.length + date.length + 2 > width) head = author + "-".repeat(width - author.length);
      else head = author + "-".repeat(width - author.length - date.length) + date;

      head = "$w+B$" + head + "$C+CB$";
      const lines = wrapText(content, width - 3).map((line) => "$C+D+w$" + line + "$C+CD$");

      elements.push({ text: "", line: l++, from: "bottom", align: "center", width: width });
      for (let j = lines.length - 1; j >= 0; j--) {
        elements.push({ text: "$B+w$|$C+CB$", line: l, from: "bottom", align: "center" });
        elements.push({ text: lines[j], line: l++, from: "bottom", align: "center", width: width - 3 });
      }
      elements.push({ text: "$B+w$|$C+CB$", line: l++, from: "bottom", align: "center", width: width });
      elements.push({ text: head, line: l++, from: "bottom", align: "center", width: width });
    }

    return elements;
  }

  export function wrapText(text: string, width: number): string[] {
    const lines = text.split("\n");
    const result: string[] = [];

    for (const line of lines) {
      let r = wrapLine(line, width);
      for (const l of r) result.push(l);
    }

    return result;
  }

  export function wrapLine(text: string, width: number): string[] {
    const words: string[] = text.split(" ");
    const lines: string[] = [];
    let line = "";

    for (let i = 0; i < words.length; i++) {
      if (line.length + words[i].length > width) {
        lines.push(line);
        line = "";
      }
      if (words[i].length > width) {
        line += words[i].substring(0, width);
        words[i] = words[i].substring(width);
        i--;
      } else line += words[i] + " ";
    }
    lines.push(line);

    return lines;
  }
}
