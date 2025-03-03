const THINK_TAG_OPEN = '<think>';
const THINK_TAG_CLOSE = '</think>';

export interface ThinkCallbackData {
  messageId: string;
  content: string;
}

export type ThinkCallback = (data: ThinkCallbackData) => void;

export interface ParserCallbacks {
  onThinkOpen?: ThinkCallback;
  onThinkClose?: ThinkCallback;
}

interface ElementFactoryProps {
  messageId: string;
}

type ElementFactory = (props: ElementFactoryProps) => string;

export interface StreamingMessageParserOptions {
  callbacks?: ParserCallbacks;
  thinkElement?: ElementFactory;
}

interface MessageState {
  position: number;
  insideThink: boolean;
  currentThinkContent: string;
}

export class StreamingMessageParser {
  #messages = new Map<string, MessageState>();

  constructor(private _options: StreamingMessageParserOptions = {}) {}

  parse(messageId: string, input: string) {
    let state = this.#messages.get(messageId);

    if (!state) {
      state = {
        position: 0,
        insideThink: false,
        currentThinkContent: '',
      };

      this.#messages.set(messageId, state);
    }

    let output = '';
    let i = state.position;

    while (i < input.length) {
      if (state.insideThink) {
        const closeIndex = input.indexOf(THINK_TAG_CLOSE, i);

        if (closeIndex !== -1) {
          // 添加思考内容
          state.currentThinkContent += input.slice(i, closeIndex);

          this._options.callbacks?.onThinkClose?.({
            messageId,
            content: state.currentThinkContent.trim()
          });

          state.insideThink = false;
          state.currentThinkContent = '';
          
          // 思考内容不输出到结果中
          i = closeIndex + THINK_TAG_CLOSE.length;
        } else {
          // todo 更好的处理半闭合标签 `<` `</` `</t` `</th` `</thi` `</thin` `</think`
          break;
        }
      } else {
        const thinkOpenIndex = input.indexOf(THINK_TAG_OPEN, i);

        if (thinkOpenIndex !== -1) {
          // 添加思考标签前的内容到输出
          output += input.slice(i, thinkOpenIndex);

          state.insideThink = true;

          this._options.callbacks?.onThinkOpen?.({
            messageId,
            content: ''
          });
          
          // 使用 thinkElement 创建显示元素
          const thinkFactory = this._options.thinkElement ?? createThinkElement;
          output += thinkFactory({ messageId });
          
          // 移动到思考标签后
          i = thinkOpenIndex + THINK_TAG_OPEN.length;
        } else {
          // 没有思考标签，直接添加剩余内容到输出
          output += input.slice(i);
          i = input.length;
        }
      }
    }

    state.position = i;
    return output;
  }

  reset() {
    this.#messages.clear();
  }
}

const createThinkElement: ElementFactory = (props) => {
  const elementProps = [
    'class="__think__"',
    ...Object.entries(props).map(([key, value]) => {
      return `data-${camelToDashCase(key)}=${JSON.stringify(value)}`;
    }),
  ];

  return `<div ${elementProps.join(' ')}></div>`;
};

function camelToDashCase(input: string) {
  return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
