import { Nodes, Text, Link, PhrasingContent } from 'mdast';
import { visit } from 'unist-util-visit';

/**
 * remark 插件，用于解析 [citation:1] 格式的引用标记，返回 {'type': 'link', ...} 节点
 */
export default function remarkCitation() {
  return function (tree: Nodes) {
    // 正则表达式匹配 [citation:数字] 格式
    const citationRegex = /\[citation:(\d+)\]/g;
    
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === null || index === undefined) return;
      
      const value = node.value;
      const children: PhrasingContent[] = [];
      
      let lastIndex = 0;
      let match;
      
      // 重置正则表达式的 lastIndex
      citationRegex.lastIndex = 0;
      
      while ((match = citationRegex.exec(value)) !== null) {
        // 添加匹配前的文本
        if (match.index > lastIndex) {
          const textBefore = value.slice(lastIndex, match.index);
          children.push({ type: "text", value: textBefore } as Text);
        }

        // 提取引用编号
        const citationNumber = match[1];
        
        // 创建链接节点
        children.push({
          type: "link",
          url: `#citation_${citationNumber}`,
          data: {
            hProperties: {
              "class": "citation",
              "data-id": citationNumber,
            },
          },
          children: [{ type: "text", value: `[${citationNumber}]` } as Text],
        } as Link);
        
        lastIndex = match.index + match[0].length;
      }

      // 添加最后一段文本
      if (lastIndex < value.length) {
        children.push({ type: "text", value: value.slice(lastIndex) } as Text);
      }
      
      // 只有在找到匹配时才替换节点
      if (children.length > 0) {
        parent.children.splice(index, 1, ...children);
      }
    });
  };
}
