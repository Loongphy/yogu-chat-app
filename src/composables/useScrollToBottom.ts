import { ref, onMounted, onUnmounted, Ref } from 'vue';

export function useScrollToBottom(): [Ref<HTMLElement | null>, Ref<HTMLElement | null>, Ref<boolean>] {
  const containerRef = ref<HTMLElement | null>(null);
  const endRef = ref<HTMLElement | null>(null);
  const shouldAutoScroll = ref(true);

  let observer: MutationObserver | null = null;
  let scrollHandler: (() => void) | null = null;

  onMounted(() => {
    const container = containerRef.value;
    const end = endRef.value;

    if (container && end) {
      const isUserAtBottom = () => {
        if (!container) return true;
        const { scrollTop, scrollHeight, clientHeight } = container;
        return scrollHeight - scrollTop - clientHeight < 100;
      };

      scrollHandler = () => {
        shouldAutoScroll.value = isUserAtBottom();
      };

      container.addEventListener('scroll', scrollHandler);

      observer = new MutationObserver((mutations) => {
        const shouldScroll = shouldAutoScroll.value || isUserAtBottom();
        
        const hasContentChange = mutations.some(mutation => 
          mutation.type === 'childList' || 
          mutation.type === 'characterData'
        );
        
        if (shouldScroll && hasContentChange) {
          end.scrollIntoView({ behavior: 'instant', block: 'end' });
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
    if (containerRef.value && scrollHandler) {
      containerRef.value.removeEventListener('scroll', scrollHandler);
    }
  });

  return [containerRef, endRef, shouldAutoScroll];
}