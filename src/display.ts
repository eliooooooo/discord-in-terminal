import { Style } from "./style";

export type Element = {
  text: string;
  width?: number;
  align?: "left" | "right" | "center";
  margin?: number;
  marginLeft?: number;
  marginRight?: number;
  from?: "top" | "bottom" | "middle";
  line: number;
  front?: boolean;
};

export class Display {
  private _elements: Element[] = [];
  private _current: Element[] = [];

  constructor() {
    this.clear();
    this.listenResize(() => {
      this.clear();
      this.render();
    });
  }

  public add(element: Element): void {
    if (element.align == null) element.align = "left";
    if (element.margin == null) element.margin = 1;
    if (element.marginLeft == null) element.marginLeft = element.margin;
    if (element.marginRight == null) element.marginRight = element.margin;
    if (element.width == null) element.width = Style.len(element.text);
    if (element.from == null) element.from = "top";
    if (element.front == null) element.front = false;
    this._elements.push(element);
  }

  public append(elements: Element[]): void {
    for (const element of elements) this.add(element);
  }

  public print(): void {
    this._current = this._elements;
    this._elements = [];
    this.render();
  }

  public clear(): void {
    console.clear();
  }

  public static rows(): number {
    return process.stdout.rows;
  }

  public static cols(): number {
    return process.stdout.columns;
  }

  private listenResize(callback: () => void): void {
    process.stdout.on("resize", callback);
  }

  private render(): void {
    const screen: [string, string, string][] = [];
    const rows = Display.rows();
    const cols = Display.cols();

    for (let i = 0; i < rows; i++) screen.push(["", "", ""]);

    for (let i = 0; i < this._current.length; i++) {
      let text = this._current[i].text;
      const width = this._current[i].width;
      const align = this._current[i].align;
      const marginLeft = this._current[i].marginLeft;
      const marginRight = this._current[i].marginRight;
      const from = this._current[i].from;
      let row = this._current[i].line;
      const front = this._current[i].front;
      const l = Style.len(text);

      if (l > width) text = Style.substring(text, 0, width);
      else if (l < width) text += " ".repeat(width - l);
      text = " ".repeat(marginLeft) + text + " ".repeat(marginRight);

      if (from == "bottom") row = rows - row - 1;
      else if (from == "middle") row = Math.floor(rows / 2) + row;

      if (row >= 0 && row < rows) {
        if (front) screen[row] = ["", "", ""];
        if (align == "left") screen[row][0] += text;
        else if (align == "right") screen[row][2] += text;
        else screen[row][1] += text;
      }
    }

    let text = "";
    for (let i = 0; i < screen.length; i++) {
      let dLeft = (cols - Style.len(screen[i][1])) / 2;
      dLeft = Math.floor(dLeft);

      dLeft -= Style.len(screen[i][0]);
      if (dLeft < 0) {
        screen[i][1] = Style.substring(screen[i][1], -dLeft);
        dLeft = 0;
      }

      let dRight = cols - Style.len(screen[i][0] + screen[i][1] + screen[i][2]) - dLeft;
      dRight = Math.max(0, dRight);

      let line = screen[i][0] + " ".repeat(dLeft) + screen[i][1] + " ".repeat(dRight) + screen[i][2];
      if (Style.len(line) > cols) Style.substring(line, 0, cols);

      // const l = Style.len(screen[i][0] + screen[i][1] + screen[i][2]);
      // let left = (cols - l) / 2;
      // let right = Math.max(Math.ceil(left), 0);
      // left = Math.max(Math.floor(left), 0);

      // let line = screen[i][0] + " ".repeat(left) + screen[i][1] + " ".repeat(right) + screen[i][2];
      // if (l > cols) line = Style.substring(line, 0, cols);

      line += "\n";
      text += line;
    }
    text = text.substring(0, text.length - 1);

    this.clear();
    process.stdout.write(Style.stylish(text));
  }
}
