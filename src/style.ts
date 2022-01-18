export namespace Style {
  // Styles //////////////////////////////////

  export enum Style {
    clear = 0,
    Bold = 1,
    Dim = 2,
    Italic = 3,
    Underline = 4,
    Blink = 5,
    Reverse = 7,
    Hidden = 8,
    Strikethrough = 9,

    BoldClear = 22,
    DimClear = 22,
    ItalicClear = 23,
    UnderlineClear = 24,
    BlinkClear = 25,
    ReverseClear = 27,
    HiddenClear = 28,
    StrikethroughClear = 29,

    FgBlack = 30,
    FgRed = 31,
    FgGreen = 32,
    FgYellow = 33,
    FgBlue = 34,
    FgMagenta = 35,
    FgCyan = 36,
    FgWhite = 37,

    BgBlack = 40,
    BgRed = 41,
    BgGreen = 42,
    BgYellow = 43,
    BgBlue = 44,
    BgMagenta = 45,
    BgCyan = 46,
    BgWhite = 47,

    BgClear = 49,

    Fg = 30,
    Bg = 40,
    BrightFg = 90,
    BrightBg = 100,

    Black = 0,
    Red = 1,
    Green = 2,
    Yellow = 3,
    Blue = 4,
    Magenta = 5,
    Cyan = 6,
    White = 7,
  }

  // char to code ////////////////////////////

  export const charToCode: { [key: string]: number } = {
    C: Style.clear,
    B: Style.Bold,
    D: Style.Dim,
    I: Style.Italic,
    U: Style.Underline,
    R: Style.Reverse,
    H: Style.Hidden,
    S: Style.Strikethrough,

    CB: Style.BoldClear,
    CD: Style.DimClear,
    CI: Style.ItalicClear,
    CU: Style.UnderlineClear,
    CR: Style.ReverseClear,
    CH: Style.HiddenClear,
    CS: Style.StrikethroughClear,

    BC: Style.BgClear,

    k: Style.FgBlack,
    r: Style.FgRed,
    g: Style.FgGreen,
    y: Style.FgYellow,
    b: Style.FgBlue,
    m: Style.FgMagenta,
    c: Style.FgCyan,
    w: Style.FgWhite,

    bk: Style.BgBlack,
    br: Style.BgRed,
    bg: Style.BgGreen,
    by: Style.BgYellow,
    bb: Style.BgBlue,
    bm: Style.BgMagenta,
    bc: Style.BgCyan,
    bw: Style.BgWhite,

    kB: Style.BrightFg + Style.FgBlack,
    rB: Style.BrightFg + Style.FgRed,
    gB: Style.BrightFg + Style.FgGreen,
    yB: Style.BrightFg + Style.FgYellow,
    bB: Style.BrightFg + Style.FgBlue,
    mB: Style.BrightFg + Style.FgMagenta,
    cB: Style.BrightFg + Style.FgCyan,
    wB: Style.BrightFg + Style.FgWhite,

    bkB: Style.BrightBg + Style.BgBlack,
    brB: Style.BrightBg + Style.BgRed,
    bgB: Style.BrightBg + Style.BgGreen,
    byB: Style.BrightBg + Style.BgYellow,
    bbB: Style.BrightBg + Style.BgBlue,
    bmB: Style.BrightBg + Style.BgMagenta,
    bcB: Style.BrightBg + Style.BgCyan,
    bwB: Style.BrightBg + Style.BgWhite,
  };

  // functions ///////////////////////////////

  export function ansi(styles: Style[]): string {
    let str = "\u001b[";
    for (const style of styles) str += `${style};`;
    return str.substring(0, str.length - 1) + "m";
  }

  export function interpret(str: string): Style[] {
    const styles: Style[] = [];
    const args = str.split("+");
    for (const arg of args) if (charToCode[arg]) styles.push(charToCode[arg]);
    return styles;
  }

  export function stylish(str: string): string {
    const t = str.split("$");
    if (t.length < 2) return "";

    for (let i = 1; i < t.length; i += 2) t[i] = t[i] == "" ? "$" : ansi(interpret(t[i]));

    return t.join("");
  }

  export function len(str: string): number {
    const t = str.split("$");
    let len = 0;

    for (let i = 0; i < t.length; i += 2) len += t[i].length;
    for (let i = 1; i < t.length; i += 2) if (t[i] == "") len += 1;

    return len;
  }

  export function index(str: string, index: number): number {
    let i = 0;
    let escaped = false;

    while (index > 0) {
      if (str[i] == "$" && !escaped) {
        escaped = true;
        if (i < str.length - 1 && str[i + 1] == "$") index -= 2;
      } else {
        if (!escaped) index--;
        if (str[i] == "$" && escaped) escaped = false;
      }
      i++;
    }

    return i;
  }

  export function removeText(str: string): string {
    const t = str.split("$");
    let out = "";

    for (let i = 1; i < t.length; i += 2) if (t[i] != "") out += t[i] + "+";
    if (out.length > 0) out = "$" + out.substring(0, out.length - 1) + "$";

    return out;
  }

  export function removeStyle(str: string): string {
    const t = str.split("$");
    let out = "";

    for (let i = 0; i < t.length; i += 2) {
      if (str[i] == "") out += "$";
      else out += t[i];
    }

    return out;
  }

  export function substring(str: string, start: number, end?: number): string {
    if (end == null) end = str.length;

    start = index(str, start);
    end = index(str, end);

    let out = removeText(str.substring(0, start));
    out += str.substring(start, end);
    out += removeText(str.substring(end));

    return out;
  }

  export function neutralize(str: string): string {
    let out = "";
    for (const char of str) {
      if (char == "$") out += "$$";
      else out += char;
    }
    return out;
  }
}
