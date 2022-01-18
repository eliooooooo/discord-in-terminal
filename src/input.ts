const shortcuts: { [key: string]: string } = require("../config.json").shortcuts;
const shortcuts_codes: { [key: number]: string } = {};

for (const key in shortcuts) {
  shortcuts_codes[key.charCodeAt(0) - 96] = shortcuts[key];
}

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding("utf8");

export class Input {
  private _text: string = "";
  private _handler: (event: string) => void = (event: string) => {};
  private _textHandler: (text: string) => void = (text: string) => {};
  public writeTab: boolean = false;

  constructor() {
    process.stdin.on("data", (key) => {
      const keyString = key.toString();
      const keyCode = keyString.charCodeAt(0);
      const action = shortcuts_codes[keyCode];

      if (action != null) this._handler(action);
      else {
        if (keyCode == 13) {
          this._handler("enter");
          this._text += "\n";
        } else if (keyCode == 127) {
          if (this._text.length > 0) this._text = this._text.slice(0, -1);
          else this._handler("backspace");
        } else if (keyCode == 27) this._handler("escape");
        else if (keyCode == 9) {
          this._handler("autocomplete");
          if (this.writeTab) this._text += "    ";
        } else this._text += keyString;
        this._textHandler(this._text);
      }
    });
  }

  public get text(): string {
    return this._text;
  }

  public clearText(): void {
    this._text = "";
  }

  public on(handler: (event: string) => void): void {
    this._handler = handler;
  }

  public textInput(handler: (text: string) => void): void {
    this._textHandler = handler;
  }

  public setText(text: string): void {
    this._text = text;
  }

  public emitTextEvent(): void {
    this._textHandler(this._text);
  }
}
